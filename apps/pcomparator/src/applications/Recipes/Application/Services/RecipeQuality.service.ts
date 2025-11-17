import { prisma } from "@deazl/system";
import type { Recipe } from "../../Domain/Entities/Recipe.entity";
import { PrismaRecipeRepository } from "../../Infrastructure/Repositories/PrismaRecipe.infrastructure";

export interface RecipeQualityScore {
  recipeId: string;
  recipeName: string;
  overallScore: number;
  nutritionScore?: number;
  ingredientQualityScore: number;
  diversityScore: number;
  healthBadges: string[];
  warnings: string[];
  details: {
    hasAdditives: boolean;
    hasUltraProcessed: boolean;
    isOrganic: boolean;
    caloriesPerServing?: number;
    proteinPerServing?: number;
    carbsPerServing?: number;
    fatPerServing?: number;
  };
}

export class RecipeQualityService {
  private repository: PrismaRecipeRepository;

  constructor() {
    this.repository = new PrismaRecipeRepository();
  }

  async calculateRecipeQuality(recipeId: string): Promise<RecipeQualityScore> {
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        ingredients: {
          include: {
            product: true
          }
        }
      }
    });

    if (!recipe) {
      throw new Error("Recipe not found");
    }

    let totalNutritionScore = 0;
    let ingredientsWithNutrition = 0;
    let hasAdditives = false;
    let hasUltraProcessed = false;
    let isOrganic = true;

    const warnings: string[] = [];
    const healthBadges: string[] = [];

    for (const ingredient of recipe.ingredients) {
      const nutritionData = ingredient.product.nutrition_score as any;

      if (nutritionData) {
        if (nutritionData.nutrition_grade) {
          const gradeScore = this.convertNutritionGradeToScore(nutritionData.nutrition_grade);
          totalNutritionScore += gradeScore;
          ingredientsWithNutrition++;
        }

        if (nutritionData.additives_n && nutritionData.additives_n > 0) {
          hasAdditives = true;
          warnings.push(`Contains ${nutritionData.additives_n} additives`);
        }

        if (nutritionData.nova_group && nutritionData.nova_group >= 3) {
          hasUltraProcessed = true;
          warnings.push("Contains ultra-processed ingredients");
        }

        if (!nutritionData.labels?.includes("organic")) {
          isOrganic = false;
        }
      }
    }

    const avgNutritionScore =
      ingredientsWithNutrition > 0 ? totalNutritionScore / ingredientsWithNutrition : 50;

    const ingredientQualityScore = avgNutritionScore;

    const uniqueIngredients = new Set(recipe.ingredients.map((i) => i.product.category_id)).size;
    const diversityScore = Math.min((uniqueIngredients / recipe.ingredients.length) * 100, 100);

    const overallScore =
      (ingredientQualityScore * 0.6 + diversityScore * 0.4) * (hasUltraProcessed ? 0.8 : 1);

    if (recipe.tags.includes("vegan")) healthBadges.push("Vegan");
    if (recipe.tags.includes("vegetarian")) healthBadges.push("Vegetarian");
    if (recipe.tags.includes("gluten-free")) healthBadges.push("Gluten-Free");
    if (recipe.tags.includes("dairy-free")) healthBadges.push("Dairy-Free");
    if (recipe.tags.includes("low-calorie")) healthBadges.push("Low Calorie");
    if (isOrganic) healthBadges.push("Organic");
    if (!hasAdditives) healthBadges.push("No Additives");

    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      overallScore: Math.round(overallScore),
      nutritionScore: Math.round(avgNutritionScore),
      ingredientQualityScore: Math.round(ingredientQualityScore),
      diversityScore: Math.round(diversityScore),
      healthBadges,
      warnings,
      details: {
        hasAdditives,
        hasUltraProcessed,
        isOrganic
      }
    };
  }

  private convertNutritionGradeToScore(grade: string): number {
    const gradeMap: Record<string, number> = {
      a: 100,
      b: 80,
      c: 60,
      d: 40,
      e: 20
    };

    return gradeMap[grade.toLowerCase()] || 50;
  }

  async getHealthyRecipes(limit = 10, minQualityScore = 70): Promise<Recipe[]> {
    const recipes = await prisma.recipe.findMany({
      where: {
        isPublic: true,
        tags: { hasSome: ["healthy", "vegan", "vegetarian", "low-calorie", "gluten-free"] }
      },
      include: {
        ingredients: {
          include: {
            product: true
          }
        },
        steps: true
      },
      take: 50
    });

    const recipesWithQuality = await Promise.all(
      recipes.map(async (recipe) => {
        try {
          const quality = await this.calculateRecipeQuality(recipe.id);
          return {
            recipe: this.repository.mapToDomain(recipe),
            qualityScore: quality.overallScore
          };
        } catch {
          return null;
        }
      })
    );

    return recipesWithQuality
      .filter((item) => item !== null && item.qualityScore >= minQualityScore)
      .sort((a, b) => (a && b ? b.qualityScore - a.qualityScore : 0))
      .slice(0, limit)
      .map((item) => item!.recipe);
  }
}
