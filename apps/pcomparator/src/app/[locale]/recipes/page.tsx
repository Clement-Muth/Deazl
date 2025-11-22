import { auth } from "@deazl/system";
import { getPublicHubData } from "~/applications/Recipes/Api/hub/getPublicHubData.api";
import { PublicRecipeHub } from "~/applications/Recipes/Ui/PublicRecipeHub";
import { RecipeHub } from "~/applications/Recipes/Ui/RecipeHub";
import { withLinguiPage } from "~/core/withLinguiLayout";

const RecipesPage = async () => {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  if (isAuthenticated) return <RecipeHub />;

  const publicHubData = await getPublicHubData();

  return <PublicRecipeHub hubData={publicHubData} isAuthenticated={false} />;
};

export default withLinguiPage(RecipesPage);
