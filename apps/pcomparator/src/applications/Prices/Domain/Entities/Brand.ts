import { z } from "zod";

export const BrandSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  websiteUrl: z.string().url().nullable().optional()
});

export const CreateBrandSchema = BrandSchema.omit({
  id: true
});

export type Brand = z.infer<typeof BrandSchema>;
export type CreateBrand = z.infer<typeof CreateBrandSchema>;
