import { z } from "zod";

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  parentCategoryId: z.string().uuid().nullable().optional()
});

export const CreateCategorySchema = CategorySchema.omit({
  id: true
});

export type Category = z.infer<typeof CategorySchema>;
export type CreateCategory = z.infer<typeof CreateCategorySchema>;
