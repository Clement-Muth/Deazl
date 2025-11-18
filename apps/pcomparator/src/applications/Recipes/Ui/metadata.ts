type Locale = "en" | "fr";

interface RecipeMetadataParams {
  recipeName: string;
  recipeDescription?: string;
  difficulty: string;
  servings: number;
  totalTime: number;
  locale: Locale;
}

const translations = {
  en: {
    recipeTitle: (name: string) => `${name} - Deazl Recipe`,
    recipeDescription: (params: RecipeMetadataParams) =>
      params.recipeDescription ||
      `${params.recipeName}: ${params.difficulty} difficulty, ${params.servings} servings, ${params.totalTime} minutes total time.`,
    notFoundTitle: "Recipe Not Found",
    notFoundDescription: "The requested recipe could not be found.",
    defaultTitle: "Recipe",
    defaultDescription: "View recipe details on Deazl",
    recipesTitle: "Recipes - Discover and Share Recipes | Deazl",
    recipesDescription:
      "Browse thousands of public recipes, create your own, and get optimal pricing for ingredients. Join the Deazl community and make cooking affordable."
  },
  fr: {
    recipeTitle: (name: string) => `${name} - Recette Deazl`,
    recipeDescription: (params: RecipeMetadataParams) =>
      params.recipeDescription ||
      `${params.recipeName}: Difficulté ${params.difficulty}, ${params.servings} portions, ${params.totalTime} minutes au total.`,
    notFoundTitle: "Recette introuvable",
    notFoundDescription: "La recette demandée n'a pas pu être trouvée.",
    defaultTitle: "Recette",
    defaultDescription: "Voir les détails de la recette sur Deazl",
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
  }
) {
  const locale = params.locale;
  const t = translations[locale];

  const title = t.recipeTitle(params.recipeName);
  const description = t.recipeDescription(params);
  const url = `https://deazl.app/${locale}/recipes/${params.recipeId}`;

  return {
    title,
    description,
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
        publishedTime: params.createdAt?.toISOString(),
        modifiedTime: params.updatedAt?.toISOString(),
        tags: params.tags || []
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
