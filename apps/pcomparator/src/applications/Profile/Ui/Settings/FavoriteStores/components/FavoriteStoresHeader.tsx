"use client";

import { Button } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { PlusIcon, StoreIcon } from "lucide-react";

interface FavoriteStoresHeaderProps {
  onManageClick: () => void;
}

export const FavoriteStoresHeader = ({ onManageClick }: FavoriteStoresHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
          <StoreIcon className="h-5 w-5 text-foreground-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            <Trans>Favorite Stores</Trans>
          </h3>
          <p className="text-xs text-gray-400">
            <Trans>Priority stores for price selection</Trans>
          </p>
        </div>
      </div>
      <Button
        size="sm"
        color="primary"
        variant="flat"
        onPress={onManageClick}
        startContent={<PlusIcon className="h-4 w-4" />}
      >
        <Trans>Manage</Trans>
      </Button>
    </div>
  );
};
