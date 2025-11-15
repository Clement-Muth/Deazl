"use client";

import { Button, Card, CardBody, CardHeader, Input, Select, SelectItem } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { Trans } from "@lingui/react/macro";
import { Plus, X } from "lucide-react";
import { UnitType } from "~/packages/applications/shopping-lists/src/Domain/ValueObjects/Unit.vo";
import type { ProductSearchResult } from "../../Api/products/searchProducts.api";
import type { CreateRecipePayload } from "../../Domain/Schemas/Recipe.schema";
import { SmartIngredientInput } from "./SmartIngredientInput";

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

  const unitOptions = [
    { value: UnitType.UNIT, label: t`Unit` },
    { value: UnitType.PIECE, label: t`Piece` },
    { value: UnitType.G, label: t`Grams (g)` },
    { value: UnitType.KG, label: t`Kilograms (kg)` },
    { value: UnitType.ML, label: t`Milliliters (ml)` },
    { value: UnitType.CL, label: t`Centiliters (cl)` },
    { value: UnitType.L, label: t`Liters (l)` },
    { value: UnitType.TEASPOON, label: t`Teaspoon (tsp)` },
    { value: UnitType.TABLESPOON, label: t`Tablespoon (tbsp)` },
    { value: UnitType.CUP, label: t`Cup` },
    { value: UnitType.PINCH, label: t`Pinch` }
  ];

  const handleProductSelect = (index: number, product: ProductSearchResult) => {
    // Update both fields at once to avoid state race condition
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      productId: product.id,
      productName: product.name
    };
    onUpdateIngredient(index, "_batch", updatedIngredients[index]);
  };

  return (
    <Card>
      <CardHeader className="border-b border-divider bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
          <Trans>Ingredients</Trans>
        </h2>
      </CardHeader>
      <CardBody className="p-4 sm:p-6">
        <div className="space-y-3">
          {ingredients.map((ingredient, index) => (
            <div key={ingredient.productId || `ingredient-${index}`} className="space-y-3">
              <div className="flex flex-col gap-2 p-3 rounded-lg border border-divider bg-default-50">
                <SmartIngredientInput
                  productId={ingredient.productId}
                  // @ts-ignore
                  value={
                    ingredient.productName
                      ? {
                          id: ingredient.productId || "",
                          name: ingredient.productName,
                          brand: null,
                          category: null
                        }
                      : undefined
                  }
                  onProductSelect={(product) => handleProductSelect(index, product)}
                  placeholder={t`Search for a product...`}
                  isRequired
                />
                <div className="flex gap-2 w-full">
                  <Input
                    type="number"
                    value={ingredient.quantity.toString()}
                    onValueChange={(value) =>
                      onUpdateIngredient(index, "quantity", Number.parseFloat(value) || 0.01)
                    }
                    isRequired
                    min={0.01}
                    step={0.01}
                    placeholder="Qty"
                    variant="bordered"
                    className="w-1/3 sm:w-32"
                  />
                  <Select
                    selectedKeys={ingredient.unit ? [ingredient.unit] : []}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0];
                      onUpdateIngredient(index, "unit", key as string);
                    }}
                    placeholder={t`Unit`}
                    variant="bordered"
                    className="flex-1"
                    isRequired
                    aria-label={t`Select unit`}
                  >
                    {unitOptions.map((option) => (
                      <SelectItem key={option.value}>{option.label}</SelectItem>
                    ))}
                  </Select>
                  <Button
                    isIconOnly
                    color="danger"
                    variant="flat"
                    onPress={() => onRemoveIngredient(index)}
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {/* Inline add button after each ingredient */}
              <Button
                color="success"
                variant="bordered"
                startContent={<Plus className="w-4 h-4" />}
                onPress={onAddIngredient}
                size="sm"
                className="w-full"
              >
                <Trans>Add ingredient</Trans>
              </Button>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
