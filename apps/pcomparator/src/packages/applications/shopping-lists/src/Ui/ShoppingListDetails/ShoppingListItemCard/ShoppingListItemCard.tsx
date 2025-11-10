import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  addToast,
  useDisclosure
} from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { InfoIcon, SaveIcon, ShoppingCartIcon } from "lucide-react";
import { useState } from "react";
import type { ShoppingListItemPayload } from "../../../Domain/Entities/ShoppingListItem.entity";
import type { ShoppingListPayload } from "../../../Domain/Schemas/ShoppingList.schema";
import type { BestPriceResult } from "../../../Domain/Utils/priceComparison";
import { StoreSelector } from "../../../Ui/ShoppingListDetails/StoreSelector";
import { ShoppingListItemList } from "./ShoppingListItemList";
import { useUndoDelete } from "./useUndoDelete";

export const ShoppingListItemCard = ({
  list,
  onToggleItem,
  onDeleteItem,
  onUpdateItem,
  bestPrices,
  isStoreSelected = false
}: {
  list: ShoppingListPayload;
  onToggleItem: (itemId: string, isCompleted: boolean) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onUpdateItem: (itemId: string, data: Partial<ShoppingListItemPayload>) => Promise<void>;
  bestPrices?: Record<string, BestPriceResult | null>;
  isStoreSelected?: boolean;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState<ShoppingListItemPayload | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { scheduleDelete, undoDelete, isPendingDelete } = useUndoDelete();

  const handleOpenEditModal = (item: ShoppingListItemPayload) => {
    setSelectedItem(item);
    setQuantity(item.quantity.toString());
    onOpen();
  };

  const handleUpdateQuantity = async () => {
    if (!selectedItem) return;

    setIsSubmitting(true);
    try {
      await onUpdateItem(selectedItem.id, {
        quantity: Number.parseFloat(quantity)
      });
      onClose();
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleItemToggle = async (itemId: string, isCompleted: boolean) => {
    setLoading((prev) => ({ ...prev, [itemId]: true }));
    try {
      await onToggleItem(itemId, isCompleted);
    } finally {
      setLoading((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleDeleteItem = (itemId: string) => {
    const item = list.items?.find((i) => i.id === itemId);
    const itemName = item?.customName || `Product #${item?.productId?.substring(0, 8) || "Unknown"}`;

    // Schedule deletion immediately
    scheduleDelete(
      itemId,
      item,
      async () => {
        try {
          await onDeleteItem(itemId);
        } catch (error) {
          console.error("Error deleting item:", error);
        }
      },
      5000
    );

    // Show toast notification
    addToast({
      title: "Item deleted",
      description: itemName,
      color: "default",
      variant: "solid"
    });
  };

  const handleUndoDelete = (itemId: string) => {
    const item = list.items?.find((i) => i.id === itemId);
    const itemName = item?.customName || `Product #${item?.productId?.substring(0, 8) || "Unknown"}`;

    undoDelete(itemId);

    addToast({
      title: "Deletion cancelled",
      description: itemName,
      color: "success",
      variant: "solid"
    });
  };

  const stats = {
    total: list.items?.length || 0,
    checked: list.items?.filter((i) => i.isCompleted).length || 0,
    hasPrices: list.items?.some((i) => i.price || bestPrices?.[i.id]) || false,
    totalAmount:
      list.items?.reduce((sum, i) => {
        const price = i.price || bestPrices?.[i.id]?.price.amount || 0;
        return sum + price * i.quantity;
      }, 0) || 0
  };

  return (
    <>
      <Card className="shadow-sm border border-gray-100 hover:border-gray-200 transition-colors">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-2 w-full">
            <StoreSelector />

            {list.description && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <InfoIcon size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-700">{list.description}</p>
                  {stats.total > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      {stats.checked} / {stats.total} <Trans>items completed</Trans>
                      {stats.hasPrices && (
                        <>
                          {" • "}
                          <span className="font-semibold">{stats.totalAmount.toFixed(2)}€</span>
                        </>
                      )}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardBody>
          {list.items?.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">
                <Trans>Your shopping list is empty</Trans>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                <Trans>Add items using the quick add bar above</Trans>
              </p>
            </div>
          ) : (
            <ShoppingListItemList
              items={list.items as any}
              loading={loading}
              handleToggleComplete={handleItemToggle}
              onOpenEditModal={handleOpenEditModal}
              onDeleteItem={handleDeleteItem}
              onUndoDelete={handleUndoDelete}
              isPendingDelete={isPendingDelete}
              bestPrices={bestPrices}
              isStoreSelected={isStoreSelected}
            />
          )}
        </CardBody>
      </Card>

      {/* Simple quantity edit modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="sm">
        <ModalContent>
          <ModalHeader>
            <Trans>Edit Quantity</Trans>
          </ModalHeader>
          <ModalBody>
            {selectedItem && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">{selectedItem.customName || "Product"}</p>
                <Input
                  label={<Trans>Quantity</Trans>}
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="0.01"
                  step="0.01"
                  autoFocus
                  endContent={<span className="text-xs text-gray-400">{selectedItem.unit}</span>}
                />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              <Trans>Cancel</Trans>
            </Button>
            <Button
              color="primary"
              onPress={handleUpdateQuantity}
              isLoading={isSubmitting}
              startContent={<SaveIcon size={16} />}
            >
              <Trans>Save</Trans>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
