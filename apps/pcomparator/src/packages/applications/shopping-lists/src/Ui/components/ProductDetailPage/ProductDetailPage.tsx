import { Spinner } from "@heroui/react";
import { Suspense, lazy, useEffect, useState } from "react";
import { Modal } from "~/components/Modal/Modal";
import type { PriceData } from "../../../Domain/Utils/priceComparison";
import type { ProductQualityData } from "../../../Domain/ValueObjects/ProductQuality.vo";
import { EmptyState } from "../ProductQuickView/EmptyState";
import { HeaderSection } from "./HeaderSection";
import { QualitySection } from "./QualitySection";

// Lazy load heavy sections for better performance
const NutritionSection = lazy(() =>
  import("./NutritionSection").then((m) => ({ default: m.NutritionSection }))
);
const AdditivesSection = lazy(() =>
  import("./AdditivesSection").then((m) => ({ default: m.AdditivesSection }))
);
const AllergensAndLabelsSection = lazy(() =>
  import("./AllergensAndLabelsSection").then((m) => ({ default: m.AllergensAndLabelsSection }))
);
const IngredientsSection = lazy(() =>
  import("./IngredientsSection").then((m) => ({ default: m.IngredientsSection }))
);
const PriceSection = lazy(() => import("./PriceSection").then((m) => ({ default: m.PriceSection })));

export interface ProductData {
  id: string;
  name: string;
  brand?: string;
  barcode: string;
  imageUrl?: string;
  qualityData?: ProductQualityData;
  prices: PriceData[];
  isOpenFoodFacts?: boolean;
  lastUpdated?: Date;
}

interface ProductDetailPageProps {
  productId?: string;
  productData?: ProductData;
  isOpen: boolean;
  onClose: () => void;
  onAddToList?: (productId: string) => void;
  onCompare?: (productId: string) => void;
  onViewAlternatives?: (productId: string) => void;
  onAddToFavorites?: (productId: string) => void;
  isInFavorites?: boolean;
  isInList?: boolean;
  compact?: boolean;
  fetchProduct?: (productId: string) => Promise<ProductData>;
}

/**
 * Loading fallback component
 */
function SectionLoader() {
  return (
    <div className="flex justify-center items-center py-8">
      <Spinner size="md" color="primary" />
    </div>
  );
}

/**
 * ProductDetailPage - Complete product detail page with all information
 *
 * Features:
 * - Header with product name, brand, barcode, overall score
 * - Quality section with NutriScore, EcoScore, Nova, health warnings
 * - Nutrition section with complete nutritional table
 * - Additives section with risk levels
 * - Allergens and labels section
 * - Ingredients section with indicators
 * - Price section with sorting/filtering by store
 * - Actions section with buttons
 *
 * Performance:
 * - Lazy loading for heavy sections
 * - Suspense boundaries for progressive loading
 * - Compact mode for faster rendering
 *
 * @example
 * ```tsx
 * <ProductDetailPage
 *   productId="123"
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onAddToList={(id) => addToShoppingList(id)}
 *   fetchProduct={async (id) => await getProduct(id)}
 * />
 * ```
 */
export function ProductDetailPage({
  productId,
  productData: initialProductData,
  isOpen,
  onClose,
  onAddToList,
  onCompare,
  onViewAlternatives,
  onAddToFavorites,
  isInFavorites = false,
  isInList = false,
  compact = false,
  fetchProduct
}: ProductDetailPageProps) {
  const [productData, setProductData] = useState<ProductData | null>(initialProductData || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch product data if productId is provided and no initial data
  useEffect(() => {
    if (!isOpen) return;
    if (initialProductData) {
      setProductData(initialProductData);
      return;
    }

    if (productId && fetchProduct && !productData) {
      setIsLoading(true);
      setError(null);

      fetchProduct(productId)
        .then((data) => {
          setProductData(data);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err.message || "Erreur lors du chargement du produit");
          setIsLoading(false);
        });
    }
  }, [productId, isOpen, fetchProduct, initialProductData, productData]);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      if (!initialProductData) {
        setProductData(null);
      }
      setError(null);
    }
  }, [isOpen, initialProductData]);

  // Loading state
  if (isLoading) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        sheetHeight="lg"
        header={<span className="text-xl font-bold">Détails du produit</span>}
        body={
          <div className="flex flex-col items-center justify-center py-16">
            <Spinner size="lg" color="primary" />
            <p className="text-sm text-foreground-500 mt-4">Chargement des informations produit...</p>
          </div>
        }
      />
    );
  }

  // Error state
  if (error) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        sheetHeight="md"
        header={<span className="text-xl font-bold">Erreur</span>}
        body={<EmptyState type="no-data" productId={productId} />}
      />
    );
  }

  // No data state
  if (!productData) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        sheetHeight="md"
        header={<span className="text-xl font-bold">Produit introuvable</span>}
        body={<EmptyState type="no-data" productId={productId} />}
      />
    );
  }

  const { name, brand, barcode, imageUrl, qualityData, prices, isOpenFoodFacts, lastUpdated, id } =
    productData;

  const overallScore = qualityData?.overallQualityScore;

  const headerContent = (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xl font-bold truncate">{name}</span>
      <HeaderSection
        productName={name}
        brandName={brand}
        barcode={barcode}
        isOpenFoodFacts={isOpenFoodFacts ?? false}
        overallScore={overallScore}
        lastUpdated={lastUpdated}
        imageUrl={imageUrl}
      />
    </div>
  );

  const bodyContent = (
    <div className="flex flex-col gap-6">
      {/* Product basic info */}

      {/* Quick Summary - Quality + Best Price (compact view) */}
      {qualityData && <QualitySection qualityData={qualityData} compact={compact} />}

      {/* Actions - Always at top for easy access
      <ActionsSection
        onAddToList={onAddToList ? () => onAddToList(id) : undefined}
        onCompare={onCompare ? () => onCompare(id) : undefined}
        onViewAlternatives={onViewAlternatives ? () => onViewAlternatives(id) : undefined}
        onAddToFavorites={onAddToFavorites ? () => onAddToFavorites(id) : undefined}
        isInFavorites={isInFavorites}
        isInList={isInList}
        compact={compact}
      /> */}

      {/* Detailed Sections - Lazy loaded */}
      <Suspense fallback={<SectionLoader />}>
        {/* Nutrition */}
        {qualityData?.nutriments && (
          <NutritionSection nutriments={qualityData.nutriments} compact={compact} />
        )}

        {/* Additives */}
        {qualityData && <AdditivesSection additives={qualityData.additives} compact={compact} />}

        {/* Allergens and Labels */}
        <AllergensAndLabelsSection
          allergens={qualityData?.allergens}
          labels={qualityData?.labels}
          compact={compact}
        />

        {/* Ingredients */}
        {qualityData && <IngredientsSection ingredients={qualityData.ingredients} compact={compact} />}

        {/* Prices */}
        <PriceSection prices={prices} compact={compact} />
      </Suspense>

      {/* Footer info */}
      <div className="text-xs text-foreground-500 space-y-1">
        <p>Source : {isOpenFoodFacts ? "OpenFoodFacts" : "Ajouté manuellement"}</p>
        {lastUpdated && (
          <p>
            Dernière mise à jour :{" "}
            {new Date(lastUpdated).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </p>
        )}
      </div>
    </div>
  );

  return <Modal isOpen={isOpen} onClose={onClose} header={headerContent} body={bodyContent} />;
}
