import { NextFunction, Router, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Logger } from '../shared/logger';

export function AuthController() {
  const router = Router();
  const authService = new AuthService();

  router.post(
    '/register',
    // (req: Request, res: Response, next: NextFunction) => {
    //   validateSchema(req, res, next, AuthRegisterSchema);
    // },
    (req: Request, res: Response, next: NextFunction) => {
      authService.register(req, res).catch(next);
    },
  );

  router.post(
    '/login',
    // (req: Request, res: Response, next: NextFunction) => {
    //   validateSchema(req, res, next, AuthLoginSchema);
    // },
    (req: Request, res: Response, next: NextFunction) => {
      authService.login(req, res).catch(next);
    },
  );

  router.get(
    '/request_confirm',
    // (req: Request, res: Response, next: NextFunction) => {
    //   validateSchema(req, res, next, AuthSendConfirmSchema);
    // },
    (req: Request, res: Response, next: NextFunction) => {
      authService.requestConfirm(req, res).catch(next);
    },
  );

  router.get(
    '/submit_confirm',
    // (req: Request, res: Response, next: NextFunction) => {
    //   validateSchema(req, res, next, AuthConfirmSchema);
    // },
    (req: Request, res: Response, next: NextFunction) => {
      authService.submitConfirm(req, res).catch(next);
    },
  );

  router.get('/refresh', (req: Request, res: Response, next: NextFunction) => {
    authService.refresh(req, res).catch(next);
  });

  router.get('/', (req: Request, res: Response, next: NextFunction) => {
    // TODO - вернуть сессию пользователя
    //authService.refresh(req, res).catch(next);
  });

  Logger.info('auth controller mounted');

  return router;
}
