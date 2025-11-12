"use server";

import { z } from "zod";
import { ShoppingListItemApplicationService } from "../../Application/Services/ShoppingListItem.service";
import type { ShoppingListItemPayload } from "../../Domain/Entities/ShoppingListItem.entity";
import { ItemQuantity } from "../../Domain/ValueObjects/ItemQuantity.vo";
import { Unit } from "../../Domain/ValueObjects/Unit.vo";
import { PrismaShoppingListRepository } from "../../Infrastructure/Repositories/PrismaShoppingList.infrastructure";
import { PrismaShoppingListItemRepository } from "../../Infrastructure/Repositories/PrismaShoppingListItem.infrastructure";

const shoppingListItemService = new ShoppingListItemApplicationService(
  new PrismaShoppingListRepository(),
  new PrismaShoppingListItemRepository()
);

const UpdateShoppingListItemSchema = z.object({
  itemId: z.string().uuid(),
  data: z
    .object({
      quantity: z.number().positive("Quantity must be positive").optional(),
      unit: z.enum(["unit", "kg", "g", "l", "ml", "piece"]).optional(),
      isCompleted: z.boolean().optional(),
      recipeId: z.string().uuid().nullable().optional(),
      recipeName: z.string().nullable().optional()
    })
    .partial()
});

type UpdateShoppingListItemPayload = z.infer<typeof UpdateShoppingListItemSchema>;

export const updateShoppingListItem = async (
  itemId: string,
  data: Partial<
    Pick<ShoppingListItemPayload, "quantity" | "unit" | "isCompleted" | "recipeId" | "recipeName">
  >
): Promise<ShoppingListItemPayload> => {
  try {
    const payload = UpdateShoppingListItemSchema.parse({ itemId, data });

    // Validation et création des Value Objects pour les champs modifiés
    const validatedData: Partial<
      Pick<ShoppingListItemPayload, "quantity" | "unit" | "isCompleted" | "recipeId" | "recipeName">
    > = {};

    if (payload.data.quantity !== undefined) {
      const quantity = ItemQuantity.create(payload.data.quantity);
      validatedData.quantity = quantity.value;
    }

    if (payload.data.unit !== undefined) {
      const unit = Unit.create(payload.data.unit);
      // @ts-ignore
      validatedData.unit = unit.value;
    }

    if (payload.data.isCompleted !== undefined) {
      validatedData.isCompleted = payload.data.isCompleted;
    }

    if (payload.data.recipeId !== undefined) {
      validatedData.recipeId = payload.data.recipeId;
    }

    if (payload.data.recipeName !== undefined) {
      validatedData.recipeName = payload.data.recipeName;
    }

    const updatedItem = await shoppingListItemService.updateShoppingListItem(payload.itemId, validatedData);

    return updatedItem.toObject();
  } catch (error) {
    throw new Error("Failed to update shopping list item", { cause: error });
  }
};
