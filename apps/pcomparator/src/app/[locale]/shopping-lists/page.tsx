import { listUserShoppingList } from "~/applications/ShoppingLists/Api";
import { ShoppingListsView } from "~/applications/ShoppingLists/Ui";
import { withLinguiPage } from "~/core/withLinguiLayout";

export const metadata = {
  title: "Shopping Lists | PComparator",
  description: "Create and manage your shopping lists"
};

const ShoppingListsPage = async () => {
  const lists = await listUserShoppingList();

  return (
    <main className="flex w-full justify-center p-4">
      <div className="flex flex-col gap-y-8 max-w-4xl w-full">
        <div className="max-w-3xl mx-auto w-full pb-8">
          <ShoppingListsView lists={lists} />
        </div>
      </div>
    </main>
  );
};

export default withLinguiPage(ShoppingListsPage);
