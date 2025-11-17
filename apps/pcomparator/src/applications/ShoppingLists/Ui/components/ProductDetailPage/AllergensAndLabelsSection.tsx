import { Accordion, AccordionItem, Card, CardBody, Chip } from "@heroui/react";
import { AlertTriangle, Award, CheckCircle, Leaf, Recycle, ShieldCheck, Sparkles } from "lucide-react";

interface AllergensAndLabelsSectionProps {
  allergens?: string[];
  labels?: string[];
  compact?: boolean;
}

/**
 * Get icon for label type
 */
function getLabelIcon(label: string): React.ReactNode {
  const lowerLabel = label.toLowerCase();

  if (lowerLabel.includes("bio") || lowerLabel.includes("organic")) {
    return <Leaf size={14} />;
  }
  if (lowerLabel.includes("fair") || lowerLabel.includes("equitable")) {
    return <Award size={14} />;
  }
  if (lowerLabel.includes("eco") || lowerLabel.includes("green")) {
    return <Recycle size={14} />;
  }
  if (lowerLabel.includes("aop") || lowerLabel.includes("aoc") || lowerLabel.includes("label")) {
    return <ShieldCheck size={14} />;
  }

  return <Sparkles size={14} />;
}

/**
 * Format label name
 */
function formatLabel(label: string): string {
  return label.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Format allergen name
 */
function formatAllergen(allergen: string): string {
  return allergen.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * AllergensAndLabelsSection - Display allergens and product labels/certifications
 */
export function AllergensAndLabelsSection({
  allergens,
  labels,
  compact = false
}: AllergensAndLabelsSectionProps) {
  const hasAllergens = allergens && allergens.length > 0;
  const hasLabels = labels && labels.length > 0;

  if (compact) {
    return (
      <Card shadow="none" className="border border-gray-200">
        <CardBody>
          {/* Allergens */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-warning" />
                <h3 className="text-sm font-semibold text-foreground">Allergènes</h3>
              </div>
              {hasAllergens && (
                <Chip size="sm" variant="flat" color="warning">
                  {allergens.length}
                </Chip>
              )}
            </div>

            {!hasAllergens ? (
              <Chip size="sm" variant="flat" color="success" startContent={<CheckCircle size={14} />}>
                Aucun allergène déclaré
              </Chip>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allergens.map((allergen) => (
                  <Chip key={allergen} size="sm" variant="flat" color="warning">
                    {formatAllergen(allergen)}
                  </Chip>
                ))}
              </div>
            )}
          </div>

          {/* Labels */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Labels & certifications</h3>
              </div>
              {hasLabels && (
                <Chip size="sm" variant="flat" color="primary">
                  {labels.length}
                </Chip>
              )}
            </div>

            {!hasLabels ? (
              <p className="text-xs text-foreground-400">Aucun label ou certification</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {labels.slice(0, 4).map((label) => (
                  <Chip
                    key={label}
                    size="sm"
                    variant="flat"
                    color="primary"
                    startContent={getLabelIcon(label)}
                  >
                    {formatLabel(label)}
                  </Chip>
                ))}
                {labels.length > 4 && (
                  <Chip size="sm" variant="flat" color="default">
                    +{labels.length - 4} autres
                  </Chip>
                )}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    );
  }

  // Detailed view
  return (
    <Card shadow="none" className="border border-gray-200">
      <CardBody>
        <Accordion selectionMode="multiple" defaultExpandedKeys={hasAllergens ? ["allergens"] : []}>
          {/* Allergens */}
          <AccordionItem
            key="allergens"
            title={
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-warning" />
                <span className="font-semibold">Allergènes</span>
                {hasAllergens ? (
                  <Chip size="sm" variant="flat" color="warning">
                    {allergens.length}
                  </Chip>
                ) : (
                  <Chip size="sm" variant="flat" color="success" startContent={<CheckCircle size={12} />}>
                    Aucun
                  </Chip>
                )}
              </div>
            }
          >
            <div className="pb-4">
              {!hasAllergens ? (
                <div className="p-4 bg-success-50 rounded-lg text-center">
                  <CheckCircle size={24} className="text-success mx-auto mb-2" />
                  <p className="text-sm font-semibold text-success-700 mb-1">Aucun allergène déclaré</p>
                  <p className="text-xs text-success-600">
                    Ce produit ne contient aucun allergène majeur identifié
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-3 bg-warning-50 border-l-4 border-warning rounded">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-warning mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-warning-700 mb-1">Attention aux allergies</p>
                        <p className="text-xs text-warning-600">
                          Ce produit contient ou peut contenir des traces de {allergens.length} allergène
                          {allergens.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {allergens.map((allergen) => (
                      <div key={allergen} className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={14} className="text-warning" />
                          <span className="text-sm font-semibold text-foreground">
                            {formatAllergen(allergen)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </AccordionItem>

          {/* Labels */}
          <AccordionItem
            key="labels"
            title={
              <div className="flex items-center gap-2">
                <Award size={16} className="text-primary" />
                <span className="font-semibold">Labels & certifications</span>
                {hasLabels && (
                  <Chip size="sm" variant="flat" color="primary">
                    {labels.length}
                  </Chip>
                )}
              </div>
            }
          >
            <div className="pb-4">
              {!hasLabels ? (
                <div className="p-4 bg-default-50 rounded-lg text-center">
                  <p className="text-sm text-foreground-500">Aucun label ou certification pour ce produit</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {labels.map((label) => (
                    <div key={label} className="p-3 bg-primary-50 border-l-4 border-primary rounded-lg">
                      <div className="flex items-center gap-2">
                        {getLabelIcon(label)}
                        <span className="text-sm font-semibold text-foreground">{formatLabel(label)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AccordionItem>

          {/* Info section */}
          <AccordionItem
            key="info"
            title={
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} />
                <span className="font-semibold">À propos des labels</span>
              </div>
            }
          >
            <div className="space-y-3 pb-4 text-xs text-foreground-600">
              <p>
                Les labels et certifications garantissent le respect de certains critères de qualité,
                d'origine ou de production.
              </p>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Leaf size={14} className="text-success mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">Labels biologiques</p>
                    <p>Agriculture sans pesticides ni engrais chimiques</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Award size={14} className="text-primary mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">Commerce équitable</p>
                    <p>Rémunération juste des producteurs</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <ShieldCheck size={14} className="text-primary mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">Labels officiels (AOP, AOC, Label Rouge)</p>
                    <p>Garantie d'origine et de qualité contrôlée</p>
                  </div>
                </div>
              </div>
            </div>
          </AccordionItem>
        </Accordion>
      </CardBody>
    </Card>
  );
}
