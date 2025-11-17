"use client";

import { Button, Card, CardBody, CardHeader, Chip, Spinner } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { motion } from "framer-motion";
import { ChefHat, DollarSign, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { getRecipePricing } from "../../Api/recipes/getRecipePricing.api";
import type { RecipePricingResult } from "../../Domain/Services/RecipePricing.service";

interface RecipeIngredient {
  id: string;
  productId: string | null;
  productName?: string | null;
  quantity: number;
  unit: string;
}

interface RecipeIngredientsWithPricingProps {
  recipeId: string;
  ingredients: RecipeIngredient[];
  userId?: string;
  onProductClick: (productId: string) => void;
}

/**
 * Liste d'ingrédients enrichie avec les prix intégrés (mobile-first)
 */
export function RecipeIngredientsWithPricing({
  recipeId,
  ingredients,
  userId,
  onProductClick
}: RecipeIngredientsWithPricingProps) {
  const [pricingData, setPricingData] = useState<RecipePricingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUserPrice, setShowUserPrice] = useState(true);

  useEffect(() => {
    async function fetchPricing() {
      setLoading(true);

      try {
        const result = await getRecipePricing(recipeId, userId);

        if ("error" in result) {
          console.error("Erreur pricing:", result.error);
        } else {
          setPricingData(result);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des prix:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPricing();
  }, [recipeId, userId]);

  const getIngredientPrice = (
    ingredientId: string
  ): { price: string; store: string; distance?: number } | null => {
    if (!pricingData) return null;

    const breakdown = pricingData.breakdown.find((b) => b.ingredientId === ingredientId);
    if (!breakdown || !breakdown.selected) return null;

    return {
      price: `${breakdown.selected.price.toFixed(2)}€`,
      store: breakdown.selected.storeName,
      distance: breakdown.selected.distanceKm
    };
  };

  const totalPrice = pricingData?.totals.optimizedMix || 0;
  const hasUserContext = pricingData?.mode === "user";

  return (
    <Card>
      <CardHeader className="flex flex-col border-b border-divider p-4 sm:p-6">
        <div className="flex items-center justify-between w-full gap-2">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <Trans>Ingredients</Trans>
          </h2>

          {/* Toggle Mon prix / Prix moyen (seulement si user connecté) */}
          {hasUserContext && (
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full p-0.5">
              <Button
                size="sm"
                variant={showUserPrice ? "solid" : "light"}
                color={showUserPrice ? "primary" : "default"}
                className="text-xs sm:text-sm min-w-0 px-2 sm:px-3 h-7 sm:h-8"
                onPress={() => setShowUserPrice(true)}
              >
                <Trans>Mon prix</Trans>
              </Button>
              <Button
                size="sm"
                variant={!showUserPrice ? "solid" : "light"}
                color={!showUserPrice ? "primary" : "default"}
                className="text-xs sm:text-sm min-w-0 px-2 sm:px-3 h-7 sm:h-8"
                onPress={() => setShowUserPrice(false)}
              >
                <Trans>Moyen</Trans>
              </Button>
            </div>
          )}
        </div>

        {/* Prix total */}
        {!loading && pricingData && (
          <div className="mt-3 p-3 bg-primary/10 rounded-lg w-full">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">
                <Trans>Coût total estimé</Trans>
              </span>
              <span className="text-lg sm:text-xl font-bold text-primary">{totalPrice.toFixed(2)}€</span>
            </div>
            {pricingData.missingCount > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                <Trans>{pricingData.missingCount} ingrédients sans prix</Trans>
              </p>
            )}
          </div>
        )}
      </CardHeader>

      <CardBody className="p-4 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" />
          </div>
        ) : (
          <ul className="space-y-2 sm:space-y-3">
            {ingredients.map((ingredient, index) => {
              const priceInfo = getIngredientPrice(ingredient.id);

              return (
                <motion.li
                  key={ingredient.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                  // @ts-ignore
                  className="relative"
                >
                  <div
                    className={`flex justify-between gap-2 p-2.5 sm:p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      ingredient.productId ? "cursor-pointer" : ""
                    }`}
                    onClick={() => ingredient.productId && onProductClick(ingredient.productId)}
                  >
                    {/* Ligne 1: Quantité + Nom */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-primary font-bold flex-shrink-0">•</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                          {ingredient.quantity} {ingredient.unit}
                        </span>{" "}
                        <span className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors text-sm sm:text-base">
                          {ingredient.productName || "Product"}
                        </span>
                      </div>
                    </div>

                    {/* Ligne 2: Prix + Magasin (si disponible) */}
                    {priceInfo && (
                      <div className="flex items-center gap-2 ml-5 flex-wrap">
                        <Chip
                          size="sm"
                          color="success"
                          variant="flat"
                          startContent={<DollarSign className="w-3 h-3" />}
                          className="text-xs"
                        >
                          {priceInfo.price}
                        </Chip>

                        <Chip size="sm" variant="flat" className="text-xs">
                          {priceInfo.store}
                        </Chip>

                        {priceInfo.distance !== undefined && (
                          <Chip
                            size="sm"
                            variant="flat"
                            startContent={<MapPin className="w-3 h-3" />}
                            className="text-xs"
                          >
                            {priceInfo.distance.toFixed(1)} km
                          </Chip>
                        )}
                      </div>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
