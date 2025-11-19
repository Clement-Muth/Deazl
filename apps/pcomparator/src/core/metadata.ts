import type { Metadata } from "next";

declare type Locale = string;

interface Meta {
  URL: string | URL;
  siteName: string;
  title?: string;
  description?: string;
  backgroundColor?: string;
  theme_color?: string;
  og: {
    locale?: Locale;
    type?: "website";
    ogImage: string | URL;
    width?: number;
    height?: number;
  };
  twitter: {
    card?: string;
    site?: string;
  };
}

export const meta: Meta = {
  URL: process.env.PCOMPARATOR_PUBLIC_URL,
  siteName: "Deazl",
  title: "Deazl - Compare Prices & Find the Best Deals",
  description:
    "Compare prices for food, cosmetics, and more across multiple stores. Create smart shopping lists, discover recipes, and save money on your everyday purchases.",
  backgroundColor: "#eef2ff",
  theme_color: "#eef2ff",
  og: {
    locale: "en",
    type: "website",
    ogImage: "/static/manifest/screenshots/home-page.png",
    width: 895,
    height: 2040
  },
  twitter: {
    card: "summary_large_image",
    site: "@deazl"
  }
};

export const pcomparatorMetadata: Metadata = {
  title: {
    default: `${meta.title}`,
    template: `%s – ${meta.siteName}`
  },
  metadataBase: new URL(meta.URL),
  description: meta.description,
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: meta.URL,
    siteName: meta.siteName,
    images: [
      {
        url: meta.og.ogImage,
        width: meta.og.width,
        height: meta.og.height
      }
    ],
    locale: meta.og.locale,
    type: meta.og.type
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  twitter: {
    card: "summary_large_image",
    site: meta.twitter.site,
    creator: meta.twitter.site
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
  }
};
