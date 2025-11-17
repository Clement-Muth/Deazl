import { prisma } from "@deazl/system";
import type { Recipe } from "../../Domain/Entities/Recipe.entity";
import { PrismaRecipeRepository } from "../../Infrastructure/Repositories/PrismaRecipe.infrastructure";

export class RecipeRecommendationService {
  private repository: PrismaRecipeRepository;

  constructor() {
    this.repository = new PrismaRecipeRepository();
  }

  async getRecommendedRecipes(userId: string, limit = 10): Promise<Recipe[]> {
    const [userFavorites, userRecipes, userPurchases] = await Promise.all([
      prisma.recipeFavorite.findMany({
        where: { userId },
        include: {
          recipe: true
        },
        take: 20
      }),
      prisma.recipe.findMany({
        where: { userId },
        select: { category: true, cuisine: true, difficulty: true, tags: true }
      }),
      this.getUserRecentPurchases(userId)
    ]);

    const favoriteCategories = this.extractPreferences(userFavorites.map((f) => f.recipe));
    const userPreferences = this.extractPreferences(userRecipes);
    const purchaseBasedCategories = this.extractCategoriesFromPurchases(userPurchases);

    const allPreferredCategories = [
      ...favoriteCategories.categories,
      ...userPreferences.categories,
      ...purchaseBasedCategories
    ];
    const allPreferredCuisines = [...favoriteCategories.cuisines, ...userPreferences.cuisines];
    const allPreferredTags = [...favoriteCategories.tags, ...userPreferences.tags];

    const topCategories = this.getTopN(allPreferredCategories, 3);
    const topCuisines = this.getTopN(allPreferredCuisines, 3);
    const topTags = this.getTopN(allPreferredTags, 5);

    const favoriteRecipeIds = userFavorites.map((f) => f.recipeId);

    const recommendedRecipes = await prisma.recipe.findMany({
      where: {
        isPublic: true,
        id: { notIn: favoriteRecipeIds },
        userId: { not: userId },
        OR: [{ category: { in: topCategories } }, { cuisine: { in: topCuisines } }]
      },
      include: {
        ingredients: {
          include: {
            product: true
          }
        },
        steps: true
      },
      orderBy: [{ favoritesCount: "desc" }, { viewsCount: "desc" }],
      take: limit * 2
    });

    const scoredRecipes = recommendedRecipes.map((recipe) => {
      let score = 0;

      if (topCategories.includes(recipe.category || "")) score += 3;
      if (topCuisines.includes(recipe.cuisine || "")) score += 2;

      return {
        recipe: this.repository.mapToDomain(recipe),
        score
      };
    });

    return scoredRecipes
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.recipe);
  }

  async getRecipesBasedOnPurchases(userId: string, limit = 10): Promise<Recipe[]> {
    const recentPurchases = await this.getUserRecentPurchases(userId);

    if (recentPurchases.length === 0) {
      return [];
    }

    const productIds = recentPurchases.map((p) => p.productId);

    const recipes = await prisma.recipe.findMany({
      where: {
        isPublic: true,
        ingredients: {
          some: {
            productId: { in: productIds }
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

    return recipes.map((r) => this.repository.mapToDomain(r));
  }

  private async getUserRecentPurchases(userId: string) {
    const shoppingLists = await prisma.shoppingList.findMany({
      where: { userId },
      include: {
        items: {
          where: { isCompleted: true },
          include: { product: true }
        }
      },
      orderBy: { updatedAt: "desc" },
      take: 5
    });

    return shoppingLists.flatMap((list) => list.items);
  }

  private extractPreferences(recipes: any[]) {
    const categories: string[] = [];
    const cuisines: string[] = [];
    const tags: string[] = [];

    for (const recipe of recipes) {
      if (recipe.category) categories.push(recipe.category);
      if (recipe.cuisine) cuisines.push(recipe.cuisine);
      if (recipe.tags && Array.isArray(recipe.tags)) {
        tags.push(...recipe.tags);
      }
    }

    return { categories, cuisines, tags };
  }

  private extractCategoriesFromPurchases(purchases: any[]): string[] {
    const categories: string[] = [];

    for (const purchase of purchases) {
      if (purchase.product?.category_id) {
        categories.push(purchase.product.category_id);
      }
    }

    return categories;
  }

  private getTopN(items: string[], n: number): string[] {
    const counts = new Map<string, number>();

    for (const item of items) {
      counts.set(item, (counts.get(item) || 0) + 1);
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([item]) => item);
  }
}
