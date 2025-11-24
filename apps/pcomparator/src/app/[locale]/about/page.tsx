import AboutContent from "./Content";

export const generateStaticParams = async () => {
  return [{ locale: "en" }, { locale: "fr" }];
};

export default function AboutPage() {
  return <AboutContent />;
}
