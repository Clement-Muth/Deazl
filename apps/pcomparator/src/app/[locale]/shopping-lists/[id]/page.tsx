import { notFound } from "next/navigation";
import { getShoppingList } from "~/applications/ShoppingLists/Api";
import { ShoppingListDetails } from "~/applications/ShoppingLists/Ui";
import { ShoppingListDetailsHeader } from "~/applications/ShoppingLists/Ui/ShoppingListDetails/ShoppingListDetailsHeader";
import { auth } from "~/libraries/nextauth/authConfig";

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
