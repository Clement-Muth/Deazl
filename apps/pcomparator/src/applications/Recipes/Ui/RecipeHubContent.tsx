"use client";

import { Button, Chip, Divider, Link } from "@heroui/react";
import {
  Clock,
  Compass,
  DollarSign,
  Flame,
  Heart,
  Package,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  User
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "~/components/Header/PageHeader";
import useDevice from "~/hooks/useDevice";
import type { RecipeHubDataPayload } from "../Api/hub/getRecipeHubData.api";
import { searchRecipes } from "../Api/search/searchRecipes.api";
import type { RecipeSearchFilters } from "../Application/Services/RecipeSearch.service";
import type { DifficultyLevel } from "../Domain/Schemas/Recipe.schema";
import { useRecipeFavorites } from "../hooks/useRecipeFavorites";
import { RecipeCard } from "./components/RecipeCard";
import { RecipeCategoryCard } from "./components/RecipeCategoryCard";
import { RecipeHorizontalList } from "./components/RecipeHorizontalList";
import { RecipeSearchBar } from "./components/RecipeSearchBar";
import { RecipeSearchFiltersModal } from "./components/RecipeSearchFiltersModal";

interface RecipeHubContentProps {
  hubData: RecipeHubDataPayload;
}

export function RecipeHubContent({ hubData }: RecipeHubContentProps) {
  const router = useRouter();
  const device = useDevice();
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
      <div className="container mx-auto w-full">
        <PageHeader
          title="Recipe Hub"
          href="/recipes"
          extra={
            <div className="flex gap-2">
              <Button
                as={Link}
                href="/recipes/my-recipes"
                isIconOnly
                variant="flat"
                size="sm"
                className="touch-manipulation"
              >
                <User className="w-4 h-4" />
              </Button>
              <Button
                as={Link}
                href="/recipes/favorites"
                isIconOnly
                variant="flat"
                color="danger"
                size="sm"
                className="touch-manipulation"
              >
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          }
        />
        <div className="flex flex-col px-3 w-full sm:px-4 py-4 gap-6 sm:py-8 max-w-7xl sm:space-y-12">
          {/* Hero Search Section */}
          <section className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 px-2">
                Découvrez des recettes adaptées à votre budget
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Des recettes intelligentes avec prix réels, qualité nutritionnelle et optimisation du cellier
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <RecipeSearchBar onSearch={handleSearch} onFilterClick={handleFilterClick} />
            </div>

            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-2">
              <Button
                type="button"
                onPress={() => handleQuickFilter({ tags: ["vegan"], limit: 20 })}
                className="px-3 sm:px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-xs sm:text-sm font-medium transition-colors touch-manipulation"
              >
                Vegan
              </Button>
              <Button
                type="button"
                onPress={() => handleQuickFilter({ tags: ["vegetarian"], limit: 20 })}
                className="px-3 sm:px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-xs sm:text-sm font-medium transition-colors touch-manipulation"
              >
                Végétarien
              </Button>
              <Button
                type="button"
                onPress={() => handleQuickFilter({ tags: ["gluten-free"], limit: 20 })}
                className="px-3 sm:px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-xs sm:text-sm font-medium transition-colors touch-manipulation"
              >
                Sans gluten
              </Button>
              <Button
                type="button"
                onPress={() => handleQuickFilter({ maxTotalTime: 30, limit: 20 })}
                className="px-3 sm:px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-xs sm:text-sm font-medium transition-colors touch-manipulation"
              >
                Rapide (- 30 min)
              </Button>
            </div>
          </section>

          {/* Search/Filter Results */}
          {showResults && (
            <>
              <Divider />
              <section className="space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {filteredRecipes.length} résultat{filteredRecipes.length > 1 ? "s" : ""}
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setShowResults(false);
                        setFilteredRecipes([]);
                        setSearchQuery("");
                        setActiveFilters({});
                      }}
                      className="text-sm text-gray-600 hover:text-gray-900 underline"
                    >
                      Effacer tout
                    </button>
                  </div>

                  {/* Active Filters Display */}
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
                          Recherche: {searchQuery}
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
                              Catégorie: {cat}
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
                            Catégorie: {activeFilters.category}
                          </Chip>
                        ))}
                      {activeFilters.cuisine &&
                        (Array.isArray(activeFilters.cuisine) ? (
                          activeFilters.cuisine.map((cuisine) => (
                            <Chip
                              key={cuisine}
                              size="sm"
                              variant="flat"
                              color="primary"
                              onClose={() => {
                                const cuisineArray = activeFilters.cuisine as string[];
                                const newCuisines = cuisineArray.filter((c) => c !== cuisine);
                                const newFilters =
                                  newCuisines.length > 0
                                    ? { ...activeFilters, cuisine: newCuisines }
                                    : { ...activeFilters, cuisine: undefined };
                                setActiveFilters(newFilters);
                                handleApplyFilters(newFilters);
                              }}
                            >
                              Cuisine: {cuisine}
                            </Chip>
                          ))
                        ) : (
                          <Chip
                            size="sm"
                            variant="flat"
                            color="primary"
                            onClose={() => {
                              const { cuisine, ...newFilters } = activeFilters;
                              setActiveFilters(newFilters);
                              handleApplyFilters(newFilters);
                            }}
                          >
                            Cuisine: {activeFilters.cuisine}
                          </Chip>
                        ))}
                      {activeFilters.difficulty &&
                        (Array.isArray(activeFilters.difficulty) ? (
                          activeFilters.difficulty.map((diff) => (
                            <Chip
                              key={diff}
                              size="sm"
                              variant="flat"
                              color="primary"
                              onClose={() => {
                                const difficultyArray = activeFilters.difficulty as DifficultyLevel[];
                                const newDifficulties = difficultyArray.filter((d) => d !== diff);
                                const newFilters =
                                  newDifficulties.length > 0
                                    ? { ...activeFilters, difficulty: newDifficulties }
                                    : { ...activeFilters, difficulty: undefined };
                                setActiveFilters(newFilters);
                                handleApplyFilters(newFilters);
                              }}
                            >
                              Difficulté:{" "}
                              {diff === "EASY" ? "Facile" : diff === "MEDIUM" ? "Moyen" : "Difficile"}
                            </Chip>
                          ))
                        ) : (
                          <Chip
                            size="sm"
                            variant="flat"
                            color="primary"
                            onClose={() => {
                              const { difficulty, ...newFilters } = activeFilters;
                              setActiveFilters(newFilters);
                              handleApplyFilters(newFilters);
                            }}
                          >
                            Difficulté:{" "}
                            {activeFilters.difficulty === "EASY"
                              ? "Facile"
                              : activeFilters.difficulty === "MEDIUM"
                                ? "Moyen"
                                : "Difficile"}
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
                      {activeFilters.isVegan && (
                        <Chip
                          size="sm"
                          variant="flat"
                          color="success"
                          onClose={() => {
                            const { isVegan, ...newFilters } = activeFilters;
                            setActiveFilters(newFilters);
                            handleApplyFilters(newFilters);
                          }}
                        >
                          Vegan
                        </Chip>
                      )}
                      {activeFilters.isVegetarian && (
                        <Chip
                          size="sm"
                          variant="flat"
                          color="success"
                          onClose={() => {
                            const { isVegetarian, ...newFilters } = activeFilters;
                            setActiveFilters(newFilters);
                            handleApplyFilters(newFilters);
                          }}
                        >
                          Végétarien
                        </Chip>
                      )}
                      {activeFilters.isGlutenFree && (
                        <Chip
                          size="sm"
                          variant="flat"
                          color="success"
                          onClose={() => {
                            const { isGlutenFree, ...newFilters } = activeFilters;
                            setActiveFilters(newFilters);
                            handleApplyFilters(newFilters);
                          }}
                        >
                          Sans gluten
                        </Chip>
                      )}
                      {activeFilters.isDairyFree && (
                        <Chip
                          size="sm"
                          variant="flat"
                          color="success"
                          onClose={() => {
                            const { isDairyFree, ...newFilters } = activeFilters;
                            setActiveFilters(newFilters);
                            handleApplyFilters(newFilters);
                          }}
                        >
                          Sans lactose
                        </Chip>
                      )}
                      {activeFilters.maxPreparationTime && activeFilters.maxPreparationTime < 120 && (
                        <Chip
                          size="sm"
                          variant="flat"
                          color="warning"
                          onClose={() => {
                            const { maxPreparationTime, ...newFilters } = activeFilters;
                            setActiveFilters(newFilters);
                            handleApplyFilters(newFilters);
                          }}
                        >
                          Préparation: max {activeFilters.maxPreparationTime} min
                        </Chip>
                      )}
                      {activeFilters.maxCookingTime && activeFilters.maxCookingTime < 180 && (
                        <Chip
                          size="sm"
                          variant="flat"
                          color="warning"
                          onClose={() => {
                            const { maxCookingTime, ...newFilters } = activeFilters;
                            setActiveFilters(newFilters);
                            handleApplyFilters(newFilters);
                          }}
                        >
                          Cuisson: max {activeFilters.maxCookingTime} min
                        </Chip>
                      )}
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
                          Temps max: {activeFilters.maxTotalTime} min
                        </Chip>
                      )}
                    </div>
                  )}
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-xl aspect-[4/3] mb-3" />
                        <div className="bg-gray-200 h-4 rounded mb-2" />
                        <div className="bg-gray-200 h-3 rounded w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : filteredRecipes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
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
                  <div className="text-center py-12 sm:py-16">
                    <p className="text-gray-600 text-base sm:text-lg">Aucune recette trouvée</p>
                    <button
                      type="button"
                      onClick={() => setIsFiltersOpen(true)}
                      className="mt-4 text-primary-600 hover:text-primary-700 underline text-sm sm:text-base"
                    >
                      Modifier les filtres
                    </button>
                  </div>
                )}
              </section>
            </>
          )}

          {!showResults && <Divider />}

          {/* Popular Recipes */}
          {!showResults && hubData.popular.length > 0 && (
            <RecipeHorizontalList
              title="Recettes Populaires"
              icon={<TrendingUp className="w-6 h-6 text-primary-600" />}
              recipes={hubData.popular}
              onViewAll={() => router.push("/recipes/explore?sort=popular")}
              showFavorites
              favoriteRecipeIds={new Set(Array.from(favorites))}
              onFavoriteToggle={toggleFavorite}
            />
          )}

          {/* Quick Recipes */}
          {!showResults && hubData.quick.length > 0 && (
            <RecipeHorizontalList
              title="Recettes Rapides"
              icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6 text-warning-600" />}
              recipes={hubData.quick}
              onViewAll={() => handleQuickFilter({ maxTotalTime: 30, sortBy: "quickest", limit: 20 })}
              showFavorites
              favoriteRecipeIds={new Set(Array.from(favorites))}
              onFavoriteToggle={toggleFavorite}
            />
          )}

          {/* Cheap Recipes */}
          {!showResults && hubData.cheap.length > 0 && (
            <RecipeHorizontalList
              title="Recettes Économiques"
              icon={<DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-success-600" />}
              recipes={hubData.cheap}
              onViewAll={() => handleQuickFilter({ sortBy: "cheapest", limit: 20 })}
              showFavorites
              favoriteRecipeIds={new Set(Array.from(favorites))}
              onFavoriteToggle={toggleFavorite}
            />
          )}

          {/* Healthy Recipes */}
          {!showResults && hubData.healthy.length > 0 && (
            <RecipeHorizontalList
              title="Recettes Saines"
              icon={<Flame className="w-5 h-5 sm:w-6 sm:h-6 text-danger-600" />}
              recipes={hubData.healthy}
              onViewAll={() => handleQuickFilter({ tags: ["healthy"], sortBy: "healthiest", limit: 20 })}
              showFavorites
              favoriteRecipeIds={new Set(Array.from(favorites))}
              onFavoriteToggle={toggleFavorite}
            />
          )}

          {/* Cellar-Based Recipes (Personalized) */}
          {!showResults && hubData.cellarBased.length > 0 && (
            <>
              <Divider />
              <RecipeHorizontalList
                title="Faisable avec votre cellier"
                icon={<Package className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-600" />}
                recipes={hubData.cellarBased}
                showFavorites
              />
            </>
          )}

          {/* Recommended Recipes (Personalized) */}
          {!showResults && hubData.recommended.length > 0 && (
            <RecipeHorizontalList
              title="Recommandé pour vous"
              icon={<Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />}
              recipes={hubData.recommended}
              showFavorites
            />
          )}

          {/* Purchase-Based Recipes (Personalized) */}
          {!showResults && hubData.purchaseBased.length > 0 && (
            <RecipeHorizontalList
              title="Basé sur vos achats récents"
              icon={<ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-600" />}
              recipes={hubData.purchaseBased}
              showFavorites
            />
          )}

          {/* Categories Section */}
          {!showResults && hubData.categories.length > 0 && (
            <>
              <Divider />
              <section className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-primary-50">
                    <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Explorer par catégorie</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
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
            </>
          )}

          {/* New Recipes */}
          {!showResults && hubData.new.length > 0 && (
            <>
              <Divider />
              <RecipeHorizontalList
                title="Nouvelles Recettes"
                icon={<Heart className="w-5 h-5 sm:w-6 sm:h-6 text-danger-600" />}
                recipes={hubData.new}
                onViewAll={() => handleQuickFilter({ sortBy: "newest", limit: 20 })}
                showFavorites
              />
            </>
          )}

          {/* Filters Modal */}
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
