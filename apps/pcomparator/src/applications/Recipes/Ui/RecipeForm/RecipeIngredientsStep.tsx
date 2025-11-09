"use client";

import { Button, Card, CardBody, CardHeader, Input } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { Trans } from "@lingui/react/macro";
import { Plus, X } from "lucide-react";
import type { CreateRecipePayload } from "../../Domain/Schemas/Recipe.schema";

interface RecipeIngredientsStepProps {
  ingredients: CreateRecipePayload["ingredients"];
  onAddIngredient: () => void;
  onRemoveIngredient: (index: number) => void;
  onUpdateIngredient: (index: number, field: string, value: any) => void;
}

export const RecipeIngredientsStep = ({
  ingredients,
  onAddIngredient,
  onRemoveIngredient,
  onUpdateIngredient
}: RecipeIngredientsStepProps) => {
  const { t } = useLingui();

  return (
    <Card>
      <CardHeader className="flex justify-between items-center border-b border-divider bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
          <Trans>Ingrédients</Trans>
        </h2>
        <Button
          color="success"
          variant="flat"
          startContent={<Plus className="w-4 h-4" />}
          onPress={onAddIngredient}
          size="sm"
        >
          <Trans>Ajouter</Trans>
        </Button>
      </CardHeader>
      <CardBody className="p-4 sm:p-6">
        <div className="space-y-4">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-start">
              <div className="flex gap-2 w-full sm:w-auto">
                <Input
                  type="number"
                  value={ingredient.quantity.toString()}
                  onValueChange={(value) =>
                    onUpdateIngredient(index, "quantity", Number.parseFloat(value) || 0.01)
                  }
                  isRequired
                  min={0.01}
                  step={0.01}
                  placeholder="Qté"
                  variant="bordered"
                  className="w-1/3 sm:w-24"
                />
                <Input
                  value={ingredient.unit}
                  onValueChange={(value) => onUpdateIngredient(index, "unit", value)}
                  isRequired
                  placeholder={t`Unité`}
                  variant="bordered"
                  className="w-2/3 sm:w-32"
                />
              </div>
              <Input
                value={ingredient.customName || ""}
                onValueChange={(value) => onUpdateIngredient(index, "customName", value)}
                placeholder={t`Nom de l'ingrédient`}
                variant="bordered"
                className="flex-1 w-full"
              />
              {ingredients.length > 1 && (
                <Button isIconOnly color="danger" variant="light" onPress={() => onRemoveIngredient(index)}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
