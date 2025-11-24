"use server";

import { revalidatePath } from "next/cache";
import { RecipeApplicationService } from "../../Application/Services/Recipe.service";
import type { DeleteRecipePayload } from "../../Domain/Schemas/Recipe.schema";
import { DeleteRecipeSchema } from "../../Domain/Schemas/Recipe.schema";
import { PrismaRecipeRepository } from "../../Infrastructure/Repositories/PrismaRecipe.infrastructure";

const recipeApplicationService = new RecipeApplicationService(new PrismaRecipeRepository());

export const deleteRecipe = async (recipeId: DeleteRecipePayload): Promise<void> => {
  try {
    const validatedId = DeleteRecipeSchema.parse(recipeId);

    await recipeApplicationService.deleteRecipe(validatedId);

    revalidatePath(`/recipes/${validatedId}`);
    revalidatePath("/recipes");
  } catch (error) {
    throw new Error("Failed to delete recipe", { cause: error });
  }
};
