import { Response, Request } from 'express';
import { ResponseHTTP } from '../shared/interfaces';

export function handler404(req: Request, res: Response) {
  const notFoundError: ResponseHTTP = {
    error: true,
    message: 'URL not found',
    statusCode: 404,
    data: null,
  };
  res.status(404).send(notFoundError);
}
