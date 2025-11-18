"use client";

import { Accordion, AccordionItem, Button, Card, CardBody, CardHeader, Chip, Spinner } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useEffect, useState } from "react";
import { getRecipePricing } from "../Api/recipes/getRecipePricing.api";
import type {
  IngredientPricingBreakdown,
  RecipePricingResult
} from "../Domain/Services/RecipePricing.service";

interface RecipePricingSectionProps {
  recipeId: string;
  userId?: string;
  className?: string;
}

/**
 * Section UI pour l'affichage dynamique du pricing d'une recette
 * Affiche le prix optimisé, les détails par ingrédient, et les totaux par magasin
 */
export function RecipePricingSection({ recipeId, userId, className }: RecipePricingSectionProps) {
  const { t } = useLingui();
  const [pricingData, setPricingData] = useState<RecipePricingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"user" | "public">("user");

  useEffect(() => {
    async function fetchPricing() {
      setLoading(true);
      setError(null);

      try {
        const result = await getRecipePricing(recipeId, viewMode === "user" ? userId : undefined);

        if ("error" in result) {
          setError(result.error);
        } else {
          setPricingData(result);
        }
      } catch (err) {
        setError(t`Erreur lors du chargement des prix`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPricing();
  }, [recipeId, userId, viewMode]);

  if (loading) {
    return (
      <Card className={className}>
        <CardBody className="flex items-center justify-center py-12">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">
            <Trans>Calcul des prix en cours...</Trans>
          </p>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardBody className="flex items-center justify-center py-12">
          <p className="text-red-600">{error}</p>
        </CardBody>
      </Card>
    );
  }

  if (!pricingData) {
    return null;
  }

  const { mode, totals, breakdown, missingCount, confidence } = pricingData;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-col gap-3">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-2xl font-bold">
            <Trans>Prix de la recette</Trans>
          </h3>

          {userId && (
            <div className="flex gap-2">
              <Button
                size="sm"
                color={viewMode === "user" ? "primary" : "default"}
                onPress={() => setViewMode("user")}
              >
                <Trans>Mon prix</Trans>
              </Button>
              <Button
                size="sm"
                color={viewMode === "public" ? "primary" : "default"}
                onPress={() => setViewMode("public")}
              >
                <Trans>Prix moyen</Trans>
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-primary">{totals.optimizedMix.toFixed(2)} €</span>
          {mode === "user" && (
            <Chip size="sm" color="success" variant="flat">
              <Trans>Optimisé</Trans>
            </Chip>
          )}
          {confidence < 0.8 && (
            <Chip size="sm" color="warning" variant="flat">
              <Trans>Prix approximatif</Trans>
            </Chip>
          )}
        </div>

        {missingCount > 0 && (
          <Chip size="sm" color="danger" variant="flat">
            <Trans>{missingCount} ingrédient(s) sans prix</Trans>
          </Chip>
        )}
      </CardHeader>

      <CardBody className="gap-6">
        {/* Détail par ingrédient */}
        <div>
          <h4 className="text-lg font-semibold mb-3">
            <Trans>Détail par ingrédient</Trans>
          </h4>

          <div className="space-y-3">
            {breakdown.map((item) => (
              <IngredientPricingItem key={item.ingredientId} item={item} />
            ))}
          </div>
        </div>

        {/* Totaux par magasin */}
        {totals.perStore.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold mb-3">
              <Trans>Prix par magasin</Trans>
            </h4>

            <Accordion variant="bordered">
              {totals.perStore.map((store) => (
                <AccordionItem
                  key={store.storeId}
                  title={
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{store.storeName}</span>
                      <div className="flex items-center gap-3">
                        {store.averageDistance && (
                          <Chip size="sm" variant="flat">
                            {store.averageDistance.toFixed(1)} km
                          </Chip>
                        )}
                        <span className="font-bold">{store.total.toFixed(2)} €</span>
                      </div>
                    </div>
                  }
                >
                  <div className="space-y-2 text-sm">
                    <p>
                      <Trans>{store.itemCount} produits disponibles</Trans>
                    </p>
                    {store.missingCount > 0 && (
                      <p className="text-red-600">
                        <Trans>{store.missingCount} produits manquants</Trans>
                      </p>
                    )}
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* Confiance */}
        <div className="text-sm text-gray-600">
          <Trans>Confiance des prix : {(confidence * 100).toFixed(0)}%</Trans>
        </div>
      </CardBody>
    </Card>
  );
}

/**
 * Composant pour afficher le prix d'un ingrédient
 */
function IngredientPricingItem({ item }: { item: IngredientPricingBreakdown }) {
  const [showAlternatives, setShowAlternatives] = useState(false);

  if (item.missing) {
    return (
      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
        <div>
          <p className="font-medium">{item.name}</p>
          <p className="text-sm text-gray-600">
            {item.quantity} {item.unit}
          </p>
        </div>
        <Chip size="sm" color="danger" variant="flat">
          <Trans>Non disponible</Trans>
        </Chip>
      </div>
    );
  }

  if (!item.selected) {
    return null;
  }

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <p className="font-medium">{item.name}</p>
          <p className="text-sm text-gray-600">
            {item.quantity} {item.unit} • {item.selected.storeName}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {item.selected.price.toFixed(2)}€/{item.selected.unit} × {item.quantity} {item.unit} ={" "}
            {item.estimatedCost.toFixed(2)}€
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold">{item.estimatedCost.toFixed(2)} €</p>
          {item.selected.distanceKm !== undefined && (
            <p className="text-xs text-gray-500">{item.selected.distanceKm.toFixed(1)} km</p>
          )}
        </div>
      </div>

      {/* Alternatives */}
      {item.alternatives.length > 0 && (
        <div className="mt-2">
          <Button size="sm" variant="light" onPress={() => setShowAlternatives(!showAlternatives)}>
            <Trans>
              {showAlternatives ? "Masquer" : "Voir"} {item.alternatives.length} alternative(s)
            </Trans>
          </Button>

          {showAlternatives && (
            <div className="mt-2 space-y-2">
              {item.alternatives.map((alt, idx) => (
                <div
                  key={`${alt.storeId}-${idx}`}
                  className="flex items-center justify-between p-2 bg-white rounded"
                >
                  <div>
                    <p className="text-sm font-medium">{alt.storeName}</p>
                    {alt.distanceKm !== undefined && (
                      <p className="text-xs text-gray-500">{alt.distanceKm.toFixed(1)} km</p>
                    )}
                  </div>
                  <p className="text-sm font-bold">{alt.price.toFixed(2)} €</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confiance */}
      {item.selected.confidence < 0.8 && (
        <Chip size="sm" color="warning" variant="flat" className="mt-2">
          <Trans>Prix approximatif</Trans>
        </Chip>
      )}
    </div>
  );
}
