"use client";

import { addToast, useDisclosure } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { getStores } from "~/applications/ShoppingLists/Api/getStores.api";
import type { StoreInfo } from "~/applications/ShoppingLists/Api/getStores.api";
import {
  getUserOptimizationPreferences,
  updateUserOptimizationPreferences
} from "~/applications/ShoppingLists/Api/preferences/optimizationPreferences.api";

export const useFavoriteStores = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [favoriteStoreIds, setFavoriteStoreIds] = useState<string[]>([]);
  const [allStores, setAllStores] = useState<StoreInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [preferences, stores] = await Promise.all([getUserOptimizationPreferences(), getStores()]);

      // Récupérer favoriteStoreIds depuis les préférences
      const favoriteIds = preferences.favoriteStoreIds || [];
      setFavoriteStoreIds(favoriteIds);
      setAllStores(stores);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback((storeId: string) => {
    setFavoriteStoreIds((prev) => {
      if (prev.includes(storeId)) {
        return prev.filter((id) => id !== storeId);
      }
      return [...prev, storeId];
    });
  }, []);

  const saveFavorites = useCallback(async () => {
    setIsSaving(true);
    try {
      const result = await updateUserOptimizationPreferences({
        favoriteStoreIds
      });

      if (!result.success) {
        throw new Error(result.error || "Unknown error");
      }

      addToast({
        title: "Préférences sauvegardées",
        description: "Vos magasins favoris ont été mis à jour",
        color: "success",
        variant: "solid"
      });

      onClose();
      await loadData(); // Recharger pour rafraîchir l'affichage
    } catch (error) {
      console.error("Error saving favorites:", error);
      addToast({
        title: "Erreur",
        description: "Impossible de sauvegarder les magasins favoris",
        color: "danger",
        variant: "solid"
      });
    } finally {
      setIsSaving(false);
    }
  }, [favoriteStoreIds, onClose, loadData]);

  const favoriteStores = allStores.filter((s) => favoriteStoreIds.includes(s.id));

  return {
    favoriteStoreIds,
    allStores,
    favoriteStores,
    isLoading,
    isSaving,
    modal: {
      isOpen,
      onOpen,
      onClose
    },
    actions: {
      toggleFavorite,
      saveFavorites
    }
  };
};
