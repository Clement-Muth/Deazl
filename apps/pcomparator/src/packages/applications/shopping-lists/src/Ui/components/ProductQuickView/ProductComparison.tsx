"use client";

import { Button, Card, CardBody, Chip, Radio, RadioGroup, Spinner } from "@heroui/react";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  AwardIcon,
  DollarSignIcon,
  FlaskConicalIcon,
  LeafIcon,
  StoreIcon,
  TrendingUpIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "~/components/Modal/Modal";
import { getSimilarProducts } from "../../../Api/products/getSimilarProducts.api";
import type { ProductQualityData } from "../../../Domain/ValueObjects/ProductQuality.vo";

interface ProductComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  currentProduct: {
    id: string;
    name: string;
    qualityData: ProductQualityData | null;
    prices: Array<{ amount: number }>;
  };
}

interface SimilarProduct {
  id: string;
  name: string;
  brand: { name: string } | null;
  qualityData: ProductQualityData | null;
  averagePrice: number | null;
  priceCount: number;
  lowestPrice: number | null;
}

type ComparisonMode = "balanced" | "quality" | "price";

export const ProductComparison = ({ isOpen, onClose, currentProduct }: ProductComparisonProps) => {
  const [loading, setLoading] = useState(true);
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>("balanced");

  useEffect(() => {
    if (isOpen) {
      loadSimilarProducts();
    }
  }, [isOpen]);

  const loadSimilarProducts = async () => {
    setLoading(true);
    const result = await getSimilarProducts(currentProduct.id);

    if (result.success && result.products) {
      setSimilarProducts(result.products as SimilarProduct[]);
    }
    setLoading(false);
  };

  const calculateScore = (product: SimilarProduct | typeof currentProduct) => {
    let score = 0;
    const weights = {
      balanced: { price: 0.4, quality: 0.3, availability: 0.3 },
      quality: { price: 0.2, quality: 0.6, availability: 0.2 },
      price: { price: 0.7, quality: 0.2, availability: 0.1 }
    }[comparisonMode];

    // Score de prix (inversé : moins cher = meilleur)
    const avgPrice =
      "averagePrice" in product
        ? product.averagePrice
        : currentProduct.prices.length > 0
          ? currentProduct.prices.reduce((sum, p) => sum + p.amount, 0) / currentProduct.prices.length
          : null;

    if (avgPrice !== null) {
      const priceScore = Math.max(0, 100 - avgPrice * 10); // Normalisation simple
      score += priceScore * weights.price;
    }

    // Score de qualité
    if (product.qualityData?.overallQualityScore) {
      score += product.qualityData.overallQualityScore * weights.quality;
    } else {
      score += 50 * weights.quality; // Valeur neutre si pas de données
    }

    // Score de disponibilité
    const priceCount = "priceCount" in product ? product.priceCount : currentProduct.prices.length;
    const availabilityScore = Math.min(100, priceCount * 25); // 4 magasins = 100
    score += availabilityScore * weights.availability;

    return Math.round(score);
  };

  const allProducts = [
    {
      ...currentProduct,
      averagePrice:
        currentProduct.prices.length > 0
          ? currentProduct.prices.reduce((sum, p) => sum + p.amount, 0) / currentProduct.prices.length
          : null,
      priceCount: currentProduct.prices.length,
      lowestPrice: currentProduct.prices[0]?.amount || null,
      brand: null,
      isCurrent: true
    },
    ...similarProducts.map((p) => ({ ...p, isCurrent: false }))
  ];

  const sortedProducts = [...allProducts].sort((a, b) => calculateScore(b) - calculateScore(a));
  const bestProduct = sortedProducts[0];

  const headerContent = (
    <div className="flex items-center gap-2">
      <Button isIconOnly variant="light" size="sm" onPress={onClose}>
        <ArrowLeftIcon className="h-4 w-4" />
      </Button>
      <span className="text-lg font-bold">Comparaison intelligente</span>
    </div>
  );

  const bodyContent = loading ? (
    <div className="flex justify-center py-8">
      <Spinner size="lg" />
    </div>
  ) : (
    <div className="flex flex-col gap-4 px-4">
      {/* Mode de comparaison */}
      <Card shadow="none" className="border border-gray-200 px-4">
        <CardBody className="p-4">
          <h3 className="text-sm font-semibold mb-3">Critère de comparaison</h3>
          <RadioGroup value={comparisonMode} onValueChange={(v) => setComparisonMode(v as ComparisonMode)}>
            <Radio value="balanced" description="Équilibre entre tous les critères">
              ⚖️ Équilibré
            </Radio>
            <Radio value="quality" description="Privilégie la qualité nutritionnelle">
              🌱 Qualité prioritaire
            </Radio>
            <Radio value="price" description="Privilégie le meilleur prix">
              💰 Prix prioritaire
            </Radio>
          </RadioGroup>
        </CardBody>
      </Card>

      {/* Recommandation */}
      {bestProduct && (
        <Card shadow="none" className="border-2 border-success-500 bg-success-50">
          <CardBody className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-success-500 text-white rounded-full p-2 flex-shrink-0">
                <AwardIcon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-success-700 mb-1">🥇 Produit recommandé</h3>
                <p className="font-semibold text-sm truncate">{bestProduct.name}</p>
                <p className="text-xs text-success-600 mt-1">
                  Score : {calculateScore(bestProduct)}/100
                  {bestProduct.isCurrent && " (Produit actuel)"}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Liste des produits comparés */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Produits comparés ({sortedProducts.length})</h3>

        {sortedProducts.map((product, index) => {
          const score = calculateScore(product);
          const isRecommended = product.id === bestProduct?.id;

          return (
            <Card
              key={product.id}
              shadow="none"
              className={`border ${isRecommended ? "border-success-500" : "border-gray-200"}`}
            >
              <CardBody className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      <h4 className="font-semibold text-sm truncate flex-1">{product.name}</h4>
                      {product.isCurrent && (
                        <Chip size="sm" color="primary" variant="flat">
                          Actuel
                        </Chip>
                      )}
                    </div>
                    {product.brand && <p className="text-xs text-gray-500">{product.brand.name}</p>}
                  </div>
                  <Chip
                    size="lg"
                    color={score >= 70 ? "success" : score >= 50 ? "warning" : "default"}
                    variant="flat"
                  >
                    {score}/100
                  </Chip>
                </div>

                {/* Métriques principales */}
                <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                  <div className="flex items-center gap-1 text-gray-600">
                    <DollarSignIcon className="h-3 w-3" />
                    <span>{product.lowestPrice ? `${product.lowestPrice.toFixed(2)}€` : "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <LeafIcon className="h-3 w-3" />
                    <span>
                      {product.qualityData?.overallQualityScore
                        ? `${Math.round(product.qualityData.overallQualityScore)}/100`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <StoreIcon className="h-3 w-3" />
                    <span>
                      {product.priceCount} magasin{product.priceCount > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Badges qualité détaillés */}
                {product.qualityData && (
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {product.qualityData.nutriScore?.grade && (
                      <Chip size="sm" variant="flat" className="h-5">
                        Nutri: {product.qualityData.nutriScore.grade}
                      </Chip>
                    )}
                    {product.qualityData.ecoScore?.grade && (
                      <Chip size="sm" variant="flat" className="h-5">
                        Eco: {product.qualityData.ecoScore.grade}
                      </Chip>
                    )}
                    {product.qualityData.novaGroup?.group && (
                      <Chip size="sm" variant="flat" className="h-5">
                        Nova: {product.qualityData.novaGroup.group}
                      </Chip>
                    )}
                    {product.qualityData.additives && product.qualityData.additives.length > 0 && (
                      <Chip
                        size="sm"
                        variant="flat"
                        color={
                          product.qualityData.additives.some((a) => a.riskLevel === "high")
                            ? "danger"
                            : "warning"
                        }
                        startContent={<FlaskConicalIcon className="h-3 w-3" />}
                        className="h-5"
                      >
                        {product.qualityData.additives.length} additif
                        {product.qualityData.additives.length > 1 ? "s" : ""}
                      </Chip>
                    )}
                    {product.qualityData.allergens && product.qualityData.allergens.length > 0 && (
                      <Chip
                        size="sm"
                        variant="flat"
                        color="warning"
                        startContent={<AlertTriangleIcon className="h-3 w-3" />}
                        className="h-5"
                      >
                        {product.qualityData.allergens.length} allergène
                        {product.qualityData.allergens.length > 1 ? "s" : ""}
                      </Chip>
                    )}
                    {product.qualityData.labels && product.qualityData.labels.length > 0 && (
                      <Chip size="sm" variant="flat" color="success" className="h-5">
                        {product.qualityData.labels.length} label
                        {product.qualityData.labels.length > 1 ? "s" : ""}
                      </Chip>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Explication */}
      <Card shadow="none" className="border border-blue-200 bg-blue-50">
        <CardBody className="p-4">
          <div className="flex items-start gap-2">
            <TrendingUpIcon className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 space-y-1">
              <p className="font-semibold">Comment fonctionne la comparaison ?</p>
              <p>
                Le score combine le prix, la qualité nutritionnelle et la disponibilité selon le critère
                choisi.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Button variant="light" onPress={onClose} className="w-full">
        Fermer la comparaison
      </Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} header={headerContent} body={bodyContent} sheetHeight="lg" />
  );
};
