"use client";

import { Button, Card, CardBody, Spinner, Tab, Tabs } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { ChefHat, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listUserRecipes } from "~/applications/Recipes/Api";
import type { RecipePayload } from "~/applications/Recipes/Domain/Schemas/Recipe.schema";
import { RecipeCard } from "~/applications/Recipes/Ui/components/RecipeCard";
import { PageHeader } from "~/components/Header/PageHeader";

export function MyRecipesPageClient() {
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
    <div className="flex flex-col w-full">
      <PageHeader
        title={<Trans>My Recipes</Trans>}
        href="/recipes"
        extra={
          <div className="flex gap-2">
            <Button
              as={Link}
              href="/recipes/explore"
              isIconOnly
              variant="flat"
              size="sm"
              className="touch-manipulation min-w-11 min-h-11"
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button
              as={Link}
              href="/recipes/new"
              isIconOnly
              variant="flat"
              color="primary"
              size="sm"
              className="touch-manipulation min-w-11 min-h-11"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        }
      />

      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
        <div className="mb-6">
          <Tabs
            selectedKey={filter}
            onSelectionChange={(key) => setFilter(key as "all" | "public" | "private")}
            color="primary"
            size="lg"
            fullWidth
            classNames={{
              tabList: "w-full",
              tab: "h-12"
            }}
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

        {filteredRecipes.length === 0 ? (
          <Card className="mt-4">
            <CardBody className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
                <ChefHat className="w-10 h-10 text-primary-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                {filter === "all" ? (
                  <Trans>No recipes yet</Trans>
                ) : filter === "public" ? (
                  <Trans>No public recipes</Trans>
                ) : (
                  <Trans>No private recipes</Trans>
                )}
              </h3>
              <p className="text-sm sm:text-base text-default-500 mb-6 max-w-md">
                {filter === "all" ? (
                  <Trans>Start creating your first recipe or browse the community recipes</Trans>
                ) : (
                  <Trans>You don't have any {filter} recipes yet</Trans>
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button
                  as={Link}
                  href="/recipes/new"
                  color="primary"
                  size="lg"
                  startContent={<Plus className="w-5 h-5" />}
                  className="touch-manipulation"
                >
                  <Trans>Create Recipe</Trans>
                </Button>
                <Button
                  as={Link}
                  href="/recipes/explore"
                  variant="bordered"
                  size="lg"
                  className="touch-manipulation"
                >
                  <Trans>Browse Community</Trans>
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} showFavorite showVisibility />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
