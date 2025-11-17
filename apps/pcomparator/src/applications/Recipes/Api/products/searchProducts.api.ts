"use server";

import { PrismaProductRepository } from "../../Infrastructure/Repositories/PrismaProductRepository";

const productRepository = new PrismaProductRepository();

export interface ProductSearchResult {
  id: string;
  name: string;
  barcode: string;
  brand?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
}

/**
 * Search products for recipe ingredients
 */
export async function searchProductsForRecipe(query: string, limit = 10): Promise<ProductSearchResult[]> {
  try {
    return await productRepository.searchProducts(query, limit);
  } catch (error) {
    console.error("Error searching products for recipe:", error);
    return [];
  }
}
