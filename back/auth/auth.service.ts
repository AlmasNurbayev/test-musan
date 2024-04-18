import { MailerService } from '../notifications/mailer.service';
import { SmscService } from '../notifications/sms.service';
import { Request, Response } from 'express';
import { config } from '../config';
import { ParsedQs } from 'qs';
import { LoginType } from './schemas/request_confirm.schema';
import {
  confirmNotFound,
  emailOrPhoneNotConfirmed,
  emailOrPhoneNotFound,
  existUser,
  loginOrPasswordNotCorrect,
  noRefreshToken,
  unauthorized,
} from '../middlewares/exceptions/auth.exceptions';
import { error500, tooManyRequest } from '../middlewares/exceptions/common.exceptions';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { generateAccessToken, generateRefreshToken, verifyToken } from './jwt_helpers';
import { Logger } from '../shared/logger';
import { AuthRegisterType } from './schemas/register.schema';
import { AuthLoginType } from './schemas/login.schema';
import { ParamsDictionary } from 'express-serve-static-core';

export class AuthService {
  constructor(
    private mailerService = new MailerService(),
    private smscService = new SmscService(),
    private redisConfirms = config.redisConfirms.client,
    private prisma = new PrismaClient(),
  ) {}

  public async register(body: AuthRegisterType) {
    const { email, phone, password } = body;

    const exUser = await this.prisma.users.findFirst({
      where: {
        OR: [{ email }, { phone }, { email, phone }],
      },
    });
    if (exUser) {
      return existUser;
    }

    const confirmEmail = await this.redisConfirms.get(String(email));
    const confirmPhone = await this.redisConfirms.get(String(phone));

    if (!confirmEmail && !confirmPhone) {
      return emailOrPhoneNotConfirmed;
    }
    if (confirmEmail && JSON.parse(String(confirmEmail)).confirmed_at === 0) {
      return emailOrPhoneNotConfirmed;
    }

    if (confirmPhone && JSON.parse(String(confirmPhone)).confirmed_at === 0) {
      return emailOrPhoneNotConfirmed;
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await this.prisma.users.create({
      data: { ...body, password: hash },
    });

    const { password: _, ...userWithoutPassword } = user; // eslint-disable-line
    return {
      error: false,
      statusCode: 200,
      message: 'user created',
      data: userWithoutPassword,
    };
  }

  async requestConfirm(query: ParsedQs) {
    const { login, type } = query;

    const existConfirm = await this.redisConfirms.get(String(login));
    if (existConfirm) {
      const existConfirmObject = JSON.parse(existConfirm);
      if (
        existConfirmObject.created_at &&
        Date.now() < existConfirmObject.created_at + config.auth.confirmDelayMS
      ) {
        return tooManyRequest; // в течение заданного времени нельзя генерировать новый код
      }
    }

    const confirm_code = Math.floor(Math.random() * 89999 + 10000);
    this.redisConfirms.set(
      String(login),
      JSON.stringify({
        type,
        code: confirm_code,
        created_at: Date.now(),
        confirmed_at: 0,
      }),
      'EX',
      60 * 60, // 1h
    );

    if (type === LoginType.email) {
      try {
        this.mailerService.sendMail({
          from: 'info@cipo.kz',
          to: String(login),
          subject: 'Код подтверждения email',
          text: `Код для подтверждения почты: ${confirm_code}`,
          html: `Код для подтверждения почты: <b>${confirm_code}</b>`,
        });
      } catch (error) {
        return error500(error, null);
      }
    }
    if (type === LoginType.phone) {
      this.smscService.sendSms(String(login), `Код подтверждения: ${confirm_code}`);
    }
    return {
      statusCode: 200,
      message: 'code sended',
      error: false,
      data: null,
    };
  }

  async submitConfirm(query: ParsedQs) {
    const { code, login, type } = query;
    const confirmObject = await this.redisConfirms.get(String(login));
    if (!confirmObject) {
      return confirmNotFound;
    }
    const parsedConfirm = JSON.parse(confirmObject ? confirmObject : '');

    if (parsedConfirm.type !== type) {
      return confirmNotFound;
    }
    if (parsedConfirm.code !== parseInt(String(code))) {
      return confirmNotFound;
    }

    await this.redisConfirms.set(
      String(login),
      JSON.stringify({
        ...parsedConfirm,
        confirmed_at: Date.now(),
      }),
      'EX',
      60 * 60, // 1h
    );
    return {
      statusCode: 200,
      message: 'success confirmed',
      error: false,
      data: null,
    };
  }

  async login(body: AuthLoginType) {
    const { login, type, password } = body;
    let user;
    if (type === LoginType.email) {
      user = await this.prisma.users.findFirst({ where: { email: login } });
    } else if (type === LoginType.phone) {
      user = await this.prisma.users.findFirst({ where: { phone: login } });
    }
    if (!user) {
      return loginOrPasswordNotCorrect;
    }
    const isValidPassword = await bcrypt.compare(password, String(user?.password));
    if (!isValidPassword) {
      return loginOrPasswordNotCorrect;
    }

    const accessToken = generateAccessToken({
      id: Number(user?.id),
      type,
      login,
    });
    const refreshToken = generateRefreshToken({
      id: Number(user?.id),
      type,
      login,
    });
    const { password: _, ...userWithoutPassword } = user; // eslint-disable-line
    return {
      error: false,
      statusCode: 200,
      message: 'login success',
      data: { user: userWithoutPassword, accessToken, refreshToken },
    };
  }

  async refresh(cookies: ParamsDictionary) {
    const { token } = cookies;
    if (!token) {
      return noRefreshToken;
    }
    try {
      const payload = await verifyToken(token);
      let user;
      if (payload.type === LoginType.email) {
        user = await this.prisma.users.findFirst({ where: { email: payload.login } });
      } else if (payload.type === LoginType.phone) {
        user = await this.prisma.users.findFirst({ where: { phone: payload.login } });
      }
      if (!user) {
        return emailOrPhoneNotFound;
      }
      const refreshToken = generateRefreshToken({
        id: user.id,
        login: payload.login,
        type: payload.type,
      });
      const accessToken = generateAccessToken({
        id: user.id,
        login: payload.login,
        type: payload.type,
      });
      return {
        error: false,
        statusCode: 200,
        data: { accessToken, refreshToken },
        message: 'refresh success',
      };
    } catch (error) {
      Logger.error(error);
      return emailOrPhoneNotFound;
    }
  }

  async profile(req: Request, res: Response) {
    if (!req.session.user) {
      res.status(401).send(unauthorized);
      return;
    }
    res.status(200).send({
      statusCode: 200,
      message: 'success get user',
      error: false,
      data: req.session.user,
    });
    return;
  }
}
