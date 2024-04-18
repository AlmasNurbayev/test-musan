import { z } from 'zod';

export const AuthRegisterSchema = z.object({
  body: z
    .object({
      email: z.string().email().optional(),
      phone: z.string().optional(),
      name: z.string().optional(),
      password: z.string().min(8, 'минимальная длина пароля 8 символов'),
    })
    .superRefine((val, ctx) => {
      if (!val.email && !val.phone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'одно из полей должно быть задано',
          path: ['email', 'phone'],
        });
      }
    }),
});