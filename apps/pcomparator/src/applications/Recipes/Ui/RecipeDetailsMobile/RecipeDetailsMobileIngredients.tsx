"use client";

import { Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { scaleQuantity } from "../../Domain/Utilities/UnitConversion";

interface IngredientWithPrice {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price?: number;
  store?: string;
  distance?: number;
  labels: Array<"bio" | "eco" | "ultra-processed">;
  allergens: string[];
  nutriScore?: string;
  productId: string | null;
}

interface RecipeDetailsMobileIngredientsProps {
  ingredientsWithPrice: IngredientWithPrice[];
  scaleFactor: number;
  onProductClick: (productId: string) => void;
  recipeId: string;
}

export default function RecipeDetailsMobileIngredients({
  ingredientsWithPrice,
  scaleFactor,
  onProductClick
}: RecipeDetailsMobileIngredientsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <h3 className="text-xs font-bold uppercase tracking-wider">
            <Trans>INGREDIENTS</Trans>
          </h3>
        </CardHeader>

        <CardBody className="space-y-4">
          {ingredientsWithPrice.map((ingredient, index) => (
            <motion.div
              key={ingredient.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
              onClick={() => ingredient.productId && onProductClick(ingredient.productId)}
            >
              <Card>
                <CardBody className="bg-content2">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm flex-1 min-w-0">
                      {ingredient.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {(() => {
                          const scaled = scaleQuantity(ingredient.quantity, ingredient.unit, scaleFactor);
                          return `${scaled.value} ${scaled.unit}`;
                        })()}
                      </span>
                      {ingredient.price && (
                        <span className="text-sm font-bold text-success-600">
                          {(ingredient.price * scaleFactor).toFixed(2)}€
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {ingredient.store && (
                      <Chip size="sm" variant="flat" className="text-xs h-5">
                        {ingredient.store}
                      </Chip>
                    )}
                    {ingredient.distance !== undefined && (
                      <Chip
                        size="sm"
                        variant="flat"
                        startContent={<MapPin className="w-3 h-3" />}
                        className="text-xs h-5"
                      >
                        {ingredient.distance.toFixed(1)} km
                      </Chip>
                    )}
                    {ingredient.labels.map((label) => (
                      <Chip key={label} size="sm" variant="bordered" className="text-xs h-5">
                        {label === "bio" ? "Bio" : label === "eco" ? "Éco" : "Ultra"}
                      </Chip>
                    ))}
                    {ingredient.allergens.map((allergen) => (
                      <Chip
                        key={allergen}
                        size="sm"
                        color="warning"
                        variant="bordered"
                        className="text-xs h-5"
                      >
                        {allergen}
                      </Chip>
                    ))}
                    {ingredient.nutriScore && (
                      <Chip
                        size="sm"
                        color={
                          ingredient.nutriScore === "A" || ingredient.nutriScore === "B"
                            ? "success"
                            : "warning"
                        }
                        variant="flat"
                        className="text-xs h-5"
                      >
                        NS: {ingredient.nutriScore}
                      </Chip>
                    )}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </CardBody>
      </Card>
    </motion.div>
  );
}
