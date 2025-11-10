"use client";

import { Trans } from "@lingui/react/macro";
import { ArrowRight, TrendingDown } from "lucide-react";
import type { BestPriceResult } from "../../Domain/Utils/priceComparison";

interface PriceSuggestionProps {
  bestPrice: BestPriceResult;
  currentUnitPrice?: number | null;
  quantity: number;
  isStoreSelected?: boolean;
}

export const PriceSuggestion = ({
  bestPrice,
  currentUnitPrice,
  quantity,
  isStoreSelected = false
}: PriceSuggestionProps) => {
  const displayedPrice = bestPrice.price.amount;

  // When store is selected: bestPrice.savings is the difference (storePrice - bestPrice)
  // Positive means store is more expensive, negative means store is cheaper
  // When no store selected: compare current price with best price
  const hasBetterPrice = isStoreSelected
    ? bestPrice.savings > 0 // positive savings means selected store is more expensive
    : currentUnitPrice && currentUnitPrice > displayedPrice;

  const savingsPerUnit = hasBetterPrice
    ? isStoreSelected
      ? bestPrice.savings
      : currentUnitPrice! - displayedPrice
    : 0;
  const totalSavings = savingsPerUnit * quantity;

  // Affichage ultra-compact en ligne
  return (
    <span className="inline-flex items-center gap-1.5 flex-wrap">
      <span className="text-gray-400">•</span>
      {isStoreSelected ? (
        // Mode: Store selected - show selected store's price and comparison
        <>
          <span className="text-xs font-bold text-primary-700">
            {displayedPrice.toFixed(2)}€/{bestPrice.price.unit}
          </span>
          <span className="text-xs text-gray-500">@</span>
          <span className="text-xs font-medium text-primary-600">{bestPrice.price.storeName}</span>
          {hasBetterPrice ? (
            <>
              <span className="text-xs text-gray-400">|</span>
              <TrendingDown className="h-3 w-3 text-orange-600" />
              <span className="text-xs text-orange-700">
                <Trans>+{totalSavings.toFixed(2)}€ vs best</Trans>
              </span>
            </>
          ) : (
            <span className="text-xs text-green-700">✓</span>
          )}
        </>
      ) : (
        // Mode: No store selected - show best price suggestion
        <>
          {hasBetterPrice ? (
            <>
              <ArrowRight className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-bold text-blue-700">
                {displayedPrice.toFixed(2)}€/{bestPrice.price.unit}
              </span>
              <span className="text-xs text-gray-500">@</span>
              <span className="text-xs font-medium text-blue-600">{bestPrice.price.storeName}</span>
              <TrendingDown className="h-3 w-3 text-success-600" />
              <span className="text-xs font-bold text-success-700">
                <Trans>-{totalSavings.toFixed(2)}€</Trans>
              </span>
            </>
          ) : (
            <>
              <span className="text-xs font-bold text-green-700">
                {displayedPrice.toFixed(2)}€/{bestPrice.price.unit}
              </span>
              <span className="text-xs text-gray-500">@</span>
              <span className="text-xs font-medium text-green-600">{bestPrice.price.storeName}</span>
              <span className="text-xs text-green-700">✓</span>
            </>
          )}
        </>
      )}
    </span>
  );
};
