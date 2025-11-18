import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ApplicationKernel from "~/core/ApplicationKernel";
import ApplicationLayout from "~/core/ApplicationLayout";
import { locales } from "~/core/locale";
import { pcomparatorMetadata } from "~/core/metadata";
import { type NextPageProps, withLinguiLayout } from "~/core/withLinguiLayout";
import "react-toastify/dist/ReactToastify.css";
import "react-spring-bottom-sheet/dist/style.css";
import "./globals.css";
import clsx from "clsx";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = pcomparatorMetadata;

export const generateStaticParams = () => locales.map((locale) => ({ lang: locale }));

const RootLayout = ({ children, locale }: NextPageProps) => {
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={clsx(inter.className, "min-h-dvh flex flex-col")}>
        <ApplicationKernel locale={locale}>
          <ApplicationLayout>{children}</ApplicationLayout>
        </ApplicationKernel>
      </body>
    </html>
  );
};

export const dynamic = "force-dynamic";

export default withLinguiLayout(RootLayout);
