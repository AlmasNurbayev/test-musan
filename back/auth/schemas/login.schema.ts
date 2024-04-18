import { z } from 'zod';
import { LoginType } from './request_confirm.schema';

export const AuthLoginSchema = z.object({
  body: z
    .object({
      login: z.string(),
      type: z.nativeEnum(LoginType),
      password: z.string(),
    })
    .strict(),
});

export type AuthLoginType = z.infer<typeof AuthLoginSchema.shape.body>;
