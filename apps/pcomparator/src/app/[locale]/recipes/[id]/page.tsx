import { auth } from "@deazl/system";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRecipeWithAccess } from "~/applications/Recipes/Api/recipes/getRecipeWithAccess.api";
import { RecipeDetailsContainer } from "~/applications/Recipes/Ui/RecipeDetailsContainer";
import { PrivateRecipeBanner } from "~/applications/Recipes/Ui/components/PrivateRecipeBanner";

export async function generateMetadata({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ share?: string }>;
}): Promise<Metadata> {
  const recipeId = (await params).id;
  const { share: shareToken } = await searchParams;

  try {
    const accessResult = await getRecipeWithAccess(recipeId, shareToken);

    if (!accessResult.recipe) {
      return {
        title: "Recipe Not Found",
        description: "The requested recipe could not be found."
      };
    }

    const recipe = accessResult.recipe;
    const isPublic = accessResult.mode === "public";

    const title = `${recipe.name} - Deazl Recipe`;
    const description =
      recipe.description ||
      `${recipe.name}: ${recipe.difficulty} difficulty, ${recipe.servings} servings, ${recipe.totalTime} minutes total time.`;
    const url = `https://deazl.app/recipes/${recipeId}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        siteName: "Deazl",
        images: recipe.imageUrl
          ? [
              {
                url: recipe.imageUrl,
                width: 1200,
                height: 630,
                alt: recipe.name
              }
            ]
          : [],
        type: "article",
        ...(isPublic && {
          locale: "en_US",
          publishedTime: recipe.createdAt?.toISOString(),
          modifiedTime: recipe.updatedAt?.toISOString(),
          tags: recipe.tags || []
        })
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: recipe.imageUrl ? [recipe.imageUrl] : [],
        creator: "@deazl_app"
      },
      ...(isPublic && {
        robots: {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1
          }
        },
        alternates: {
          canonical: url
        }
      }),
      ...(!isPublic && {
        robots: {
          index: false,
          follow: false
        }
      })
    };
  } catch (error) {
    return {
      title: "Recipe",
      description: "View recipe details on Deazl"
    };
  }
}

export default async function RecipeDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ share?: string }>;
}) {
  const recipeId = (await params).id;
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
