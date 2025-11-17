"use server";

import { auth } from "@deazl/system";
import { RecipePricingService } from "../../Application/Services/RecipePricing.service";
import type { RecipePayload } from "../../Domain/Schemas/Recipe.schema";

const pricingService = new RecipePricingService();

export const getCheapRecipes = async (limit = 10, maxPricePerServing?: number): Promise<RecipePayload[]> => {
  try {
    const recipes = await pricingService.getCheapRecipes(limit, maxPricePerServing);
    return recipes.map((r) => r.toObject());
  } catch (error) {
    throw new Error("Failed to get cheap recipes", { cause: error });
  }
};

export const calculateRecipePrice = async (recipeId: string, storeId?: string) => {
  try {
    const session = await auth();
    const userLocation = undefined;

    return await pricingService.calculateRecipePrice(recipeId, storeId, userLocation);
  } catch (error) {
    throw new Error("Failed to calculate recipe price", { cause: error });
  }
};

export const compareStoresForRecipe = async (recipeId: string) => {
  try {
    const session = await auth();
    const userLocation = undefined;

    return await pricingService.compareStoresForRecipe(recipeId, userLocation);
  } catch (error) {
    throw new Error("Failed to compare stores for recipe", { cause: error });
  }
};
