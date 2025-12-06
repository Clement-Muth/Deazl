import { auth } from "@deazl/system";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRecipeAuthorCached } from "~/applications/Recipes/Api/recipes/getRecipeAuthor.api";
import { getRecipePricingCached } from "~/applications/Recipes/Api/recipes/getRecipePricing.api";
import { getRecipeWithAccessCached } from "~/applications/Recipes/Api/recipes/getRecipeWithAccess.api";
import type { RecipePricingResult } from "~/applications/Recipes/Domain/Services/RecipePricing.service";
import { RecipeDetailsContainer } from "~/applications/Recipes/Ui/RecipeDetailsContainer";
import { RecipeBreadcrumbJsonLd, RecipeJsonLd } from "~/applications/Recipes/Ui/components";
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
      avgPrice,
      category: recipe.category,
      cuisine: recipe.cuisine,
      ingredientCount: recipe.ingredients?.length || 0,
      stepCount: recipe.steps?.length || 0
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

  const [author, pricingResult] = await Promise.all([
    getRecipeAuthorCached(accessResult.recipe.userId),
    getRecipePricingCached(recipeId).catch((e) => {
      console.warn("Could not fetch initial pricing:", e);
      return null;
    })
  ]);

  let initialPublicPricing: RecipePricingResult | null = null;
  let avgPrice: number | undefined;
  if (pricingResult && "totals" in pricingResult) {
    initialPublicPricing = pricingResult as RecipePricingResult;
    avgPrice = pricingResult.totals.optimizedMix;
  }

  const isPublic = accessResult.mode === "public";

  return (
    <>
      {isPublic && (
        <>
          <RecipeJsonLd
            recipe={accessResult.recipe}
            imageUrl={accessResult.recipe.imageUrl || undefined}
            avgPrice={avgPrice}
            authorName={author?.name || undefined}
          />
          <RecipeBreadcrumbJsonLd
            recipeName={accessResult.recipe.name}
            recipeId={recipeId}
            category={accessResult.recipe.category}
            cuisine={accessResult.recipe.cuisine}
          />
        </>
      )}
      <main className="flex w-full justify-center pt-0">
        <RecipeDetailsContainer
          recipe={accessResult.recipe}
          userId={userId}
          accessMode={accessResult.mode}
          initialPublicPricing={initialPublicPricing}
          author={author || undefined}
        />
      </main>
    </>
  );
}
