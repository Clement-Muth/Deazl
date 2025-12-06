"use client";

import { Button, Chip, Progress } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  Edit3Icon,
  Minus,
  Package,
  Plus,
  Refrigerator,
  ShoppingCart,
  Snowflake,
  Store,
  TrashIcon
} from "lucide-react";
import { type CardAction, PressableCard } from "~/components/PressableCard/PressableCard";
import type { PantryItemPayload } from "../../Domain/Schemas/PantryItem.schema";

interface PantryItemCardEnhancedProps {
  item: PantryItemPayload;
  onEdit: (item: PantryItemPayload) => void;
  onDelete: (id: string) => void;
  onConsume: (id: string, amount: number) => void;
  onAddToShoppingList: (item: PantryItemPayload) => void;
  viewMode?: "grid" | "list";
  lowStockThreshold?: number;
}

const getExpirationColor = (status: string | undefined) => {
  switch (status) {
    case "expired":
      return "danger";
    case "expiring-soon":
      return "warning";
    case "fresh":
      return "success";
    default:
      return "default";
  }
};

const formatExpiration = (expiration: Date | null, daysUntil: number | null) => {
  if (!expiration || daysUntil === null) return null;

  if (daysUntil < 0) {
    return <Trans>Expired {Math.abs(daysUntil)}d ago</Trans>;
  }

  if (daysUntil === 0) {
    return <Trans>Today</Trans>;
  }

  if (daysUntil === 1) {
    return <Trans>Tomorrow</Trans>;
  }

  return <Trans>{daysUntil}d left</Trans>;
};

const getLocationIcon = (location: string | null) => {
  switch (location) {
    case "fridge":
      return Refrigerator;
    case "freezer":
      return Snowflake;
    case "pantry":
      return Store;
    case "countertop":
      return Package;
    default:
      return Store;
  }
};

export const PantryItemCardEnhanced = ({
  item,
  onEdit,
  onDelete,
  onConsume,
  onAddToShoppingList,
  viewMode = "grid",
  lowStockThreshold = 2
}: PantryItemCardEnhancedProps) => {
  const { t } = useLingui();
  const expirationColor = getExpirationColor(item.expirationStatus);
  const LocationIcon = getLocationIcon(item.location);
  const isLowStock = item.quantity <= lowStockThreshold;

  const cardActions: CardAction[] = [
    {
      key: "edit",
      label: <Trans>Edit Item</Trans>,
      icon: <Edit3Icon className="h-5 w-5" />,
      variant: "light",
      onAction: () => onEdit(item)
    },
    {
      key: "shopping",
      label: <Trans>Add to List</Trans>,
      icon: <ShoppingCart className="h-5 w-5" />,
      variant: "light",
      onAction: () => onAddToShoppingList(item)
    },
    {
      key: "delete",
      label: <Trans>Delete Item</Trans>,
      icon: <TrashIcon className="h-5 w-5" />,
      variant: "solid",
      color: "danger",
      onAction: () => {
        if (confirm(t`Are you sure you want to delete this item?`)) {
          onDelete(item.id);
        }
      }
    }
  ];

  if (viewMode === "list") {
    return (
      <motion.div layout>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-content1 dark:bg-content1 border border-default-200 dark:border-default-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
          <div
            className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-500"
            title={item.location || undefined}
          >
            <LocationIcon className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{item.name}</p>
            <div className="flex items-center gap-2 text-xs text-default-500">
              <span>
                {item.quantity} {item.unit}
              </span>
              {item.expiration && (
                <>
                  <span>•</span>
                  <Chip size="sm" color={expirationColor} variant="flat" classNames={{ base: "h-5" }}>
                    {formatExpiration(item.expiration, item.daysUntilExpiration || null)}
                  </Chip>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              color="danger"
              onPress={() => onConsume(item.id, 1)}
              isDisabled={item.quantity <= 0}
              className="touch-manipulation min-w-9 h-9"
              aria-label={t`Use one`}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-semibold text-foreground">{item.quantity}</span>
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              color="success"
              onPress={() => onConsume(item.id, -1)}
              className="touch-manipulation min-w-9 h-9"
              aria-label={t`Add one`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div layout>
      <PressableCard
        actions={cardActions}
        className="group relative p-4 transition duration-200 hover:bg-default-50 dark:hover:bg-default-100 min-h-32"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight">
              {item.name}
            </h2>
            {isLowStock && (
              <Chip
                size="sm"
                color="warning"
                variant="dot"
                classNames={{ base: "mt-1 h-5 px-1.5", content: "text-xs" }}
              >
                <Trans>Low stock</Trans>
              </Chip>
            )}
          </div>
          {item.location && (
            <div
              className="p-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shrink-0"
              title={item.location}
            >
              <LocationIcon className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-default-600">
              <Package className="h-4 w-4" />
              <span className="font-medium">
                {item.quantity} {item.unit}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                color="danger"
                onPress={() => onConsume(item.id, 1)}
                isDisabled={item.quantity <= 0}
                className="touch-manipulation min-w-8 h-8"
                aria-label={t`Use one`}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                color="success"
                onPress={() => onConsume(item.id, -1)}
                className="touch-manipulation min-w-8 h-8"
                aria-label={t`Add one`}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {item.expiration && (
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4 text-default-400" />
              <Chip size="sm" color={expirationColor} variant="flat" classNames={{ base: "h-6" }}>
                {formatExpiration(item.expiration, item.daysUntilExpiration || null)}
              </Chip>
            </div>
          )}

          {isLowStock && (
            <Progress
              size="sm"
              value={(item.quantity / lowStockThreshold) * 100}
              color="warning"
              classNames={{
                track: "h-1.5 bg-default-100 dark:bg-default-800",
                indicator: "h-1.5"
              }}
            />
          )}
        </div>
      </PressableCard>
    </motion.div>
  );
};
