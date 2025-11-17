"use server";

import { RecipeApplicationService } from "../../Application/Services/Recipe.service";
import type { RecipePayload } from "../../Domain/Schemas/Recipe.schema";
import { PrismaRecipeRepository } from "../../Infrastructure/Repositories/PrismaRecipe.infrastructure";

const recipeApplicationService = new RecipeApplicationService(new PrismaRecipeRepository());

export const listPublicRecipes = async (limit = 6): Promise<RecipePayload[]> => {
  try {
    const recipes = await recipeApplicationService.listPublicRecipes();

    return recipes.slice(0, limit).map((recipe) => recipe.toObject());
  } catch (error) {
    throw new Error("Failed to list public recipes", { cause: error });
  }
};
