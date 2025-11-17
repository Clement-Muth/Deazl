"use client";

import { Button, Input, Select, SelectItem } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Plus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { addProductItemToList } from "~/applications/ShoppingLists/Api/addProductItemToList.api";
import { listUserShoppingList } from "~/applications/ShoppingLists/Api/shoppingLists/listUserShoppingList.api";
import type { ShoppingListPayload } from "~/applications/ShoppingLists/Domain/Schemas/ShoppingList.schema";
import { Modal } from "~/components/Modal/Modal";

interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

export function AddToListModal({ isOpen, onClose, productId, productName }: AddToListModalProps) {
  const { t } = useLingui();
  const [lists, setLists] = useState<ShoppingListPayload[]>([]);
  const [selectedListId, setSelectedListId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("unit");
  const [loading, setLoading] = useState(false);
  const [loadingLists, setLoadingLists] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadLists();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setQuantity("1");
      setUnit("unit");
      setSelectedListId("");
    }
  }, [isOpen]);

  const loadLists = async () => {
    try {
      setLoadingLists(true);
      const userLists = await listUserShoppingList();
      if (userLists) {
        setLists(userLists);
        if (userLists.length > 0) {
          setSelectedListId(userLists[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load lists:", error);
    } finally {
      setLoadingLists(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedListId) return;

    try {
      setLoading(true);

      await addProductItemToList(selectedListId, {
        productId,
        productName,
        quantity: Number.parseFloat(quantity),
        unit,
        isCompleted: false
      });

      onClose();
    } catch (error) {
      console.error("Failed to add to list:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header={<Trans>Add to Shopping List</Trans>}
      body={
        <div className="space-y-4">
          <div className="rounded-lg bg-default-100 p-3">
            <p className="text-sm font-medium text-default-700">{productName}</p>
          </div>

          {loadingLists ? (
            <div className="py-8 text-center">
              <p className="text-sm text-default-500">
                <Trans>Loading your lists...</Trans>
              </p>
            </div>
          ) : lists.length === 0 ? (
            <div className="py-8 text-center">
              <ShoppingCart className="mx-auto mb-2 h-12 w-12 text-default-300" />
              <p className="text-sm text-default-500">
                <Trans>You don't have any shopping lists yet</Trans>
              </p>
            </div>
          ) : (
            <>
              <Select
                label={t`Shopping List`}
                selectedKeys={selectedListId ? [selectedListId] : []}
                onSelectionChange={(keys) => setSelectedListId(Array.from(keys)[0] as string)}
                startContent={<ShoppingCart className="h-4 w-4" />}
                isRequired
              >
                {lists.map((list) => (
                  <SelectItem key={list.id}>
                    {list.name} ({list.totalItems} {t`items`})
                  </SelectItem>
                ))}
              </Select>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={t`Quantity`}
                  type="number"
                  step="0.1"
                  min="0"
                  value={quantity}
                  onValueChange={setQuantity}
                  isRequired
                />

                <Select
                  label={t`Unit`}
                  selectedKeys={[unit]}
                  onSelectionChange={(keys) => setUnit(Array.from(keys)[0] as string)}
                >
                  <SelectItem key="unit">{t`Unit`}</SelectItem>
                  <SelectItem key="kg">{t`Kilogram`}</SelectItem>
                  <SelectItem key="g">{t`Gram`}</SelectItem>
                  <SelectItem key="l">{t`Liter`}</SelectItem>
                  <SelectItem key="ml">{t`Milliliter`}</SelectItem>
                </Select>
              </div>
            </>
          )}
        </div>
      }
      footer={
        <div className="flex gap-2">
          <Button variant="flat" onPress={onClose} fullWidth>
            <Trans>Cancel</Trans>
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={loading}
            isDisabled={
              !selectedListId ||
              !quantity ||
              Number.parseFloat(quantity) <= 0 ||
              loadingLists ||
              lists.length === 0
            }
            startContent={!loading && <Plus className="h-4 w-4" />}
            fullWidth
          >
            <Trans>Add to List</Trans>
          </Button>
        </div>
      }
    />
  );
}
