"use client";

import { Button, Tooltip, useDisclosure } from "@heroui/react";
import { ArrowLeftIcon, MoreVerticalIcon, SlidersIcon, UserPlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ShoppingListPayload } from "../../Domain/Schemas/ShoppingList.schema";
import { CreateEditListModal } from "../ShoppingLists/CreateEditListModal";
import { DeleteListModal } from "../ShoppingLists/DeleteListModal";
import { OptimizationPreferencesModal } from "../components/OptimizationPreferencesModal.simple";
import { MoreActionModal } from "./MoreActionModal";
import { OptimizeListButton } from "./OptimizeListButton";
import ShareListModal from "./ShareListModal/ShareListModal";

interface ShoppingListPageHeaderProps {
  shoppingListId: string;
  listName: string;
  list: ShoppingListPayload;
}

export const ShoppingListDetailsHeader = ({
  shoppingListId,
  listName,
  list
}: ShoppingListPageHeaderProps) => {
  const router = useRouter();
  const actionsModal = useDisclosure();
  const shareModal = useDisclosure();
  const editModal = useDisclosure();
  const deleteModal = useDisclosure();
  const preferencesModal = useDisclosure();

  const handleShareList = () => {
    shareModal.onOpen();
  };

  const handleEdit = () => {
    editModal.onOpen();
  };

  const handleDelete = () => {
    deleteModal.onOpen();
  };

  return (
    <div className="flex flex-col gap-4 mb-6 pb-4 border-b border-gray-200">
      {/* Ligne des boutons */}
      <div className="flex items-center justify-between">
        <Button
          variant="light"
          size="lg"
          startContent={<ArrowLeftIcon className="h-4 w-4" />}
          className="text-primary-500 hover:shadow-sm transition-all px-0 min-w-0"
          onPress={() => router.push("/shopping-lists")}
        >
          {listName} (Personal)
        </Button>

        <div className="flex items-center gap-2">
          <Tooltip content="Invite someone to collaborate">
            <Button variant="light" size="md" isIconOnly onPress={handleShareList}>
              <UserPlusIcon className="h-4 w-4" />
            </Button>
          </Tooltip>

          <Tooltip content="More actions">
            <Button isIconOnly variant="light" size="md" onPress={actionsModal.onOpen}>
              <MoreVerticalIcon className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Optimize List Button */}
      {list.items && list.items.length > 0 && (
        <div className="flex justify-end gap-2">
          <Tooltip content="Adjust optimization preferences">
            <Button
              variant="flat"
              size="md"
              onPress={preferencesModal.onOpen}
              startContent={<SlidersIcon className="h-4 w-4" />}
            >
              Preferences
            </Button>
          </Tooltip>
          <OptimizeListButton
            listId={shoppingListId}
            onOptimizationComplete={() => {
              // Refresh the page to show updated prices
              router.refresh();
            }}
          />
        </div>
      )}

      <MoreActionModal
        isOpen={actionsModal.isOpen}
        onClose={actionsModal.onClose}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onShare={handleShareList}
        shoppingListId={shoppingListId}
      />

      <ShareListModal
        isOpen={shareModal.isOpen}
        onCloseAction={shareModal.onClose}
        listId={shoppingListId}
        listName={listName}
      />

      <CreateEditListModal isOpen={editModal.isOpen} onClose={editModal.onClose} list={list} mode="edit" />
      <DeleteListModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
        list={list}
        redirectAfterDelete
      />
      <OptimizationPreferencesModal isOpen={preferencesModal.isOpen} onClose={preferencesModal.onClose} />
    </div>
  );
};
