import { FeaturesContent } from "./Content";

export const generateStaticParams = async () => {
  return [{ locale: "en" }, { locale: "fr" }];
};

export default function FeaturesPage() {
  return <FeaturesContent />;
}
