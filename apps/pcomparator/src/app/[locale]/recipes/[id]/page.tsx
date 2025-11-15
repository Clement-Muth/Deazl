import { notFound } from "next/navigation";
import { getRecipe } from "~/applications/Recipes/Api";
import { RecipeDetailsContainer } from "~/applications/Recipes/Ui/RecipeDetailsContainer";
import { auth } from "~/libraries/nextauth/authConfig";

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const recipeId = (await params).id;
  const recipe = await getRecipe(recipeId);
  const session = await auth();

  if (!recipe) notFound();

  return (
    <main className="flex w-full justify-center pt-0">
      <RecipeDetailsContainer recipe={recipe} userId={session?.user?.id} />
    </main>
  );
}
