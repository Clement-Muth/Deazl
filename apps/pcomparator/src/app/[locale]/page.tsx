import type { Metadata } from "next";
import { Dashboard } from "~/applications/Dashboard/Ui/Dashboard";
import { withLinguiPage } from "~/core/withLinguiLayout";
import { auth } from "~/libraries/nextauth/authConfig";
import { HomeView } from "~/views/Home/HomeView";

export const metadata: Metadata = {
  alternates: {
    canonical: process.env.PCOMPARATOR_PUBLIC_URL,
    languages: {
      en: `${process.env.PCOMPARATOR_PUBLIC_URL}/en`,
      fr: `${process.env.PCOMPARATOR_PUBLIC_URL}/fr`
    }
  }
};

export const generateStaticParams = async () => {
  return [{ locale: "en" }, { locale: "fr" }];
};

const HomePage = async () => {
  const session = await auth();

  if (session?.user) {
    return <Dashboard userName={session.user.name} />;
  }

  return <HomeView isLoggedIn={false} />;
};

export default withLinguiPage(HomePage);
