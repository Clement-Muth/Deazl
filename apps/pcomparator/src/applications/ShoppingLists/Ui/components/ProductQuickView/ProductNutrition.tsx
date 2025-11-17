"use client";

import { Card, CardBody, Chip, Divider, Progress } from "@heroui/react";
import { AlertTriangleIcon, FlameIcon, LeafIcon } from "lucide-react";
import type { ProductQualityData } from "../../../Domain/ValueObjects/ProductQuality.vo";

interface ProductNutritionProps {
  qualityData: ProductQualityData;
}

export const ProductNutrition = ({ qualityData }: ProductNutritionProps) => {
  const { nutriments, healthWarnings } = qualityData;

  if (!nutriments) {
    return (
      <div className="text-sm text-gray-500 text-center py-4">
        Informations nutritionnelles non disponibles
      </div>
    );
  }

  const getNutrientLevel = (value: number, thresholds: { low: number; high: number }) => {
    if (value <= thresholds.low) return { color: "success" as const, level: "Faible" };
    if (value <= thresholds.high) return { color: "warning" as const, level: "Modéré" };
    return { color: "danger" as const, level: "Élevé" };
  };

  const nutrientRows = [
    {
      label: "Énergie",
      value: nutriments.energyKcal,
      unit: "kcal",
      icon: <FlameIcon className="h-4 w-4" />,
      max: 900 // Pour 100g, max recommandé pour un repas
    },
    {
      label: "Matières grasses",
      value: nutriments.fat,
      unit: "g",
      level: nutriments.fat ? getNutrientLevel(nutriments.fat, { low: 3, high: 17.5 }) : null
    },
    {
      label: "dont saturées",
      value: nutriments.saturatedFat,
      unit: "g",
      level: nutriments.saturatedFat
        ? getNutrientLevel(nutriments.saturatedFat, { low: 1.5, high: 5 })
        : null,
      indent: true
    },
    {
      label: "Glucides",
      value: nutriments.carbohydrates,
      unit: "g"
    },
    {
      label: "dont sucres",
      value: nutriments.sugars,
      unit: "g",
      level: nutriments.sugars ? getNutrientLevel(nutriments.sugars, { low: 5, high: 22.5 }) : null,
      indent: true
    },
    {
      label: "Fibres",
      value: nutriments.fiber,
      unit: "g",
      icon: <LeafIcon className="h-4 w-4 text-green-600" />
    },
    {
      label: "Protéines",
      value: nutriments.proteins,
      unit: "g"
    },
    {
      label: "Sel",
      value: nutriments.salt,
      unit: "g",
      level: nutriments.salt ? getNutrientLevel(nutriments.salt, { low: 0.3, high: 1.5 }) : null
    }
  ];

  return (
    <Card shadow="none" className="border border-gray-200">
      <CardBody className="p-4 space-y-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <FlameIcon className="h-4 w-4" />
          Valeurs nutritionnelles pour 100g
        </h3>

        {/* Avertissements santé */}
        {healthWarnings &&
          (healthWarnings.hasSugar || healthWarnings.hasSalt || healthWarnings.hasSaturatedFat) && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-2 text-orange-700 font-medium text-xs">
                <AlertTriangleIcon className="h-4 w-4" />
                <span>Avertissements</span>
              </div>
              <ul className="text-xs text-orange-600 space-y-0.5 ml-6">
                {healthWarnings.hasSugar && <li>• Teneur élevée en sucres</li>}
                {healthWarnings.hasSalt && <li>• Teneur élevée en sel</li>}
                {healthWarnings.hasSaturatedFat && <li>• Teneur élevée en graisses saturées</li>}
              </ul>
            </div>
          )}

        <Divider />

        {/* Tableau nutritionnel */}
        <div className="space-y-2">
          {nutrientRows.map((row, index) => {
            if (row.value === undefined) return null;

            return (
              <div key={index} className={`flex items-center justify-between ${row.indent ? "ml-4" : ""}`}>
                <div className="flex items-center gap-2 flex-1">
                  {row.icon}
                  <span className="text-sm">{row.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {row.value.toFixed(1)} {row.unit}
                  </span>
                  {row.level && (
                    <Chip
                      size="sm"
                      color={row.level.color}
                      variant="flat"
                      className="min-w-[60px] text-center"
                    >
                      {row.level.level}
                    </Chip>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Barre de progression énergie */}
        {nutriments.energyKcal && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Apport énergétique</span>
              <span>{Math.round((nutriments.energyKcal / 2000) * 100)}% de l'apport quotidien</span>
            </div>
            <Progress
              value={(nutriments.energyKcal / 2000) * 100}
              color={nutriments.energyKcal > 500 ? "danger" : "primary"}
              size="sm"
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
};
