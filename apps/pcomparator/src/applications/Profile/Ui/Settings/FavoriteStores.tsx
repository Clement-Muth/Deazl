"use client";

import { Button, Chip, Spinner, addToast, useDisclosure } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { PlusIcon, StoreIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Modal } from "~/components/Modal/Modal";
import { getStores } from "~/packages/applications/shopping-lists/src/Api/getStores.api";
import type { StoreInfo } from "~/packages/applications/shopping-lists/src/Api/getStores.api";
import {
  getUserOptimizationPreferences,
  updateUserOptimizationPreferences
} from "~/packages/applications/shopping-lists/src/Api/preferences/optimizationPreferences.api";

interface SettingsFavoriteStoresProps {
  userId: string;
}

export const SettingsFavoriteStores = ({ userId }: SettingsFavoriteStoresProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [favoriteStoreIds, setFavoriteStoreIds] = useState<string[]>([]);
  const [allStores, setAllStores] = useState<StoreInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [preferences, stores] = await Promise.all([getUserOptimizationPreferences(), getStores()]);

      // Récupérer favoriteStoreIds depuis les préférences
      const favoriteIds = preferences.favoriteStoreIds || [];
      setFavoriteStoreIds(favoriteIds);
      setAllStores(stores);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback((storeId: string) => {
    setFavoriteStoreIds((prev) => {
      if (prev.includes(storeId)) {
        return prev.filter((id) => id !== storeId);
      }
      return [...prev, storeId];
    });
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const result = await updateUserOptimizationPreferences({
        favoriteStoreIds
      });

      if (!result.success) {
        throw new Error(result.error || "Unknown error");
      }

      addToast({
        title: <Trans>Preferences saved</Trans>,
        description: <Trans>Your favorite stores have been updated</Trans>,
        color: "success",
        variant: "solid"
      });

      onClose();
      await loadData(); // Recharger pour rafraîchir l'affichage
    } catch (error) {
      console.error("Error saving favorites:", error);
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Unable to save favorite stores</Trans>,
        color: "danger",
        variant: "solid"
      });
    } finally {
      setIsSaving(false);
    }
  }, [favoriteStoreIds, onClose, loadData]);

  const favoriteStores = allStores.filter((s) => favoriteStoreIds.includes(s.id));

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <StoreIcon className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                <Trans>Favorite Stores</Trans>
              </h3>
              <p className="text-xs text-gray-500">
                <Trans>Priority stores for price selection</Trans>
              </p>
            </div>
          </div>
          <Button
            size="sm"
            color="primary"
            variant="flat"
            onPress={onOpen}
            startContent={<PlusIcon className="h-4 w-4" />}
          >
            <Trans>Manage</Trans>
          </Button>
        </div>

        {/* Current favorites */}
        {favoriteStores.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {favoriteStores.map((store) => (
              <Chip key={store.id} color="primary" variant="flat" size="sm">
                {store.name}
              </Chip>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              <Trans>No favorite stores configured</Trans>
            </p>
          </div>
        )}
      </div>

      {/* Favorites Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        header={<Trans>Manage Favorite Stores</Trans>}
        body={
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              <Trans>
                Select your favorite stores. When no specific store is selected, prices from these stores will
                be prioritized.
              </Trans>
            </p>

            <div className="space-y-2">
              {allStores.map((store) => {
                const isFavorite = favoriteStoreIds.includes(store.id);
                return (
                  <div
                    key={store.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                      isFavorite
                        ? "border-primary-300 bg-primary-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                    onClick={() => toggleFavorite(store.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          isFavorite ? "bg-primary-100" : "bg-gray-100"
                        }`}
                      >
                        <StoreIcon
                          className={`h-4 w-4 ${isFavorite ? "text-primary-600" : "text-gray-600"}`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{store.name}</p>
                        <p className="text-xs text-gray-500">{store.location}</p>
                      </div>
                    </div>
                    {isFavorite && (
                      <Chip color="primary" variant="flat" size="sm">
                        ★
                      </Chip>
                    )}
                  </div>
                );
              })}
            </div>

            {allStores.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <StoreIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  <Trans>No stores available</Trans>
                </p>
              </div>
            )}
          </div>
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button color="default" variant="flat" onPress={onClose} isDisabled={isSaving}>
              <Trans>Cancel</Trans>
            </Button>
            <Button color="primary" onPress={handleSave} isLoading={isSaving}>
              <Trans>Save</Trans>
            </Button>
          </div>
        }
      />
    </>
  );
};
