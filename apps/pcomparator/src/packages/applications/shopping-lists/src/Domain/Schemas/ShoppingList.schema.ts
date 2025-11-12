import { z } from "zod";
import { ShoppingListItemSchema } from "../../Domain/Schemas/ShoppingListItem.schema";
import { UserRoleEnum } from "../../Domain/Schemas/UserRole.schema";
import type { UserRole } from "../Entities/ShoppingList.entity";

export const ShoppingListCollaboratorSchema = z.object({
  id: z.string(),
  listId: z.string(),
  userId: z.string(),
  role: UserRoleEnum,
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string().nullable(),
    image: z.string().nullable()
  })
});

export const ShoppingListSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  userId: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  isPublic: z.boolean().default(false),
  items: z.array(ShoppingListItemSchema).optional(),
  collaborators: z.array(ShoppingListCollaboratorSchema).optional()
});

export const CreateShoppingListSchema = z.object({
  name: z.string()
});
export type CreateShoppingListPayload = z.infer<typeof CreateShoppingListSchema>;

export const DeleteShoppingListSchema = z.string().uuid();
export type DeleteShoppingListPayload = z.infer<typeof DeleteShoppingListSchema>;

export const GetShoppingListSchema = z.string().uuid();
export type GetShoppingListPayload = z.infer<typeof GetShoppingListSchema>;

export const UpdateShoppingListSchema = z.object({
  name: z.string()
});
export type UpdateShoppingListPayload = z.infer<typeof UpdateShoppingListSchema>;

export type ShoppingListPayload = z.infer<typeof ShoppingListSchema> & {
  totalItems: number;
  completedItems: number;
  progressPercentage: number;
  totalPrice: number;
  totalPendingPrice: number;
  totalCompletedPrice: number;
  userRole?: UserRole;
};
