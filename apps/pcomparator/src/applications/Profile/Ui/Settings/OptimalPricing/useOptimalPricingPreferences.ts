"use client";

import { useDisclosure } from "@heroui/react";
import { useEffect, useState } from "react";
import { getUserOptimizationPreferences } from "~/applications/ShoppingLists/Api/preferences/optimizationPreferences.api";
import type { UserOptimizationPreferences } from "~/applications/ShoppingLists/Domain/Services/OptimalPricingService";

export const useOptimalPricingPreferences = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [preferences, setPreferences] = useState<UserOptimizationPreferences>({
    priceWeight: 0.7,
    maxRadiusKm: 10,
    showSavingSuggestions: true
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setIsLoading(true);
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
    } catch (error) {
      // Error handling is done in the modal component
      console.error("Failed to load preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    preferences,
    setPreferences,
    isLoading,
    modal: {
      isOpen,
      onOpen,
      onClose
    }
  };
};
