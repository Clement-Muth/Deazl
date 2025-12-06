"use server";

import { prisma } from "@deazl/system";
import { unstable_cache } from "next/cache";

export interface RecipeAuthorInfo {
  id: string;
  name: string | null;
  image: string | null;
}

export async function getRecipeAuthor(userId: string): Promise<RecipeAuthorInfo | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        image: true
      }
    });

    return user;
  } catch (error) {
    console.error("Failed to get recipe author:", error);
    return null;
  }
}

export async function getRecipeAuthorCached(userId: string): Promise<RecipeAuthorInfo | null> {
  const getCached = unstable_cache(async () => getRecipeAuthor(userId), [`recipe-author-${userId}`], {
    revalidate: 86400,
    tags: [`user-${userId}`]
  });

  return getCached();
}
