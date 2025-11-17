"use server";

import { auth } from "@deazl/system";
import { revalidatePath } from "next/cache";
import { PantryApplicationService } from "../../Application/Services/PantryApplication.service";
import {
  type PantryItemPayload,
  type UpdatePantryItemInput,
  UpdatePantryItemSchema
} from "../../Domain/Schemas/PantryItem.schema";
import { PrismaPantryItemRepository } from "../../Infrastructure/Repositories/PrismaPantryItem.infrastructure";

const pantryApplicationService = new PantryApplicationService(new PrismaPantryItemRepository());

export const updatePantryItem = async (
  id: string,
  input: UpdatePantryItemInput
): Promise<PantryItemPayload> => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const payload = UpdatePantryItemSchema.parse(input);

    const item = await pantryApplicationService.updatePantryItem(id, session.user.id, payload);

    revalidatePath("/[locale]/pantry", "page");

    return item.toObject();
  } catch (error) {
    throw new Error("Failed to update pantry item", { cause: error });
  }
};
