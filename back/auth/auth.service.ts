import Redis from 'ioredis';
import { MailerService } from '../notifications/mailer.service';
import { SmscService } from '../notifications/sms.service';
import { Request, Response } from 'express';
import { configRedisUser } from '../config';

export class AuthService {
  constructor(
    private mailerService = new MailerService(),
    private smscService = new SmscService(),
    private redis = new Redis(configRedisUser),
  ) {}

  public async register(req: Request, res: Response) {
    const { name, email, phone, password } = req.body;
    const cachedData = await this.redis.set('1', 'cachedData');
    console.log(cachedData);
    
    // if (!phone && !email) {
    //   res.status(400).send({ error: 'not found email or phone' });
    // }

    // if (email) {
    //   const is_duplicate = await db.query.users.findFirst({
    //     where: and(eq(users.email, email)),
    //   });
    //   if (is_duplicate) {
    //     res
    //       .status(400)
    //       .send({ issues: [{ message: 'email уже существует', path: ['email'] }] });
    //     // отправляем ошибку в формате Zod чтобы обрабатывать одинаково
    //     return;
    //   }
    //   const confirm = await db.query.confirms.findFirst({
    //     where: and(
    //       eq(confirms.address, email),
    //       eq(confirms.type, LoginTypeEnum.email),
    //       isNotNull(confirms.confirmed_at),
    //     ),
    //   });
    //   if (!confirm) {
    //     res.status(400).send({ error: `not confirmed ${email}` });
    //     return;
    //   }
    // }
    // if (!email && phone) {
    //   const is_duplicate = await db.query.users.findFirst({
    //     where: and(eq(users.phone, phone)),
    //   });
    //   if (is_duplicate) {
    //     // отправляем ошибку в формате Zod чтобы обрабатывать одинаково
    //     res
    //       .status(400)
    //       .send({ issues: [{ message: 'телефон уже существует', path: ['phone'] }] });
    //     return;
    //   }
    //   const confirm = await db.query.confirms.findFirst({
    //     where: and(
    //       eq(confirms.address, phone),
    //       eq(confirms.type, LoginTypeEnum.phone),
    //       isNotNull(confirms.confirmed_at),
    //     ),
    //   });
    //   if (!confirm) {
    //     res.status(400).send({ error: `not confirmed ${phone}` });
    //     return;
    //   }
    // }

    // const hash = await bcrypt.hash(password, 10);
    // try {
    //   const [user] = await db
    //     .insert(users)
    //     .values({
    //       name,
    //       email,
    //       phone,
    //       password: hash,
    //     })
    //     .returning();
    //   const userWithoutPassword = { ...user } as Partial<typeof user>;
    //   delete userWithoutPassword?.password;
    //   res.status(200).send({ message: 'success', user: userWithoutPassword });
    //   return;
    // } catch (error) {
    //   res.status(500).send({ error: error });
    //   return;
    // }
  }

  async handleSendConfirm(req: Request, res: Response) {
    // const { address, type } = req.query;
    // const result = await this.sendNewConfirm(String(address), type as LoginTypeEnum);
    // if (result.transport[type as LoginTypeEnum] === 'error') {
    //   res.status(400).send(result);
    //   return;
    // }
    // if (result.transport) {
    //   res.status(200).send(result);
    //   return;
    // }
  }

  async requestConfirm(req: Request, res: Response) {
    // let confirm = await db.query.confirms.findFirst({
    //   where: and(eq(confirms.address, address), eq(confirms.type, type)),
    // });
    // const confirm_code = Math.floor(Math.random() * 89999 + 10000);
    // if (!confirm) {
    //   // создаем запись
    //   [confirm] = await db
    //     .insert(confirms)
    //     .values({
    //       address,
    //       type,
    //       confirm_code,
    //       requested_at: new Date(),
    //     })
    //     .returning();
    // } else {
    //   if (confirm.requested_at && Date.now() < confirm.requested_at.getTime() + 60000) {
    //     // в течение 60 секунд нельзя генерировать новый код
    //     //return { error: 'Query is temporary unavailable, try after 1 minute' };
    //   }
    //   // обновляем запись
    //   await db
    //     .update(confirms)
    //     .set({ confirm_code, requested_at: new Date() })
    //     .where(eq(confirms.id, confirm.id));
    // }
    // const transport = {} as { email?: string; phone?: string };
    // if (type === LoginTypeEnum.email) {
    //   const emailResult = await this.mailerService.sendMail({
    //     from: 'info@cipo.kz',
    //     to: address,
    //     subject: 'Код подтверждения email',
    //     text: `Код для подтверждения почты: ${confirm_code}`,
    //     html: `Код для подтверждения почты: <b>${confirm_code}</b>`,
    //   });
    //   if (emailResult.data) {
    //     Logger.debug(emailResult.data);
    //     transport.email = 'success';
    //   } else if (emailResult.error) {
    //     transport.email = 'error';
    //   }
    // }
    // if (type === LoginTypeEnum.phone) {
    //   const smsResult = await this.smscService.sendSms(
    //     address,
    //     `Код подтверждения: ${confirm_code}`,
    //   );
    //   if (smsResult.data) {
    //     transport.phone = 'success';
    //   } else if (smsResult.error) {
    //     transport.phone = 'error';
    //   }
    // }
    // return { transport };
  }

