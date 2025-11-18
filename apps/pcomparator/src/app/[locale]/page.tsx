import { listUserShoppingList } from "~/applications/ShoppingLists/Api";
import { withLinguiPage } from "~/core/withLinguiLayout";
import { auth } from "~/libraries/nextauth/authConfig";
import { HomeView } from "~/views/Home/HomeView";
import { DashboardView } from "~/views/Home/components/Dashboard/DashboardView";

const HomePage = async () => {
  const session = await auth();

  if (session?.user) {
    const lists = await listUserShoppingList();

    const stats = {
      totalLists: lists?.length || 0,
      completedItems:
        lists?.reduce((sum, list) => sum + (list.items?.filter((item) => item.isCompleted).length || 0), 0) ||
        0,
      totalSavings: 0
    };

    return <DashboardView userName={session.user.name} stats={stats} />;
  }

  return <HomeView isLoggedIn={false} />;
};

export default withLinguiPage(HomePage);
