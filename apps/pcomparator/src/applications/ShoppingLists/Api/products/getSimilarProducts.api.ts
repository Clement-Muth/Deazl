"use server";

import { prisma } from "@deazl/system";

/**
 * Récupère des produits similaires (même catégorie ou même marque)
 */
export async function getSimilarProducts(productId: string, limit = 5) {
  try {
    // Récupérer le produit de référence
    const referenceProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        category_id: true,
        brand_id: true,
        name: true
      }
    });

    if (!referenceProduct) {
      return { success: false, error: "Product not found" };
    }

    // Construire les conditions de recherche
    const orConditions: any[] = [];

    // Même catégorie
    if (referenceProduct.category_id) {
      orConditions.push({ category_id: referenceProduct.category_id });
    }

    // Même marque
    if (referenceProduct.brand_id) {
      orConditions.push({ brand_id: referenceProduct.brand_id });
    }

    // Nom similaire
    orConditions.push({
      name: {
        contains: referenceProduct.name.split(" ")[0],
        mode: "insensitive" as const
      }
    });

    // Récupérer des produits similaires
    const similarProducts = await prisma.product.findMany({
      where: {
        id: { not: productId },
        OR: orConditions
      },
      include: {
        brand: true,
        category: true,
        prices: {
          include: {
            store: true
          },
          orderBy: {
            amount: "asc"
          }
        }
      },
      take: limit
    });

    return {
      success: true,
      products: similarProducts.map((product: any) => ({
        id: product.id,
        name: product.name,
        barcode: product.barcode,
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
        averagePrice:
          product.prices.length > 0
            ? product.prices.reduce((sum: number, p: any) => sum + p.amount, 0) / product.prices.length
            : null,
        priceCount: product.prices.length,
        lowestPrice: product.prices[0]?.amount || null
      }))
    };
  } catch (error) {
    console.error("Error fetching similar products:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch similar products"
    };
  }
}
