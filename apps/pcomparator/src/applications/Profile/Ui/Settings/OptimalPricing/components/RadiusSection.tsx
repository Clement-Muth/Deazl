"use client";

import { Slider } from "@heroui/react";
import { Trans } from "@lingui/react/macro";

interface RadiusSectionProps {
  maxRadiusKm?: number;
  onRadiusChange: (radius: number) => void;
}

export const RadiusSection = ({ maxRadiusKm, onRadiusChange }: RadiusSectionProps) => {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-foreground">
          <Trans>Maximum radius</Trans>
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          <Trans>Only show stores within this distance</Trans>
        </p>
      </div>
      <Slider
        size="sm"
        step={1}
        minValue={1}
        maxValue={50}
        value={maxRadiusKm || 10}
        onChange={(value) => {
          const numValue = Array.isArray(value) ? value[0] : value;
          onRadiusChange(numValue);
        }}
        className="max-w-md"
        getValue={(value) => `${Array.isArray(value) ? value[0] : value} km`}
      />
    </div>
  );
};
