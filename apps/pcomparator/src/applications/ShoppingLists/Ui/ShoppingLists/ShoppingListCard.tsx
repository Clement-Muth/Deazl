"use client";

import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, useDisclosure } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  Edit3Icon,
  GlobeIcon,
  MoreVerticalIcon,
  Share2Icon,
  ShoppingBagIcon,
  TrashIcon,
  UsersIcon
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type CardAction, PressableCard } from "~/components/PressableCard";
import type { ShoppingListPayload } from "../../Domain/Schemas/ShoppingList.schema";
import { CreateEditListModal } from "./CreateEditListModal";
import { DeleteListModal } from "./DeleteListModal";

export interface ShoppingListCardProps {
  list: ShoppingListPayload;
  userRole?: "OWNER" | "EDITOR" | "VIEWER";
}

export const ShoppingListCard = ({ list, userRole }: ShoppingListCardProps) => {
  const router = useRouter();
  const isOwner = true;
  const editModal = useDisclosure();
  const deleteModal = useDisclosure();
  const hasCollaborators = list.collaborators && list.collaborators.length > 0;

  const cardActions: CardAction[] = isOwner
    ? [
        {
          key: "edit",
          label: <Trans>Edit List</Trans>,
          icon: <Edit3Icon className="h-5 w-5" />,
          variant: "light",
          onAction: () => editModal.onOpen()
        },
        {
          key: "share",
          label: <Trans>Share List</Trans>,
          icon: <Share2Icon className="h-5 w-5" />,
          variant: "light",
          onAction: () => {}
        },
        {
          key: "delete",
          label: <Trans>Delete List</Trans>,
          icon: <TrashIcon className="h-5 w-5" />,
          variant: "solid",
          color: "danger",
          onAction: () => deleteModal.onOpen()
        }
      ]
    : [];

  const progressPercent = list.totalItems > 0 ? (list.completedItems / list.totalItems) * 100 : 0;
  const isComplete = progressPercent === 100;

  return (
    <motion.div layout>
      <PressableCard
        actions={cardActions}
        onPress={() => router.push(`/shopping-lists/${list.id}`)}
        className="min-h-40"
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-semibold text-lg line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex-1">
              {list.name}
            </h2>
            <div className="flex items-center gap-2 shrink-0">
              {hasCollaborators && (
                <div
                  className="p-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                  title="Shared list"
                >
                  <UsersIcon className="h-4 w-4" />
                </div>
              )}
              {list.isPublic && (
                <div
                  className="p-1.5 rounded-full bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400"
                  title="Public list"
                >
                  <GlobeIcon className="h-4 w-4" />
                </div>
              )}
              {isOwner && (
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      className="min-w-11 min-h-11 touch-manipulation opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    >
                      <MoreVerticalIcon className="h-5 w-5" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="List actions"
                    onAction={(key) => {
                      if (key === "edit") {
                        editModal.onOpen();
                      } else if (key === "delete") {
                        deleteModal.onOpen();
                      }
                    }}
                  >
                    <DropdownItem key="share" startContent={<Share2Icon className="h-4 w-4" />}>
                      <Trans>Share List</Trans>
                    </DropdownItem>
                    <DropdownItem key="edit" startContent={<Edit3Icon className="h-4 w-4" />}>
                      <Trans>Edit List</Trans>
                    </DropdownItem>
                    <DropdownItem key="duplicate" startContent={<CalendarIcon className="h-4 w-4" />}>
                      <Trans>Duplicate List</Trans>
                    </DropdownItem>
                    <DropdownItem
                      className="text-danger"
                      color="danger"
                      key="delete"
                      startContent={<TrashIcon className="h-4 w-4" />}
                    >
                      <Trans>Delete List</Trans>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              )}
            </div>
          </div>

          <div className="my-4 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-default-500">
              <ShoppingBagIcon className="h-4 w-4" />
              <span>
                {list.totalItems} <Trans>items</Trans>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-default-500">
              <CalendarIcon className="h-4 w-4" />
              <span>{new Date(list.createdAt!).toLocaleDateString()}</span>
            </div>
            {hasCollaborators && (
              <div className="flex items-center gap-1.5 text-default-500">
                <UsersIcon className="h-4 w-4" />
                <span>
                  {list.collaborators?.length} <Trans>collaborators</Trans>
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-default-600">
                <Trans>Progress</Trans>
              </span>
              <motion.span
                className={isComplete ? "text-success-600" : "text-primary-600"}
                initial={false}
                animate={{
                  opacity: [0.6, 1],
                  scale: [0.95, 1]
                }}
                key={`${list.completedItems}-${list.totalItems}`}
              >
                {list.completedItems}/{list.totalItems}
              </motion.span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-default-100 dark:bg-default-200">
              <motion.div
                className={`h-full rounded-full ${isComplete ? "bg-success-500" : "bg-primary-500"}`}
                initial={{ width: "0%" }}
                animate={{
                  width: `${progressPercent}%`
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
              />
            </div>
          </div>
        </div>
      </PressableCard>

      <CreateEditListModal isOpen={editModal.isOpen} onClose={editModal.onClose} list={list} mode="edit" />
      <DeleteListModal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose} list={list} />
    </motion.div>
  );
};
