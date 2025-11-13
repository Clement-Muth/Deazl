"use server";

import { auth } from "@deazl/system";
import { PrismaRecipeRepository } from "~/applications/Recipes/Infrastructure/Repositories/PrismaRecipe.infrastructure";
import {
  type AddCollaboratorPayload,
  AddCollaboratorSchema
} from "../../../Domain/Schemas/RecipeSharing.schema";
import { PrismaRecipeSharingRepository } from "../../../Infrastructure/Repositories/PrismaRecipeSharingRepository";

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

    // Check if user owns or can share the recipe
    const recipeRepository = new PrismaRecipeRepository();
    const recipe = await recipeRepository.findById(payload.recipeId);

    if (!recipe) {
      return { success: false, error: "UNKNOWN", message: "Recipe not found" };
    }

    if (recipe.userId !== session.user.id) {
      return { success: false, error: "UNAUTHORIZED", message: "Only owner can add collaborators" };
    }

    const sharingRepository = new PrismaRecipeSharingRepository();

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
    const existingCollaborators = await sharingRepository.getCollaborators(payload.recipeId);
    const isAlreadyCollaborator = existingCollaborators.some((c: any) => c.userId === targetUser.id);

    if (isAlreadyCollaborator) {
      return {
        success: false,
        error: "ALREADY_COLLABORATOR",
        message: "This user is already a collaborator"
      };
    }

    // Add collaborator
    await sharingRepository.addCollaborator(payload.recipeId, payload.email, payload.role as any);

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
