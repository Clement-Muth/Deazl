"use client";

import { BarcodeScannerWithUI } from "@deazl/components";
import { Autocomplete, AutocompleteItem, Avatar, Button, useDisclosure } from "@heroui/react";
import { PackagePlusIcon, PlusIcon, QrCodeIcon, SearchIcon, StoreIcon, TagIcon } from "lucide-react";
import { forwardRef, useCallback, useState } from "react";
import type { ProductSearchResult } from "../../../Api/searchProducts.api";
import { type SmartSuggestion, useSmartProductSearch } from "./useSmartProductSearch";

interface SmartItemInputProps {
  listId: string;
  className?: string;
  onProductSelected?: (product: ProductSearchResult, quantity: number, unit: string, price?: number) => void;
  onCreateProductRequested?: (
    name: string,
    quantity: number,
    unit: string,
    price?: number,
    barcode?: string
  ) => void;
  placeholder?: string;
}

export const SmartItemInput = forwardRef<HTMLInputElement, SmartItemInputProps>(
  (
    {
      listId,
      className = "",
      onProductSelected,
      onCreateProductRequested,
      placeholder = "Rechercher un produit (ex: 2kg pommes, lait, 500g riz 2.99€)"
    },
    ref
  ) => {
    const { isOpen: isScannerOpen, onOpen: openScanner, onClose: closeScanner } = useDisclosure();
    const [isScannerLoading, setIsScannerLoading] = useState(false);

    const {
      inputValue,
      suggestions,
      isLoading,
      parsedInput,
      handleInputChange,
      handleSuggestionSelect: originalHandleSuggestionSelect,
      clearInput
    } = useSmartProductSearch({
      onProductSelected: (product, parsedItem) => {
        onProductSelected?.(product, parsedItem.quantity, parsedItem.unit, parsedItem.price);
        clearInput();
      }
    });

    const handleBarcodeScanned = useCallback(
      async (barcode: string) => {
        setIsScannerLoading(true);
        closeScanner();

        try {
          // Fetch product info from Open Food Facts
          const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);

          if (response.ok) {
            const data = await response.json();

            if (data.status === 1 && data.product && data.product.product_name) {
              // Product found - open create modal with pre-filled data
              onCreateProductRequested?.(
                data.product.product_name,
                parsedInput?.quantity || 1,
                parsedInput?.unit || "unit",
                parsedInput?.price,
                barcode
              );
            } else {
              // Product not found - open create modal with barcode only
              onCreateProductRequested?.(
                "",
                parsedInput?.quantity || 1,
                parsedInput?.unit || "unit",
                parsedInput?.price,
                barcode
              );
            }
          } else {
            // API error - open create modal anyway
            onCreateProductRequested?.(
              "",
              parsedInput?.quantity || 1,
              parsedInput?.unit || "unit",
              parsedInput?.price,
              barcode
            );
          }
        } catch (error) {
          console.error("Erreur lors du scan:", error);
          // On error - still open create modal
          onCreateProductRequested?.(
            "",
            parsedInput?.quantity || 1,
            parsedInput?.unit || "unit",
            parsedInput?.price,
            barcode
          );
        } finally {
          setIsScannerLoading(false);
        }
      },
      [closeScanner, onCreateProductRequested, parsedInput]
    );

    const handleSuggestionSelect = useCallback(
      (suggestion: SmartSuggestion) => {
        if (suggestion.type === "create-product") {
          // Trigger create product modal
          onCreateProductRequested?.(
            suggestion.parsedItem.productName,
            suggestion.parsedItem.quantity,
            suggestion.parsedItem.unit,
            suggestion.parsedItem.price,
            undefined
          );
          clearInput();
        } else if (suggestion.type !== "quick-add") {
          // Only allow product selection
          originalHandleSuggestionSelect(suggestion);
        }
      },
      [originalHandleSuggestionSelect, onCreateProductRequested, clearInput]
    );

    const handleKeyDown = (e: React.KeyboardEvent) => {
      // Removed: custom item addition on Enter key
      // Users must select a product from suggestions
    };

    return (
      <div className={className}>
        <div className="flex gap-2 items-center">
          <Autocomplete
            aria-label="smart item input"
            ref={ref}
            items={suggestions}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            onSelectionChange={(key) => {
              if (key && key !== "") {
                const suggestion = suggestions.find((s) => s.id === key);
                if (suggestion) {
                  handleSuggestionSelect(suggestion);
                }
              }
            }}
            allowsCustomValue
            isLoading={isLoading}
            placeholder={placeholder}
            startContent={<SearchIcon className="h-4 w-4 text-gray-400" />}
            onKeyDown={handleKeyDown}
            size="lg"
            classNames={{
              base: "w-full",
              listboxWrapper: "max-h-80",
              popoverContent: "p-0",
              endContentWrapper: "pe-3",
              clearButton: "p-0 text-gray-400 hover:text-gray-600"
            }}
            inputProps={{
              classNames: {
                input: "text-sm placeholder:text-gray-400",
                inputWrapper:
                  "shadow-sm border-gray-200 hover:border-gray-300 focus-within:border-primary-500"
              }
            }}
            menuTrigger="input"
            selectorButtonProps={{
              "aria-label": "Toggle menu"
            }}
          >
            {(suggestion) => (
              <AutocompleteItem key={suggestion.id} textValue={suggestion.displayText} className="text-sm">
                <SuggestionItem suggestion={suggestion} onSelect={() => handleSuggestionSelect(suggestion)} />
              </AutocompleteItem>
            )}
          </Autocomplete>

          {/* Bouton Scanner */}
          <Button
            isIconOnly
            size="lg"
            variant="flat"
            color="primary"
            onPress={openScanner}
            isLoading={isScannerLoading}
            aria-label="Scanner un code-barres"
            className="flex-shrink-0"
          >
            <QrCodeIcon className="h-5 w-5" />
          </Button>
        </div>

        {isScannerOpen && <BarcodeScannerWithUI onClose={closeScanner} onScanned={handleBarcodeScanned} />}
      </div>
    );
  }
);

