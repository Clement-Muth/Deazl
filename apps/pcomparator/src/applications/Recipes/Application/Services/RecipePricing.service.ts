import { prisma } from "@deazl/system";
import type { Recipe } from "../../Domain/Entities/Recipe.entity";
import { PrismaRecipeRepository } from "../../Infrastructure/Repositories/PrismaRecipe.infrastructure";

export interface RecipePricingResult {
  recipeId: string;
  recipeName: string;
  totalPrice: number;
  pricePerServing: number;
  currency: string;
  storeId?: string;
  storeName?: string;
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
    price: number;
    productId?: string;
    hasPrice: boolean;
  }[];
  missingPrices: number;
  priceQuality: "excellent" | "good" | "average" | "poor";
}

export class RecipePricingService {
  private repository: PrismaRecipeRepository;

  constructor() {
    this.repository = new PrismaRecipeRepository();
  }

  async calculateRecipePrice(
    recipeId: string,
    storeId?: string,
    userLocation?: { latitude: number; longitude: number }
  ): Promise<RecipePricingResult> {
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        ingredients: {
          include: {
            product: {
              include: {
                prices: {
                  where: storeId ? { store_id: storeId } : undefined,
                  orderBy: { date_recorded: "desc" },
                  take: 1
                }
              }
            }
          }
        }
      }
    });

    if (!recipe) {
      throw new Error("Recipe not found");
    }

    let totalPrice = 0;
    let missingPrices = 0;
    const ingredientsWithPrices = recipe.ingredients.map((ingredient) => {
      const latestPrice = ingredient.product.prices[0];
      const hasPrice = !!latestPrice;

      if (!hasPrice) {
        missingPrices++;
      }

      const ingredientPrice = hasPrice ? latestPrice.amount * ingredient.quantity : 0;
      totalPrice += ingredientPrice;

      return {
        name: ingredient.product.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        price: ingredientPrice,
        productId: ingredient.product.id,
        hasPrice
      };
    });

    const pricePerServing = totalPrice / recipe.servings;

    const priceQuality =
      missingPrices === 0
        ? "excellent"
        : missingPrices <= recipe.ingredients.length * 0.2
          ? "good"
          : missingPrices <= recipe.ingredients.length * 0.5
            ? "average"
            : "poor";

    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      totalPrice,
      pricePerServing,
      currency: "EUR",
      ingredients: ingredientsWithPrices,
      missingPrices,
      priceQuality
    };
  }

  async getCheapRecipes(limit = 10, maxPricePerServing?: number): Promise<Recipe[]> {
    const recipes = await prisma.recipe.findMany({
      where: {
        isPublic: true
      },
      include: {
        ingredients: {
          include: {
            product: {
              include: {
                prices: {
                  orderBy: { date_recorded: "desc" },
                  take: 1
                }
              }
            }
          }
        },
        steps: true
      },
      take: 100
    });

    const recipesWithPrices = await Promise.all(
      recipes.map(async (recipe) => {
        try {
          const pricing = await this.calculateRecipePrice(recipe.id);
          return {
            recipe: this.repository.mapToDomain(recipe),
            pricePerServing: pricing.pricePerServing,
            priceQuality: pricing.priceQuality
          };
        } catch {
          return null;
        }
      })
    );

    return recipesWithPrices
      .filter((item) => item !== null && item.priceQuality !== "poor")
      .filter((item) => !maxPricePerServing || (item && item.pricePerServing <= maxPricePerServing))
      .sort((a, b) => (a && b ? a.pricePerServing - b.pricePerServing : 0))
      .slice(0, limit)
      .map((item) => item!.recipe);
  }

  async compareStoresForRecipe(
    recipeId: string,
    userLocation?: { latitude: number; longitude: number }
  ): Promise<RecipePricingResult[]> {
    const stores = await prisma.store.findMany({
      select: { id: true, name: true, location: true }
    });

    const results = await Promise.all(
      stores.map(async (store) => {
        try {
          const pricing = await this.calculateRecipePrice(recipeId, store.id, userLocation);
          return {
            ...pricing,
            storeId: store.id,
            storeName: store.name
          };
        } catch {
          return null;
        }
      })
    );

    return results.filter((r) => r !== null).sort((a, b) => a.totalPrice - b.totalPrice);
  }
}
