import type { Metadata } from "next";
import { ShoppingLists } from "~/applications/ShoppingLists/Ui/ShoppingLists/ShoppingLists";
import { PageHeader } from "~/components/Header/PageHeader";
import { withLinguiPage } from "~/core/withLinguiLayout";

export const metadata: Metadata = {
  title: "Shopping Lists | PComparator",
  description: "Create and manage your shopping lists"
};

const ShoppingListsPage = () => {
  return (
    <main className="flex flex-col w-full">
      <PageHeader title="Shopping Lists" href="/" />
      <div className="flex flex-col gap-y-8 max-w-4xl w-full">
        <div className="max-w-3xl mx-auto w-full pb-8">
          <ShoppingLists />
        </div>
      </div>
    </main>
  );
};

export default withLinguiPage(ShoppingListsPage);

export const dynamic = "force-dynamic";
