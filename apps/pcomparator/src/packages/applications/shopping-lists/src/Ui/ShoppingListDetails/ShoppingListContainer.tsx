import { Button, ButtonGroup, Switch } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { List, Package } from "lucide-react";
import { useMemo, useState } from "react";
import { removeRecipeItemsFromList } from "../../Api/items/removeRecipeItemsFromList.api";
import type { ShoppingListPayload } from "../../Domain/Schemas/ShoppingList.schema";
import { groupItemsByRecipe } from "../../Domain/Utils/groupByRecipe";
import { RecipeGroup } from "../../Ui/ShoppingListDetails/RecipeGroup";
import { ShoppingListItemCard } from "../../Ui/ShoppingListDetails/ShoppingListItemCard";
import { ShoppingModeScanner } from "../../Ui/ShoppingListDetails/ShoppingModeScanner";
import { SmartConversionSection } from "../../Ui/ShoppingListDetails/SmartConversionSection";
import { SmartQuickAddBar } from "../../Ui/ShoppingListDetails/SmartQuickAddBar/SmartQuickAddBar";
import { TotalCostSummary } from "../../Ui/ShoppingListDetails/TotalCostSummary";
import { usePriceSuggestions } from "../../Ui/ShoppingListDetails/usePriceSuggestions";
import { useShoppingListActions } from "../../Ui/ShoppingListDetails/useShoppingListActions";
import { useStore } from "../Contexts/StoreContext";

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

  // Shopping mode state
  const [isShoppingMode, setIsShoppingMode] = useState(false);

  // Recipe grouping view state
  const [viewMode, setViewMode] = useState<"flat" | "grouped">("flat");

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

  // Group items by recipe when in grouped view
  const recipeGroups = useMemo(() => {
    if (viewMode === "flat") return [];
    return groupItemsByRecipe(filteredItems);
  }, [filteredItems, viewMode]);

  // Price suggestions hook with selected store
  const {
    bestPrices,
    totalCost,
    potentialSavings,
    bestStoreName,
    loading: pricesLoading
  } = usePriceSuggestions(items, selectedStore?.id);

  const canEdit = useMemo(() => {
    if (!user?.id) return false;

    if (initialList.userId === user.id) return true;

    const collaborators = initialList.collaborators ?? [];
    const userRole = collaborators.find((c) => c.userId === user.id)?.role;
    return userRole ? ["OWNER", "EDITOR"].includes(userRole) : false;
  }, [initialList.userId, initialList.collaborators, user.id]);

  const handleRemoveAllRecipeItems = async (recipeId: string) => {
    try {
      const result = await removeRecipeItemsFromList({
        listId: initialList.id,
        recipeId
      });

      if (result.success) {
        // Refresh the items list by triggering a re-render
        // The items will be automatically updated via useShoppingListActions
        window.location.reload();
      }
    } catch (error) {
      console.error("Error removing recipe items:", error);
      alert("Failed to remove recipe items. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Shopping Mode Toggle and View Mode Selector */}
      {canEdit && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-800">
              {isShoppingMode ? <Trans>Shopping Mode</Trans> : <Trans>Preparation Mode</Trans>}
            </h2>
            <Switch onChange={() => setIsShoppingMode(!isShoppingMode)} size="sm" />
          </div>

          {/* View Mode Toggle */}
          {!isShoppingMode && (
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Filter Tabs */}
              <ButtonGroup size="sm" variant="flat">
                <Button color={filter === "all" ? "primary" : "default"} onPress={() => setFilter("all")}>
                  <Trans>All</Trans> ({items.length})
                </Button>
                <Button
                  color={filter === "active" ? "primary" : "default"}
                  onPress={() => setFilter("active")}
                >
                  <Trans>Active</Trans> ({items.filter((i) => !i.isCompleted).length})
                </Button>
                <Button
                  color={filter === "completed" ? "primary" : "default"}
                  onPress={() => setFilter("completed")}
                >
                  <Trans>Completed</Trans> ({items.filter((i) => i.isCompleted).length})
                </Button>
              </ButtonGroup>

              {/* View Mode Toggle */}
              <ButtonGroup size="sm" variant="flat">
                <Button
                  color={viewMode === "flat" ? "primary" : "default"}
                  onPress={() => setViewMode("flat")}
                  startContent={<List className="h-4 w-4" />}
                >
                  <Trans>List</Trans>
                </Button>
                <Button
                  color={viewMode === "grouped" ? "primary" : "default"}
                  onPress={() => setViewMode("grouped")}
                  startContent={<Package className="h-4 w-4" />}
                >
                  <Trans>Recipe</Trans>
                </Button>
              </ButtonGroup>
            </div>
          )}
        </div>
      )}

      {/* Shopping Mode Scanner */}
      {canEdit && isShoppingMode && (
        <ShoppingModeScanner
          items={items}
          onItemToggleAction={async (itemId, isCompleted) => {
            await handleToggleComplete(itemId, isCompleted);
            setIsShoppingMode(false);
          }}
          onItemAddAction={handleAddItem}
          onCloseAction={() => setIsShoppingMode(false)}
        />
      )}

      {/* Normal Mode UI */}
      {!isShoppingMode && (
        <>
          {canEdit ? (
            <SmartQuickAddBar
              listId={initialList.id}
              onItemAdded={handleAddItem}
              className="flex-1 min-w-[260px]"
            />
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <p className="text-sm text-yellow-700">
                <Trans>You have view-only access to this list. Contact the owner to make changes.</Trans>
              </p>
            </div>
          )}

          {/* Total Cost Summary */}
          {totalCost > 0 && (
            <TotalCostSummary
              totalCost={totalCost}
              potentialSavings={potentialSavings}
              bestStoreName={bestStoreName || undefined}
              itemCount={items.length}
              completedCount={items.filter((i) => i.isCompleted).length}
            />
          )}

          {/* Render based on view mode */}
          {viewMode === "flat" ? (
            <ShoppingListItemCard
              list={{ ...initialList, items: filteredItems }}
              onToggleItem={canEdit ? handleToggleComplete : noopPromise}
              onDeleteItem={canEdit ? handleDeleteItem : noopPromise}
              onUpdateItem={canEdit ? handleUpdateItem : noopPromise}
              bestPrices={bestPrices}
              isStoreSelected={!!selectedStore}
            />
          ) : (
            <div className="space-y-3">
              {recipeGroups.map((group) => (
                <RecipeGroup
                  key={group.recipeId ?? "ungrouped"}
                  group={group}
                  onToggleItem={canEdit ? handleToggleComplete : noopPromise}
                  onDeleteItem={canEdit ? handleDeleteItem : noopPromise}
                  onUpdateItem={canEdit ? handleUpdateItem : noopPromise}
                  onRemoveAllRecipeItems={canEdit ? handleRemoveAllRecipeItems : undefined}
                  renderItem={(item) => (
                    <ShoppingListItemCard
                      list={{ ...initialList, items: [item] }}
                      onToggleItem={canEdit ? handleToggleComplete : noopPromise}
                      onDeleteItem={canEdit ? handleDeleteItem : noopPromise}
                      onUpdateItem={canEdit ? handleUpdateItem : noopPromise}
                      bestPrices={bestPrices}
                      isStoreSelected={!!selectedStore}
                    />
                  )}
                />
              ))}
            </div>
          )}

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
      )}
    </div>
  );
};
