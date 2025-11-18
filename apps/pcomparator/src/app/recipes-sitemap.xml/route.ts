import type { MetadataRoute } from "next";
import { PrismaRecipeRepository } from "~/applications/Recipes/Infrastructure/Repositories/PrismaRecipe.infrastructure";

const BASE_URL = "https://deazl.app";

export async function GET() {
  const recipeRepository = new PrismaRecipeRepository();

  try {
    // Get all public recipes for sitemap
    const publicRecipes = await recipeRepository.findManyPublic();

    const sitemap: MetadataRoute.Sitemap = [
      {
        url: `${BASE_URL}/recipes`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9
      },
      ...publicRecipes.map((recipe) => {
        const recipeData = recipe.toObject();
        return {
          url: `${BASE_URL}/recipes/${recipeData.id}`,
          lastModified: recipeData.updatedAt || recipeData.createdAt || new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7
        };
      })
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap
  .map(
    (entry) => `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified instanceof Date ? entry.lastModified.toISOString() : entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("")}
</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600"
      }
    });
  } catch (error) {
    console.error("Failed to generate recipes sitemap:", error);
    return new Response("Failed to generate sitemap", { status: 500 });
  }
}
