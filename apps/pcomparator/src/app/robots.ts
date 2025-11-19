import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.PCOMPARATOR_PUBLIC_URL || "https://deazl.fr";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/private/"]
      }
    ],
    sitemap: [`${baseUrl}/sitemap.xml`, `${baseUrl}/recipes-sitemap.xml`]
  };
}
