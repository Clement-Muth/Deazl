import { auth } from "@deazl/system";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRecipeWithAccess } from "~/applications/Recipes/Api/recipes/getRecipeWithAccess.api";
import { RecipeDetailsContainer } from "~/applications/Recipes/Ui/RecipeDetailsContainer";
import { PrivateRecipeBanner } from "~/applications/Recipes/Ui/components/PrivateRecipeBanner";
import {
  getRecipeDefaultMetadata,
  getRecipeMetadata,
  getRecipeNotFoundMetadata
} from "~/applications/Recipes/Ui/metadata";

export async function generateMetadata({
  params,
  searchParams
}: {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{ share?: string }>;
}): Promise<Metadata> {
  const { id: recipeId, locale } = await params;
  const { share: shareToken } = await searchParams;
  const localeStr = (locale || "en") as "en" | "fr";

  try {
    const accessResult = await getRecipeWithAccess(recipeId, shareToken);

    if (!accessResult.recipe) {
      return getRecipeNotFoundMetadata(localeStr);
    }

    const recipe = accessResult.recipe;
    const isPublic = accessResult.mode === "public";

    return getRecipeMetadata({
      recipeName: recipe.name,
      recipeDescription: recipe.description || undefined,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      totalTime: recipe.totalTime,
      recipeId,
      imageUrl: recipe.imageUrl || undefined,
      isPublic,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
      tags: recipe.tags,
      locale: localeStr
    });
  } catch (error) {
    return getRecipeDefaultMetadata(localeStr);
  }
}

export default async function RecipeDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{ share?: string }>;
}) {
  const { id: recipeId } = await params;
  const { share: shareToken } = await searchParams;
  const session = await auth();

  const accessResult = await getRecipeWithAccess(recipeId, shareToken);

  if (!accessResult.recipe) {
    notFound();
  }

  if (!accessResult.hasAccess) {
    return <PrivateRecipeBanner recipeName={accessResult.recipe.name} />;
  }

  return (
    <main className="flex w-full justify-center pt-0">
      <RecipeDetailsContainer
        recipe={accessResult.recipe}
        userId={session?.user?.id}
        accessMode={accessResult.mode}
      />
    </main>
  );
}
