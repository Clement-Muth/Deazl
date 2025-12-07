"use client";

import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { Trans } from "@lingui/react/macro";
import { useEffect, useState } from "react";
import { createProductForRecipe } from "../../Api/products/createProduct.api";
import type { ProductSearchResult } from "../../Api/products/searchProducts.api";

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: (product: ProductSearchResult) => void;
  initialName?: string;
}

export function CreateProductModal({
  isOpen,
  onClose,
  onProductCreated,
  initialName = ""
}: CreateProductModalProps) {
  const [name, setName] = useState(initialName);
  const [barcode, setBarcode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Synchronize name when modal opens with new initialName
  useEffect(() => {
    if (isOpen && initialName) {
      setName(initialName);
    }
  }, [isOpen, initialName]);

  const handleCreate = async () => {
    if (!name.trim()) {
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Product name is required</Trans>,
        color: "danger"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await createProductForRecipe({
        name: name.trim(),
        ...(barcode.trim() && { barcode: barcode.trim() })
      });

      if (result.success && result.product) {
        addToast({
          title: <Trans>Success</Trans>,
          description: <Trans>Product created successfully</Trans>,
          color: "success"
        });
        onProductCreated(result.product);
        setName("");
        setBarcode("");
      } else {
        addToast({
          title: <Trans>Error</Trans>,
          description: result.error || <Trans>Failed to create product</Trans>,
          color: "danger"
        });
      }
    } catch (error) {
      console.error("Error creating product:", error);
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>An unexpected error occurred</Trans>,
        color: "danger"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>
          <Trans>Create New Product</Trans>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label={<Trans>Product Name</Trans>}
              placeholder="Ex: Organic Flour"
              value={name}
              onValueChange={setName}
              isRequired
              autoFocus
            />
            <Input
              label={<Trans>Barcode (Optional)</Trans>}
              placeholder="Ex: 1234567890123"
              value={barcode}
              onValueChange={setBarcode}
              description={<Trans>Leave empty to auto-generate</Trans>}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            <Trans>Cancel</Trans>
          </Button>
          <Button color="primary" onPress={handleCreate} isLoading={isLoading}>
            <Trans>Create Product</Trans>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
