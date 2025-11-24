import { auth } from "@deazl/system";
import type { Metadata } from "next";
import { getPublicHubData } from "~/applications/Recipes/Api/hub/getPublicHubData.api";
import { PublicRecipeHub } from "~/applications/Recipes/Ui/PublicRecipeHub";
import { RecipeHub } from "~/applications/Recipes/Ui/RecipeHub";
import { getRecipesHubMetadata } from "~/applications/Recipes/Ui/metadata";
import { withLinguiPage } from "~/core/withLinguiLayout";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return getRecipesHubMetadata((locale || "en") as "en" | "fr");
}

async function RecipesPage() {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  if (isAuthenticated) return <RecipeHub />;

  const publicHubData = await getPublicHubData();

  return <PublicRecipeHub hubData={publicHubData} isAuthenticated={false} />;
}

export default withLinguiPage(RecipesPage);
