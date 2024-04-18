import { ResponseHTTP } from '../../shared/interfaces';

export function error500(message: unknown, data: any): ResponseHTTP {
  return {
    error: true,
    message,
    statusCode: 500,
    data: data,
  };
}
