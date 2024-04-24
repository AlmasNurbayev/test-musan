import express from 'express';
import { config } from './config';
import { Logger } from './shared/logger';
import { SessionUser } from './shared/interfaces';
import http from 'http';
import { bootstrap } from './bootstrap';
import { rmqInit } from './rmq/rmqInit';
import { createHttpTerminator } from 'http-terminator';

declare module 'express-session' {
  interface Session {
    user?: SessionUser;
  }
}

async function runServer(app: express.Application) {
  await rmqInit();

  const server = app.listen(config.expressPort);
  const httpTerminator = createHttpTerminator({
    server,
  });
  Logger.info(
    `Back service started at the port  ${config.expressPort} >>> ${config.expressPortExternal}`,
  );

  process.on('SIGTERM', async () => {
    Logger.warn('SIGTERM signal received: closing HTTP server');
    await httpTerminator.terminate();
    Logger.warn('HTTP server terminated');
  });
}

const appInstance = bootstrap();
runServer(appInstance);
