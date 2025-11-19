"use client";

import { useDisclosure } from "@heroui/react";
import { useState } from "react";
import type { ProductSearchResult } from "../../../Api/searchProducts.api";
import { CreateProductModal } from "../CreateProductModal/CreateProductModal";
import { ProductSelectionModal } from "../ProductSelectionModal";
import { SmartItemInput } from "./SmartItemInput";
import { useSmartAdd } from "./useSmartAdd";

interface SmartQuickAddBarProps {
  listId: string;
  className?: string;
  onItemAdded?: (item: any) => void;
}

export const SmartQuickAddBar = ({ listId, className = "", onItemAdded }: SmartQuickAddBarProps) => {
  const { addProductItem, isSubmitting } = useSmartAdd({
    listId,
    onItemAdded
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isCreateProductOpen,
    onOpen: onCreateProductOpen,
    onClose: onCreateProductClose
  } = useDisclosure();
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null);
  const [pendingQuantity, setPendingQuantity] = useState(1);
  const [pendingUnit, setPendingUnit] = useState("unit");
  const [pendingPrice, setPendingPrice] = useState<number | undefined>();
  const [createProductName, setCreateProductName] = useState("");
  const [createProductQuantity, setCreateProductQuantity] = useState(1);
  const [createProductUnit, setCreateProductUnit] = useState("unit");
  const [createProductPrice, setCreateProductPrice] = useState<number | undefined>();
  const [createProductBarcode, setCreateProductBarcode] = useState("");

  const handleProductSelected = (
    product: ProductSearchResult,
    quantity: number,
    unit: string,
    price?: number
  ) => {
    if (product.prices && product.prices.length > 0) {
      setSelectedProduct(product);
      setPendingQuantity(quantity);
      setPendingUnit(unit);
      setPendingPrice(price);
      onOpen();
    } else {
      addProductItem(product, quantity, unit, price);
    }
  };

  const handleCreateProductRequested = (
    name: string,
    quantity: number,
    unit: string,
    price?: number,
    barcode?: string
  ) => {
    setCreateProductName(name);
    setCreateProductQuantity(quantity);
    setCreateProductUnit(unit);
    setCreateProductPrice(price);
    setCreateProductBarcode(barcode || "");
    onCreateProductOpen();
  };

  const handleModalConfirm = (data: {
    productId: string;
    quantity: number;
    unit: string;
    price?: number;
    store?: {
      id: string;
      name: string;
      location: string;
    };
  }) => {
    if (selectedProduct) {
      addProductItem(selectedProduct, data.quantity, data.unit, data.price);
    }
    onClose();
    setSelectedProduct(null);
  };

  return (
    <div className={className}>
      <SmartItemInput
        listId={listId}
        onProductSelected={handleProductSelected}
        onCreateProductRequested={handleCreateProductRequested}
      />

      <ProductSelectionModal
        isOpen={isOpen}
        onClose={onClose}
        product={selectedProduct}
        defaultQuantity={pendingQuantity}
        defaultUnit={pendingUnit}
        onConfirm={handleModalConfirm}
      />

      <CreateProductModal
        isOpen={isCreateProductOpen}
        onClose={onCreateProductClose}
        listId={listId}
        initialName={createProductName}
        initialQuantity={createProductQuantity}
        initialUnit={createProductUnit}
        initialPrice={createProductPrice}
        initialBarcode={createProductBarcode}
        onProductCreated={onItemAdded}
      />
    </div>
  );
};
