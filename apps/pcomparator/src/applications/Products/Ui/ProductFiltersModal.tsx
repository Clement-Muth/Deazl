"use client";

import { Button, Select, SelectItem } from "@heroui/react";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "~/components/Modal/Modal";
import type { ProductSearchFilters } from "../Api/searchProducts";

interface ProductFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: ProductSearchFilters) => void;
  initialFilters?: ProductSearchFilters;
  categories: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string }>;
}

export function ProductFiltersModal({
  isOpen,
  onClose,
  onApplyFilters,
  initialFilters = {},
  categories,
  brands
}: ProductFiltersModalProps) {
  const [filters, setFilters] = useState<ProductSearchFilters>(initialFilters);

  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters);
    }
  }, [isOpen, initialFilters]);

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      sheetHeight="md"
      header={<span className="text-lg font-semibold">Filter Products</span>}
      body={
        <div className="space-y-4 p-4">
          {/* Category Filter */}
          <Select
            label="Category"
            placeholder="Select a category"
            selectedKeys={filters.categoryId ? [filters.categoryId] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              setFilters({ ...filters, categoryId: selected || undefined });
            }}
          >
            {categories.map((category) => (
              <SelectItem key={category.id}>{category.name}</SelectItem>
            ))}
          </Select>

          {/* Brand Filter */}
          <Select
            label="Brand"
            placeholder="Select a brand"
            selectedKeys={filters.brandId ? [filters.brandId] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              setFilters({ ...filters, brandId: selected || undefined });
            }}
          >
            {brands.map((brand) => (
              <SelectItem key={brand.id}>{brand.name}</SelectItem>
            ))}
          </Select>

          {/* Sort By */}
          <Select
            label="Sort By"
            placeholder="Select sort order"
            selectedKeys={filters.sortBy ? [filters.sortBy] : ["popular"]}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as ProductSearchFilters["sortBy"];
              setFilters({ ...filters, sortBy: selected });
            }}
          >
            <SelectItem key="popular">Most Popular</SelectItem>
            <SelectItem key="name">Name (A-Z)</SelectItem>
            <SelectItem key="newest">Newest First</SelectItem>
          </Select>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button fullWidth variant="flat" onPress={handleReset} startContent={<X className="w-4 h-4" />}>
              Reset
            </Button>
            <Button fullWidth color="primary" onPress={handleApply}>
              Apply Filters
            </Button>
          </div>
        </div>
      }
    />
  );
}
