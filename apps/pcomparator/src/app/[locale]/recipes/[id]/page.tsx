import { auth } from "@deazl/system";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRecipePricingCached } from "~/applications/Recipes/Api/recipes/getRecipePricing.api";
import { getRecipeWithAccessCached } from "~/applications/Recipes/Api/recipes/getRecipeWithAccess.api";
import type { RecipePricingResult } from "~/applications/Recipes/Domain/Services/RecipePricing.service";
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
    const accessResult = await getRecipeWithAccessCached(recipeId, shareToken, undefined);

    if (!accessResult.recipe) {
      return getRecipeNotFoundMetadata(localeStr);
    }

    const recipe = accessResult.recipe;
    const isPublic = accessResult.mode === "public";

    let avgPrice: number | undefined;
    try {
      const publicPricing = await getRecipePricingCached(recipeId);
      if (publicPricing && "totals" in publicPricing) {
        avgPrice = publicPricing.totals.optimizedMix;
      }
    } catch (e) {
      console.warn("Could not fetch pricing for metadata:", e);
    }

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
      locale: localeStr,
      avgPrice
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
  const userId = session?.user?.id;

  const accessResult = await getRecipeWithAccessCached(recipeId, shareToken, userId);

  if (!accessResult.recipe) notFound();

  if (!accessResult.hasAccess) {
    return <PrivateRecipeBanner recipeName={accessResult.recipe.name} />;
  }

  let initialPublicPricing: RecipePricingResult | null = null;
  try {
    const pricingResult = await getRecipePricingCached(recipeId);
    if (pricingResult && "totals" in pricingResult) {
      initialPublicPricing = pricingResult as RecipePricingResult;
    }
  } catch (e) {
    console.warn("Could not fetch initial pricing:", e);
  }

  return (
    <main className="flex w-full justify-center pt-0">
      <RecipeDetailsContainer
        recipe={accessResult.recipe}
        userId={userId}
        accessMode={accessResult.mode}
        initialPublicPricing={initialPublicPricing}
      />
    </main>
  );
}
