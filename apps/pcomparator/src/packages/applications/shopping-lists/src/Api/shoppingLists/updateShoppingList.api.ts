"use server";

import { revalidatePath } from "next/cache";
import { ShoppingListApplicationService } from "../../Application/Services/ShoppingList.service";
import {
  type UpdateShoppingListPayload,
  UpdateShoppingListSchema
} from "../../Domain/Schemas/ShoppingList.schema";
import { PrismaShoppingListRepository } from "../../Infrastructure/Repositories/PrismaShoppingList.infrastructure";

const shoppingListApplicationService = new ShoppingListApplicationService(new PrismaShoppingListRepository());

export const updateShoppingList = async (shoppingListId: string, params: UpdateShoppingListPayload) => {
  try {
    const payload = UpdateShoppingListSchema.parse(params);
    const list = await shoppingListApplicationService.updateShoppingList(shoppingListId, payload);

    // Invalider le cache pour la liste mise à jour
    revalidatePath("/[locale]/shopping-lists/[id]", "page");
    revalidatePath("/[locale]/shopping-lists", "page");
    revalidatePath(`/fr/shopping-lists/${shoppingListId}`);

    return list.toObject();
  } catch (error) {
    throw new Error("Failed to update shopping list", { cause: error });
  }
};
