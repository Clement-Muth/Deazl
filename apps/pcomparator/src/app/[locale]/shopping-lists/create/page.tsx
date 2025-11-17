"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function CreateShoppingListPage() {
  useEffect(() => {
    redirect("/shopping-lists");
  }, []);

  return null;
}
