import {} from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { useMemo, useState } from "react";
import type { ShoppingListPayload } from "../../Domain/Schemas/ShoppingList.schema";
import { ShoppingListItemCard } from "../../Ui/ShoppingListDetails/ShoppingListItemCard";
import { SmartConversionSection } from "../../Ui/ShoppingListDetails/SmartConversionSection";
import { SmartQuickAddBar } from "../../Ui/ShoppingListDetails/SmartQuickAddBar/SmartQuickAddBar";
import { useOptimalPricing } from "../../Ui/ShoppingListDetails/useOptimalPricing";
import { useShoppingListActions } from "../../Ui/ShoppingListDetails/useShoppingListActions";
import { useStore } from "../Contexts/StoreContext";
import { useUserOptimizationPreferences } from "../Hooks/useUserOptimizationPreferences";

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

  // Get selected store from context
  const { selectedStore } = useStore();

  // Get user optimization preferences
  const { preferences: userPreferences } = useUserOptimizationPreferences();

  // Filter state for completed items
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  // Filter items based on completion status
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

  console.warn("Rendering ShoppingListContainer with items:", items);
  // Optimal pricing hook - prix intelligents selon magasin sélectionné et préférences
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
      {/* Filter Tabs */}
      {/* <div className="flex justify-end">
        <ButtonGroup size="sm" variant="flat">
          <Button color={filter === "all" ? "primary" : "default"} onPress={() => setFilter("all")}>
            <Trans>All</Trans> ({items.length})
          </Button>
          <Button color={filter === "active" ? "primary" : "default"} onPress={() => setFilter("active")}>
            <Trans>Active</Trans> ({items.filter((i) => !i.isCompleted).length})
          </Button>
          <Button
            color={filter === "completed" ? "primary" : "default"}
            onPress={() => setFilter("completed")}
          >
            <Trans>Completed</Trans> ({items.filter((i) => i.isCompleted).length})
          </Button>
        </ButtonGroup>
      </div> */}

      {/* UI */}
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

        {/* Render item list */}
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

        {/* Smart Conversion Section */}
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
