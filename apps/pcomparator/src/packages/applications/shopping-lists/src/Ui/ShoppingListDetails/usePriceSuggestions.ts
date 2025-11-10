"use client";

import { useEffect, useState } from "react";
import { getBatchProductPrices } from "../../Api/prices/getProductPrices.api";
import type { ShoppingListItemPayload } from "../../Domain/Entities/ShoppingListItem.entity";
import type { BestPriceResult, PriceData } from "../../Domain/Utils/priceComparison";
import {
  calculateTotalCost,
  findBestPrice,
  findBestStoreForList,
  getPriceForStore
} from "../../Domain/Utils/priceComparison";

interface UsePriceSuggestionsResult {
  itemPrices: Record<string, PriceData[]>;
  bestPrices: Record<string, BestPriceResult | null>;
  totalCost: number;
  potentialSavings: number;
  bestStoreName: string | null;
  loading: boolean;
}

export function usePriceSuggestions(
  items: ShoppingListItemPayload[],
  selectedStoreId?: string | null
): UsePriceSuggestionsResult {
  const [itemPrices, setItemPrices] = useState<Record<string, PriceData[]>>({});
  const [loading, setLoading] = useState(false);

  // Extract product IDs from items
  const productIds = items.filter((item) => item.productId).map((item) => item.productId as string);

  useEffect(() => {
    if (productIds.length === 0) {
      setItemPrices({});
      return;
    }

    const fetchPrices = async () => {
      setLoading(true);
      try {
        const prices = await getBatchProductPrices(productIds);
        setItemPrices(prices);
      } catch (error) {
        console.error("Error fetching prices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [productIds.join(",")]);

  // Calculate best prices for each item
  // If a store is selected, use that store's price, otherwise find the best price
  const bestPrices: Record<string, BestPriceResult | null> = {};
  for (const item of items) {
    if (item.productId && itemPrices[item.productId]) {
      if (selectedStoreId) {
        // Use the selected store's price
        bestPrices[item.id] = getPriceForStore(itemPrices[item.productId], selectedStoreId);
      } else {
        // Find the best price across all stores
        bestPrices[item.id] = findBestPrice(itemPrices[item.productId]);
      }
    } else {
      bestPrices[item.id] = null;
    }
  }

  // Calculate total cost using best/selected store prices
  const itemsWithBestPrices = items.map((item) => ({
    productId: item.productId || "",
    quantity: item.quantity,
    bestPrice: bestPrices[item.id]?.price || null
  }));

  const totalCost = calculateTotalCost(itemsWithBestPrices);

  // Calculate total cost with current item prices (if available)
  const totalWithCurrentPrices = items.reduce((sum, item) => {
    if (item.price) {
      return sum + item.price * item.quantity;
    }
    return sum;
  }, 0);

  // If store is selected, calculate savings compared to best prices across all stores
  // If no store selected, calculate savings compared to current item prices
  let potentialSavings = 0;
  if (selectedStoreId) {
    // Calculate what the cost would be with best prices
    const bestPossibleCost = items.reduce((sum, item) => {
      if (item.productId && itemPrices[item.productId]) {
        const bestPrice = findBestPrice(itemPrices[item.productId]);
        if (bestPrice) {
          return sum + bestPrice.price.amount * item.quantity;
        }
      }
      return sum;
    }, 0);
    potentialSavings = totalCost > 0 && bestPossibleCost > 0 ? totalCost - bestPossibleCost : 0;
  } else {
    potentialSavings = totalWithCurrentPrices > 0 && totalCost > 0 ? totalWithCurrentPrices - totalCost : 0;
  }

  // Find best store for the entire list (only when no store is selected)
  let bestStoreName: string | null = null;
  if (!selectedStoreId) {
    const itemsWithPrices = items
      .filter((item) => item.productId && itemPrices[item.productId])
      .map((item) => ({
        productId: item.productId as string,
        quantity: item.quantity,
        prices: itemPrices[item.productId as string]
      }));

    const bestStoreResult = findBestStoreForList(itemsWithPrices);
    bestStoreName = bestStoreResult?.storeName || null;
  }

  return {
    itemPrices,
    bestPrices,
    totalCost,
    potentialSavings,
    bestStoreName,
    loading
  };
}
