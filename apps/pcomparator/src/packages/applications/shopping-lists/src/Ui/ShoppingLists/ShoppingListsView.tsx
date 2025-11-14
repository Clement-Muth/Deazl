"use client";

import { Button, Chip, Tab, Tabs, useDisclosure } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { AnimatePresence, motion } from "framer-motion";
import { ArchiveIcon, ListPlusIcon, ShoppingCartIcon } from "lucide-react";
import { useState } from "react";
import { FloatingButton } from "~/components/Button/FloatingButton/FloatingButton";
import type { ShoppingListPayload } from "../../Domain/Schemas/ShoppingList.schema";
import { CreateEditListModal } from "../../Ui/ShoppingLists/CreateEditListModal";
import { EmptyState, type EmptyStateProps } from "../../Ui/ShoppingLists/EmptyState";
import { ShoppingListCard } from "../../Ui/ShoppingLists/ShoppingListCard";

export interface ShoppingListViewProps {
  lists: ShoppingListPayload[] | null;
}

export const ShoppingListsView = ({ lists }: ShoppingListViewProps) => {
  const [filter, setFilter] = useState<EmptyStateProps["type"]>("active");
  const createModal = useDisclosure();

  const activeLists = lists?.filter((list) => {
    if (list.items?.length === 0) return true;

    const progress = (list.completedItems / list.totalItems) * 100;
    return progress < 100;
  });

  const completedLists = lists?.filter((list) => {
    const progress = (list.completedItems / list.totalItems) * 100;
    return progress === 100;
  });

  return !lists || !activeLists ? (
    <div className="col-span-full">
      <EmptyState type="active" onCreateList={createModal.onOpen} />
    </div>
  ) : (
    <div className="mx-auto max-w-5xl md:max-w-6xl px-3 md:px-4">
      <div className="mb-4 md:mb-6 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-3xl font-bold mb-0.5 md:mb-1 truncate">
            <Trans>Your Lists</Trans>
          </h1>
          <p className="text-gray-600 text-xs md:text-base">
            <Trans>Manage and organize your shopping lists</Trans>
          </p>
        </div>
        <FloatingButton
          className="md:hidden"
          onPress={createModal.onOpen}
          icon={<ListPlusIcon className="h-5 w-5" />}
        />
        <Button
          color="primary"
          variant="flat"
          size="lg"
          startContent={<ListPlusIcon className="h-4 w-4" />}
          onPress={createModal.onOpen}
          className="hidden md:flex"
        >
          <Trans>New List</Trans>
        </Button>
      </div>

      <Tabs
        selectedKey={filter}
        onSelectionChange={(key) => setFilter(key as EmptyStateProps["type"])}
        variant="solid"
        color="primary"
        size="lg"
        classNames={{
          tabList: "w-full md:w-auto",
          tab: "flex-1 md:flex-initial md:px-6 h-12",
          cursor: "w-full"
        }}
      >
        <Tab
          key="active"
          title={
            <div className="flex items-center gap-2 px-2">
              <ShoppingCartIcon className="h-4 w-4" />
              <span>Active</span>
              <Chip size="sm" variant="flat" color="primary">
                {activeLists.length}
              </Chip>
            </div>
          }
        />
        <Tab
          key="completed"
          title={
            <div className="flex items-center gap-2 px-2">
              <ArchiveIcon className="h-4 w-4" />
              <span>Completed</span>
              <Chip size="sm" variant="flat" color="default">
                {completedLists?.length}
              </Chip>
            </div>
          }
        />
      </Tabs>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {(filter === "active" ? activeLists : (completedLists ?? [])).map((list, index) => (
            <motion.div
              key={list.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                opacity: { duration: 0.2 },
                delay: index * 0.05
              }}
            >
              <ShoppingListCard list={list} userRole={list.userRole} />
            </motion.div>
          ))}
        </AnimatePresence>

        {filter === "active" && activeLists.length === 0 && (
          <div className="col-span-full">
            <EmptyState type="active" onCreateList={createModal.onOpen} />
          </div>
        )}
        {filter === "completed" && completedLists?.length === 0 && (
          <div className="col-span-full">
            <EmptyState type="completed" onCreateList={createModal.onOpen} />
          </div>
        )}
      </div>

      <CreateEditListModal isOpen={createModal.isOpen} onClose={createModal.onClose} mode="create" />
    </div>
  );
};
