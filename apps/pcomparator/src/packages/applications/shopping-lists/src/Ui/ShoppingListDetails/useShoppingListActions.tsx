import { addToast } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { removeItemFromList } from "../../Api/items/removeItemFromList.api";
import { toggleItemComplete } from "../../Api/items/toggleItemComplete.api";
import { updateShoppingListItem } from "../../Api/items/updateShoppingListItem.api";
import type { ShoppingListItemPayload } from "../../Domain/Entities/ShoppingListItem.entity";
import type { ShoppingListPayload } from "../../Domain/Schemas/ShoppingList.schema";
import { useSmartConversionNotifications } from "../../Ui/Hooks/useSmartConversionNotifications";

export const useShoppingListActions = (initialList: ShoppingListPayload) => {
  const router = useRouter();
  const [items, setItems] = useState<ShoppingListItemPayload[]>(initialList.items || []);

  // Intégration des notifications de conversion intelligente
  const {
    activeNotification,
    handleItemCompleted: notifyItemCompleted,
    handleConversionComplete,
    dismissNotification,
    hasOpportunities
  } = useSmartConversionNotifications({
    listId: initialList.id,
    onItemCompleted: (itemId, itemName) => {}
  });

  const handleAddItem = (newItem: ShoppingListItemPayload) => {
    setItems((prevItems) => [...prevItems, newItem]);
    // Recharger les données depuis le serveur pour obtenir les calculs de prix
    router.refresh();
  };

  const handleToggleComplete = useCallback(
    async (itemId: string, isCompleted: boolean) => {
      try {
        const item = items.find((item) => item.id === itemId);

        setItems((currentItems) =>
          currentItems.map((item) => (item.id === itemId ? { ...item, isCompleted } : item))
        );

        await toggleItemComplete(itemId, isCompleted);

        // Recharger les données depuis le serveur
        router.refresh();

        if (isCompleted) {
          // Déclencher la notification de conversion intelligente
          if (item?.productId) {
            notifyItemCompleted(itemId, item.product?.name || "Unnamed item");
          }

          addToast({
            title: <Trans>Item completed</Trans>,
            description: <Trans>Item marked as completed</Trans>,
            variant: "solid",
            color: "success"
          });
        }
      } catch (error) {
        setItems((currentItems) =>
          currentItems.map((item) => (item.id === itemId ? { ...item, isCompleted: !isCompleted } : item))
        );

        addToast({
          title: <Trans>Error</Trans>,
          description: <Trans>Failed to update item status</Trans>,
          variant: "solid",
          color: "danger"
        });
      }
    },
    [items, notifyItemCompleted]
  );

  const handleUpdateItem = useCallback(async (itemId: string, data: Partial<ShoppingListItemPayload>) => {
    try {
      const currentItem = items.find((item) => item.id === itemId);
      if (!currentItem) return;

      setItems((currentItems) =>
        currentItems.map((item) => (item.id === itemId ? { ...item, ...data } : item))
      );

      await updateShoppingListItem(itemId, data);

      // Recharger les données depuis le serveur
      router.refresh();

      addToast({
        title: <Trans>Item updated</Trans>,
        description: <Trans>Item details have been updated</Trans>,
        variant: "solid",
        color: "primary"
      });
    } catch (error) {
      console.error("Error updating item:", error);

      setItems((currentItems) => [...currentItems]);

      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Failed to update item</Trans>,
        variant: "solid",
        color: "danger"
      });
    }
  }, []);

  const handleDeleteItem = useCallback(async (itemId: string) => {
    try {
      const removedItem = items.find((item) => item.id === itemId);
      setItems((currentItems) => currentItems.filter((item) => item.id !== itemId));

      await removeItemFromList(itemId);

      // Recharger les données depuis le serveur
      router.refresh();

      addToast({
        title: <Trans>Item removed</Trans>,
        description: removedItem?.product?.name ? (
          <Trans>Removed {removedItem.product.name}</Trans>
        ) : (
          <Trans>Item removed from list</Trans>
        ),
        variant: "solid",
        color: "primary"
      });
    } catch (error) {
      setItems((prevItems) => [...prevItems]);

      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Failed to remove item</Trans>,
        variant: "solid",
        color: "danger"
      });
    }
  }, []);

  return {
    items,
    handleAddItem,
    handleToggleComplete,
    handleUpdateItem,
    handleDeleteItem,
    // Smart conversion props
    smartConversion: {
      activeNotification,
      handleConversionComplete,
      dismissNotification,
      hasOpportunities
    }
  };
};
