"use server";

import { prisma } from "@deazl/system";

export async function getRecipeTips(recipeId: string) {
  const tips = await prisma.recipeTip.findMany({
    where: {
      recipeId
    },
    orderBy: {
      order: "asc"
    }
  });

  return tips;
}
