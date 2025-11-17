"use client";

import { Card, CardBody, Chip } from "@heroui/react";
import { AwardIcon, LeafIcon, RecycleIcon, ShieldCheckIcon } from "lucide-react";
import type { ProductQualityData } from "../../../Domain/ValueObjects/ProductQuality.vo";

interface ProductLabelsAndIngredientsProps {
  qualityData: ProductQualityData;
}

export const ProductLabelsAndIngredients = ({ qualityData }: ProductLabelsAndIngredientsProps) => {
  const { labels, allergens, ingredients } = qualityData;

  const hasLabels = labels && labels.length > 0;
  const hasAllergens = allergens && allergens.length > 0;
  const hasIngredients = ingredients && (ingredients.text || ingredients.count);

  if (!hasLabels && !hasAllergens && !hasIngredients) {
    return null;
  }

  const getLabelIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes("bio") || lowerLabel.includes("organic")) {
      return <LeafIcon className="h-3 w-3" />;
    }
    if (lowerLabel.includes("fair") || lowerLabel.includes("equitable")) {
      return <AwardIcon className="h-3 w-3" />;
    }
    if (lowerLabel.includes("recyclable") || lowerLabel.includes("eco")) {
      return <RecycleIcon className="h-3 w-3" />;
    }
    return <ShieldCheckIcon className="h-3 w-3" />;
  };

  const formatLabel = (label: string) => {
    return label
      .replace(/-/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-3">
      {/* Labels */}
      {hasLabels && (
        <Card shadow="none" className="border border-gray-200">
          <CardBody className="p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <AwardIcon className="h-4 w-4" />
              Labels & Certifications
            </h3>
            <div className="flex flex-wrap gap-2">
              {labels?.map((label, index) => (
                <Chip
                  key={index}
                  size="sm"
                  variant="flat"
                  color="success"
                  startContent={getLabelIcon(label)}
                  className="capitalize"
                >
                  {formatLabel(label)}
                </Chip>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Ingrédients */}
      {hasIngredients && (
        <Card shadow="none" className="border border-gray-200">
          <CardBody className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Ingrédients</h3>
              {ingredients.count && (
                <Chip size="sm" variant="flat">
                  {ingredients.count} ingrédient{ingredients.count > 1 ? "s" : ""}
                </Chip>
              )}
            </div>

            {ingredients.text && <p className="text-xs text-gray-700 leading-relaxed">{ingredients.text}</p>}

            {(ingredients.hasAllergens || ingredients.hasPalmOil) && (
              <div className="flex flex-wrap gap-2">
                {ingredients.hasAllergens && (
                  <Chip size="sm" color="warning" variant="flat">
                    ⚠️ Allergènes présents
                  </Chip>
                )}
                {ingredients.hasPalmOil && (
                  <Chip size="sm" color="warning" variant="flat">
                    🌴 Huile de palme
                  </Chip>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Allergènes */}
      {hasAllergens && (
        <Card shadow="none" className="border border-orange-200 bg-orange-50">
          <CardBody className="p-4 space-y-3">
            <h3 className="font-semibold text-sm text-orange-700">⚠️ Allergènes</h3>
            <div className="flex flex-wrap gap-2">
              {allergens?.map((allergen, index) => (
                <Chip key={index} size="sm" color="warning" variant="flat" className="capitalize">
                  {formatLabel(allergen)}
                </Chip>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
