import { Button, Checkbox } from "@heroui/react";
import { CheckIcon } from "lucide-react";
import { useCallback } from "react";
import type { ShoppingListItemPayload } from "../../../Domain/Entities/ShoppingListItem.entity";
import type { BestPriceResult } from "../../../Domain/Utils/priceComparison";
import { getUnitPriceInDisplayUnit } from "../../../Domain/Utils/priceComparison";
import { AddPriceButton } from "../AddPriceButton";
import { PriceSuggestion } from "../PriceSuggestion";
import { SwipeableItem } from "./SwipeableItem";

interface ShoppingListItemListProps {
  items: ShoppingListItemPayload[];
  loading: Record<string, boolean>;
  handleToggleComplete: (itemId: string, isCompleted: boolean) => Promise<void>;
  onOpenEditModal: (item: ShoppingListItemPayload) => void;
  onDeleteItem: (itemId: string) => void;
  onUndoDelete?: (itemId: string) => void;
  isPendingDelete?: (itemId: string) => boolean;
  bestPrices?: Record<string, BestPriceResult | null>;
  isStoreSelected?: boolean;
  selectedStore?: { id: string; name: string; location: string } | null;
}

export const ShoppingListItemList = ({
  items,
  loading,
  handleToggleComplete,
  onOpenEditModal,
  onDeleteItem,
  onUndoDelete,
  isPendingDelete,
  bestPrices,
  isStoreSelected = false,
  selectedStore
}: ShoppingListItemListProps) => {
  // Utiliser useCallback pour éviter des re-rendus inutiles
  const onCheckboxClick = useCallback(
    (e: React.MouseEvent, itemId: string, isCompleted: boolean) => {
      e.stopPropagation(); // Empêcher le click de remonter jusqu'au <li>
      handleToggleComplete(itemId, isCompleted);
    },
    [handleToggleComplete]
  );

  return (
    <ul className="space-y-1.5 animate-fadeIn">
      {items.map((item) => {
        // Determine which price to display with proper unit conversion
        const displayUnit = item.unit || bestPrices?.[item.id]?.price.unit || "unit";

        let unitPrice: number | null = null;
        let totalPrice: number | null = null;

        if (bestPrices?.[item.id]) {
          const bestPrice = bestPrices[item.id]!.price;
          // Convert price to display unit (e.g., 2.54€/kg → 0.00254€/g)
          unitPrice = getUnitPriceInDisplayUnit(bestPrice.amount, bestPrice.unit, displayUnit);
          totalPrice = unitPrice * item.quantity;
        }

        const isDeleting = isPendingDelete?.(item.id) || false;

        return (
          <li key={`item-${item.id}-${item.isCompleted ? "completed" : "active"}`} className="relative">
            {isDeleting && (
              <div className="absolute inset-0 bg-red-50 border border-red-200 rounded-md z-20 flex items-center justify-between px-4 animate-fadeIn">
                <span className="text-sm text-red-700">Deleting...</span>
                <Button size="sm" color="danger" variant="flat" onPress={() => onUndoDelete?.(item.id)}>
                  Undo
                </Button>
              </div>
            )}
            <SwipeableItem
              key={`swipe-${item.id}-${item.isCompleted}`}
              onSwipeLeft={() => onDeleteItem(item.id)}
              onSwipeRight={() => handleToggleComplete(item.id, !item.isCompleted)}
              isCompleted={item.isCompleted}
              disabled={loading[item.id] || isDeleting}
            >
              <div
                className={`flex items-center justify-between p-2 border rounded-md transition-colors ${
                  isDeleting
                    ? "bg-gray-50 opacity-50"
                    : item.isCompleted
                      ? "border-gray-200 bg-white"
                      : "border-primary-100 bg-white"
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div onClick={(e) => onCheckboxClick(e, item.id, item.isCompleted)} className="shrink-0">
                    <Checkbox
                      isSelected={item.isCompleted}
                      isDisabled={loading[item.id]}
                      onValueChange={(isChecked) => handleToggleComplete(item.id, isChecked)}
                      id={`item-${item.id}`}
                      color="success"
                      className="bg-transparent"
                      size="md"
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <label
                      htmlFor={`item-${item.id}`}
                      className={`${
                        item.isCompleted ? "line-through text-gray-400" : "font-medium"
                      } cursor-pointer bg-transparent truncate`}
                    >
                      {item.product?.name ||
                        item.recipeName ||
                        `Product #${item.productId?.substring(0, 8) || "Unknown"}`}
                    </label>
                    <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 text-xs text-gray-500">
                      <span className="inline-flex items-center bg-gray-100 px-1.5 py-0.5 rounded text-xs font-medium">
                        {item.quantity} {displayUnit}
                        {unitPrice && (
                          <>
                            {" × "}
                            {unitPrice.toFixed(2)}€ ={" "}
                            <span className="font-bold">{totalPrice!.toFixed(2)}€</span>
                          </>
                        )}
                      </span>
                      {item.isCompleted && (
                        <span className="flex items-center text-green-600 ml-1">
                          <CheckIcon size={12} className="mr-0.5" />
                          <span className="text-xs">Completed</span>
                        </span>
                      )}
                      {/* Price Suggestion inline */}
                      {bestPrices?.[item.id] && (
                        <PriceSuggestion
                          bestPrice={bestPrices[item.id]!}
                          currentUnitPrice={unitPrice}
                          quantity={item.quantity}
                          isStoreSelected={isStoreSelected}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {/* Show Add Price button if no price available */}
                  {!unitPrice && item.productId && (
                    <AddPriceButton
                      productId={item.productId}
                      productName={item.product?.name || "Product"}
                      barcode={item.product?.barcode}
                      quantity={item.quantity}
                      unit={displayUnit}
                      selectedStore={selectedStore}
                    />
                  )}
                </div>
              </div>
            </SwipeableItem>
          </li>
        );
      })}
    </ul>
  );
};
