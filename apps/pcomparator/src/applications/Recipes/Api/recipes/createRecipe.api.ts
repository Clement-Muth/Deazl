"use server";

import { RecipeApplicationService } from "../../Application/Services/Recipe.service";
import type { CreateRecipePayload, RecipePayload } from "../../Domain/Schemas/Recipe.schema";
import { CreateRecipeSchema } from "../../Domain/Schemas/Recipe.schema";
import { PrismaRecipeRepository } from "../../Infrastructure/Repositories/PrismaRecipe.infrastructure";

const recipeApplicationService = new RecipeApplicationService(new PrismaRecipeRepository());

export const createRecipe = async (params: CreateRecipePayload): Promise<RecipePayload> => {
  try {
    const payload = CreateRecipeSchema.parse(params);

    const recipe = await recipeApplicationService.createRecipe(payload);

    return recipe.toObject();
  } catch (error) {
    throw new Error("Failed to create recipe", { cause: error });
  }
};
