import { prisma } from "@deazl/system";
import { v4 as uuidv4 } from "uuid";
import { Recipe } from "../../Domain/Entities/Recipe.entity";
import type { RecipeCollaborator, RecipeRole } from "../../Domain/Entities/RecipeCollaborator.entity";
import { RecipeIngredient } from "../../Domain/Entities/RecipeIngredient.entity";
import { RecipeStep } from "../../Domain/Entities/RecipeStep.entity";
import type { RecipeSharingRepository } from "../../Domain/Repositories/RecipeSharingRepository";
import type { DifficultyLevel } from "../../Domain/Schemas/Recipe.schema";
import { RecipeCollaboratorMapper } from "../Mappers/RecipeCollaboratorMapper";

/**
 * Implémentation Prisma du repository pour le partage des recettes
 *
 * Responsabilités (selon les principes DDD) :
 * - Gérer les opérations de partage et collaboration sur les recettes
 * - Persister les collaborateurs et leurs rôles
 * - Gérer les tokens de partage public
 * - Rechercher les utilisateurs pour le partage
 *
 * Ce repository est spécialisé dans les aspects de partage et collaboration
 * et utilise des transactions pour garantir la cohérence des données
 */
export class PrismaRecipeSharingRepository implements RecipeSharingRepository {
  async findUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true }
    });
    return user;
  }

  async findUserById(id: string): Promise<{ id: string; email: string } | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true
      }
    });
  }

  async generateShareToken(recipeId: string): Promise<string> {
    const token = uuidv4();
    await prisma.recipe.update({
      where: { id: recipeId },
      data: { shareToken: token }
    });
    return token;
  }

  async getByShareToken(token: string): Promise<Recipe | null> {
    const recipe = await prisma.recipe.findUnique({
      where: { shareToken: token },
      include: {
        ingredients: {
          include: { product: true }
        },
        steps: true,
        collaborators: {
          include: {
            user: true
          }
        }
      }
    });

    if (!recipe) return null;

    return this.mapToDomain(recipe);
  }

  private mapToDomain(recipeData: any): Recipe {
    const ingredients = recipeData.ingredients.map((ing: any) =>
      RecipeIngredient.create(
        {
          recipeId: recipeData.id,
          productId: ing.product_id,
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

    const collaborators = recipeData.collaborators
      ? recipeData.collaborators.map((c: any) => RecipeCollaboratorMapper.toDomain(c))
      : [];

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
        shareToken: recipeData.shareToken ?? undefined,
        collaborators,
        ingredients,
        steps
      },
      recipeData.id
    );
  }

  async updatePublicStatus(recipeId: string, isPublic: boolean): Promise<void> {
    await prisma.recipe.update({
      where: { id: recipeId },
      data: { isPublic }
    });
  }

  async addCollaborator(recipeId: string, email: string, role: RecipeRole): Promise<RecipeCollaborator> {
    try {
      // First find the user by email
      const user = await this.findUserByEmail(email);
      if (!user) {
        throw new Error(`User with email ${email} not found`);
      }

      // Use a transaction to ensure all operations complete or none do
      const collaborator = await prisma.$transaction(async (tx) => {
        // Check if the user is already a collaborator
        const existingCollaborator = await tx.recipeCollaborator.findFirst({
          where: {
            recipeId: recipeId,
            userId: user.id
          }
        });

        if (existingCollaborator) {
          // If they are, update their role instead of creating a new collaboration
          const updated = await tx.recipeCollaborator.update({
            where: { id: existingCollaborator.id },
            data: { role },
            include: { user: true }
          });
          return updated;
        }

        // Add the user as a collaborator if they don't exist
        return tx.recipeCollaborator.create({
          data: {
            id: uuidv4(),
            recipeId: recipeId,
            userId: user.id,
            role
          },
          include: {
            user: true
          }
        });
      });

      return RecipeCollaboratorMapper.toDomain(collaborator);
    } catch (error) {
      console.error("Error in addCollaborator:", error);
      throw new Error(
        `Failed to add collaborator: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async removeCollaborator(recipeId: string, userId: string): Promise<void> {
    await prisma.recipeCollaborator.deleteMany({
      where: {
        recipeId,
        userId
      }
    });
  }

  async updateCollaboratorRole(recipeId: string, userId: string, role: RecipeRole): Promise<void> {
    await prisma.recipeCollaborator.updateMany({
      where: {
        recipeId,
        userId
      },
      data: { role }
    });
  }

  async getCollaborators(recipeId: string): Promise<RecipeCollaborator[]> {
    const collaborators = await prisma.recipeCollaborator.findMany({
      where: { recipeId },
      include: { user: true }
    });

    return collaborators.map((c) => RecipeCollaboratorMapper.toDomain(c));
  }
}
