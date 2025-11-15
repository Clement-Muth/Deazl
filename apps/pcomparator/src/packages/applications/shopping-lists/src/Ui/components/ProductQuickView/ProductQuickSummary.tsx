"use client";

import { Chip, Progress } from "@heroui/react";
import { AlertTriangleIcon, AwardIcon, FlaskConicalIcon, TrophyIcon } from "lucide-react";
import type { ProductQualityData } from "../../../Domain/ValueObjects/ProductQuality.vo";

interface ProductQuickSummaryProps {
  qualityData: ProductQualityData | null;
  lowestPrice?: number | null;
  isBestPrice?: boolean;
  compact?: boolean;
}

export const ProductQuickSummary = ({
  qualityData,
  lowestPrice,
  isBestPrice = false,
  compact = false
}: ProductQuickSummaryProps) => {
  if (!qualityData) {
    return null;
  }

  const { overallQualityScore, nutriScore, ecoScore, novaGroup, additives, allergens, labels } = qualityData;

  // Déterminer la couleur selon le score global
  const getScoreColor = (score: number): "success" | "warning" | "danger" => {
    if (score >= 70) return "success";
    if (score >= 50) return "warning";
    return "danger";
  };

  const hasHighRiskAdditives = additives?.some((a) => a.riskLevel === "high_risk");
  const hasModerateRiskAdditives = additives?.some((a) => a.riskLevel === "moderate");
  const hasAllergens = allergens && allergens.length > 0;
  const hasLabels = labels && labels.length > 0;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Score global */}
        {overallQualityScore !== undefined && (
          <Chip
            size="sm"
            color={getScoreColor(overallQualityScore)}
            variant="flat"
            className="h-5 text-xs font-semibold"
          >
            {Math.round(overallQualityScore)}/100
          </Chip>
        )}

        {/* Nutri-Score */}
        {nutriScore?.grade && nutriScore.grade !== "unknown" && (
          <Chip size="sm" variant="flat" className="h-5 text-xs">
            🍎 {nutriScore.grade}
          </Chip>
        )}

        {/* Eco-Score */}
        {ecoScore?.grade && ecoScore.grade !== "unknown" && (
          <Chip size="sm" variant="flat" className="h-5 text-xs">
            🌍 {ecoScore.grade}
          </Chip>
        )}

        {/* Nova */}
        {novaGroup?.group && (
          <Chip size="sm" variant="flat" className="h-5 text-xs">
            Nova {novaGroup.group}
          </Chip>
        )}

        {/* Alertes */}
        {hasHighRiskAdditives && (
          <Chip
            size="sm"
            color="danger"
            variant="flat"
            startContent={<FlaskConicalIcon className="h-3 w-3" />}
            className="h-5 text-xs"
          >
            Additifs
          </Chip>
        )}

        {hasAllergens && (
          <Chip
            size="sm"
            color="warning"
            variant="flat"
            startContent={<AlertTriangleIcon className="h-3 w-3" />}
            className="h-5 text-xs"
          >
            Allergènes
          </Chip>
        )}

        {hasLabels && (
          <Chip
            size="sm"
            color="success"
            variant="flat"
            startContent={<AwardIcon className="h-3 w-3" />}
            className="h-5 text-xs"
          >
            {labels.length}
          </Chip>
        )}

        {/* Prix */}
        {lowestPrice && (
          <Chip
            size="sm"
            color={isBestPrice ? "success" : "default"}
            variant={isBestPrice ? "solid" : "flat"}
            startContent={isBestPrice ? <TrophyIcon className="h-3 w-3" /> : undefined}
            className="h-5 text-xs font-semibold"
          >
            {lowestPrice.toFixed(2)}€
          </Chip>
        )}
      </div>
    );
  }

  // Version étendue
  return (
    <div className="space-y-2">
      {/* Barre de qualité globale */}
      {overallQualityScore !== undefined && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Qualité globale</span>
            <span className="font-semibold">{Math.round(overallQualityScore)}/100</span>
          </div>
          <Progress
            value={overallQualityScore}
            color={getScoreColor(overallQualityScore)}
            size="sm"
            className="h-1.5"
          />
        </div>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        {nutriScore?.grade && nutriScore.grade !== "unknown" && (
          <Chip size="sm" variant="flat">
            🍎 Nutri-Score {nutriScore.grade}
          </Chip>
        )}
        {ecoScore?.grade && ecoScore.grade !== "unknown" && (
          <Chip size="sm" variant="flat">
            🌍 Eco-Score {ecoScore.grade}
          </Chip>
        )}
        {novaGroup?.group && (
          <Chip size="sm" variant="flat">
            Nova {novaGroup.group}
          </Chip>
        )}

        {hasHighRiskAdditives && (
          <Chip
            size="sm"
            color="danger"
            variant="flat"
            startContent={<FlaskConicalIcon className="h-3 w-3" />}
          >
            Additifs à risque
          </Chip>
        )}

        {hasModerateRiskAdditives && !hasHighRiskAdditives && (
          <Chip
            size="sm"
            color="warning"
            variant="flat"
            startContent={<FlaskConicalIcon className="h-3 w-3" />}
          >
            Additifs modérés
          </Chip>
        )}

        {hasAllergens && (
          <Chip
            size="sm"
            color="warning"
            variant="flat"
            startContent={<AlertTriangleIcon className="h-3 w-3" />}
          >
            {allergens.length} allergène{allergens.length > 1 ? "s" : ""}
          </Chip>
        )}

        {hasLabels && (
          <Chip size="sm" color="success" variant="flat" startContent={<AwardIcon className="h-3 w-3" />}>
            {labels.length} label{labels.length > 1 ? "s" : ""}
          </Chip>
        )}

        {lowestPrice && (
          <Chip
            size="sm"
            color={isBestPrice ? "success" : "default"}
            variant={isBestPrice ? "solid" : "flat"}
            startContent={isBestPrice ? <TrophyIcon className="h-3 w-3" /> : undefined}
          >
            {isBestPrice ? "🏆 " : ""}
            {lowestPrice.toFixed(2)}€
          </Chip>
        )}
      </div>
    </div>
  );
};
