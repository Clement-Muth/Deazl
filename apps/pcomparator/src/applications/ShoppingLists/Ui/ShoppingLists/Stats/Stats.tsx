import { Trans } from "@lingui/react/macro";
import { ArchiveIcon, ShoppingBagIcon, ShoppingCartIcon } from "lucide-react";
import type { ShoppingList } from "../../../Domain/Entities/ShoppingList.entity";
import { StatsCard } from "./StatsCard";

interface StatsProps {
  activeLists: ShoppingList[];
  completedLists: ShoppingList[];
  lists: ShoppingList[];
}

export const Stats = ({ activeLists, completedLists, lists }: StatsProps) => (
  <div className="mb-8 grid grid-cols-3 gap-4">
    <StatsCard
      icon={<ShoppingCartIcon className="h-5 w-5" />}
      title={<Trans>Active Lists</Trans>}
      value={activeLists.length}
      trend="+2 this week"
      color="primary"
    />
    <StatsCard
      icon={<ShoppingBagIcon className="h-5 w-5" />}
      title={<Trans>Total Items</Trans>}
      value={lists.reduce((acc, list) => acc + list.totalItems, 0)}
      trend="23 completed"
      color="success"
    />
    <StatsCard
      icon={<ArchiveIcon className="h-5 w-5" />}
      title={<Trans>Completed</Trans>}
      value={completedLists.length}
      trend="4 this month"
      color="warning"
    />
  </div>
);
