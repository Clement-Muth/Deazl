"use server";

import { auth } from "@deazl/system";
import { RecipeRecommendationService } from "../../Application/Services/RecipeRecommendation.service";
import type { RecipePayload } from "../../Domain/Schemas/Recipe.schema";

const recommendationService = new RecipeRecommendationService();

export const getRecommendedRecipes = async (limit = 10): Promise<RecipePayload[]> => {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const recipes = await recommendationService.getRecommendedRecipes(session.user.id, limit);
    return recipes.map((r) => r.toObject());
  } catch (error) {
    throw new Error("Failed to get recommended recipes", { cause: error });
  }
};

export const getRecipesBasedOnPurchases = async (limit = 10): Promise<RecipePayload[]> => {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const recipes = await recommendationService.getRecipesBasedOnPurchases(session.user.id, limit);
    return recipes.map((r) => r.toObject());
  } catch (error) {
    throw new Error("Failed to get recipes based on purchases", { cause: error });
  }
};
