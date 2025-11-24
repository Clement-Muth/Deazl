import { v4 as uuidv4 } from "uuid";
import { AuthenticationService } from "~/applications/Shared/Application/Services/Authentication.service";
import { DomainError } from "~/applications/Shared/Domain/Core/DomainError";
import { DataAccessError } from "~/applications/Shared/Domain/Core/Errors/ApplicationErrors";
import { IngredientGroup } from "../../Domain/Entities/IngredientGroup.entity";
import { Recipe } from "../../Domain/Entities/Recipe.entity";
import { RecipeIngredient } from "../../Domain/Entities/RecipeIngredient.entity";
import { RecipeStep } from "../../Domain/Entities/RecipeStep.entity";
import { StepGroup } from "../../Domain/Entities/StepGroup.entity";
import type { RecipeRepository, RecipeSearchFilters } from "../../Domain/Repositories/RecipeRepository";
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

  async searchPublicRecipes(filters: RecipeSearchFilters): Promise<Recipe[]> {
    try {
      const recipes = await this.repository.searchPublicRecipes(filters);

      return recipes;
    } catch (error) {
      if (error instanceof DomainError) throw error;

      throw new DataAccessError(
        "Failed to search public recipes",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async getRecipe(recipeId: GetRecipePayload): Promise<Recipe | null> {
    try {
      const currentUser: any = await this.authService.getCurrentUser();

      const recipe = await this.repository.findById(recipeId);

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
        category: data.category,
        cuisine: data.cuisine,
        userId: currentUser.id,
        isPublic: data.isPublic
      });

      const savedRecipe = await this.repository.save(recipe);

      const allIngredients: RecipeIngredient[] = [];
      let ingredientGroups: IngredientGroup[] = [];

      if (data.ingredientGroups && data.ingredientGroups.length > 0) {
        ingredientGroups = data.ingredientGroups.map((group, groupIndex) => {
          const groupId = uuidv4();

          const groupIngredients = group.ingredients.map((ing, ingIndex) =>
            RecipeIngredient.create({
              recipeId: savedRecipe.id,
              productId: ing.productId,
              productName: ing.productName,
              quantity: ing.quantity,
              unit: ing.unit,
              order: ing.order ?? ingIndex,
              groupId
            })
          );

          allIngredients.push(...groupIngredients);

          return IngredientGroup.create(
            {
              recipeId: savedRecipe.id,
              name: group.name,
              order: group.order ?? groupIndex,
              ingredients: groupIngredients
            },
            groupId
          );
        });
      }

      if (data.ingredients && data.ingredients.length > 0) {
        const flatIngredients = data.ingredients.map((ing, index) =>
          RecipeIngredient.create({
            recipeId: savedRecipe.id,
            productId: ing.productId,
            productName: ing.productName,
            quantity: ing.quantity,
            unit: ing.unit,
            order: ing.order ?? index,
            groupId: ing.groupId
          })
        );
        allIngredients.push(...flatIngredients);
      }

      const allSteps: RecipeStep[] = [];
      let stepGroups: StepGroup[] = [];

      if (data.stepGroups && data.stepGroups.length > 0) {
        stepGroups = data.stepGroups.map((group, groupIndex) => {
          const groupId = uuidv4();

          const groupSteps = group.steps.map((step) =>
            RecipeStep.create({
              recipeId: savedRecipe.id,
              stepNumber: step.stepNumber,
              description: step.description,
              duration: step.duration ?? undefined,
              groupId
            })
          );

          allSteps.push(...groupSteps);

          return StepGroup.create(
            {
              recipeId: savedRecipe.id,
              name: group.name,
              order: group.order ?? groupIndex,
              steps: groupSteps
            },
            groupId
          );
        });
      }

      if (data.steps && data.steps.length > 0) {
        const flatSteps = data.steps.map((step) =>
          RecipeStep.create({
            recipeId: savedRecipe.id,
            stepNumber: step.stepNumber,
            description: step.description,
            duration: step.duration ?? undefined,
            groupId: step.groupId
          })
        );
        allSteps.push(...flatSteps);
      }

      const recipeWithDetails = savedRecipe
        .withIngredients(allIngredients)
        .withSteps(allSteps)
        .withIngredientGroups(ingredientGroups)
        .withStepGroups(stepGroups);

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
        category: data.category === null ? undefined : data.category,
        cuisine: data.cuisine === null ? undefined : data.cuisine,
        isPublic: data.isPublic
      };

      let updatedRecipe = recipe.withUpdates(cleanedData);

      const allIngredients: RecipeIngredient[] = [];
      let ingredientGroups: IngredientGroup[] = [];

      if (data.ingredientGroups && data.ingredientGroups.length > 0) {
        ingredientGroups = data.ingredientGroups.map((group, groupIndex) => {
          const groupId = group.id ?? uuidv4();

          const groupIngredients = group.ingredients.map((ing, ingIndex) =>
            RecipeIngredient.create({
              recipeId: recipe.id,
              productId: ing.productId,
              productName: ing.productName,
              quantity: ing.quantity,
              unit: ing.unit,
              order: ing.order ?? ingIndex,
              groupId
            })
          );

          allIngredients.push(...groupIngredients);

          return IngredientGroup.create(
            {
              recipeId: recipe.id,
              name: group.name,
              order: group.order ?? groupIndex,
              ingredients: groupIngredients
            },
            groupId
          );
        });
        updatedRecipe = updatedRecipe.withIngredientGroups(ingredientGroups);
      }

      if (data.ingredients && data.ingredients.length > 0) {
        const flatIngredients = data.ingredients.map((ing, index) =>
          RecipeIngredient.create({
            recipeId: recipe.id,
            productId: ing.productId,
            productName: ing.productName,
            quantity: ing.quantity,
            unit: ing.unit,
            order: ing.order ?? index,
            groupId: ing.groupId
          })
        );
        allIngredients.push(...flatIngredients);
      }

      if (allIngredients.length > 0) {
        updatedRecipe = updatedRecipe.withIngredients(allIngredients);
      }

      const allSteps: RecipeStep[] = [];
      let stepGroups: StepGroup[] = [];

      if (data.stepGroups && data.stepGroups.length > 0) {
        stepGroups = data.stepGroups.map((group, groupIndex) => {
          const groupId = group.id ?? uuidv4();

          const groupSteps = group.steps.map((step) =>
            RecipeStep.create({
              recipeId: recipe.id,
              stepNumber: step.stepNumber,
              description: step.description,
              duration: step.duration ?? undefined,
              groupId
            })
          );

          allSteps.push(...groupSteps);

          return StepGroup.create(
            {
              recipeId: recipe.id,
              name: group.name,
              order: group.order ?? groupIndex,
              steps: groupSteps
            },
            groupId
          );
        });
        updatedRecipe = updatedRecipe.withStepGroups(stepGroups);
      }

      if (data.steps && data.steps.length > 0) {
        const flatSteps = data.steps.map((step) =>
          RecipeStep.create({
            recipeId: recipe.id,
            stepNumber: step.stepNumber,
            description: step.description,
            duration: step.duration ?? undefined,
            groupId: step.groupId
          })
        );
        allSteps.push(...flatSteps);
      }

      if (allSteps.length > 0) {
        updatedRecipe = updatedRecipe.withSteps(allSteps);
      }

      return this.repository.save(updatedRecipe);
    } catch (error) {
      if (error instanceof DomainError) throw error;

      throw new Error("Unexpected error updating recipe", { cause: error });
    }
  }
}
