"use client";

import { Button, addToast } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { MapPinIcon } from "lucide-react";
import { useState } from "react";

interface GeolocationSectionProps {
  hasGeolocation: boolean;
  userLocation?: { latitude: number; longitude: number };
  onLocationUpdate: (location: { latitude: number; longitude: number }) => void;
}

export const GeolocationSection = ({
  hasGeolocation,
  userLocation,
  onLocationUpdate
}: GeolocationSectionProps) => {
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  const requestGeolocation = async () => {
    if (!navigator.geolocation) {
      addToast({
        title: <Trans>Geolocation not supported</Trans>,
        description: <Trans>Your browser does not support geolocation</Trans>,
        color: "warning",
        variant: "solid"
      });
      return;
    }

    setIsRequestingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        onLocationUpdate({ latitude, longitude });
        setIsRequestingLocation(false);

        addToast({
          title: <Trans>Location detected</Trans>,
          description: <Trans>Your position has been saved</Trans>,
          color: "success",
          variant: "solid"
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsRequestingLocation(false);

        let message = (
          <Trans>Unable to detect your position. Please try again or check your browser settings.</Trans>
        );

        if (error.code === 1) {
          // PERMISSION_DENIED
          message = (
            <Trans>Location permission denied. Please allow location access in your browser settings.</Trans>
          );
        } else if (error.code === 2) {
          // POSITION_UNAVAILABLE
          onLocationUpdate({ latitude: 48.8566, longitude: 2.3522 }); // Paris par défaut
        } else if (error.code === 3) {
          // TIMEOUT
          message = <Trans>Location request timed out. Please try again.</Trans>;
        }

        addToast({
          title: <Trans>Geolocation Error</Trans>,
          description: message,
          color: "danger",
          variant: "solid"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MapPinIcon className="h-4 w-4" />
            <Trans>Geolocation</Trans>
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            <Trans>Enable location to find nearby stores</Trans>
          </p>
        </div>
        <Button
          size="sm"
          color={hasGeolocation ? "success" : "primary"}
          variant={hasGeolocation ? "flat" : "solid"}
          onPress={requestGeolocation}
          isLoading={isRequestingLocation}
          startContent={hasGeolocation ? undefined : <MapPinIcon className="h-3.5 w-3.5" />}
        >
          {hasGeolocation ? <Trans>Update Location</Trans> : <Trans>Enable</Trans>}
        </Button>
      </div>
      {hasGeolocation && userLocation && (
        <div className="p-2 bg-success-50 rounded border border-success-200 text-xs text-success-700">
          <Trans>
            Position: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </Trans>
        </div>
      )}
    </div>
  );
};
