import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string().uuid(),
  barcode: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1).nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  brandId: z.string().uuid().nullable().optional(),
  nutritionScore: z.any().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const CreateProductSchema = ProductSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
