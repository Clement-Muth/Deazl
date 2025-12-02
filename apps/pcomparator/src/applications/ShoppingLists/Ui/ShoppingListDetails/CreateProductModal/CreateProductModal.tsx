"use client";

import { BarcodeScannerWithUI } from "@deazl/components";
import { Autocomplete, AutocompleteItem, Button, Input, addToast, useDisclosure } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { MapPinIcon, ScanBarcode, StoreIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "~/components/Modal/Modal";
import { UnitSelector } from "~/components/UnitSelector";
import { createProductAndAddToList } from "../../../Api/createProductAndAddToList.api";
import { getStores } from "../../../Api/getStores.api";

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: string;
  initialName: string;
  initialQuantity?: number;
  initialUnit?: string;
  initialPrice?: number;
  initialBarcode?: string;
  onProductCreated?: (item: any) => void;
}

interface StoreInfo {
  id: string;
  name: string;
  location: string;
}

export const CreateProductModal = ({
  isOpen,
  onClose,
  listId,
  initialName,
  initialQuantity = 1,
  initialUnit = "unit",
  initialPrice,
  initialBarcode = "",
  onProductCreated
}: CreateProductModalProps) => {
  const { t } = useLingui();
  const [name, setName] = useState(initialName);
  const [barcode, setBarcode] = useState(initialBarcode);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [unit, setUnit] = useState(initialUnit);
  const [price, setPrice] = useState<number | undefined>(initialPrice);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  const { isOpen: isScannerOpen, onOpen: openScanner, onClose: closeScanner } = useDisclosure();
  const [isFetchingProductInfo, setIsFetchingProductInfo] = useState(false);

  // Load stores when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoadingStores(true);
      getStores()
        .then((storesData) => {
          setStores(storesData);
        })
        .catch((error) => {
          console.error("Failed to load stores:", error);
        })
        .finally(() => {
          setIsLoadingStores(false);
        });
    }
  }, [isOpen]);

  // Update form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setQuantity(initialQuantity);
      setUnit(initialUnit);
      setPrice(initialPrice);
      setBarcode(initialBarcode);
    }
  }, [isOpen, initialName, initialQuantity, initialUnit, initialPrice, initialBarcode]);

  const handleBarcodeScanned = async (scannedBarcode: string) => {
    setBarcode(scannedBarcode);
    closeScanner();

    // Try to fetch product info from Open Food Facts
    setIsFetchingProductInfo(true);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${scannedBarcode}.json`);

      if (response.ok) {
        const data = await response.json();

        if (data.status === 1 && data.product && data.product.product_name) {
          // Update the name field with Open Food Facts data
          setName(data.product.product_name);
          addToast({
            title: <Trans>Product found</Trans>,
            description: data.product.product_name,
            variant: "solid",
            color: "success"
          });
        } else {
          addToast({
            title: <Trans>Product not found</Trans>,
            description: <Trans>Barcode saved, but no product info found</Trans>,
            variant: "solid",
            color: "warning"
          });
        }
      }
    } catch (error) {
      console.warn("Failed to fetch Open Food Facts data:", error);
    } finally {
      setIsFetchingProductInfo(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Product name is required</Trans>,
        variant: "solid",
        color: "danger"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const newItem = await createProductAndAddToList({
        listId,
        productData: {
          name: name.trim(),
          barcode: barcode || undefined
        },
        itemData: {
          quantity,
          unit
        },
        priceData:
          price && selectedStore
            ? {
                amount: price,
                storeName: selectedStore.name,
                location: selectedStore.location
              }
            : undefined
      });

      addToast({
        title: <Trans>Product created</Trans>,
        description: <Trans>{name} has been added to your list</Trans>,
        variant: "solid",
        color: "success"
      });

      if (onProductCreated && newItem) {
        onProductCreated(newItem);
      }

      onClose();
    } catch (error) {
      console.error("Error creating product:", error);
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Failed to create product</Trans>,
        variant: "solid",
        color: "danger"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        isForm
        body={
          <div className="flex flex-col gap-4">
            {/* Product Name */}
            <Input
              label={t`Product Name`}
              placeholder={t`e.g., Organic Apples`}
              value={name}
              onValueChange={setName}
              isRequired
              size="lg"
              isDisabled={isFetchingProductInfo}
              description={
                barcode && name !== initialName ? t`Name automatically filled from barcode scan` : undefined
              }
            />

            {/* Barcode with Scanner */}
            <div className="flex gap-2 items-center">
              <Input
                label={t`Barcode (Optional)`}
                placeholder={t`Scan or enter barcode`}
                value={barcode}
                size="lg"
                onValueChange={setBarcode}
                className="flex-1"
              />
              <Button
                isIconOnly
                variant="flat"
                color="primary"
                className="w-16 h-16"
                onPress={openScanner}
                aria-label="Scan barcode"
              >
                <ScanBarcode />
              </Button>
            </div>

            {/* Quantity and Unit */}
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
                includeUnits="all"
              />
            </div>

            {/* Price (Optional) */}
            <Input
              label={t`Price (Optional)`}
              type="number"
              value={price?.toString() || ""}
              onValueChange={(value) => setPrice(value ? Number(value) : undefined)}
              min="0"
              step="0.01"
              size="lg"
              placeholder="0.00"
              description={price && !selectedStore ? t`Select a store to save the price` : undefined}
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">€</span>
                </div>
              }
            />

            {/* Store selection (shown only if price is entered) */}
            {price && price > 0 && (
              <Autocomplete
                label={t`Store`}
                placeholder={t`Select a store for this price`}
                isLoading={isLoadingStores}
                selectedKey={selectedStore?.id}
                onSelectionChange={(key) => {
                  const store = stores.find((s) => s.id === key);
                  setSelectedStore(store || null);
                }}
                startContent={<StoreIcon className="h-4 w-4" />}
                size="lg"
              >
                {stores.map((store) => (
                  <AutocompleteItem
                    key={store.id}
                    textValue={`${store.name} - ${store.location}`}
                    startContent={<MapPinIcon className="h-4 w-4" />}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{store.name}</span>
                      <span className="text-xs text-gray-500">{store.location}</span>
                    </div>
                  </AutocompleteItem>
                ))}
              </Autocomplete>
            )}
          </div>
        }
        header={
          <>
            <Trans>Create New Product</Trans>
            <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
              <Trans>Add a product that doesn't exist in our database</Trans>
            </p>
          </>
        }
        footer={
          <div className="flex w-full gap-4">
            <Button variant="solid" onPress={handleClose} isDisabled={isSubmitting} size="lg">
              <Trans>Cancel</Trans>
            </Button>
            <Button color="primary" onPress={handleSubmit} isLoading={isSubmitting} size="lg" fullWidth>
              <Trans>Create & Add to List</Trans>
            </Button>
          </div>
        }
      />

      {isScannerOpen && <BarcodeScannerWithUI onClose={closeScanner} onScanned={handleBarcodeScanned} />}
    </>
  );
};
