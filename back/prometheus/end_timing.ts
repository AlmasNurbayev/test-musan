import { NextFunction, Response, Request } from 'express';
import { http_request_duration_milliseconds } from './register';

export function endTiming(req: Request, res: Response, next: NextFunction) {
  const responseTime = Date.now() - res.locals.startEpoch;
  http_request_duration_milliseconds
    .labels(req.method, req.path, String(res.statusCode), req.originalUrl)
    .observe(responseTime);
  next();
}
