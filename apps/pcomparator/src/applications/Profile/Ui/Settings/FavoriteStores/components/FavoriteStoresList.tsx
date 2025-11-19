"use client";

import { Chip } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import type { StoreInfo } from "~/applications/ShoppingLists/Api/getStores.api";

interface FavoriteStoresListProps {
  favoriteStores: StoreInfo[];
}

export const FavoriteStoresList = ({ favoriteStores }: FavoriteStoresListProps) => {
  if (favoriteStores.length > 0) {
    return (
      <div className="flex flex-wrap gap-2">
        {favoriteStores.map((store) => (
          <Chip key={store.id} color="primary" variant="flat" size="sm">
            {store.name}
          </Chip>
        ))}
      </div>
    );
  }

  return (
    <p className="text-sm text-gray-500 text-center">
      <Trans>No favorite stores configured</Trans>
    </p>
  );
};
