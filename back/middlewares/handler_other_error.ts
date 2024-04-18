import { NextFunction, Response, Request  } from 'express';
import { Logger } from '../shared/logger';
import { ResponseHTTP } from '../shared/interfaces';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err);
  }
  Logger.error(err);
  const internalError: ResponseHTTP = {
    error: true,
    message: 'Internal error',
    statusCode: 500,
    data: null,
  };
  res.status(500).send(internalError);
}
