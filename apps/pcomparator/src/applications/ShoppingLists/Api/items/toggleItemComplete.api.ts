"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ShoppingListItemApplicationService } from "../../Application/Services/ShoppingListItem.service";
import { PrismaShoppingListRepository } from "../../Infrastructure/Repositories/PrismaShoppingList.infrastructure";
import { PrismaShoppingListItemRepository } from "../../Infrastructure/Repositories/PrismaShoppingListItem.infrastructure";

const shoppingListItemService = new ShoppingListItemApplicationService(
  new PrismaShoppingListRepository(),
  new PrismaShoppingListItemRepository()
);

const ToggleItemCompleteSchema = z.object({
  itemId: z.string().uuid(),
  isCompleted: z.boolean()
});

type ToggleItemCompletePayload = z.infer<typeof ToggleItemCompleteSchema>;

export const toggleItemComplete = async (itemId: string, isCompleted: boolean): Promise<void> => {
  try {
    const payload = ToggleItemCompleteSchema.parse({ itemId, isCompleted });

    const updatedItem = await shoppingListItemService.updateShoppingListItem(payload.itemId, {
      isCompleted: payload.isCompleted
    });

    // Invalider le cache pour la liste de courses
    revalidatePath("/[locale]/shopping-lists/[id]", "page");
    revalidatePath(`/fr/shopping-lists/${updatedItem.shoppingListId}`);
  } catch (error) {
    throw new Error("Failed to update item status", { cause: error });
  }
};
