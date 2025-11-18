"use client";

import { Autocomplete, AutocompleteItem, Button, Input, addToast } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { MapPinIcon, StoreIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPrice } from "~/applications/Prices/Api/createPrice";
import { Currency } from "~/applications/Prices/Domain/ValueObjects/Currency";
import { getStores } from "~/applications/ShoppingLists/Api/getStores.api";
import { Modal } from "~/components/Modal/Modal";
import { UnitSelector } from "~/components/UnitSelector";
import { AddStoreModal } from "./AddStoreModal";

interface StoreInfo {
  id: string;
  name: string;
  location: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  scannedBarcode: string;
  productName: string;
  onProductNameChange: (name: string) => void;
  isFetchingProductInfo: boolean;
}

export const ProductFormModal = ({
  isOpen,
  onClose,
  scannedBarcode,
  productName,
  onProductNameChange,
  isFetchingProductInfo
}: ProductFormModalProps) => {
  const router = useRouter();
  const { t } = useLingui();

  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("unit");
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStores();
    }
  }, [isOpen]);

  const loadStores = async () => {
    setIsLoadingStores(true);
    try {
      const storesData = await getStores();
      setStores(storesData);
    } catch (error) {
      console.error("Failed to load stores:", error);
    } finally {
      setIsLoadingStores(false);
    }
  };

  const handleStoreCreated = (store: StoreInfo) => {
    setStores((prev) => [...prev, store]);
    setSelectedStore(store);
  };

  const handleSubmit = async () => {
    if (!productName.trim()) {
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Product name is required</Trans>,
        variant: "solid",
        color: "danger"
      });
      return;
    }

    if (!selectedStore) {
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Please select a store</Trans>,
        variant: "solid",
        color: "danger"
      });
      return;
    }

    if (!price || price <= 0) {
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Please enter a valid price</Trans>,
        variant: "solid",
        color: "danger"
      });
      return;
    }

    try {
      setIsLoading(true);

      await createPrice({
        productName: productName.trim(),
        barcode: scannedBarcode,
        storeName: selectedStore.name,
        location: selectedStore.location,
        amount: price,
        unit,
        currency: Currency.Euro
      });

      addToast({
        title: <Trans>Product added</Trans>,
        description: <Trans>{productName} has been added successfully</Trans>,
        variant: "solid",
        color: "success"
      });

      router.refresh();
      handleClose();
    } catch (error) {
      console.error("Error creating product:", error);
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Failed to create product</Trans>,
        variant: "solid",
        color: "danger"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setQuantity(1);
      setUnit("unit");
      setPrice(undefined);
      setSelectedStore(null);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        isForm
        header={
          <>
            <Trans>Add New Product</Trans>
            <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
              <Trans>Create a new product from barcode scan</Trans>
            </p>
          </>
        }
        body={
          <>
            <Input
              label={t`Product Name`}
              placeholder={t`e.g., Organic Apples`}
              value={productName}
              onValueChange={onProductNameChange}
              isRequired
              size="lg"
              isDisabled={isFetchingProductInfo}
              description={
                scannedBarcode && productName ? t`Name automatically filled from barcode scan` : undefined
              }
            />

            <Input label={t`Barcode`} value={scannedBarcode} size="lg" isReadOnly isDisabled />

            <div className="space-y-2">
              <Autocomplete
                label={t`Store`}
                placeholder={t`Select a store`}
                isRequired
                size="lg"
                selectedKey={selectedStore?.id}
                onSelectionChange={(key) => {
                  if (key === null) {
                    setSelectedStore(null);
                    return;
                  }
                  const store = stores.find((s) => s.id === key);
                  if (store) setSelectedStore(store);
                }}
                isLoading={isLoadingStores}
                startContent={<StoreIcon className="h-4 w-4" />}
              >
                {stores.map((store) => (
                  <AutocompleteItem key={store.id} textValue={`${store.name} ${store.location}`}>
                    <div className="flex items-start gap-2 py-1">
                      <div className="h-6 w-6 rounded bg-primary-50 flex items-center justify-center shrink-0">
                        <StoreIcon className="h-3.5 w-3.5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{store.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPinIcon className="h-3 w-3" />
                          {store.location}
                        </p>
                      </div>
                    </div>
                  </AutocompleteItem>
                ))}
              </Autocomplete>

              <Button
                size="sm"
                variant="flat"
                color="primary"
                onPress={() => setIsAddStoreModalOpen(true)}
                startContent={<StoreIcon className="h-4 w-4" />}
                className="w-full"
              >
                <Trans>+ New Store</Trans>
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                label={t`Quantity`}
                type="number"
                value={quantity.toString()}
                onValueChange={(value) => setQuantity(Number(value))}
                min="0.01"
                step="0.01"
                size="lg"
                isRequired
                className="flex-1"
              />
              <UnitSelector
                value={unit}
                onValueChange={setUnit}
                size="lg"
                className="flex-1"
                includeUnits="basic"
              />
            </div>

            <Input
              label={t`Price`}
              type="number"
              value={price?.toString() || ""}
              onValueChange={(value) => setPrice(value ? Number(value) : undefined)}
              min="0"
              step="0.01"
              size="lg"
              placeholder="0.00"
              isRequired
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">€</span>
                </div>
              }
            />
          </>
        }
        footer={
          <div className="flex w-full gap-4">
            <Button variant="solid" onPress={handleClose} isDisabled={isLoading} size="lg">
              <Trans>Cancel</Trans>
            </Button>
            <Button color="primary" onPress={handleSubmit} isLoading={isLoading} size="lg" fullWidth>
              <Trans>Create Product</Trans>
            </Button>
          </div>
        }
      />

      <AddStoreModal
        isOpen={isAddStoreModalOpen}
        onClose={() => setIsAddStoreModalOpen(false)}
        onStoreCreated={handleStoreCreated}
      />
    </>
  );
};
