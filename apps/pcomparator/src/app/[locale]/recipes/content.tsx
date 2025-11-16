"use client";

import { Button, Card, CardBody, Divider, Link } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { ArrowRight, ChefHat, Compass, Heart, Plus } from "lucide-react";
import type { RecipePayload } from "~/applications/Recipes/Domain/Schemas/Recipe.schema";
import { RecipesList } from "~/applications/Recipes/Ui";

interface RecipesContentProps {
  recipes: RecipePayload[];
  favoriteRecipes: RecipePayload[];
  publicRecipes: RecipePayload[];
}

export const RecipesContent = ({ recipes, favoriteRecipes, publicRecipes }: RecipesContentProps) => {
  const hasContent = recipes.length > 0 || favoriteRecipes.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">
            <Trans>Recipes</Trans>
          </h1>
          <Button as="a" href="/recipes/new" color="primary" startContent={<Plus className="w-5 h-5" />}>
            <span className="hidden sm:inline">
              <Trans>New Recipe</Trans>
            </span>
          </Button>
        </div>
        <p className="text-gray-500 text-base">
          <Trans>Manage your recipes and discover new ones</Trans>
        </p>
      </div>

      {!hasContent ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="mb-6 p-6 rounded-full bg-gray-100">
            <ChefHat className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            <Trans>No recipes yet</Trans>
          </h2>
          <p className="text-gray-500 mb-6 max-w-md">
            <Trans>Create your first recipe or explore public recipes from the community</Trans>
          </p>
          <div className="flex gap-3">
            <Button
              as="a"
              href="/recipes/new"
              color="primary"
              size="lg"
              startContent={<Plus className="w-5 h-5" />}
            >
              <Trans>Create Recipe</Trans>
            </Button>
            <Button
              as={Link}
              href="/recipes/explore"
              variant="bordered"
              size="lg"
              startContent={<Compass className="w-5 h-5" />}
            >
              <Trans>Explore</Trans>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* My Recipes Section */}
          {recipes.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    <Trans>My Recipes</Trans>
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    <Trans>{recipes.length} recipe(s)</Trans>
                  </p>
                </div>
                <Button
                  as={Link}
                  href="/recipes/my-recipes"
                  variant="light"
                  color="primary"
                  endContent={<ArrowRight className="w-4 h-4" />}
                >
                  <Trans>View All</Trans>
                </Button>
              </div>
              <RecipesList recipes={recipes} />
            </section>
          )}

          {/* Favorite Recipes Section */}
          {favoriteRecipes.length > 0 && (
            <>
              <Divider />
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-danger-50">
                      <Heart className="w-5 h-5 text-danger-600 fill-current" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        <Trans>My Favorites</Trans>
                      </h2>
                      <p className="text-gray-500 text-sm mt-1">
                        <Trans>{favoriteRecipes.length} favorite(s)</Trans>
                      </p>
                    </div>
                  </div>
                  <Button
                    as={Link}
                    href="/recipes/favorites"
                    variant="light"
                    color="danger"
                    endContent={<ArrowRight className="w-4 h-4" />}
                  >
                    <Trans>View All</Trans>
                  </Button>
                </div>
                <RecipesList recipes={favoriteRecipes} showFavorites />
              </section>
            </>
          )}

          {/* Discover Public Recipes Section */}
          {publicRecipes.length > 0 && (
            <>
              <Divider />
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary-50">
                      <Compass className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        <Trans>Discover Recipes</Trans>
                      </h2>
                      <p className="text-gray-500 text-sm mt-1">
                        <Trans>Popular recipes from the community</Trans>
                      </p>
                    </div>
                  </div>
                  <Button
                    as={Link}
                    href="/recipes/explore"
                    variant="light"
                    color="primary"
                    endContent={<ArrowRight className="w-4 h-4" />}
                  >
                    <Trans>View All</Trans>
                  </Button>
                </div>
                <RecipesList recipes={publicRecipes} showFavorites />

                {/* Explore CTA Card */}
                <Card className="mt-6 bg-gradient-to-br from-primary-50 to-secondary-50 border-0">
                  <CardBody className="p-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-white shadow-sm">
                          <Compass className="w-8 h-8 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            <Trans>Discover More Recipes</Trans>
                          </h3>
                          <p className="text-gray-600">
                            <Trans>Browse thousands of recipes from the community</Trans>
                          </p>
                        </div>
                      </div>
                      <Button
                        as={Link}
                        href="/recipes/explore"
                        color="primary"
                        size="lg"
                        endContent={<ArrowRight className="w-5 h-5" />}
                      >
                        <Trans>Explore Recipes</Trans>
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
};
