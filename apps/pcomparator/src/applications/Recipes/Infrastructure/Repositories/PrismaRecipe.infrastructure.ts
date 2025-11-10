import { prisma } from "@deazl/system";
import { Recipe } from "../../Domain/Entities/Recipe.entity";
import { RecipeIngredient } from "../../Domain/Entities/RecipeIngredient.entity";
import { RecipeStep } from "../../Domain/Entities/RecipeStep.entity";
import type { RecipeRepository } from "../../Domain/Repositories/RecipeRepository";
import type { DifficultyLevel } from "../../Domain/Schemas/Recipe.schema";

export class PrismaRecipeRepository implements RecipeRepository {
  async findById(id: string): Promise<Recipe | null> {
    try {
      const recipeData = await prisma.recipe.findUnique({
        where: { id },
        include: {
          ingredients: {
            include: { product: true },
            orderBy: { order: "asc" }
          },
          steps: {
            orderBy: { stepNumber: "asc" }
          }
        }
      });

      if (!recipeData) return null;

      return this.mapToDomain(recipeData);
    } catch (error) {
      throw new Error("Failed to find recipe by ID");
    }
  }

  async findManyByUserId(userId: string): Promise<Recipe[]> {
    try {
      const recipesData = await prisma.recipe.findMany({
        where: { userId },
        include: {
          ingredients: {
            include: { product: true },
            orderBy: { order: "asc" }
          },
          steps: {
            orderBy: { stepNumber: "asc" }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      return recipesData.map((recipeData) => this.mapToDomain(recipeData));
    } catch (error) {
      throw new Error("Failed to find recipes by user ID");
    }
  }

  async findManyPublic(): Promise<Recipe[]> {
    try {
      const recipesData = await prisma.recipe.findMany({
        where: { isPublic: true },
        include: {
          ingredients: {
            include: { product: true },
            orderBy: { order: "asc" }
          },
          steps: {
            orderBy: { stepNumber: "asc" }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      return recipesData.map((recipeData) => this.mapToDomain(recipeData));
    } catch (error) {
      throw new Error("Failed to find public recipes");
    }
  }

  async save(recipe: Recipe): Promise<Recipe> {
    try {
      console.log("test", prisma);

      const existingRecipe = await prisma.recipe.findUnique({
        where: { id: recipe.id }
      });

      if (existingRecipe) {
        await prisma.$transaction(async (tx) => {
          await tx.recipeIngredient.deleteMany({
            where: { recipeId: recipe.id }
          });

          await tx.recipeStep.deleteMany({
            where: { recipeId: recipe.id }
          });

          await tx.recipe.update({
            where: { id: recipe.id },
            data: {
              name: recipe.name,
              description: recipe.description ?? null,
              difficulty: recipe.difficulty,
              preparationTime: recipe.preparationTime,
              cookingTime: recipe.cookingTime,
              servings: recipe.servings,
              imageUrl: recipe.imageUrl ?? null,
              isPublic: recipe.isPublic,
              updatedAt: new Date()
            }
          });

          if (recipe.ingredients.length > 0) {
            await tx.recipeIngredient.createMany({
              data: recipe.ingredients.map((ing) => ({
                id: ing.id,
                recipeId: recipe.id,
                productId: ing.productId,
                quantity: ing.quantity,
                unit: ing.unit,
                order: ing.order
              }))
            });
          }

          if (recipe.steps.length > 0) {
            await tx.recipeStep.createMany({
              data: recipe.steps.map((step) => ({
                id: step.id,
                recipeId: recipe.id,
                stepNumber: step.stepNumber,
                description: step.description,
                duration: step.duration ?? null
              }))
            });
          }
        });
      } else {
        await prisma.$transaction(async (tx) => {
          await tx.recipe.create({
            data: {
              id: recipe.id,
              name: recipe.name,
              description: recipe.description ?? null,
              difficulty: recipe.difficulty,
              preparationTime: recipe.preparationTime,
              cookingTime: recipe.cookingTime,
              servings: recipe.servings,
              imageUrl: recipe.imageUrl ?? null,
              userId: recipe.userId,
              isPublic: recipe.isPublic,
              createdAt: recipe.createdAt,
              updatedAt: recipe.updatedAt
            }
          });

          if (recipe.ingredients.length > 0) {
            await tx.recipeIngredient.createMany({
              data: recipe.ingredients.map((ing) => ({
                id: ing.id,
                recipeId: recipe.id,
                productId: ing.productId,
                quantity: ing.quantity,
                unit: ing.unit,
                order: ing.order
              }))
            });
          }

          if (recipe.steps.length > 0) {
            await tx.recipeStep.createMany({
              data: recipe.steps.map((step) => ({
                id: step.id,
                recipeId: recipe.id,
                stepNumber: step.stepNumber,
                description: step.description,
                duration: step.duration ?? null
              }))
            });
          }
        });
      }

      return this.findById(recipe.id) as Promise<Recipe>;
    } catch (error) {
      throw new Error("Failed to save recipe");
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await prisma.recipe.delete({
        where: { id }
      });
    } catch (error) {
      throw new Error("Failed to remove recipe");
    }
  }

  private mapToDomain(recipeData: any): Recipe {
    const ingredients = recipeData.ingredients.map((ing: any) =>
      RecipeIngredient.create(
        {
          recipeId: recipeData.id,
          productId: ing.productId,
          productName: ing.product?.name,
          quantity: ing.quantity,
          unit: ing.unit,
          order: ing.order
        },
        ing.id
      )
    );

    const steps = recipeData.steps.map((step: any) =>
      RecipeStep.create(
        {
          recipeId: recipeData.id,
          stepNumber: step.stepNumber,
          description: step.description,
          duration: step.duration ?? undefined
        },
        step.id
      )
    );

    return Recipe.create(
      {
        name: recipeData.name,
        description: recipeData.description ?? undefined,
        difficulty: recipeData.difficulty as DifficultyLevel,
        preparationTime: recipeData.preparationTime,
        cookingTime: recipeData.cookingTime,
        servings: recipeData.servings,
        imageUrl: recipeData.imageUrl ?? undefined,
        userId: recipeData.userId,
        isPublic: recipeData.isPublic,
        ingredients,
        steps
      },
      recipeData.id
    );
  }
}
