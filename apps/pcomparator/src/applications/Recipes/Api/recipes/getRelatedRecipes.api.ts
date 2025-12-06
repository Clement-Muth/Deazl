"use server";

import { unstable_cache } from "next/cache";
import { PrismaRecipeRepository } from "../../Infrastructure/Repositories/PrismaRecipe.infrastructure";

const recipeRepository = new PrismaRecipeRepository();

export interface RelatedRecipe {
  id: string;
  name: string;
  imageUrl?: string;
  totalTime: number;
  difficulty: string;
  category?: string;
  cuisine?: string;
  servings: number;
}

export async function getRelatedRecipes(
  recipeId: string,
  options: {
    category?: string | null;
    cuisine?: string | null;
    tags?: string[];
    limit?: number;
  }
): Promise<RelatedRecipe[]> {
  try {
    const { category, cuisine, tags = [], limit = 6 } = options;
    const relatedRecipes: RelatedRecipe[] = [];

    if (category) {
      const byCategory = await recipeRepository.findPublicRecipesByCategory(category, limit);
      for (const recipe of byCategory) {
        if (recipe.id !== recipeId && !relatedRecipes.some((r) => r.id === recipe.id)) {
          relatedRecipes.push({
            id: recipe.id,
            name: recipe.name,
            imageUrl: recipe.imageUrl,
            totalTime: recipe.totalTime,
            difficulty: recipe.difficulty,
            category: recipe.toObject().category || undefined,
            cuisine: recipe.toObject().cuisine || undefined,
            servings: recipe.servings
          });
        }
      }
    }

    if (relatedRecipes.length < limit && cuisine) {
      const byCuisine = await recipeRepository.findPublicRecipesByCuisine(cuisine, limit);
      for (const recipe of byCuisine) {
        if (recipe.id !== recipeId && !relatedRecipes.some((r) => r.id === recipe.id)) {
          relatedRecipes.push({
            id: recipe.id,
            name: recipe.name,
            imageUrl: recipe.imageUrl,
            totalTime: recipe.totalTime,
            difficulty: recipe.difficulty,
            category: recipe.toObject().category || undefined,
            cuisine: recipe.toObject().cuisine || undefined,
            servings: recipe.servings
          });
          if (relatedRecipes.length >= limit) break;
        }
      }
    }

    if (relatedRecipes.length < limit && tags.length > 0) {
      for (const tag of tags) {
        if (relatedRecipes.length >= limit) break;
        const byTag = await recipeRepository.findPublicRecipesByTag(tag, limit);
        for (const recipe of byTag) {
          if (recipe.id !== recipeId && !relatedRecipes.some((r) => r.id === recipe.id)) {
            relatedRecipes.push({
              id: recipe.id,
              name: recipe.name,
              imageUrl: recipe.imageUrl,
              totalTime: recipe.totalTime,
              difficulty: recipe.difficulty,
              category: recipe.toObject().category || undefined,
              cuisine: recipe.toObject().cuisine || undefined,
              servings: recipe.servings
            });
            if (relatedRecipes.length >= limit) break;
          }
        }
      }
    }

    if (relatedRecipes.length < limit) {
      const recent = await recipeRepository.findRecentPublicRecipes(limit);
      for (const recipe of recent) {
        if (recipe.id !== recipeId && !relatedRecipes.some((r) => r.id === recipe.id)) {
          relatedRecipes.push({
            id: recipe.id,
            name: recipe.name,
            imageUrl: recipe.imageUrl,
            totalTime: recipe.totalTime,
            difficulty: recipe.difficulty,
            category: recipe.toObject().category || undefined,
            cuisine: recipe.toObject().cuisine || undefined,
            servings: recipe.servings
          });
          if (relatedRecipes.length >= limit) break;
        }
      }
    }

    return relatedRecipes.slice(0, limit);
  } catch (error) {
    console.error("Failed to get related recipes:", error);
    return [];
  }
}

export async function getRelatedRecipesCached(
  recipeId: string,
  options: {
    category?: string | null;
    cuisine?: string | null;
    tags?: string[];
    limit?: number;
  }
): Promise<RelatedRecipe[]> {
  const { category, cuisine, tags = [], limit = 6 } = options;

  const getCached = unstable_cache(
    async () => getRelatedRecipes(recipeId, options),
    [`related-recipes-${recipeId}-${category || "none"}-${cuisine || "none"}-${tags.join(",")}`],
    {
      revalidate: 3600,
      tags: [`related-recipes-${recipeId}`]
    }
  );

  return getCached();
}
