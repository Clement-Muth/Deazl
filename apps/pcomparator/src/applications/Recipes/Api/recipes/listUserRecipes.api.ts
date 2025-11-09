"use server";

import { RecipeApplicationService } from "../../Application/Services/Recipe.service";
import type { RecipePayload } from "../../Domain/Schemas/Recipe.schema";
import { PrismaRecipeRepository } from "../../Infrastructure/Repositories/PrismaRecipe.infrastructure";

const recipeApplicationService = new RecipeApplicationService(new PrismaRecipeRepository());

export const listUserRecipes = async (): Promise<RecipePayload[]> => {
  try {
    const recipes = await recipeApplicationService.listUserRecipes();

    return recipes.map((recipe) => recipe.toObject());
  } catch (error) {
    throw new Error("Failed to list user recipes", { cause: error });
  }
};
