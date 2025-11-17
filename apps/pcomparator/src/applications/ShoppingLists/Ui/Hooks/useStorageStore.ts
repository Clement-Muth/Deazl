import { useEffect } from "react";
import type { StoreInfo } from "../Contexts/StoreContext";
import { useStore } from "../Contexts/StoreContext";

const STORAGE_KEY = "selectedStore";

export const useStorageStore = () => {
  const { selectedStore, setSelectedStore } = useStore();

  // Load the selected store from localStorage on component mount
  useEffect(() => {
    const savedStore = localStorage.getItem(STORAGE_KEY);
    if (savedStore) {
      try {
        const parsedStore = JSON.parse(savedStore) as StoreInfo;
        setSelectedStore(parsedStore);
      } catch (error) {
        console.error("Failed to parse stored store:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [setSelectedStore]);

  // Save the selected store to localStorage whenever it changes
  useEffect(() => {
    if (selectedStore) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedStore));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [selectedStore]);

  return { selectedStore };
};
