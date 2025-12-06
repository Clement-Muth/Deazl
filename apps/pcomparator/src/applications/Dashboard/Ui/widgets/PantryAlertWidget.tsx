"use client";

import { Badge, Button, Card, CardBody, Progress } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { AlertTriangle, ChevronRight, Package, XCircle } from "lucide-react";
import Link from "next/link";
import type { PantryItemPayload } from "~/applications/Pantry/Domain/Schemas/PantryItem.schema";

interface PantryAlertWidgetProps {
  items: PantryItemPayload[];
}

const getDaysUntilExpiry = (expirationDate: Date | string | null | undefined): number | null => {
  if (!expirationDate) return null;
  const now = new Date();
  const expiry = new Date(expirationDate);
  now.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const getExpiryStatus = (days: number | null): "expired" | "expiring" | "warning" | "fresh" => {
  if (days === null) return "fresh";
  if (days < 0) return "expired";
  if (days <= 2) return "expiring";
  if (days <= 7) return "warning";
  return "fresh";
};

export function PantryAlertWidget({ items }: PantryAlertWidgetProps) {
  const expired = items.filter((item) => getExpiryStatus(getDaysUntilExpiry(item.expiration)) === "expired");
  const expiringSoon = items.filter(
    (item) =>
      getExpiryStatus(getDaysUntilExpiry(item.expiration)) === "expiring" ||
      getExpiryStatus(getDaysUntilExpiry(item.expiration)) === "warning"
  );

  const totalItems = items.length;
  const healthyItems = totalItems - expired.length - expiringSoon.length;
  const healthScore = totalItems > 0 ? Math.round((healthyItems / totalItems) * 100) : 100;

  if (totalItems === 0) {
    return (
      <Card className="shadow-sm border-none">
        <CardBody className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-default-100 dark:bg-default-50">
              <Package className="h-5 w-5 text-default-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-default-700">
                <Trans>Pantry</Trans>
              </p>
              <p className="text-xs text-default-500 truncate">
                <Trans>Start tracking your food</Trans>
              </p>
            </div>
            <Link href="/pantry">
              <Button size="sm" variant="flat" color="primary" className="min-h-9 touch-manipulation">
                <Trans>Add items</Trans>
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    );
  }

  const hasAlerts = expired.length > 0 || expiringSoon.length > 0;

  return (
    <Card
      className={`shadow-sm border-none ${hasAlerts ? "bg-linear-to-br from-warning-50/50 to-transparent dark:from-warning-900/10" : ""}`}
    >
      <CardBody className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg shrink-0 ${
              expired.length > 0
                ? "bg-danger-100 dark:bg-danger-900/30"
                : expiringSoon.length > 0
                  ? "bg-warning-100 dark:bg-warning-900/30"
                  : "bg-success-100 dark:bg-success-900/30"
            }`}
          >
            {expired.length > 0 ? (
              <XCircle className="h-5 w-5 text-danger-600" />
            ) : expiringSoon.length > 0 ? (
              <AlertTriangle className="h-5 w-5 text-warning-600" />
            ) : (
              <Package className="h-5 w-5 text-success-600" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-sm font-medium text-default-700">
                <Trans>Pantry Health</Trans>
              </p>
              <span
                className={`text-xs font-semibold ${
                  healthScore >= 80
                    ? "text-success-600"
                    : healthScore >= 50
                      ? "text-warning-600"
                      : "text-danger-600"
                }`}
              >
                {healthScore}%
              </span>
            </div>

            <Progress
              size="sm"
              value={healthScore}
              color={healthScore >= 80 ? "success" : healthScore >= 50 ? "warning" : "danger"}
              className="mb-2"
            />

            <div className="flex items-center gap-2 text-xs">
              {expired.length > 0 && (
                <Badge color="danger" variant="flat" size="sm" className="px-1.5 py-0.5 rounded-md">
                  {expired.length} <Trans>expired</Trans>
                </Badge>
              )}
              {expiringSoon.length > 0 && (
                <Badge color="warning" variant="flat" size="sm" className="px-1.5 py-0.5 rounded-md">
                  {expiringSoon.length} <Trans>expiring</Trans>
                </Badge>
              )}
              {!hasAlerts && (
                <span className="text-success-600">
                  <Trans>All items fresh!</Trans>
                </span>
              )}
            </div>
          </div>

          <Link href="/pantry">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="min-h-9 min-w-9 touch-manipulation shrink-0"
              aria-label="Go to pantry"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {expired.length > 0 && (
          <div className="mt-3 pt-3 border-t border-default-100 dark:border-default-50">
            <p className="text-xs text-danger-600 font-medium mb-1.5">
              <Trans>Expired items:</Trans>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {expired.slice(0, 3).map((item) => (
                <span
                  key={item.id}
                  className="px-2 py-0.5 text-xs rounded-full bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400"
                >
                  {item.name}
                </span>
              ))}
              {expired.length > 3 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400">
                  +{expired.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
