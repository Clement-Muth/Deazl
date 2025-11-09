import type { Recipe } from "../Entities/Recipe.entity";

export interface RecipeRepository {
  findById(id: string): Promise<Recipe | null>;
  findManyByUserId(userId: string): Promise<Recipe[]>;
  findManyPublic(): Promise<Recipe[]>;
  save(recipe: Recipe): Promise<Recipe>;
  remove(id: string): Promise<void>;
}
