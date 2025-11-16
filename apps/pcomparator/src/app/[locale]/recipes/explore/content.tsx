"use client";

import { Button, Chip, Input, Select, SelectItem } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Search, X } from "lucide-react";
import { useState, useTransition } from "react";
import { searchPublicRecipes } from "~/applications/Recipes/Api";
import type { SearchPublicRecipesFilters } from "~/applications/Recipes/Api/recipes/searchPublicRecipes.api";
import type { RecipePayload } from "~/applications/Recipes/Domain/Schemas/Recipe.schema";
import RecipesList from "~/applications/Recipes/Ui/RecipesList";

const CATEGORIES = ["Appetizer", "Main Course", "Dessert", "Breakfast", "Snack", "Beverage"];

const CUISINES = ["Italian", "French", "Asian", "Mexican", "Indian", "Mediterranean", "American"];

const DIFFICULTIES = [
  { key: "EASY", label: "Easy" },
  { key: "MEDIUM", label: "Medium" },
  { key: "HARD", label: "Hard" }
];

const SORT_OPTIONS = [
  { key: "newest", label: "Newest" },
  { key: "popular", label: "Most Popular" },
  { key: "favorites", label: "Most Favorited" }
];

export const ExploreRecipesContent = () => {
  const { t } = useLingui();
  const [isPending, startTransition] = useTransition();
  const [recipes, setRecipes] = useState<RecipePayload[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCuisine, setSelectedCuisine] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedSort, setSelectedSort] = useState<string>("newest");

  const handleSearch = () => {
    startTransition(async () => {
      const filters: SearchPublicRecipesFilters = {
        searchTerm: searchTerm || undefined,
        category: selectedCategory || undefined,
        cuisine: selectedCuisine || undefined,
        difficulty: selectedDifficulty as any,
        sortBy: selectedSort as any
      };

      const results = await searchPublicRecipes(filters);
      setRecipes(results);
    });
  };

  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setSelectedCuisine("");
    setSelectedDifficulty("");
    setSelectedSort("newest");
    setRecipes([]);
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          <Trans>Explore Recipes</Trans>
        </h1>
        {(searchTerm || selectedCategory || selectedCuisine || selectedDifficulty) && (
          <Button
            size="sm"
            variant="light"
            color="danger"
            onPress={clearFilters}
            startContent={<X className="h-4 w-4" />}
          >
            <Trans>Clear Filters</Trans>
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <Input
          type="text"
          placeholder={t`Search recipes...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          startContent={<Search className="h-4 w-4 text-default-400" />}
          classNames={{
            input: "text-base",
            inputWrapper: "h-12"
          }}
        />

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <Chip
              key={category}
              color={selectedCategory === category ? "primary" : "default"}
              variant={selectedCategory === category ? "solid" : "bordered"}
              onClick={() => handleCategoryClick(category)}
              classNames={{ base: "cursor-pointer" }}
            >
              {category}
            </Chip>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select
            label={t`Cuisine`}
            placeholder={t`All cuisines`}
            selectedKeys={selectedCuisine ? [selectedCuisine] : []}
            onChange={(e) => setSelectedCuisine(e.target.value)}
          >
            {CUISINES.map((cuisine) => (
              <SelectItem key={cuisine}>{cuisine}</SelectItem>
            ))}
          </Select>

          <Select
            label={t`Difficulty`}
            placeholder={t`All levels`}
            selectedKeys={selectedDifficulty ? [selectedDifficulty] : []}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            {DIFFICULTIES.map((diff) => (
              <SelectItem key={diff.key}>{diff.label}</SelectItem>
            ))}
          </Select>

          <Select
            label={t`Sort by`}
            selectedKeys={[selectedSort]}
            onChange={(e) => setSelectedSort(e.target.value)}
          >
            {SORT_OPTIONS.map((sort) => (
              <SelectItem key={sort.key}>{sort.label}</SelectItem>
            ))}
          </Select>
        </div>

        <Button color="primary" size="lg" onPress={handleSearch} isLoading={isPending} fullWidth>
          <Trans>Search</Trans>
        </Button>
      </div>

      {recipes.length > 0 && (
        <div className="mt-4">
          <RecipesList recipes={recipes} showFavorites />
        </div>
      )}

      {recipes.length === 0 && !isPending && searchTerm && (
        <div className="py-12 text-center text-default-400">
          <Trans>No recipes found. Try adjusting your filters.</Trans>
        </div>
      )}
    </div>
  );
};
