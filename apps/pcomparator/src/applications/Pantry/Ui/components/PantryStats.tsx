"use client";

import { Chip, Progress } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { PantryItemPayload } from "../../Domain/Schemas/PantryItem.schema";

interface PantryStatsProps {
  items: PantryItemPayload[];
}

export const PantryStats = ({ items }: PantryStatsProps) => {
  const stats = {
    total: items.length,
    expired: items.filter((i) => i.expirationStatus === "expired").length,
    expiringSoon: items.filter((i) => i.expirationStatus === "expiring-soon").length,
    fresh: items.filter((i) => i.expirationStatus === "fresh" || !i.expirationStatus).length
  };

  const healthScore =
    stats.total > 0
      ? Math.round(((stats.total - stats.expired - stats.expiringSoon) / stats.total) * 100)
      : 100;
  const healthColor = healthScore >= 80 ? "success" : healthScore >= 50 ? "warning" : "danger";

  if (stats.total === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-default-700">
            <Trans>Health</Trans>
          </span>
          <span className={`text-sm font-bold text-${healthColor}`}>{healthScore}%</span>
        </div>
        <div className="flex gap-1.5">
          <Chip size="sm" variant="flat" color="success" startContent={<CheckCircle2 className="h-3 w-3" />}>
            {stats.fresh}
          </Chip>
          {stats.expiringSoon > 0 && (
            <Chip
              size="sm"
              variant="flat"
              color="warning"
              startContent={<AlertTriangle className="h-3 w-3" />}
            >
              {stats.expiringSoon}
            </Chip>
          )}
          {stats.expired > 0 && (
            <Chip size="sm" variant="flat" color="danger" startContent={<AlertCircle className="h-3 w-3" />}>
              {stats.expired}
            </Chip>
          )}
        </div>
      </div>
      <Progress size="sm" value={healthScore} color={healthColor} />
    </div>
  );
};
