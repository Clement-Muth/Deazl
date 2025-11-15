"use client";

import { Card, CardBody, Chip } from "@heroui/react";
import { AlertCircleIcon, FlaskConicalIcon } from "lucide-react";
import type { ProductQualityData } from "../../../Domain/ValueObjects/ProductQuality.vo";

interface ProductAdditivesProps {
  qualityData: ProductQualityData;
}

export const ProductAdditives = ({ qualityData }: ProductAdditivesProps) => {
  const { additives } = qualityData;

  if (!additives || additives.length === 0) {
    return (
      <Card shadow="none" className="border border-green-200 bg-green-50">
        <CardBody className="p-4">
          <div className="flex items-center gap-2 text-green-700">
            <FlaskConicalIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Aucun additif détecté</span>
          </div>
        </CardBody>
      </Card>
    );
  }

  const getRiskColor = (
    risk: "safe" | "moderate" | "high_risk" | "dangerous" | "unknown"
  ): "success" | "warning" | "danger" | "default" => {
    switch (risk) {
      case "safe":
        return "success";
      case "moderate":
        return "warning";
      case "high_risk":
      case "dangerous":
        return "danger";
      default:
        return "default";
    }
  };

  const getRiskLabel = (risk: "safe" | "moderate" | "high_risk" | "dangerous" | "unknown"): string => {
    switch (risk) {
      case "safe":
        return "Faible";
      case "moderate":
        return "Modéré";
      case "high_risk":
      case "dangerous":
        return "Élevé";
      default:
        return "Inconnu";
    }
  };

  const highRiskCount = additives.filter((a) => a.riskLevel === "high_risk").length;
  const moderateRiskCount = additives.filter((a) => a.riskLevel === "moderate").length;

  return (
    <Card shadow="none" className="border border-gray-200">
      <CardBody className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <FlaskConicalIcon className="h-4 w-4" />
            Additifs ({additives.length})
          </h3>
          {(highRiskCount > 0 || moderateRiskCount > 0) && (
            <Chip
              size="sm"
              color={highRiskCount > 0 ? "danger" : "warning"}
              startContent={<AlertCircleIcon className="h-3 w-3" />}
            >
              Attention
            </Chip>
          )}
        </div>

        {(highRiskCount > 0 || moderateRiskCount > 0) && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-700">
            <div className="flex items-start gap-2">
              <AlertCircleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Ce produit contient :</p>
                <ul className="mt-1 space-y-0.5 ml-4">
                  {highRiskCount > 0 && (
                    <li>
                      • {highRiskCount} additif{highRiskCount > 1 ? "s" : ""} à risque élevé
                    </li>
                  )}
                  {moderateRiskCount > 0 && (
                    <li>
                      • {moderateRiskCount} additif{moderateRiskCount > 1 ? "s" : ""} à risque modéré
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {additives.map((additive, index) => (
            <div key={index} className="flex items-start justify-between gap-2 p-2 rounded-lg bg-gray-50">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{additive.name}</p>
                <p className="text-xs text-gray-500">{additive.id}</p>
              </div>
              <Chip size="sm" color={getRiskColor(additive.riskLevel || "unknown")} variant="flat">
                {getRiskLabel(additive.riskLevel || "unknown")}
              </Chip>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
