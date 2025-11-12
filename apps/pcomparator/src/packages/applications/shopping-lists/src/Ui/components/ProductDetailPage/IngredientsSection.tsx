import { Accordion, AccordionItem, Card, CardBody, Chip } from "@heroui/react";
import { AlertTriangle, List, Palmtree } from "lucide-react";
import type { ProductQualityData } from "../../../Domain/ValueObjects/ProductQuality.vo";

interface IngredientsSectionProps {
  ingredients?: ProductQualityData["ingredients"];
  compact?: boolean;
}

/**
 * IngredientsSection - Display ingredients list with indicators
 */
export function IngredientsSection({ ingredients, compact = false }: IngredientsSectionProps) {
  const hasIngredients = ingredients?.text && ingredients.text.length > 0;
  const ingredientCount = ingredients?.count ?? 0;
  const hasAllergens = ingredients?.hasAllergens ?? false;
  const hasPalmOil = ingredients?.hasPalmOil ?? false;

  if (compact) {
    return (
      <Card shadow="none" className="border border-gray-200">
        <CardBody>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <List size={20} className="text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Ingrédients</h2>
            </div>

            {ingredientCount > 0 && (
              <Chip size="sm" variant="flat" color="default">
                {ingredientCount} ingrédient{ingredientCount > 1 ? "s" : ""}
              </Chip>
            )}
          </div>

          {!hasIngredients ? (
            <p className="text-sm text-foreground-400">Liste d'ingrédients non disponible</p>
          ) : (
            <>
              {/* Indicators */}
              <div className="flex flex-wrap gap-2 mb-3">
                {hasAllergens && (
                  <Chip size="sm" variant="flat" color="warning" startContent={<AlertTriangle size={14} />}>
                    Contient des allergènes
                  </Chip>
                )}
                {hasPalmOil && (
                  <Chip size="sm" variant="flat" color="warning" startContent={<Palmtree size={14} />}>
                    Huile de palme
                  </Chip>
                )}
                {!hasAllergens && !hasPalmOil && (
                  <Chip size="sm" variant="flat" color="success">
                    Sans allergènes ni huile de palme
                  </Chip>
                )}
              </div>

              {/* Ingredients text (truncated) */}
              <p className="text-sm text-foreground line-clamp-3">{ingredients.text}</p>
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
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <List size={20} className="text-primary" />
              Ingrédients
            </h2>
          </div>

          {ingredientCount > 0 && (
            <Chip size="sm" variant="flat" color="default">
              {ingredientCount} ingrédient{ingredientCount > 1 ? "s" : ""}
            </Chip>
          )}
        </div>

        {!hasIngredients ? (
          <div className="p-6 bg-default-50 rounded-lg text-center">
            <List size={32} className="text-foreground-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground-500 mb-1">
              Liste d'ingrédients non disponible
            </p>
            <p className="text-xs text-foreground-400">
              Les informations sur les ingrédients ne sont pas encore renseignées pour ce produit
            </p>
          </div>
        ) : (
          <Accordion selectionMode="multiple" defaultExpandedKeys={["list"]}>
            {/* Indicators */}
            <AccordionItem
              key="indicators"
              title={
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Indicateurs</span>
                </div>
              }
            >
              <div className="space-y-3 pb-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* Allergens indicator */}
                  <div
                    className={`p-3 rounded-lg border-l-4 ${
                      hasAllergens ? "bg-warning-50 border-warning" : "bg-success-50 border-success"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle size={14} className={hasAllergens ? "text-warning" : "text-success"} />
                      <span className="text-xs font-semibold text-foreground">Allergènes</span>
                    </div>
                    <p className={`text-xs ${hasAllergens ? "text-warning-700" : "text-success-700"}`}>
                      {hasAllergens ? "Contient des allergènes" : "Sans allergènes déclarés"}
                    </p>
                  </div>

                  {/* Palm oil indicator */}
                  <div
                    className={`p-3 rounded-lg border-l-4 ${
                      hasPalmOil ? "bg-warning-50 border-warning" : "bg-success-50 border-success"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Palmtree size={14} className={hasPalmOil ? "text-warning" : "text-success"} />
                      <span className="text-xs font-semibold text-foreground">Huile de palme</span>
                    </div>
                    <p className={`text-xs ${hasPalmOil ? "text-warning-700" : "text-success-700"}`}>
                      {hasPalmOil ? "Contient de l'huile de palme" : "Sans huile de palme"}
                    </p>
                  </div>
                </div>

                {ingredientCount > 0 && (
                  <div className="p-3 bg-default-50 rounded-lg">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{ingredientCount}</span> ingrédient
                      {ingredientCount > 1 ? "s" : ""} dans ce produit
                    </p>
                  </div>
                )}
              </div>
            </AccordionItem>

            {/* Complete list */}
            <AccordionItem
              key="list"
              title={
                <div className="flex items-center gap-2">
                  <List size={16} />
                  <span className="font-semibold">Liste complète</span>
                </div>
              }
            >
              <div className="pb-4">
                <div className="p-4 bg-default-50 rounded-lg">
                  <p className="text-sm text-foreground leading-relaxed">{ingredients.text}</p>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <p className="text-xs text-blue-700">
                    <strong>Note :</strong> Les ingrédients sont classés par ordre décroissant de quantité. Le
                    premier ingrédient est celui présent en plus grande quantité.
                  </p>
                </div>
              </div>
            </AccordionItem>

            {/* Info section */}
            <AccordionItem
              key="info"
              title={
                <div className="flex items-center gap-2">
                  <span className="font-semibold">À propos des ingrédients</span>
                </div>
              }
            >
              <div className="space-y-3 pb-4 text-xs text-foreground-600">
                <p>La liste des ingrédients est fournie telle qu'elle apparaît sur l'emballage du produit.</p>

                <div className="space-y-2">
                  <div className="p-2 bg-warning-50 rounded">
                    <p className="font-semibold text-warning-700 mb-1">Huile de palme</p>
                    <p className="text-warning-600">
                      L'huile de palme peut avoir un impact environnemental négatif. Privilégiez les produits
                      sans huile de palme ou avec de l'huile de palme certifiée durable.
                    </p>
                  </div>

                  <div className="p-2 bg-blue-50 rounded">
                    <p className="font-semibold text-blue-700 mb-1">Nombre d'ingrédients</p>
                    <p className="text-blue-600">
                      En général, moins un produit contient d'ingrédients, plus il est simple et peu
                      transformé. Un grand nombre d'ingrédients peut indiquer un produit ultra-transformé.
                    </p>
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
