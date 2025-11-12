"use client";

import { Button, Chip, Divider, Spinner } from "@heroui/react";
import {
  ArrowRightIcon,
  BarChart3Icon,
  CheckCircleIcon,
  ExternalLinkIcon,
  PackageIcon,
  StoreIcon
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Modal } from "~/components/Modal/Modal";
import { getProductWithPricesAndQuality } from "../../../Api/products/getProductWithPricesAndQuality.api";
import type { ProductQualityData } from "../../../Domain/ValueObjects/ProductQuality.vo";
import { formatQualitySummary } from "../../../Domain/ValueObjects/ProductQuality.vo";
import { ProductDetailPage } from "../ProductDetailPage";
import { EmptyState } from "./EmptyState";
import { ProductAdditives } from "./ProductAdditives";
import { ProductComparison } from "./ProductComparison";
import { ProductLabelsAndIngredients } from "./ProductLabelsAndIngredients";
import { ProductNutrition } from "./ProductNutrition";
import { ProductPriceList } from "./ProductPriceList";
import { ProductQualityBadges } from "./ProductQualityBadges";

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
        <PackageIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />
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

  const bodyContent = loading ? (
    <div className="flex justify-center py-8">
      <Spinner size="lg" />
    </div>
  ) : error ? (
    <div className="text-center py-8 text-danger">{error}</div>
  ) : product ? (
    <div className="flex flex-col gap-6">
      {/* Qualité & Nutrition */}
      {product.qualityData && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <BarChart3Icon className="h-4 w-4" />
            Qualité & Nutrition
          </h3>
          <ProductQualityBadges qualityData={product.qualityData} />
          {product.qualityData.overallQualityScore && (
            <p className="text-sm text-gray-600 mt-2">{formatQualitySummary(product.qualityData)}</p>
          )}

          {/* Détails nutritionnels */}
          <ProductNutrition qualityData={product.qualityData} />

          {/* Additifs */}
          <ProductAdditives qualityData={product.qualityData} />

          {/* Labels et ingrédients */}
          <ProductLabelsAndIngredients qualityData={product.qualityData} />
        </section>
      )}

      <Divider />

      {/* Prix par magasin */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <StoreIcon className="h-4 w-4" />
          Prix par magasin
        </h3>
        {product.prices.length > 0 ? (
          <ProductPriceList prices={product.prices} />
        ) : (
          <EmptyState type="no-prices" productId={product.barcode} />
        )}
      </section>

      <Divider />

      {/* Comparaison intelligente */}
      <section>
        <Button
          variant="flat"
          color="primary"
          size="lg"
          onPress={() => setShowComparison(true)}
          endContent={<ArrowRightIcon className="h-4 w-4" />}
          className="w-full"
        >
          Comparer avec d'autres produits similaires
        </Button>
      </section>

      <Divider />

      {/* Métadonnées */}
      <section className="text-xs text-gray-500 space-y-1">
        <p>
          Dernière mise à jour :{" "}
          {daysSinceUpdate === 0
            ? "Aujourd'hui"
            : `Il y a ${daysSinceUpdate} jour${daysSinceUpdate > 1 ? "s" : ""}`}
        </p>
        <p>Source : {product.isOpenFoodFacts ? "OpenFoodFacts" : "Ajouté manuellement"}</p>
        {product.barcode && <p>Code-barres : {product.barcode}</p>}
      </section>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-4">
        <Button
          color="primary"
          variant="flat"
          size="lg"
          onPress={handleViewFullDetails}
          endContent={<ExternalLinkIcon className="h-4 w-4" />}
          className="w-full"
        >
          Voir la fiche complète
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
            Choisir ce produit
          </Button>
        )}
        <Button variant="light" onPress={onClose} className="w-full">
          Fermer
        </Button>
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
            console.log("Add to list:", id);
          }}
          onCompare={(id) => {
            setShowFullDetails(false);
            setShowComparison(true);
          }}
          onViewAlternatives={(id) => {
            // TODO: Implement view alternatives
            console.log("View alternatives:", id);
          }}
        />
      )}
    </>
  );
};
