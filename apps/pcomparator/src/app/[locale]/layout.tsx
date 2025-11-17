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

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = pcomparatorMetadata;

export const generateStaticParams = () => locales.map((locale) => ({ lang: locale }));

const RootLayout = ({ children, locale }: NextPageProps) => {
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} min-h-[100dvh] flex flex-col bg-gray-50 dark:bg-gray-900`}>
        <ApplicationKernel locale={locale}>
          <ApplicationLayout>
            {/* <InstallPWA /> */}
            {children}
          </ApplicationLayout>
        </ApplicationKernel>
      </body>
    </html>
  );
};

export const dynamic = "force-dynamic";

export default withLinguiLayout(RootLayout);
