"use client";

import { Button, ButtonGroup, Chip, Input, Tab, Tabs, useDisclosure } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Grid3X3,
  List,
  Package,
  PlusIcon,
  Refrigerator,
  Search,
  Snowflake,
  Store,
  X
} from "lucide-react";
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
import { AddToShoppingListModal } from "./components/AddToShoppingListModal";
import { ExpirationAlerts } from "./components/ExpirationAlerts";
import { PantryAddForm } from "./components/PantryAddForm";
import { PantryEditForm } from "./components/PantryEditForm";
import { PantryItemCardEnhanced } from "./components/PantryItemCardEnhanced";
import { PantryStats } from "./components/PantryStats";
import { RecipeSuggestions } from "./components/RecipeSuggestions";

interface PantryPageProps {
  items: PantryItemPayload[];
}

export const PantryPage = ({ items: initialItems }: PantryPageProps) => {
  const { t } = useLingui();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "fridge" | "freezer" | "pantry">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showStats, setShowStats] = useState(false);
  const addModal = useDisclosure();
  const editModal = useDisclosure();
  const shoppingListModal = useDisclosure();
  const [editingItem, setEditingItem] = useState<PantryItemPayload | null>(null);
  const [itemForShoppingList, setItemForShoppingList] = useState<PantryItemPayload | null>(null);

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
    startTransition(async () => {
      await deletePantryItem(id);
    });
  };

  const handleConsume = async (id: string, amount: number) => {
    const item = initialItems.find((i) => i.id === id);
    if (!item) return;

    const newQuantity = Math.max(0, item.quantity - amount);

    if (newQuantity === 0) {
      if (!confirm(t`Item quantity will be 0. Delete it?`)) return;
      startTransition(async () => {
        await deletePantryItem(id);
      });
    } else {
      startTransition(async () => {
        await updatePantryItem(id, { quantity: newQuantity });
      });
    }
  };

  const handleAddToShoppingList = (item: PantryItemPayload) => {
    setItemForShoppingList(item);
    shoppingListModal.onOpen();
  };

  const displayedItems = useMemo(() => {
    if (filter === "all") return filteredItems;
    return filteredItems.filter((item) => item.location === filter);
  }, [filteredItems, filter]);

  const hasExpirationAlerts = stats.expiredCount > 0 || stats.expiringSoonCount > 0;

  return (
    <div className="flex flex-col w-full">
      <PageHeader
        title={<Trans>My Pantry</Trans>}
        href="/"
        extra={
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              variant={showStats ? "solid" : "flat"}
              color={showStats ? "primary" : "default"}
              size="sm"
              onPress={() => setShowStats(!showStats)}
              className="touch-manipulation min-h-10 min-w-10"
              aria-label={t`Toggle statistics`}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              color="primary"
              variant="flat"
              size="sm"
              startContent={<PlusIcon className="h-4 w-4" />}
              onPress={addModal.onOpen}
              className="hidden sm:flex touch-manipulation min-h-10"
            >
              <Trans>Add Item</Trans>
            </Button>
          </div>
        }
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-default-500 text-sm">
            <Trans>{stats.totalCount} items</Trans>
          </span>
          {hasExpirationAlerts && (
            <div className="flex items-center gap-1.5">
              {stats.expiredCount > 0 && (
                <Chip
                  color="danger"
                  size="sm"
                  variant="flat"
                  startContent={<AlertCircle className="h-3.5 w-3.5" />}
                  classNames={{ base: "gap-1" }}
                >
                  <Trans>{stats.expiredCount} expired</Trans>
                </Chip>
              )}
              {stats.expiringSoonCount > 0 && (
                <Chip
                  color="warning"
                  size="sm"
                  variant="flat"
                  startContent={<AlertTriangle className="h-3.5 w-3.5" />}
                  classNames={{ base: "gap-1" }}
                >
                  <Trans>{stats.expiringSoonCount} expiring soon</Trans>
                </Chip>
              )}
            </div>
          )}
        </div>
      </PageHeader>

      <div className="px-3 sm:px-4 space-y-4">
        {showStats && <PantryStats items={initialItems} />}

        {hasExpirationAlerts && (
          <ExpirationAlerts
            items={initialItems}
            onConsume={handleConsume}
            onDelete={handleDelete}
            onAddToShoppingList={handleAddToShoppingList}
          />
        )}

        {stats.expiringSoonCount > 0 && (
          <RecipeSuggestions
            expiringItems={initialItems.filter((i) => i.expirationStatus === "expiring-soon")}
          />
        )}

        <div className="flex items-center gap-2">
          <Input
            placeholder={t`Search...`}
            value={searchQuery}
            onValueChange={setSearchQuery}
            startContent={<Search className="h-4 w-4 text-default-400" />}
            endContent={
              searchQuery && (
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onPress={() => setSearchQuery("")}
                  className="min-w-8 min-h-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              )
            }
            size="md"
            classNames={{
              base: "flex-1",
              inputWrapper: "bg-default-100 dark:bg-default-50 h-10"
            }}
          />
          <ButtonGroup size="md">
            <Button
              isIconOnly
              variant={viewMode === "grid" ? "solid" : "flat"}
              color={viewMode === "grid" ? "primary" : "default"}
              onPress={() => setViewMode("grid")}
              className="touch-manipulation min-h-12 min-w-12"
              aria-label={t`Grid view`}
            >
              <Grid3X3 className="h-5 w-5" />
            </Button>
            <Button
              isIconOnly
              variant={viewMode === "list" ? "solid" : "flat"}
              color={viewMode === "list" ? "primary" : "default"}
              onPress={() => setViewMode("list")}
              className="touch-manipulation min-h-12 min-w-12"
              aria-label={t`List view`}
            >
              <List className="h-5 w-5" />
            </Button>
          </ButtonGroup>
        </div>

        <Tabs
          selectedKey={filter}
          onSelectionChange={(key) => setFilter(key as typeof filter)}
          variant="solid"
          color="primary"
          size="lg"
          fullWidth
          classNames={{
            tabList: "w-full",
            tab: "h-12 touch-manipulation"
          }}
        >
          <Tab
            key="all"
            title={
              <div className="flex items-center gap-1.5">
                <Store className="h-5 w-5" />
                <span className="hidden sm:inline font-medium">
                  <Trans>All</Trans>
                </span>
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
                <Refrigerator className="h-5 w-5" />
                <span className="hidden sm:inline font-medium">
                  <Trans>Fridge</Trans>
                </span>
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
                <Snowflake className="h-5 w-5" />
                <span className="hidden sm:inline font-medium">
                  <Trans>Freezer</Trans>
                </span>
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
                <Package className="h-5 w-5" />
                <span className="hidden sm:inline font-medium">
                  <Trans>Pantry</Trans>
                </span>
                <Chip size="sm" variant="flat">
                  {groupedByLocation.pantry.length}
                </Chip>
              </div>
            }
          />
        </Tabs>

        <div className="sm:hidden flex justify-center">
          <ButtonGroup size="sm">
            <Button
              isIconOnly
              variant={viewMode === "grid" ? "solid" : "flat"}
              color={viewMode === "grid" ? "primary" : "default"}
              onPress={() => setViewMode("grid")}
              className="touch-manipulation min-h-10 min-w-10"
              aria-label={t`Grid view`}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              isIconOnly
              variant={viewMode === "list" ? "solid" : "flat"}
              color={viewMode === "list" ? "primary" : "default"}
              onPress={() => setViewMode("list")}
              className="touch-manipulation min-h-10 min-w-10"
              aria-label={t`List view`}
            >
              <List className="h-4 w-4" />
            </Button>
          </ButtonGroup>
        </div>

        <div
          className={`mt-4 pb-24 ${
            viewMode === "grid"
              ? "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col gap-2"
          }`}
        >
          {stats.totalCount === 0 ? (
            <div className="col-span-full flex h-[40vh] flex-col items-center justify-center text-center px-4">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20">
                <Store className="h-10 w-10 text-primary-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                <Trans>Your pantry is empty</Trans>
              </h3>
              <p className="mb-6 text-sm text-default-500 max-w-sm">
                <Trans>Start tracking your food to reduce waste and always know what you have in stock</Trans>
              </p>
              <Button
                color="primary"
                size="lg"
                startContent={<PlusIcon className="h-5 w-5" />}
                onPress={addModal.onOpen}
                className="touch-manipulation min-h-12"
              >
                <Trans>Add Your First Item</Trans>
              </Button>
            </div>
          ) : displayedItems.length === 0 ? (
            <div className="col-span-full flex h-[40vh] flex-col items-center justify-center text-center px-4">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-default-100 dark:bg-default-50">
                <Search className="h-8 w-8 text-default-400" />
              </div>
              <p className="text-base text-default-500 mb-4">
                <Trans>No items found matching "{searchQuery}"</Trans>
              </p>
              <Button variant="flat" onPress={() => setSearchQuery("")} className="touch-manipulation">
                <Trans>Clear search</Trans>
              </Button>
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
                    delay: index * 0.03
                  }}
                >
                  <PantryItemCardEnhanced
                    item={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onConsume={handleConsume}
                    onAddToShoppingList={handleAddToShoppingList}
                    viewMode={viewMode}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
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

      <AddToShoppingListModal
        isOpen={shoppingListModal.isOpen}
        onClose={() => {
          shoppingListModal.onClose();
          setItemForShoppingList(null);
        }}
        item={itemForShoppingList}
      />
    </div>
  );
};
