import type { Metadata } from "next";
import { ShoppingLists } from "~/applications/ShoppingLists/Ui/ShoppingLists/ShoppingLists";
import { PageHeader } from "~/components/Header/PageHeader";
import { withLinguiPage } from "~/core/withLinguiLayout";

export const metadata: Metadata = {
  title: "Shopping Lists | Deazl",
  description: "Create and manage your shopping lists"
};

const ShoppingListsPage = () => {
  return (
    <main className="flex flex-col w-full pb-20">
      <PageHeader title="Shopping Lists" href="/" />
      <div className="flex flex-col gap-y-8 w-full">
        <ShoppingLists />
      </div>
    </main>
  );
};

export default withLinguiPage(ShoppingListsPage);

export const dynamic = "force-dynamic";
