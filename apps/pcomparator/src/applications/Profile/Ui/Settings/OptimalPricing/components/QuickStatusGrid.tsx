"use client";

import { Card, CardBody, Chip } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { MapPinIcon, SettingsIcon, StoreIcon } from "lucide-react";

interface QuickStatusGridProps {
  hasGeolocation: boolean;
  maxRadiusKm?: number;
  priceWeight?: number;
}

export const QuickStatusGrid = ({ hasGeolocation, maxRadiusKm, priceWeight }: QuickStatusGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Card>
        <CardBody className="flex flex-row items-center gap-2">
          <MapPinIcon className="h-4 w-4 text-gray-400" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">
              <Trans>Geolocation</Trans>
            </p>
            <p className="text-sm font-medium text-foreground truncate">
              {hasGeolocation ? <Trans>Active</Trans> : <Trans>Not configured</Trans>}
            </p>
          </div>
          {hasGeolocation && (
            <Chip size="sm" color="success" variant="flat">
              ✓
            </Chip>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-row items-center gap-2">
          <StoreIcon className="h-4 w-4 text-gray-400" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">
              <Trans>Max radius</Trans>
            </p>
            <p className="text-sm font-medium text-foreground truncate">{maxRadiusKm || 10}km</p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-row items-center gap-2">
          <SettingsIcon className="h-4 w-4 text-gray-400" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">
              <Trans>Price weight</Trans>
            </p>
            <p className="text-sm font-medium text-foreground truncate">
              {Math.round((priceWeight || 0.7) * 100)}%
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
