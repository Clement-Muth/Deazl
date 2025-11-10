import { listUserRecipes } from "~/applications/Recipes/Api";
import { withLinguiPage } from "~/core/withLinguiLayout";
import { RecipesContent } from "./content";

async function RecipesPage() {
  const recipes = await listUserRecipes();

  return <RecipesContent recipes={recipes} />;
}

export default withLinguiPage(RecipesPage);