SmartItemInput.displayName = "SmartItemInput";

// Composant pour afficher une suggestion
interface SuggestionItemProps {
  suggestion: SmartSuggestion;
  onSelect: () => void;
}

const SuggestionItem = ({ suggestion, onSelect }: SuggestionItemProps) => {
  const getTypeIcon = () => {
    switch (suggestion.type) {
      case "product":
        return <TagIcon size={12} className="text-primary-500" />;
      case "create-product":
        return <PackagePlusIcon size={12} className="text-green-600" />;
      case "quick-add":
        return <PlusIcon size={12} className="text-gray-500" />;
      default:
        return <SearchIcon size={12} className="text-gray-400" />;
    }
  };

  const getConfidenceIndicator = () => {
    if (suggestion.confidence >= 0.8) {
      return <div className="w-2 h-2 rounded-full bg-green-500" />;
    }
    if (suggestion.confidence >= 0.6) {
      return <div className="w-2 h-2 rounded-full bg-yellow-500" />;
    }
    return <div className="w-2 h-2 rounded-full bg-gray-400" />;
  };

  return (
    <div className="flex items-center gap-2 w-full py-1">
      {/* Badge avec icône du type */}
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
        {getTypeIcon()}
      </div>

      {/* Avatar pour les produits avec image */}
      {suggestion.type === "product" && suggestion.product?.brand && (
        <Avatar size="sm" name={suggestion.product.brand.name} className="flex-shrink-0" />
      )}

      {/* Contenu principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-medium text-sm text-gray-900 truncate">{suggestion.displayText}</span>
          {getConfidenceIndicator()}
        </div>

        {suggestion.subtitle && (
          <div className="text-xs text-gray-500 truncate mb-0.5">{suggestion.subtitle}</div>
        )}

        {/* Informations spécifiques aux produits */}
        {suggestion.type === "product" && suggestion.product && (
          <div className="flex items-center gap-2 text-xs">
            {suggestion.product.category && (
              <span className="inline-flex items-center bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-600 text-xs">
                {suggestion.product.category.name}
              </span>
            )}

            {suggestion.product.bestPrice && (
              <div className="flex items-center gap-1 text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full text-xs">
                <StoreIcon size={8} />
                <span className="font-medium">{suggestion.product.bestPrice.store}</span>
                {suggestion.product.bestPrice.location && (
                  <span className="text-green-500 truncate max-w-20">
                    • {suggestion.product.bestPrice.location}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Prix à droite */}
      {suggestion.type === "product" && suggestion.product?.averagePrice && (
        <div className="flex-shrink-0 text-right">
          <div className="text-xs font-bold text-primary-700">
            {suggestion.product.averagePrice.toFixed(2)}€
          </div>
          <div className="text-xs text-primary-500">moy.</div>
        </div>
      )}
    </div>
  );
};
