"use client";

import { Chip, Input, Tab, Tabs, useDisclosure } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Package, PlusIcon, Refrigerator, Search, Snowflake, Store } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { FloatingButton } from "~/components/Button/FloatingButton/FloatingButton";
import { PageHeader } from "~/components/Header/PageHeader";
import { createPantryItem } from "../Api/pantryItems/createPantryItem.api";
import { deletePantryItem } from "../Api/pantryItems/deletePantryItem.api";
import { updatePantryItem } from "../Api/pantryItems/updatePantryItem.api";
import type {
  CreatePantryItemInput,
  PantryItemPayload,
  UpdatePantryItemInput
} from "../Domain/Schemas/PantryItem.schema";
import { PantryAddForm } from "./components/PantryAddForm";
import { PantryEditForm } from "./components/PantryEditForm";
import { PantryItemCard } from "./components/PantryItemCard";

interface PantryPageProps {
  items: PantryItemPayload[];
}

const LOCATION_CONFIG = {
  fridge: { icon: Refrigerator, label: "Fridge", color: "primary" as const },
  freezer: { icon: Snowflake, label: "Freezer", color: "secondary" as const },
  pantry: { icon: Store, label: "Pantry", color: "default" as const },
  countertop: { icon: Package, label: "Countertop", color: "warning" as const }
};

export const PantryPage = ({ items: initialItems }: PantryPageProps) => {
  const { t } = useLingui();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "fridge" | "freezer" | "pantry">("all");
  const addModal = useDisclosure();
  const editModal = useDisclosure();
  const [editingItem, setEditingItem] = useState<PantryItemPayload | null>(null);

  const filteredItems = initialItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedByLocation = useMemo(() => {
    const groups: Record<string, PantryItemPayload[]> = {
      fridge: [],
      freezer: [],
      pantry: [],
      countertop: []
    };

    for (const item of filteredItems) {
      const location = item.location || "pantry";
      if (groups[location]) {
        groups[location].push(item);
      } else {
        groups.pantry.push(item);
      }
    }

    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => {
        if (a.expirationStatus === "expired" && b.expirationStatus !== "expired") return -1;
        if (a.expirationStatus !== "expired" && b.expirationStatus === "expired") return 1;
        if (a.expirationStatus === "expiring-soon" && b.expirationStatus !== "expiring-soon") return -1;
        if (a.expirationStatus !== "expiring-soon" && b.expirationStatus === "expiring-soon") return 1;

        if (a.expiration && b.expiration) {
          return new Date(a.expiration).getTime() - new Date(b.expiration).getTime();
        }

        return 0;
      });
    }

    return groups;
  }, [filteredItems]);

  const stats = useMemo(() => {
    const expiredCount = initialItems.filter((item) => item.expirationStatus === "expired").length;
    const expiringSoonCount = initialItems.filter((item) => item.expirationStatus === "expiring-soon").length;
    const totalCount = initialItems.length;

    return { expiredCount, expiringSoonCount, totalCount };
  }, [initialItems]);

  const handleAdd = async (data: CreatePantryItemInput & { productId?: string }) => {
    startTransition(async () => {
      await createPantryItem(data);
    });
  };

  const handleEdit = (item: PantryItemPayload) => {
    setEditingItem(item);
    editModal.onOpen();
  };

  const handleUpdate = async (id: string, data: UpdatePantryItemInput) => {
    startTransition(async () => {
      await updatePantryItem(id, data);
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t`Are you sure you want to delete this item?`)) return;

    startTransition(async () => {
      await deletePantryItem(id);
    });
  };

  const displayedItems = useMemo(() => {
    if (filter === "all") return filteredItems;
    return filteredItems.filter((item) => item.location === filter);
  }, [filteredItems, filter]);

  return (
    <div>
      <PageHeader title={<Trans>My Pantry</Trans>}>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-gray-600 text-xs md:text-base">
            <Trans>{stats.totalCount} items in stock</Trans>
          </p>
          {(stats.expiredCount > 0 || stats.expiringSoonCount > 0) && (
            <>
              {stats.expiredCount > 0 && (
                <Chip
                  color="danger"
                  size="sm"
                  variant="flat"
                  startContent={<AlertCircle className="h-3 w-3" />}
                >
                  {stats.expiredCount}
                </Chip>
              )}
              {stats.expiringSoonCount > 0 && (
                <Chip
                  color="warning"
                  size="sm"
                  variant="flat"
                  startContent={<AlertCircle className="h-3 w-3" />}
                >
                  {stats.expiringSoonCount}
                </Chip>
              )}
            </>
          )}
        </div>
      </PageHeader>

      <Input
        placeholder={t`Search by name...`}
        value={searchQuery}
        onValueChange={setSearchQuery}
        startContent={<Search className="h-4 w-4 text-default-400" />}
        size="lg"
        classNames={{ base: "mb-4", inputWrapper: "bg-white" }}
      />

      <Tabs
        selectedKey={filter}
        onSelectionChange={(key) => setFilter(key as typeof filter)}
        variant="solid"
        color="primary"
        size="lg"
        fullWidth
        classNames={{
          tabList: "w-full md:w-auto",
          tab: "flex-1 md:flex-initial md:px-6 h-12"
        }}
      >
        <Tab
          key="all"
          title={
            <div className="flex items-center gap-1.5">
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">All</span>
              <Chip size="sm" variant="flat" color="primary">
                {filteredItems.length}
              </Chip>
            </div>
          }
        />
        <Tab
          key="fridge"
          title={
            <div className="flex items-center gap-1.5">
              <Refrigerator className="h-4 w-4" />
              <span className="hidden sm:inline">Fridge</span>
              <Chip size="sm" variant="flat">
                {groupedByLocation.fridge.length}
              </Chip>
            </div>
          }
        />
        <Tab
          key="freezer"
          title={
            <div className="flex items-center gap-1.5">
              <Snowflake className="h-4 w-4" />
              <span className="hidden sm:inline">Freezer</span>
              <Chip size="sm" variant="flat">
                {groupedByLocation.freezer.length}
              </Chip>
            </div>
          }
        />
        <Tab
          key="pantry"
          title={
            <div className="flex items-center gap-1.5">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Pantry</span>
              <Chip size="sm" variant="flat">
                {groupedByLocation.pantry.length}
              </Chip>
            </div>
          }
        />
      </Tabs>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.totalCount === 0 ? (
          <div className="col-span-full flex h-[40vh] flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Store className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              <Trans>Your pantry is empty</Trans>
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              <Trans>Start tracking your food to reduce waste</Trans>
            </p>
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="col-span-full flex h-[40vh] flex-col items-center justify-center text-center">
            <p className="text-sm text-gray-600">
              <Trans>No items found</Trans>
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {displayedItems.map((item, index) => (
              <motion.div
                key={item.id}
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
                <PantryItemCard item={item} onEdit={handleEdit} onDelete={handleDelete} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <FloatingButton icon={<PlusIcon className="h-5 w-5" />} onPress={addModal.onOpen} label={t`Add item`} />

      <PantryAddForm isOpen={addModal.isOpen} onClose={addModal.onClose} onSubmit={handleAdd} />

      <PantryEditForm
        isOpen={editModal.isOpen}
        onClose={() => {
          editModal.onClose();
          setEditingItem(null);
        }}
        onSubmit={handleUpdate}
        item={editingItem}
      />
    </div>
  );
};
