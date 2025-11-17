import { Accordion, AccordionItem, Card, CardBody, Chip, Progress } from "@heroui/react";
import { Activity, AlertTriangle, Flame, Salad } from "lucide-react";
import type { ProductQualityData } from "../../../Domain/ValueObjects/ProductQuality.vo";

interface NutritionSectionProps {
  nutriments?: ProductQualityData["nutriments"];
  compact?: boolean;
}

type NutrientLevel = "low" | "moderate" | "high";

/**
 * Determine nutrient level based on thresholds (per 100g)
 */
function getNutrientLevel(value: number, type: "sugar" | "salt" | "fat"): NutrientLevel {
  if (type === "sugar") {
    if (value < 5) return "low";
    if (value < 22.5) return "moderate";
    return "high";
  }
  if (type === "salt") {
    if (value < 0.3) return "low";
    if (value < 1.5) return "moderate";
    return "high";
  }
  if (type === "fat") {
    if (value < 3) return "low";
    if (value < 17.5) return "moderate";
    return "high";
  }
  return "moderate";
}

/**
 * Get color based on nutrient level
 */
function getLevelColor(level: NutrientLevel): "success" | "warning" | "danger" {
  if (level === "low") return "success";
  if (level === "moderate") return "warning";
  return "danger";
}

/**
 * Get level label in French
 */
function getLevelLabel(level: NutrientLevel): string {
  if (level === "low") return "Faible";
  if (level === "moderate") return "Modéré";
  return "Élevé";
}

/**
 * Nutrient row component
 */
function NutrientRow({
  label,
  value,
  unit = "g",
  level,
  icon
}: {
  label: string;
  value: number;
  unit?: string;
  level?: NutrientLevel;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-divider last:border-0">
      <div className="flex items-center gap-2">
        {icon && <span className="text-foreground-400">{icon}</span>}
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">
          {value.toFixed(1)} {unit}
        </span>
        {level && (
          <Chip size="sm" variant="flat" color={getLevelColor(level)}>
            {getLevelLabel(level)}
          </Chip>
        )}
      </div>
    </div>
  );
}

/**
 * NutritionSection - Complete nutritional table with visual indicators
 */
