import { auth } from "@deazl/system";
import { redirect } from "next/navigation";
import { getPantryItems } from "~/applications/Pantry/Api/pantryItems/getPantryItems.api";
import { PantryPage } from "~/applications/Pantry/Ui/PantryPage";
import { withLinguiPage } from "~/core/withLinguiLayout";

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
