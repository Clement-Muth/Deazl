"use server";

import { auth } from "@deazl/system";
import { revalidatePath } from "next/cache";
import { PantryApplicationService } from "../../Application/Services/PantryApplication.service";
import {
  type CreatePantryItemInput,
  CreatePantryItemSchema,
  type PantryItemPayload
} from "../../Domain/Schemas/PantryItem.schema";
import { PrismaPantryItemRepository } from "../../Infrastructure/Repositories/PrismaPantryItem.infrastructure";

const pantryApplicationService = new PantryApplicationService(new PrismaPantryItemRepository());

export const createPantryItem = async (
  input: CreatePantryItemInput & { productId?: string }
): Promise<PantryItemPayload> => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const payload = CreatePantryItemSchema.parse(input);

    const item = await pantryApplicationService.createPantryItem(session.user.id, {
      ...payload,
      productId: input.productId
    });

    revalidatePath("/[locale]/pantry", "page");

    return item.toObject();
  } catch (error) {
    throw new Error("Failed to create pantry item", { cause: error });
  }
};
