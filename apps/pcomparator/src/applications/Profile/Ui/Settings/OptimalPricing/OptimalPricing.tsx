"use client";

import { Spinner } from "@heroui/react";
import { OptimalPricingHeader, OptimizationConfigModal, QuickStatusGrid } from "./components";
import { useOptimalPricingPreferences } from "./useOptimalPricingPreferences";

export const SettingsOptimalPricing = () => {
  const { preferences, setPreferences, isLoading, modal } = useOptimalPricingPreferences();

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
        <OptimalPricingHeader onConfigure={modal.onOpen} />
        <QuickStatusGrid
          hasGeolocation={!!preferences.userLocation}
          maxRadiusKm={preferences.maxRadiusKm}
          priceWeight={preferences.priceWeight}
        />
      </div>

      <OptimizationConfigModal
        isOpen={modal.isOpen}
        onClose={modal.onClose}
        preferences={preferences}
        onPreferencesChange={setPreferences}
      />
    </>
  );
};
