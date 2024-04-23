import { LoginType } from '../auth/schemas/request_confirm.schema';

export type ResponseHTTP = {
  error: boolean;
  statusCode: number;
  message: unknown;
  data?: unknown; // в задании object, но это может быть и массив
};

export interface JwtPayload {
  id: number;
  type: LoginType;
  login: string;
}

export interface SessionUser {
  id: number;
  email: string;
  phone: string;
  name: string | null;
  created_at: Date;
  updated_at: Date;
}
