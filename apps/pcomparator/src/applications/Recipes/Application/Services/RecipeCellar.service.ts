import { prisma } from "@deazl/system";
import type { Recipe } from "../../Domain/Entities/Recipe.entity";
import { PrismaRecipeRepository } from "../../Infrastructure/Repositories/PrismaRecipe.infrastructure";

export class RecipeCellarService {
  private repository: PrismaRecipeRepository;

  constructor() {
    this.repository = new PrismaRecipeRepository();
  }

  async getRecipesFeasibleWithCellar(userId: string, limit = 10): Promise<Recipe[]> {
    const pantryItems = await prisma.pantryItem.findMany({
      where: { userId },
      include: { product: true }
    });

    const pantryProductIds = pantryItems.map((item) => item.productId).filter((id) => id !== null);

    if (pantryProductIds.length === 0) {
      return [];
    }

    const recipes = await prisma.recipe.findMany({
      where: {
        isPublic: true,
        ingredients: {
          some: {
            productId: { in: pantryProductIds }
          }
        }
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

    const recipesWithFeasibility = recipes.map((recipe) => {
      const totalIngredients = recipe.ingredients.length;
      const availableIngredients = recipe.ingredients.filter((ingredient) =>
        pantryProductIds.includes(ingredient.productId)
      ).length;

      const feasibilityScore = (availableIngredients / totalIngredients) * 100;

      return {
        recipe: this.repository["mapToDomain"](recipe),
        feasibilityScore,
        availableIngredients,
        totalIngredients,
        missingIngredients: totalIngredients - availableIngredients
      };
    });

    return recipesWithFeasibility
      .filter((item) => item.feasibilityScore >= 50)
      .sort((a, b) => b.feasibilityScore - a.feasibilityScore)
      .slice(0, limit)
      .map((item) => item.recipe);
  }

  async checkRecipeFeasibility(recipeId: string, userId: string) {
    const [recipe, pantryItems] = await Promise.all([
      prisma.recipe.findUnique({
        where: { id: recipeId },
        include: {
          ingredients: {
            include: {
              product: true
            }
          }
        }
      }),
      prisma.pantryItem.findMany({
        where: { userId },
        include: { product: true }
      })
    ]);

    if (!recipe) {
      throw new Error("Recipe not found");
    }

    const pantryProductIds = pantryItems.map((item) => item.productId).filter((id) => id !== null);

    const ingredientStatus = recipe.ingredients.map((ingredient) => {
      const isAvailable = pantryProductIds.includes(ingredient.productId);
      const pantryItem = pantryItems.find((item) => item.productId === ingredient.productId);

      return {
        ingredient: ingredient.product.name,
        required: ingredient.quantity,
        unit: ingredient.unit,
        isAvailable,
        inStock: pantryItem?.quantity || 0,
        needsToBuy: !isAvailable || (pantryItem && pantryItem.quantity < ingredient.quantity)
      };
    });

    const availableCount = ingredientStatus.filter((i) => i.isAvailable).length;
    const totalCount = ingredientStatus.length;
    const feasibilityPercentage = (availableCount / totalCount) * 100;

    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      feasibilityPercentage,
      totalIngredients: totalCount,
      availableIngredients: availableCount,
      missingIngredients: totalCount - availableCount,
      ingredients: ingredientStatus,
      canMakeWithCurrentStock: feasibilityPercentage === 100
    };
  }

  async suggestRecipesBasedOnExpiringItems(userId: string, daysThreshold = 7, limit = 10): Promise<Recipe[]> {
    const expiringItems = await prisma.pantryItem.findMany({
      where: {
        userId,
        expiration: {
          lte: new Date(Date.now() + daysThreshold * 24 * 60 * 60 * 1000)
        }
      },
      include: { product: true }
    });

    if (expiringItems.length === 0) {
      return [];
    }

    const expiringProductIds = expiringItems.map((item) => item.productId).filter((id) => id !== null);

    const recipes = await prisma.recipe.findMany({
      where: {
        isPublic: true,
        ingredients: {
          some: {
            productId: { in: expiringProductIds }
          }
        }
      },
      include: {
        ingredients: {
          include: {
            product: true
          }
        },
        steps: true
      },
      orderBy: { viewsCount: "desc" },
      take: limit
    });

    return recipes.map((r) => this.repository["mapToDomain"](r));
  }
}
