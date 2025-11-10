"use client";

import { useDisclosure } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import dynamic from "next/dynamic";
import { useState } from "react";
import { toast } from "react-toastify";
import { NewPriceModal } from "~/applications/Prices/Ui/NewPrice/NewPiceModal";
import { NoPricesFound } from "~/applications/Prices/Ui/NoPricesFound";
const NewProduct = dynamic(() =>
  import("~/applications/Products/Ui/NewProduct/NewProduct").then((mod) => mod.NewProduct)
);
import { SearchBarcode } from "~/applications/Searchbar/Ui/SearchBarcode/SearchBarcode";
import { Tabbar as TabbarComponent } from "~/components/Tabbar/Tabbar";

interface TabbarProps {
  isSignedIn: boolean;
}

export const Tabbar = ({ isSignedIn }: TabbarProps) => {
  const [barcode, setBarcode] = useState<string | null>(null);
  const [newProductDefaultDetails, setNewProductDefaultDetails] = useState<any | null>(null);
  const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isNewPriceOpen,
    onOpenChange: onOpenChangeNewPrice,
    onOpen: onNewPriceOpen,
    onClose: onNewPriceClose
  } = useDisclosure();
  const notify = () =>
    toast(<Trans>Price added</Trans>, {
      type: "success"
    });

  return (
    <>
      <TabbarComponent
        mainButton={
          <SearchBarcode
            onNewProduct={(barcode, resultBarcode) => {
              setNewProductDefaultDetails(resultBarcode);
              onOpen();
            }}
            onNoPrices={(barcode) => {
              setBarcode(barcode);
              onOpen();
            }}
          />
        }
        isSignedIn={isSignedIn}
      />
      {isOpen ? (
        newProductDefaultDetails ? (
          <NewProduct
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            resultBarcode={newProductDefaultDetails}
            onClose={onClose}
          />
        ) : (
          <NoPricesFound
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onCancel={onClose}
            onNewPrice={() => {
              onNewPriceOpen();
              onClose();
            }}
          />
        )
      ) : null}
      <NewPriceModal
        isOpen={isNewPriceOpen}
        barcode={barcode || undefined}
        onOpenChange={onOpenChangeNewPrice}
        onClose={onClose}
        onSuccessfull={() => {
          notify();
          onNewPriceClose();
        }}
      />
    </>
  );
};
