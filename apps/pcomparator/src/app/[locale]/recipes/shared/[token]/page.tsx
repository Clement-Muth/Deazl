import { notFound } from "next/navigation";
import { getRecipeByShareToken } from "~/applications/Recipes/Api/recipes/share/getRecipeByShareToken.api";
import RecipeDetails from "~/applications/Recipes/Ui/RecipeDetails";

interface SharedRecipePageProps {
  params: {
    token: string;
  };
}

export default async function SharedRecipePage({ params }: SharedRecipePageProps) {
  try {
    const recipe = await getRecipeByShareToken(params.token);

    if (!recipe) {
      notFound();
    }

    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-5xl">
        {/* @ts-ignore */}
        <RecipeDetails recipe={recipe} />
      </div>
    );
  } catch (error) {
    console.error("Error loading shared recipe:", error);
    notFound();
  }
}
