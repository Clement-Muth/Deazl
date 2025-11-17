"use client";

import { Chip, Divider } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { Check, Package } from "lucide-react";
import { useMemo } from "react";
import { Modal } from "~/components/Modal/Modal";

interface Ingredient {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
}

interface IngredientsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ingredients: Ingredient[];
  currentStepDescription?: string;
}

export function IngredientsModal({
  isOpen,
  onClose,
  ingredients,
  currentStepDescription = ""
}: IngredientsDrawerProps) {
  const highlightedIngredients = useMemo(() => {
    if (!currentStepDescription) return new Set<string>();

    const stepText = currentStepDescription.toLowerCase();
    const highlighted = new Set<string>();

    for (const ing of ingredients) {
      const productName = ing.productName.toLowerCase();
      const words = productName.split(" ");

      if (stepText.includes(productName)) {
        highlighted.add(ing.id);
      } else {
        for (const word of words) {
          if (word.length > 3 && stepText.includes(word)) {
            highlighted.add(ing.id);
            break;
          }
        }
      }
    }

    return highlighted;
  }, [ingredients, currentStepDescription]);

  const sortedIngredients = useMemo(() => {
    return [...ingredients].sort((a, b) => {
      const aHighlighted = highlightedIngredients.has(a.id);
      const bHighlighted = highlightedIngredients.has(b.id);

      if (aHighlighted && !bHighlighted) return -1;
      if (!aHighlighted && bHighlighted) return 1;
      return 0;
    });
  }, [ingredients, highlightedIngredients]);

  const hasHighlighted = highlightedIngredients.size > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      sheetHeight="lg"
      header={
        <>
          <Package size={20} className="text-primary" />
          <Trans>Ingredients</Trans>
        </>
      }
      body={
        <div className="p-4 sm:p-6">
          {hasHighlighted && (
            <>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-1 w-1 rounded-full bg-success" />
                  <p className="text-sm font-medium text-success">
                    <Trans>For this step</Trans>
                  </p>
                </div>
                <div className="space-y-2">
                  {sortedIngredients
                    .filter((ing) => highlightedIngredients.has(ing.id))
                    .map((ingredient) => (
                      <div
                        key={ingredient.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-success flex items-center justify-center">
                            <Check size={16} className="text-white" />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {ingredient.productName}
                          </span>
                        </div>
                        <Chip color="success" variant="flat" size="sm" className="font-semibold">
                          {ingredient.quantity} {ingredient.unit}
                        </Chip>
                      </div>
                    ))}
                </div>
              </div>

              <Divider className="my-4" />

              <div className="mb-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  <Trans>All ingredients</Trans>
                </p>
              </div>
            </>
          )}

          <div className="space-y-2">
            {sortedIngredients
              .filter((ing) => !highlightedIngredients.has(ing.id))
              .map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="text-gray-700 dark:text-gray-300">{ingredient.productName}</span>
                  <Chip variant="flat" size="sm" className="font-semibold">
                    {ingredient.quantity} {ingredient.unit}
                  </Chip>
                </div>
              ))}
          </div>
        </div>
      }
    />
  );
}
