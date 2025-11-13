"use server";

import { PrismaRecipeRepository } from "~/applications/Recipes/Infrastructure/Repositories/PrismaRecipe.infrastructure";
import { RecipeSharingApplicationService } from "../../../Application/Services/RecipeSharingApplicationService";
import {
  type GetCollaboratorsPayload,
  GetCollaboratorsSchema
} from "../../../Domain/Schemas/RecipeSharing.schema";
import { PrismaRecipeSharingRepository } from "../../../Infrastructure/Repositories/PrismaRecipeSharingRepository";

const recipeSharingService = new RecipeSharingApplicationService(
  new PrismaRecipeRepository(),
  new PrismaRecipeSharingRepository()
);

export async function getCollaborators(recipeId: GetCollaboratorsPayload) {
  try {
    const payload = GetCollaboratorsSchema.parse(recipeId);

    const collaborators = await recipeSharingService.getRecipeCollaborators(payload);
    
    // Convert entities to plain objects for serialization
    return collaborators.map((collaborator) => collaborator.toObject());
  } catch (error) {
    console.error("Failed to retrieve collaborators:", error);
    throw new Error("Failed to retrieve collaborators");
  }
}
