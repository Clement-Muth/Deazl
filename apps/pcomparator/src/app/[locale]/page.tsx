import { withLinguiPage } from "~/core/withLinguiLayout";
import { auth } from "~/libraries/nextauth/authConfig";
import { listUserShoppingList } from "~/packages/applications/shopping-lists/src";
import { HomeView } from "~/views/Home/HomeView";
import { DashboardView } from "~/views/Home/components/Dashboard/DashboardView";

const HomePage = async () => {
  const session = await auth();

  if (session?.user) {
    // Get user's recent lists
    const lists = await listUserShoppingList();
    const recentLists = lists?.slice(0, 5);

    // Calculate stats
    const stats = {
      totalLists: lists?.length || 0,
      completedItems:
        lists?.reduce((sum, list) => sum + (list.items?.filter((item) => item.isCompleted).length || 0), 0) ||
        0,
      totalSavings: 0 // TODO: Calculate from price comparisons
    };

    return <DashboardView userName={session.user.name} recentLists={recentLists || []} stats={stats} />;
  }

  return <HomeView isLoggedIn={false} />;
};

export default withLinguiPage(HomePage);
