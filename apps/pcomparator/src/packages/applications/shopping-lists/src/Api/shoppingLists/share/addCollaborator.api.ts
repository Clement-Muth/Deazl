"use server";

import { auth } from "@deazl/system";
import {
  type AddCollaboratorPayload,
  AddCollaboratorSchema
} from "../../../Domain/Schemas/ShoppingListSharing.schema";
import { PrismaShoppingListRepository } from "../../../Infrastructure/Repositories/PrismaShoppingList.infrastructure";
import { PrismaShoppingListSharingRepository } from "../../../Infrastructure/Repositories/PrismaShoppingListSharing.infrastructure";

export async function addCollaborator(params: AddCollaboratorPayload): Promise<{
  success: boolean;
  error?: "USER_NOT_FOUND" | "UNAUTHORIZED" | "ALREADY_COLLABORATOR" | "UNKNOWN";
  message?: string;
}> {
  try {
    const payload = AddCollaboratorSchema.parse(params);
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "UNAUTHORIZED", message: "User not authenticated" };
    }

    // Check if user owns or can share the list
    const listRepository = new PrismaShoppingListRepository();
    const list = await listRepository.findById(payload.shoppingListId);

    if (!list) {
      return { success: false, error: "UNKNOWN", message: "Shopping list not found" };
    }

    if (list.userId !== session.user.id) {
      return { success: false, error: "UNAUTHORIZED", message: "Only owner can add collaborators" };
    }

    const sharingRepository = new PrismaShoppingListSharingRepository();

    // Check if user exists
    const targetUser = await sharingRepository.findUserByEmail(payload.email);
    if (!targetUser) {
      return {
        success: false,
        error: "USER_NOT_FOUND",
        message: `No account found with email: ${payload.email}`
      };
    }

    // Check if user is already a collaborator
    const existingCollaborators = await sharingRepository.getCollaborators(payload.shoppingListId);
    const isAlreadyCollaborator = existingCollaborators.some((c: any) => c.userId === targetUser.id);

    if (isAlreadyCollaborator) {
      return {
        success: false,
        error: "ALREADY_COLLABORATOR",
        message: "This user is already a collaborator"
      };
    }

    // Add collaborator
    await sharingRepository.addCollaborator(payload.shoppingListId, payload.email, payload.role as any);

    return { success: true };
  } catch (error) {
    console.error("Error in addCollaborator:", error);
    return {
      success: false,
      error: "UNKNOWN",
      message: error instanceof Error ? error.message : "Failed to add collaborator"
    };
  }
}
