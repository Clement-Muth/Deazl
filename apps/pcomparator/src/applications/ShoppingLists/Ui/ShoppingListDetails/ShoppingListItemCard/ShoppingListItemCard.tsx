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
  useDisclosure
} from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { SaveIcon, ShoppingCartIcon } from "lucide-react";
import { useState } from "react";
import type { ShoppingListItemPayload } from "../../../Domain/Entities/ShoppingListItem.entity";
import type { ShoppingListPayload } from "../../../Domain/Schemas/ShoppingList.schema";
import type { ItemOptimalPrice } from "../../../Domain/Services/OptimalPricingService";
import { StoreSelector } from "../StoreSelector";
import { TotalCostSummary } from "../TotalCostSummary";
import { ShoppingListItemList } from "./ShoppingListItemList";

export const ShoppingListItemCard = ({
  list,
  onToggleItem,
  onDeleteItem,
  onUpdateItem,
  itemPrices,
  isStoreSelected = false,
  selectedStore,
  totalCost = 0,
  potentialSavings = 0,
  storeSummary = []
}: {
  list: ShoppingListPayload;
  onToggleItem: (itemId: string, isCompleted: boolean) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onUpdateItem: (itemId: string, data: Partial<ShoppingListItemPayload>) => Promise<void>;
  itemPrices: Record<string, ItemOptimalPrice>;
  isStoreSelected?: boolean;
  selectedStore?: { id: string; name: string; location: string } | null;
  totalCost?: number;
  potentialSavings?: number;
  storeSummary: Array<{ storeId: string; storeName: string; itemCount: number; subtotal: number }>;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState<ShoppingListItemPayload | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

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

  const handleDeleteItem = async (itemId: string) => {
    setLoading((prev) => ({ ...prev, [itemId]: true }));
    try {
      await onDeleteItem(itemId);
    } finally {
      setLoading((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const stats = {
    total: list.items?.length || 0,
    checked: list.items?.filter((i) => i.isCompleted).length || 0,
    hasPrices: list.items?.some((i) => itemPrices[i.id]?.selectedPrice) || false,
    totalAmount: totalCost
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 w-full">
            <StoreSelector />

            {totalCost > 0 && (
              <TotalCostSummary
                totalCost={totalCost}
                potentialSavings={potentialSavings}
                storeSummary={storeSummary}
                itemCount={list.items?.length || 0}
                completedCount={list.items?.filter((i) => i.isCompleted).length || 0}
              />
            )}
          </div>
        </CardHeader>

        <CardBody>
          {list.items?.length === 0 ? (
            <Card>
              <CardBody className="text-center py-8 space-y-4">
                <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div>
                  <h3 className="text-foreground font-medium">
                    <Trans>Your shopping list is empty</Trans>
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    <Trans>Add items using the quick add bar above</Trans>
                  </p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <ShoppingListItemList
              items={list.items as any}
              loading={loading}
              handleToggleComplete={handleItemToggle}
              onOpenEditModal={handleOpenEditModal}
              onDeleteItem={handleDeleteItem}
              itemPrices={itemPrices}
              isStoreSelected={isStoreSelected}
              selectedStore={selectedStore}
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
                <p className="text-sm text-gray-600">{selectedItem.product?.name || "Product"}</p>
                <Input
                  label={<Trans>Quantity</Trans>}
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="0.01"
                  step="0.01"
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
