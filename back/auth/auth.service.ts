import Redis from 'ioredis';
import { MailerService } from '../notifications/mailer.service';
import { SmscService } from '../notifications/sms.service';
import { Request, Response } from 'express';
import { config } from '../config';
import { LoginType } from './schemas/request_confirm.schema';
import {
  confirmNotFound,
  emailOrPhoneNotConfirmed,
  existUser,
  loginOrPasswordNotCorrect,
  noRefreshToken,
  unauthorized,
} from '../middlewares/exceptions/auth.exceptions';
import { error500 } from '../middlewares/exceptions/common.exceptions';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { ResponseHTTP } from '../shared/interfaces';
import { generateAccessToken, generateRefreshToken, verifyToken } from './jwt_helpers';
import { Logger } from '../shared/logger';
import { session } from 'passport';

export class AuthService {
  constructor(
    private mailerService = new MailerService(),
    private smscService = new SmscService(),
    private redisConfirms = config.redisConfirms.client,
    private prisma = new PrismaClient(),
  ) {}

  public async register(req: Request, res: Response) {
    const { name, email, phone, password } = req.body;
    const confirmEmail = await this.redisConfirms.get(email);
    const confirmPhone = await this.redisConfirms.get(phone);

    if (!confirmEmail && !confirmPhone) {
      res.status(400).send(emailOrPhoneNotConfirmed);
      return;
    }

    if (confirmEmail && JSON.parse(String(confirmEmail)).confirmed_at === 0) {
      res.status(400).send(emailOrPhoneNotConfirmed);
      return;
    }

    if (confirmPhone && JSON.parse(String(confirmPhone)).confirmed_at === 0) {
      res.status(400).send(emailOrPhoneNotConfirmed);
      return;
    }

    const exUser = await this.prisma.users.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });
    if (exUser) {
      res.status(400).send(existUser);
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await this.prisma.users.create({
      data: { ...req.body, password: hash },
    });

    const { password: _, ...userWithoutPassword } = user; // eslint-disable-line
    const result: ResponseHTTP = {
      error: false,
      statusCode: 200,
      message: 'user created',
      data: userWithoutPassword,
    };
    res.status(200).send(result);
  }

  async requestConfirm(req: Request, res: Response) {
    const { login, type } = req.query;
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
        res.status(200).send(error500(error, null));
      }
    }
    if (type === LoginType.phone) {
      this.smscService.sendSms(String(login), `Код подтверждения: ${confirm_code}`);
    }
    res.status(200).send({
      statusCode: 200,
      message: 'code sended',
      error: false,
      data: null,
    });
    return;
  }

  async submitConfirm(req: Request, res: Response) {
    const { code, login, type } = req.query;
    const confirmObject = await this.redisConfirms.get(String(login));
    if (!confirmObject) {
      res.status(400).send(confirmNotFound);
    }
    const parsedConfirm = JSON.parse(confirmObject ? confirmObject : '');

    if (parsedConfirm.type !== type) {
      res.status(400).send(confirmNotFound);
    }
    if (parsedConfirm.code !== parseInt(String(code))) {
      res.status(400).send(confirmNotFound);
    }

    await this.redisConfirms.set(
      String(login),
      JSON.stringify({
        ...parsedConfirm,
        confirmed_at: Date.now(),
      }),
    );
    res.status(200).send({
      statusCode: 200,
      message: 'success confirmed',
      error: false,
      data: null,
    });
    return;
  }

  async login(req: Request, res: Response) {
    const { login, type, password } = req.body;
    let user;
    if (type === LoginType.email) {
      user = await this.prisma.users.findFirst({ where: { email: login } });
    } else if (type === LoginType.phone) {
      user = await this.prisma.users.findFirst({ where: { phone: login } });
    }
    if (!user) {
      res.status(400).send(loginOrPasswordNotCorrect);
      return;
    }
    const isValidPassword = await bcrypt.compare(password, String(user?.password));
    if (!isValidPassword) {
      res.status(400).send(loginOrPasswordNotCorrect);
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
    res.cookie('token', refreshToken, { httpOnly: true });

    const { password: _, ...userWithoutPassword } = user; // eslint-disable-line
    req.session.user = userWithoutPassword;

    const result: ResponseHTTP = {
      error: false,
      statusCode: 200,
      message: 'login success',
      data: { user: userWithoutPassword, accessToken, refreshToken },
    };
    res.status(200).send(result);
  }

  async logout(req: Request, res: Response) {
    req.session.destroy((err) => {
      if (err) {
        Logger.error(err);
        res.status(400).send(error500('error logout', null));
      }
      const result: ResponseHTTP = {
        error: false,
        statusCode: 200,
        message: 'success logout',
        data: null,
      };
      res.status(200).send(result);
    });
  }

  async refresh(req: Request, res: Response) {
    const { token } = req.cookies;
    if (!token) {
      res.status(400).send(noRefreshToken);
      return;
    }
    await verifyToken(token)
      .then(async (payload) => {
        let user;
        if (payload.type === LoginType.email) {
          user = await this.prisma.users.findFirst({ where: { email: payload.login } });
        } else if (payload.type === LoginType.phone) {
          user = await this.prisma.users.findFirst({ where: { phone: payload.login } });
        }
        if (!user) {
          res.status(400).send('not correct user data');
          return;
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
        res.status(200).send({ accessToken, refreshToken });
      })
      .catch((error) => {
        Logger.error(error);
        res.status(400).send('not correct refresh token');
        return;
      });
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
