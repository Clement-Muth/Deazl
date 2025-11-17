"use server";

import { auth } from "@deazl/system";
import { PantryApplicationService } from "../../Application/Services/PantryApplication.service";
import type { PantryItemPayload } from "../../Domain/Schemas/PantryItem.schema";
import { PrismaPantryItemRepository } from "../../Infrastructure/Repositories/PrismaPantryItem.infrastructure";

const pantryApplicationService = new PantryApplicationService(new PrismaPantryItemRepository());

export const getPantryItems = async (): Promise<PantryItemPayload[]> => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const items = await pantryApplicationService.getPantryItemsByUserId(session.user.id);

    return items.map((item) => item.toObject());
  } catch (error) {
    throw new Error("Failed to get pantry items", { cause: error });
  }
};
