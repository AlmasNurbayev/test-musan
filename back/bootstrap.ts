import express from 'express';
import { Logger } from './shared/logger';
import helmet from 'helmet';
import { startTiming } from './prometheus/start_timing';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { endTiming } from './prometheus/end_timing';
import { AuthController } from './auth/auth.controller';
import { NotesController } from './modules/notes/notes.controller';
import { registerM } from './prometheus/register';
import { config } from './config';
import { errorHandler } from './middlewares/handler_other_error';
import './prometheus/register';
import { Seeds } from './prisma/seed';

export function bootstrap(): express.Application {
  const app = express();
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
  return app;
}
