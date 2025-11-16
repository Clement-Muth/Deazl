import { auth } from "@deazl/system";
import { redirect } from "next/navigation";
import { withLinguiPage } from "~/core/withLinguiLayout";
import { getPantryItems } from "~/packages/applications/pantry/src/Api/pantryItems/getPantryItems.api";
import { PantryPage } from "~/packages/applications/pantry/src/Ui/PantryPage";

export const metadata = {
  title: "My Pantry | Deazl",
  description: "Track your food inventory and expiration dates"
};

const Pantry = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const items = await getPantryItems();

  return (
    <main className="flex w-full justify-center p-4">
      <div className="flex w-full flex-col gap-y-8">
        <PantryPage items={items} />
      </div>
    </main>
  );
};

export default withLinguiPage(Pantry);
