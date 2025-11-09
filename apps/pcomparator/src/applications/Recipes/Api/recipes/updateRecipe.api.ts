"use server";

import { RecipeApplicationService } from "../../Application/Services/Recipe.service";
import type { RecipePayload, UpdateRecipePayload } from "../../Domain/Schemas/Recipe.schema";
import { UpdateRecipeSchema } from "../../Domain/Schemas/Recipe.schema";
import { PrismaRecipeRepository } from "../../Infrastructure/Repositories/PrismaRecipe.infrastructure";

const recipeApplicationService = new RecipeApplicationService(new PrismaRecipeRepository());

export const updateRecipe = async (recipeId: string, params: UpdateRecipePayload): Promise<RecipePayload> => {
  try {
    const payload = UpdateRecipeSchema.parse(params);

    const recipe = await recipeApplicationService.updateRecipe(recipeId, payload);

    return recipe.toObject();
  } catch (error) {
    throw new Error("Failed to update recipe", { cause: error });
  }
};
