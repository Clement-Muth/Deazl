"use client";

import { Button } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { SettingsIcon } from "lucide-react";

interface OptimalPricingHeaderProps {
  onConfigure: () => void;
}

export const OptimalPricingHeader = ({ onConfigure }: OptimalPricingHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
          <SettingsIcon className="h-5 w-5 text-gray-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            <Trans>Optimal pricing settings</Trans>
          </h3>
          <p className="text-xs text-gray-400">
            <Trans>Configure how prices are selected</Trans>
          </p>
        </div>
      </div>
      <Button size="sm" color="primary" variant="flat" onPress={onConfigure}>
        <Trans>Configure</Trans>
      </Button>
    </div>
  );
};
