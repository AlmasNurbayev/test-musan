import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { Logger } from './shared/logger';
import { errorHandler } from './middlewares/handler_other_error';
import { AuthController } from './auth/auth.controller';
import session from 'express-session';
import { SessionUser } from './shared/interfaces';
import passport from 'passport';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { NotesController } from './modules/notes/notes.controller';
import './prometheus/register';
import { startTiming } from './prometheus/start_timing';
import { endTiming } from './prometheus/end_timing';
import { registerM } from './prometheus/register';
import helmet from 'helmet';
import { Seeds } from './prisma/seed';
import http from 'http';

declare module 'express-session' {
  interface Session {
    user?: SessionUser;
  }
}

export let serverHTTP: http.Server;
export const app = express();

function bootstrap() {
  Logger.warn('Back service init');
  //const app = express();
  app.use(helmet());
  app.use(startTiming);
  app.use(cors({ origin: config.frontUrl, credentials: true }));

  app.use(express.json());
  app.use(cookieParser());
  app.use(session(config.redisSessions));
  passport.initialize();
  passport.use(JwtStrategy);
  app.use(passport.session());
  

  app.use((req, res, next) => {
    // для перехвата всех ответов в конце цепочки
    res.on('finish', () => endTiming(req, res, next));
    next();
  });

  Logger.info('Open cors for >>> ' + config.frontUrl);
  app.get('/', (req, res) => {
    res.send('Hello world');
  });
  app.use('/auth', AuthController());
  app.use('/notes', NotesController());
  app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', registerM.contentType);
    res.send(await registerM.metrics());
  });

  // закрывающие роуты
  app.use(errorHandler);
  //- не совместим с res.on('finish') в endTiming,
  // вызывает ошибку 'Cannot set headers after they are sent to the client'
  //app.use(handler404);

  Seeds();
  serverHTTP = http.createServer(app);
  serverHTTP.listen(config.expressPort, () => {
    Logger.info(
      `Back service started at the port  ${config.expressPort} >>> ${config.expressPortExternal}`,
    );
  });
}

bootstrap();
