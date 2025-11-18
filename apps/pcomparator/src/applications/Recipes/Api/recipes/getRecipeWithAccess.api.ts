"use server";

import { auth } from "@deazl/system";
import { RecipeAccessApplicationService } from "~/applications/Recipes/Application/Services/RecipeAccess.service";
import { PrismaRecipeRepository } from "~/applications/Recipes/Infrastructure/Repositories/PrismaRecipe.infrastructure";

const recipeRepository = new PrismaRecipeRepository();
const accessService = new RecipeAccessApplicationService(recipeRepository);

export async function getRecipeWithAccess(recipeId: string, shareToken?: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const result = await accessService.getRecipeWithAccessCheck(recipeId, {
      userId,
      shareToken,
      isAuthenticated: !!userId
    });

    if (!result.hasAccess) {
      return {
        recipe: null,
        hasAccess: false,
        mode: result.mode,
        reason: result.reason,
        requiresLogin: result.requiresLogin
      };
    }

    return {
      recipe: result.recipe?.toObject(),
      hasAccess: true,
      mode: result.mode,
      reason: result.reason,
      requiresLogin: false
    };
  } catch (error) {
    console.error("Failed to get recipe with access check:", error);
    throw new Error("Failed to load recipe");
  }
}

export async function getRecipeByShareToken(shareToken: string) {
  try {
    const recipe = await accessService.getRecipeByShareToken(shareToken);

    if (!recipe) {
      return null;
    }

    return recipe.toObject();
  } catch (error) {
    console.error("Failed to get recipe by share token:", error);
    throw new Error("Failed to load shared recipe");
  }
}

export async function checkRecipeAccess(recipeId: string, shareToken?: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const hasAccess = await accessService.canUserViewRecipe(recipeId, userId, shareToken);

    return { hasAccess };
  } catch (error) {
    console.error("Failed to check recipe access:", error);
    return { hasAccess: false };
  }
}

export async function canUserModifyRecipe(recipeId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { canModify: false };
    }

    const canModify = await accessService.canUserModifyRecipe(recipeId, userId);

    return { canModify };
  } catch (error) {
    console.error("Failed to check if user can modify recipe:", error);
    return { canModify: false };
  }
}
