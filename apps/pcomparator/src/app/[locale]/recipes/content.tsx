"use client";

import { Button } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { ChefHat, Plus } from "lucide-react";
import { RecipesList } from "~/applications/Recipes/Ui";

export const RecipesContent = ({ recipes }) => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">
            <Trans>My Recipes</Trans>
          </h1>
          <Button as="a" href="/recipes/new" color="primary" startContent={<Plus className="w-5 h-5" />} />
        </div>
        <p className="text-gray-500 text-base">
          <Trans>Create and organize your favorite recipes</Trans>
        </p>
      </div>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="mb-6 p-6 rounded-full bg-gray-100">
            <ChefHat className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            <Trans>No recipes yet</Trans>
          </h2>
          <p className="text-gray-500 mb-6 max-w-md">
            <Trans>Create your first recipe to start organizing your collection</Trans>
          </p>
          <Button
            as="a"
            href="/recipes/new"
            color="primary"
            size="lg"
            startContent={<ChefHat className="w-5 h-5" />}
          >
            <Trans>Create my first recipe</Trans>
          </Button>
        </div>
      ) : (
        <RecipesList recipes={recipes} />
      )}
    </div>
  );
};
