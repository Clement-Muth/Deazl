"use server";

import { auth } from "@deazl/system";
import {
  type GenerateShareLinkPayload,
  GenerateShareLinkSchema
} from "../../../Domain/Schemas/ShoppingListSharing.schema";
import { PrismaShoppingListRepository } from "../../../Infrastructure/Repositories/PrismaShoppingList.infrastructure";
import { PrismaShoppingListSharingRepository } from "../../../Infrastructure/Repositories/PrismaShoppingListSharing.infrastructure";

export const generateShareLink = async (shoppingListId: GenerateShareLinkPayload) => {
  try {
    const payload = GenerateShareLinkSchema.parse(shoppingListId);
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    // Check if user owns the list
    const listRepository = new PrismaShoppingListRepository();
    const list = await listRepository.findById(payload);

    if (!list) {
      throw new Error("Shopping list not found");
    }

    if (list.userId !== session.user.id) {
      throw new Error("Unauthorized - only owner can generate share link");
    }

    // Generate or get existing token
    const sharingRepository = new PrismaShoppingListSharingRepository();
    const token = await sharingRepository.generateShareToken(payload);

    const baseUrl = process.env.PCOMPARATOR_PUBLIC_URL || "https://deazl.fr";
    return `${baseUrl}/shared/shopping-list/${token}`;
  } catch (error) {
    console.error("Error generating share link:", error);
    throw new Error("Failed to generate share link", { cause: error });
  }
};
