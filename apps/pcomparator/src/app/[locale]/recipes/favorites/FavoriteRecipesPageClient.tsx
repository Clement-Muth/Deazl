"use client";

import { Button, Card, CardBody, Spinner } from "@heroui/react";
import { ChefHat, Heart, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserFavoriteRecipesDetails } from "~/applications/Recipes/Api";
import type { RecipePayload } from "~/applications/Recipes/Domain/Schemas/Recipe.schema";
import { PageHeader } from "~/components/Header/PageHeader";
import useDevice from "~/hooks/useDevice";

export function FavoriteRecipesPageClient() {
  const router = useRouter();
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
    <>
      <div className="container mx-auto w-full">
        {device === "mobile" && (
          <PageHeader
            title="My Favorites"
            href="/recipes"
            extra={
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
            }
          />
        )}

        <div className="flex flex-col px-3 w-full sm:px-4 py-4 sm:py-8 max-w-7xl sm:space-y-12">
          {/* Recipes Grid */}
          {recipes.length === 0 ? (
            <Card className="mt-8">
              <CardBody className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                <Heart className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  No favorite recipes yet
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md">
                  Start exploring recipes and click the heart icon to save your favorites
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button as={Link} href="/recipes" color="primary">
                    Explore Recipe Hub
                  </Button>
                  <Button as={Link} href="/recipes/explore" variant="bordered">
                    Advanced Search
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {recipes.map((recipe) => (
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

                      <div className="absolute top-2 left-2">
                        <div className="p-2 rounded-full bg-white/90 backdrop-blur-sm">
                          <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-danger text-danger" />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-900 line-clamp-2 mb-2">
                        {recipe.name}
                      </h3>

                      {recipe.description && (
                        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-3">
                          {recipe.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500">
                        <span>{recipe.totalTime} min</span>
                        <span>{recipe.servings} portions</span>
                        <span className="ml-auto">{recipe.difficulty}</span>
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
