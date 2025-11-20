"use client";

import { Button, Card, CardBody, Chip, Spinner, Tab, Tabs } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { ChefHat, Heart, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { listUserRecipes } from "~/applications/Recipes/Api";
import type { RecipePayload } from "~/applications/Recipes/Domain/Schemas/Recipe.schema";
import { PageHeader } from "~/components/Header/PageHeader";
import useDevice from "~/hooks/useDevice";

export function MyRecipesPageClient() {
  const router = useRouter();
  const device = useDevice();
  const [recipes, setRecipes] = useState<RecipePayload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "public" | "private">("all");

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const data = await listUserRecipes();
      setRecipes(data);
    } catch (error) {
      console.error("Failed to load recipes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecipes = recipes.filter((recipe) => {
    if (filter === "all") return true;
    if (filter === "public") return recipe.isPublic;
    if (filter === "private") return !recipe.isPublic;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto w-full">
        <PageHeader
          title="My Recipes"
          href="/recipes"
          extra={
            <div className="flex gap-2">
              <Button
                as={Link}
                href="/recipes/explore"
                isIconOnly
                variant="flat"
                size="sm"
                className="touch-manipulation"
              >
                <Search className="w-4 h-4" />
              </Button>
              <Button
                as={Link}
                href="/recipes/new"
                isIconOnly
                variant="flat"
                color="primary"
                size="sm"
                className="touch-manipulation"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          }
        />

        <div className="flex flex-col px-3 w-full sm:px-4 py-4 sm:py-8 max-w-7xl sm:space-y-12">
          {/* Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <Tabs
              selectedKey={filter}
              onSelectionChange={(key) => setFilter(key as "all" | "public" | "private")}
              color="primary"
              size="lg"
              fullWidth
            >
              <Tab
                key="all"
                title={
                  <div className="flex items-center gap-2 px-2">
                    <span>
                      <Trans>All ({recipes.length})</Trans>
                    </span>
                  </div>
                }
              />
              <Tab
                key="public"
                title={
                  <div className="flex items-center gap-2 px-2">
                    <span>
                      <Trans>Public ({recipes.filter((r) => r.isPublic).length})</Trans>
                    </span>
                  </div>
                }
              />
              <Tab
                key="private"
                title={
                  <div className="flex items-center gap-2 px-2">
                    <span>
                      <Trans>Private ({recipes.filter((r) => !r.isPublic).length})</Trans>
                    </span>
                  </div>
                }
              />
            </Tabs>
          </div>

          {/* Recipes Grid */}
          {filteredRecipes.length === 0 ? (
            <Card className="mt-8">
              <CardBody className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                <ChefHat className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  {filter === "all" ? "No recipes yet" : `No ${filter} recipes`}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md">
                  {filter === "all"
                    ? "Start creating your first recipe or browse the community recipes"
                    : `You don't have any ${filter} recipes yet`}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    as={Link}
                    href="/recipes/new"
                    color="primary"
                    startContent={<Plus className="w-4 h-4" />}
                  >
                    Create Recipe
                  </Button>
                  <Button as={Link} href="/recipes/explore" variant="bordered">
                    Browse Community
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredRecipes.map((recipe) => (
                <Card
                  key={recipe.id}
                  isPressable
                  onPress={() => router.push(`/recipes/${recipe.id}`)}
                  className="hover:scale-[1.02] transition-transform"
                >
                  <CardBody className="p-0">
                    <div className="relative w-full h-40 sm:h-48 overflow-hidden">
                      {recipe.imageUrl ? (
                        <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                          <ChefHat className="w-12 h-12 sm:w-16 sm:h-16 text-white opacity-80" />
                        </div>
                      )}

                      <div className="absolute top-2 right-2 flex gap-1">
                        <Chip
                          size="sm"
                          variant="solid"
                          className="bg-white/90 backdrop-blur-sm text-gray-900"
                        >
                          {recipe.isPublic ? "Public" : "Private"}
                        </Chip>
                      </div>

                      <div className="absolute top-2 left-2">
                        <div className="p-2 rounded-full bg-white/90 backdrop-blur-sm">
                          <Heart className="w-4 h-4 text-gray-600" />
                          <span className="sr-only">{recipe.favoritesCount || 0} favorites</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4">
                      <h3 className="font-semibold text-base sm:text-lg text-foreground line-clamp-2 mb-2">
                        {recipe.name}
                      </h3>

                      {recipe.description && (
                        <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 mb-3">
                          {recipe.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400">
                        <div className="flex items-center gap-3">
                          <span>{recipe.totalTime} min</span>
                          <span>{recipe.servings} portions</span>
                        </div>
                        <Chip size="sm" color="success" variant="flat">
                          {recipe.viewsCount || 0} views
                        </Chip>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
