"use client";

import { Button, Checkbox } from "@heroui/react";
import { CheckIcon, DollarSignIcon, GitCompareIcon, InfoIcon } from "lucide-react";
import type { ShoppingListItemPayload } from "../../../Domain/Entities/ShoppingListItem.entity";
import type { BestPriceResult } from "../../../Domain/Utils/priceComparison";
import { getUnitPriceInDisplayUnit } from "../../../Domain/Utils/priceComparison";
import { ProductQuickSummary } from "../../components/ProductQuickView";
import { AddPriceButton } from "../AddPriceButton";
import { PriceSuggestion } from "../PriceSuggestion";

interface EnhancedShoppingListItemProps {
  item: ShoppingListItemPayload;
  loading: boolean;
  isDeleting: boolean;
  isSelected: boolean;
  canSelectMore: boolean;
  bestPrice?: BestPriceResult | null;
  isStoreSelected?: boolean;
  selectedStore?: { id: string; name: string; location: string } | null;
  onToggleComplete: (itemId: string, isCompleted: boolean) => void;
  onToggleSelection: (itemId: string) => void;
  onOpenPriceAlternatives: (item: ShoppingListItemPayload) => void;
  onOpenProductDetails: (productId: string) => void;
  onUndoDelete?: (itemId: string) => void;
}

export const EnhancedShoppingListItem = ({
  item,
  loading,
  isDeleting,
  isSelected,
  canSelectMore,
  bestPrice,
  isStoreSelected,
  selectedStore,
  onToggleComplete,
  onToggleSelection,
  onOpenPriceAlternatives,
  onOpenProductDetails,
  onUndoDelete
}: EnhancedShoppingListItemProps) => {
  const displayUnit = item.unit || bestPrice?.price.unit || "unit";

  let unitPrice: number | null = null;
  let totalPrice: number | null = null;

  if (bestPrice) {
    unitPrice = getUnitPriceInDisplayUnit(bestPrice.price.amount, bestPrice.price.unit, displayUnit);
    totalPrice = unitPrice * item.quantity;
  }

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="relative">
      {isDeleting && (
        <div className="absolute inset-0 bg-red-50 border border-red-200 rounded-md z-20 flex items-center justify-between px-4 animate-fadeIn">
          <span className="text-sm text-red-700">Suppression...</span>
          <Button size="sm" color="danger" variant="flat" onPress={() => onUndoDelete?.(item.id)}>
            Annuler
          </Button>
        </div>
      )}

      <div
        className={`border rounded-lg transition-all ${
          isDeleting
            ? "bg-gray-50 opacity-50"
            : isSelected
              ? "border-primary-500 bg-primary-50"
              : item.isCompleted
                ? "border-gray-200 bg-white"
                : "border-primary-100 bg-white"
        } ${!isDeleting && "hover:shadow-sm"}`}
      >
        <div className="p-3 space-y-2">
          {/* En-tête avec checkbox et nom */}
          <div className="flex items-start gap-2">
            <div onClick={handleCheckboxClick} className="shrink-0 pt-0.5">
              <Checkbox
                isSelected={item.isCompleted}
                isDisabled={loading}
                onValueChange={(isChecked) => onToggleComplete(item.id, isChecked)}
                id={`item-${item.id}`}
                color="success"
                size="md"
              />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              {/* Nom du produit */}
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => item.productId && onOpenProductDetails(item.productId)}
                  className={`text-left ${
                    item.isCompleted ? "line-through text-gray-400" : "font-medium text-gray-900"
                  } hover:text-primary-600 transition-colors`}
                >
                  {item.product?.name ||
                    item.recipeName ||
                    `Produit #${item.productId?.substring(0, 8) || "?"}`}
                </button>

                {item.productId && (canSelectMore || isSelected) && (
                  <Button
                    size="sm"
                    variant={isSelected ? "solid" : "flat"}
                    color="primary"
                    isIconOnly
                    onPress={() => onToggleSelection(item.id)}
                    className="min-w-0 h-7 w-7"
                    isDisabled={!canSelectMore && !isSelected}
                  >
                    <GitCompareIcon className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              {/* Quantité et prix */}
              <div className="flex items-center flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center bg-gray-100 px-2 py-1 rounded font-medium">
                  {item.quantity} {displayUnit}
                  {unitPrice && (
                    <>
                      {" × "}
                      {unitPrice.toFixed(2)}€ ={" "}
                      <span className="font-bold ml-1">{totalPrice!.toFixed(2)}€</span>
                    </>
                  )}
                </span>

                {item.isCompleted && (
                  <span className="flex items-center text-green-600">
                    <CheckIcon size={14} className="mr-1" />
                    <span>Fait</span>
                  </span>
                )}

                {bestPrice && (
                  <PriceSuggestion
                    // @ts-ignore
                    bestPrice={bestPrice}
                    currentUnitPrice={unitPrice}
                    quantity={item.quantity}
                    isStoreSelected={isStoreSelected}
                  />
                )}
              </div>

              {/* Résumé qualité produit */}
              {item.product && (item.product as any).nutritionScore && (
                <ProductQuickSummary
                  qualityData={(item.product as any).nutritionScore}
                  lowestPrice={unitPrice}
                  isBestPrice={false}
                  compact
                />
              )}
            </div>
          </div>
        </div>

        {/* Actions en bas */}
        <div className="border-t border-gray-100 px-3 py-2 flex items-center justify-end gap-2">
          {item.productId && (
            <>
              <Button
                size="sm"
                variant="light"
                startContent={<DollarSignIcon className="h-3.5 w-3.5" />}
                onPress={() => onOpenPriceAlternatives(item)}
                className="text-xs h-7"
              >
                Prix
              </Button>

              <Button
                size="sm"
                variant="light"
                startContent={<InfoIcon className="h-3.5 w-3.5" />}
                onPress={() => onOpenProductDetails(item.productId!)}
                className="text-xs h-7"
              >
                Détails
              </Button>
            </>
          )}

          {!unitPrice && item.productId && (
            <AddPriceButton
              productId={item.productId}
              productName={item.product?.name || "Produit"}
              barcode={item.product?.barcode}
              quantity={item.quantity}
              unit={displayUnit}
              selectedStore={selectedStore}
            />
          )}
        </div>
      </div>
    </div>
  );
};
