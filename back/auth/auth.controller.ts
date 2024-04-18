import { NextFunction, Router, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Logger } from '../shared/logger';
import { validateSchema } from '../middlewares/validateSchema';
import { AuthRegisterSchema } from './schemas/register.schema';
import { AuthRequestConfirmSchema } from './schemas/request_confirm.schema';
import { AuthSubmitConfirmSchema } from './schemas/submit_confirm.schema';
import { AuthLoginSchema } from './schemas/login.schema';
import { authJWT } from '../middlewares/authJwt';

export function AuthController() {
  const router = Router();
  const authService = new AuthService();

  router.post(
    '/register',
    (req: Request, res: Response, next: NextFunction) => {
      validateSchema(req, res, next, AuthRegisterSchema);
    },
    (req: Request, res: Response, next: NextFunction) => {
      authService.register(req, res).catch(next);
    },
  );

  router.post(
    '/login',
    (req: Request, res: Response, next: NextFunction) => {
      validateSchema(req, res, next, AuthLoginSchema);
    },
    (req: Request, res: Response, next: NextFunction) => {
      authService.login(req, res).catch(next);
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
    (req: Request, res: Response, next: NextFunction) => {
      authService.requestConfirm(req, res).catch(next);
    },
  );

  router.get(
    '/submit_confirm',
    (req: Request, res: Response, next: NextFunction) => {
      validateSchema(req, res, next, AuthSubmitConfirmSchema);
    },
    (req: Request, res: Response, next: NextFunction) => {
      authService.submitConfirm(req, res).catch(next);
    },
  );

  router.get('/refresh', (req: Request, res: Response, next: NextFunction) => {
    authService.refresh(req, res).catch(next);
  });

  router.get('/logout', (req: Request, res: Response, next: NextFunction) => {
    authService.logout(req, res).catch(next);
  });

  Logger.info('auth controller mounted');

  return router;
}
