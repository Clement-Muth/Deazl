"use client";

import { Button, Card, CardBody, Chip } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { StoreIcon } from "lucide-react";
import type { StoreInfo } from "~/applications/ShoppingLists/Api/getStores.api";
import { Modal } from "~/components/Modal/Modal";

interface FavoriteStoresModalProps {
  isOpen: boolean;
  onClose: () => void;
  allStores: StoreInfo[];
  favoriteStores: StoreInfo[];
  isSaving: boolean;
  onToggleFavorite: (storeId: string) => void;
  onSave: () => void;
}

export const FavoriteStoresModal = ({
  isOpen,
  onClose,
  allStores,
  favoriteStores,
  isSaving,
  onToggleFavorite,
  onSave
}: FavoriteStoresModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header={<Trans>Manage Favorite Stores</Trans>}
      sheetHeight="xl"
      body={
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            <Trans>
              Select your favorite stores. When no specific store is selected, prices from these stores will
              be prioritized.
            </Trans>
          </p>

          <div className="space-y-2">
            {allStores.map((store) => {
              const isFavorite = favoriteStores.some((fav) => fav.id === store.id);
              return (
                <Card
                  key={store.id}
                  className={`flex items-center justify-between p-3 transition-colors cursor-pointer ${
                    isFavorite ? "bg-primary-50" : ""
                  }`}
                  onPress={() => onToggleFavorite(store.id)}
                  isPressable
                  fullWidth
                >
                  <CardBody className="flex flex-row justify-between">
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
                        <p className="text-sm font-medium text-foreground">{store.name}</p>
                        <p className="text-xs text-gray-500">{store.location}</p>
                      </div>
                    </div>
                    {isFavorite && (
                      <Chip color="primary" variant="flat" size="sm">
                        ★
                      </Chip>
                    )}
                  </CardBody>
                </Card>
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
          <Button color="primary" onPress={onSave} isLoading={isSaving}>
            <Trans>Save</Trans>
          </Button>
        </div>
      }
    />
  );
};
