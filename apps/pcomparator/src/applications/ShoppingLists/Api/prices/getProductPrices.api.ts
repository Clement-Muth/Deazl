"use server";

import { prisma } from "@deazl/system";
import type { PriceData } from "../../Domain/Utils/priceComparison";

/**
 * Fetches all prices for a given product
 */
export async function getProductPrices(productId: string): Promise<PriceData[]> {
  try {
    const prices = await prisma.price.findMany({
      where: {
        product_id: productId
      },
      include: {
        store: true
      },
      orderBy: {
        date_recorded: "desc"
      }
    });

    return prices.map((price) => ({
      id: price.id,
      productId: price.product_id,
      storeId: price.store_id,
      storeName: price.store.name,
      amount: price.amount,
      currency: price.currency,
      unit: price.unit,
      dateRecorded: price.date_recorded
    }));
  } catch (error) {
    console.error("Error fetching product prices:", error);
    return [];
  }
}

/**
 * Fetches prices for multiple products at once
 */
export async function getBatchProductPrices(productIds: string[]): Promise<Record<string, PriceData[]>> {
  try {
    const prices = await prisma.price.findMany({
      where: {
        product_id: {
          in: productIds
        }
      },
      include: {
        store: true
      },
      orderBy: {
        date_recorded: "desc"
      }
    });

    const pricesByProduct: Record<string, PriceData[]> = {};

    for (const price of prices) {
      if (!pricesByProduct[price.product_id]) {
        pricesByProduct[price.product_id] = [];
      }

      pricesByProduct[price.product_id].push({
        id: price.id,
        productId: price.product_id,
        storeId: price.store_id,
        storeName: price.store.name,
        amount: price.amount,
        currency: price.currency,
        unit: price.unit,
        dateRecorded: price.date_recorded
      });
    }

    return pricesByProduct;
  } catch (error) {
    console.error("Error fetching batch product prices:", error);
    return {};
  }
}
