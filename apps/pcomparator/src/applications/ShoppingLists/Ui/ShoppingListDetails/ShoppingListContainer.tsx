import {} from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { useMemo, useState } from "react";
import type { ShoppingListPayload } from "../../Domain/Schemas/ShoppingList.schema";
import { useStore } from "../Contexts/StoreContext";
import { useUserOptimizationPreferences } from "../Hooks/useUserOptimizationPreferences";
import { ShoppingListItemCard } from "./ShoppingListItemCard";
import { SmartConversionSection } from "./SmartConversionSection";
import { SmartQuickAddBar } from "./SmartQuickAddBar/SmartQuickAddBar";
import { useOptimalPricing } from "./useOptimalPricing";
import { useShoppingListActions } from "./useShoppingListActions";

interface ShoppingListContainerProps {
  initialList: ShoppingListPayload;
  user: {
    id?: string;
  };
}

const noopPromise = () => Promise.resolve();

export const ShoppingListContainer = ({ initialList, user }: ShoppingListContainerProps) => {
  const { handleAddItem, handleDeleteItem, handleToggleComplete, handleUpdateItem, items, smartConversion } =
    useShoppingListActions(initialList);

  const { selectedStore } = useStore();

  const { preferences: userPreferences } = useUserOptimizationPreferences();

  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const filteredItems = useMemo(() => {
    switch (filter) {
      case "active":
        return items.filter((item) => !item.isCompleted);
      case "completed":
        return items.filter((item) => item.isCompleted);
      default:
        return items;
    }
  }, [items, filter]);

  const {
    itemPrices,
    totalCost,
    potentialSavings,
    storeSummary,
    loading: pricesLoading
  } = useOptimalPricing(items, {
    selectedStoreIds: selectedStore?.id ? [selectedStore.id] : undefined,
    userPreferences: userPreferences || {
      showSavingSuggestions: true
    }
  });

  const canEdit = useMemo(() => {
    if (!user?.id) return false;

    if (initialList.userId === user.id) return true;

    const collaborators = initialList.collaborators ?? [];
    const userRole = collaborators.find((c) => c.userId === user.id)?.role;
    return userRole ? ["OWNER", "EDITOR"].includes(userRole) : false;
  }, [initialList.userId, initialList.collaborators, user.id]);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn w-full">
      <>
        {canEdit ? (
          <SmartQuickAddBar listId={initialList.id} onItemAdded={handleAddItem} className="min-w-[260px]" />
        ) : (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
            <p className="text-sm text-yellow-700">
              <Trans>You have view-only access to this list. Contact the owner to make changes.</Trans>
            </p>
          </div>
        )}

        <ShoppingListItemCard
          list={{ ...initialList, items: filteredItems }}
          onToggleItem={canEdit ? handleToggleComplete : noopPromise}
          onDeleteItem={canEdit ? handleDeleteItem : noopPromise}
          onUpdateItem={canEdit ? handleUpdateItem : noopPromise}
          itemPrices={itemPrices}
          isStoreSelected={!!selectedStore}
          selectedStore={selectedStore}
          totalCost={totalCost}
          potentialSavings={potentialSavings}
          storeSummary={storeSummary}
        />

        {canEdit && smartConversion.activeNotification && (
          <SmartConversionSection
            itemId={smartConversion.activeNotification.itemId}
            itemName={smartConversion.activeNotification.itemName}
            isVisible={true}
            onConversionComplete={smartConversion.handleConversionComplete}
            onDismiss={smartConversion.dismissNotification}
          />
        )}
      </>
    </div>
  );
};
