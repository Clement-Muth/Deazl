"use server";

import { auth, prisma } from "@deazl/system";

export const incrementRecipeViews = async (recipeId: string): Promise<void> => {
  try {
    const session = await auth();

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { userId: true }
    });

    if (!recipe) return;

    if (session?.user?.id === recipe.userId) {
      return;
    }

    await prisma.recipe.update({
      where: { id: recipeId },
      data: { viewsCount: { increment: 1 } }
    });
  } catch (error) {
    console.error("Failed to increment recipe views:", error);
  }
};
