import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.PCOMPARATOR_PUBLIC_URL || "https://deazl.fr";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/private/",
          "/auth/",
          "/account/",
          "/dashboard/",
          "/shopping-list/*?private=true",
          "/_next/static/",
          "/_next/image/",
          "/recipes/my-recipes",
          "/server-sitemap.xml" // si tu en génères un
        ]
      },

      // Facultatif : bloquer les scrapers IA
      {
        userAgent: "GPTBot",
        disallow: "/"
      },
      {
        userAgent: "ClaudeBot",
        disallow: "/"
      },
      {
        userAgent: "Google-Extended",
        disallow: "/"
      }
    ],

    sitemap: [`${baseUrl}/sitemap.xml`]
  };
}
