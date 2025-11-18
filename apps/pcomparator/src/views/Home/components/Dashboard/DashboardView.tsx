"use client";

import { DashboardHeader } from "./DashboardHeader";
import { QuickActionsGrid } from "./QuickActionsGrid";
import { StatsCards } from "./StatsCards";

interface DashboardViewProps {
  userName?: string;
  stats?: {
    totalLists: number;
    completedItems: number;
    totalSavings: number;
  };
}

export function DashboardView({ userName, stats }: DashboardViewProps) {
  return (
    <div className="flex flex-1 flex-col w-full px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <DashboardHeader userName={userName} />
      <QuickActionsGrid />
      <StatsCards stats={stats} />
    </div>
  );
}
