import { auth } from "@deazl/system";
import type { Metadata } from "next";
import { getRecipeHubData } from "~/applications/Recipes/Api";
import { getPublicHubData } from "~/applications/Recipes/Api/hub/getPublicHubData.api";
import { PublicRecipeHub } from "~/applications/Recipes/Ui/PublicRecipeHub";
import { RecipeHubContent } from "~/applications/Recipes/Ui/RecipeHubContent";
import { withLinguiPage } from "~/core/withLinguiLayout";

export const metadata: Metadata = {
  title: "Recipes - Discover and Share Recipes | Deazl",
  description:
    "Browse thousands of public recipes, create your own, and get optimal pricing for ingredients. Join the Deazl community and make cooking affordable.",
  openGraph: {
    title: "Recipes - Discover and Share Recipes | Deazl",
    description:
      "Browse thousands of public recipes, create your own, and get optimal pricing for ingredients. Join the Deazl community and make cooking affordable.",
    url: "https://deazl.app/recipes",
    siteName: "Deazl",
    type: "website",
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "Recipes - Discover and Share Recipes | Deazl",
    description:
      "Browse thousands of public recipes, create your own, and get optimal pricing for ingredients.",
    creator: "@deazl_app"
  },
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
    canonical: "https://deazl.app/recipes"
  }
};

async function RecipesPage() {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  if (isAuthenticated) {
    const hubData = await getRecipeHubData();
    return <RecipeHubContent hubData={hubData} />;
  }

  const publicHubData = await getPublicHubData();

  return <PublicRecipeHub hubData={publicHubData} isAuthenticated={false} />;
}

export default withLinguiPage(RecipesPage);
