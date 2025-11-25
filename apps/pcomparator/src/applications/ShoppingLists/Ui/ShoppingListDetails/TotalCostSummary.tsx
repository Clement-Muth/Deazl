"use client";

import { Card, CardBody, Chip } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { ShoppingCart, Store, TrendingDown } from "lucide-react";

interface TotalCostSummaryProps {
  totalCost: number;
  potentialSavings: number;
  storeSummary: Array<{ storeId: string; storeName: string; itemCount: number; subtotal: number }>;
  itemCount: number;
  completedCount: number;
  currency?: string;
}

export const TotalCostSummary = ({
  totalCost,
  potentialSavings,
  storeSummary,
  itemCount,
  completedCount,
  currency = "EUR"
}: TotalCostSummaryProps) => {
  const hasSavings = potentialSavings > 0;
  const savingsPercentage = totalCost > 0 ? (potentialSavings / (totalCost + potentialSavings)) * 100 : 0;
  const optimizedTotal = totalCost;

  const bestStoreName = storeSummary.length > 0 ? storeSummary[0].storeName : undefined;

  return (
    <Card shadow="sm">
      <CardBody>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">
                <Trans>Total</Trans> · {completedCount}/{itemCount}
              </p>
              <p className="text-2xl font-bold">{optimizedTotal.toFixed(2)}€</p>
            </div>
          </div>

          {hasSavings && bestStoreName ? (
            <div className="flex items-center gap-2 bg-success-50 px-3 py-2 rounded-lg border border-success-200">
              <div className="text-right">
                <p className="text-xs text-success-600 flex items-center gap-1">
                  <Store className="h-3 w-3" />
                  <Trans>Best at</Trans> {bestStoreName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <TrendingDown className="h-4 w-4 text-success-600" />
                  <span className="text-sm font-bold text-gray-400">-{potentialSavings.toFixed(2)}€</span>
                  <Chip size="sm" color="success" variant="flat" className="h-5">
                    <span className="text-xs font-semibold">-{savingsPercentage.toFixed(0)}%</span>
                  </Chip>
                </div>
              </div>
            </div>
          ) : (
            !hasSavings && (
              <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                <p className="text-xs text-green-700 font-medium">
                  ✓ <Trans>Best prices</Trans>
                </p>
              </div>
            )
          )}
        </div>
      </CardBody>
    </Card>
  );
};
