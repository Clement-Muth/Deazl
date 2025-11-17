import { z } from "zod";

export const ProductSchema = z.object({
  barcode: z.string().min(1),
  name: z.string().min(1),
  brandName: z.string().min(1),
  categoryName: z.string().min(1)
});

export type Product = z.infer<typeof ProductSchema>;
