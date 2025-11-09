"use server";

import { PrismaRecipeRepository } from "~/applications/Recipes/Infrastructure/Repositories/PrismaRecipe.infrastructure";
import { RecipeSharingApplicationService } from "../../../Application/Services/RecipeSharingApplicationService";
import {
  type AddCollaboratorPayload,
  AddCollaboratorSchema
} from "../../../Domain/Schemas/RecipeSharing.schema";
import { PrismaRecipeSharingRepository } from "../../../Infrastructure/Repositories/PrismaRecipeSharingRepository";

const recipeSharingService = new RecipeSharingApplicationService(
  new PrismaRecipeRepository(),
  new PrismaRecipeSharingRepository()
);

export async function addCollaborator(params: AddCollaboratorPayload): Promise<void> {
  try {
    const payload = AddCollaboratorSchema.parse(params);

    await recipeSharingService.shareRecipe(payload);
  } catch (error) {
    console.error("Failed to add collaborator:", error);
    throw new Error("Failed to add collaborator");
  }
}
