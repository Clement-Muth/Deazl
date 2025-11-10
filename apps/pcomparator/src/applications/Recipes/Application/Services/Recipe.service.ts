import { AuthenticationService, DataAccessError, DomainError } from "@deazl/shared";
import { Recipe } from "../../Domain/Entities/Recipe.entity";
import { RecipeIngredient } from "../../Domain/Entities/RecipeIngredient.entity";
import { RecipeStep } from "../../Domain/Entities/RecipeStep.entity";
import type { RecipeRepository } from "../../Domain/Repositories/RecipeRepository";
import type {
  CreateRecipePayload,
  DeleteRecipePayload,
  GetRecipePayload,
  UpdateRecipePayload
} from "../../Domain/Schemas/Recipe.schema";

export class RecipeApplicationService {
  private readonly authService: AuthenticationService;

  constructor(private readonly repository: RecipeRepository) {
    this.authService = new AuthenticationService();
  }

  async listUserRecipes(): Promise<Recipe[]> {
    try {
      const currentUser: any = await this.authService.getCurrentUser();

      const recipes = await this.repository.findManyByUserId(currentUser.id);

      return recipes;
    } catch (error) {
      if (error instanceof DomainError) throw error;

      throw new DataAccessError(
        "Failed to list user recipes",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async listPublicRecipes(): Promise<Recipe[]> {
    try {
      const recipes = await this.repository.findManyPublic();

      return recipes;
    } catch (error) {
      if (error instanceof DomainError) throw error;

      throw new DataAccessError(
        "Failed to list public recipes",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async getRecipe(recipeId: GetRecipePayload): Promise<Recipe | null> {
    try {
      const currentUser: any = await this.authService.getCurrentUser();

      const recipe = await this.repository.findById(recipeId);

      console.log("Fetched recipe:", recipe?.ingredients.at(0));

      if (!recipe) return null;

      if (!recipe.canUserView(currentUser.id)) {
        throw new Error("Recipe not found or you do not have access to it");
      }

      return recipe;
    } catch (error) {
      if (error instanceof DomainError) throw error;

      throw new Error("Unexpected error retrieving recipe", { cause: error });
    }
  }

  async createRecipe(data: CreateRecipePayload): Promise<Recipe> {
    try {
      const currentUser: any = await this.authService.getCurrentUser();

      const recipe = Recipe.create({
        name: data.name,
        description: data.description,
        difficulty: data.difficulty,
        preparationTime: data.preparationTime,
        cookingTime: data.cookingTime,
        servings: data.servings,
        imageUrl: data.imageUrl ?? undefined,
        userId: currentUser.id,
        isPublic: data.isPublic
      });

      const savedRecipe = await this.repository.save(recipe);

      const ingredients = data.ingredients.map((ing, index) =>
        RecipeIngredient.create({
          recipeId: savedRecipe.id,
          productId: ing.productId,
          productName: ing.productName,
          quantity: ing.quantity,
          unit: ing.unit,
          order: ing.order ?? index
        })
      );

      const steps = data.steps.map((step) =>
        RecipeStep.create({
          recipeId: savedRecipe.id,
          stepNumber: step.stepNumber,
          description: step.description,
          duration: step.duration ?? undefined
        })
      );

      const recipeWithDetails = savedRecipe.withIngredients(ingredients).withSteps(steps);

      return this.repository.save(recipeWithDetails);
    } catch (error) {
      if (error instanceof DomainError) throw error;

      throw new Error("Unexpected error creating recipe", { cause: error });
    }
  }

  async deleteRecipe(recipeId: DeleteRecipePayload): Promise<void> {
    try {
      const currentUser: any = await this.authService.getCurrentUser();

      const recipe = await this.repository.findById(recipeId);

      if (!recipe) throw new Error("Recipe not found");

      if (!recipe.isOwner(currentUser.id)) throw new Error("Unauthorized - only owner can delete recipe");

      await this.repository.remove(recipeId);
    } catch (error) {
      if (error instanceof DomainError) throw error;

      throw new Error("Unexpected error deleting recipe", { cause: error });
    }
  }

  async updateRecipe(recipeId: string, data: UpdateRecipePayload): Promise<Recipe> {
    try {
      const currentUser: any = await this.authService.getCurrentUser();

      const recipe = await this.repository.findById(recipeId);

      if (!recipe) throw new Error("Recipe not found");

      if (!recipe.canUserModify(currentUser.id)) {
        throw new Error("Unauthorized - insufficient permissions to modify recipe");
      }

      const cleanedData = {
        name: data.name,
        description: data.description === null ? undefined : data.description,
        difficulty: data.difficulty,
        preparationTime: data.preparationTime,
        cookingTime: data.cookingTime,
        servings: data.servings,
        imageUrl: data.imageUrl === null ? undefined : data.imageUrl,
        isPublic: data.isPublic
      };

      let updatedRecipe = recipe.withUpdates(cleanedData);

      if (data.ingredients) {
        const ingredients = data.ingredients.map((ing, index) =>
          RecipeIngredient.create({
            recipeId: recipe.id,
            productId: ing.productId,
            productName: ing.productName,
            quantity: ing.quantity,
            unit: ing.unit,
            order: ing.order ?? index
          })
        );
        updatedRecipe = updatedRecipe.withIngredients(ingredients);
      }

      if (data.steps) {
        const steps = data.steps.map((step) =>
          RecipeStep.create({
            recipeId: recipe.id,
            stepNumber: step.stepNumber,
            description: step.description,
            duration: step.duration ?? undefined
          })
        );
        updatedRecipe = updatedRecipe.withSteps(steps);
      }

      return this.repository.save(updatedRecipe);
    } catch (error) {
      if (error instanceof DomainError) throw error;

      throw new Error("Unexpected error updating recipe", { cause: error });
    }
  }
}