  async submitConfirm(req: Request, res: Response) {
    // const { code, address, type } = req.query;
    // if (!code || !address || !type) {
    //   res.status(400).send({ error: 'not found all data' });
    //   return;
    // }
    // const result = await db
    //   .update(confirms)
    //   .set({ confirmed_at: new Date() })
    //   .where(
    //     and(
    //       eq(confirms.address, String(address)),
    //       eq(confirms.confirm_code, Number(code)),
    //       eq(confirms.type, String(type)),
    //     ),
    //   )
    //   .returning();
    // if (result.length === 0) {
    //   res.status(400).send({
    //     issues: [{ message: 'неверный код', path: ['code'] }],
    //   });
    // } else {
    //   res.status(200).send({ message: 'success' });
    // }
  }

  async login(req: Request, res: Response) {
    // const { email, phone, password } = req.body;
    // if (!email && !phone) {
    //   res.status(400).send({ error: 'not found credentials' });
    // }
    // let user;
    // if (email) {
    //   user = await db.query.users.findFirst({ where: eq(users.email, email) });
    // }
    // if (phone) {
    //   user = await db.query.users.findFirst({ where: eq(users.phone, phone) });
    // }
    // if (!user) {
    //   res.status(400).send({
    //     issues: [
    //       { message: 'неверные учетные данные', path: ['phone', 'email', 'password'] },
    //     ],
    //   });
    // }
    // const isValidPassword = await bcrypt.compare(password, String(user?.password));
    // if (isValidPassword) {
    //   const accessToken = generateAccessToken({
    //     id: Number(user?.id),
    //     email: user?.email || '',
    //     phone: user?.phone || '',
    //   });
    //   const refreshToken = generateRefreshToken({
    //     id: Number(user?.id),
    //     email: user?.email || '',
    //     phone: user?.phone || '',
    //   });
    //   res.cookie('token_auth_sample', refreshToken, { httpOnly: true });
    //   //res.appendHeader('Set-Cookie', 'token=encryptedstring; HttpOnly');
    //   //res.appendHeader('Access-Control-Allow-Credentials', 'true');
    //   const userWithoutPassword = { ...user } as Partial<typeof user>;
    //   delete userWithoutPassword?.password;
    //   res.status(200).send({ data: userWithoutPassword, accessToken, refreshToken });
    // } else {
    //   res.status(400).send({
    //     issues: [
    //       { message: 'неверные учетные данные', path: ['phone', 'email', 'password'] },
    //     ],
    //   });
    //
  }

  async refresh(req: Request, res: Response) {
    //   const { token_auth_sample } = req.cookies;
    //   if (!token_auth_sample) {
    //     res.status(400).send({ error: 'not found refresh token' });
    //     return;
    //   }
    //   await verifyToken(token_auth_sample)
    //     .then(async (payload) => {
    //       const user = await db.query.users.findFirst({
    //         where: eq(users.id, payload.id),
    //       });
    //       if (!user) {
    //         res.status(400).send('not correct user data');
    //         return;
    //       }
    //       const refreshToken = generateRefreshToken({
    //         id: user.id,
    //         email: user.email || undefined,
    //         phone: user.phone || undefined,
    //       });
    //       const accessToken = generateAccessToken({
    //         id: user.id,
    //         email: user.email || undefined,
    //         phone: user.phone || undefined,
    //       });
    //       res.status(200).send({ accessToken, refreshToken });
    //     })
    //     .catch((error) => {
    //       Logger.error(error);
    //       res.status(400).send('not correct refresh token');
    //       return;
    //     });
  }
}
