"use client";

import { Button, Input } from "@heroui/react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

interface RecipeSearchBarProps {
  onSearch: (query: string) => void;
  onFilterClick?: () => void;
  placeholder?: string;
  showFilters?: boolean;
}

export function RecipeSearchBar({
  onSearch,
  onFilterClick,
  placeholder = "Rechercher une recette...",
  showFilters = true
}: RecipeSearchBarProps) {
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = () => {
    onSearch(searchValue);
  };

  const handleClear = () => {
    setSearchValue("");
    onSearch("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex gap-1.5 sm:gap-2 w-full">
      <Input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={handleKeyDown}
        startContent={<Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
        endContent={
          searchValue && (
            <button
              type="button"
              onClick={handleClear}
              className="hover:bg-gray-100 active:bg-gray-200 rounded p-1.5 touch-manipulation"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )
        }
        classNames={{
          input: "text-sm sm:text-base",
          inputWrapper: "h-11 sm:h-12"
        }}
      />

      {showFilters && onFilterClick && (
        <Button
          isIconOnly
          variant="bordered"
          onPress={onFilterClick}
          className="h-11 sm:h-12 w-11 sm:w-12 min-w-[44px] touch-manipulation"
        >
          <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      )}

      <Button
        color="primary"
        onPress={handleSearch}
        className="h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base touch-manipulation hidden sm:flex"
      >
        Rechercher
      </Button>
      <Button
        isIconOnly
        color="primary"
        onPress={handleSearch}
        className="h-11 w-11 min-w-[44px] touch-manipulation flex sm:hidden"
      >
        <Search className="w-5 h-5" />
      </Button>
    </div>
  );
}
