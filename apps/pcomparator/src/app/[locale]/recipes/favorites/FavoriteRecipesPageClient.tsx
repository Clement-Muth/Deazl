"use client";

import { Button, Card, CardBody, Spinner } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { Heart, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getUserFavoriteRecipesDetails } from "~/applications/Recipes/Api";
import type { RecipePayload } from "~/applications/Recipes/Domain/Schemas/Recipe.schema";
import { RecipeCard } from "~/applications/Recipes/Ui/components/RecipeCard";
import { PageHeader } from "~/components/Header/PageHeader";
import useDevice from "~/hooks/useDevice";

export function FavoriteRecipesPageClient() {
  const device = useDevice();
  const [recipes, setRecipes] = useState<RecipePayload[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const data = await getUserFavoriteRecipesDetails();
      setRecipes(data);
    } catch (error) {
      console.error("Failed to load favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {device === "mobile" && (
        <PageHeader
          title={<Trans>My Favorites</Trans>}
          href="/recipes"
          extra={
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
          }
        />
      )}

      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
        {recipes.length === 0 ? (
          <Card className="mt-4 sm:mt-8">
            <CardBody className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-danger-50 dark:bg-danger-900/20 flex items-center justify-center mb-4">
                <Heart className="w-10 h-10 text-danger-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                <Trans>No favorite recipes yet</Trans>
              </h3>
              <p className="text-sm sm:text-base text-default-500 mb-6 max-w-md">
                <Trans>Start exploring recipes and click the heart icon to save your favorites</Trans>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button as={Link} href="/recipes" color="primary" size="lg" className="touch-manipulation">
                  <Trans>Explore Recipe Hub</Trans>
                </Button>
                <Button
                  as={Link}
                  href="/recipes/explore"
                  variant="bordered"
                  size="lg"
                  className="touch-manipulation"
                >
                  <Trans>Advanced Search</Trans>
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} showFavorite />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
