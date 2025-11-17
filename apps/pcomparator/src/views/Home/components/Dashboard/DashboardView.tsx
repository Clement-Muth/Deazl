"use client";

import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import {
  Box,
  ChefHat,
  ListChecks,
  Package,
  Plus,
  Receipt,
  ShoppingBasket,
  Sparkles,
  TrendingDown
} from "lucide-react";
import Link from "next/link";
import type { ShoppingListPayload } from "~/applications/ShoppingLists/Domain/Schemas/ShoppingList.schema";

interface DashboardViewProps {
  userName?: string;
  recentLists: ShoppingListPayload[];
  stats?: {
    totalLists: number;
    completedItems: number;
    totalSavings: number;
  };
}

export function DashboardView({ userName, recentLists, stats }: DashboardViewProps) {
  return (
    <div className="flex flex-1 flex-col w-full px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header - Mobile First */}
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
          <Trans>Welcome back, {userName || "there"}</Trans>
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          <Trans>Let's find the best deals for your shopping!</Trans>
        </p>
      </div>

      {/* Quick Actions - Mobile First Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Link href="/shopping-lists/create" className="block">
          <Card className="hover:scale-105 transition-transform cursor-pointer border-2 border-primary-100 hover:border-primary-300">
            <CardBody className="flex flex-col items-center justify-center p-4 sm:p-6 gap-2">
              <div className="bg-primary-100 p-3 rounded-full">
                <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-center">
                <Trans>New List</Trans>
              </span>
            </CardBody>
          </Card>
        </Link>

        <Link href="/shopping-lists" className="block">
          <Card className="hover:scale-105 transition-transform cursor-pointer">
            <CardBody className="flex flex-col items-center justify-center p-4 sm:p-6 gap-2">
              <div className="bg-blue-100 p-3 rounded-full">
                <ShoppingBasket className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-center">
                <Trans>My Lists</Trans>
              </span>
            </CardBody>
          </Card>
        </Link>

        <Link href="/recipes" className="block">
          <Card className="hover:scale-105 transition-transform cursor-pointer">
            <CardBody className="flex flex-col items-center justify-center p-4 sm:p-6 gap-2">
              <div className="bg-orange-100 p-3 rounded-full">
                <ChefHat className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-center">
                <Trans>Recipes</Trans>
              </span>
            </CardBody>
          </Card>
        </Link>

        <Link href="/pantry" className="block">
          <Card className="hover:scale-105 transition-transform cursor-pointer">
            <CardBody className="flex flex-col items-center justify-center p-4 sm:p-6 gap-2">
              <div className="bg-purple-100 p-3 rounded-full">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-center">
                <Trans>Pantry</Trans>
              </span>
            </CardBody>
          </Card>
        </Link>
      </div>

      {/* Secondary Quick Actions - Additional grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Link href="/dashboard/my-prices" className="block">
          <Card className="hover:scale-105 transition-transform cursor-pointer">
            <CardBody className="flex flex-col items-center justify-center p-4 sm:p-6 gap-2">
              <div className="bg-green-100 p-3 rounded-full">
                <Receipt className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-center">
                <Trans>My Prices</Trans>
              </span>
            </CardBody>
          </Card>
        </Link>

        <Link href="/products" className="block">
          <Card className="hover:scale-105 transition-transform cursor-pointer">
            <CardBody className="flex flex-col items-center justify-center p-4 sm:p-6 gap-2">
              <div className="bg-indigo-100 p-3 rounded-full">
                <Box className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-center">
                <Trans>Products</Trans>
              </span>
            </CardBody>
          </Card>
        </Link>
      </div>

      {/* Stats Cards - Mobile Optimized */}
      {stats && (
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

          <Card>
            <CardBody className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 sm:p-3 rounded-lg">
                  <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <Trans>Total Savings</Trans>
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.totalSavings.toFixed(2)}€</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Recent Lists - Mobile Optimized */}
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
              <Button
                as={Link}
                href="/shopping-lists/create"
                color="primary"
                size="sm"
                startContent={<Plus />}
              >
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
    </div>
  );
}
