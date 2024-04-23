import express from 'express';
import { config } from './config';
import { Logger } from './shared/logger';
import { SessionUser } from './shared/interfaces';
import http from 'http';
import { bootstrap } from './bootstrap';

declare module 'express-session' {
  interface Session {
    user?: SessionUser;
  }
}

function runServer(app: express.Application) {
  const serverHTTP = http.createServer(app);
  serverHTTP.listen(config.expressPort, () => {
    Logger.info(
      `Back service started at the port  ${config.expressPort} >>> ${config.expressPortExternal}`,
    );
  });
}

const appInstance = bootstrap();
runServer(appInstance);
