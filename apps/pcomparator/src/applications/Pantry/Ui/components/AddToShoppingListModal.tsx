"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
  RadioGroup,
  Spinner
} from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { CheckCircle2, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { addItemToList } from "~/applications/ShoppingLists/Api/items/addItemToList.api";
import { listUserShoppingList } from "~/applications/ShoppingLists/Api/shoppingLists/listUserShoppingList.api";
import type { ShoppingListPayload } from "~/applications/ShoppingLists/Domain/Schemas/ShoppingList.schema";
import type { PantryItemPayload } from "../../Domain/Schemas/PantryItem.schema";

interface AddToShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PantryItemPayload | null;
}

export const AddToShoppingListModal = ({ isOpen, onClose, item }: AddToShoppingListModalProps) => {
  const { t } = useLingui();
  const [isPending, startTransition] = useTransition();
  const [lists, setLists] = useState<ShoppingListPayload[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setSuccess(false);
      listUserShoppingList()
        .then((data) => {
          setLists(data);
          if (data.length > 0) {
            setSelectedListId(data[0].id);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  const handleAddToList = () => {
    if (!selectedListId || !item) return;

    startTransition(async () => {
      try {
        await addItemToList(selectedListId, {
          productId: item.productId,
          customName: item.name,
          quantity: item.quantity,
          unit: item.unit
        });
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      } catch (error) {
        console.error("Failed to add item to list:", error);
      }
    });
  };

  const handleClose = () => {
    setSuccess(false);
    setSelectedListId(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="sm" placement="center">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <Trans>Add to Shopping List</Trans>
        </ModalHeader>

        <ModalBody>
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="p-3 rounded-full bg-success-100 dark:bg-success-900/30">
                <CheckCircle2 className="h-8 w-8 text-success-500" />
              </div>
              <p className="text-center font-medium text-foreground">
                <Trans>Added to shopping list!</Trans>
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : lists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
              <div className="p-3 rounded-full bg-default-100 dark:bg-default-800">
                <ShoppingCart className="h-6 w-6 text-default-400" />
              </div>
              <p className="text-default-500">
                <Trans>No shopping lists yet</Trans>
              </p>
              <p className="text-xs text-default-400">
                <Trans>Create a shopping list first to add items</Trans>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                <p className="font-medium text-primary-900 dark:text-primary-100">{item?.name}</p>
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  {item?.quantity} {item?.unit}
                </p>
              </div>

              <RadioGroup
                label={<Trans>Select a list</Trans>}
                value={selectedListId ?? undefined}
                onValueChange={setSelectedListId}
                classNames={{
                  wrapper: "gap-2"
                }}
              >
                {lists.map((list) => (
                  <Radio
                    key={list.id}
                    value={list.id}
                    classNames={{
                      base: "m-0 p-3 rounded-lg border border-default-200 dark:border-default-700 hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer transition-colors data-[selected=true]:border-primary data-[selected=true]:bg-primary-50 dark:data-[selected=true]:bg-primary-900/20",
                      label: "font-medium"
                    }}
                  >
                    {list.name}
                  </Radio>
                ))}
              </RadioGroup>
            </div>
          )}
        </ModalBody>

        {!success && lists.length > 0 && (
          <ModalFooter>
            <Button variant="flat" onPress={handleClose} className="touch-manipulation">
              <Trans>Cancel</Trans>
            </Button>
            <Button
              color="primary"
              onPress={handleAddToList}
              isLoading={isPending}
              isDisabled={!selectedListId}
              startContent={!isPending && <Plus className="h-4 w-4" />}
              className="touch-manipulation"
            >
              <Trans>Add to List</Trans>
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};
