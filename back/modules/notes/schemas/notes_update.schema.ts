import { z } from 'zod';

export const NotesUpdateSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    data: z.string().optional(),
    published: z.boolean().optional(),
  }),
  query: z.object({
    id: z
      .string()
      .transform((val) => Number(val))
      .pipe(z.number().min(1))
      .optional(),
  }),
});

export type NotesUpdateType = z.infer<typeof NotesUpdateSchema.shape.body>;
