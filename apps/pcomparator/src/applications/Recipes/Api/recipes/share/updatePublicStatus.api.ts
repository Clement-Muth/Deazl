"use server";

import { auth } from "@deazl/system";
import { z } from "zod";
import { PrismaRecipeRepository } from "~/applications/Recipes/Infrastructure/Repositories/PrismaRecipe.infrastructure";
import { PrismaRecipeSharingRepository } from "../../../Infrastructure/Repositories/PrismaRecipeSharingRepository";

const UpdatePublicStatusSchema = z.object({
  recipeId: z.string().uuid(),
  isPublic: z.boolean()
});

type UpdatePublicStatusPayload = z.infer<typeof UpdatePublicStatusSchema>;

export async function updatePublicStatus(params: UpdatePublicStatusPayload): Promise<void> {
  try {
    const payload = UpdatePublicStatusSchema.parse(params);
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    // Check if user owns the recipe
    const recipeRepository = new PrismaRecipeRepository();
    const recipe = await recipeRepository.findById(payload.recipeId);

    if (!recipe) {
      throw new Error("Recipe not found");
    }

    if (recipe.userId !== session.user.id) {
      throw new Error("Unauthorized - only owner can change public status");
    }

    const sharingRepository = new PrismaRecipeSharingRepository();
    await sharingRepository.updatePublicStatus(payload.recipeId, payload.isPublic);

    // Generate or revoke share token based on public status
    if (payload.isPublic) {
      await sharingRepository.generateShareToken(payload.recipeId);
    }
  } catch (error) {
    throw new Error("Failed to update public status", { cause: error });
  }
}
