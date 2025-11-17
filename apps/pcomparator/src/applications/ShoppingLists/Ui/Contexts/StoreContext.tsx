"use client";

import { type ReactNode, createContext, useContext, useState } from "react";
import { getStores } from "../../Api/getStores.api";

export interface StoreInfo {
  id: string;
  name: string;
  location: string;
}

interface StoreContextType {
  selectedStore: StoreInfo | null;
  setSelectedStore: (store: StoreInfo | null) => void;
  stores: StoreInfo[];
  setStores: (stores: StoreInfo[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: Error | null;
  setError: (error: Error | null) => void;
  refreshStores: () => Promise<void>;
}

// Créer le contexte avec une valeur par défaut
const StoreContext = createContext<StoreContextType>({
  selectedStore: null,
  setSelectedStore: () => {},
  stores: [],
  setStores: () => {},
  isLoading: false,
  setIsLoading: () => {},
  error: null,
  setError: () => {},
  refreshStores: async () => {}
});

export function StoreProvider({ children }: { children: ReactNode }) {
  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Ne pas charger les données directement dans le contexte
  // Nous utiliserons un hook séparé pour cela
  const loadStores = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const storesData = await getStores();
      setStores(storesData);
    } catch (err) {
      console.error("Failed to load stores:", err);
      setError(err instanceof Error ? err : new Error("Failed to load stores"));
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    selectedStore,
    setSelectedStore,
    stores,
    setStores,
    isLoading,
    setIsLoading,
    error,
    refreshStores: loadStores,
    setError
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}
