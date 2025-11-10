"use client";

import { useDisclosure } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { useState } from "react";
import { toast } from "react-toastify";
import type { Barcode } from "~/applications/Prices/Domain/ValueObjects/Barcode";
import { BarcodeScannerModal } from "~/applications/Prices/Ui/NewPrice/BarcodeScanner/BarcodeScannerModal";
import { NewPriceModal } from "~/applications/Prices/Ui/NewPrice/NewPiceModal";
import { NewPriceButtonDesktop } from "~/applications/Prices/Ui/NewPrice/NewPriceButton/NewPriceButtonDesktop";
import { NewPriceButtonMobile } from "~/applications/Prices/Ui/NewPrice/NewPriceButton/NewPriceButtonMobile";
import useDevice from "~/hooks/useDevice";

export const NewPriceButton = () => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [modal, setModal] = useState<"with" | "without" | undefined>(undefined);
  const [barcode, setBarcode] = useState<Barcode | undefined>(undefined);
  const notify = (productName: string) =>
    toast(<Trans>Price for {productName} added!</Trans>, {
      type: "success"
    });
  const device = useDevice();

  return (
    <>
      {modal === "with" ? (
        <BarcodeScannerModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          onClose={onClose}
          onBarcodeDetected={(detectedBarcode) => {
            if (!barcode) {
              setBarcode(detectedBarcode);
              setModal("without");
            }
          }}
        />
      ) : null}
      {modal === "without" ? (
        <NewPriceModal
          isOpen={isOpen}
          onClose={onClose}
          onOpenChange={onOpenChange}
          onSuccessfull={(productName) => {
            notify(productName);
            onClose();
          }}
          productName=""
          barcode={barcode?.barcode}
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
