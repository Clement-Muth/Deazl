"use client";

import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { Plus, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import type { ShoppingListPayload } from "~/applications/ShoppingLists/Domain/Schemas/ShoppingList.schema";

interface RecentListsSectionProps {
  recentLists: ShoppingListPayload[];
}

export function RecentListsSection({ recentLists }: RecentListsSectionProps) {
  return (
    <Card>
      <CardHeader className="flex justify-between items-center px-4 sm:px-6 py-4">
        <h2 className="text-lg sm:text-xl font-bold">
          <Trans>Recent Shopping Lists</Trans>
        </h2>
        <Button as={Link} href="/shopping-lists" size="sm" variant="light" color="primary">
          <Trans>View All</Trans>
        </Button>
      </CardHeader>
      <CardBody className="px-4 sm:px-6 pb-4 sm:pb-6">
        {recentLists.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <ShoppingBasket className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-300 mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
              <Trans>No shopping lists yet</Trans>
            </p>
            <Button as={Link} href="/shopping-lists/create" color="primary" size="sm" startContent={<Plus />}>
              <Trans>Create Your First List</Trans>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col space-y-3">
            {recentLists.slice(0, 5).map((list) => (
              <Link key={list.id} href={`/shopping-lists/${list.id}`}>
                <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <CardBody className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{list.name}</h3>
                        {list.description && (
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                            {list.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>{list.items?.length || 0} items</span>
                          {list.items && list.items.length > 0 && (
                            <span>
                              {list.items.filter((i) => i.isCompleted).length}/{list.items.length} completed
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs text-gray-500">
                          {list.updatedAt ? new Date(list.updatedAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
