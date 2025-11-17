"use server";

import { auth } from "@deazl/system";
import { revalidatePath } from "next/cache";
import { PantryApplicationService } from "../../Application/Services/PantryApplication.service";
import { PrismaPantryItemRepository } from "../../Infrastructure/Repositories/PrismaPantryItem.infrastructure";

const pantryApplicationService = new PantryApplicationService(new PrismaPantryItemRepository());

export const deletePantryItem = async (id: string): Promise<void> => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await pantryApplicationService.deletePantryItem(id, session.user.id);

    revalidatePath("/[locale]/pantry", "page");
  } catch (error) {
    throw new Error("Failed to delete pantry item", { cause: error });
  }
};
