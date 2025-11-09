import { notFound } from "next/navigation";
import { getRecipe } from "~/applications/Recipes/Api";
import { RecipeFormEdit } from "~/applications/Recipes/Ui";

export default async function RecipeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) notFound();

  return (
    <main className="flex w-full justify-center p-4">
      <div className="flex flex-col gap-y-8 max-w-4xl w-full">
        <RecipeFormEdit recipe={recipe} />
      </div>
    </main>
  );
}
