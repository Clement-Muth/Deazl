// meta-config.ts
export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];

export const metaConfig = {
  fr: {
    title: "Deazl – Comparez les prix facilement",
    description:
      "Comparez les prix alimentaires, trouvez les meilleurs deals, gérez vos courses et découvrez des recettes.",
    ogLocale: "fr_FR"
  },
  en: {
    title: "Deazl – Compare Prices Easily",
    description: "Compare food prices, find the best deals, manage your shopping lists and discover recipes.",
    ogLocale: "en_US"
  }
};

import type { Metadata } from "next";

export function getMetadataForLocale(locale: Locale): Metadata {
  const meta = metaConfig[locale];

  return {
    title: {
      default: meta.title,
      template: "%s – Deazl"
    },
    description: meta.description,
    metadataBase: new URL(process.env.PCOMPARATOR_PUBLIC_URL || "https://deazl.app"),

    openGraph: {
      title: meta.title,
      description: meta.description,
      url: process.env.PCOMPARATOR_PUBLIC_URL!,
      siteName: "Deazl",
      locale: meta.ogLocale,
      type: "website",
      images: [
        {
          url: `/static/og/${locale}.png`, // ← OG image locale
          width: 1200,
          height: 630
        }
      ]
    },

    twitter: {
      card: "summary_large_image",
      site: "@deazl",
      creator: "@deazl"
    },

    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        fr: "/fr"
      }
    }
  };
}
