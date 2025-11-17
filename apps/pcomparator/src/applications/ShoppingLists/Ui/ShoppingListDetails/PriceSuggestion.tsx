"use client";

import { Trans } from "@lingui/react/macro";
import { ArrowRight, MapPin, TrendingDown } from "lucide-react";
import type { ItemOptimalPrice, OptimalPriceResult } from "../../Domain/Services/OptimalPricingService";

interface PriceSuggestionProps {
  optimalPrice: OptimalPriceResult;
  optimalPriceInfo?: ItemOptimalPrice;
  currentUnitPrice?: number | null;
  quantity: number;
  isStoreSelected?: boolean;
}

export const PriceSuggestion = ({
  optimalPrice,
  optimalPriceInfo,
  currentUnitPrice,
  quantity,
  isStoreSelected = false
}: PriceSuggestionProps) => {
  const displayedPrice = optimalPrice.price.amount;
  const distanceKm = optimalPrice.distanceKm;

  // Meilleure alternative disponible si l'utilisateur a sélectionné un magasin préféré
  const betterAlternative = optimalPrice.betterAlternative;

  // When store is selected: show if better alternative exists
  // When no store selected: compare current price with best price
  const hasBetterPrice = isStoreSelected
    ? !!betterAlternative && betterAlternative.savings > 0
    : currentUnitPrice && currentUnitPrice > displayedPrice;

  const savingsPerUnit = hasBetterPrice
    ? isStoreSelected && betterAlternative
      ? betterAlternative.savings
      : currentUnitPrice! - displayedPrice
    : 0;
  const totalSavings = savingsPerUnit * quantity;

  // Affichage ultra-compact en ligne avec distance
  return (
    <span className="inline-flex items-center gap-1.5 flex-wrap">
      <span className="text-gray-400">•</span>
      {isStoreSelected ? (
        // Mode: Store selected - show selected store's price and comparison
        <>
          <span className="text-xs font-bold text-primary-700">
            {displayedPrice.toFixed(2)}€/{optimalPrice.price.unit}
          </span>
          <span className="text-xs text-gray-500">@</span>
          <span className="text-xs font-medium text-primary-600">{optimalPrice.price.storeName}</span>
          {distanceKm !== undefined && (
            <span className="inline-flex items-center gap-0.5 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              {distanceKm.toFixed(1)}km
            </span>
          )}
          {hasBetterPrice && betterAlternative ? (
            <>
              <span className="text-xs text-gray-400">|</span>
              <TrendingDown className="h-3 w-3 text-orange-600" />
              <span className="text-xs text-orange-700">
                <Trans>
                  -{totalSavings.toFixed(2)}€ @ {betterAlternative.price.storeName}
                </Trans>
              </span>
              {betterAlternative.distanceKm !== undefined && (
                <span className="inline-flex items-center gap-0.5 text-xs text-orange-600">
                  <MapPin className="h-3 w-3" />
                  {betterAlternative.distanceKm.toFixed(1)}km
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-green-700">✓</span>
          )}
        </>
      ) : (
        // Mode: No store selected - show optimal price (best price + distance)
        <>
          {hasBetterPrice ? (
            <>
              <ArrowRight className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-bold text-blue-700">
                {displayedPrice.toFixed(2)}€/{optimalPrice.price.unit}
              </span>
              <span className="text-xs text-gray-500">@</span>
              <span className="text-xs font-medium text-blue-600">{optimalPrice.price.storeName}</span>
              {distanceKm !== undefined && (
                <span className="inline-flex items-center gap-0.5 text-xs text-blue-600">
                  <MapPin className="h-3 w-3" />
                  {distanceKm.toFixed(1)}km
                </span>
              )}
              <TrendingDown className="h-3 w-3 text-success-600" />
              <span className="text-xs font-bold text-success-700">
                <Trans>-{totalSavings.toFixed(2)}€</Trans>
              </span>
            </>
          ) : (
            <>
              <span className="text-xs font-bold text-green-700">
                {displayedPrice.toFixed(2)}€/{optimalPrice.price.unit}
              </span>
              <span className="text-xs text-gray-500">@</span>
              <span className="text-xs font-medium text-green-600">{optimalPrice.price.storeName}</span>
              {distanceKm !== undefined && (
                <span className="inline-flex items-center gap-0.5 text-xs text-green-600">
                  <MapPin className="h-3 w-3" />
                  {distanceKm.toFixed(1)}km
                </span>
              )}
              <span className="text-xs text-green-700">✓</span>
              {optimalPriceInfo?.selectionReason === "best_price_distance" && (
                <span className="text-xs text-green-600">
                  <Trans>(optimal)</Trans>
                </span>
              )}
            </>
          )}
        </>
      )}
    </span>
  );
};
