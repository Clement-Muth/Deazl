import { getRecipeHubData } from "~/applications/Recipes/Api";
import { RecipeHubContent } from "~/applications/Recipes/Ui/RecipeHubContent";
import { withLinguiPage } from "~/core/withLinguiLayout";

async function RecipesPage() {
  const hubData = await getRecipeHubData();

  return <RecipeHubContent hubData={hubData} />;
}

export default withLinguiPage(RecipesPage);
