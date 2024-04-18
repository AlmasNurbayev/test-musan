import { Response, Request, NextFunction } from 'express';
import passport from 'passport';
import { Logger } from '../shared/logger';
import { unauthorized } from './exceptions/auth.exceptions';
import { JwtPayload } from '../shared/interfaces';

export async function authJWT(req: Request, res: Response, next: NextFunction) {
  console.log('authJWT');

  passport.authenticate(
    'jwt',
    { session: false },
    (err: Error | null, user: JwtPayload) => {
      if (err || !user) {
        Logger.warn(err);
        return res.status(401).send(unauthorized);
      }
      if (!req.session.user) {
        return res.status(401).send(unauthorized);
      }
      if (req.session.user.id !== user.id) {
        return res.status(401).send(unauthorized);
      }
      return next();
    },
  )(req, res, next);
}
