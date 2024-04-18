import { z } from 'zod';

export enum LoginType {
  email = 'email',
  phone = 'phone',
}

export const AuthRequestConfirmSchema = z.object({
  query: z.object({
    login: z.string(),
    type: z.nativeEnum(LoginType),
  }),
});
