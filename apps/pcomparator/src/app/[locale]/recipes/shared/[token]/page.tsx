import { notFound } from "next/navigation";
import { getRecipeByShareToken } from "~/applications/Recipes/Api/recipes/share/getRecipeByShareToken.api";
import { RecipeDetailsContainer } from "~/applications/Recipes/Ui/RecipeDetailsContainer";

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

    // @ts-ignore
    return <RecipeDetailsContainer recipe={recipe} />;
  } catch (error) {
    console.error("Error loading shared recipe:", error);
    notFound();
  }
}
