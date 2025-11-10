import { z } from "zod";

export const ShoppingListInfraSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  userId: z.string().uuid(),
  items: z.array(
    z.object({
      id: z.string().uuid(),
      createdAt: z.date(),
      updatedAt: z.date(),
      shoppingListId: z.string().uuid(),
      productId: z.string().uuid(),
      quantity: z.number(),
      unit: z.string(),
      isCompleted: z.boolean(),
      // notes: z.string().nullable(),
      product: z
        .object({
          id: z.string().uuid(),
          barcode: z.string(),
          name: z.string(),
          description: z.string().nullable(),
          category_id: z.string().uuid().nullable(),
          brand_id: z.string().uuid().nullable(),
          nutrition_score: z.any().nullable(),
          created_at: z.date(),
          updated_at: z.date()
        })
        .nullable()
    })
  ),
  collaborators: z.array(
    z.object({
      id: z.string().uuid(),
      listId: z.string().uuid(),
      userId: z.string().uuid(),
      role: z.enum(["OWNER", "EDITOR", "VIEWER"]),
      createdAt: z.date(),
      updatedAt: z.date(),
      user: z.object({
        id: z.string().uuid(),
        name: z.string().nullable(),
        email: z.string().email().nullable(),
        image: z.string().nullable()
      })
    })
  )
});

export type ShoppingListInfraPayload = z.infer<typeof ShoppingListInfraSchema>;
