"use client";

import { Button, Spinner } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Filter, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "~/components/Header/PageHeader";
import { searchRecipes } from "../Api";
import type { RecipeSearchFilters } from "../Application/Services/RecipeSearch.service";
import type { RecipePayload } from "../Domain/Schemas/Recipe.schema";
import { RecipeCard } from "./components/RecipeCard";
import { RecipeSearchBar } from "./components/RecipeSearchBar";
import { RecipeSearchFiltersModal } from "./components/RecipeSearchFiltersModal";

export function RecipeSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLingui();

  const [recipes, setRecipes] = useState<RecipePayload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<RecipeSearchFilters>({});

  useEffect(() => {
    const query = searchParams.get("q");
    const category = searchParams.get("category");
    const cuisine = searchParams.get("cuisine");
    const difficulty = searchParams.get("difficulty");
    const maxTime = searchParams.get("maxTime");
    const tags = searchParams.get("tags");
    const sort = searchParams.get("sort");

    console.log(searchParams);
    const initialFilters: RecipeSearchFilters = {
      searchTerm: query || undefined,
      category: category || undefined,
      cuisine: cuisine || undefined,
      difficulty: (difficulty as any) || undefined,
      maxTotalTime: maxTime ? Number.parseInt(maxTime) : undefined,
      tags: tags ? [tags] : undefined,
      sortBy: (sort as any) || "popular"
    };

    setFilters(initialFilters);
    loadRecipes(initialFilters);
  }, [searchParams]);

  const loadRecipes = async (searchFilters: RecipeSearchFilters) => {
    setIsLoading(true);
    try {
      const results = await searchRecipes(searchFilters);
      setRecipes(results);
    } catch (error) {
      console.error("Failed to search recipes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    const newFilters = { ...filters, searchTerm: query };
    setFilters(newFilters);
    updateURL(newFilters);
    loadRecipes(newFilters);
  };

  const handleApplyFilters = (newFilters: RecipeSearchFilters) => {
    setFilters(newFilters);
    updateURL(newFilters);
    loadRecipes(newFilters);
  };

  const updateURL = (searchFilters: RecipeSearchFilters) => {
    const params = new URLSearchParams();

    if (searchFilters.searchTerm) params.set("q", searchFilters.searchTerm);
    if (searchFilters.category)
      params.set(
        "category",
        Array.isArray(searchFilters.category) ? searchFilters.category[0] : searchFilters.category
      );
    if (searchFilters.cuisine)
      params.set(
        "cuisine",
        Array.isArray(searchFilters.cuisine) ? searchFilters.cuisine[0] : searchFilters.cuisine
      );
    if (searchFilters.difficulty)
      params.set(
        "difficulty",
        Array.isArray(searchFilters.difficulty) ? searchFilters.difficulty[0] : searchFilters.difficulty
      );
    if (searchFilters.maxTotalTime) params.set("maxTime", searchFilters.maxTotalTime.toString());
    if (searchFilters.tags && searchFilters.tags.length > 0) params.set("tags", searchFilters.tags[0]);
    if (searchFilters.sortBy) params.set("sort", searchFilters.sortBy);

    router.push(`/recipes/explore?${params.toString()}`);
  };

  const hasActiveFilters = filters.category || filters.cuisine || filters.difficulty || filters.tags;

  return (
    <div className="flex flex-col w-full">
      <PageHeader
        title={<Trans>Explore Recipes</Trans>}
        href="/recipes"
        extra={
          hasActiveFilters ? (
            <Button
              size="sm"
              variant="light"
              color="danger"
              startContent={<X className="h-4 w-4" />}
              onPress={() => {
                setFilters({});
                router.push("/recipes/explore");
                loadRecipes({});
              }}
              className="touch-manipulation"
            >
              <Trans>Clear</Trans>
            </Button>
          ) : null
        }
      />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        <div className="mb-6 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <RecipeSearchBar
                onSearch={handleSearch}
                onFilterClick={() => setIsFiltersOpen(true)}
                placeholder={t`Search by name, ingredient...`}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-default-500">
                <Trans>Active filters:</Trans>
              </span>
              {filters.category && (
                <span className="px-3 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded-full text-sm">
                  {filters.category}
                </span>
              )}
              {filters.cuisine && (
                <span className="px-3 py-1 bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300 rounded-full text-sm">
                  {filters.cuisine}
                </span>
              )}
              {filters.difficulty && (
                <span className="px-3 py-1 bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300 rounded-full text-sm">
                  {filters.difficulty}
                </span>
              )}
              {filters.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Spinner size="lg" />
            </div>
          ) : recipes.length > 0 ? (
            <>
              <p className="text-default-500 mb-6">
                <Trans>{recipes.length} recipes found</Trans>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} showFavorite />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="mb-4">
                <Filter className="w-16 h-16 text-default-300 mx-auto" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                <Trans>No recipes found</Trans>
              </h2>
              <p className="text-default-500 mb-6">
                <Trans>Try adjusting your search criteria</Trans>
              </p>
              <Button
                color="primary"
                size="lg"
                onPress={() => setIsFiltersOpen(true)}
                className="touch-manipulation"
              >
                <Trans>Modify filters</Trans>
              </Button>
            </div>
          )}
        </div>

        <RecipeSearchFiltersModal
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          onApplyFilters={handleApplyFilters}
          initialFilters={filters}
        />
      </div>
    </div>
  );
}
