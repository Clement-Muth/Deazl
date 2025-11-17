import { prisma } from "@deazl/system";
import type { ProductSearchResult } from "../../Api/searchProducts.api";

/**
 * Service d'application pour la recherche de produits
 * Respecte les principes DDD : Application → Infrastructure
 */
export class ProductSearchApplicationService {
  /**
   * Recherche de produits avec calcul des prix moyens et meilleurs prix
   * Utilise le prix le plus récent par magasin
   */
  async searchProducts(query: string, limit = 10): Promise<ProductSearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      // Recherche directe via Prisma dans la couche Application
      // TODO: Refactoriser pour utiliser un repository dédié si nécessaire
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { barcode: { contains: query, mode: "insensitive" } },
            { brand: { name: { contains: query, mode: "insensitive" } } },
            { category: { name: { contains: query, mode: "insensitive" } } }
          ]
        },
        include: {
          brand: true,
          category: true,
          prices: {
            include: {
              store: true
            },
            orderBy: [{ store_id: "asc" }, { date_recorded: "desc" }]
          }
        },
        take: limit
      });

      // Transformer les résultats avec calculs de prix
      const results: ProductSearchResult[] = products.map((product: any) => {
        // Grouper les prix par magasin et prendre le plus récent
        const latestPricesByStore = new Map();

        for (const price of product.prices) {
          const storeId = price.store_id;
          if (
            !latestPricesByStore.has(storeId) ||
            price.date_recorded > latestPricesByStore.get(storeId).date_recorded
          ) {
            latestPricesByStore.set(storeId, price);
          }
        }

        // Convertir en tableau des prix les plus récents
        const latestPrices = Array.from(latestPricesByStore.values()).map((price) => ({
          id: price.id,
          amount: price.amount,
          currency: price.currency,
          unit: price.unit,
          store: {
            id: price.store.id,
            name: price.store.name,
            location: price.store.location
          },
          dateRecorded: price.date_recorded
        }));

        // Calculer statistiques sur les prix les plus récents uniquement
        let averagePrice: number | undefined;
        let bestPrice: { amount: number; store: string; location: string } | undefined;

        if (latestPrices.length > 0) {
          const prices = latestPrices.map((p) => p.amount);
          averagePrice =
            Math.round((prices.reduce((sum, price) => sum + price, 0) / prices.length) * 100) / 100;

          const bestPriceData = latestPrices.reduce((min, price) =>
            price.amount < min.amount ? price : min
          );

          bestPrice = {
            amount: bestPriceData.amount,
            store: bestPriceData.store.name,
            location: bestPriceData.store.location
          };
        }

        return {
          id: product.id,
          name: product.name,
          barcode: product.barcode,
          brand: product.brand
            ? {
                id: product.brand.id,
                name: product.brand.name
              }
            : undefined,
          category: product.category
            ? {
                id: product.category.id,
                name: product.category.name
              }
            : undefined,
          averagePrice,
          bestPrice,
          prices: latestPrices
        };
      });

      // Trier par pertinence (nom exact en premier, puis alphabétique)
      return results.sort((a, b) => {
        const aExact = a.name.toLowerCase() === query.toLowerCase();
        const bExact = b.name.toLowerCase() === query.toLowerCase();

        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error("Error searching products:", error);
      throw new Error("Failed to search products");
    }
  }
}
