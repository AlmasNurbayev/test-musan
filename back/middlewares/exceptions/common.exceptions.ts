import { ResponseHTTP } from '../../shared/interfaces';

export function error500(message: unknown, data: unknown): ResponseHTTP {
  return {
    error: true,
    message,
    statusCode: 500,
    data: data,
  };
}

export const tooManyRequest = {
  error: true,
  message: 'too many requests',
  statusCode: 429,
  data: null,
};
