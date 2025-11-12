import { Accordion, AccordionItem, Card, CardBody, Chip } from "@heroui/react";
import { AlertCircle, CheckCircle, FlaskConical } from "lucide-react";
import type { ProductQualityData } from "../../../Domain/ValueObjects/ProductQuality.vo";

interface AdditivesSectionProps {
  additives?: ProductQualityData["additives"];
  compact?: boolean;
}

/**
 * Get risk color
 */
function getRiskColor(riskLevel: string): "success" | "warning" | "danger" | "default" {
  if (riskLevel === "low") return "success";
  if (riskLevel === "moderate") return "warning";
  if (riskLevel === "high") return "danger";
  return "default";
}

/**
 * Get risk label in French
 */
function getRiskLabel(riskLevel: string): string {
  if (riskLevel === "low") return "Faible";
  if (riskLevel === "moderate") return "Modéré";
  if (riskLevel === "high") return "Élevé";
  return "Inconnu";
}

/**
 * AdditivesSection - List of additives with risk levels
 */
export function AdditivesSection({ additives, compact = false }: AdditivesSectionProps) {
  const hasAdditives = additives && additives.length > 0;
  const highRiskCount = additives?.filter((a) => a.riskLevel === "high").length ?? 0;
  const moderateRiskCount = additives?.filter((a) => a.riskLevel === "moderate").length ?? 0;
  const hasWarnings = highRiskCount > 0 || moderateRiskCount > 0;

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
                color={highRiskCount > 0 ? "danger" : moderateRiskCount > 0 ? "warning" : "success"}
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
                <div className="mb-3 p-3 bg-warning-50 border-l-4 border-warning rounded">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-warning mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-warning-700">
                        {highRiskCount > 0
                          ? `${highRiskCount} additif(s) à risque élevé`
                          : `${moderateRiskCount} additif(s) à risque modéré`}
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
                  {highRiskCount > 0 && (
                    <div className="p-3 bg-danger-50 border-l-4 border-danger rounded">
                      <p className="text-sm font-semibold text-danger-700 mb-1">
                        {highRiskCount} additif{highRiskCount > 1 ? "s" : ""} à risque élevé
                      </p>
                      <p className="text-xs text-danger-600">
                        Ces additifs peuvent présenter des risques pour certaines personnes. Consultez la
                        liste détaillée ci-dessous.
                      </p>
                    </div>
                  )}

                  {moderateRiskCount > 0 && (
                    <div className="p-3 bg-warning-50 border-l-4 border-warning rounded">
                      <p className="text-sm font-semibold text-warning-700 mb-1">
                        {moderateRiskCount} additif{moderateRiskCount > 1 ? "s" : ""} à risque modéré
                      </p>
                      <p className="text-xs text-warning-600">
                        Ces additifs nécessitent une consommation modérée.
                      </p>
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
                      additive.riskLevel === "high"
                        ? "bg-danger-50 border-danger"
                        : additive.riskLevel === "moderate"
                          ? "bg-warning-50 border-warning"
                          : additive.riskLevel === "low"
                            ? "bg-success-50 border-success"
                            : "bg-default-50 border-default"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-foreground-500">{additive.id}</span>
                          <Chip
                            size="sm"
                            variant="flat"
                            color={getRiskColor(additive.riskLevel || "unknown")}
                          >
                            {getRiskLabel(additive.riskLevel || "unknown")}
                          </Chip>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{additive.name}</p>
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
                    <div className="w-3 h-3 rounded bg-success mt-1" />
                    <div>
                      <p className="font-semibold text-success-700">Risque faible</p>
                      <p className="text-success-600">Généralement considérés comme sûrs</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-3 h-3 rounded bg-warning mt-1" />
                    <div>
                      <p className="font-semibold text-warning-700">Risque modéré</p>
                      <p className="text-warning-600">À consommer avec modération</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-3 h-3 rounded bg-danger mt-1" />
                    <div>
                      <p className="font-semibold text-danger-700">Risque élevé</p>
                      <p className="text-danger-600">
                        Peuvent présenter des risques pour certaines personnes
                      </p>
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
