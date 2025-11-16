import { prisma } from "@deazl/system";
import type { Recipe } from "../../Domain/Entities/Recipe.entity";
import type { DifficultyLevel } from "../../Domain/Schemas/Recipe.schema";
import { PrismaRecipeRepository } from "../../Infrastructure/Repositories/PrismaRecipe.infrastructure";

export interface RecipeSearchFilters {
  searchTerm?: string;
  category?: string | string[];
  cuisine?: string | string[];
  tags?: string[];
  difficulty?: DifficultyLevel | DifficultyLevel[];
  maxPreparationTime?: number;
  maxCookingTime?: number;
  maxTotalTime?: number;
  minServings?: number;
  maxServings?: number;
  isVegan?: boolean;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
  sortBy?: "newest" | "popular" | "favorites" | "quickest" | "cheapest" | "healthiest";
  limit?: number;
  offset?: number;
}

export class RecipeSearchService {
  private repository: PrismaRecipeRepository;

  constructor() {
    this.repository = new PrismaRecipeRepository();
  }

  async searchRecipes(filters: RecipeSearchFilters, userId?: string): Promise<Recipe[]> {
    const {
      searchTerm,
      category,
      cuisine,
      tags,
      difficulty,
      maxPreparationTime,
      maxCookingTime,
      maxTotalTime,
      minServings,
      maxServings,
      isVegan,
      isVegetarian,
      isGlutenFree,
      isDairyFree,
      sortBy = "popular",
      limit = 20,
      offset = 0
    } = filters;

    const where: any = {
      isPublic: true
    };

    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } }
      ];
    }

    if (category) {
      if (Array.isArray(category)) {
        where.category = { in: category, mode: "insensitive" };
      } else {
        where.category = { equals: category, mode: "insensitive" };
      }
    }

    if (cuisine) {
      if (Array.isArray(cuisine)) {
        where.cuisine = { in: cuisine, mode: "insensitive" };
      } else {
        where.cuisine = { equals: cuisine, mode: "insensitive" };
      }
    }

    if (difficulty) {
      if (Array.isArray(difficulty)) {
        where.difficulty = { in: difficulty };
      } else {
        where.difficulty = difficulty;
      }
    }

    if (maxPreparationTime) {
      where.preparationTime = { lte: maxPreparationTime };
    }

    if (maxCookingTime) {
      where.cookingTime = { lte: maxCookingTime };
    }

    if (maxTotalTime) {
      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          {
            preparationTime: { lte: maxTotalTime }
          },
          {
            cookingTime: { lte: maxTotalTime }
          }
        ]
      });
    }

    if (minServings) {
      where.servings = { ...where.servings, gte: minServings };
    }

    if (maxServings) {
      where.servings = { ...where.servings, lte: maxServings };
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    if (isVegan) {
      where.tags = { has: "vegan" };
    }

    if (isVegetarian) {
      where.tags = { has: "vegetarian" };
    }

    if (isGlutenFree) {
      where.tags = { has: "gluten-free" };
    }

    if (isDairyFree) {
      where.tags = { has: "dairy-free" };
    }

    const orderBy: any = [];

    switch (sortBy) {
      case "newest":
        orderBy.push({ createdAt: "desc" });
        break;
      case "popular":
        orderBy.push({ viewsCount: "desc" });
        break;
      case "favorites":
        orderBy.push({ favoritesCount: "desc" });
        break;
      case "quickest":
        orderBy.push({ preparationTime: "asc" });
        orderBy.push({ cookingTime: "asc" });
        break;
      default:
        orderBy.push({ viewsCount: "desc" });
    }

    const recipes = await prisma.recipe.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      include: {
        ingredients: {
          include: {
            product: true
          }
        },
        steps: true,
        favorites: userId ? { where: { userId } } : false
      }
    });

    return recipes.map((r) => this.repository["mapToDomain"](r));
  }

  async getPopularRecipes(limit = 10): Promise<Recipe[]> {
    const recipes = await prisma.recipe.findMany({
      where: { isPublic: true },
      orderBy: [{ viewsCount: "desc" }, { favoritesCount: "desc" }],
      take: limit,
      include: {
        ingredients: { include: { product: true } },
        steps: true
      }
    });

    return recipes.map((r) => this.repository["mapToDomain"](r));
  }

  async getQuickRecipes(maxMinutes = 30, limit = 10): Promise<Recipe[]> {
    const recipes = await prisma.recipe.findMany({
      where: {
        isPublic: true,
        preparationTime: { lte: maxMinutes }
      },
      orderBy: [{ preparationTime: "asc" }, { viewsCount: "desc" }],
      take: limit,
      include: {
        ingredients: { include: { product: true } },
        steps: true
      }
    });

    return recipes.map((r) => this.repository["mapToDomain"](r));
  }

  async getHealthyRecipes(limit = 10): Promise<Recipe[]> {
    const recipes = await prisma.recipe.findMany({
      where: {
        isPublic: true,
        tags: { hasSome: ["healthy", "vegan", "vegetarian", "low-calorie"] }
      },
      orderBy: [{ favoritesCount: "desc" }, { viewsCount: "desc" }],
      take: limit,
      include: {
        ingredients: { include: { product: true } },
        steps: true
      }
    });

    return recipes.map((r) => this.repository["mapToDomain"](r));
  }

  async getNewRecipes(limit = 10): Promise<Recipe[]> {
    const recipes = await prisma.recipe.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        ingredients: { include: { product: true } },
        steps: true
      }
    });

    return recipes.map((r) => this.repository["mapToDomain"](r));
  }

  async getRecipesByCategory(category: string, limit = 10): Promise<Recipe[]> {
    const recipes = await prisma.recipe.findMany({
      where: {
        isPublic: true,
        category: { equals: category, mode: "insensitive" }
      },
      orderBy: { viewsCount: "desc" },
      take: limit,
      include: {
        ingredients: { include: { product: true } },
        steps: true
      }
    });

    return recipes.map((r) => this.repository["mapToDomain"](r));
  }
}
