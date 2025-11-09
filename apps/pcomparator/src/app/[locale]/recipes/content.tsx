"use client";

import { Button } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { ChefHat, Plus } from "lucide-react";
import { RecipesList } from "~/applications/Recipes/Ui";

export const RecipesContent = ({ error, recipes }) => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">
            <Trans>Mes Recettes</Trans>
          </h1>
          <Button as="a" href="/recipes/new" color="primary" startContent={<Plus className="w-5 h-5" />} />
        </div>
        <p className="text-gray-500 text-base">
          <Trans>Créez et organisez vos recettes préférées</Trans>
        </p>
      </div>

      {error ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            <Trans>Base de données non initialisée</Trans>
          </h2>
          <p className="text-yellow-700 mb-4">
            <Trans>
              Les tables pour les recettes n'existent pas encore en base de données. Veuillez exécuter la
              migration Prisma :
            </Trans>
          </p>
          <code className="block bg-yellow-100 text-yellow-900 px-4 py-2 rounded font-mono text-sm">
            yarn prisma:migrate
          </code>
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="mb-6 p-6 rounded-full bg-gray-100">
            <ChefHat className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            <Trans>Aucune recette pour le moment</Trans>
          </h2>
          <p className="text-gray-500 mb-6 max-w-md">
            <Trans>Créez votre première recette pour commencer à organiser votre collection</Trans>
          </p>
          <Button
            as="a"
            href="/recipes/new"
            color="primary"
            size="lg"
            startContent={<ChefHat className="w-5 h-5" />}
          >
            <Trans>Créer ma première recette</Trans>
          </Button>
        </div>
      ) : (
        <RecipesList recipes={recipes} />
      )}
    </div>
  );
};
