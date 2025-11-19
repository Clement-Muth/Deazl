"use client";

import { Spinner } from "@heroui/react";
import { useFavoriteStores } from "~/applications/Profile/Ui/Settings/FavoriteStores/useFavoriteStores";
import { FavoriteStoresHeader, FavoriteStoresList, FavoriteStoresModal } from "./components";

interface SettingsFavoriteStoresProps {
  userId: string;
}

export const SettingsFavoriteStores = ({ userId }: SettingsFavoriteStoresProps) => {
  const { favoriteStores, allStores, isLoading, isSaving, modal, actions } = useFavoriteStores();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <FavoriteStoresHeader onManageClick={modal.onOpen} />
        <FavoriteStoresList favoriteStores={favoriteStores} />
      </div>

      <FavoriteStoresModal
        isOpen={modal.isOpen}
        onClose={modal.onClose}
        allStores={allStores}
        favoriteStores={favoriteStores}
        isSaving={isSaving}
        onToggleFavorite={actions.toggleFavorite}
        onSave={actions.saveFavorites}
      />
    </>
  );
};
