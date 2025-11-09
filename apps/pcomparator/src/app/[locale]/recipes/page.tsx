import { listUserRecipes } from "~/applications/Recipes/Api";
import { withLinguiPage } from "~/core/withLinguiLayout";
import { RecipesContent } from "./content";

async function RecipesPage() {
  let recipes: any[] = [];
  let error: string | null = null;

  try {
    recipes = await listUserRecipes();
  } catch (err) {
    error = err instanceof Error ? err.message : "Une erreur est survenue";
    console.error("Error loading recipes:", err);
  }

  return <RecipesContent error={error} recipes={recipes} />;
}

export default withLinguiPage(RecipesPage);
