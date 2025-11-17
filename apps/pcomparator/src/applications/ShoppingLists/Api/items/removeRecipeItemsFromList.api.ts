"use server";

import { z } from "zod";
import { ShoppingListItemApplicationService } from "../../Application/Services/ShoppingListItem.service";
import { PrismaShoppingListRepository } from "../../Infrastructure/Repositories/PrismaShoppingList.infrastructure";
import { PrismaShoppingListItemRepository } from "../../Infrastructure/Repositories/PrismaShoppingListItem.infrastructure";

const shoppingListItemService = new ShoppingListItemApplicationService(
  new PrismaShoppingListRepository(),
  new PrismaShoppingListItemRepository()
);

const RemoveRecipeItemsSchema = z.object({
  listId: z.string().uuid("Invalid shopping list ID"),
  recipeId: z.string().uuid("Invalid recipe ID")
});

export type RemoveRecipeItemsPayload = z.infer<typeof RemoveRecipeItemsSchema>;

/**
 * Removes all items from a shopping list that are associated with a specific recipe
 */
export async function removeRecipeItemsFromList(data: RemoveRecipeItemsPayload) {
  try {
    const validated = RemoveRecipeItemsSchema.parse(data);
    const { listId, recipeId } = validated;

    const result = await shoppingListItemService.removeRecipeItemsFromList(listId, recipeId);

    return {
      success: true,
      deletedCount: result
    };
  } catch (error) {
    console.error("Error removing recipe items from list", error);

    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.errors[0].message}`);
    }

    throw new Error("Failed to remove recipe items from list");
  }
}
