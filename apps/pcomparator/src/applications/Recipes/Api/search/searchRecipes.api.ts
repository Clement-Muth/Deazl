"use server";

import { auth } from "@deazl/system";
import type { RecipeSearchFilters } from "../../Application/Services/RecipeSearch.service";
import { RecipeSearchService } from "../../Application/Services/RecipeSearch.service";
import type { RecipePayload } from "../../Domain/Schemas/Recipe.schema";

const searchService = new RecipeSearchService();

export const searchRecipes = async (filters: RecipeSearchFilters): Promise<RecipePayload[]> => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const recipes = await searchService.searchRecipes(filters, userId);

    return recipes.map((r) => r.toObject());
  } catch (error) {
    throw new Error("Failed to search recipes", { cause: error });
  }
};

export const getPopularRecipes = async (limit = 10): Promise<RecipePayload[]> => {
  try {
    const recipes = await searchService.getPopularRecipes(limit);
    return recipes.map((r) => r.toObject());
  } catch (error) {
    throw new Error("Failed to get popular recipes", { cause: error });
  }
};

export const getQuickRecipes = async (maxMinutes = 30, limit = 10): Promise<RecipePayload[]> => {
  try {
    const recipes = await searchService.getQuickRecipes(maxMinutes, limit);
    return recipes.map((r) => r.toObject());
  } catch (error) {
    throw new Error("Failed to get quick recipes", { cause: error });
  }
};

export const getHealthyRecipes = async (limit = 10): Promise<RecipePayload[]> => {
  try {
    const recipes = await searchService.getHealthyRecipes(limit);
    return recipes.map((r) => r.toObject());
  } catch (error) {
    throw new Error("Failed to get healthy recipes", { cause: error });
  }
};

export const getNewRecipes = async (limit = 10): Promise<RecipePayload[]> => {
  try {
    const recipes = await searchService.getNewRecipes(limit);
    return recipes.map((r) => r.toObject());
  } catch (error) {
    throw new Error("Failed to get new recipes", { cause: error });
  }
};

export const getRecipesByCategory = async (category: string, limit = 10): Promise<RecipePayload[]> => {
  try {
    const recipes = await searchService.getRecipesByCategory(category, limit);
    return recipes.map((r) => r.toObject());
  } catch (error) {
    throw new Error("Failed to get recipes by category", { cause: error });
  }
};
