import { notFound } from "next/navigation";
import { auth } from "~/libraries/nextauth/authConfig";
import { ShoppingListDetails, getShoppingList } from "~/packages/applications/shopping-lists/src";
import { ShoppingListDetailsHeader } from "~/packages/applications/shopping-lists/src/Ui/ShoppingListDetails/ShoppingListDetailsHeader";

export default async function ShoppingListPage({ params }: { params: Promise<{ id: string }> }) {
  const shoppingListId = (await params).id;
  const session = await auth();
  const list = await getShoppingList(shoppingListId);

  if (!list) notFound();

  return (
    <div className="flex flex-col w-full">
      <ShoppingListDetailsHeader listName={list.name} shoppingListId={list.id} list={list.toObject()} />
      <ShoppingListDetails list={list.toObject()} user={session?.user} />
    </div>
  );
}
