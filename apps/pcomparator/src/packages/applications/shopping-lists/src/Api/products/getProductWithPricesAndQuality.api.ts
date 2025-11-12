"use server";

import { prisma } from "@deazl/system";

/**
 * Récupère un produit avec tous ses prix et données de qualité
 */
export async function getProductWithPricesAndQuality(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        brand: true,
        category: true,
        prices: {
          include: {
            store: true
          },
          orderBy: {
            amount: "asc" // Tri du moins cher au plus cher
          }
        }
      }
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Transformer en format utilisable
    return {
      success: true,
      product: {
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        description: product.description,
        brand: product.brand
          ? {
              id: product.brand.id,
              name: product.brand.name
            }
          : null,
        category: product.category
          ? {
              id: product.category.id,
              name: product.category.name
            }
          : null,
        qualityData: product.nutrition_score || null,
        isOpenFoodFacts: !product.barcode.startsWith("MANUAL-"),
        prices: product.prices.map((price) => ({
          id: price.id,
          amount: price.amount,
          currency: price.currency,
          unit: price.unit,
          dateRecorded: price.date_recorded,
          store: {
            id: price.store.id,
            name: price.store.name,
            location: price.store.location
          }
        })),
        createdAt: product.created_at,
        updatedAt: product.updated_at
      }
    };
  } catch (error) {
    console.error("Error fetching product with prices and quality:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch product"
    };
  }
}
