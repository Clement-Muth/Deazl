import { Button, Checkbox } from "@heroui/react";
import { CheckIcon, DollarSignIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { getItemPriceAlternatives } from "../../../Api/items/getItemPriceAlternatives.api";
import type { ShoppingListItemPayload } from "../../../Domain/Entities/ShoppingListItem.entity";
import type { ItemOptimalPrice } from "../../../Domain/Services/OptimalPricingService";
import { getUnitPriceInDisplayUnit } from "../../../Domain/Utils/priceComparison";
import { ProductQuickView } from "../../components/ProductQuickView";
import { AddPriceButton } from "../AddPriceButton";
import { ItemPriceAlternativesModal } from "../ItemPriceAlternativesModal";
import { PriceSuggestion } from "../PriceSuggestion";
import { SwipeableItem } from "./SwipeableItem";

interface ShoppingListItemListProps {
  items: ShoppingListItemPayload[];
  loading: Record<string, boolean>;
  handleToggleComplete: (itemId: string, isCompleted: boolean) => Promise<void>;
  onOpenEditModal: (item: ShoppingListItemPayload) => void;
  onDeleteItem: (itemId: string) => void;
  itemPrices: Record<string, ItemOptimalPrice>;
  isStoreSelected?: boolean;
  selectedStore?: { id: string; name: string; location: string } | null;
}

export const ShoppingListItemList = ({
  items,
  loading,
  handleToggleComplete,
  onOpenEditModal,
  onDeleteItem,
  itemPrices,
  isStoreSelected = false,
  selectedStore
}: ShoppingListItemListProps) => {
  const [priceModalState, setPriceModalState] = useState<{
    isOpen: boolean;
    itemId: string | null;
    itemName: string;
    alternatives: any[];
    currentPriceId: string | null;
  }>({ isOpen: false, itemId: null, itemName: "", alternatives: [], currentPriceId: null });

  const [productQuickViewState, setProductQuickViewState] = useState<{
    isOpen: boolean;
    productId: string | null;
  }>({ isOpen: false, productId: null });

  const [animatingDeletes, setAnimatingDeletes] = useState<Set<string>>(new Set());

  // Utiliser useCallback pour éviter des re-rendus inutiles
  const onCheckboxClick = useCallback(
    (e: React.MouseEvent, itemId: string, isCompleted: boolean) => {
      e.stopPropagation(); // Empêcher le click de remonter jusqu'à au <li>
      handleToggleComplete(itemId, isCompleted);
    },
    [handleToggleComplete]
  );

  const handleOpenPriceAlternatives = useCallback(async (item: ShoppingListItemPayload) => {
    const result = await getItemPriceAlternatives(item.id);
    if (result.success && result.itemName) {
      setPriceModalState({
        isOpen: true,
        itemId: item.id,
        itemName: result.itemName,
        alternatives: result.alternatives,
        currentPriceId: result.currentPriceId || null
      });
    }
  }, []);

  const handleClosePriceModal = useCallback(() => {
    setPriceModalState({
      isOpen: false,
      itemId: null,
      itemName: "",
      alternatives: [],
      currentPriceId: null
    });
  }, []);

  const handleOpenProductQuickView = useCallback((productId: string) => {
    setProductQuickViewState({ isOpen: true, productId });
  }, []);

  const handleCloseProductQuickView = useCallback(() => {
    setProductQuickViewState({ isOpen: false, productId: null });
  }, []);

  const handleDeleteItem = useCallback(
    async (itemId: string) => {
      // Ajouter l'item aux animations en cours
      setAnimatingDeletes((prev) => new Set(prev).add(itemId));

      // Attendre la fin de l'animation (300ms)
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Retirer de l'animation et supprimer vraiment
      setAnimatingDeletes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });

      // Appeler la vraie fonction de suppression
      await onDeleteItem(itemId);
    },
    [onDeleteItem]
  );

  return (
    <>
      <ul className="space-y-1.5 animate-fadeIn">
        {items.map((item) => {
          // Récupérer le prix optimal pour cet article
          const optimalPrice = itemPrices[item.id];
          const selectedPrice = optimalPrice?.selectedPrice;

          // Determine which price to display with proper unit conversion
          const displayUnit = item.unit || selectedPrice?.price.unit || "unit";

          let unitPrice: number | null = null;
          let totalPrice: number | null = null;

          if (selectedPrice) {
            const price = selectedPrice.price;
            // Convert price to display unit (e.g., 2.54€/kg → 0.00254€/g)
            unitPrice = getUnitPriceInDisplayUnit(price.amount, price.unit, displayUnit);
            totalPrice = unitPrice * item.quantity;
          }

          const isAnimatingDelete = animatingDeletes.has(item.id);

          return (
            <li
              key={`item-${item.id}-${item.isCompleted ? "completed" : "active"}`}
              className={`relative transition-all duration-300 ease-in-out ${
                isAnimatingDelete
                  ? "opacity-0 transform -translate-x-full scale-95"
                  : "opacity-100 transform translate-x-0 scale-100"
              }`}
            >
              <SwipeableItem
                key={`swipe-${item.id}-${item.isCompleted}`}
                onSwipeLeft={() => handleDeleteItem(item.id)}
                onSwipeRight={() => handleToggleComplete(item.id, !item.isCompleted)}
                isCompleted={item.isCompleted}
                disabled={loading[item.id] || isAnimatingDelete}
                onPress={(e) => {
                  if (item.productId) {
                    e.preventDefault();
                    handleOpenProductQuickView(item.productId);
                  }
                }}
                onLongPress={() => onOpenEditModal(item)}
              >
                <div
                  className={`flex items-center justify-between p-2 border rounded-large transition-colors ${
                    item.isCompleted ? "bg-content2" : "border-content3 bg-content2"
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
                        {selectedPrice && (
                          <PriceSuggestion
                            optimalPrice={selectedPrice}
                            optimalPriceInfo={optimalPrice}
                            currentUnitPrice={unitPrice}
                            quantity={item.quantity}
                            isStoreSelected={isStoreSelected}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {/* Show button to see price alternatives if product has ID */}
                    {item.productId && (
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onPress={() => handleOpenPriceAlternatives(item)}
                        className="min-w-0 h-8 w-8"
                      >
                        <DollarSignIcon size={16} />
                      </Button>
                    )}
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

      {/* Price Alternatives Modal */}
      {priceModalState.isOpen && (
        <ItemPriceAlternativesModal
          isOpen={priceModalState.isOpen}
          onClose={handleClosePriceModal}
          itemId={priceModalState.itemId!}
          itemName={priceModalState.itemName}
          currentPriceId={priceModalState.currentPriceId}
          alternatives={priceModalState.alternatives}
          onPriceSelected={() => {
            // Refresh will be handled by the modal
            handleClosePriceModal();
          }}
        />
      )}

      {/* Product Quick View Modal */}
      {productQuickViewState.isOpen && productQuickViewState.productId && (
        <ProductQuickView
          productId={productQuickViewState.productId}
          isOpen={productQuickViewState.isOpen}
          onClose={handleCloseProductQuickView}
        />
      )}
    </>
  );
};
