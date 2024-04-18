import { NextFunction, Router, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Logger } from '../shared/logger';
import { validateSchema } from '../middlewares/validateSchema';
import { AuthRegisterSchema } from './schemas/register.schema';
import { AuthRequestConfirmSchema } from './schemas/request_confirm.schema';
import { AuthSubmitConfirmSchema } from './schemas/submit_confirm.schema';
import { AuthLoginSchema } from './schemas/login.schema';
import { authJWT } from '../middlewares/authJwt';
import { error500 } from '../middlewares/exceptions/common.exceptions';
import { ResponseHTTP } from '../shared/interfaces';

export function AuthController() {
  const router = Router();
  const authService = new AuthService();

  router.post(
    '/register',
    (req: Request, res: Response, next: NextFunction) => {
      validateSchema(req, res, next, AuthRegisterSchema);
    },
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await authService.register(req.body);
        res.status(result.statusCode).send(result);
      } catch (error) {
        next(error);
      }
    },
  );

  router.post(
    '/login',
    (req: Request, res: Response, next: NextFunction) => {
      validateSchema(req, res, next, AuthLoginSchema);
    },
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await authService.login(req.body);
        if (result.statusCode === 200) {
          res.cookie('token', result.data.refreshToken, { httpOnly: true });
          req.session.user = result.data.user;
        }
        res.status(result.statusCode).send(result);
      } catch (error) {
        next(error);
      }
    },
  );

  router.get('/', authJWT, (req: Request, res: Response, next: NextFunction) => {
    authService.profile(req, res).catch(next);
  });

  router.get(
    '/request_confirm',
    (req: Request, res: Response, next: NextFunction) => {
      validateSchema(req, res, next, AuthRequestConfirmSchema);
    },
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await authService.requestConfirm(req.query);
        res.status(result.statusCode).send(result);
      } catch (error) {
        next(error);
      }
    },
  );

  router.get(
    '/submit_confirm',
    (req: Request, res: Response, next: NextFunction) => {
      validateSchema(req, res, next, AuthSubmitConfirmSchema);
    },
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await authService.submitConfirm(req.query);
        res.status(result.statusCode).send(result);
      } catch (error) {
        next(error);
      }
    },
  );

  router.get('/refresh', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.refresh(req.cookies);
      res.status(result.statusCode).send(result);
    } catch (error) {
      next(error);
    }
  });

  router.get('/logout', (req: Request, res: Response) => {
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
  });

  Logger.info('Users controller mounted');

  return router;
}
