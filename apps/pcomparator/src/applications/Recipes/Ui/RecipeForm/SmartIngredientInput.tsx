"use client";

import { Autocomplete, AutocompleteItem, Avatar, Button, Chip, useDisclosure } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { Package, Plus, Search } from "lucide-react";
import { forwardRef, useCallback, useEffect, useState } from "react";
import type { ProductSearchResult } from "../../Api/products/searchProducts.api";
import { searchProductsForRecipe } from "../../Api/products/searchProducts.api";
import { CreateProductModal } from "./CreateProductModal";

interface SmartIngredientInputProps {
  value?: ProductSearchResult | null;
  productId?: string;
  onProductSelect: (product: ProductSearchResult) => void;
  placeholder?: string;
  autoFocus?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
}

export const SmartIngredientInput = forwardRef<HTMLInputElement, SmartIngredientInputProps>(
  (
    {
      value,
      productId,
      onProductSelect,
      placeholder = "Search for a product...",
      autoFocus = false,
      isRequired = false,
      isDisabled = false
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState(value?.name || "");
    const [suggestions, setSuggestions] = useState<ProductSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(value || null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Update when value or productId changes from parent
    useEffect(() => {
      if (value) {
        setSelectedProduct(value);
        setInputValue(value.name);
      } else if (productId && productId !== selectedProduct?.id) {
        // Product ID changed but we don't have the full product object
        // Keep the selected state but don't reset input
        setSelectedProduct(null);
      }
    }, [value, productId, selectedProduct?.id]);

    // Debounced search
    useEffect(() => {
      const timer = setTimeout(async () => {
        if (inputValue.trim().length < 2) {
          setSuggestions([]);
          return;
        }

        setIsLoading(true);
        try {
          const results = await searchProductsForRecipe(inputValue, 10);
          setSuggestions(results);
        } catch (error) {
          console.error("Error searching products:", error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);

      return () => clearTimeout(timer);
    }, [inputValue]);

    const handleInputChange = useCallback((value: string) => {
      setInputValue(value);
      setSelectedProduct(null);
    }, []);

    const handleSelectionChange = useCallback(
      (key: React.Key | null) => {
        if (key) {
          const product = suggestions.find((s) => s.id === key);
          if (product) {
            setSelectedProduct(product);
            setInputValue(product.name);
            onProductSelect(product);
          }
        }
      },
      [suggestions, onProductSelect]
    );

    const handleProductCreated = useCallback(
      (product: ProductSearchResult) => {
        setSelectedProduct(product);
        setInputValue(product.name);
        onProductSelect(product);
        onClose();
      },
      [onProductSelect, onClose]
    );

    const handleCreateClick = useCallback(() => {
      // Preserve current input value before opening modal
      onOpen();
    }, [onOpen]);

    return (
      <>
        <div className="flex gap-2 items-start w-full">
          <Autocomplete
            ref={ref}
            label={placeholder}
            items={suggestions}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            onSelectionChange={handleSelectionChange}
            isLoading={isLoading}
            placeholder={placeholder}
            autoFocus={autoFocus}
            isRequired={isRequired}
            isDisabled={isDisabled}
            startContent={<Search className="h-4 w-4 text-gray-400" />}
            variant="bordered"
            className="flex-1"
            allowsCustomValue
            classNames={{
              listboxWrapper: "max-h-80"
            }}
            description={
              !selectedProduct && inputValue.trim().length > 0 ? (
                <Trans>Select a product from the list or create a new one</Trans>
              ) : undefined
            }
            endContent={
              selectedProduct && (
                <Chip size="sm" color="success" variant="flat">
                  <Trans>Selected</Trans>
                </Chip>
              )
            }
          >
            {(item) => (
              <AutocompleteItem
                key={item.id}
                textValue={item.name}
                startContent={
                  <Avatar
                    icon={<Package className="h-4 w-4" />}
                    className="shrink-0 bg-default-100"
                    size="sm"
                  />
                }
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.name}</span>
                  {(item.brand || item.category) && (
                    <span className="text-xs text-gray-500">
                      {item.brand?.name}
                      {item.brand && item.category && " • "}
                      {item.category?.name}
                    </span>
                  )}
                </div>
              </AutocompleteItem>
            )}
          </Autocomplete>

          {!selectedProduct && inputValue.trim().length >= 2 && suggestions.length === 0 && !isLoading && (
            <Button
              color="primary"
              variant="flat"
              size="md"
              startContent={<Plus className="h-4 w-4" />}
              onPress={handleCreateClick}
            >
              <Trans>Create</Trans>
            </Button>
          )}
        </div>

        <CreateProductModal
          isOpen={isOpen}
          onClose={onClose}
          onProductCreated={handleProductCreated}
          initialName={inputValue}
        />
      </>
    );
  }
);

SmartIngredientInput.displayName = "SmartIngredientInput";
