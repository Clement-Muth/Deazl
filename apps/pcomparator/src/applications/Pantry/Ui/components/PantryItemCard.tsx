"use client";

import { Chip } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { motion } from "framer-motion";
import { CalendarIcon, Edit3Icon, Package, Refrigerator, Snowflake, Store, TrashIcon } from "lucide-react";
import { type CardAction, PressableCard } from "~/components/PressableCard/PressableCard";
import type { PantryItemPayload } from "../../Domain/Schemas/PantryItem.schema";

interface PantryItemCardProps {
  item: PantryItemPayload;
  onEdit: (item: PantryItemPayload) => void;
  onDelete: (id: string) => void;
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

export const PantryItemCard = ({ item, onEdit, onDelete }: PantryItemCardProps) => {
  const { t } = useLingui();
  const expirationColor = getExpirationColor(item.expirationStatus);
  const LocationIcon = getLocationIcon(item.location);

  const cardActions: CardAction[] = [
    {
      key: "edit",
      label: <Trans>Edit Item</Trans>,
      icon: <Edit3Icon className="h-5 w-5" />,
      variant: "light",
      onAction: () => onEdit(item)
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

  return (
    <motion.div layout>
      <PressableCard
        actions={cardActions}
        className="group relative p-4 transition duration-200 hover:bg-gray-50"
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-lg text-foreground line-clamp-1 group-hover:text-primary-600 transition-colors">
              {item.name}
            </h2>
          </div>
          {item.location && (
            <div className="p-1.5 rounded-full bg-primary-100 text-primary-600" title={item.location}>
              <LocationIcon className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Package className="h-4 w-4" />
              <span className="font-medium">
                {item.quantity} {item.unit}
              </span>
            </div>
            {item.expiration && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <CalendarIcon className="h-4 w-4" />
                <Chip size="sm" color={expirationColor} variant="flat">
                  {formatExpiration(item.expiration, item.daysUntilExpiration || null)}
                </Chip>
              </div>
            )}
          </div>
        </div>
      </PressableCard>
    </motion.div>
  );
};
