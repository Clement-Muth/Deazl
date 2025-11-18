"use client";

import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, useDisclosure } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { Edit, MoreVertical, Share2, SlidersIcon, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageHeader } from "~/components/Header/PageHeader";
import type { ShoppingListPayload } from "../../Domain/Schemas/ShoppingList.schema";
import { CreateEditListModal } from "../ShoppingLists/CreateEditListModal";
import { DeleteListModal } from "../ShoppingLists/DeleteListModal";
import { OptimizationPreferencesModal } from "../components/OptimizationPreferencesModal.simple";
import { ShareModalNew } from "./ShareListModal/ShareModalNew";

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
    <>
      {/* Header with actions */}
      <PageHeader
        title={listName}
        href="/shopping-lists"
        extra={
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Mobile: Show dropdown menu */}
              <div className="flex sm:hidden items-center gap-1">
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Button variant="light" size="sm" isIconOnly>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="List actions">
                    <DropdownItem
                      key="share"
                      startContent={<Share2 className="h-4 w-4" />}
                      onPress={handleShareList}
                    >
                      <Trans>Share</Trans>
                    </DropdownItem>
                    <DropdownItem key="edit" startContent={<Edit className="h-4 w-4" />} onPress={handleEdit}>
                      <Trans>Edit</Trans>
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                      startContent={<Trash className="h-4 w-4" />}
                      onPress={handleDelete}
                    >
                      <Trans>Delete</Trans>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>

              {/* Desktop: Show all buttons */}
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="light"
                  size="sm"
                  startContent={<Share2 className="h-4 w-4" />}
                  onPress={handleShareList}
                >
                  <Trans>Share</Trans>
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  startContent={<Edit className="h-4 w-4" />}
                  onPress={handleEdit}
                >
                  <Trans>Edit</Trans>
                </Button>
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Button variant="light" size="sm" isIconOnly>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="More actions">
                    <DropdownItem
                      key="preferences"
                      startContent={<SlidersIcon className="h-4 w-4" />}
                      onPress={preferencesModal.onOpen}
                    >
                      <Trans>Preferences</Trans>
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                      startContent={<Trash className="h-4 w-4" />}
                      onPress={handleDelete}
                    >
                      <Trans>Delete</Trans>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </div>
        }
      >
        {/* Optimize List Button */}
        {/* {list.items && list.items.length > 0 && (
          <div className="flex justify-end">
            <OptimizeListButton
              listId={shoppingListId}
              onOptimizationComplete={() => {
                router.refresh();
              }}
            />
          </div>
        )} */}
      </PageHeader>

      <ShareModalNew
        isOpen={shareModal.isOpen}
        onClose={shareModal.onClose}
        listId={shoppingListId}
        listName={listName}
        ownerId={list.userId}
      />

      <CreateEditListModal isOpen={editModal.isOpen} onClose={editModal.onClose} list={list} mode="edit" />
      <DeleteListModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
        list={list}
        redirectAfterDelete
      />
      <OptimizationPreferencesModal isOpen={preferencesModal.isOpen} onClose={preferencesModal.onClose} />
    </>
  );
};
