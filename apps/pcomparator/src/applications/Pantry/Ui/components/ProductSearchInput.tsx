"use client";

import { BarcodeScannerWithUI } from "@deazl/components";
import { Autocomplete, AutocompleteItem, Avatar, Button } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { Package, ScanIcon, Search } from "lucide-react";
import { useCallback, useState } from "react";
import {
  type ProductSearchResult,
  searchProducts
} from "~/applications/ShoppingLists/Api/searchProducts.api";

interface ProductSearchInputProps {
  onProductSelected: (
    product: ProductSearchResult | null,
    quantity: number,
    unit: string,
    barcode?: string
  ) => void;
  placeholder?: string;
}

const parseInput = (input: string) => {
  const quantityMatch = input.match(/^(\d+(?:[.,]\d+)?)\s*(\w+)?\s*(.+)/);

  if (quantityMatch) {
    return {
      quantity: Number.parseFloat(quantityMatch[1].replace(",", ".")),
      unit: quantityMatch[2] || "unit",
      productName: quantityMatch[3].trim()
    };
  }

  return {
    quantity: 1,
    unit: "unit",
    productName: input.trim()
  };
};

export const ProductSearchInput = ({ onProductSelected, placeholder }: ProductSearchInputProps) => {
  const { t } = useLingui();
  const [inputValue, setInputValue] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | number | null>(null);
  const [suggestions, setSuggestions] = useState<ProductSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleInputChange = useCallback(async (value: string) => {
    setInputValue(value);

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const parsed = parseInput(value);
      const results = await searchProducts(parsed.productName, 8);
      setSuggestions(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleProductSelect = (key: React.Key | null) => {
    if (!key) return;
    setSelectedKey(String(key));

    if (key === "create-new") {
      const parsed = parseInput(inputValue);
      onProductSelected(null, parsed.quantity, parsed.unit);
      setInputValue("");
      setSuggestions([]);
      setSelectedKey(null);
      return;
    }

    const product = suggestions.find((s) => s.id === key);
    if (product) {
      const parsed = parseInput(inputValue);
      onProductSelected(product, parsed.quantity, parsed.unit);
      setInputValue("");
      setSuggestions([]);
      setSelectedKey(null);
    }
  };

  const handleBarcodeScanned = async (barcode: string) => {
    setIsScanning(false);
    setIsLoading(true);

    try {
      const results = await searchProducts(barcode, 1);

      if (results.length > 0) {
        onProductSelected(results[0], 1, "unit", barcode);
      } else {
        onProductSelected(null, 1, "unit", barcode);
      }

      setInputValue("");
      setSuggestions([]);
    } catch (error) {
      console.error("Barcode search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const allItems = [
    ...suggestions,
    ...(inputValue.length >= 2 && suggestions.length === 0 && !isLoading
      ? [{ id: "create-new", name: inputValue, brand: null, barcode: null }]
      : [])
  ];

  return (
    <div className="flex gap-2">
      <Autocomplete
        inputValue={inputValue}
        selectedKey={selectedKey}
        onInputChange={handleInputChange}
        onSelectionChange={handleProductSelect}
        items={allItems}
        placeholder={placeholder || t`Search product...`}
        startContent={<Search className="h-4 w-4 text-default-400" />}
        isLoading={isLoading}
        className="flex-1"
        listboxProps={{
          emptyContent: inputValue.length >= 2 ? t`No products found` : t`Type to search...`
        }}
      >
        {(item) =>
          item.id === "create-new" ? (
            <AutocompleteItem key="create-new" textValue={item.name}>
              <div className="flex items-center gap-2">
                <Avatar
                  icon={<Package className="h-4 w-4" />}
                  className="h-8 w-8 flex-shrink-0 bg-success-100"
                  size="sm"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-success-600">Create "{item.name}"</span>
                  <span className="text-xs text-default-400">New product</span>
                </div>
              </div>
            </AutocompleteItem>
          ) : (
            <AutocompleteItem key={item.id} textValue={item.name}>
              <div className="flex items-center gap-2">
                <Avatar icon={<Package className="h-4 w-4" />} className="h-8 w-8 flex-shrink-0" size="sm" />
                <div className="flex flex-col">
                  <span className="text-sm">{item.name}</span>
                  {item.brand && <span className="text-xs text-default-400">{item.brand.name}</span>}
                </div>
              </div>
            </AutocompleteItem>
          )
        }
      </Autocomplete>

      <Button
        isIconOnly
        variant="flat"
        color="primary"
        onPress={() => setIsScanning(true)}
        className="flex-shrink-0"
      >
        <ScanIcon className="h-5 w-5" />
      </Button>

      {isScanning && (
        <div className="fixed inset-0 z-[9999]">
          <BarcodeScannerWithUI
            onScanned={handleBarcodeScanned}
            onClose={() => setIsScanning(false)}
            title={t`Scan barcode`}
            description={t`Position the barcode in the frame`}
          />
        </div>
      )}
    </div>
  );
};
