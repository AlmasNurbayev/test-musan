import { NextFunction, Request, Response } from 'express';

export function startTiming(req: Request, res: Response, next: NextFunction) {
  res.locals.startEpoch = Date.now();
  next();
}
