// app/sitemap.ts
import { prisma } from "@deazl/system";
import type { MetadataRoute } from "next";

const LOCALES = ["fr", "en"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.PCOMPARATOR_PUBLIC_URL || "https://deazl.fr";

  /** ----------------------------------------
   * 1. Static routes (homepage, recipes, etc.)
   * ---------------------------------------- */
  const staticRoutes = ["", "recipes", "pricing", "shopping-list"];

  const localizedStatic = staticRoutes.flatMap((route) =>
    LOCALES.map((locale) => ({
      url: `${baseUrl}/${locale}/${route}`.replace(/\/$/, ""),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8
    }))
  );

  /** ----------------------------------------
   * 2. Public recipes
   * ---------------------------------------- */
  const publicRecipes = await prisma.recipe.findMany({
    where: { isPublic: true },
    select: { id: true, updatedAt: true }
  });

  const recipeEntries = publicRecipes.flatMap((recipe) =>
    LOCALES.map((locale) => ({
      url: `${baseUrl}/${locale}/recipes/${recipe.id}`,
      lastModified: recipe.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7
    }))
  );

  return [...localizedStatic, ...recipeEntries];
}
