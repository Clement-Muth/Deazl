"use server";

import { prisma } from "@deazl/system";

export interface ProductDetail {
  id: string;
  barcode: string;
  name: string;
  description?: string;
  category?: {
    id: string;
    name: string;
    description?: string;
  };
  brand?: {
    id: string;
    name: string;
    description?: string;
    websiteUrl?: string;
  };
  nutritionScore?: any;
  prices: Array<{
    id: string;
    amount: number;
    currency: string;
    unit: string;
    dateRecorded: Date;
    store: {
      id: string;
      name: string;
      location: string;
    };
    priceProofImage?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export async function getProductById(productId: string): Promise<ProductDetail | null> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
      brand: true,
      prices: {
        include: {
          store: true
        },
        orderBy: {
          date_recorded: "desc"
        },
        take: 50
      }
    }
  });

  if (!product) return null;

  return {
    id: product.id,
    barcode: product.barcode,
    name: product.name,
    description: product.description ?? undefined,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          description: product.category.description ?? undefined
        }
      : undefined,
    brand: product.brand
      ? {
          id: product.brand.id,
          name: product.brand.name,
          description: product.brand.description ?? undefined,
          websiteUrl: product.brand.website_url ?? undefined
        }
      : undefined,
    nutritionScore: product.nutrition_score,
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
      },
      priceProofImage: price.price_proof_image ?? undefined
    })),
    createdAt: product.created_at,
    updatedAt: product.updated_at
  };
}

export async function getProductStats(productId: string) {
  const prices = await prisma.price.findMany({
    where: { product_id: productId },
    select: { amount: true }
  });

  if (prices.length === 0) {
    return null;
  }

  const amounts = prices.map((p) => p.amount);
  const avgPrice = amounts.reduce((sum, price) => sum + price, 0) / amounts.length;
  const minPrice = Math.min(...amounts);
  const maxPrice = Math.max(...amounts);

  return {
    priceCount: prices.length,
    averagePrice: avgPrice,
    minPrice,
    maxPrice
  };
}
