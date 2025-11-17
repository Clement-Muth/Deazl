import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  addToast
} from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { MapPinIcon, SaveIcon, StoreIcon } from "lucide-react";
import { useState } from "react";
import { createStore } from "../../Api/createStore.api";
import { useStore } from "../Contexts/StoreContext";
import type { StoreInfo } from "../Contexts/StoreContext";

interface AddStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddStoreModal = ({ isOpen, onClose }: AddStoreModalProps) => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshStores, setSelectedStore } = useStore();

  const handleSubmit = async () => {
    if (!name || !location) {
      addToast({
        title: <Trans>Missing information</Trans>,
        description: <Trans>Both name and location are required</Trans>,
        color: "warning",
        variant: "solid"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newStore = await createStore({
        name,
        location
      });

      await refreshStores();

      setSelectedStore({
        id: newStore.id,
        name: newStore.name,
        location: newStore.location
      } as StoreInfo);

      addToast({
        title: <Trans>Store created</Trans>,
        description: <Trans>Your new store has been added and selected</Trans>,
        color: "success",
        variant: "solid"
      });

      setName("");
      setLocation("");
      onClose();
    } catch (error) {
      console.error("Error creating store:", error);
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Failed to create store</Trans>,
        color: "danger",
        variant: "solid"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} classNames={{ backdrop: "backdrop-blur-sm" }}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <StoreIcon className="h-5 w-5 text-primary-600" />
            <Trans>Add New Store</Trans>
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              <Trans>
                Add a new store to track prices and products. This information will help you compare prices
                across different stores.
              </Trans>
            </p>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium flex items-center gap-1">
                <StoreIcon size={16} className="text-primary-600" />
                <Trans>Store Name</Trans>
              </label>
              <Input
                id="name"
                placeholder="e.g., Carrefour, Auchan, etc."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium flex items-center gap-1">
                <MapPinIcon size={16} className="text-blue-600" />
                <Trans>Location</Trans>
              </label>
              <Input
                id="location"
                placeholder="e.g., City Center, Downtown, etc."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="flat" onPress={onClose} className="flex-1">
            <Trans>Cancel</Trans>
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            startContent={<SaveIcon size={16} />}
            className="flex-1"
            isDisabled={!name || !location || isSubmitting}
          >
            <Trans>Create Store</Trans>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
