"use client";

import { Button, addToast } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { AlertTriangleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal } from "~/components/Modal/Modal";
import { deleteShoppingList } from "../../Api/shoppingLists/deleteShoppingList.api";
import type { ShoppingListPayload } from "../../Domain/Schemas/ShoppingList.schema";

interface DeleteListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: ShoppingListPayload | null;
  redirectAfterDelete?: boolean;
}

export const DeleteListModal = ({
  isOpen,
  onClose,
  list,
  redirectAfterDelete = false
}: DeleteListModalProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!list) return;

    setIsDeleting(true);

    try {
      await deleteShoppingList(list.id);

      addToast({
        title: <Trans>List deleted</Trans>,
        description: <Trans>Shopping list deleted successfully</Trans>,
        variant: "solid",
        color: "success",
        // @ts-ignore
        duration: 3000
      });

      onClose();

      if (redirectAfterDelete) {
        router.push("/shopping-lists");
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting list:", error);

      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Failed to delete shopping list</Trans>,
        variant: "solid",
        color: "danger",
        // @ts-ignore
        duration: 3000
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!list) return null;

  const hasItems = list.totalItems > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      sheetHeight="fit"
      header={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-danger-100 dark:bg-danger-900/30 rounded-full">
            <AlertTriangleIcon className="h-5 w-5 text-danger-600 dark:text-danger-400" />
          </div>
          <h2 className="text-xl font-bold text-danger-600 dark:text-danger-400">
            <Trans>Delete List</Trans>
          </h2>
        </div>
      }
      body={
        <div className="space-y-4">
          <p className="text-base">
            <Trans>
              Are you sure you want to delete <strong>"{list.name}"</strong>?
            </Trans>
          </p>

          {hasItems && (
            <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
              <p className="text-sm text-warning-800 dark:text-warning-300">
                ⚠️{" "}
                <Trans>
                  This list contains <strong>{list.totalItems} item(s)</strong>. All items will be permanently
                  deleted.
                </Trans>
              </p>
            </div>
          )}

          <p className="text-sm text-gray-600 dark:text-gray-400">
            <Trans>This action cannot be undone.</Trans>
          </p>
        </div>
      }
      footer={
        <div className="flex gap-2 w-full">
          <Button variant="flat" onPress={onClose} isDisabled={isDeleting} size="lg" fullWidth>
            <Trans>Cancel</Trans>
          </Button>
          <Button color="danger" onPress={handleDelete} isLoading={isDeleting} size="lg" fullWidth>
            <Trans>Delete List</Trans>
          </Button>
        </div>
      }
      modalProps={{
        size: "lg",
        backdrop: "blur"
      }}
    />
  );
};
