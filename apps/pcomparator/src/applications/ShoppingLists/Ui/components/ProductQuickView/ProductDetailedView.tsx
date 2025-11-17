"use client";

import { Accordion, AccordionItem } from "@heroui/react";
import { BarChart3Icon, FlaskConicalIcon, InfoIcon, LeafIcon } from "lucide-react";
import type { ProductQualityData } from "../../../Domain/ValueObjects/ProductQuality.vo";
import { ProductAdditives } from "./ProductAdditives";
import { ProductLabelsAndIngredients } from "./ProductLabelsAndIngredients";
import { ProductNutrition } from "./ProductNutrition";
import { ProductQualityBadges } from "./ProductQualityBadges";

interface ProductDetailedViewProps {
  qualityData: ProductQualityData;
}

export const ProductDetailedView = ({ qualityData }: ProductDetailedViewProps) => {
  const hasNutrition = qualityData.nutriments !== undefined;
  const hasAdditives = qualityData.additives && qualityData.additives.length > 0;
  const hasLabelsOrIngredients =
    (qualityData.labels && qualityData.labels.length > 0) ||
    (qualityData.allergens && qualityData.allergens.length > 0) ||
    (qualityData.ingredients && (qualityData.ingredients.text || qualityData.ingredients.count));

  return (
    <div className="space-y-3">
      {/* Badges de qualité en haut */}
      <ProductQualityBadges qualityData={qualityData} />

      {/* Sections dépliables */}
      <Accordion variant="bordered" selectionMode="multiple" defaultExpandedKeys={["nutrition"]}>
        {hasNutrition ? (
          <AccordionItem
            key="nutrition"
            aria-label="Informations nutritionnelles"
            title={
              <div className="flex items-center gap-2">
                <BarChart3Icon className="h-4 w-4" />
                <span className="font-medium">Informations nutritionnelles</span>
              </div>
            }
          >
            <ProductNutrition qualityData={qualityData} />
          </AccordionItem>
        ) : null}

        {hasAdditives ? (
          <AccordionItem
            key="additives"
            aria-label="Additifs"
            title={
              <div className="flex items-center gap-2">
                <FlaskConicalIcon className="h-4 w-4" />
                <span className="font-medium">Additifs ({qualityData.additives?.length})</span>
              </div>
            }
          >
            <ProductAdditives qualityData={qualityData} />
          </AccordionItem>
        ) : null}

        {hasLabelsOrIngredients ? (
          <AccordionItem
            key="ingredients"
            aria-label="Ingrédients et labels"
            title={
              <div className="flex items-center gap-2">
                <LeafIcon className="h-4 w-4" />
                <span className="font-medium">Ingrédients et labels</span>
              </div>
            }
          >
            <ProductLabelsAndIngredients qualityData={qualityData} />
          </AccordionItem>
        ) : null}
      </Accordion>

      {/* Message si pas de données */}
      {!hasNutrition && !hasAdditives && !hasLabelsOrIngredients && (
        <div className="flex items-center gap-2 p-4 border border-gray-200 rounded-lg text-sm text-gray-500">
          <InfoIcon className="h-4 w-4" />
          <span>Aucune donnée détaillée disponible pour ce produit</span>
        </div>
      )}
    </div>
  );
};
