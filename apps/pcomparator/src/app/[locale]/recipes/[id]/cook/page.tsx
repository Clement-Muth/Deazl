import { notFound, redirect } from "next/navigation";
import { getRecipe } from "~/applications/Recipes/Api";
import { SmartCookingMode } from "~/applications/Recipes/Ui/components/SmartCookingMode";
import { auth } from "~/libraries/nextauth/authConfig";

export default async function CookingModePage({ params }: { params: Promise<{ id: string }> }) {
  const recipeId = (await params).id;
  const recipe = await getRecipe(recipeId);
  const session = await auth();

  if (!recipe) notFound();

  if (!recipe.steps || recipe.steps.length === 0) {
    redirect(`/recipes/${recipeId}`);
  }

  const steps = recipe.steps.map((step) => ({
    id: step.id,
    description: step.description,
    duration: step.duration || undefined
  }));

  const ingredients = (recipe.ingredients || []).map((ing) => ({
    id: ing.id,
    productName: ing.productName || "Unknown",
    quantity: ing.quantity,
    unit: ing.unit
  }));

  return (
    <main>
      <SmartCookingMode
        recipeId={recipe.id}
        recipeName={recipe.name}
        steps={steps}
        ingredients={ingredients}
      />
    </main>
  );
}
