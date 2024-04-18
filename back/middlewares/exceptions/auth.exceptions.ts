import { ResponseHTTP } from '../../shared/interfaces';

export const confirmNotFound: ResponseHTTP = {
  statusCode: 400,
  message: 'login or confirm not correct',
  error: true,
  data: null,
};

export const emailOrPhoneNotFound: ResponseHTTP = {
  error: true,
  message: 'email or phone not found',
  statusCode: 400,
  data: null,
};

export const emailOrPhoneNotConfirmed: ResponseHTTP = {
  error: true,
  message: 'email or phone not confirmed',
  statusCode: 400,
  data: null,
};

export const existUser: ResponseHTTP = {
  error: true,
  statusCode: 400,
  message: 'user with this email or phone already exist',
  data: null,
};

export const loginOrPasswordNotCorrect: ResponseHTTP = {
  error: true,
  statusCode: 400,
  message: 'login or password not correct',
  data: null,
};

export const noRefreshToken: ResponseHTTP = {
  error: true,
  statusCode: 400,
  message: 'not found refresh token',
  data: null,
};

export const unauthorized: ResponseHTTP = {
  error: true,
  statusCode: 401,
  message: 'unauthorized',
  data: null,
};
