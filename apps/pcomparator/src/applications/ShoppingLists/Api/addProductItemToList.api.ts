"use server";

import { revalidatePath } from "next/cache";
import { ShoppingListItemApplicationService } from "../Application/Services/ShoppingListItem.service";
import { ItemQuantity } from "../Domain/ValueObjects/ItemQuantity.vo";
import { Unit } from "../Domain/ValueObjects/Unit.vo";
import { PrismaShoppingListRepository } from "../Infrastructure/Repositories/PrismaShoppingList.infrastructure";
import { PrismaShoppingListItemRepository } from "../Infrastructure/Repositories/PrismaShoppingListItem.infrastructure";

const shoppingListItemService = new ShoppingListItemApplicationService(
  new PrismaShoppingListRepository(),
  new PrismaShoppingListItemRepository()
);

export interface AddProductItemData {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  isCompleted?: boolean;
}

export const addProductItemToList = async (listId: string, itemData: AddProductItemData) => {
  try {
    const quantity = ItemQuantity.create(itemData.quantity);
    const unit = Unit.create(itemData.unit);

    const item = await shoppingListItemService.addItemToList(listId, {
      productId: itemData.productId,
      quantity: quantity.value,
      unit: unit.value,
      isCompleted: itemData.isCompleted || false
    });

    // Invalider le cache pour la liste de courses
    revalidatePath("/[locale]/shopping-lists/[id]", "page");
    revalidatePath(`/fr/shopping-lists/${listId}`);

    return item.toObject();
  } catch (error) {
    console.error("Error adding product item to list", error);

    if (error instanceof Error && error.message.includes("Quantity must be at least"))
      throw new Error(`Invalid quantity: ${error.message}`);

    if (error instanceof Error && error.message.includes("Unit"))
      throw new Error(`Invalid unit: ${error.message}`);

    throw new Error("Failed to add product item to list");
  }
};
