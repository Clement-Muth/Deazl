"use client";

import { Chip } from "@heroui/react";
import { AlertTriangleIcon, LeafIcon, SparklesIcon } from "lucide-react";
import type { ProductQualityData } from "../../../Domain/ValueObjects/ProductQuality.vo";

interface ProductQualityBadgesProps {
  qualityData: ProductQualityData | null;
}

export const ProductQualityBadges = ({ qualityData }: ProductQualityBadgesProps) => {
  if (!qualityData) {
    return (
      <div className="text-sm text-gray-500 text-center py-4">Information de qualité non disponible</div>
    );
  }

  const getGradeColor = (
    grade: "A" | "B" | "C" | "D" | "E" | "unknown"
  ): "success" | "warning" | "danger" | "default" => {
    switch (grade) {
      case "A":
        return "success";
      case "B":
        return "success";
      case "C":
        return "warning";
      case "D":
        return "danger";
      case "E":
        return "danger";
      default:
        return "default";
    }
  };

  const getNovaColor = (group: number): "success" | "warning" | "danger" => {
    if (group <= 2) return "success";
    if (group === 3) return "warning";
    return "danger";
  };

  const getScoreColor = (score: number): "success" | "warning" | "danger" => {
    if (score >= 70) return "success";
    if (score >= 40) return "warning";
    return "danger";
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Score global */}
      {qualityData.overallQualityScore !== undefined && (
        <div className="flex items-center gap-2">
          <Chip
            size="lg"
            color={getScoreColor(qualityData.overallQualityScore)}
            variant="flat"
            startContent={<SparklesIcon className="h-4 w-4" />}
          >
            Qualité globale : {Math.round(qualityData.overallQualityScore)}/100
          </Chip>
        </div>
      )}

      {/* Badges individuels */}
      <div className="flex flex-wrap gap-2">
        {/* Nutri-Score */}
        {qualityData.nutriScore?.grade && qualityData.nutriScore.grade !== "unknown" && (
          <Chip
            size="md"
            color={getGradeColor(qualityData.nutriScore.grade)}
            variant="flat"
            startContent={<LeafIcon className="h-3 w-3" />}
          >
            Nutri-Score {qualityData.nutriScore.grade}
          </Chip>
        )}

        {/* Eco-Score */}
        {qualityData.ecoScore?.grade && qualityData.ecoScore.grade !== "unknown" && (
          <Chip
            size="md"
            color={getGradeColor(qualityData.ecoScore.grade)}
            variant="flat"
            startContent={<LeafIcon className="h-3 w-3" />}
          >
            Eco-Score {qualityData.ecoScore.grade}
          </Chip>
        )}

        {/* Nova Group */}
        {qualityData.novaGroup?.group && (
          <Chip
            size="md"
            color={getNovaColor(qualityData.novaGroup.group)}
            variant="flat"
            startContent={<AlertTriangleIcon className="h-3 w-3" />}
          >
            Nova Group {qualityData.novaGroup.group}
          </Chip>
        )}
      </div>

      {/* Explications */}
      <div className="text-xs text-gray-500 space-y-1">
        {qualityData.nutriScore?.grade && qualityData.nutriScore.grade !== "unknown" && (
          <p>• Nutri-Score : qualité nutritionnelle (A = excellent, E = à limiter)</p>
        )}
        {qualityData.novaGroup?.group && (
          <p>• Nova : niveau de transformation (1 = brut, 4 = ultra-transformé)</p>
        )}
        {qualityData.ecoScore?.grade && qualityData.ecoScore.grade !== "unknown" && (
          <p>• Eco-Score : impact environnemental (A = faible, E = élevé)</p>
        )}
      </div>
    </div>
  );
};
