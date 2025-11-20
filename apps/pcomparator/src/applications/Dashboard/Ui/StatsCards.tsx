"use client";

import { Card, CardBody } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { ListChecks, Sparkles } from "lucide-react";

interface StatsCardsProps {
  stats?: {
    totalLists: number;
    completedItems: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
      <Card>
        <CardBody className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 p-2 sm:p-3 rounded-lg">
              <ListChecks className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <Trans>Shopping Lists</Trans>
              </p>
              <p className="text-xl sm:text-2xl font-bold">{stats.totalLists}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <Trans>Items Completed</Trans>
              </p>
              <p className="text-xl sm:text-2xl font-bold">{stats.completedItems}</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
