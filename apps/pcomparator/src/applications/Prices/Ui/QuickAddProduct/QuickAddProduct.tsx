"use client";

import { addToast } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { useCallback, useState } from "react";
import { BarcodeScannerButton, BarcodeScannerModal, ProductFormModal } from "./components";

export const QuickAddProduct = () => {
  const [scannedBarcode, setScannedBarcode] = useState<string>("");
  const [productName, setProductName] = useState<string>("");
  const [isFetchingProductInfo, setIsFetchingProductInfo] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const handleBarcodeScanned = useCallback(async (barcode: string) => {
    setScannedBarcode(barcode);
    setIsScannerOpen(false);
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
      setIsProductModalOpen(true);
    }
  }, []);

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setScannedBarcode("");
    setProductName("");
  };

  return (
    <>
      <BarcodeScannerButton onPress={() => setIsScannerOpen(true)} />

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanned={handleBarcodeScanned}
      />

      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
        scannedBarcode={scannedBarcode}
        productName={productName}
        onProductNameChange={setProductName}
        isFetchingProductInfo={isFetchingProductInfo}
      />
    </>
  );
};
