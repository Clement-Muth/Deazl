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
      productId: z.string().uuid().nullable(),
      quantity: z.number(),
      unit: z.string(),
      isCompleted: z.boolean(),
      customName: z.string().nullable(),
      price: z.number().nullable(),
      barcode: z.string().nullable()
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
