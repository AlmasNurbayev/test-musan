import { z } from 'zod';

export const NotesCreateSchema = z.object({
  body: z.object({
    title: z.string(),
    data: z.string().optional(),
    published: z.boolean().optional(),
    //user_id: z.number(), - get form session
  }),
});

export type NotesCreateType = z.infer<typeof NotesCreateSchema.shape.body>;
