"use client";

import { Card, CardBody, Chip } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { ChefHat, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import type { RecipePayload } from "~/applications/Recipes/Domain/Schemas/Recipe.schema";

interface RecipeSuggestionWidgetProps {
  recipes: RecipePayload[];
  expiringItemNames?: string[];
}

export function RecipeSuggestionWidget({ recipes, expiringItemNames = [] }: RecipeSuggestionWidgetProps) {
  if (recipes.length === 0 && expiringItemNames.length === 0) {
    return null;
  }

  const displayRecipes = recipes.slice(0, 2);

  return (
    <Card className="shadow-sm border-none">
      <CardBody className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/30">
              <Sparkles className="h-4 w-4 text-primary-600" />
            </div>
            <h3 className="text-sm font-medium text-default-700">
              <Trans>Recipe Ideas</Trans>
            </h3>
          </div>
          <Link
            href="/recipes"
            className="text-xs text-primary-600 hover:underline flex items-center gap-0.5 touch-manipulation"
          >
            <Trans>See all</Trans>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {expiringItemNames.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-default-500 mb-1.5">
              <Trans>Use these before they expire:</Trans>
            </p>
            <div className="flex flex-wrap gap-1">
              {expiringItemNames.slice(0, 5).map((name, i) => (
                <Chip key={i} size="sm" variant="flat" color="warning" className="text-xs">
                  {name}
                </Chip>
              ))}
              {expiringItemNames.length > 5 && (
                <Chip size="sm" variant="flat" className="text-xs">
                  +{expiringItemNames.length - 5}
                </Chip>
              )}
            </div>
          </div>
        )}

        {displayRecipes.length > 0 ? (
          <div className="space-y-2">
            {displayRecipes.map((recipe) => (
              <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="block">
                <div className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-default-100 dark:hover:bg-default-50 transition-colors touch-manipulation">
                  {recipe.imageUrl ? (
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.name}
                      className="h-10 w-10 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-default-100 dark:bg-default-50 flex items-center justify-center shrink-0">
                      <ChefHat className="h-5 w-5 text-default-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-default-700 truncate">{recipe.name}</p>
                    <div className="flex items-center gap-2 text-xs text-default-500">
                      {recipe.preparationTime && <span>{recipe.preparationTime}min</span>}
                      {recipe.category && (
                        <>
                          <span className="text-default-300">•</span>
                          <span className="truncate">{recipe.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-default-400 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Link href="/recipes" className="block">
            <div className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-default-100 dark:hover:bg-default-50 transition-colors touch-manipulation">
              <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                <ChefHat className="h-5 w-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-default-700">
                  <Trans>Explore Recipes</Trans>
                </p>
                <p className="text-xs text-default-500">
                  <Trans>Find dishes with your ingredients</Trans>
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-default-400 shrink-0" />
            </div>
          </Link>
        )}
      </CardBody>
    </Card>
  );
}
