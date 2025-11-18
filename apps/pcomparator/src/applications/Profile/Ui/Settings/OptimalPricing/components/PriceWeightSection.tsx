"use client";

import { Slider } from "@heroui/react";
import { Trans } from "@lingui/react/macro";

interface PriceWeightSectionProps {
  priceWeight?: number;
  onPriceWeightChange: (weight: number) => void;
}

export const PriceWeightSection = ({ priceWeight, onPriceWeightChange }: PriceWeightSectionProps) => {
  const currentWeight = priceWeight ?? 0.7;

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-foreground">
          <Trans>Price vs Distance priority</Trans>
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          <Trans>Balance between best price and proximity</Trans>
        </p>
      </div>
      <Slider
        size="sm"
        step={0.01}
        minValue={0}
        maxValue={1}
        value={currentWeight}
        onChange={(value) => {
          const numValue = Array.isArray(value) ? value[0] : value;
          onPriceWeightChange(numValue);
        }}
        className="max-w-md"
        getValue={(value) => {
          const val = Array.isArray(value) ? value[0] : value;
          const pricePct = Math.round(val * 100);
          const distPct = 100 - pricePct;
          return `💰 ${pricePct}% / 🚗 ${distPct}%`;
        }}
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          <Trans>Distance</Trans> ({Math.round((1 - currentWeight) * 100)}%)
        </span>
        <span>
          <Trans>Price</Trans> ({Math.round(currentWeight * 100)}%)
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {currentWeight >= 0.7 ? (
          <Trans>Prioritize low prices, even if the store is further away</Trans>
        ) : currentWeight >= 0.5 ? (
          <Trans>Balance between price and proximity</Trans>
        ) : (
          <Trans>Prioritize nearby stores, even if prices are higher</Trans>
        )}
      </p>
    </div>
  );
};
