"use client";

import { Divider } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { SettingsFavoriteStores } from "~/applications/Profile/Ui/Settings/FavoriteStores/FavoriteStores";
import { SettingsOptimalPricing } from "~/applications/Profile/Ui/Settings/OptimalPricing/OptimalPricing";
import { SettingCard } from "./SettingCard";

interface ShoppingOptimizationSectionProps {
  userId: string;
}

export const ShoppingOptimizationSection = ({ userId }: ShoppingOptimizationSectionProps) => {
  return (
    <SettingCard
      title={<Trans>Shopping Optimization</Trans>}
      subTitle={<Trans>Configure how prices are selected for your shopping lists</Trans>}
    >
      <div className="space-y-4">
        <SettingsOptimalPricing />
        <Divider />
        <SettingsFavoriteStores userId={userId} />
      </div>
    </SettingCard>
  );
};
