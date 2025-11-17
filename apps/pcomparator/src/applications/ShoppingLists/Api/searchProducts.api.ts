"use server";

import { ProductSearchApplicationService } from "../Application/Services/ProductSearch.service";

// L'API orchestre en instanciant les dépendances selon l'architecture DDD
const productSearchService = new ProductSearchApplicationService();

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
  averagePrice?: number;
  bestPrice?: {
    amount: number;
    store: string;
    location: string;
  };
  prices: Array<{
    id: string;
    amount: number;
    currency: string;
    unit: string;
    store: {
      id: string;
      name: string;
      location: string;
    };
    dateRecorded: Date;
  }>;
}

/**
 * Recherche de produits avec calcul des prix moyens et meilleurs prix
 * Utilise le prix le plus récent par magasin
 */
export const searchProducts = async (query: string, limit = 10): Promise<ProductSearchResult[]> => {
  try {
    // Déléguer la recherche au service Application qui respecte la DDD
    return await productSearchService.searchProducts(query, limit);
  } catch (error) {
    console.error("Error in searchProducts API:", error);
    return [];
  }
};
