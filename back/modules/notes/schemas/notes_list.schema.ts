import { z } from 'zod';

export const NotesListSchema = z.object({
  query: z.object({
    skip: z
      .string()
      .transform((val) => Number(val))
      .optional(),
    take: z
      .string()
      .transform((val) => Number(val))
      .pipe(z.number().max(20))
      .optional(),
    searchTitle: z.string().optional(),
  }),
});
