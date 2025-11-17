"use server";

import { revalidatePath } from "next/cache";
import { ShoppingListApplicationService } from "../../Application/Services/ShoppingList.service";
import {
  type DeleteShoppingListPayload,
  DeleteShoppingListSchema
} from "../../Domain/Schemas/ShoppingList.schema";
import { PrismaShoppingListRepository } from "../../Infrastructure/Repositories/PrismaShoppingList.infrastructure";

const shoppingListApplicationService = new ShoppingListApplicationService(new PrismaShoppingListRepository());

export const deleteShoppingList = async (shoppingListId: DeleteShoppingListPayload) => {
  try {
    const payload = DeleteShoppingListSchema.parse(shoppingListId);

    await shoppingListApplicationService.deleteShoppingList(payload);

    // Invalider le cache pour la liste des listes et la liste supprimée
    revalidatePath("/[locale]/shopping-lists", "page");
    revalidatePath("/fr/shopping-lists");
    revalidatePath(`/fr/shopping-lists/${payload}`);
  } catch (error) {
    throw new Error("Failed to delete shopping list", { cause: error });
  }
};
