"use server";

import { auth, prisma } from "@deazl/system";
import { Recipe } from "../../Domain/Entities/Recipe.entity";
import { RecipeIngredient } from "../../Domain/Entities/RecipeIngredient.entity";
import { RecipeStep } from "../../Domain/Entities/RecipeStep.entity";
import type { DifficultyLevel } from "../../Domain/Schemas/Recipe.schema";

const mapToDomain = (recipeData: any): Recipe => {
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
      category: recipeData.category ?? undefined,
      cuisine: recipeData.cuisine ?? undefined,
      viewsCount: recipeData.viewsCount ?? 0,
      favoritesCount: recipeData.favoritesCount ?? 0,
      userId: recipeData.userId,
      isPublic: recipeData.isPublic,
      ingredients,
      steps,
      estimatedQualityScore: recipeData.estimatedQualityScore ?? undefined
    },
    recipeData.id
  );
};

export const getUserRecipes = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const recipes = await prisma.recipe.findMany({
    where: {
      userId: session.user.id
    },
    include: {
      ingredients: {
        include: { product: true },
        orderBy: { order: "asc" }
      },
      steps: {
        orderBy: { stepNumber: "asc" }
      },
      favorites: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return recipes.map((recipe) => mapToDomain(recipe).toObject());
};

export const getUserFavoriteRecipes = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const recipes = await prisma.recipe.findMany({
    where: {
      favorites: {
        some: {
          userId: session.user.id
        }
      }
    },
    include: {
      ingredients: {
        include: { product: true },
        orderBy: { order: "asc" }
      },
      steps: {
        orderBy: { stepNumber: "asc" }
      },
      favorites: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return recipes.map((recipe) => mapToDomain(recipe).toObject());
};

export const toggleRecipeFavorite = async (recipeId: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Check if favorite exists
  const existingFavorite = await prisma.recipeFavorite.findUnique({
    where: {
      userId_recipeId: {
        userId,
        recipeId
      }
    }
  });

  if (existingFavorite) {
    // Remove favorite
    await prisma.recipeFavorite.delete({
      where: {
        userId_recipeId: {
          userId,
          recipeId
        }
      }
    });

    // Decrement favoritesCount
    await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        favoritesCount: {
          decrement: 1
        }
      }
    });

    return { isFavorite: false };
  }

  // Add favorite
  await prisma.recipeFavorite.create({
    data: {
      userId,
      recipeId
    }
  });

  // Increment favoritesCount
  await prisma.recipe.update({
    where: { id: recipeId },
    data: {
      favoritesCount: {
        increment: 1
      }
    }
  });

  return { isFavorite: true };
};

export const checkRecipeFavorite = async (recipeId: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    return false;
  }

  const favorite = await prisma.recipeFavorite.findUnique({
    where: {
      userId_recipeId: {
        userId: session.user.id,
        recipeId
      }
    }
  });

  return !!favorite;
};
