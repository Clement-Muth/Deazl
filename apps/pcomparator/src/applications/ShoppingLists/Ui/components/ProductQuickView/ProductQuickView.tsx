"use client";

import { Button, Chip, Divider, Spinner } from "@heroui/react";
import {
  CheckCircleIcon,
  ExternalLinkIcon,
  FlaskConicalIcon,
  PackageIcon,
  StoreIcon,
  TrendingUpIcon
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Modal } from "~/components/Modal/Modal";
import { getProductWithPricesAndQuality } from "../../../Api/products/getProductWithPricesAndQuality.api";
import type { ProductQualityData } from "../../../Domain/ValueObjects/ProductQuality.vo";
import { ProductDetailPage } from "../ProductDetailPage";
import { EmptyState } from "./EmptyState";
import { ProductComparison } from "./ProductComparison";

interface ProductQuickViewProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (productId: string) => void;
}

interface ProductData {
  id: string;
  name: string;
  barcode: string;
  description: string | null;
  brand: { id: string; name: string } | null;
  category: { id: string; name: string } | null;
  qualityData: ProductQualityData | null;
  isOpenFoodFacts: boolean;
  prices: Array<{
    id: string;
    amount: number;
    currency: string;
    unit: string;
    dateRecorded: Date;
    store: {
      id: string;
      name: string;
      location: string;
    };
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export const ProductQuickView = ({ productId, isOpen, onClose, onSelectProduct }: ProductQuickViewProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && productId) {
      loadProduct();
    }
  }, [isOpen, productId]);

  const loadProduct = async () => {
    setLoading(true);
    setError(null);
    const result = await getProductWithPricesAndQuality(productId);

    if (result.success && result.product) {
      setProduct(result.product as ProductData);
    } else {
      setError(result.error || "Failed to load product");
    }
    setLoading(false);
  };

  const handleViewFullDetails = () => {
    setShowFullDetails(true);
  };

  const handleSelectProduct = () => {
    onSelectProduct?.(productId);
    onClose();
  };

  const daysSinceUpdate = product
    ? Math.floor((Date.now() - new Date(product.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const headerContent = loading ? (
    <div className="flex items-center gap-2">
      <Spinner size="sm" />
      <span>Chargement...</span>
    </div>
  ) : error ? (
    <span className="text-danger">Erreur</span>
  ) : (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold truncate">{product?.name}</h2>
          {product?.brand && <p className="text-sm text-gray-500">{product.brand.name}</p>}
        </div>
        <PackageIcon className="h-6 w-6 text-gray-400 shrink-0" />
      </div>

      <div className="flex flex-wrap gap-2">
        {product?.isOpenFoodFacts && (
          <Chip
            size="sm"
            color="success"
            variant="flat"
            startContent={<CheckCircleIcon className="h-3 w-3" />}
          >
            OpenFoodFacts
          </Chip>
        )}
        {product?.category && (
          <Chip size="sm" variant="flat">
            {product.category.name}
          </Chip>
        )}
      </div>
    </div>
  );

  // Helper functions for quality display
  const getScoreColor = (score: number): "success" | "warning" | "danger" => {
    if (score >= 70) return "success";
    if (score >= 40) return "warning";
    return "danger";
  };

  const getGradeColor = (
    grade: "A" | "B" | "C" | "D" | "E" | "unknown"
  ): "success" | "warning" | "danger" | "default" => {
    switch (grade) {
      case "A":
        return "success";
      case "B":
        return "success";
      case "C":
        return "warning";
      case "D":
        return "danger";
      case "E":
        return "danger";
      default:
        return "default";
    }
  };

  const getAdditiveRiskLevel = (qualityData: ProductQualityData | null) => {
    if (!qualityData?.additives || qualityData.additives.length === 0) {
      return { level: "none" as const, count: 0 };
    }

    const dangerous = qualityData.additives.filter((a) => a.riskLevel === "dangerous").length;
    const highRisk = qualityData.additives.filter((a) => a.riskLevel === "high_risk").length;
    const moderate = qualityData.additives.filter((a) => a.riskLevel === "moderate").length;

    if (dangerous > 0) return { level: "danger" as const, count: dangerous };
    if (highRisk > 0) return { level: "warning" as const, count: highRisk };
    if (moderate > 0) return { level: "moderate" as const, count: moderate };
    return { level: "safe" as const, count: qualityData.additives.length };
  };

  const bodyContent = loading ? (
    <div className="flex justify-center py-8">
      <Spinner size="lg" />
    </div>
  ) : error ? (
    <div className="text-center py-8 text-danger">{error}</div>
  ) : product ? (
    <div className="flex flex-col gap-4">
      {/* Score global - Grande carte centrale comme Yuka */}
      {product.qualityData?.overallQualityScore !== undefined && (
        <div className="flex flex-col items-center justify-center py-8 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl">
          <div className="relative">
            <div className="text-6xl font-bold text-foreground">
              {Math.round(product.qualityData.overallQualityScore)}
            </div>
            <div className="text-2xl font-medium text-foreground-500">/100</div>
          </div>
          <Chip
            size="lg"
            color={getScoreColor(product.qualityData.overallQualityScore)}
            variant="flat"
            className="mt-3"
          >
            {product.qualityData.overallQualityScore >= 70
              ? "Excellente qualité"
              : product.qualityData.overallQualityScore >= 40
                ? "Qualité moyenne"
                : "Qualité médiocre"}
          </Chip>
        </div>
      )}

      {/* Badges compacts - Nutri, Eco, Nova */}
      {product.qualityData && (
        <div className="grid grid-cols-3 gap-2">
          {product.qualityData.nutriScore?.grade && product.qualityData.nutriScore.grade !== "unknown" && (
            <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <span className="text-xs text-foreground-500 mb-1">Nutri-Score</span>
              <Chip size="lg" color={getGradeColor(product.qualityData.nutriScore.grade)} variant="solid">
                {product.qualityData.nutriScore.grade}
              </Chip>
            </div>
          )}
          {product.qualityData.ecoScore?.grade && product.qualityData.ecoScore.grade !== "unknown" && (
            <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <span className="text-xs text-foreground-500 mb-1">Eco-Score</span>
              <Chip size="lg" color={getGradeColor(product.qualityData.ecoScore.grade)} variant="solid">
                {product.qualityData.ecoScore.grade}
              </Chip>
            </div>
          )}
          {product.qualityData.novaGroup?.group && (
            <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <span className="text-xs text-foreground-500 mb-1">Nova</span>
              <Chip
                size="lg"
                color={
                  product.qualityData.novaGroup.group <= 2
                    ? "success"
                    : product.qualityData.novaGroup.group === 3
                      ? "warning"
                      : "danger"
                }
                variant="solid"
              >
                {product.qualityData.novaGroup.group}
              </Chip>
            </div>
          )}
        </div>
      )}

      {/* Additifs - Alerte visuelle comme Yuka */}
      {(() => {
        const additiveRisk = getAdditiveRiskLevel(product.qualityData);
        return (
          <div
            className={`flex items-center justify-between p-4 rounded-xl ${
              additiveRisk.level === "danger"
                ? "bg-red-50 dark:bg-red-950 border-2 border-red-500"
                : additiveRisk.level === "warning"
                  ? "bg-orange-50 dark:bg-orange-950 border-2 border-orange-500"
                  : additiveRisk.level === "moderate"
                    ? "bg-yellow-50 dark:bg-yellow-950 border-2 border-yellow-500"
                    : additiveRisk.level === "safe"
                      ? "bg-green-50 dark:bg-green-950 border-2 border-green-500"
                      : "bg-green-50 dark:bg-green-950 border-2 border-green-500"
            }`}
          >
            <div className="flex items-center gap-3">
              <FlaskConicalIcon
                className={`h-6 w-6 ${
                  additiveRisk.level === "danger"
                    ? "text-red-600"
                    : additiveRisk.level === "warning"
                      ? "text-orange-600"
                      : additiveRisk.level === "moderate"
                        ? "text-yellow-600"
                        : "text-green-600"
                }`}
              />
              <div>
                <p className="font-semibold text-foreground">
                  {additiveRisk.level === "none"
                    ? "Aucun additif"
                    : `${additiveRisk.count} additif${additiveRisk.count > 1 ? "s" : ""}`}
                </p>
                <p className="text-sm text-foreground-500">
                  {additiveRisk.level === "none"
                    ? "Produit sans additifs"
                    : additiveRisk.level === "danger"
                      ? "Additifs dangereux détectés"
                      : additiveRisk.level === "warning"
                        ? "Additifs à risque élevé"
                        : additiveRisk.level === "moderate"
                          ? "Additifs à consommer avec modération"
                          : "Additifs sans risque connu"}
                </p>
              </div>
            </div>
            <Button size="sm" variant="light" onPress={handleViewFullDetails} className="shrink-0">
              Détails
            </Button>
          </div>
        );
      })()}

      <Divider />

      {/* Prix - Top 3 meilleurs prix */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <StoreIcon className="h-4 w-4" />
            Meilleurs prix
          </h3>
          {product.prices.length > 3 && (
            <Button size="sm" variant="light" onPress={handleViewFullDetails}>
              Voir tout ({product.prices.length})
            </Button>
          )}
        </div>
        {product.prices.length > 0 ? (
          <div className="space-y-2">
            {product.prices
              .sort((a, b) => a.amount - b.amount)
              .slice(0, 3)
              .map((price, idx) => (
                <div
                  key={price.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    idx === 0
                      ? "bg-green-50 dark:bg-green-950 border-2 border-green-500"
                      : "bg-gray-50 dark:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {idx === 0 && <TrendingUpIcon className="h-4 w-4 text-green-600" />}
                    <div>
                      <p className="font-semibold text-foreground">{price.store.name}</p>
                      <p className="text-xs text-foreground-500">{price.store.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${idx === 0 ? "text-green-600 text-lg" : "text-foreground"}`}>
                      {price.amount.toFixed(2)} {price.currency}
                    </p>
                    <p className="text-xs text-foreground-500">/{price.unit}</p>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <EmptyState type="no-prices" productId={product.barcode} />
        )}
      </div>

      <Divider />

      {/* Actions principales */}
      <div className="flex flex-col gap-2">
        <Button
          color="primary"
          size="lg"
          onPress={handleViewFullDetails}
          endContent={<ExternalLinkIcon className="h-4 w-4" />}
          className="w-full"
        >
          Voir tous les détails
        </Button>
        {onSelectProduct && (
          <Button
            color="success"
            variant="flat"
            size="lg"
            onPress={handleSelectProduct}
            startContent={<CheckCircleIcon className="h-5 w-5" />}
            className="w-full"
          >
            Sélectionner ce produit
          </Button>
        )}
      </div>

      {/* Info source */}
      <div className="text-xs text-center text-foreground-500 pt-2">
        Source : {product.isOpenFoodFacts ? "OpenFoodFacts" : "Ajouté manuellement"}
        {daysSinceUpdate > 0 && ` • Mis à jour il y a ${daysSinceUpdate}j`}
      </div>
    </div>
  ) : null;

  return (
    <>
      <Modal
        isOpen={isOpen && !showComparison && !showFullDetails}
        onClose={onClose}
        header={headerContent}
        body={bodyContent}
      />

      {/* Modal de comparaison */}
      {product && (
        <ProductComparison
          isOpen={showComparison}
          onClose={() => setShowComparison(false)}
          currentProduct={product}
        />
      )}

      {/* Modal de détails complets */}
      {product && (
        <ProductDetailPage
          isOpen={showFullDetails}
          onClose={() => setShowFullDetails(false)}
          productData={{
            id: product.id,
            name: product.name,
            brand: product.brand?.name,
            barcode: product.barcode,
            imageUrl: undefined,
            qualityData: product.qualityData || undefined,
            prices: product.prices.map((p) => ({
              id: p.id,
              productId: product.id,
              storeId: p.store.id,
              storeName: p.store.name,
              amount: p.amount,
              currency: p.currency,
              unit: p.unit,
              dateRecorded: new Date(p.dateRecorded)
            })),
            isOpenFoodFacts: product.isOpenFoodFacts,
            lastUpdated: new Date(product.updatedAt)
          }}
          onAddToList={(id) => {
            // TODO: Implement add to list
          }}
          onCompare={(id) => {
            setShowFullDetails(false);
            setShowComparison(true);
          }}
          onViewAlternatives={(id) => {
            // TODO: Implement view alternatives
          }}
        />
      )}
    </>
  );
};
