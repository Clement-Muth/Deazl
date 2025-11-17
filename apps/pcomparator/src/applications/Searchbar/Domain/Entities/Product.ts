import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string().uuid(),
  productName: z.string().min(1)
});

export type Product = z.infer<typeof ProductSchema>;
