"use client";

import { Chip } from "@heroui/chip";
import { Leaf, MapPin, Scale, Trophy } from "lucide-react";

export type OptimizationReason =
  | "best-price"
  | "best-quality"
  | "closest"
  | "best-balance"
  | "preferred-brand"
  | "only-option";

interface OptimizationBadgeProps {
  reason: string;
  score?: number;
  className?: string;
}

/**
 * Badge affichant la raison du choix d'optimisation
 */
export function OptimizationBadge({ reason, score, className }: OptimizationBadgeProps) {
  const config = getBadgeConfig(reason, score);

  if (!config) return null;

  return (
    <Chip size="sm" variant="flat" color={config.color} startContent={config.icon} className={className}>
      {config.label}
    </Chip>
  );
}

function getBadgeConfig(reason: string, score?: number) {
  const reasonLower = reason.toLowerCase();

  // Meilleur prix
  if (reasonLower.includes("meilleur prix") || reasonLower.includes("best-price")) {
    return {
      label: "🏆 Meilleur prix",
      icon: <Trophy className="w-3 h-3" />,
      color: "warning" as const
    };
  }

  // Meilleure qualité
  if (
    reasonLower.includes("meilleure qualité") ||
    reasonLower.includes("qualité") ||
    reasonLower.includes("best-quality")
  ) {
    return {
      label: "🌱 Meilleure qualité",
      icon: <Leaf className="w-3 h-3" />,
      color: "success" as const
    };
  }

  // Plus proche
  if (
    reasonLower.includes("plus proche") ||
    reasonLower.includes("magasin le plus proche") ||
    reasonLower.includes("closest")
  ) {
    return {
      label: "📍 Plus proche",
      icon: <MapPin className="w-3 h-3" />,
      color: "primary" as const
    };
  }

  // Marque préférée
  if (reasonLower.includes("marque préférée") || reasonLower.includes("preferred-brand")) {
    return {
      label: `⭐ ${reason}`, // Garder le nom de la marque
      icon: null,
      color: "secondary" as const
    };
  }

  // Équilibre optimal (par défaut)
  return {
    label: "⚖️ Équilibre optimal",
    icon: <Scale className="w-3 h-3" />,
    color: "default" as const
  };
}

/**
 * Badge de qualité produit (Nutri-Score, Nova, Eco-Score)
 */
interface QualityBadgeProps {
  score: number; // 0-100
  details?: {
    nutriScore?: string; // A-E
    novaGroup?: number; // 1-4
    ecoScore?: string; // A-E
  };
  className?: string;
}

export function QualityBadge({ score, details, className }: QualityBadgeProps) {
  const color = getQualityColor(score);
  const grade = getQualityGrade(score);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Chip size="sm" variant="flat" color={color}>
        Qualité: {grade} ({Math.round(score)}/100)
      </Chip>

      {details && (
        <div className="flex gap-1 text-xs">
          {details.nutriScore && (
            <span className="px-1.5 py-0.5 rounded bg-default-100 dark:bg-default-800">
              Nutri {details.nutriScore}
            </span>
          )}
          {details.ecoScore && (
            <span className="px-1.5 py-0.5 rounded bg-default-100 dark:bg-default-800">
              Eco {details.ecoScore}
            </span>
          )}
          {details.novaGroup && (
            <span className="px-1.5 py-0.5 rounded bg-default-100 dark:bg-default-800">
              Nova {details.novaGroup}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function getQualityColor(score: number): "success" | "warning" | "danger" {
  if (score >= 70) return "success";
  if (score >= 40) return "warning";
  return "danger";
}

function getQualityGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "E";
}
