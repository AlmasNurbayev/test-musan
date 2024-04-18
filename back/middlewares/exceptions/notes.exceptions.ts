import { ResponseHTTP } from '../../shared/interfaces';

export const notesNotFound: ResponseHTTP = {
  error: true,
  statusCode: 404,
  message: 'note not found',
  data: null,
};
