import { listUserShoppingList } from "~/applications/ShoppingLists/Api";
import { SuspendedView } from "../../../components/Skeletons/SuspendedView";
import { DashboardHeader } from "./DashboardHeader";
import { QuickActionsGrid } from "./QuickActionsGrid";
import { StatsCards } from "./StatsCards";

interface DashboardViewProps {
  userName?: string;
}

interface DashboardLayoutProps {
  userName?: string;
  stats?: {
    totalLists: number;
    completedItems: number;
  };
}

const DashboardLayout = ({ userName, stats }: DashboardLayoutProps) => (
  <div className="flex flex-1 flex-col w-full px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    <DashboardHeader userName={userName} />
    <QuickActionsGrid />
    <StatsCards stats={stats || { totalLists: 0, completedItems: 0 }} />
  </div>
);

const DashboardContent = async ({ userName }: DashboardViewProps) => {
  const lists = await listUserShoppingList();

  const stats = {
    totalLists: lists.length,
    completedItems:
      lists.reduce((sum, list) => sum + (list.items?.filter((item) => item.isCompleted).length || 0), 0) || 0
  };

  return <DashboardLayout userName={userName} stats={stats} />;
};

export function Dashboard({ userName }: DashboardViewProps) {
  return <SuspendedView fallback={DashboardLayout} content={DashboardContent} props={{ userName }} />;
}
