import type { Recipe } from "../Entities/Recipe.entity";
import type { RecipePayload } from "../Schemas/Recipe.schema";
import type { DifficultyLevel } from "../Schemas/Recipe.schema";

export interface RecipeSearchFilters {
  searchTerm?: string;
  category?: string;
  cuisine?: string;
  difficulty?: DifficultyLevel;
  sortBy?: "newest" | "popular" | "favorites" | "trending";
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface RecipeAccessContext {
  userId?: string;
  shareToken?: string;
  isAuthenticated: boolean;
}

export interface RecipeTrendingData {
  recipe: RecipePayload;
  trendingScore: number;
  viewsLast7Days: number;
  favoritesLast7Days: number;
}

export interface RecipeRepository {
  findById(id: string): Promise<Recipe | null>;
  findManyByUserId(userId: string): Promise<Recipe[]>;
  findManyPublic(): Promise<Recipe[]>;
  searchPublicRecipes(filters: RecipeSearchFilters): Promise<Recipe[]>;
  save(recipe: Recipe): Promise<Recipe>;
  remove(id: string): Promise<void>;

  findByShareToken(token: string): Promise<Recipe | null>;

  findPublicRecipes(filters: RecipeSearchFilters): Promise<Recipe[]>;

  findTrendingPublicRecipes(limit?: number): Promise<RecipeTrendingData[]>;

  findRecentPublicRecipes(limit?: number): Promise<Recipe[]>;

  findPublicRecipesByCategory(category: string, limit?: number): Promise<Recipe[]>;

  findPublicRecipesByCuisine(cuisine: string, limit?: number): Promise<Recipe[]>;

  findPublicRecipesByTag(tag: string, limit?: number): Promise<Recipe[]>;

  checkUserAccess(
    recipeId: string,
    context: RecipeAccessContext
  ): Promise<{
    hasAccess: boolean;
    recipe: Recipe | null;
    reason?: "public" | "owner" | "collaborator" | "share_token" | "private" | "not_found";
  }>;

  incrementViews(recipeId: string): Promise<void>;

  countPublicRecipes(): Promise<number>;

  getPublicCategories(): Promise<Array<{ category: string; count: number }>>;

  getPublicCuisines(): Promise<Array<{ cuisine: string; count: number }>>;

  getPopularTags(limit?: number): Promise<Array<{ tag: string; count: number }>>;
}
