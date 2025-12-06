"use client";

import { Button, Card, CardBody } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { Check, ChevronRight, Clock, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import type { ShoppingListPayload } from "~/applications/ShoppingLists/Domain/Schemas/ShoppingList.schema";

interface RecentActivityWidgetProps {
  lists: ShoppingListPayload[];
}

export function RecentActivityWidget({ lists }: RecentActivityWidgetProps) {
  const recentLists = lists.slice(0, 3);
  const hasLists = recentLists.length > 0;

  const getProgress = (list: ShoppingListPayload) => {
    if (list.totalItems === 0) return 0;
    return Math.round((list.completedItems / list.totalItems) * 100);
  };

  const getTimeAgo = (date: Date | string | null | undefined): string => {
    if (!date) return "";
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  if (!hasLists) {
    return (
      <Card className="shadow-sm border-none">
        <CardBody className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
              <ShoppingBag className="h-5 w-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-default-700">
                <Trans>Shopping Lists</Trans>
              </p>
              <p className="text-xs text-default-500">
                <Trans>Create your first list</Trans>
              </p>
            </div>
            <Link href="/shopping-lists/create">
              <Button
                size="sm"
                color="primary"
                startContent={<Plus className="h-3.5 w-3.5" />}
                className="min-h-9 touch-manipulation"
              >
                <Trans>New</Trans>
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-none">
      <CardBody className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <ShoppingBag className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-default-700">
              <Trans>Recent Lists</Trans>
            </h3>
          </div>
          <Link
            href="/shopping-lists"
            className="text-xs text-primary-600 hover:underline flex items-center gap-0.5 touch-manipulation"
          >
            <Trans>See all</Trans>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-2">
          {recentLists.map((list) => {
            const progress = getProgress(list);
            const isComplete = progress === 100;

            return (
              <Link key={list.id} href={`/shopping-lists/${list.id}`} className="block">
                <div className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-default-100 dark:hover:bg-default-50 transition-colors touch-manipulation">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isComplete
                        ? "bg-success-100 dark:bg-success-900/30"
                        : "bg-default-100 dark:bg-default-50"
                    }`}
                  >
                    {isComplete ? (
                      <Check className="h-5 w-5 text-success-600" />
                    ) : (
                      <ShoppingBag className="h-5 w-5 text-default-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-default-700 truncate flex-1">{list.name}</p>
                      {list.updatedAt && (
                        <span className="text-xs text-default-400 flex items-center gap-0.5 shrink-0">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(list.updatedAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1 bg-default-100 dark:bg-default-50 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isComplete ? "bg-success-500" : "bg-primary-500"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-default-500 shrink-0">
                        {list.completedItems}/{list.totalItems}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-default-400 shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>

        <Link href="/shopping-lists/create" className="block mt-3">
          <Button
            variant="flat"
            color="primary"
            size="sm"
            fullWidth
            startContent={<Plus className="h-4 w-4" />}
            className="min-h-10 touch-manipulation"
          >
            <Trans>New Shopping List</Trans>
          </Button>
        </Link>
      </CardBody>
    </Card>
  );
}
