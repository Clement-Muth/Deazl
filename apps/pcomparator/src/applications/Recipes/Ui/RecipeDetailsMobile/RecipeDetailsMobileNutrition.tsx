"use client";

import { Button, Card, CardBody, Chip } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { motion } from "framer-motion";
import { AlertCircle, ChevronLeft, ChevronRight, Leaf, TrendingUp } from "lucide-react";
import { useState } from "react";

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

interface QualityData {
  qualityScore: number;
  averageNutriScore: string;
  averageEcoScore: string;
  avgNovaGroup: number;
  nutritionalAlerts?: Array<{
    type: string;
    severity: string;
    message: string;
  }>;
  additives?: Array<{
    id: string;
    name: string;
    riskLevel: string;
  }>;
  allergens?: string[];
  recommendations?: Array<{
    ingredientId: string;
    suggestion: string;
    priority: string;
    type: string;
    expectedQualityGain: number;
  }>;
  details?: Array<{
    ingredientId: string;
    novaGroup?: number;
    ecoScore?: string;
    nutriScore?: string;
  }>;
}

interface RecipeDetailsMobileNutritionProps {
  quality: QualityData | null;
  ingredientsWithPrice: IngredientWithPrice[];
}

export default function RecipeDetailsMobileNutrition({
  quality,
  ingredientsWithPrice
}: RecipeDetailsMobileNutritionProps) {
  const { t } = useLingui();
  const [showNutritionDetails, setShowNutritionDetails] = useState(false);

  const qualityScore = quality?.qualityScore || 0;
  const nutriScore = quality?.averageNutriScore || "?";
  const ecoScore = quality?.averageEcoScore || "?";
  const novaGroup = quality?.avgNovaGroup || 0;

  const getQualityColor = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "danger";
  };

  const getQualityLabel = (score: number) => {
    if (score >= 80) return t`Excellent`;
    if (score >= 60) return t`Good`;
    return t`To improve`;
  };

  const getLabelColor = (label: string) => {
    switch (label) {
      case "bio":
        return "success";
      case "eco":
        return "primary";
      case "ultra-processed":
        return "danger";
      default:
        return "default";
    }
  };

  const getLabelIcon = (label: string) => {
    switch (label) {
      case "bio":
      case "eco":
        return <Leaf className="w-3 h-3" />;
      case "ultra-processed":
        return <AlertCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card>
        <CardBody className="p-5">
          {/* En-tête */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                <Trans>Nutrition quality</Trans>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <Trans>Comprehensive analysis</Trans>
              </p>
            </div>
          </div>

          {/* Score global - Design circulaire moderne */}
          <div className="relative mb-6 p-5 bg-linear-to-br from-primary/5 via-primary/10 to-transparent rounded-2xl border border-primary/20">
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                {/* Cercle de progression */}
                <svg className="w-24 h-24 transform -rotate-90" aria-label="Quality score progress">
                  <title>Quality score progress</title>
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-default-200 dark:text-default-100/10"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - qualityScore / 100)}`}
                    className={`transition-all duration-1000 ${
                      getQualityColor(qualityScore) === "success"
                        ? "text-success"
                        : getQualityColor(qualityScore) === "warning"
                          ? "text-warning"
                          : "text-danger"
                    }`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div
                      className={`text-3xl font-bold ${
                        getQualityColor(qualityScore) === "success"
                          ? "text-success"
                          : getQualityColor(qualityScore) === "warning"
                            ? "text-warning"
                            : "text-danger"
                      }`}
                    >
                      {qualityScore}
                    </div>
                    <div className="text-xs text-gray-500">/100</div>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <Chip
                  size="lg"
                  color={getQualityColor(qualityScore)}
                  variant="flat"
                  className="font-bold mb-2"
                >
                  {getQualityLabel(qualityScore)}
                </Chip>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {qualityScore >= 80
                    ? t`This recipe is excellent for your health`
                    : qualityScore >= 60
                      ? t`This recipe is good with some possible improvements`
                      : t`This recipe could be improved`}
                </p>
              </div>
            </div>
          </div>

          {/* Badges NutriScore / EcoScore / Nova - Design moderne */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <Card shadow="none" className="bg-success/5 border border-success/20">
              <CardBody className="p-3 text-center">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  <Trans>NutriScore</Trans>
                </p>
                <Chip size="lg" color="success" variant="shadow" className="font-bold text-lg">
                  {nutriScore}
                </Chip>
              </CardBody>
            </Card>
            <Card shadow="none" className="bg-warning/5 border border-warning/20">
              <CardBody className="p-3 text-center">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  <Trans>EcoScore</Trans>
                </p>
                <Chip size="lg" color="warning" variant="shadow" className="font-bold text-lg">
                  {ecoScore}
                </Chip>
              </CardBody>
            </Card>
            <Card shadow="none" className="bg-primary/5 border border-primary/20">
              <CardBody className="p-3 text-center">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  <Trans>Nova</Trans>
                </p>
                <Chip size="lg" color="primary" variant="shadow" className="font-bold text-lg">
                  {novaGroup > 0 ? novaGroup.toFixed(1) : "-"}
                </Chip>
              </CardBody>
            </Card>
          </div>

          {/* Alertes nutritionnelles - Design moderne */}
          {quality?.nutritionalAlerts && quality.nutritionalAlerts.length > 0 && (
            <div className="mb-5 space-y-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <Trans>Points of attention</Trans>
              </p>
              {quality.nutritionalAlerts.map((alert, idx) => {
                const isDanger = alert.severity === "danger";
                const bgColor = isDanger ? "bg-danger/5 border-danger/30" : "bg-warning/5 border-warning/30";
                const iconColor = isDanger ? "text-danger" : "text-warning";

                return (
                  <motion.div
                    key={`${alert.type}-${idx}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-4 rounded-xl border-2 ${bgColor}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`shrink-0 w-10 h-10 rounded-xl ${isDanger ? "bg-danger/10" : "bg-warning/10"} flex items-center justify-center`}
                      >
                        <AlertCircle className={`w-5 h-5 ${iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${iconColor} mb-1`}>
                          {alert.type === "salt" ? (
                            <Trans>High salt content</Trans>
                          ) : alert.type === "sugar" ? (
                            <Trans>High sugar content</Trans>
                          ) : (
                            <Trans>High saturated fat content</Trans>
                          )}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Additifs avec noms et risques */}
          {quality?.additives && quality.additives.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Trans>Detected additives:</Trans>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {quality.additives.map((additive) => {
                  const riskColor =
                    additive.riskLevel === "dangerous"
                      ? "danger"
                      : additive.riskLevel === "high_risk"
                        ? "warning"
                        : additive.riskLevel === "moderate"
                          ? "warning"
                          : "success";

                  return (
                    <Chip key={additive.id} size="sm" color={riskColor} variant="flat" className="text-xs">
                      {additive.name}
                    </Chip>
                  );
                })}
              </div>
            </div>
          )}

          {/* Allergènes */}
          {quality?.allergens && quality.allergens.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Trans>Allergens:</Trans>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {quality.allergens.map((allergen) => (
                  <Chip key={allergen} size="sm" color="warning" variant="flat" className="text-xs">
                    {allergen}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* Conseils actionnables (vraies recommendations) */}
          {quality?.recommendations && quality.recommendations.length > 0 && (
            <div className="space-y-2 mb-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                <Trans>Improvement suggestions:</Trans>
              </p>
              <div className="space-y-2">
                {quality.recommendations.slice(0, 3).map((rec, idx) => {
                  const borderColor =
                    rec.priority === "high"
                      ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                      : rec.priority === "medium"
                        ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10"
                        : "border-blue-500 bg-blue-50 dark:bg-blue-900/10";
                  const iconColor =
                    rec.priority === "high"
                      ? "text-red-600"
                      : rec.priority === "medium"
                        ? "text-yellow-600"
                        : "text-blue-600";
                  const Icon =
                    rec.type === "substitute" ? Leaf : rec.type === "remove" ? AlertCircle : AlertCircle;

                  return (
                    <div
                      key={`${rec.ingredientId}-${idx}`}
                      className={`p-2.5 rounded-lg border-l-3 ${borderColor}`}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className={`w-4 h-4 ${iconColor} shrink-0 mt-0.5`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                            {rec.suggestion}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            <Trans>Improvement of +{rec.expectedQualityGain} points</Trans>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Détails nutrition par ingrédient */}
          {ingredientsWithPrice.length > 0 && (
            <div className="mt-4">
              <Button
                fullWidth
                size="sm"
                variant="flat"
                onPress={() => setShowNutritionDetails(!showNutritionDetails)}
                endContent={
                  showNutritionDetails ? (
                    <ChevronLeft className="w-4 h-4 rotate-90" />
                  ) : (
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  )
                }
              >
                {showNutritionDetails ? t`Hide details` : t`Show nutrition details`}
              </Button>

              {showNutritionDetails && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  // @ts-ignore
                  className="mt-3 space-y-2"
                >
                  {ingredientsWithPrice.slice(0, 5).map((ing) => (
                    <div
                      key={ing.id}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {ing.name}
                        </span>
                        {ing.nutriScore && (
                          <Chip size="sm" color="success" variant="flat" className="text-xs">
                            {ing.nutriScore}
                          </Chip>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium">
                            <Trans>Labels:</Trans>
                          </span>{" "}
                          {ing.labels.join(", ") || "-"}
                        </div>
                        <div>
                          <span className="font-medium">
                            <Trans>Allergens:</Trans>
                          </span>{" "}
                          {ing.allergens.join(", ") || t`None`}
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
}
