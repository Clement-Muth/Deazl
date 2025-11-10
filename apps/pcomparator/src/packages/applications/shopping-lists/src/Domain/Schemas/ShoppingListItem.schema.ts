import { z } from "zod";

export const UnitSchema = z.enum(["unit", "kg", "g", "l", "ml", "piece"]);

export const ShoppingListItemSchema = z.object({
  id: z.string().uuid(),
  shoppingListId: z.string().uuid(),
  productId: z.string().uuid().nullable().optional(),
  recipeId: z.string().uuid().nullable().optional(),
  recipeName: z.string().nullable().optional(),
  quantity: z.number().positive().default(1),
  unit: UnitSchema.default("unit"),
  isCompleted: z.boolean().default(false),
  customName: z.string().nullable().optional(),
  price: z.number().positive().optional(),
  barcode: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  product: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      barcode: z.string(),
      description: z.string().nullable().optional()
    })
    .nullable()
    .optional()
});
