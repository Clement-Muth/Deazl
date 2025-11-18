"use client";

import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { SettingsFavoriteStores } from "~/applications/Profile/Ui/Settings/FavoriteStores/FavoriteStores";
import { SettingsOptimalPricing } from "~/applications/Profile/Ui/Settings/OptimalPricing/OptimalPricing";

interface ShoppingOptimizationSectionProps {
  userId: string;
}

export const ShoppingOptimizationSection = ({ userId }: ShoppingOptimizationSectionProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-col items-start">
        <h2 className="text-base md:text-lg font-semibold">
          <Trans>Shopping Optimization</Trans>
        </h2>
        <p className="text-xs md:text-sm text-foreground-400 mt-1">
          <Trans>Configure how prices are selected for your shopping lists</Trans>
        </p>
      </CardHeader>
      <Divider />
      <CardBody className="gap-6">
        <SettingsOptimalPricing />
        <Divider />
        <SettingsFavoriteStores userId={userId} />
      </CardBody>
    </Card>
  );
};
