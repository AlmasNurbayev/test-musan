import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { config } from '../../config';

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.secret_jwt,
    },
    async function verify(jwtToken, done) {
      //const user = await db.query.users.findFirst({ where: eq(users.id, jwtToken.id) });
      const user = {};
      if (jwtToken.email && user?.email !== jwtToken.email) {
        return done('unauthorized user', false);
      }
      if (jwtToken.phone && user?.phone !== jwtToken.phone) {
        return done('unauthorized user', false);
      }
      if (user) {
        return done(undefined, user, jwtToken);
      } else {
        return done('unauthorized user', false);
      }
    },
  ),
);
