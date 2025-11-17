"use server";

import {
  type GetRecipeByShareTokenPayload,
  GetRecipeByShareTokenSchema
} from "../../../Domain/Schemas/RecipeSharing.schema";
import { PrismaRecipeSharingRepository } from "../../../Infrastructure/Repositories/PrismaRecipeSharingRepository";

const sharingRepository = new PrismaRecipeSharingRepository();

export async function getRecipeByShareToken(token: GetRecipeByShareTokenPayload) {
  try {
    const payload = GetRecipeByShareTokenSchema.parse(token);

    const recipe = await sharingRepository.getByShareToken(payload);

    if (!recipe) {
      throw new Error("Recipe not found");
    }

    const recipeObject = recipe.toObject();

    // Convert dates to ISO strings for serialization
    return {
      ...recipeObject,
      createdAt: recipeObject.createdAt?.toISOString(),
      updatedAt: recipeObject.updatedAt?.toISOString()
    };
  } catch (error) {
    console.error("Failed to get recipe by share token:", error);
    throw new Error("Failed to get recipe by share token");
  }
}
