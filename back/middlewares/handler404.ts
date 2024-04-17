import { Response } from 'express';
import { ResponseHTTP } from '../shared/interfaces';

export function handler404(res: Response) {
  const notFoundError: ResponseHTTP = {
    error: true,
    message: 'URL not found',
    statusCode: 400,
    data: null,
  };
  res.status(404).send(notFoundError);
}
