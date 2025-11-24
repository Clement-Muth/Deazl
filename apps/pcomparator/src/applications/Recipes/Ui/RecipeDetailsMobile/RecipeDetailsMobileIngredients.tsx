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

interface IngredientGroup {
  id?: string;
  name: string;
  order: number;
  ingredients: Array<{
    id?: string;
    productId: string;
    productName?: string;
    quantity: number;
    unit: string;
    order: number;
  }>;
}

interface RecipeDetailsMobileIngredientsProps {
  ingredientsWithPrice: IngredientWithPrice[];
  ingredientGroups?: IngredientGroup[];
  scaleFactor: number;
  onProductClick: (productId: string) => void;
  recipeId: string;
  pricing?: any;
  quality?: any;
}

export default function RecipeDetailsMobileIngredients({
  ingredientsWithPrice,
  ingredientGroups,
  scaleFactor,
  onProductClick,
  pricing,
  quality
}: RecipeDetailsMobileIngredientsProps) {
  const renderIngredientCard = (ingredient: IngredientWithPrice, index: number) => (
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
              <Chip key={allergen} size="sm" color="warning" variant="bordered" className="text-xs h-5">
                {allergen}
              </Chip>
            ))}
            {ingredient.nutriScore && (
              <Chip
                size="sm"
                color={ingredient.nutriScore === "A" || ingredient.nutriScore === "B" ? "success" : "warning"}
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
  );

  const mapIngredientWithPrice = (ing: any) => {
    const priceData = pricing?.breakdown.find((b: any) => b.ingredientId === ing.id);
    const qualityData = quality?.details.find((d: any) => d.ingredientId === ing.id);

    const labels: Array<"bio" | "eco" | "ultra-processed"> = [];
    if (qualityData?.novaGroup && qualityData.novaGroup === 4) {
      labels.push("ultra-processed");
    }
    if (qualityData?.ecoScore && (qualityData.ecoScore === "A" || qualityData.ecoScore === "B")) {
      labels.push("eco");
    }

    return {
      id: ing.id,
      name: ing.productName || "Product",
      quantity: ing.quantity,
      unit: ing.unit,
      price: priceData?.selected?.price,
      store: priceData?.selected?.storeName,
      distance: priceData?.selected?.distanceKm,
      labels,
      allergens: [],
      nutriScore: qualityData?.nutriScore,
      productId: ing.productId
    };
  };

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
          {ingredientGroups && ingredientGroups.length > 0 ? (
            ingredientGroups
              .sort((a, b) => a.order - b.order)
              .map((group) => (
                <div key={group.id} className="border-l-4 border-primary pl-4 space-y-3">
                  <h4 className="text-sm font-bold text-primary mb-2">{group.name}</h4>
                  <div className="space-y-2">
                    {group.ingredients
                      .sort((a, b) => a.order - b.order)
                      .map((ing, idx) => {
                        const ingWithPrice = mapIngredientWithPrice(ing);
                        return renderIngredientCard(ingWithPrice, idx);
                      })}
                  </div>
                </div>
              ))
          ) : (
            <div className="space-y-2">
              {ingredientsWithPrice.map((ing, idx) => renderIngredientCard(ing, idx))}
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
}
