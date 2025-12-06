type Locale = "en" | "fr";

interface RecipeMetadataParams {
  recipeName: string;
  recipeDescription?: string;
  difficulty: string;
  servings: number;
  totalTime: number;
  locale: Locale;
  avgPrice?: number;
  category?: string | null;
  cuisine?: string | null;
  authorName?: string;
}

const difficultyLabels = {
  en: { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" },
  fr: { EASY: "Facile", MEDIUM: "Moyen", HARD: "Difficile" }
};

const categoryLabels: Record<Locale, Record<string, string>> = {
  en: {
    appetizer: "Appetizer",
    main_course: "Main Course",
    dessert: "Dessert",
    side_dish: "Side Dish",
    salad: "Salad",
    soup: "Soup",
    breakfast: "Breakfast",
    beverage: "Beverage",
    snack: "Snack"
  },
  fr: {
    appetizer: "Entrée",
    main_course: "Plat principal",
    dessert: "Dessert",
    side_dish: "Accompagnement",
    salad: "Salade",
    soup: "Soupe",
    breakfast: "Petit-déjeuner",
    beverage: "Boisson",
    snack: "En-cas"
  }
};

const formatTimeLabel = (minutes: number, locale: Locale): string => {
  if (minutes < 60) {
    return locale === "fr" ? `${minutes} min` : `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (locale === "fr") {
    return mins > 0 ? `${hours}h${mins}` : `${hours}h`;
  }
  return mins > 0 ? `${hours}h ${mins}min` : `${hours} hour${hours > 1 ? "s" : ""}`;
};

const translations = {
  en: {
    recipeTitle: (name: string, category?: string | null) => {
      const categoryStr = category ? ` ${categoryLabels.en[category] || category}` : "";
      return `${name}${categoryStr} Recipe - Deazl`;
    },
    recipeDescription: (params: RecipeMetadataParams) => {
      const diffLabel =
        difficultyLabels.en[params.difficulty as keyof typeof difficultyLabels.en] || params.difficulty;
      const timeStr = formatTimeLabel(params.totalTime, "en");
      const categoryStr = params.category ? ` ${categoryLabels.en[params.category] || params.category}` : "";
      const cuisineStr = params.cuisine ? ` ${params.cuisine}` : "";

      if (params.recipeDescription) {
        const cleanDesc = params.recipeDescription.replace(/<[^>]*>/g, "").trim();
        const truncated = cleanDesc.length > 120 ? `${cleanDesc.slice(0, 120)}...` : cleanDesc;
        return params.avgPrice
          ? `${truncated} ${diffLabel} difficulty, ${params.servings} servings, ${timeStr}. Est. €${params.avgPrice.toFixed(2)}`
          : `${truncated} ${diffLabel} difficulty, ${params.servings} servings, ${timeStr}.`;
      }

      const base = `${params.recipeName}:${cuisineStr}${categoryStr} recipe. ${diffLabel} difficulty, serves ${params.servings}, ready in ${timeStr}.`;
      return params.avgPrice ? `${base} Estimated cost: €${params.avgPrice.toFixed(2)}` : base;
    },
    notFoundTitle: "Recipe Not Found - Deazl",
    notFoundDescription:
      "The recipe you're looking for doesn't exist or has been removed. Explore thousands of other recipes on Deazl.",
    defaultTitle: "Recipe - Deazl",
    defaultDescription:
      "Discover recipe details, ingredients, step-by-step instructions, and find the best prices for ingredients on Deazl.",
    recipesTitle: "Recipes - Discover and Share Recipes | Deazl",
    recipesDescription:
      "Browse thousands of public recipes, create your own, and get optimal pricing for ingredients. Join the Deazl community and make cooking affordable."
  },
  fr: {
    recipeTitle: (name: string, category?: string | null) => {
      const categoryStr = category ? ` ${categoryLabels.fr[category] || category}` : "";
      return `${name} - Recette${categoryStr} | Deazl`;
    },
    recipeDescription: (params: RecipeMetadataParams) => {
      const diffLabel =
        difficultyLabels.fr[params.difficulty as keyof typeof difficultyLabels.fr] || params.difficulty;
      const timeStr = formatTimeLabel(params.totalTime, "fr");
      const categoryStr = params.category ? ` ${categoryLabels.fr[params.category] || params.category}` : "";
      const cuisineStr = params.cuisine ? ` ${params.cuisine}` : "";

      if (params.recipeDescription) {
        const cleanDesc = params.recipeDescription.replace(/<[^>]*>/g, "").trim();
        const truncated = cleanDesc.length > 120 ? `${cleanDesc.slice(0, 120)}...` : cleanDesc;
        return params.avgPrice
          ? `${truncated} Difficulté ${diffLabel}, ${params.servings} portions, ${timeStr}. Coût estimé : ${params.avgPrice.toFixed(2)}€`
          : `${truncated} Difficulté ${diffLabel}, ${params.servings} portions, ${timeStr}.`;
      }

      const base = `${params.recipeName} : recette${cuisineStr}${categoryStr}. Difficulté ${diffLabel}, ${params.servings} portions, prête en ${timeStr}.`;
      return params.avgPrice ? `${base} Coût estimé : ${params.avgPrice.toFixed(2)}€` : base;
    },
    notFoundTitle: "Recette introuvable - Deazl",
    notFoundDescription:
      "La recette que vous recherchez n'existe pas ou a été supprimée. Découvrez des milliers d'autres recettes sur Deazl.",
    defaultTitle: "Recette - Deazl",
    defaultDescription:
      "Découvrez les détails de la recette, les ingrédients, les étapes et trouvez les meilleurs prix pour vos ingrédients sur Deazl.",
    recipesTitle: "Recettes - Découvrez et Partagez des Recettes | Deazl",
    recipesDescription:
      "Parcourez des milliers de recettes publiques, créez les vôtres et obtenez les meilleurs prix pour vos ingrédients. Rejoignez la communauté Deazl pour cuisiner à petit prix."
  }
};

export function getRecipeMetadata(
  params: RecipeMetadataParams & {
    recipeId: string;
    imageUrl?: string;
    isPublic: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    tags?: string[];
    category?: string | null;
    cuisine?: string | null;
    authorName?: string;
    ingredientCount?: number;
    stepCount?: number;
  }
) {
  const locale = params.locale;
  const t = translations[locale];

  const title = t.recipeTitle(params.recipeName, params.category);
  const description = t
    .recipeDescription({ ...params, category: params.category, cuisine: params.cuisine })
    .replace(/<[^>]*>/g, "")
    .trim();
  const url = `https://deazl.app/${locale}/recipes/${params.recipeId}`;

  const keywordsBase = [
    params.recipeName,
    locale === "fr" ? "recette" : "recipe",
    params.category
      ? categoryLabels[locale][params.category] || params.category
      : locale === "fr"
        ? "cuisine"
        : "cooking"
  ];

  if (params.cuisine) keywordsBase.push(params.cuisine);
  if (params.tags) keywordsBase.push(...params.tags);

  const diffLabel = difficultyLabels[locale][params.difficulty as keyof typeof difficultyLabels.en];
  if (diffLabel) keywordsBase.push(diffLabel);

  const keywords = keywordsBase.filter(Boolean).join(", ");

  return {
    title,
    description,
    keywords,
    authors: params.authorName ? [{ name: params.authorName }] : undefined,
    creator: params.authorName,
    openGraph: {
      title,
      description,
      url,
      siteName: "Deazl",
      images: params.imageUrl
        ? [
            {
              url: params.imageUrl,
              width: 1200,
              height: 630,
              alt: params.recipeName
            }
          ]
        : [],
      type: "article" as const,
      ...(params.isPublic && {
        locale: locale === "fr" ? "fr_FR" : "en_US",
        publishedTime: new Date(params.createdAt as Date).toISOString(),
        modifiedTime: new Date(params.updatedAt as Date).toISOString(),
        tags: params.tags || [],
        section: params.category ? categoryLabels[locale][params.category] || params.category : undefined
      })
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: params.imageUrl ? [params.imageUrl] : [],
      creator: "@deazl_app"
    },
    ...(params.isPublic && {
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large" as const,
          "max-snippet": -1
        }
      },
      alternates: {
        canonical: url,
        languages: {
          en: `https://deazl.app/en/recipes/${params.recipeId}`,
          fr: `https://deazl.app/fr/recipes/${params.recipeId}`
        }
      }
    }),
    ...(!params.isPublic && {
      robots: {
        index: false,
        follow: false
      }
    })
  };
}

export function getRecipeNotFoundMetadata(locale: Locale) {
  const t = translations[locale];
  return {
    title: t.notFoundTitle,
    description: t.notFoundDescription
  };
}

export function getRecipeDefaultMetadata(locale: Locale) {
  const t = translations[locale];
  return {
    title: t.defaultTitle,
    description: t.defaultDescription
  };
}

export function getRecipesHubMetadata(locale: Locale) {
  const t = translations[locale];
  return {
    title: t.recipesTitle,
    description: t.recipesDescription,
    openGraph: {
      title: t.recipesTitle,
      description: t.recipesDescription,
      url: `https://deazl.app/${locale}/recipes`,
      siteName: "Deazl",
      type: "website" as const,
      locale: locale === "fr" ? "fr_FR" : "en_US"
    },
    twitter: {
      card: "summary_large_image" as const,
      title: t.recipesTitle,
      description: t.recipesDescription,
      creator: "@deazl_app"
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large" as const,
        "max-snippet": -1
      }
    },
    alternates: {
      canonical: `https://deazl.app/${locale}/recipes`,
      languages: {
        en: "https://deazl.app/en/recipes",
        fr: "https://deazl.app/fr/recipes"
      }
    }
  };
}
