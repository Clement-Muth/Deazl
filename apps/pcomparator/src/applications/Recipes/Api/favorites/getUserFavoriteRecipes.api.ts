"use server";

import { auth, prisma } from "@deazl/system";

export const getUserFavoriteRecipes = async (): Promise<string[]> => {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const favorites = await prisma.recipeFavorite.findMany({
      where: { userId: session.user.id },
      select: { recipeId: true }
    });

    return favorites.map((f) => f.recipeId);
  } catch (error) {
    throw new Error("Failed to get user favorite recipes", { cause: error });
  }
};
