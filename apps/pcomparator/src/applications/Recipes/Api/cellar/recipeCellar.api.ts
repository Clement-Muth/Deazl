"use server";

import { auth } from "@deazl/system";
import { RecipeCellarService } from "../../Application/Services/RecipeCellar.service";
import type { RecipePayload } from "../../Domain/Schemas/Recipe.schema";

const cellarService = new RecipeCellarService();

export const getRecipesFeasibleWithCellar = async (limit = 10): Promise<RecipePayload[]> => {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const recipes = await cellarService.getRecipesFeasibleWithCellar(session.user.id, limit);
    return recipes.map((r) => r.toObject());
  } catch (error) {
    throw new Error("Failed to get recipes feasible with cellar", { cause: error });
  }
};

export const checkRecipeFeasibility = async (recipeId: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    return await cellarService.checkRecipeFeasibility(recipeId, session.user.id);
  } catch (error) {
    throw new Error("Failed to check recipe feasibility", { cause: error });
  }
};

export const suggestRecipesBasedOnExpiringItems = async (
  daysThreshold = 7,
  limit = 10
): Promise<RecipePayload[]> => {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const recipes = await cellarService.suggestRecipesBasedOnExpiringItems(
      session.user.id,
      daysThreshold,
      limit
    );
    return recipes.map((r) => r.toObject());
  } catch (error) {
    throw new Error("Failed to suggest recipes based on expiring items", { cause: error });
  }
};
