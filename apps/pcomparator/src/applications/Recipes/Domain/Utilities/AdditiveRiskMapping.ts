type AdditiveRiskLevel = "safe" | "moderate" | "high_risk" | "dangerous";

interface RiskColorMapping {
  heroui: "success" | "warning" | "danger";
  tailwind: string;
  label: string;
}

const RISK_COLOR_MAP: Record<AdditiveRiskLevel, RiskColorMapping> = {
  safe: {
    heroui: "success",
    tailwind: "text-green-600 bg-green-50 border-green-200",
    label: "Safe"
  },
  moderate: {
    heroui: "warning",
    tailwind: "text-yellow-600 bg-yellow-50 border-yellow-200",
    label: "Moderate"
  },
  high_risk: {
    heroui: "warning",
    tailwind: "text-orange-600 bg-orange-50 border-orange-200",
    label: "High risk"
  },
  dangerous: {
    heroui: "danger",
    tailwind: "text-red-600 bg-red-50 border-red-200",
    label: "Dangerous"
  }
};

export function getAdditiveRiskColor(riskLevel: AdditiveRiskLevel): "success" | "warning" | "danger" {
  return RISK_COLOR_MAP[riskLevel].heroui;
}

export function getAdditiveRiskTailwind(riskLevel: AdditiveRiskLevel): string {
  return RISK_COLOR_MAP[riskLevel].tailwind;
}

export function getAdditiveRiskLabel(riskLevel: AdditiveRiskLevel): string {
  return RISK_COLOR_MAP[riskLevel].label;
}
