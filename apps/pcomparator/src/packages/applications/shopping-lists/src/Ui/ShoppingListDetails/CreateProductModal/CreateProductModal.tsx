"use client";

import { BarcodeScannerWithUI } from "@deazl/components";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  addToast,
  useDisclosure
} from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { QrCodeIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { createProductAndAddToList } from "../../../Api/createProductAndAddToList.api";

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: string;
  initialName: string;
  initialQuantity?: number;
  initialUnit?: string;
  initialPrice?: number;
  onProductCreated?: (item: any) => void;
}

export const CreateProductModal = ({
  isOpen,
  onClose,
  listId,
  initialName,
  initialQuantity = 1,
  initialUnit = "unit",
  initialPrice,
  onProductCreated
}: CreateProductModalProps) => {
  const { t } = useLingui();
  const [name, setName] = useState(initialName);
  const [barcode, setBarcode] = useState("");
  const [quantity, setQuantity] = useState(initialQuantity);
  const [unit, setUnit] = useState(initialUnit);
  const [price, setPrice] = useState<number | undefined>(initialPrice);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isOpen: isScannerOpen, onOpen: openScanner, onClose: closeScanner } = useDisclosure();
  const [isFetchingProductInfo, setIsFetchingProductInfo] = useState(false);

  // Update form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setQuantity(initialQuantity);
      setUnit(initialUnit);
      setPrice(initialPrice);
      setBarcode("");
    }
  }, [isOpen, initialName, initialQuantity, initialUnit, initialPrice]);

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
        }
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
      <Modal isOpen={isOpen} onClose={handleClose} size="lg" isDismissable={!isSubmitting}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <Trans>Create New Product</Trans>
            <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
              <Trans>Add a product that doesn't exist in our database</Trans>
            </p>
          </ModalHeader>

          <ModalBody className="gap-4">
            {/* Product Name */}
            <Input
              label={t`Product Name`}
              placeholder={t`e.g., Organic Apples`}
              value={name}
              onValueChange={setName}
              isRequired
              autoFocus
              variant="bordered"
              isDisabled={isFetchingProductInfo}
              description={
                barcode && name !== initialName ? t`Name automatically filled from barcode scan` : undefined
              }
            />

            {/* Barcode with Scanner */}
            <div className="flex gap-2">
              <Input
                label={t`Barcode (Optional)`}
                placeholder={t`Scan or enter barcode`}
                value={barcode}
                onValueChange={setBarcode}
                variant="bordered"
                className="flex-1"
              />
              <Button
                isIconOnly
                variant="flat"
                color="primary"
                onPress={openScanner}
                className="mt-6"
                aria-label="Scan barcode"
              >
                <QrCodeIcon className="h-5 w-5" />
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
                isRequired
                variant="bordered"
                className="flex-1"
              />
              <Select
                label={t`Unit`}
                selectedKeys={[unit]}
                onSelectionChange={(keys) => setUnit(Array.from(keys)[0] as string)}
                variant="bordered"
                className="flex-1"
              >
                <SelectItem key="unit">{t`unit(s)`}</SelectItem>
                <SelectItem key="kg">kg</SelectItem>
                <SelectItem key="g">g</SelectItem>
                <SelectItem key="l">l</SelectItem>
                <SelectItem key="ml">ml</SelectItem>
              </Select>
            </div>

            {/* Price (Optional) */}
            <Input
              label={t`Price (Optional)`}
              type="number"
              value={price?.toString() || ""}
              onValueChange={(value) => setPrice(value ? Number(value) : undefined)}
              min="0"
              step="0.01"
              placeholder="0.00"
              variant="bordered"
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">€</span>
                </div>
              }
            />
          </ModalBody>

          <ModalFooter>
            <Button variant="light" onPress={handleClose} isDisabled={isSubmitting}>
              <Trans>Cancel</Trans>
            </Button>
            <Button color="primary" onPress={handleSubmit} isLoading={isSubmitting}>
              <Trans>Create & Add to List</Trans>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {isScannerOpen && <BarcodeScannerWithUI onClose={closeScanner} onScanned={handleBarcodeScanned} />}
    </>
  );
};
