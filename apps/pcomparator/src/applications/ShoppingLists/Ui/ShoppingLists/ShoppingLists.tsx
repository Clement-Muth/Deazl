import { SuspendedView } from "~/components/Skeletons/SuspendedView";
import { listUserShoppingList } from "../../Api";
import type { ShoppingListPayload } from "../../Domain/Schemas/ShoppingList.schema";
import { ShoppingListsView } from "./ShoppingListsView";

interface ShoppingListsLayoutProps {
  lists?: ShoppingListPayload[] | null;
}

const ShoppingListsLayout = ({ lists }: ShoppingListsLayoutProps) => (
  <ShoppingListsView lists={lists ?? []} />
);

const ShoppingListsContent = async () => {
  const lists = await listUserShoppingList();

  return <ShoppingListsLayout lists={lists} />;
};

export const ShoppingLists = () => {
  return <SuspendedView fallback={ShoppingListsLayout} content={ShoppingListsContent} props={{}} />;
};
