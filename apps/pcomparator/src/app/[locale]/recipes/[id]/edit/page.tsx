import { notFound } from "next/navigation";
import { getRecipe } from "~/applications/Recipes/Api";
import { RecipeEditPageClient } from "./RecipeEditPageClient";

const RecipeEditPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) notFound();

  return <RecipeEditPageClient recipe={recipe} />;
};

export default RecipeEditPage;
