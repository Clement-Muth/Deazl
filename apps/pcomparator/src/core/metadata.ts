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
  siteName: "PComparator",
  title: "PComparator - Compare prices of many products",
  description: "PComparator is the price comparator for foods, cosmetic and more",
  backgroundColor: "#000",
  theme_color: "#000",
  og: {
    locale: "fr",
    type: "website",
    ogImage: "/ogimage.jpg",
    width: 1200,
    height: 630
  },
  twitter: {
    card: "summary_large_image",
    site: "@pcomparator"
  }
};

export const pcomparatorMetadata = {
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
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    nocache: true
  }
};
