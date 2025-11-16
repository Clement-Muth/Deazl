import type { Recipe } from "../Entities/Recipe.entity";
import type { DifficultyLevel } from "../Schemas/Recipe.schema";

export interface RecipeSearchFilters {
  searchTerm?: string;
  category?: string;
  cuisine?: string;
  difficulty?: DifficultyLevel;
  sortBy?: "newest" | "popular" | "favorites";
}

export interface RecipeRepository {
  findById(id: string): Promise<Recipe | null>;
  findManyByUserId(userId: string): Promise<Recipe[]>;
  findManyPublic(): Promise<Recipe[]>;
  searchPublicRecipes(filters: RecipeSearchFilters): Promise<Recipe[]>;
  save(recipe: Recipe): Promise<Recipe>;
  remove(id: string): Promise<void>;
}
