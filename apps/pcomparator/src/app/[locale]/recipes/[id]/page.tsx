import { notFound } from "next/navigation";
import { getRecipe } from "~/applications/Recipes/Api";
import { RecipeDetails } from "~/applications/Recipes/Ui";
import { auth } from "~/libraries/nextauth/authConfig";

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const recipeId = (await params).id;
  const recipe = await getRecipe(recipeId);
  const session = await auth();

  if (!recipe) notFound();

  return (
    <main className="flex w-full justify-center pt-0">
      <div className="flex flex-col gap-y-8 max-w-4xl w-full">
        <div className="max-w-7xl mx-auto w-full pb-8">
          <RecipeDetails recipe={recipe} userId={session?.user?.id} />
        </div>
      </div>
    </main>
  );
}
