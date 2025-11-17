"use server";

import { ShoppingListApplicationService } from "../../Application/Services/ShoppingList.service";
import type { ShoppingList } from "../../Domain/Entities/ShoppingList.entity";
import { type GetShoppingListPayload, GetShoppingListSchema } from "../../Domain/Schemas/ShoppingList.schema";
import { PrismaShoppingListRepository } from "../../Infrastructure/Repositories/PrismaShoppingList.infrastructure";

const shoppingListApplicationService = new ShoppingListApplicationService(new PrismaShoppingListRepository());

export const getShoppingList = async (
  shoppingListId: GetShoppingListPayload
): Promise<ShoppingList | null> => {
  try {
    const payload = GetShoppingListSchema.parse(shoppingListId);

    const list = await shoppingListApplicationService.getShoppingList(payload);

    return list;
  } catch (error) {
    throw new Error("Failed to retrieve shopping list", { cause: error });
  }
};
