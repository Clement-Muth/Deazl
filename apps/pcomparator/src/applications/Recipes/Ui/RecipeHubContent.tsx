"use client";

import { Button, Chip, Divider, Link } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  Clock,
  Compass,
  DollarSign,
  Flame,
  Heart,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  User
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "~/components/Header/PageHeader";
import type { RecipeHubDataPayload } from "../Api/hub/getRecipeHubData.api";
import { searchRecipes } from "../Api/search/searchRecipes.api";
import type { RecipeSearchFilters } from "../Application/Services/RecipeSearch.service";

import { useRecipeFavorites } from "../hooks/useRecipeFavorites";
import { RecipeCard } from "./components/RecipeCard";
import { RecipeCategoryCard } from "./components/RecipeCategoryCard";
import { RecipeHorizontalList } from "./components/RecipeHorizontalList";
import { RecipeSearchBar } from "./components/RecipeSearchBar";
import { RecipeSearchFiltersModal } from "./components/RecipeSearchFiltersModal";

interface RecipeHubContentProps {
  hubData: RecipeHubDataPayload | null;
}

export function RecipeHubContent({ hubData }: RecipeHubContentProps) {
  const router = useRouter();
  const { t } = useLingui();
  const { favorites, isFavorite, toggleFavorite } = useRecipeFavorites();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredRecipes, setFilteredRecipes] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [activeFilters, setActiveFilters] = useState<RecipeSearchFilters>({});

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsLoading(true);
      setShowResults(true);
      try {
        const results = await searchRecipes({ searchTerm: query, limit: 20 });
        setFilteredRecipes(results);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setShowResults(false);
      setFilteredRecipes([]);
    }
  };

  const handleFilterClick = () => {
    setIsFiltersOpen(true);
  };

  const handleApplyFilters = async (filters: RecipeSearchFilters) => {
    setIsLoading(true);
    setShowResults(true);
    setActiveFilters(filters);
    try {
      const results = await searchRecipes(filters);
      setFilteredRecipes(results);
    } catch (error) {
      console.error("Filter error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFilter = async (filters: RecipeSearchFilters) => {
    setIsLoading(true);
    setShowResults(true);
    setActiveFilters(filters);
    try {
      const results = await searchRecipes(filters);
      setFilteredRecipes(results);
    } catch (error) {
      console.error("Quick filter error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="container mx-auto w-full flex flex-col items-center max-w-7xl">
        <PageHeader
          title={<Trans>Recipe Hub</Trans>}
          href="/"
          extra={
            <div className="flex gap-2">
              <Button
                as={Link}
                href="/recipes/new"
                isIconOnly
                variant="flat"
                color="primary"
                size="sm"
                className="min-w-11 min-h-11 touch-manipulation"
                aria-label={t`Create recipe`}
              >
                <Plus className="w-5 h-5" />
              </Button>
              <Button
                as={Link}
                href="/recipes/my-recipes"
                isIconOnly
                variant="flat"
                size="sm"
                className="min-w-11 min-h-11 touch-manipulation"
                aria-label={t`My recipes`}
              >
                <User className="w-5 h-5" />
              </Button>
              <Button
                as={Link}
                href="/recipes/favorites"
                isIconOnly
                variant="flat"
                color="danger"
                size="sm"
                className="min-w-11 min-h-11 touch-manipulation"
                aria-label={t`Favorites`}
              >
                <Heart className="w-5 h-5" />
              </Button>
            </div>
          }
        />
        <div className="flex flex-col px-4 w-full py-4 gap-6 sm:py-8 sm:gap-8">
          <section className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                <Trans>Discover recipes tailored to your budget</Trans>
              </h1>
              <p className="text-base sm:text-lg text-default-500 max-w-3xl mx-auto">
                <Trans>Smart recipes with real prices, nutritional quality, and cellar optimization</Trans>
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <RecipeSearchBar onSearch={handleSearch} onFilterClick={handleFilterClick} />
            </div>

            {/* <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="flat"
                size="md"
                onPress={() => handleQuickFilter({ tags: ["vegan"], limit: 20 })}
                className="min-h-11 touch-manipulation"
              >
                <Trans>Vegan</Trans>
              </Button>
              <Button
                variant="flat"
                size="md"
                onPress={() => handleQuickFilter({ tags: ["vegetarian"], limit: 20 })}
                className="min-h-11 touch-manipulation"
              >
                <Trans>Vegetarian</Trans>
              </Button>
              <Button
                variant="flat"
                size="md"
                onPress={() => handleQuickFilter({ tags: ["gluten-free"], limit: 20 })}
                className="min-h-11 touch-manipulation"
              >
                <Trans>Gluten-free</Trans>
              </Button>
              <Button
                variant="flat"
                size="md"
                onPress={() => handleQuickFilter({ maxTotalTime: 30, limit: 20 })}
                className="min-h-11 touch-manipulation"
              >
                <Trans>Quick (under 30 min)</Trans>
              </Button>
            </div> */}
          </section>

          {showResults && (
            <section className="space-y-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-bold">
                    <Trans>{filteredRecipes.length} results</Trans>
                  </h2>
                  <Button
                    variant="light"
                    size="sm"
                    onPress={() => {
                      setShowResults(false);
                      setFilteredRecipes([]);
                      setSearchQuery("");
                      setActiveFilters({});
                    }}
                    className="min-h-11 touch-manipulation"
                  >
                    <Trans>Clear all</Trans>
                  </Button>
                </div>

                {Object.keys(activeFilters).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <Chip
                        size="sm"
                        variant="flat"
                        color="primary"
                        onClose={() => {
                          setSearchQuery("");
                          const { searchTerm, ...newFilters } = activeFilters;
                          setActiveFilters(newFilters);
                          handleApplyFilters(newFilters);
                        }}
                      >
                        <Trans>Search:</Trans> {searchQuery}
                      </Chip>
                    )}
                    {activeFilters.category &&
                      (Array.isArray(activeFilters.category) ? (
                        activeFilters.category.map((cat) => (
                          <Chip
                            key={cat}
                            size="sm"
                            variant="flat"
                            color="primary"
                            onClose={() => {
                              const categoryArray = activeFilters.category as string[];
                              const newCategories = categoryArray.filter((c) => c !== cat);
                              const newFilters =
                                newCategories.length > 0
                                  ? { ...activeFilters, category: newCategories }
                                  : { ...activeFilters, category: undefined };
                              setActiveFilters(newFilters);
                              handleApplyFilters(newFilters);
                            }}
                          >
                            <Trans>Category:</Trans> {cat}
                          </Chip>
                        ))
                      ) : (
                        <Chip
                          size="sm"
                          variant="flat"
                          color="primary"
                          onClose={() => {
                            const { category, ...newFilters } = activeFilters;
                            setActiveFilters(newFilters);
                            handleApplyFilters(newFilters);
                          }}
                        >
                          <Trans>Category:</Trans> {activeFilters.category}
                        </Chip>
                      ))}
                    {activeFilters.tags &&
                      activeFilters.tags.length > 0 &&
                      activeFilters.tags.map((tag) => (
                        <Chip
                          key={tag}
                          size="sm"
                          variant="flat"
                          color="secondary"
                          onClose={() => {
                            const newTags = activeFilters.tags?.filter((t) => t !== tag);
                            const newFilters =
                              newTags && newTags.length > 0
                                ? { ...activeFilters, tags: newTags }
                                : { ...activeFilters, tags: undefined };
                            setActiveFilters(newFilters);
                            handleApplyFilters(newFilters);
                          }}
                        >
                          #{tag}
                        </Chip>
                      ))}
                    {activeFilters.maxTotalTime && (
                      <Chip
                        size="sm"
                        variant="flat"
                        color="warning"
                        onClose={() => {
                          const { maxTotalTime, ...newFilters } = activeFilters;
                          setActiveFilters(newFilters);
                          handleApplyFilters(newFilters);
                        }}
                      >
                        <Trans>Max time:</Trans> {activeFilters.maxTotalTime} min
                      </Chip>
                    )}
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-content2 rounded-xl aspect-4/3 mb-3" />
                      <div className="bg-content2 h-4 rounded mb-2" />
                      <div className="bg-content2 h-3 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : filteredRecipes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      showFavorite
                      isFavorite={isFavorite(recipe.id)}
                      onFavoriteToggle={toggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-default-500 text-lg mb-4">
                    <Trans>No recipes found</Trans>
                  </p>
                  <Button variant="flat" color="primary" onPress={() => setIsFiltersOpen(true)}>
                    <Trans>Modify filters</Trans>
                  </Button>
                </div>
              )}
            </section>
          )}

          {!showResults && <Divider />}

          {!showResults && hubData && hubData.popular.length > 0 && (
            <RecipeHorizontalList
              title={t`Popular Recipes`}
              icon={<TrendingUp className="w-5 h-5 text-primary" />}
              recipes={hubData.popular}
              onViewAll={() => router.push("/recipes/explore?sort=popular")}
              showFavorites
              favoriteRecipeIds={new Set(Array.from(favorites))}
              onFavoriteToggle={toggleFavorite}
            />
          )}

          {!showResults && hubData && hubData.quick.length > 0 && (
            <RecipeHorizontalList
              title={t`Quick Recipes`}
              icon={<Clock className="w-5 h-5 text-warning" />}
              recipes={hubData.quick}
              onViewAll={() => handleQuickFilter({ maxTotalTime: 30, sortBy: "quickest", limit: 20 })}
              showFavorites
              favoriteRecipeIds={new Set(Array.from(favorites))}
              onFavoriteToggle={toggleFavorite}
            />
          )}

          {!showResults && hubData && hubData.cheap.length > 0 && (
            <RecipeHorizontalList
              title={t`Budget Recipes`}
              icon={<DollarSign className="w-5 h-5 text-success" />}
              recipes={hubData.cheap}
              onViewAll={() => handleQuickFilter({ sortBy: "cheapest", limit: 20 })}
              showFavorites
              favoriteRecipeIds={new Set(Array.from(favorites))}
              onFavoriteToggle={toggleFavorite}
            />
          )}

          {!showResults && hubData && hubData.healthy.length > 0 && (
            <RecipeHorizontalList
              title={t`Healthy Recipes`}
              icon={<Flame className="w-5 h-5 text-danger" />}
              recipes={hubData.healthy}
              onViewAll={() => handleQuickFilter({ tags: ["healthy"], sortBy: "healthiest", limit: 20 })}
              showFavorites
              favoriteRecipeIds={new Set(Array.from(favorites))}
              onFavoriteToggle={toggleFavorite}
            />
          )}

          {!showResults && hubData && hubData.cellarBased.length > 0 && (
            <RecipeHorizontalList
              title={t`From your cellar`}
              icon={<Package className="w-5 h-5 text-secondary" />}
              recipes={hubData.cellarBased}
              showFavorites
            />
          )}

          {!showResults && hubData && hubData.recommended.length > 0 && (
            <RecipeHorizontalList
              title={t`Recommended for you`}
              icon={<Sparkles className="w-5 h-5 text-primary" />}
              recipes={hubData.recommended}
              showFavorites
            />
          )}

          {!showResults && hubData && hubData.purchaseBased.length > 0 && (
            <RecipeHorizontalList
              title={t`Based on your purchases`}
              icon={<ShoppingBag className="w-5 h-5 text-secondary" />}
              recipes={hubData.purchaseBased}
              showFavorites
            />
          )}

          {!showResults && hubData && hubData.categories.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Compass className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  <Trans>Explore by category</Trans>
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {hubData.categories.map((category) => (
                  <RecipeCategoryCard
                    key={category.slug}
                    name={category.name}
                    slug={category.slug}
                    count={category.count}
                  />
                ))}
              </div>
            </section>
          )}

          {!showResults && hubData && hubData.new.length > 0 && (
            <RecipeHorizontalList
              title={t`New Recipes`}
              icon={<Heart className="w-5 h-5 text-danger" />}
              recipes={hubData.new}
              onViewAll={() => handleQuickFilter({ sortBy: "newest", limit: 20 })}
              showFavorites
            />
          )}

          <RecipeSearchFiltersModal
            isOpen={isFiltersOpen}
            onClose={() => setIsFiltersOpen(false)}
            onApplyFilters={handleApplyFilters}
            initialFilters={activeFilters}
          />
        </div>
      </div>
    </>
  );
}
