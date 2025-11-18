"use client";

import { Button, Input, addToast } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { MapPinIcon, StoreIcon } from "lucide-react";
import { useState } from "react";
import { createStore } from "~/applications/ShoppingLists/Api/createStore.api";
import { Modal } from "~/components/Modal/Modal";

interface AddStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoreCreated: (store: { id: string; name: string; location: string }) => void;
}

export const AddStoreModal = ({ isOpen, onClose, onStoreCreated }: AddStoreModalProps) => {
  const { t } = useLingui();
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreLocation, setNewStoreLocation] = useState("");
  const [isCreatingStore, setIsCreatingStore] = useState(false);

  const handleCreateStore = async () => {
    if (!newStoreName.trim() || !newStoreLocation.trim()) {
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Both store name and location are required</Trans>,
        variant: "solid",
        color: "danger"
      });
      return;
    }

    setIsCreatingStore(true);
    try {
      const newStore = await createStore({
        name: newStoreName.trim(),
        location: newStoreLocation.trim()
      });

      onStoreCreated({
        id: newStore.id,
        name: newStore.name,
        location: newStore.location
      });

      addToast({
        title: <Trans>Store created</Trans>,
        description: <Trans>{newStoreName} has been added and selected</Trans>,
        variant: "solid",
        color: "success"
      });

      setNewStoreName("");
      setNewStoreLocation("");
      onClose();
    } catch (error) {
      console.error("Error creating store:", error);
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Failed to create store</Trans>,
        variant: "solid",
        color: "danger"
      });
    } finally {
      setIsCreatingStore(false);
    }
  };

  const handleClose = () => {
    if (!isCreatingStore) {
      setNewStoreName("");
      setNewStoreLocation("");
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      header={
        <>
          <Trans>Add New Store</Trans>
          <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
            <Trans>Create a new store to track prices</Trans>
          </p>
        </>
      }
      body={
        <>
          <Input
            label={t`Store Name`}
            placeholder={t`e.g., Carrefour, Auchan, etc.`}
            value={newStoreName}
            onValueChange={setNewStoreName}
            isRequired
            size="lg"
            autoFocus
            startContent={<StoreIcon className="h-4 w-4" />}
          />
          <Input
            label={t`Location`}
            placeholder={t`e.g., Paris, Lyon, etc.`}
            value={newStoreLocation}
            onValueChange={setNewStoreLocation}
            isRequired
            size="lg"
            startContent={<MapPinIcon className="h-4 w-4" />}
          />
        </>
      }
      footer={
        <div className="flex w-full gap-4">
          <Button variant="solid" onPress={handleClose} isDisabled={isCreatingStore} size="lg">
            <Trans>Cancel</Trans>
          </Button>
          <Button color="primary" onPress={handleCreateStore} isLoading={isCreatingStore} size="lg" fullWidth>
            <Trans>Create Store</Trans>
          </Button>
        </div>
      }
    />
  );
};
