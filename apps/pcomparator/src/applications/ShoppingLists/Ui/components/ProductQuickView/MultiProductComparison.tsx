"use client";

import { Button, Card, CardBody, Chip, Divider } from "@heroui/react";
import {
  AlertTriangleIcon,
  AwardIcon,
  DollarSignIcon,
  FlaskConicalIcon,
  LeafIcon,
  XIcon
} from "lucide-react";
import { useState } from "react";
import { Modal } from "~/components/Modal/Modal";
import type { ProductQualityData } from "../../../Domain/ValueObjects/ProductQuality.vo";

interface ProductForComparison {
  id: string;
  name: string;
  brand?: { name: string } | null;
  qualityData: ProductQualityData | null;
  lowestPrice?: number | null;
  averagePrice?: number | null;
  priceCount?: number;
}

interface MultiProductComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductForComparison[];
  onRemoveProduct: (productId: string) => void;
  onViewDetails: (productId: string) => void;
}

export const MultiProductComparison = ({
  isOpen,
  onClose,
  products,
  onRemoveProduct,
  onViewDetails
}: MultiProductComparisonProps) => {
  const [comparisonMode, setComparisonMode] = useState<"simple" | "detailed">("simple");

  const calculateScore = (product: ProductForComparison): number => {
    let score = 0;
    let totalWeight = 0;

    // Prix (40%)
    if (product.lowestPrice !== undefined && product.lowestPrice !== null) {
      const priceScore = Math.max(0, 100 - product.lowestPrice * 10);
      score += priceScore * 0.4;
      totalWeight += 0.4;
    }

    // Qualité (40%)
    if (product.qualityData?.overallQualityScore) {
      score += product.qualityData.overallQualityScore * 0.4;
      totalWeight += 0.4;
    }

    // Disponibilité (20%)
    if (product.priceCount !== undefined) {
      const availabilityScore = Math.min(100, product.priceCount * 25);
      score += availabilityScore * 0.2;
      totalWeight += 0.2;
    }

    return totalWeight > 0 ? score / totalWeight : 50;
  };

  const sortedProducts = [...products].sort((a, b) => calculateScore(b) - calculateScore(a));
  const bestProduct = sortedProducts[0];

  const ComparisonRow = ({ label, icon, getValue }: any) => (
    <div className="grid grid-cols-[120px_1fr] gap-2 py-2">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {icon}
        <span>{label}</span>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${products.length}, 1fr)` }}>
        {sortedProducts.map((product) => (
          <div key={product.id} className="text-sm text-center">
            {getValue(product)}
          </div>
        ))}
      </div>
    </div>
  );

  const headerContent = (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-bold">Comparaison ({products.length} produits)</h2>
      <Button isIconOnly variant="light" size="sm" onPress={onClose}>
        <XIcon className="h-4 w-4" />
      </Button>
    </div>
  );

  const bodyContent = (
    <div className="space-y-4">
      {/* En-têtes des produits */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${products.length}, 1fr)` }}>
        {sortedProducts.map((product, index) => {
          const score = calculateScore(product);
          const isBest = product.id === bestProduct?.id;

          return (
            <Card
              key={product.id}
              shadow="none"
              className={`border ${isBest ? "border-success-500 bg-success-50" : "border-gray-200"}`}
            >
              <CardBody className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-1">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => onRemoveProduct(product.id)}
                    className="min-w-0 h-6 w-6"
                  >
                    <XIcon className="h-3 w-3" />
                  </Button>
                </div>

                <div>
                  <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                  {product.brand && <p className="text-xs text-gray-500">{product.brand.name}</p>}
                </div>

                <Chip
                  size="lg"
                  color={score >= 70 ? "success" : score >= 50 ? "warning" : "default"}
                  variant="flat"
                  className="w-full justify-center font-semibold"
                >
                  {Math.round(score)}/100
                </Chip>

                {isBest && (
                  <Chip size="sm" color="success" variant="solid" className="w-full justify-center">
                    🏆 Recommandé
                  </Chip>
                )}

                <Button
                  size="sm"
                  variant="light"
                  onPress={() => onViewDetails(product.id)}
                  className="w-full text-xs"
                >
                  Voir détails
                </Button>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <Divider />

      {/* Mode de comparaison */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={comparisonMode === "simple" ? "solid" : "flat"}
          onPress={() => setComparisonMode("simple")}
        >
          Vue simple
        </Button>
        <Button
          size="sm"
          variant={comparisonMode === "detailed" ? "solid" : "flat"}
          onPress={() => setComparisonMode("detailed")}
        >
          Vue détaillée
        </Button>
      </div>

      {/* Comparaison simple */}
      {comparisonMode === "simple" && (
        <div className="space-y-1">
          <ComparisonRow
            label="Prix"
            icon={<DollarSignIcon className="h-4 w-4" />}
            getValue={(p: ProductForComparison) =>
              p.lowestPrice ? (
                <span className="font-semibold">{p.lowestPrice.toFixed(2)}€</span>
              ) : (
                <span className="text-gray-400">N/A</span>
              )
            }
          />
          <Divider />
          <ComparisonRow
            label="Qualité"
            icon={<LeafIcon className="h-4 w-4" />}
            getValue={(p: ProductForComparison) =>
              p.qualityData?.overallQualityScore ? (
                <span className="font-semibold">{Math.round(p.qualityData.overallQualityScore)}/100</span>
              ) : (
                <span className="text-gray-400">N/A</span>
              )
            }
          />
          <Divider />
          <ComparisonRow
            label="Nutri-Score"
            icon={<span>🍎</span>}
            getValue={(p: ProductForComparison) => (
              <Chip size="sm" variant="flat">
                {p.qualityData?.nutriScore?.grade || "?"}
              </Chip>
            )}
          />
          <Divider />
          <ComparisonRow
            label="Eco-Score"
            icon={<span>🌍</span>}
            getValue={(p: ProductForComparison) => (
              <Chip size="sm" variant="flat">
                {p.qualityData?.ecoScore?.grade || "?"}
              </Chip>
            )}
          />
          <Divider />
          <ComparisonRow
            label="Nova"
            icon={<span>🔬</span>}
            getValue={(p: ProductForComparison) => (
              <Chip size="sm" variant="flat">
                {p.qualityData?.novaGroup?.group || "?"}
              </Chip>
            )}
          />
        </div>
      )}

      {/* Comparaison détaillée */}
      {comparisonMode === "detailed" && (
        <div className="space-y-1">
          <ComparisonRow
            label="Prix"
            icon={<DollarSignIcon className="h-4 w-4" />}
            getValue={(p: ProductForComparison) =>
              p.lowestPrice ? (
                <span className="font-semibold">{p.lowestPrice.toFixed(2)}€</span>
              ) : (
                <span className="text-gray-400">N/A</span>
              )
            }
          />
          <Divider />
          <ComparisonRow
            label="Qualité"
            icon={<LeafIcon className="h-4 w-4" />}
            getValue={(p: ProductForComparison) =>
              p.qualityData?.overallQualityScore ? (
                <span className="font-semibold">{Math.round(p.qualityData.overallQualityScore)}/100</span>
              ) : (
                <span className="text-gray-400">N/A</span>
              )
            }
          />
          <Divider />
          <ComparisonRow
            label="Nutri-Score"
            icon={<span>🍎</span>}
            getValue={(p: ProductForComparison) => (
              <Chip size="sm" variant="flat">
                {p.qualityData?.nutriScore?.grade || "?"}
              </Chip>
            )}
          />
          <Divider />
          <ComparisonRow
            label="Eco-Score"
            icon={<span>🌍</span>}
            getValue={(p: ProductForComparison) => (
              <Chip size="sm" variant="flat">
                {p.qualityData?.ecoScore?.grade || "?"}
              </Chip>
            )}
          />
          <Divider />
          <ComparisonRow
            label="Nova"
            icon={<span>🔬</span>}
            getValue={(p: ProductForComparison) => (
              <Chip size="sm" variant="flat">
                {p.qualityData?.novaGroup?.group || "?"}
              </Chip>
            )}
          />
          <Divider />
          <ComparisonRow
            label="Additifs"
            icon={<FlaskConicalIcon className="h-4 w-4" />}
            getValue={(p: ProductForComparison) => {
              const count = p.qualityData?.additives?.length || 0;
              const hasHigh = p.qualityData?.additives?.some((a) => a.riskLevel === "high_risk");
              return (
                <Chip
                  size="sm"
                  color={count === 0 ? "success" : hasHigh ? "danger" : "warning"}
                  variant="flat"
                >
                  {count}
                </Chip>
              );
            }}
          />
          <Divider />
          <ComparisonRow
            label="Allergènes"
            icon={<AlertTriangleIcon className="h-4 w-4" />}
            getValue={(p: ProductForComparison) => {
              const count = p.qualityData?.allergens?.length || 0;
              return (
                <Chip size="sm" color={count > 0 ? "warning" : "success"} variant="flat">
                  {count}
                </Chip>
              );
            }}
          />
          <Divider />
          <ComparisonRow
            label="Labels"
            icon={<AwardIcon className="h-4 w-4" />}
            getValue={(p: ProductForComparison) => {
              const count = p.qualityData?.labels?.length || 0;
              return (
                <Chip size="sm" color={count > 0 ? "success" : "default"} variant="flat">
                  {count}
                </Chip>
              );
            }}
          />
        </div>
      )}

      <Divider />

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button color="primary" onPress={onClose}>
          Fermer la comparaison
        </Button>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} header={headerContent} body={bodyContent} sheetHeight="lg" />
  );
};

// Hook pour gérer la sélection de produits
export const useProductSelection = (maxProducts = 3) => {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else if (newSet.size < maxProducts) {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const isSelected = (productId: string) => selectedProducts.has(productId);

  const canSelectMore = selectedProducts.size < maxProducts;

  const clearSelection = () => setSelectedProducts(new Set());

  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  return {
    selectedProducts: Array.from(selectedProducts),
    toggleProduct,
    isSelected,
    canSelectMore,
    clearSelection,
    removeProduct,
    selectedCount: selectedProducts.size
  };
};
