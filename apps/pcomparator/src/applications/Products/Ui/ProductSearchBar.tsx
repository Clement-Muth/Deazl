"use client";

import { Input } from "@heroui/react";
import { Filter, Search } from "lucide-react";

interface ProductSearchBarProps {
  onSearch: (query: string) => void;
  onFilterClick?: () => void;
  placeholder?: string;
  defaultValue?: string;
}

export function ProductSearchBar({
  onSearch,
  onFilterClick,
  placeholder = "Search products...",
  defaultValue = ""
}: ProductSearchBarProps) {
  return (
    <div className="flex gap-2">
      <Input
        type="text"
        placeholder={placeholder}
        defaultValue={defaultValue}
        startContent={<Search className="w-4 h-4 text-gray-400" />}
        endContent={
          onFilterClick && (
            <button
              type="button"
              onClick={onFilterClick}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Open filters"
            >
              <Filter className="w-4 h-4" />
            </button>
          )
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSearch((e.target as HTMLInputElement).value);
          }
        }}
        className="flex-1"
      />
    </div>
  );
}
