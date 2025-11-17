"use server";

import { PrismaClient } from "@prisma/client";
import { RecipeComputeQualityService } from "../../Domain/Services/RecipeComputeQuality.service";
import type {
  ProductWithQuality,
  RecipeQualityResult
} from "../../Domain/Services/RecipeComputeQuality.service";
import { PrismaRecipeRepository } from "../../Infrastructure/Repositories/PrismaRecipe.infrastructure";

const prisma = new PrismaClient();

/**
 * Calcule la qualité nutritionnelle d'une recette avec recommandations
 *
 * @param recipeId - ID de la recette
 * @returns Résultat détaillé de qualité avec recommandations
 */
export async function getRecipeQuality(recipeId: string): Promise<RecipeQualityResult | { error: string }> {
  try {
    // 1. Récupérer la recette avec ses ingrédients
    const recipeRepository = new PrismaRecipeRepository();
    const recipe = await recipeRepository.findById(recipeId);

    if (!recipe) {
      return { error: "Recette introuvable" };
    }

    if (recipe.ingredients.length === 0) {
      return { error: "La recette ne contient aucun ingrédient" };
    }

    // 2. Récupérer les produits avec leurs données nutritionnelles
    const productIds = recipe.ingredients.map((ing) => ing.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        nutrition_score: true
      }
    });

    // 3. Mapper vers ProductWithQuality
    const productsWithQuality: ProductWithQuality[] = products.map((p) => ({
      id: p.id,
      name: p.name,
      nutrition_score: p.nutrition_score,
      qualityData: RecipeComputeQualityService.parseQualityData(p.nutrition_score)
    }));

    // 4. Calculer la qualité
    const qualityResult = RecipeComputeQualityService.computeRecipeQuality(
      recipe.ingredients,
      productsWithQuality
    );

    return qualityResult;
  } catch (error) {
    console.error("Erreur lors du calcul de qualité:", error);
    return { error: "Erreur lors du calcul de la qualité de la recette" };
  }
}
