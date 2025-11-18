"use client";

import { BarcodeScannerWithUI } from "@deazl/components";
import { Autocomplete, AutocompleteItem, Button, Input, addToast, useDisclosure } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { MapPinIcon, ScanBarcode, StoreIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPrice } from "~/applications/Prices/Api/createPrice";
import { Currency } from "~/applications/Prices/Domain/ValueObjects/Currency";
import { createStore } from "~/applications/ShoppingLists/Api/createStore.api";
import { getStores } from "~/applications/ShoppingLists/Api/getStores.api";
import { Modal } from "~/components/Modal/Modal";
import { UnitSelector } from "~/components/UnitSelector";

interface StoreInfo {
  id: string;
  name: string;
  location: string;
}

export const QuickAddProduct = () => {
  const router = useRouter();
  const { t } = useLingui();
  const [scannedBarcode, setScannedBarcode] = useState<string>("");
  const [productName, setProductName] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("unit");
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProductInfo, setIsFetchingProductInfo] = useState(false);
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  const { isOpen: isScannerOpen, onOpen: onOpenScanner, onClose: onCloseScanner } = useDisclosure();
  const {
    isOpen: isProductModalOpen,
    onOpen: onOpenProductModal,
    onClose: onCloseProductModal
  } = useDisclosure();
  const {
    isOpen: isAddStoreModalOpen,
    onOpen: onOpenAddStoreModal,
    onClose: onCloseAddStoreModal
  } = useDisclosure();

  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreLocation, setNewStoreLocation] = useState("");
  const [isCreatingStore, setIsCreatingStore] = useState(false);

  useEffect(() => {
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

    if (isProductModalOpen) {
      loadStores();
    }
  }, [isProductModalOpen]);

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

      await loadStores();

      setSelectedStore({
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
      onCloseAddStoreModal();
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

  const handleBarcodeScanned = useCallback(
    async (barcode: string) => {
      setScannedBarcode(barcode);
      onCloseScanner();
      setIsFetchingProductInfo(true);

      try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);

        if (response.ok) {
          const data = await response.json();

          if (data.status === 1 && data.product && data.product.product_name) {
            setProductName(data.product.product_name);
            addToast({
              title: <Trans>Product found</Trans>,
              description: data.product.product_name,
              variant: "solid",
              color: "success"
            });
          } else {
            setProductName("");
            addToast({
              title: <Trans>Product not found</Trans>,
              description: <Trans>Please enter the product name manually</Trans>,
              variant: "solid",
              color: "warning"
            });
          }
        }
      } catch (error) {
        console.error("Error fetching Open Food Facts data:", error);
        setProductName("");
      } finally {
        setIsFetchingProductInfo(false);
        onOpenProductModal();
      }
    },
    [onCloseScanner, onOpenProductModal]
  );

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
      onCloseProductModal();
      setScannedBarcode("");
      setProductName("");
      setQuantity(1);
      setUnit("unit");
      setPrice(undefined);
      setSelectedStore(null);
    }
  };

  return (
    <>
      <Button
        startContent={<ScanBarcode />}
        onPress={onOpenScanner}
        radius="full"
        variant="faded"
        className="p-7 w-18 h-18 -mt-8 border-none shadow-[0_5px_10px_1px_rgba(0,0,0,.2)]"
        isIconOnly
      />

      {isScannerOpen && <BarcodeScannerWithUI onClose={onCloseScanner} onScanned={handleBarcodeScanned} />}

      <Modal
        isOpen={isAddStoreModalOpen}
        onClose={onCloseAddStoreModal}
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
            <Button variant="solid" onPress={onCloseAddStoreModal} isDisabled={isCreatingStore} size="lg">
              <Trans>Cancel</Trans>
            </Button>
            <Button
              color="primary"
              onPress={handleCreateStore}
              isLoading={isCreatingStore}
              size="lg"
              fullWidth
            >
              <Trans>Create Store</Trans>
            </Button>
          </div>
        }
      />

      <Modal
        isOpen={isProductModalOpen}
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
              onValueChange={setProductName}
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
                onPress={onOpenAddStoreModal}
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
    </>
  );
};
