import { Response, Request, NextFunction } from 'express';
import passport from 'passport';
import { Logger } from '../shared/logger';
import { unauthorized } from './exceptions/auth.exceptions';
import { JwtPayload } from '../shared/interfaces';

export async function authJWT(req: Request, res: Response, next: NextFunction) {
  passport.authenticate(
    'jwt',
    { session: true },
    (err: Error | null, user: JwtPayload) => {
      if (err || !user) {
        Logger.warn('authJWT error or not payload: ', err);
        return res.status(401).send(unauthorized);
      }
      if (!req.session.user) {
        Logger.warn('authJWT no session: ', err);
        return res.status(401).send(unauthorized);
      }
      if (req.session?.user?.id !== user.id) {
        Logger.warn('authJWT session id not equal payload.id: ', err);
        return res.status(401).send(unauthorized);
      }
      return next();
    },
  )(req, res, next);
}
