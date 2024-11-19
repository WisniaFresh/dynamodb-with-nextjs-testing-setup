import { z } from 'zod';

export const DummySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  created_at: z.string().optional(),
});

export type DummyType = z.infer<typeof DummySchema>;
