"use server";

import { PrismaRecipeRepository } from "~/applications/Recipes/Infrastructure/Repositories/PrismaRecipe.infrastructure";
import { RecipeSharingApplicationService } from "../../../Application/Services/RecipeSharingApplicationService";
import {
  type RemoveCollaboratorPayload,
  RemoveCollaboratorSchema
} from "../../../Domain/Schemas/RecipeSharing.schema";
import { PrismaRecipeSharingRepository } from "../../../Infrastructure/Repositories/PrismaRecipeSharingRepository";

const recipeSharingService = new RecipeSharingApplicationService(
  new PrismaRecipeRepository(),
  new PrismaRecipeSharingRepository()
);

export async function removeCollaborator(params: RemoveCollaboratorPayload): Promise<void> {
  try {
    const payload = RemoveCollaboratorSchema.parse(params);

    await recipeSharingService.removeCollaborator(payload.recipeId, payload.userId);
  } catch (error) {
    console.error("Failed to remove collaborator:", error);
    throw new Error("Failed to remove collaborator");
  }
}
