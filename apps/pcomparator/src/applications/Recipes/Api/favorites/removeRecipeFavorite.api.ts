"use server";

import { auth, prisma } from "@deazl/system";
import { revalidatePath } from "next/cache";

export const removeRecipeFavorite = async (recipeId: string): Promise<void> => {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const favorite = await prisma.recipeFavorite.findUnique({
      where: {
        userId_recipeId: {
          userId: session.user.id,
          recipeId
        }
      }
    });

    if (!favorite) throw new Error("Favorite not found");

    await prisma.$transaction([
      prisma.recipeFavorite.delete({
        where: {
          userId_recipeId: {
            userId: session.user.id,
            recipeId
          }
        }
      }),
      prisma.recipe.update({
        where: { id: recipeId },
        data: { favoritesCount: { decrement: 1 } }
      })
    ]);

    revalidatePath("/recipes/explore");
    revalidatePath(`/recipes/${recipeId}`);
  } catch (error) {
    throw new Error("Failed to remove recipe from favorites", { cause: error });
  }
};
