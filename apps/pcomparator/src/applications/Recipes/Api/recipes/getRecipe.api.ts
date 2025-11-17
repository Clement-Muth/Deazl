"use server";

import { RecipeApplicationService } from "../../Application/Services/Recipe.service";
import type { GetRecipePayload, RecipePayload } from "../../Domain/Schemas/Recipe.schema";
import { GetRecipeSchema } from "../../Domain/Schemas/Recipe.schema";
import { PrismaRecipeRepository } from "../../Infrastructure/Repositories/PrismaRecipe.infrastructure";

const recipeApplicationService = new RecipeApplicationService(new PrismaRecipeRepository());

export const getRecipe = async (recipeId: GetRecipePayload): Promise<RecipePayload | null> => {
  try {
    const validatedId = GetRecipeSchema.parse(recipeId);

    const recipe = await recipeApplicationService.getRecipe(validatedId);

    console.log("recipe ingredients", recipe?.ingredients);
    return recipe ? recipe.toObject() : null;
  } catch (error) {
    throw new Error("Failed to get recipe", { cause: error });
  }
};
