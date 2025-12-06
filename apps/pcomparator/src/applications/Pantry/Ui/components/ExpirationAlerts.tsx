"use client";

import { Button, Chip } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { AlertCircle, Minus, Trash2 } from "lucide-react";
import type { PantryItemPayload } from "../../Domain/Schemas/PantryItem.schema";

interface ExpirationAlertsProps {
  items: PantryItemPayload[];
  onConsume: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
  onAddToShoppingList: (item: PantryItemPayload) => void;
}

export const ExpirationAlerts = ({ items, onConsume, onDelete }: ExpirationAlertsProps) => {
  const { t } = useLingui();

  const expiredItems = items.filter((i) => i.expirationStatus === "expired");
  const expiringSoonItems = items.filter((i) => i.expirationStatus === "expiring-soon");
  const alertItems = [...expiredItems, ...expiringSoonItems].slice(0, 4);

  if (alertItems.length === 0) return null;

  const getDaysText = (item: PantryItemPayload) => {
    const days = item.daysUntilExpiration;
    if (days === null || days === undefined) return null;
    if (days < 0) return `${Math.abs(days)}d ago`;
    if (days === 0) return t`Today`;
    return `${days}d`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-danger-500" />
        <span className="text-sm font-medium text-default-700">
          <Trans>Needs attention</Trans>
        </span>
        <Chip size="sm" variant="flat" color="danger">
          {alertItems.length}
        </Chip>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {alertItems.map((item) => {
          const isExpired = item.expirationStatus === "expired";
          return (
            <div
              key={item.id}
              className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl ${
                isExpired ? "bg-danger-50 dark:bg-danger-900/20" : "bg-warning-50 dark:bg-warning-900/20"
              }`}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate max-w-24">{item.name}</p>
                <p className="text-xs text-default-500">{getDaysText(item)}</p>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="light"
                  isIconOnly
                  onPress={() => onConsume(item.id, 1)}
                  className="min-w-8 h-8"
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  isIconOnly
                  onPress={() => confirm(t`Delete ${item.name}?`) && onDelete(item.id)}
                  className="min-w-8 h-8"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
