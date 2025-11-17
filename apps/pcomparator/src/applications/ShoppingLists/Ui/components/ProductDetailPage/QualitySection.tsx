import { Accordion, AccordionItem, Card, CardBody, Chip, Progress } from "@heroui/react";
import { AlertTriangle, Award, Leaf, TrendingDown } from "lucide-react";
import type { ProductQualityData } from "../../../Domain/ValueObjects/ProductQuality.vo";

interface QualitySectionProps {
  qualityData: ProductQualityData;
  compact?: boolean;
}

/**
 * Get color based on score
 */
function getScoreColor(score: number): "success" | "warning" | "danger" {
  if (score >= 70) return "success";
  if (score >= 50) return "warning";
  return "danger";
}

/**
 * Get grade color
 */
function getGradeColor(grade: string): "success" | "warning" | "danger" | "default" {
  if (grade === "A") return "success";
  if (grade === "B") return "success";
  if (grade === "C") return "warning";
  if (grade === "D") return "danger";
  if (grade === "E") return "danger";
  return "default";
}

/**
 * QualitySection - Overall quality, NutriScore, EcoScore, Nova, health warnings
 */
export function QualitySection({ qualityData, compact = false }: QualitySectionProps) {
  const overallScore = qualityData.overallQualityScore ?? 50;
  const hasWarnings =
    qualityData.healthWarnings?.hasSugar ||
    qualityData.healthWarnings?.hasSalt ||
    qualityData.healthWarnings?.hasSaturatedFat;

  if (compact) {
    return (
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Award className="h-4 w-4" />
          Scores de qualité
        </h3>

        {/* Quick Scores Row */}
        <div className="flex flex-wrap gap-2">
          {qualityData.nutriScore?.grade && qualityData.nutriScore.grade !== "unknown" && (
            <Chip
              size="md"
              variant="flat"
              color={getGradeColor(qualityData.nutriScore.grade)}
              startContent={<Leaf className="h-3 w-3" />}
            >
              Nutri-Score {qualityData.nutriScore.grade}
            </Chip>
          )}

          {qualityData.ecoScore?.grade && qualityData.ecoScore.grade !== "unknown" && (
            <Chip
              size="md"
              variant="flat"
              color={getGradeColor(qualityData.ecoScore.grade)}
              startContent={<Leaf className="h-3 w-3" />}
            >
              Eco-Score {qualityData.ecoScore.grade}
            </Chip>
          )}

          {qualityData.novaGroup?.group && (
            <Chip
              size="md"
              variant="flat"
              color={
                qualityData.novaGroup.group <= 2
                  ? "success"
                  : qualityData.novaGroup.group === 3
                    ? "warning"
                    : "danger"
              }
              startContent={<AlertTriangle className="h-3 w-3" />}
            >
              Nova Group {qualityData.novaGroup.group}
            </Chip>
          )}
        </div>

        {/* Explanations */}
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
      </section>
    );
  }

  // Detailed view with accordion
  return (
    <Card shadow="none" className="border border-gray-200">
      <CardBody>
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Award size={20} className="text-primary" />
          Qualité et nutrition
        </h2>

        <Accordion selectionMode="multiple" defaultExpandedKeys={["overall"]}>
          <AccordionItem
            key="overall"
            title={
              <div className="flex items-center justify-between w-full pr-2">
                <span className="font-semibold">Score global</span>
                <Chip size="sm" variant="solid" color={getScoreColor(overallScore)}>
                  {Math.round(overallScore)}/100
                </Chip>
              </div>
            }
          >
            <div className="space-y-4 pb-4">
              <Progress
                value={overallScore}
                color={getScoreColor(overallScore)}
                size="lg"
                showValueLabel
                className="w-full"
              />

              <div className="grid grid-cols-3 gap-4">
                {qualityData.nutriScore && (
                  <div className="text-center p-3 bg-default-100 rounded-lg">
                    <Chip
                      size="lg"
                      variant="solid"
                      color={
                        qualityData.nutriScore.grade ? getGradeColor(qualityData.nutriScore.grade) : "default"
                      }
                      className="font-bold mb-2"
                    >
                      {qualityData.nutriScore.grade || "?"}
                    </Chip>
                    <p className="text-xs text-foreground-600 font-medium">NutriScore</p>
                    {qualityData.nutriScore.score && (
                      <p className="text-xs text-foreground-400 mt-1">
                        {Math.round(qualityData.nutriScore.score)}/100
                      </p>
                    )}
                  </div>
                )}

                {qualityData.ecoScore && (
                  <div className="text-center p-3 bg-default-100 rounded-lg">
                    <Chip
                      size="lg"
                      variant="solid"
                      color={
                        qualityData.ecoScore.grade ? getGradeColor(qualityData.ecoScore.grade) : "default"
                      }
                      classNames={{ content: "flex items-center" }}
                      className="font-bold mb-2"
                    >
                      <Leaf size={14} className="mr-1" />
                      {qualityData.ecoScore.grade || "?"}
                    </Chip>
                    <p className="text-xs text-foreground-600 font-medium">EcoScore</p>
                    {qualityData.ecoScore.score && (
                      <p className="text-xs text-foreground-400 mt-1">
                        {Math.round(qualityData.ecoScore.score)}/100
                      </p>
                    )}
                  </div>
                )}

                {qualityData.novaGroup && (
                  <div className="text-center p-3 bg-default-100 self-center justify-self-center items-center rounded-lg">
                    <Chip
                      size="lg"
                      variant="solid"
                      color={
                        qualityData.novaGroup.group
                          ? qualityData.novaGroup.group <= 2
                            ? "success"
                            : qualityData.novaGroup.group === 3
                              ? "warning"
                              : "danger"
                          : "default"
                      }
                      classNames={{ content: "flex items-center" }}
                      className="font-bold mb-2"
                    >
                      <TrendingDown size={14} className="mr-1" />
                      {qualityData.novaGroup.group || "?"}
                    </Chip>
                    <p className="text-xs text-foreground-600 font-medium">Nova Group</p>
                    {qualityData.novaGroup.score && (
                      <p className="text-xs text-foreground-400 mt-1">
                        {Math.round(qualityData.novaGroup.score)}/100
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="text-xs text-foreground-400 space-y-1 mt-4 p-3 bg-default-50 rounded-lg">
                <p>
                  <strong>NutriScore</strong> : Qualité nutritionnelle (A=excellent, E=pauvre)
                </p>
                <p>
                  <strong>EcoScore</strong> : Impact environnemental (A=faible, E=fort)
                </p>
                <p>
                  <strong>Nova</strong> : Niveau de transformation (1=brut, 4=ultra-transformé)
                </p>
              </div>
            </div>
          </AccordionItem>

          {/* Health Warnings */}
          {hasWarnings ? (
            <AccordionItem
              key="warnings"
              title={
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-warning" />
                  <span className="font-semibold">Avertissements santé</span>
                  <Chip size="sm" variant="flat" color="warning">
                    {
                      [
                        qualityData.healthWarnings?.hasSugar,
                        qualityData.healthWarnings?.hasSalt,
                        qualityData.healthWarnings?.hasSaturatedFat
                      ].filter(Boolean).length
                    }
                  </Chip>
                </div>
              }
            >
              <div className="space-y-3 pb-4">
                {qualityData.healthWarnings?.hasSugar && (
                  <div className="p-3 bg-warning-50 border-l-4 border-warning rounded">
                    <p className="text-sm font-semibold text-warning-700">Riche en sucres</p>
                    <p className="text-xs text-warning-600 mt-1">
                      Ce produit contient plus de 15g de sucres pour 100g. Une consommation excessive peut
                      entraîner des problèmes de santé.
                    </p>
                  </div>
                )}

                {qualityData.healthWarnings?.hasSalt && (
                  <div className="p-3 bg-warning-50 border-l-4 border-warning rounded">
                    <p className="text-sm font-semibold text-warning-700">Riche en sel</p>
                    <p className="text-xs text-warning-600 mt-1">
                      Ce produit contient plus de 1.5g de sel pour 100g. Une consommation excessive peut
                      augmenter la pression artérielle.
                    </p>
                  </div>
                )}

                {qualityData.healthWarnings?.hasSaturatedFat && (
                  <div className="p-3 bg-warning-50 border-l-4 border-warning rounded">
                    <p className="text-sm font-semibold text-warning-700">Riche en graisses saturées</p>
                    <p className="text-xs text-warning-600 mt-1">
                      Ce produit contient plus de 5g de graisses saturées pour 100g. Limitez votre
                      consommation pour protéger votre cœur.
                    </p>
                  </div>
                )}
              </div>
            </AccordionItem>
          ) : null}
        </Accordion>
      </CardBody>
    </Card>
  );
}
