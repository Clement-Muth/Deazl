"use client";

import { Button, Input, addToast } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Modal } from "~/components/Modal/Modal";
import { createShoppingList } from "../../Api/shoppingLists/createShoppingList.api";
import { updateShoppingList } from "../../Api/shoppingLists/updateShoppingList.api";
import type { ShoppingListPayload } from "../../Domain/Schemas/ShoppingList.schema";

interface CreateEditListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list?: ShoppingListPayload | null;
  mode?: "create" | "edit";
}

export const CreateEditListModal = ({ isOpen, onClose, list, mode = "create" }: CreateEditListModalProps) => {
  const router = useRouter();
  const { t } = useLingui();
  const [name, setName] = useState(list?.name || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(list?.name || "");
    }
  }, [isOpen, list]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Please enter a name for your list</Trans>,
        variant: "solid",
        color: "danger",
        // @ts-ignore
        duration: 3000
      });
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "create") {
        const newList = await createShoppingList({
          name: name.trim()
        });

        addToast({
          title: <Trans>List created</Trans>,
          description: <Trans>Your shopping list has been created successfully</Trans>,
          variant: "solid",
          color: "success",
          // @ts-ignore
          duration: 3000
        });

        onClose();
        router.push(`/shopping-lists/${newList.id}`);
      } else if (list) {
        await updateShoppingList(list.id, {
          name: name.trim()
        });

        addToast({
          title: <Trans>List updated</Trans>,
          description: <Trans>Your shopping list has been updated successfully</Trans>,
          variant: "solid",
          color: "success",
          // @ts-ignore
          duration: 3000
        });

        onClose();
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving list:", error);
      addToast({
        title: <Trans>Error</Trans>,
        description:
          mode === "create" ? (
            <Trans>Failed to create shopping list</Trans>
          ) : (
            <Trans>Failed to update shopping list</Trans>
          ),
        variant: "solid",
        color: "danger",
        // @ts-ignore
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setName("");
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      sheetHeight="fit"
      isForm
      header={
        <div>
          <h2 className="text-xl md:text-2xl font-bold">
            {mode === "create" ? <Trans>Create New List</Trans> : <Trans>Edit List</Trans>}
          </h2>
          <p className="text-sm text-gray-500 font-normal mt-1">
            {mode === "create" ? (
              <Trans>Create a new shopping list to organize your purchases</Trans>
            ) : (
              <Trans>Update the name of your shopping list</Trans>
            )}
          </p>
        </div>
      }
      body={
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="list-name" className="text-sm font-medium">
              <Trans>List Name</Trans> <span className="text-danger">*</span>
            </label>
            <Input
              id="list-name"
              name="list-name"
              placeholder={t`e.g., Weekly Groceries, Party Shopping...`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              isRequired
              size="lg"
              classNames={{
                input: "text-base"
              }}
            />
          </div>

          {mode === "create" && (
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
              <p className="text-sm text-primary-700 dark:text-primary-300">
                💡 <Trans>Tip: You can add items to your list after creating it</Trans>
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="flat" onPress={handleClose} isDisabled={isLoading} size="lg" fullWidth>
              <Trans>Cancel</Trans>
            </Button>
            <Button color="primary" type="submit" isLoading={isLoading} size="lg" fullWidth>
              {mode === "create" ? <Trans>Create List</Trans> : <Trans>Save Changes</Trans>}
            </Button>
          </div>
        </form>
      }
      modalProps={{
        size: "2xl",
        backdrop: "blur"
      }}
    />
  );
};
