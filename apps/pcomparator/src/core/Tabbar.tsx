"use client";

import { QuickAddProduct } from "~/applications/Prices/Ui/QuickAddProduct/QuickAddProduct";
import { Tabbar as TabbarComponent } from "~/components/Tabbar/Tabbar";

interface TabbarProps {
  isSignedIn: boolean;
}

export const Tabbar = ({ isSignedIn }: TabbarProps) => {
  return <TabbarComponent mainButton={<QuickAddProduct />} isSignedIn={isSignedIn} />;
};
