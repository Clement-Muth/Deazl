"use client";

import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerTypeHint
} from "@capacitor/barcode-scanner";
import { BarcodeScannerWithUI } from "@deazl/components";
import { Autocomplete, AutocompleteItem, Button, useDisclosure } from "@heroui/react";
import { ScanBarcode, SearchIcon } from "lucide-react";
import { forwardRef, useCallback, useState } from "react";
import type { ProductSearchResult } from "../../../Api/searchProducts.api";
import { SuggestionItem } from "./SuggestionItem";
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

    const [result, setResult] = useState<string | null>(null);

    const handleScan = async () => {
      try {
        const res = await CapacitorBarcodeScanner.scanBarcode({
          hint: CapacitorBarcodeScannerTypeHint.ALL,
          cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK
        });
        // res.ScanResult contient la donnée lue
        setResult(res.ScanResult);
      } catch (err) {
        console.error("Scan erreur:", err);
      }
    };

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

    const handleBarcodeScanned = useCallback(async () => {
      setIsScannerLoading(true);
      closeScanner();

      const res = await CapacitorBarcodeScanner.scanBarcode({
        hint: CapacitorBarcodeScannerTypeHint.ALL,
        cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK
      });
      const barcode = res.ScanResult;

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
    }, [closeScanner, onCreateProductRequested, parsedInput]);

    const handleSuggestionSelect = useCallback(
      (suggestion: SmartSuggestion) => {
        if (suggestion.type === "create-product") {
          onCreateProductRequested?.(
            suggestion.parsedItem.productName,
            suggestion.parsedItem.quantity,
            suggestion.parsedItem.unit,
            suggestion.parsedItem.price,
            undefined
          );
          clearInput();
        } else if (suggestion.type !== "quick-add") {
          originalHandleSuggestionSelect(suggestion);
        }
      },
      [originalHandleSuggestionSelect, onCreateProductRequested, clearInput]
    );

    return (
      <div className={className}>
        <div className="flex gap-2 items-center">
          <Autocomplete
            ref={ref}
            items={suggestions}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            onSelectionChange={(key) => {
              if (key && key !== "") {
                const suggestion = suggestions.find((s) => s.id === key);
                if (suggestion) handleSuggestionSelect(suggestion);
              }
            }}
            allowsCustomValue
            isLoading={isLoading}
            placeholder={placeholder}
            startContent={<SearchIcon className="h-4 w-4 text-gray-400" />}
            size="lg"
            menuTrigger="input"
          >
            {(suggestion) => (
              <AutocompleteItem key={suggestion.id} textValue={suggestion.displayText} className="text-large">
                <SuggestionItem suggestion={suggestion} />
              </AutocompleteItem>
            )}
          </Autocomplete>

          <Button
            isIconOnly
            size="lg"
            color="primary"
            startContent={<ScanBarcode className="h-5 w-5" />}
            onPress={handleBarcodeScanned}
            isLoading={isScannerLoading}
            aria-label="Scanner un code-barres"
          />
        </div>

        {isScannerOpen && <BarcodeScannerWithUI onClose={closeScanner} onScanned={handleBarcodeScanned} />}
      </div>
    );
  }
);
