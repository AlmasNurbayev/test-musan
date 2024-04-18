import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { Logger } from './shared/logger';
import { errorHandler } from './middlewares/handler_other_error';
import { handler404 } from './middlewares/handler404';
import { AuthController } from './auth/auth.controller';
import session from 'express-session';
import { SessionUser } from './shared/interfaces';
import { authJWT } from './middlewares/authJwt';
import passport from 'passport';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { NotesController } from './modules/notes/notes.controller';
import rateLimit from 'express-rate-limit';

declare module 'express-session' {
  interface Session {
    user?: SessionUser;
    // Другие свойства сессии, если есть
  }
}

function bootstrap() {
  Logger.warn('Back service init');
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(session(config.redisSessions));
  passport.use(JwtStrategy);
  app.use(passport.session());

  app.use(cors({ origin: config.front_url, credentials: true }));
  Logger.info('Open cors for >>> ' + config.front_url);

  app.get('/', authJWT, (req, res) => {
    res.send('Hello world');
  });
  app.use('/auth', AuthController());
  app.use('/notes', NotesController());

  app.use(errorHandler);
  app.use(handler404);

  app.listen(config.express_port, () => {
    Logger.info(
      `Back service started at the port  ${config.express_port} >>> ${config.express_port_external}`,
    );
  });
}

bootstrap();
