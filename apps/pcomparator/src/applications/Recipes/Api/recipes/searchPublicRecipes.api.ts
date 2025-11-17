"use server";

import { RecipeApplicationService } from "../../Application/Services/Recipe.service";
import type { DifficultyLevel, RecipePayload } from "../../Domain/Schemas/Recipe.schema";
import { PrismaRecipeRepository } from "../../Infrastructure/Repositories/PrismaRecipe.infrastructure";

const recipeApplicationService = new RecipeApplicationService(new PrismaRecipeRepository());

export interface SearchPublicRecipesFilters {
  searchTerm?: string;
  category?: string;
  cuisine?: string;
  difficulty?: DifficultyLevel;
  sortBy?: "newest" | "popular" | "favorites";
}

export const searchPublicRecipes = async (filters: SearchPublicRecipesFilters): Promise<RecipePayload[]> => {
  try {
    const recipes = await recipeApplicationService.searchPublicRecipes(filters);

    return recipes.map((recipe) => recipe.toObject());
  } catch (error) {
    throw new Error("Failed to search public recipes", { cause: error });
  }
};
