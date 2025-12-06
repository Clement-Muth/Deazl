"use client";

import type { ShoppingListPayload } from "../../Domain/Schemas/ShoppingList.schema";
import { StoreProvider } from "../Contexts/StoreContext";
import { ShoppingListContainer } from "./ShoppingListContainer";

export const ShoppingListDetails = ({ list, user }: { list: ShoppingListPayload; user: any }) => {
  return (
    <StoreProvider>
      <main className="space-y-4 px-4 pb-20">
        <ShoppingListContainer initialList={list} user={{ id: user.id }} />
      </main>
    </StoreProvider>
  );
};
