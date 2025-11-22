// TabbarClient.tsx
"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { QuickAddProduct } from "~/applications/Prices/Ui/QuickAddProduct/QuickAddProduct";
import { Tabbar as TabbarComponent } from "~/components/Tabbar/Tabbar";

export function Tabbar() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  // useEffect(() => setMounted(true), []);

  // if (!mounted) return null;

  return <TabbarComponent mainButton={<QuickAddProduct />} isSignedIn={!!session?.user} />;
}
