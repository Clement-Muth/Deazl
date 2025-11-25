"use client";

import { useSession } from "next-auth/react";
import { QuickAddProduct } from "~/applications/Prices/Ui/QuickAddProduct/QuickAddProduct";
import { Tabbar as TabbarComponent } from "~/components/Tabbar/Tabbar";

export function Tabbar() {
  const { data: session } = useSession();

  return <TabbarComponent mainButton={<QuickAddProduct />} isSignedIn={!!session?.user} />;
}