export function NutritionSection({ nutriments, compact = false }: NutritionSectionProps) {
  if (!nutriments) {
    return (
      <Card className="p-4 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Salad size={20} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Informations nutritionnelles</h2>
        </div>
        <div className="text-center py-8 text-foreground-400">
          <p className="text-sm">Aucune donnée nutritionnelle disponible</p>
        </div>
      </Card>
    );
  }

  const { energyKcal, energyKj, fat, saturatedFat, carbohydrates, sugars, fiber, proteins, salt, sodium } =
    nutriments;

  // Calculate levels for key nutrients
  const sugarLevel = sugars !== undefined ? getNutrientLevel(sugars, "sugar") : undefined;
  const saltLevel = salt !== undefined ? getNutrientLevel(salt, "salt") : undefined;
  const fatLevel = fat !== undefined ? getNutrientLevel(fat, "fat") : undefined;

  // Calculate percentage of daily intake (based on 2000 kcal diet)
  const energyPercentage = energyKcal ? (energyKcal / 2000) * 100 : 0;

  if (compact) {
    return (
      <Card shadow="none" className="border border-gray-200">
        <CardBody>
          <div className="flex items-center gap-2 mb-3">
            <Salad size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Nutrition (pour 100g)</h2>
          </div>

          {/* Energy with progress bar */}
          {energyKcal !== undefined && (
            <div className="mb-4 p-3 bg-default-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Flame size={16} className="text-orange-500" />
                  <span className="text-sm font-semibold">Énergie</span>
                </div>
                <span className="text-sm font-bold">{energyKcal} kcal</span>
              </div>
              <Progress
                value={Math.min(energyPercentage, 100)}
                color={energyPercentage > 20 ? "warning" : "success"}
                size="sm"
                className="w-full"
              />
              <p className="text-xs text-foreground-400 mt-1">
                {energyPercentage.toFixed(1)}% de l'apport journalier (2000 kcal)
              </p>
            </div>
          )}

          {/* Key nutrients grid */}
          <div className="grid grid-cols-2 gap-3">
            {fat !== undefined && (
              <div className="p-3 bg-default-50 rounded-lg">
                <p className="text-xs text-foreground-500 mb-1">Matières grasses</p>
                <p className="text-lg font-bold text-foreground">{fat.toFixed(1)}g</p>
                {fatLevel && (
                  <Chip size="sm" variant="flat" color={getLevelColor(fatLevel)} className="mt-1">
                    {getLevelLabel(fatLevel)}
                  </Chip>
                )}
              </div>
            )}

            {sugars !== undefined && (
              <div className="p-3 bg-default-50 rounded-lg">
                <p className="text-xs text-foreground-500 mb-1">Sucres</p>
                <p className="text-lg font-bold text-foreground">{sugars.toFixed(1)}g</p>
                {sugarLevel && (
                  <Chip size="sm" variant="flat" color={getLevelColor(sugarLevel)} className="mt-1">
                    {getLevelLabel(sugarLevel)}
                  </Chip>
                )}
              </div>
            )}

            {salt !== undefined && (
              <div className="p-3 bg-default-50 rounded-lg">
                <p className="text-xs text-foreground-500 mb-1">Sel</p>
                <p className="text-lg font-bold text-foreground">{salt.toFixed(1)}g</p>
                {saltLevel && (
                  <Chip size="sm" variant="flat" color={getLevelColor(saltLevel)} className="mt-1">
                    {getLevelLabel(saltLevel)}
                  </Chip>
                )}
              </div>
            )}

            {proteins !== undefined && (
              <div className="p-3 bg-default-50 rounded-lg">
                <p className="text-xs text-foreground-500 mb-1">Protéines</p>
                <p className="text-lg font-bold text-foreground">{proteins.toFixed(1)}g</p>
                <Chip size="sm" variant="flat" color="primary" className="mt-1">
                  Bon
                </Chip>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    );
  }

  // Detailed view with full table
  return (
    <Card shadow="none" className="border border-gray-200">
      <CardBody>
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Salad size={20} className="text-primary" /> Informations nutritionnelles
        </h2>

        <Accordion selectionMode="multiple" defaultExpandedKeys={["main"]}>
          {/* Main nutrients */}
          <AccordionItem
            key="main"
            title={
              <div className="flex items-center gap-2">
                <Activity size={16} />
                <span className="font-semibold">Valeurs nutritionnelles pour 100g</span>
              </div>
            }
          >
            <div className="space-y-4 pb-4">
              {/* Energy */}
              {energyKcal !== undefined && (
                <div className="p-3 bg-default-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Flame size={18} className="text-orange-500" />
                      <span className="text-sm font-semibold">Énergie</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{energyKcal} kcal</p>
                      {energyKj !== undefined && <p className="text-xs text-foreground-400">{energyKj} kJ</p>}
                    </div>
                  </div>
                  <Progress
                    value={Math.min(energyPercentage, 100)}
                    color={energyPercentage > 20 ? "warning" : "success"}
                    size="md"
                    showValueLabel
                    className="w-full"
                  />
                  <p className="text-xs text-foreground-400 mt-2 text-center">
                    {energyPercentage.toFixed(1)}% de l'apport journalier recommandé (2000 kcal)
                  </p>
                </div>
              )}

              {/* Nutrients table */}
              <div className="bg-default-50 rounded-lg p-3">
                {fat !== undefined && <NutrientRow label="Matières grasses" value={fat} level={fatLevel} />}

                {saturatedFat !== undefined && (
                  <NutrientRow
                    label="  dont acides gras saturés"
                    value={saturatedFat}
                    level={saturatedFat > 5 ? "high" : saturatedFat > 1.5 ? "moderate" : "low"}
                  />
                )}

                {carbohydrates !== undefined && <NutrientRow label="Glucides" value={carbohydrates} />}

                {sugars !== undefined && (
                  <NutrientRow label="  dont sucres" value={sugars} level={sugarLevel} />
                )}

                {fiber !== undefined && (
                  <NutrientRow
                    label="Fibres alimentaires"
                    value={fiber}
                    level={fiber >= 3 ? "low" : "moderate"}
                  />
                )}

                {proteins !== undefined && <NutrientRow label="Protéines" value={proteins} />}

                {salt !== undefined && <NutrientRow label="Sel" value={salt} level={saltLevel} />}

                {sodium !== undefined && salt === undefined && (
                  <NutrientRow label="Sodium" value={sodium} unit="mg" />
                )}
              </div>

              {/* Health warnings for key nutrients */}
              {(sugarLevel === "high" || saltLevel === "high" || fatLevel === "high") && (
                <div className="p-3 bg-warning-50 border-l-4 border-warning rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-warning mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-warning-700 mb-1">
                        Attention aux quantités élevées
                      </p>
                      <ul className="text-xs text-warning-600 space-y-1 list-disc list-inside">
                        {sugarLevel === "high" && <li>Teneur élevée en sucres</li>}
                        {saltLevel === "high" && <li>Teneur élevée en sel</li>}
                        {fatLevel === "high" && <li>Teneur élevée en matières grasses</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AccordionItem>
        </Accordion>
      </CardBody>
    </Card>
  );
}
