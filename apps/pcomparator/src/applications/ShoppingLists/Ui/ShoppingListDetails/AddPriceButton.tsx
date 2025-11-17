"use client";

import { Button, useDisclosure } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { Tag } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

interface AddPriceButtonProps {
  productId: string;
  productName: string;
  barcode?: string | null;
  quantity: number;
  unit: string;
  selectedStore?: { id: string; name: string; location: string } | null;
}

export const AddPriceButton = ({
  productId,
  productName,
  barcode,
  quantity,
  unit,
  selectedStore
}: AddPriceButtonProps) => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);

  // Lazy load NewPriceModal to avoid circular dependencies
  const [NewPriceModal, setNewPriceModal] = useState<any>(null);

  const handleOpen = async () => {
    if (!NewPriceModal) {
      const module = await import("~/applications/Prices/Ui/NewPrice/NewPiceModal");
      setNewPriceModal(() => module.NewPriceModal);
    }
    onOpen();
  };

  const handleSuccess = (createdProductName: string) => {
    toast(<Trans>Price for {createdProductName} added!</Trans>, {
      type: "success"
    });
    onClose();
  };

  return (
    <>
      <Button
        size="sm"
        variant="flat"
        color="primary"
        startContent={<Tag size={16} />}
        onPress={handleOpen}
        isLoading={isLoading}
      >
        <Trans>Add price</Trans>
      </Button>

      {NewPriceModal && (
        <NewPriceModal
          isOpen={isOpen}
          onClose={onClose}
          onOpenChange={onOpenChange}
          productId={productId}
          productName={productName}
          barcode={barcode || undefined}
          selectedStore={selectedStore}
          onSuccessfull={handleSuccess}
        />
      )}
    </>
  );
};
