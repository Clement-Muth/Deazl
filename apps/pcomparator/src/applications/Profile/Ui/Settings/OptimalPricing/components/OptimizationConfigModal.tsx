"use client";

import { Button, addToast } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { SaveIcon } from "lucide-react";
import { useState } from "react";
import {
  getUserOptimizationPreferences,
  updateUserOptimizationPreferences
} from "~/applications/ShoppingLists/Api/preferences/optimizationPreferences.api";
import { Modal } from "~/components/Modal/Modal";
import { GeolocationSection } from "./GeolocationSection";
import { PriceWeightSection } from "./PriceWeightSection";
import { RadiusSection } from "./RadiusSection";

interface OptimizationConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: {
    priceWeight?: number;
    maxRadiusKm?: number;
    userLocation?: { latitude: number; longitude: number };
  };
  onPreferencesChange: (preferences: {
    priceWeight?: number;
    maxRadiusKm?: number;
    userLocation?: { latitude: number; longitude: number };
  }) => void;
}

export const OptimizationConfigModal = ({
  isOpen,
  onClose,
  preferences,
  onPreferencesChange
}: OptimizationConfigModalProps) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
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
      // Recharger les préférences
      const prefs = await getUserOptimizationPreferences();
      const adapted = {
        maxRadiusKm: prefs.maxDistance || 10,
        priceWeight: prefs.priceWeight || 0.7,
        userLocation: prefs.userLocation
      };
      onPreferencesChange(adapted);
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
  };

  const handleLocationUpdate = (location: { latitude: number; longitude: number }) => {
    onPreferencesChange({
      ...preferences,
      userLocation: location
    });
  };

  const handleRadiusChange = (radius: number) => {
    onPreferencesChange({
      ...preferences,
      maxRadiusKm: radius
    });
  };

  const handlePriceWeightChange = (weight: number) => {
    onPreferencesChange({
      ...preferences,
      priceWeight: weight
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header={<Trans>Price Optimization Settings</Trans>}
      body={
        <div className="space-y-6">
          <GeolocationSection
            hasGeolocation={!!preferences.userLocation}
            userLocation={preferences.userLocation}
            onLocationUpdate={handleLocationUpdate}
          />

          <RadiusSection maxRadiusKm={preferences.maxRadiusKm} onRadiusChange={handleRadiusChange} />

          <PriceWeightSection
            priceWeight={preferences.priceWeight}
            onPriceWeightChange={handlePriceWeightChange}
          />

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
  );
};
