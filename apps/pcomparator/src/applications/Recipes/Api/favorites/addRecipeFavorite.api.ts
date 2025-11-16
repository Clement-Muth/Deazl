"use server";

import { auth, prisma } from "@deazl/system";
import { revalidatePath } from "next/cache";

export const addRecipeFavorite = async (recipeId: string): Promise<void> => {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId, isPublic: true }
    });

    if (!recipe) throw new Error("Recipe not found or not public");

    await prisma.$transaction([
      prisma.recipeFavorite.create({
        data: {
          userId: session.user.id,
          recipeId
        }
      }),
      prisma.recipe.update({
        where: { id: recipeId },
        data: { favoritesCount: { increment: 1 } }
      })
    ]);

    revalidatePath("/recipes/explore");
    revalidatePath(`/recipes/${recipeId}`);
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new Error("Recipe already in favorites");
    }
    throw new Error("Failed to add recipe to favorites", { cause: error });
  }
};
