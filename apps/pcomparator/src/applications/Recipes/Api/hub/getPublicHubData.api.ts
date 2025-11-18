"use server";

import { PublicRecipeHubApplicationService } from "~/applications/Recipes/Application/Services/PublicRecipeHub.service";
import type { RecipeSearchFilters } from "~/applications/Recipes/Domain/Repositories/RecipeRepository";
import { PrismaRecipeRepository } from "~/applications/Recipes/Infrastructure/Repositories/PrismaRecipe.infrastructure";

const recipeRepository = new PrismaRecipeRepository();
const publicHubService = new PublicRecipeHubApplicationService(recipeRepository);

export async function getPublicHubData(options?: {
  trendingLimit?: number;
  recentLimit?: number;
  tagsLimit?: number;
}) {
  try {
    return await publicHubService.getPublicHubData(options);
  } catch (error) {
    console.error("Failed to get public hub data:", error);
    throw new Error("Failed to load public recipes hub");
  }
}

export async function getTrendingRecipes(limit = 12) {
  try {
    return await publicHubService.getTrendingRecipes(limit);
  } catch (error) {
    console.error("Failed to get trending recipes:", error);
    throw new Error("Failed to load trending recipes");
  }
}

export async function getRecentRecipes(limit = 12) {
  try {
    return await publicHubService.getRecentRecipes(limit);
  } catch (error) {
    console.error("Failed to get recent recipes:", error);
    throw new Error("Failed to load recent recipes");
  }
}

export async function getRecipesByCategory(category: string, limit = 20) {
  try {
    return await publicHubService.getRecipesByCategory(category, limit);
  } catch (error) {
    console.error("Failed to get recipes by category:", error);
    throw new Error("Failed to load recipes by category");
  }
}

export async function getRecipesByCuisine(cuisine: string, limit = 20) {
  try {
    return await publicHubService.getRecipesByCuisine(cuisine, limit);
  } catch (error) {
    console.error("Failed to get recipes by cuisine:", error);
    throw new Error("Failed to load recipes by cuisine");
  }
}

export async function getRecipesByTag(tag: string, limit = 20) {
  try {
    return await publicHubService.getRecipesByTag(tag, limit);
  } catch (error) {
    console.error("Failed to get recipes by tag:", error);
    throw new Error("Failed to load recipes by tag");
  }
}

export async function searchPublicRecipes(filters: RecipeSearchFilters) {
  try {
    return await publicHubService.searchPublicRecipes(filters);
  } catch (error) {
    console.error("Failed to search public recipes:", error);
    throw new Error("Failed to search recipes");
  }
}

export async function getPublicCategories() {
  try {
    return await publicHubService.getPublicCategories();
  } catch (error) {
    console.error("Failed to get public categories:", error);
    throw new Error("Failed to load categories");
  }
}

export async function getPublicCuisines() {
  try {
    return await publicHubService.getPublicCuisines();
  } catch (error) {
    console.error("Failed to get public cuisines:", error);
    throw new Error("Failed to load cuisines");
  }
}

export async function getPopularTags(limit = 20) {
  try {
    return await publicHubService.getPopularTags(limit);
  } catch (error) {
    console.error("Failed to get popular tags:", error);
    throw new Error("Failed to load tags");
  }
}
