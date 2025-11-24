import { PricingContent } from "./Content";

export const generateStaticParams = async () => {
  return [{ locale: "en" }, { locale: "fr" }];
};

export default function PricingPage() {
  return <PricingContent />;
}
