import type { Metadata } from "next";
import { MyRecipesPageClient } from "./MyRecipesPageClient";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

const MyRecipesPage = () => {
  return <MyRecipesPageClient />;
};

export default MyRecipesPage;
