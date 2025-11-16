"use client";

import { Button, Input, Radio, RadioGroup } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useState } from "react";
import { createProductForRecipe } from "~/applications/Recipes/Api/products/createProduct.api";
import { Modal } from "~/components/Modal/Modal";
import type { ProductSearchResult } from "~/packages/applications/shopping-lists/src/Api/searchProducts.api";
import type { CreatePantryItemInput } from "../../Domain/Schemas/PantryItem.schema";
import { ProductSearchInput } from "./ProductSearchInput";

interface PantryAddFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePantryItemInput & { productId?: string }) => Promise<void>;
}

const LOCATIONS = [
  { value: "pantry", label: "Pantry" },
  { value: "fridge", label: "Fridge" },
  { value: "freezer", label: "Freezer" },
  { value: "countertop", label: "Countertop" }
];

export const PantryAddForm = ({ isOpen, onClose, onSubmit }: PantryAddFormProps) => {
  const { t } = useLingui();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null);
  const [customName, setCustomName] = useState("");
  const [customBarcode, setCustomBarcode] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("unit");
  const [expiration, setExpiration] = useState<string | undefined>();
  const [location, setLocation] = useState("pantry");

  const handleSubmit = async () => {
    if (!selectedProduct && !customName) return;

    try {
      setIsLoading(true);

      let productId = selectedProduct?.id;
      let productName = selectedProduct?.name || customName;

      if (!selectedProduct && customName) {
        const result = await createProductForRecipe({
          name: customName,
          barcode: customBarcode
        });

        if (result.success && result.product) {
          productId = result.product.id;
          productName = result.product.name;
        }
      }

      await onSubmit({
        name: productName,
        productId,
        quantity,
        unit,
        expiration,
        location
      });

      setSelectedProduct(null);
      setCustomName("");
      setCustomBarcode(undefined);
      setQuantity(1);
      setUnit("unit");
      setExpiration(undefined);
      setLocation("pantry");
      onClose();
    } catch (error) {
      console.error("Failed to add item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSelected = (
    product: ProductSearchResult | null,
    qty: number,
    unt: string,
    barcode?: string
  ) => {
    if (product) {
      setSelectedProduct(product);
      setCustomName("");
      setCustomBarcode(undefined);
    } else {
      setSelectedProduct(null);
      setCustomBarcode(barcode);
    }
    setQuantity(qty);
    setUnit(unt);
  };

  const handleClose = () => {
    setSelectedProduct(null);
    setCustomName("");
    setCustomBarcode(undefined);
    setQuantity(1);
    setUnit("unit");
    setExpiration(undefined);
    setLocation("pantry");
    onClose();
  };

  const hasProduct = selectedProduct || customName;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      sheetHeight="lg"
      header={
        <h2 className="text-xl font-semibold">
          <Trans>Add to Pantry</Trans>
        </h2>
      }
      body={
        <div className="flex flex-col gap-4">
          <ProductSearchInput
            onProductSelected={handleProductSelected}
            placeholder={t`Search or scan product (e.g., 2L milk)`}
          />

          {selectedProduct ? (
            <div className="rounded-lg bg-primary-50 border border-primary-200 p-3">
              <div className="text-sm font-medium text-primary-900">{selectedProduct.name}</div>
              {selectedProduct.brand && (
                <div className="text-xs text-primary-600">{selectedProduct.brand.name}</div>
              )}
            </div>
          ) : (
            <Input
              label={t`Product name`}
              placeholder={t`Enter product name`}
              value={customName}
              onValueChange={setCustomName}
              description={customBarcode ? t`Barcode: ${customBarcode}` : undefined}
            />
          )}

          {hasProduct && (
            <>
              <div className="flex gap-2">
                <Input
                  type="number"
                  label={t`Quantity`}
                  value={quantity.toString()}
                  onValueChange={(value) => setQuantity(Number.parseFloat(value) || 1)}
                  min="0.01"
                  step="0.01"
                  className="flex-1"
                />

                <Input label={t`Unit`} value={unit} onValueChange={setUnit} className="flex-1" />
              </div>

              <Input
                type="date"
                label={t`Expiration (optional)`}
                value={expiration || ""}
                onValueChange={(value) => setExpiration(value || undefined)}
              />

              <RadioGroup
                label={t`Location`}
                value={location}
                onValueChange={setLocation}
                orientation="horizontal"
                classNames={{ wrapper: "gap-2" }}
              >
                {LOCATIONS.map((loc) => (
                  <Radio key={loc.value} value={loc.value} size="sm">
                    {loc.label}
                  </Radio>
                ))}
              </RadioGroup>
            </>
          )}
        </div>
      }
      footer={
        <div className="flex gap-2">
          <Button variant="flat" onPress={handleClose} className="flex-1">
            <Trans>Cancel</Trans>
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isDisabled={!hasProduct}
            isLoading={isLoading}
            className="flex-1"
          >
            <Trans>Add</Trans>
          </Button>
        </div>
      }
    />
  );
};
