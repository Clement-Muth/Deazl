import { Accordion, AccordionItem, Card, CardBody, Chip } from "@heroui/react";
import { AlertCircle, CheckCircle, FlaskConical } from "lucide-react";
import type { ProductQualityData } from "../../../Domain/ValueObjects/ProductQuality.vo";

interface AdditivesSectionProps {
  additives?: ProductQualityData["additives"];
  compact?: boolean;
}

/**
 * Get risk color - 4 level system like Yuka
 */
function getRiskColor(riskLevel: string): "success" | "warning" | "danger" | "default" {
  if (riskLevel === "safe") return "success";
  if (riskLevel === "moderate") return "warning";
  if (riskLevel === "high_risk") return "warning";
  if (riskLevel === "dangerous") return "danger";
  return "default";
}

/**
 * Get risk label
 */
function getRiskLabel(riskLevel: string): string {
  if (riskLevel === "safe") return "Safe";
  if (riskLevel === "moderate") return "Moderate";
  if (riskLevel === "high_risk") return "High risk";
  if (riskLevel === "dangerous") return "Dangerous";
  return "Unknown";
}

/**
 * AdditivesSection - List of additives with risk levels
 */
export function AdditivesSection({ additives, compact = false }: AdditivesSectionProps) {
  const hasAdditives = additives && additives.length > 0;
  const dangerousCount = additives?.filter((a) => a.riskLevel === "dangerous").length ?? 0;
  const highRiskCount = additives?.filter((a) => a.riskLevel === "high_risk").length ?? 0;
  const moderateRiskCount = additives?.filter((a) => a.riskLevel === "moderate").length ?? 0;
  const hasWarnings = dangerousCount > 0 || highRiskCount > 0 || moderateRiskCount > 0;

  if (compact) {
    return (
      <Card shadow="none" className="border border-gray-200">
        <CardBody>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FlaskConical size={20} className="text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Additifs</h2>
            </div>

            {!hasAdditives ? (
              <Chip size="sm" variant="flat" color="success" startContent={<CheckCircle size={14} />}>
                Aucun
              </Chip>
            ) : (
              <Chip
                size="sm"
                variant="flat"
                color={
                  dangerousCount > 0
                    ? "danger"
                    : highRiskCount > 0
                      ? "warning"
                      : moderateRiskCount > 0
                        ? "warning"
                        : "success"
                }
              >
                {additives.length}
              </Chip>
            )}
          </div>

          {!hasAdditives ? (
            <div className="p-3 bg-success-50 rounded-lg text-center">
              <p className="text-sm text-success-700">Aucun additif détecté dans ce produit</p>
            </div>
          ) : (
            <>
              {hasWarnings && (
                <div
                  className={`mb-3 p-3 border-l-4 rounded ${
                    dangerousCount > 0
                      ? "bg-red-50 border-red-500"
                      : highRiskCount > 0
                        ? "bg-orange-50 border-orange-500"
                        : "bg-yellow-50 border-yellow-500"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle
                      size={16}
                      className={`mt-0.5 ${
                        dangerousCount > 0
                          ? "text-red-600"
                          : highRiskCount > 0
                            ? "text-orange-600"
                            : "text-yellow-600"
                      }`}
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          dangerousCount > 0
                            ? "text-red-700"
                            : highRiskCount > 0
                              ? "text-orange-700"
                              : "text-yellow-700"
                        }`}
                      >
                        {dangerousCount > 0
                          ? `${dangerousCount} dangerous additive(s)`
                          : highRiskCount > 0
                            ? `${highRiskCount} high risk additive(s)`
                            : `${moderateRiskCount} moderate risk additive(s)`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {additives.slice(0, 5).map((additive) => (
                  <Chip
                    key={additive.id}
                    size="sm"
                    variant="flat"
                    color={getRiskColor(additive.riskLevel || "unknown")}
                  >
                    {additive.name}
                  </Chip>
                ))}
                {additives.length > 5 && (
                  <Chip size="sm" variant="flat" color="default">
                    +{additives.length - 5} autres
                  </Chip>
                )}
              </div>
            </>
          )}
        </CardBody>
      </Card>
    );
  }

  // Detailed view
  return (
    <Card shadow="none" className="border border-gray-200">
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <FlaskConical size={20} className="text-primary" />
            Additifs
          </h2>

          {!hasAdditives ? (
            <Chip size="sm" variant="solid" color="success" startContent={<CheckCircle size={14} />}>
              Aucun additif
            </Chip>
          ) : (
            <Chip size="sm" variant="flat" color="default">
              {additives.length} additif{additives.length > 1 ? "s" : ""}
            </Chip>
          )}
        </div>

        {!hasAdditives ? (
          <div className="p-6 bg-success-50 rounded-lg text-center">
            <CheckCircle size={32} className="text-success mx-auto mb-2" />
            <p className="text-sm font-semibold text-success-700 mb-1">Aucun additif détecté</p>
            <p className="text-xs text-success-600">
              Ce produit ne contient aucun additif alimentaire identifié
            </p>
          </div>
        ) : (
          <Accordion selectionMode="multiple" defaultExpandedKeys={hasWarnings ? ["list"] : []}>
            {/* Warning banner */}
            {hasWarnings ? (
              <AccordionItem
                key="warnings"
                title={
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-warning" />
                    <span className="font-semibold">Avertissements</span>
                    <Chip size="sm" variant="flat" color="warning">
                      {highRiskCount + moderateRiskCount}
                    </Chip>
                  </div>
                }
              >
                <div className="space-y-3 pb-4">
                  {dangerousCount > 0 && (
                    <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                      <p className="text-sm font-semibold text-red-700 mb-1">
                        {dangerousCount} dangerous additive{dangerousCount > 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-red-600">
                        These additives may pose significant risks. Consider avoiding them.
                      </p>
                    </div>
                  )}

                  {highRiskCount > 0 && (
                    <div className="p-3 bg-orange-50 border-l-4 border-orange-500 rounded">
                      <p className="text-sm font-semibold text-orange-700 mb-1">
                        {highRiskCount} high risk additive{highRiskCount > 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-orange-600">
                        These additives may present risks for some people. Check the detailed list below.
                      </p>
                    </div>
                  )}

                  {moderateRiskCount > 0 && (
                    <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                      <p className="text-sm font-semibold text-yellow-700 mb-1">
                        {moderateRiskCount} moderate risk additive{moderateRiskCount > 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-yellow-600">These additives require moderate consumption.</p>
                    </div>
                  )}
                </div>
              </AccordionItem>
            ) : null}

            {/* Complete list */}
            <AccordionItem
              key="list"
              title={
                <div className="flex items-center gap-2">
                  <FlaskConical size={16} />
                  <span className="font-semibold">Liste complète des additifs</span>
                </div>
              }
            >
              <div className="space-y-2 pb-4">
                {additives.map((additive, index) => (
                  <div
                    key={additive.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      additive.riskLevel === "dangerous"
                        ? "bg-red-50 border-red-500"
                        : additive.riskLevel === "high_risk"
                          ? "bg-orange-50 border-orange-500"
                          : additive.riskLevel === "moderate"
                            ? "bg-yellow-50 border-yellow-500"
                            : additive.riskLevel === "safe"
                              ? "bg-green-50 border-green-500"
                              : "bg-default-50 border-default"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground mb-1">
                          {additive.name}{" "}
                          <span className="text-xs font-mono text-foreground-500">
                            ({additive.id.toUpperCase()})
                          </span>
                        </p>
                        <Chip size="sm" variant="flat" color={getRiskColor(additive.riskLevel || "unknown")}>
                          {getRiskLabel(additive.riskLevel || "unknown")}
                        </Chip>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionItem>

            {/* Info section */}
            <AccordionItem
              key="info"
              title={
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span className="font-semibold">À propos des additifs</span>
                </div>
              }
            >
              <div className="space-y-3 pb-4 text-xs text-foreground-600">
                <p>
                  Les additifs alimentaires sont des substances ajoutées aux aliments pour améliorer leur
                  conservation, leur goût, leur texture ou leur apparence.
                </p>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-3 h-3 rounded bg-green-500 mt-1" />
                    <div>
                      <p className="font-semibold text-green-700">Safe</p>
                      <p className="text-green-600">Generally considered safe</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-3 h-3 rounded bg-yellow-500 mt-1" />
                    <div>
                      <p className="font-semibold text-yellow-700">Moderate risk</p>
                      <p className="text-yellow-600">Should be consumed in moderation</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-3 h-3 rounded bg-orange-500 mt-1" />
                    <div>
                      <p className="font-semibold text-orange-700">High risk</p>
                      <p className="text-orange-600">May present risks for some people</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-3 h-3 rounded bg-red-500 mt-1" />
                    <div>
                      <p className="font-semibold text-red-700">Dangerous</p>
                      <p className="text-red-600">May pose significant health risks</p>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionItem>
          </Accordion>
        )}
      </CardBody>
    </Card>
  );
}
