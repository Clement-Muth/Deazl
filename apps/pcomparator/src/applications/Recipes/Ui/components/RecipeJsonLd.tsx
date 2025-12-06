import type { RecipePayload } from "../../Domain/Schemas/Recipe.schema";

interface RecipeJsonLdProps {
  recipe: RecipePayload;
  authorName?: string;
  authorUrl?: string;
  imageUrl?: string;
  avgPrice?: number;
}

export function RecipeJsonLd({
  recipe,
  authorName = "Deazl User",
  authorUrl,
  imageUrl,
  avgPrice
}: RecipeJsonLdProps) {
  const difficultyMap: Record<string, string> = {
    EASY: "Easy",
    MEDIUM: "Medium",
    HARD: "Difficult"
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `PT${hours}H${mins}M`;
    }
    if (hours > 0) {
      return `PT${hours}H`;
    }
    return `PT${mins}M`;
  };

  const ingredients =
    recipe.ingredientGroups && recipe.ingredientGroups.length > 0
      ? recipe.ingredientGroups.flatMap((group) =>
          group.ingredients.map((ing) => `${ing.quantity} ${ing.unit} ${ing.productName || ""}`)
        )
      : (recipe.ingredients || []).map((ing) => `${ing.quantity} ${ing.unit} ${ing.productName || ""}`);

  const instructions =
    recipe.stepGroups && recipe.stepGroups.length > 0
      ? recipe.stepGroups.flatMap((group) =>
          group.steps.map((step, idx) => ({
            "@type": "HowToStep" as const,
            name: `${group.name} - Step ${step.stepNumber}`,
            text: step.description,
            position: idx + 1
          }))
        )
      : (recipe.steps || []).map((step) => ({
          "@type": "HowToStep" as const,
          name: `Step ${step.stepNumber}`,
          text: step.description,
          position: step.stepNumber
        }));

  const categoryMap: Record<string, string> = {
    appetizer: "Appetizer",
    main_course: "Main Course",
    dessert: "Dessert",
    side_dish: "Side Dish",
    salad: "Salad",
    soup: "Soup",
    breakfast: "Breakfast",
    beverage: "Beverage",
    snack: "Snack"
  };

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Recipe",
    name: recipe.name,
    description:
      recipe.description?.replace(/<[^>]*>/g, "").trim() ||
      `${recipe.name} - ${difficultyMap[recipe.difficulty]} difficulty recipe`,
    image: imageUrl || recipe.imageUrl || undefined,
    author: {
      "@type": "Person",
      name: authorName,
      url: authorUrl
    },
    datePublished: recipe.createdAt ? new Date(recipe.createdAt).toISOString() : undefined,
    dateModified: recipe.updatedAt ? new Date(recipe.updatedAt).toISOString() : undefined,
    prepTime: formatDuration(recipe.preparationTime),
    cookTime: formatDuration(recipe.cookingTime),
    totalTime: formatDuration(recipe.totalTime),
    recipeYield: `${recipe.servings} servings`,
    recipeCategory: recipe.category ? categoryMap[recipe.category] || recipe.category : undefined,
    recipeCuisine: recipe.cuisine,
    keywords: recipe.tags?.join(", "),
    recipeIngredient: ingredients,
    recipeInstructions: instructions,
    suitableForDiet: undefined,
    ...(avgPrice && {
      estimatedCost: {
        "@type": "MonetaryAmount",
        currency: "EUR",
        value: avgPrice.toFixed(2)
      }
    }),
    aggregateRating:
      recipe.favoritesCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: Math.min(5, 3.5 + recipe.favoritesCount * 0.1),
            ratingCount: recipe.favoritesCount,
            bestRating: 5,
            worstRating: 1
          }
        : undefined,
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/ViewAction",
      userInteractionCount: recipe.viewsCount
    }
  };

  const cleanedJsonLd = Object.fromEntries(Object.entries(jsonLd).filter(([, value]) => value !== undefined));

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanedJsonLd) }} />
  );
}
