"use client";

import { useEffect, useMemo, useState } from "react";
import { getBatchProductPrices } from "../../Api/prices/getProductPrices.api";
import type { ShoppingListItemPayload } from "../../Domain/Entities/ShoppingListItem.entity";
import type {
  ItemOptimalPrice,
  PriceSelectionOptions,
  UserOptimizationPreferences
} from "../../Domain/Services/OptimalPricingService";
import { OptimalPricingService } from "../../Domain/Services/OptimalPricingService";
import type { PriceData } from "../../Domain/Utils/priceComparison";

interface UseOptimalPricingResult {
  /** Prix optimaux par article */
  itemPrices: Record<string, ItemOptimalPrice>;
  /** Prix bruts récupérés de l'API */
  rawPrices: Record<string, PriceData[]>;
  /** Coût total optimisé */
  totalCost: number;
  /** Économies potentielles */
  potentialSavings: number;
  /** Résumé par magasin */
  storeSummary: Array<{ storeId: string; storeName: string; itemCount: number; subtotal: number }>;
  /** Chargement en cours */
  loading: boolean;
  /** Erreur éventuelle */
  error: string | null;
}

interface UseOptimalPricingOptions {
  /** IDs des magasins sélectionnés par l'utilisateur */
  selectedStoreIds?: string[];
  /** Préférences utilisateur */
  userPreferences?: UserOptimizationPreferences;
}

/**
 * Hook pour la sélection optimale des prix selon les préférences utilisateur
 * Gère la récupération des prix, le calcul optimal et les suggestions d'économie
 */
export function useOptimalPricing(
  items: ShoppingListItemPayload[],
  options: UseOptimalPricingOptions = {}
): UseOptimalPricingResult {
  const [rawPrices, setRawPrices] = useState<Record<string, PriceData[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pricingService = useMemo(() => new OptimalPricingService(), []);

  // Extract product IDs from items
  const productIds = useMemo(
    () => items.filter((item) => item.productId).map((item) => item.productId as string),
    [items]
  );

  // Fetch prices from API
  useEffect(() => {
    if (productIds.length === 0) {
      setRawPrices({});
      return;
    }

    const fetchPrices = async () => {
      setLoading(true);
      setError(null);
      try {
        const prices = await getBatchProductPrices(productIds);
        setRawPrices(prices);
      } catch (err) {
        console.error("Error fetching prices:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch prices");
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [productIds.join(",")]);

  // Calculate optimal prices and total
  const result = useMemo(() => {
    const itemsWithPrices = items
      .filter((item) => item.productId && rawPrices[item.productId])
      .map((item) => ({
        itemId: item.id,
        productId: item.productId as string,
        quantity: item.quantity,
        unit: item.unit,
        availablePrices: rawPrices[item.productId as string]
      }));

    if (itemsWithPrices.length === 0) {
      return {
        totalCost: 0,
        itemsWithPrices: [],
        storeSummary: [],
        potentialSavings: 0
      };
    }

    const selectionOptions: PriceSelectionOptions = {
      selectedStoreIds: options.selectedStoreIds,
      userPreferences: options.userPreferences
    };

    return pricingService.calculateOptimalTotal(itemsWithPrices, selectionOptions);
  }, [items, rawPrices, options.selectedStoreIds, options.userPreferences, pricingService]);

  // Convert array to map for easier access
  const itemPricesMap = useMemo(() => {
    const map: Record<string, ItemOptimalPrice> = {};
    for (const item of result.itemsWithPrices) {
      map[item.itemId] = item;
    }
    return map;
  }, [result.itemsWithPrices]);

  return {
    itemPrices: itemPricesMap,
    rawPrices,
    totalCost: result.totalCost,
    potentialSavings: result.potentialSavings,
    storeSummary: result.storeSummary,
    loading,
    error
  };
}
