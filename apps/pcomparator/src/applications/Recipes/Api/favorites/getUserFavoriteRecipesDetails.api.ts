"use server";

import { auth, prisma } from "@deazl/system";
import type { RecipePayload } from "../../Domain/Schemas/Recipe.schema";
import { PrismaRecipeRepository } from "../../Infrastructure/Repositories/PrismaRecipe.infrastructure";

export const getUserFavoriteRecipesDetails = async (): Promise<RecipePayload[]> => {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const favorites = await prisma.recipeFavorite.findMany({
      where: { userId: session.user.id },
      select: { recipeId: true },
      orderBy: { createdAt: "desc" }
    });

    const recipeIds = favorites.map((f) => f.recipeId);
    if (recipeIds.length === 0) return [];

    const repository = new PrismaRecipeRepository();
    const recipes = await Promise.all(
      recipeIds.map(async (id) => {
        const recipe = await repository.findById(id);
        return recipe?.toObject();
      })
    );

    return recipes.filter((r) => r !== undefined) as RecipePayload[];
  } catch (error) {
    throw new Error("Failed to get user favorite recipes details", { cause: error });
  }
};
