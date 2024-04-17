import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config, configRedisUser } from './config';
import { Logger } from './shared/logger';
import { errorHandler } from './middlewares/handler_other_error';
import { handler404 } from './middlewares/handler404';
import { AuthController } from './auth/auth.controller';

function bootstrap() {
  Logger.warn('Back service init');
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(cors({ origin: config.front_url, credentials: true }));
  Logger.info('Open cors for >>> ' + config.front_url);
  app.get('/', (req, res) => {
    res.send('Hello world');
  });
  app.use('/auth', AuthController());
  // app.use('/oauth', OauthController());
  // app.use('/user', UserController());
  app.use(errorHandler);
  app.use(handler404);
  app.listen(config.express_port, () => {
    Logger.info(
      `Back service started at the port  ${config.express_port} >>> ${config.express_port_external}`,
    );
  });
}

bootstrap();
