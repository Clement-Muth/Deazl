"use client";

import { Button, Checkbox, Divider, Select, SelectItem, Slider } from "@heroui/react";
import { Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "~/components/Modal/Modal";
import type { RecipeSearchFilters } from "../../Application/Services/RecipeSearch.service";
import type { DifficultyLevel } from "../../Domain/Schemas/Recipe.schema";

interface RecipeSearchFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: RecipeSearchFilters) => void;
  initialFilters?: RecipeSearchFilters;
}

export function RecipeSearchFiltersModal({
  isOpen,
  onClose,
  onApplyFilters,
  initialFilters = {}
}: RecipeSearchFiltersModalProps) {
  const [filters, setFilters] = useState<RecipeSearchFilters>(initialFilters);

  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters);
    }
  }, [isOpen]);

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
  };

  const categories = ["Appetizer", "Main Course", "Dessert", "Snack", "Breakfast", "Beverage"];
  const cuisines = ["Italian", "French", "Asian", "Mexican", "American", "Mediterranean", "Indian"];
  const difficulties: DifficultyLevel[] = ["EASY", "MEDIUM", "HARD"];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      sheetHeight="lg"
      header={
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          <span className="text-lg font-bold">Filtres de recherche</span>
        </div>
      }
      body={
        <div className="space-y-5 sm:space-y-6">
          {/* Category */}
          <div>
            <span className="text-sm sm:text-base font-semibold text-gray-700 mb-2 block">Catégorie</span>
            <Select
              placeholder="Toutes les catégories"
              selectionMode="multiple"
              selectedKeys={
                Array.isArray(filters.category)
                  ? filters.category
                  : filters.category
                    ? [filters.category]
                    : []
              }
              onSelectionChange={(keys) => {
                const selected = Array.from(keys) as string[];
                setFilters({ ...filters, category: selected.length > 0 ? selected : undefined });
              }}
              disableAnimation
              classNames={{
                trigger: "h-11 sm:h-12 touch-manipulation",
                popoverContent: "z-[100000]"
              }}
            >
              {categories.map((cat) => (
                <SelectItem key={cat.toLowerCase()}>{cat}</SelectItem>
              ))}
            </Select>
          </div>

          {/* Cuisine */}
          <div>
            <span className="text-sm sm:text-base font-semibold text-gray-700 mb-2 block">Cuisine</span>
            <Select
              placeholder="Toutes les cuisines"
              selectionMode="multiple"
              selectedKeys={
                Array.isArray(filters.cuisine) ? filters.cuisine : filters.cuisine ? [filters.cuisine] : []
              }
              onSelectionChange={(keys) => {
                const selected = Array.from(keys) as string[];
                setFilters({ ...filters, cuisine: selected.length > 0 ? selected : undefined });
              }}
              disableAnimation
              classNames={{
                trigger: "h-11 sm:h-12 touch-manipulation",
                popoverContent: "z-[100000]"
              }}
            >
              {cuisines.map((cuisine) => (
                <SelectItem key={cuisine.toLowerCase()}>{cuisine}</SelectItem>
              ))}
            </Select>
          </div>

          {/* Difficulty */}
          <div>
            <span className="text-sm sm:text-base font-semibold text-gray-700 mb-2 block">Difficulté</span>
            <Select
              placeholder="Toutes les difficultés"
              selectionMode="multiple"
              selectedKeys={
                Array.isArray(filters.difficulty)
                  ? filters.difficulty
                  : filters.difficulty
                    ? [filters.difficulty]
                    : []
              }
              onSelectionChange={(keys) => {
                const selected = Array.from(keys) as DifficultyLevel[];
                setFilters({ ...filters, difficulty: selected.length > 0 ? selected : undefined });
              }}
              disableAnimation
              classNames={{
                trigger: "h-11 sm:h-12 touch-manipulation",
                popoverContent: "z-[100000]"
              }}
            >
              {difficulties.map((diff) => (
                <SelectItem key={diff}>
                  {diff === "EASY" ? "Facile" : diff === "MEDIUM" ? "Moyen" : "Difficile"}
                </SelectItem>
              ))}
            </Select>
          </div>

          <Divider className="my-1" />

          {/* Time Filters */}
          <div>
            <span className="text-sm sm:text-base font-semibold text-gray-700 mb-3 block">
              Temps de préparation (max)
            </span>
            <Slider
              step={5}
              minValue={0}
              maxValue={120}
              value={filters.maxPreparationTime || 120}
              onChange={(value) => setFilters({ ...filters, maxPreparationTime: value as number })}
              className="w-full"
              size="lg"
              showTooltip
              tooltipValueFormatOptions={{ style: "unit", unit: "minute" }}
            />
            <p className="text-sm text-gray-500 mt-2">{filters.maxPreparationTime || 120} minutes</p>
          </div>

          <div>
            <span className="text-sm sm:text-base font-semibold text-gray-700 mb-3 block">
              Temps de cuisson (max)
            </span>
            <Slider
              step={5}
              minValue={0}
              maxValue={180}
              value={filters.maxCookingTime || 180}
              onChange={(value) => setFilters({ ...filters, maxCookingTime: value as number })}
              className="w-full"
              size="lg"
              showTooltip
              tooltipValueFormatOptions={{ style: "unit", unit: "minute" }}
            />
            <p className="text-sm text-gray-500 mt-2">{filters.maxCookingTime || 180} minutes</p>
          </div>

          <Divider className="my-1" />

          {/* Dietary Restrictions */}
          <div>
            <span className="text-sm sm:text-base font-semibold text-gray-700 mb-3 block">
              Régimes alimentaires
            </span>
            <div className="flex gap-4 flex-wrap">
              <Checkbox
                isSelected={filters.isVegan}
                onValueChange={(checked) => setFilters({ ...filters, isVegan: checked })}
                classNames={{ wrapper: "touch-manipulation" }}
                size="md"
              >
                Vegan
              </Checkbox>
              <Checkbox
                isSelected={filters.isVegetarian}
                onValueChange={(checked) => setFilters({ ...filters, isVegetarian: checked })}
                classNames={{ wrapper: "touch-manipulation" }}
                size="md"
              >
                Végétarien
              </Checkbox>
              <Checkbox
                isSelected={filters.isGlutenFree}
                onValueChange={(checked) => setFilters({ ...filters, isGlutenFree: checked })}
                classNames={{ wrapper: "touch-manipulation" }}
                size="md"
              >
                Sans gluten
              </Checkbox>
              <Checkbox
                isSelected={filters.isDairyFree}
                onValueChange={(checked) => setFilters({ ...filters, isDairyFree: checked })}
                classNames={{ wrapper: "touch-manipulation" }}
                size="md"
              >
                Sans lactose
              </Checkbox>
            </div>
          </div>

          <Divider className="my-1" />

          {/* Sort By */}
          <div>
            <span className="text-sm sm:text-base font-semibold text-gray-700 mb-2 block">Trier par</span>
            <Select
              placeholder="Popularité"
              selectionMode="single"
              selectedKeys={filters.sortBy ? [filters.sortBy] : ["popular"]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as "newest" | "popular" | "favorites" | "quickest";
                setFilters({ ...filters, sortBy: selected || "popular" });
              }}
              disableAnimation
              classNames={{
                trigger: "h-11 sm:h-12 touch-manipulation",
                popoverContent: "z-[100000]"
              }}
            >
              <SelectItem key="popular">Popularité</SelectItem>
              <SelectItem key="newest">Plus récent</SelectItem>
              <SelectItem key="favorites">Plus favoris</SelectItem>
              <SelectItem key="quickest">Plus rapide</SelectItem>
            </Select>
          </div>
        </div>
      }
      footer={
        <div className="flex gap-2 w-full">
          <Button variant="light" onPress={handleReset} className="flex-1 h-11 touch-manipulation">
            Réinitialiser
          </Button>
          <Button color="primary" onPress={handleApply} className="flex-1 h-11 touch-manipulation">
            Appliquer
          </Button>
        </div>
      }
    />
  );
}
