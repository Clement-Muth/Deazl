"use client";

import { Button, Chip, Slider, Spinner, addToast, useDisclosure } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { MapPinIcon, SaveIcon, SettingsIcon, StoreIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  getUserOptimizationPreferences,
  updateUserOptimizationPreferences
} from "~/applications/ShoppingLists/Api/preferences/optimizationPreferences.api";
import type { UserOptimizationPreferences } from "~/applications/ShoppingLists/Domain/Services/OptimalPricingService";
import { Modal } from "~/components/Modal/Modal";

interface SettingsOptimalPricingProps {
  userId: string;
}

export const SettingsOptimalPricing = ({ userId }: SettingsOptimalPricingProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [preferences, setPreferences] = useState<UserOptimizationPreferences>({
    priceWeight: 0.7,
    maxRadiusKm: 10,
    showSavingSuggestions: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasGeolocation, setHasGeolocation] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  // Charger les préférences au montage
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await getUserOptimizationPreferences();
      const adapted = {
        maxRadiusKm: prefs.maxDistance || 10,
        priceWeight: prefs.priceWeight || 0.7,
        showSavingSuggestions: true,
        favoriteStoreIds: prefs.favoriteStoreIds || [],
        userLocation: prefs.userLocation
      };
      setPreferences(adapted);
      setHasGeolocation(!!adapted.userLocation);
    } catch (error) {
      addToast({
        title: <Trans>Error loading preferences</Trans>,
        description: <Trans>Unable to load your settings</Trans>,
        color: "danger",
        variant: "solid"
      });
    }
  };

  const requestGeolocation = useCallback(async () => {
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

        const newPreferences = {
          ...preferences,
          userLocation: { latitude, longitude }
        };

        setPreferences(newPreferences);
        setHasGeolocation(true);
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
          // Position unavailable
          setPreferences((prev) => ({
            ...prev,
            userLocation: { latitude: 48.8566, longitude: 2.3522 } // exemple Paris
          }));
          setHasGeolocation(false);
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
        timeout: 10000, // 10 secondes
        maximumAge: 0
      }
    );
  }, [preferences]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // Convertir vers le format OptimizationPreferences pour l'API
      const apiPreferences: Record<string, any> = {
        maxDistance: preferences.maxRadiusKm
      };

      // Ajouter priceWeight seulement s'il est défini
      if (preferences.priceWeight !== undefined) {
        apiPreferences.priceWeight = preferences.priceWeight;
      }

      // Ajouter userLocation seulement s'il est défini
      if (preferences.userLocation) {
        apiPreferences.userLocation = preferences.userLocation;
      }

      const result = await updateUserOptimizationPreferences(apiPreferences);

      if (!result.success) {
        throw new Error(result.error || "Unknown error");
      }

      addToast({
        title: <Trans>Preferences saved</Trans>,
        description: <Trans>Your price optimization preferences have been updated</Trans>,
        color: "success",
        variant: "solid"
      });

      onClose();
      await loadPreferences(); // Recharger pour rafraîchir l'affichage
    } catch (error) {
      console.error("Error saving preferences:", error);
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Unable to save preferences</Trans>,
        color: "danger",
        variant: "solid"
      });
    } finally {
      setIsSaving(false);
    }
  }, [preferences, onClose, loadPreferences]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <SettingsIcon className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                <Trans>Price Optimization</Trans>
              </h3>
              <p className="text-xs text-gray-500">
                <Trans>Configure how prices are selected</Trans>
              </p>
            </div>
          </div>
          <Button size="sm" color="primary" variant="flat" onPress={onOpen}>
            <Trans>Configure</Trans>
          </Button>
        </div>

        {/* Quick Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <MapPinIcon className="h-4 w-4 text-gray-600" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">
                <Trans>Geolocation</Trans>
              </p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {hasGeolocation ? <Trans>Active</Trans> : <Trans>Not configured</Trans>}
              </p>
            </div>
            {hasGeolocation && (
              <Chip size="sm" color="success" variant="flat">
                ✓
              </Chip>
            )}
          </div>

          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <StoreIcon className="h-4 w-4 text-gray-600" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">
                <Trans>Max radius</Trans>
              </p>
              <p className="text-sm font-medium text-gray-900 truncate">{preferences.maxRadiusKm}km</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <SettingsIcon className="h-4 w-4 text-gray-600" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">
                <Trans>Price weight</Trans>
              </p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {Math.round((preferences.priceWeight || 0.7) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        header={<Trans>Price Optimization Settings</Trans>}
        body={
          <div className="space-y-6">
            {/* Geolocation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
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
              {hasGeolocation && preferences.userLocation && (
                <div className="p-2 bg-success-50 rounded border border-success-200 text-xs text-success-700">
                  <Trans>
                    Position: {preferences.userLocation.latitude.toFixed(4)},{" "}
                    {preferences.userLocation.longitude.toFixed(4)}
                  </Trans>
                </div>
              )}
            </div>

            {/* Max Radius */}
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  <Trans>Maximum radius</Trans>
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  <Trans>Only show stores within this distance</Trans>
                </p>
              </div>
              <Slider
                size="sm"
                step={1}
                minValue={1}
                maxValue={50}
                value={preferences.maxRadiusKm || 10}
                onChange={(value) => {
                  const numValue = Array.isArray(value) ? value[0] : value;
                  setPreferences({ ...preferences, maxRadiusKm: numValue });
                }}
                className="max-w-md"
                getValue={(value) => `${Array.isArray(value) ? value[0] : value} km`}
              />
            </div>

            {/* Price vs Distance Weight */}
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  <Trans>Price vs Distance priority</Trans>
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  <Trans>Balance between best price and proximity</Trans>
                </p>
              </div>
              <Slider
                size="sm"
                step={0.01}
                minValue={0}
                maxValue={1}
                value={preferences.priceWeight || 0.7}
                onChange={(value) => {
                  const numValue = Array.isArray(value) ? value[0] : value;
                  setPreferences({ ...preferences, priceWeight: numValue });
                }}
                className="max-w-md"
                getValue={(value) => {
                  const val = Array.isArray(value) ? value[0] : value;
                  const pricePct = Math.round(val * 100);
                  const distPct = 100 - pricePct;
                  return `💰 ${pricePct}% / 🚗 ${distPct}%`;
                }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  <Trans>Distance</Trans> ({Math.round((1 - (preferences.priceWeight || 0.7)) * 100)}%)
                </span>
                <span>
                  <Trans>Price</Trans> ({Math.round((preferences.priceWeight || 0.7) * 100)}%)
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {(preferences.priceWeight ?? 0.7) >= 0.7 ? (
                  <Trans>Prioritize low prices, even if the store is further away</Trans>
                ) : (preferences.priceWeight ?? 0.7) >= 0.5 ? (
                  <Trans>Balance between price and proximity</Trans>
                ) : (
                  <Trans>Prioritize nearby stores, even if prices are higher</Trans>
                )}
              </p>
            </div>

            {/* Info box */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700">
                <Trans>
                  These settings will be used to automatically select the best prices for your shopping lists.
                  Distance is calculated as the crow flies.
                </Trans>
              </p>
            </div>
          </div>
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button color="default" variant="flat" onPress={onClose} isDisabled={isSaving}>
              <Trans>Cancel</Trans>
            </Button>
            <Button
              color="primary"
              onPress={handleSave}
              isLoading={isSaving}
              startContent={<SaveIcon className="h-4 w-4" />}
            >
              <Trans>Save</Trans>
            </Button>
          </div>
        }
      />
    </>
  );
};
