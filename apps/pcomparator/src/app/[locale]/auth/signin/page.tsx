import SigninContent from "./Content";

export const generateStaticParams = () => {
  return [{ locale: "en" }, { locale: "fr" }];
};

export default function SigninPage() {
  return <SigninContent />;
}
