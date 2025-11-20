"use client";

import { Card, CardBody } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { Box, ChefHat, Package, Plus, Receipt, ShoppingBasket } from "lucide-react";
import Link from "next/link";

export function QuickActionsGrid() {
  return (
    <>
      {/* Primary Quick Actions */}
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

      {/* Secondary Quick Actions */}
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
    </>
  );
}
