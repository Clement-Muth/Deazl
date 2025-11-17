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

const RemoveItemFromListSchema = z.string().uuid();

type RemoveItemFromListPayload = z.infer<typeof RemoveItemFromListSchema>;

export const removeItemFromList = async (itemId: RemoveItemFromListPayload): Promise<void> => {
  try {
    const payload = RemoveItemFromListSchema.parse(itemId);

    await shoppingListItemService.removeShoppingListItem(payload);

    // Invalider le cache pour toutes les listes de courses
    revalidatePath("/[locale]/shopping-lists/[id]", "page");
    revalidatePath("/[locale]/shopping-lists", "page");
  } catch (error) {
    throw new Error("Failed to remove item from list", { cause: error });
  }
};
