"use client";

import { BarcodeScannerWithUI } from "@deazl/components";
import { useDisclosure } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { useState } from "react";
import { toast } from "react-toastify";
import { NewPriceModal } from "~/applications/Prices/Ui/NewPrice/NewPiceModal";
import { NewPriceButtonDesktop } from "~/applications/Prices/Ui/NewPrice/NewPriceButton/NewPriceButtonDesktop";
import { NewPriceButtonMobile } from "~/applications/Prices/Ui/NewPrice/NewPriceButton/NewPriceButtonMobile";
import useDevice from "~/hooks/useDevice";

export const NewPriceButton = () => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modal, setModal] = useState<"with" | "without" | undefined>(undefined);
  const [barcode, setBarcode] = useState<string | undefined>(undefined);
  const notify = (productName: string) =>
    toast(<Trans>Price for {productName} added!</Trans>, {
      type: "success"
    });
  const device = useDevice();

  const handleBarcodeScanned = (scannedBarcode: string) => {
    if (!barcode) {
      setBarcode(scannedBarcode);
      setModal("without");
      onClose();
    }
  };

  return (
    <>
      {modal === "with" && isOpen && (
        <BarcodeScannerWithUI
          onClose={onClose}
          onScanned={handleBarcodeScanned}
          title="Scan Product Barcode"
          description="Scan the barcode to add a price"
        />
      )}
      {modal === "without" ? (
        <NewPriceModal
          isOpen={isOpen}
          onClose={onClose}
          onOpenChange={(open) => !open && onClose()}
          onSuccessfull={(productName) => {
            notify(productName);
            onClose();
          }}
          productName=""
          barcode={barcode}
        />
      ) : null}
      {device === "desktop" ? (
        <NewPriceButtonDesktop onOpenForm={onOpen} onOpenModal={setModal} />
      ) : (
        <NewPriceButtonMobile
          isOpen={isOpenMobile}
          onOpen={() => setIsOpenMobile(true)}
          onClose={() => setIsOpenMobile(false)}
          onOpenForm={onOpen}
          onOpenModal={setModal}
        />
      )}
    </>
  );
};
