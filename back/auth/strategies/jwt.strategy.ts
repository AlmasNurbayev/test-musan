import { Strategy, ExtractJwt } from 'passport-jwt';
import { config } from '../../config';
import { JwtPayload } from '../../shared/interfaces';

export const JwtStrategy = new Strategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.secretJwt,
    passReqToCallback: true,
  },
  (req, payload: JwtPayload, done) => {
    return done(undefined, payload);
  },
);
