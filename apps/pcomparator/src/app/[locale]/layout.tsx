import { Inter } from "next/font/google";
import ApplicationKernel from "~/core/ApplicationKernel";
import ApplicationLayout from "~/core/ApplicationLayout";
import { locales } from "~/core/locale";
import { getMetadataForLocale } from "~/core/metadata";
import { type NextPageProps, withLinguiLayout } from "~/core/withLinguiLayout";
import "react-toastify/dist/ReactToastify.css";
import "react-spring-bottom-sheet/dist/style.css";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import clsx from "clsx";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export async function generateStaticParams() {
  return locales.map((l) => ({ locale: l }));
}

export async function generateMetadata({ params }: NextPageProps): Promise<Metadata> {
  const locale = (await params).locale;

  return getMetadataForLocale(locale as any);
}

const RootLayout = async ({ children, params }: NextPageProps) => {
  const locale = (await params).locale;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Deazl",
    description:
      "Compare prices for food, cosmetics, and more across multiple stores. Create smart shopping lists, discover recipes, and save money on your everyday purchases.",
    url: process.env.PCOMPARATOR_PUBLIC_URL,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Any"
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={clsx(inter.className, "min-h-dvh flex flex-col")}>
        <ApplicationKernel locale={locale}>
          <ApplicationLayout>{children}</ApplicationLayout>
        </ApplicationKernel>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
};

export default withLinguiLayout(RootLayout);
