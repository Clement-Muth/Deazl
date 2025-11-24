"use client";

import { useDisclosure } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductDetailPage } from "~/applications/ShoppingLists/Ui/components/ProductDetailPage";
import { incrementRecipeViews } from "../Api";
import type { RecipePayload } from "../Domain/Schemas/Recipe.schema";
import type { RecipePricingResult } from "../Domain/Services/RecipePricing.service";
import { AddRecipeToListModal } from "./RecipeDetails/AddRecipeToListModal";
import { ShareRecipeModalNew } from "./RecipeDetails/ShareRecipeModal/ShareRecipeModalNew";
import RecipeDetailsMobile from "./RecipeDetailsMobile/RecipeDetailsMobile";

interface RecipeDetailsContainerProps {
  recipe: RecipePayload;
  userId?: string;
  accessMode?: "public" | "authenticated" | "shared" | "restricted";
  initialPublicPricing?: RecipePricingResult | null;
}

/**
 * Container qui connecte RecipeDetailsMobile aux hooks et données réelles
 */
export function RecipeDetailsContainer({
  recipe,
  userId,
  accessMode = "public",
  initialPublicPricing
}: RecipeDetailsContainerProps) {
  const isAuthenticated = !!userId;
  const router = useRouter();
  const { isOpen: isShareOpen, onOpen: onShareOpen, onClose: onShareClose } = useDisclosure();
  const { isOpen: isAddToListOpen, onOpen: onAddToListOpen, onClose: onAddToListClose } = useDisclosure();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  useEffect(() => {
    incrementRecipeViews(recipe.id);
  }, [recipe.id]);

  const canShare = isAuthenticated && recipe.userId === userId;
  const canAddToList = isAuthenticated;

  return (
    <>
      <RecipeDetailsMobile
        recipe={recipe}
        userId={userId}
        onBack={() => router.push("/recipes")}
        onAddToList={canAddToList ? onAddToListOpen : undefined}
        onShare={canShare ? onShareOpen : undefined}
        onProductClick={(productId) => setSelectedProductId(productId)}
        accessMode={accessMode}
        initialPublicPricing={initialPublicPricing}
      />

      {/* Modals */}
      {canShare && (
        <ShareRecipeModalNew
          isOpen={isShareOpen}
          onClose={onShareClose}
          recipeId={recipe.id}
          recipeName={recipe.name}
          ownerId={recipe.userId}
        />
      )}

      {canAddToList && (
        <AddRecipeToListModal isOpen={isAddToListOpen} onClose={onAddToListClose} recipe={recipe} />
      )}

      {/* Product Detail Modal */}
      {selectedProductId && (
        <ProductDetailPage
          productId={selectedProductId}
          isOpen={!!selectedProductId}
          onClose={() => setSelectedProductId(null)}
          compact
          // @ts-ignore
          fetchProduct={async (id) => {
            const { getProductWithPricesAndQuality } = await import(
              "~/applications/ShoppingLists/Api/products/getProductWithPricesAndQuality.api"
            );
            const result = await getProductWithPricesAndQuality(id);
            if (!result.success || !result.product) {
              throw new Error(result.error || "Produit introuvable");
            }
            return {
              id: result.product.id,
              name: result.product.name,
              brand: result.product.brand?.name,
              barcode: result.product.barcode,
              qualityData: result.product.qualityData || undefined,
              prices: result.product.prices.map((p) => ({
                id: p.id,
                productId: result.product.id,
                storeId: p.store.id,
                storeName: p.store.name,
                amount: p.amount,
                currency: p.currency,
                unit: p.unit,
                dateRecorded: new Date(p.dateRecorded)
              })),
              isOpenFoodFacts: result.product.isOpenFoodFacts,
              lastUpdated: new Date(result.product.updatedAt)
            };
          }}
        />
      )}
    </>
  );
}
