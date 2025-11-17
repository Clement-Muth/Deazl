"use client";

import { useEffect } from "react";
import { useStore } from "../Contexts/StoreContext";

export function useStoreData() {
  const { stores, setStores, isLoading, setIsLoading, error, setError } = useStore();

  // Fonction pour charger les magasins
  const fetchStores = async () => {
    // Si les magasins sont déjà chargés, ne pas recharger
    if (stores.length > 0) return;

    setIsLoading(true);
    setError(null);

    try {
      // Importer dynamiquement la fonction pour éviter les problèmes d'HMR
      const { getStores } = await import("../../Api/getStores.api");
      const storesData = await getStores();
      setStores(storesData);
    } catch (err) {
      console.error("Failed to load stores:", err);
      setError(err instanceof Error ? err : new Error("Failed to load stores"));
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les magasins lorsque le hook est utilisé
  useEffect(() => {
    // Utiliser un setTimeout pour éviter les problèmes d'HMR
    const timer = setTimeout(() => {
      fetchStores();
    }, 100);

    return () => clearTimeout(timer);
  }, []); // Dépendance vide pour exécuter seulement au montage

  return {
    refreshStores: fetchStores
  };
}
