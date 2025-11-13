"use client";

import type { ShoppingListPayload } from "../../Domain/Schemas/ShoppingList.schema";
import { ShoppingListContainer } from "../../Ui/ShoppingListDetails/ShoppingListContainer";
import { StoreProvider } from "../Contexts/StoreContext";

export const ShoppingListDetails = ({ list, user }: { list: ShoppingListPayload; user: any }) => {
  return (
    <>
      <StoreProvider>
        <main className="space-y-4 px-4">
          <ShoppingListContainer initialList={list} user={{ id: user.id }} />
        </main>
      </StoreProvider>
    </>
  );
};
