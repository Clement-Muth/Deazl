"use client";

import { Accordion, AccordionItem, Card, CardBody, CardHeader, Chip, Spinner } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { AlertCircle, AlertTriangle, Info, Leaf, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { getRecipeQuality } from "../Api/recipes/getRecipeQuality.api";
import type {
  QualityRecommendation,
  RecipeQualityResult
} from "../Domain/Services/RecipeComputeQuality.service";

interface RecipeQualitySectionProps {
  recipeId: string;
  className?: string;
}

/**
 * Section UI enrichie pour l'affichage de la qualité nutritionnelle
 * Affiche le score global, les détails par ingrédient, et les recommandations
 */
export function RecipeQualitySection({ recipeId, className }: RecipeQualitySectionProps) {
  const [qualityData, setQualityData] = useState<RecipeQualityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuality() {
      setLoading(true);
      setError(null);

      try {
        const result = await getRecipeQuality(recipeId);

        if ("error" in result) {
          setError(result.error);
        } else {
          setQualityData(result);
        }
      } catch (err) {
        setError("Erreur lors du chargement de la qualité");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchQuality();
  }, [recipeId]);

  if (loading) {
    return (
      <Card className={className}>
        <CardBody className="flex items-center justify-center py-12">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">
            <Trans>Quality calculation...</Trans>
          </p>
        </CardBody>
      </Card>
    );
  }

  if (error || !qualityData) {
    return (
      <Card className={className}>
        <CardBody className="flex items-center justify-center py-12">
          <p className="text-red-600">{error || "Data not available"}</p>
        </CardBody>
      </Card>
    );
  }
  const {
    qualityScore,
    averageNutriScore,
    averageEcoScore,
    avgNovaGroup,
    additivesCount,
    allergensCount,
    details,
    recommendations
  } = qualityData;

  const getScoreColor = (score: number): "success" | "primary" | "warning" | "danger" => {
    if (score >= 80) return "success";
    if (score >= 60) return "primary";
    if (score >= 40) return "warning";
    return "danger";
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    return "To improve";
  };

  const getGradeColor = (grade: string): "success" | "primary" | "warning" | "danger" | "default" => {
    if (grade === "A") return "success";
    if (grade === "B") return "primary";
    if (grade === "C") return "warning";
    if (grade === "D" || grade === "E") return "danger";
    return "default";
  };

  const getNovaColor = (group: number): "success" | "primary" | "warning" | "danger" => {
    if (group <= 1) return "success";
    if (group <= 2) return "primary";
    if (group <= 3) return "warning";
    return "danger";
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "medium":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "low":
        return <Info className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-col gap-3 p-4 sm:p-6">
        <h3 className="text-xl sm:text-2xl font-bold">
          <Trans>Nutrition quality</Trans>
        </h3>

        {/* Score principal */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center ${
                getScoreColor(qualityScore) === "success"
                  ? "bg-green-100"
                  : getScoreColor(qualityScore) === "primary"
                    ? "bg-blue-100"
                    : getScoreColor(qualityScore) === "warning"
                      ? "bg-yellow-100"
                      : "bg-red-100"
              }`}
            >
              <div className="text-center">
                <span
                  className={`text-2xl sm:text-3xl font-bold ${
                    getScoreColor(qualityScore) === "success"
                      ? "text-green-600"
                      : getScoreColor(qualityScore) === "primary"
                        ? "text-blue-600"
                        : getScoreColor(qualityScore) === "warning"
                          ? "text-yellow-600"
                          : "text-red-600"
                  }`}
                >
                  {qualityScore}
                </span>
                <span className="text-xs sm:text-sm text-gray-600">/100</span>
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base sm:text-lg font-semibold text-gray-700 truncate">
              {getScoreLabel(qualityScore)}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              <Trans>Overall quality score</Trans>
            </p>
          </div>
        </div>

        {/* Mini-cartes NutriScore / EcoScore / Nova */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <div className="p-2 sm:p-3 rounded-lg bg-gray-50 text-center">
            <p className="text-[10px] sm:text-xs text-gray-600 mb-1">
              <Trans>NutriScore</Trans>
            </p>
            <Chip
              size="sm"
              color={getGradeColor(averageNutriScore)}
              variant="flat"
              className="font-bold text-xs sm:text-sm"
            >
              {averageNutriScore}
            </Chip>
          </div>

          <div className="p-2 sm:p-3 rounded-lg bg-gray-50 text-center">
            <p className="text-[10px] sm:text-xs text-gray-600 mb-1">
              <Trans>EcoScore</Trans>
            </p>
            <Chip
              size="sm"
              color={getGradeColor(averageEcoScore)}
              variant="flat"
              className="font-bold text-xs sm:text-sm"
            >
              {averageEcoScore}
            </Chip>
          </div>

          <div className="p-2 sm:p-3 rounded-lg bg-gray-50 text-center">
            <p className="text-[10px] sm:text-xs text-gray-600 mb-1">
              <Trans>Nova</Trans>
            </p>
            <Chip
              size="sm"
              color={getNovaColor(avgNovaGroup)}
              variant="flat"
              className="font-bold text-xs sm:text-sm"
            >
              {avgNovaGroup > 0 ? avgNovaGroup.toFixed(1) : "-"}
            </Chip>
          </div>
        </div>

        {/* Indicateurs additifs / allergènes */}
        {(additivesCount > 0 || allergensCount > 0) && (
          <div className="flex flex-wrap gap-2">
            {additivesCount > 0 && (
              <Chip size="sm" color={additivesCount >= 5 ? "danger" : "warning"} variant="flat">
                <Trans>{additivesCount} additives</Trans>
              </Chip>
            )}
            {allergensCount > 0 && (
              <Chip size="sm" color="warning" variant="flat">
                <Trans>{allergensCount} allergens</Trans>
              </Chip>
            )}
          </div>
        )}
      </CardHeader>

      <CardBody className="gap-4 sm:gap-6 p-4 sm:p-6">
        {/* Recommandations */}
        {recommendations.length > 0 && (
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <Trans>Improvement suggestions</Trans>
            </h4>

            <div className="space-y-2 sm:space-y-3">
              {recommendations.map((rec, idx) => (
                <RecommendationCard key={`${rec.ingredientId}-${idx}`} recommendation={rec} />
              ))}
            </div>
          </div>
        )}

        {/* Détail par ingrédient */}
        <div>
          <h4 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
            <Trans>Detail by ingredient</Trans>
          </h4>

          <Accordion variant="bordered">
            {details.map((item, idx) => (
              <AccordionItem
                key={`${item.ingredientId}-${idx}`}
                title={
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm sm:text-base truncate">
                      {item.ingredientName || item.productName}
                    </span>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      {item.nutriScore && (
                        <Chip
                          size="sm"
                          color={getGradeColor(item.nutriScore)}
                          variant="flat"
                          className="text-xs"
                        >
                          {item.nutriScore}
                        </Chip>
                      )}
                      <Chip
                        size="sm"
                        color={getScoreColor(item.qualityScore)}
                        variant="flat"
                        className="text-xs"
                      >
                        {item.qualityScore}/100
                      </Chip>
                    </div>
                  </div>
                }
              >
                <div className="space-y-2 text-xs sm:text-sm px-2 sm:px-0">
                  <div className="grid grid-cols-3 gap-2">
                    {item.nutriScore && (
                      <div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-1">
                          <Trans>NutriScore</Trans>
                        </p>
                        <Chip
                          size="sm"
                          color={getGradeColor(item.nutriScore)}
                          variant="flat"
                          className="text-xs"
                        >
                          {item.nutriScore}
                        </Chip>
                      </div>
                    )}
                    {item.ecoScore && (
                      <div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-1">
                          <Trans>EcoScore</Trans>
                        </p>
                        <Chip
                          size="sm"
                          color={getGradeColor(item.ecoScore)}
                          variant="flat"
                          className="text-xs"
                        >
                          {item.ecoScore}
                        </Chip>
                      </div>
                    )}
                    {item.novaGroup && (
                      <div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-1">
                          <Trans>Nova</Trans>
                        </p>
                        <Chip
                          size="sm"
                          color={getNovaColor(item.novaGroup)}
                          variant="flat"
                          className="text-xs"
                        >
                          {item.novaGroup}
                        </Chip>
                      </div>
                    )}
                  </div>
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </CardBody>
    </Card>
  );
}

/**
 * Carte de recommandation (mobile-first)
 */
function RecommendationCard({ recommendation }: { recommendation: QualityRecommendation }) {
  const { type, ingredientName, reason, suggestion, expectedQualityGain, priority } = recommendation;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "substitute":
        return <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />;
      case "reduce":
        return <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-600" />;
      case "remove":
        return <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string): "danger" | "warning" | "default" => {
    if (priority === "high") return "danger";
    if (priority === "medium") return "warning";
    return "default";
  };

  return (
    <div
      className={`p-2.5 sm:p-3 rounded-lg border-l-3 sm:border-l-4 bg-gray-50 ${
        priority === "high"
          ? "border-red-500"
          : priority === "medium"
            ? "border-yellow-500"
            : "border-blue-500"
      }`}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="flex-shrink-0 mt-0.5 sm:mt-1">{getTypeIcon(type)}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{ingredientName}</p>
            <Chip
              size="sm"
              color={getPriorityColor(priority)}
              variant="flat"
              className="text-xs flex-shrink-0"
            >
              +{expectedQualityGain}
            </Chip>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">{reason}</p>
          <p className="text-xs sm:text-sm text-gray-700 font-medium">{suggestion}</p>
        </div>
      </div>
    </div>
  );
}
