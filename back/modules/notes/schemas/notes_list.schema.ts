import { z } from 'zod';

export const NotesListSchema = z.object({
  query: z.object({
    skip: z.string().optional(),
    take: z.string().optional(),
    searchTitle: z.string().optional(),
  }),
});
