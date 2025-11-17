/**
 * Service Domain pour la sélection optimale des prix
 * Gère la logique métier de sélection des prix selon les contraintes utilisateur
 */

import type { BestPriceResult, PriceData } from "../Utils/priceComparison";
import { calculateTotalCost, findBestPrice } from "../Utils/priceComparison";
import {
  type Coordinates,
  calculateDistance,
  calculatePriceDistanceScore,
  filterStoresByRadius
} from "./GeolocationService";

/**
 * Préférences utilisateur pour l'optimisation des prix
 */
export interface UserOptimizationPreferences {
  /** Magasins favoris (IDs) */
  favoriteStoreIds?: string[];
  /** Position de l'utilisateur */
  userLocation?: Coordinates;
  /** Rayon maximum en km */
  maxRadiusKm?: number;
  /** Pondération prix vs distance (0-1, défaut 0.7 = 70% prix) */
  priceWeight?: number;
  /** Afficher les suggestions d'économie même avec magasin préféré */
  showSavingSuggestions?: boolean;
}

/**
 * Options de sélection de prix
 */
export interface PriceSelectionOptions {
  /** Magasin(s) explicitement sélectionné(s) par l'utilisateur */
  selectedStoreIds?: string[];
  /** Préférences utilisateur */
  userPreferences?: UserOptimizationPreferences;
}

/**
 * Résultat enrichi avec informations de distance et économie
 */
export interface OptimalPriceResult extends BestPriceResult {
  /** Distance du magasin en km (si géolocalisation active) */
  distanceKm?: number;
  /** Score combiné prix + distance */
  score?: number;
  /** Meilleure alternative possible (si magasin préféré sélectionné) */
  betterAlternative?: {
    price: PriceData;
    savings: number;
    savingsPercentage: number;
    distanceKm?: number;
  } | null;
}

/**
 * Résultat global pour un article
 */
export interface ItemOptimalPrice {
  itemId: string;
  productId: string;
  quantity: number;
  unit: string;
  /** Prix sélectionné (selon les critères) */
  selectedPrice: OptimalPriceResult | null;
  /** Tous les prix disponibles (triés par pertinence) */
  availablePrices: Array<OptimalPriceResult>;
  /** Raison de la sélection */
  selectionReason:
    | "user_selected_store"
    | "favorite_store"
    | "best_price"
    | "best_price_distance"
    | "no_price_available";
}

/**
 * Service de sélection optimale des prix
 */
export class OptimalPricingService {
  /**
   * Sélectionne le meilleur prix pour un article selon les options
   */
  public selectOptimalPrice(
    itemId: string,
    productId: string,
    quantity: number,
    unit: string,
    availablePrices: PriceData[],
    options: PriceSelectionOptions = {},
    selectedPriceId?: string | null
  ): ItemOptimalPrice {
    if (availablePrices.length === 0) {
      return {
        itemId,
        productId,
        quantity,
        unit,
        selectedPrice: null,
        availablePrices: [],
        selectionReason: "no_price_available"
      };
    }

    // PRIORITÉ 0 : Si l'utilisateur a manuellement sélectionné un prix, le respecter
    if (selectedPriceId) {
      const manuallySelected = availablePrices.find((p) => p.id === selectedPriceId);
      if (manuallySelected) {
        const bestPriceResult = findBestPrice([manuallySelected]);
        if (bestPriceResult) {
          const selectedPrice = this.enrichPriceWithDistance(bestPriceResult, options.userPreferences);
          return {
            itemId,
            productId,
            quantity,
            unit,
            selectedPrice,
            availablePrices: this.enrichPricesWithDistance(availablePrices, options.userPreferences),
            selectionReason: "user_selected_store"
          };
        }
      } else {
        console.warn(
          `[OptimalPricing] ⚠️ selectedPriceId="${selectedPriceId}" NOT FOUND in availablePrices. Falling back to auto-selection.`
        );
      }
    }

    const { selectedStoreIds, userPreferences } = options;

    // CAS 1 : Magasin(s) explicitement sélectionné(s)
    if (selectedStoreIds && selectedStoreIds.length > 0) {
      return this.selectFromSpecificStores(
        itemId,
        productId,
        quantity,
        unit,
        availablePrices,
        selectedStoreIds,
        userPreferences
      );
    }

    // CAS 2 : Aucun magasin sélectionné - optimisation automatique
    return this.selectWithOptimization(itemId, productId, quantity, unit, availablePrices, userPreferences);
  }

  /**
   * Sélection depuis un/des magasin(s) spécifique(s)
   */
  private selectFromSpecificStores(
    itemId: string,
    productId: string,
    quantity: number,
    unit: string,
    availablePrices: PriceData[],
    selectedStoreIds: string[],
    userPreferences?: UserOptimizationPreferences
  ): ItemOptimalPrice {
    // Filtrer les prix des magasins sélectionnés
    const storesPrices = availablePrices.filter((p) => selectedStoreIds.includes(p.storeId));

    if (storesPrices.length === 0) {
      // Aucun prix disponible dans les magasins sélectionnés
      return {
        itemId,
        productId,
        quantity,
        unit,
        selectedPrice: null,
        availablePrices: this.enrichPricesWithDistance(availablePrices, userPreferences),
        selectionReason: "no_price_available"
      };
    }

    // Trouver le meilleur prix parmi les magasins sélectionnés
    const bestInSelection = findBestPrice(storesPrices);
    if (!bestInSelection) {
      return {
        itemId,
        productId,
        quantity,
        unit,
        selectedPrice: null,
        availablePrices: this.enrichPricesWithDistance(availablePrices, userPreferences),
        selectionReason: "no_price_available"
      };
    }

    // Enrichir avec distance
    const selectedPrice = this.enrichPriceWithDistance(bestInSelection, userPreferences);

    // Calculer s'il y a une meilleure alternative (tous magasins confondus)
    if (userPreferences?.showSavingSuggestions !== false) {
      const bestOverall = findBestPrice(availablePrices);
      if (bestOverall && bestOverall.price.id !== selectedPrice.price.id) {
        const savings = selectedPrice.price.amount - bestOverall.price.amount;
        const savingsPercentage = (savings / selectedPrice.price.amount) * 100;

        selectedPrice.betterAlternative = {
          price: bestOverall.price,
          savings,
          savingsPercentage,
          distanceKm: this.calculateDistanceForPrice(bestOverall.price, userPreferences)
        };
      }
    }

    const isFavorite = userPreferences?.favoriteStoreIds?.includes(selectedPrice.price.storeId) ?? false;

    return {
      itemId,
      productId,
      quantity,
      unit,
      selectedPrice,
      availablePrices: this.enrichPricesWithDistance(availablePrices, userPreferences),
      selectionReason: isFavorite ? "favorite_store" : "user_selected_store"
    };
  }

  /**
   * Sélection avec optimisation automatique
   */
  private selectWithOptimization(
    itemId: string,
    productId: string,
    quantity: number,
    unit: string,
    availablePrices: PriceData[],
    userPreferences?: UserOptimizationPreferences
  ): ItemOptimalPrice {
    // PRIORITY 1: Vérifier si un magasin favori a un prix (AVANT filtrage géographique)
    if (userPreferences?.favoriteStoreIds && userPreferences.favoriteStoreIds.length > 0) {
      const favoritePrices = availablePrices.filter((p) =>
        userPreferences.favoriteStoreIds!.includes(p.storeId)
      );

      if (favoritePrices.length > 0) {
        // Sélectionner le meilleur prix parmi les favoris
        const bestFavorite = findBestPrice(favoritePrices);
        if (bestFavorite) {
          const selectedPrice = this.enrichPriceWithDistance(bestFavorite, userPreferences);

          return {
            itemId,
            productId,
            quantity,
            unit,
            selectedPrice,
            availablePrices: this.enrichPricesWithDistance(availablePrices, userPreferences),
            selectionReason: "favorite_store"
          };
        }
      } else {
      }
    }

    // PRIORITY 2: Filtrer par rayon si géolocalisation active (seulement si pas de favoris trouvés)
    let candidatePrices = availablePrices;

    if (userPreferences?.userLocation && userPreferences?.maxRadiusKm) {
      const storesWithCoords = this.extractStoreCoordinates(availablePrices);
      const nearbyStores = filterStoresByRadius(
        storesWithCoords,
        userPreferences.userLocation,
        userPreferences.maxRadiusKm
      );

      const nearbyStoreIds = new Set(nearbyStores.map((s) => s.id));
      candidatePrices = availablePrices.filter((p) => nearbyStoreIds.has(p.storeId));

      if (candidatePrices.length === 0) {
        // Aucun magasin dans le rayon
        return {
          itemId,
          productId,
          quantity,
          unit,
          selectedPrice: null,
          availablePrices: this.enrichPricesWithDistance(availablePrices, userPreferences),
          selectionReason: "no_price_available"
        };
      }
    }

    // Optimisation prix + distance si géolocalisation active
    if (userPreferences?.userLocation) {
      const pricesWithScore = candidatePrices.map((price) => {
        const distanceKm = this.calculateDistanceForPrice(price, userPreferences);
        const score = calculatePriceDistanceScore(price.amount, distanceKm ?? 0, userPreferences.priceWeight);
        return { price, distanceKm, score };
      });

      // Trier par score (le plus bas est le meilleur)
      pricesWithScore.sort((a, b) => a.score - b.score);
      const bestByScore = pricesWithScore[0];

      if (bestByScore) {
        const bestPriceResult = findBestPrice([bestByScore.price]);
        if (bestPriceResult) {
          const selectedPrice: OptimalPriceResult = {
            ...bestPriceResult,
            distanceKm: bestByScore.distanceKm,
            score: bestByScore.score
          };

          return {
            itemId,
            productId,
            quantity,
            unit,
            selectedPrice,
            availablePrices: this.enrichPricesWithDistance(availablePrices, userPreferences),
            selectionReason: "best_price_distance"
          };
        }
      }
    }

    // Par défaut : meilleur prix absolu
    const bestPrice = findBestPrice(candidatePrices);
    if (bestPrice) {
      const selectedPrice = this.enrichPriceWithDistance(bestPrice, userPreferences);

      return {
        itemId,
        productId,
        quantity,
        unit,
        selectedPrice,
        availablePrices: this.enrichPricesWithDistance(availablePrices, userPreferences),
        selectionReason: "best_price"
      };
    }

    return {
      itemId,
      productId,
      quantity,
      unit,
      selectedPrice: null,
      availablePrices: this.enrichPricesWithDistance(availablePrices, userPreferences),
      selectionReason: "no_price_available"
    };
  }

  /**
   * Calcule le total pour une liste complète
   */
  public calculateOptimalTotal(
    items: Array<{
      itemId: string;
      productId: string;
      quantity: number;
      unit: string;
      availablePrices: PriceData[];
      selectedPriceId?: string | null;
    }>,
    options: PriceSelectionOptions = {}
  ): {
    totalCost: number;
    itemsWithPrices: ItemOptimalPrice[];
    storeSummary: Array<{ storeId: string; storeName: string; itemCount: number; subtotal: number }>;
    potentialSavings: number;
  } {
    const itemsWithPrices = items.map((item) =>
      this.selectOptimalPrice(
        item.itemId,
        item.productId,
        item.quantity,
        item.unit,
        item.availablePrices,
        options,
        item.selectedPriceId
      )
    );

    const itemsForTotal = itemsWithPrices
      .filter((item) => item.selectedPrice !== null)
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unit: item.unit,
        bestPrice: item.selectedPrice!.price
      }));

    const totalCost = calculateTotalCost(itemsForTotal);

    // Grouper par magasin
    const storeMap = new Map<
      string,
      { storeId: string; storeName: string; itemCount: number; subtotal: number }
    >();

    for (const item of itemsWithPrices) {
      if (item.selectedPrice) {
        const storeId = item.selectedPrice.price.storeId;
        const storeName = item.selectedPrice.price.storeName;
        const itemTotal = item.selectedPrice.price.amount * item.quantity; // Simplifié, devrait gérer les conversions d'unités

        if (storeMap.has(storeId)) {
          const existing = storeMap.get(storeId)!;
          existing.itemCount += 1;
          existing.subtotal += itemTotal;
        } else {
          storeMap.set(storeId, {
            storeId,
            storeName,
            itemCount: 1,
            subtotal: itemTotal
          });
        }
      }
    }

    // Calculer les économies potentielles
    let potentialSavings = 0;
    for (const item of itemsWithPrices) {
      if (item.selectedPrice?.betterAlternative) {
        potentialSavings += item.selectedPrice.betterAlternative.savings * item.quantity;
      }
    }

    return {
      totalCost,
      itemsWithPrices,
      storeSummary: Array.from(storeMap.values()),
      potentialSavings
    };
  }

  /**
   * Enrichit un prix avec les informations de distance
   */
  private enrichPriceWithDistance(
    priceResult: BestPriceResult,
    userPreferences?: UserOptimizationPreferences
  ): OptimalPriceResult {
    const distanceKm = this.calculateDistanceForPrice(priceResult.price, userPreferences);

    return {
      ...priceResult,
      distanceKm,
      score:
        distanceKm !== undefined
          ? calculatePriceDistanceScore(priceResult.price.amount, distanceKm, userPreferences?.priceWeight)
          : undefined
    };
  }

  /**
   * Enrichit tous les prix avec les informations de distance
   */
  private enrichPricesWithDistance(
    prices: PriceData[],
    userPreferences?: UserOptimizationPreferences
  ): OptimalPriceResult[] {
    return prices.map((price) => {
      const bestPrice = findBestPrice([price]);
      if (!bestPrice) {
        return {
          price,
          savings: 0,
          savingsPercentage: 0,
          rank: 1
        };
      }
      return this.enrichPriceWithDistance(bestPrice, userPreferences);
    });
  }

  /**
   * Calcule la distance pour un prix donné
   */
  private calculateDistanceForPrice(
    price: PriceData & { latitude?: number; longitude?: number },
    userPreferences?: UserOptimizationPreferences
  ): number | undefined {
    if (!userPreferences?.userLocation || price.latitude === undefined || price.longitude === undefined) {
      return undefined;
    }

    return calculateDistance(userPreferences.userLocation, {
      latitude: price.latitude,
      longitude: price.longitude
    });
  }

  /**
   * Extrait les coordonnées des magasins depuis les prix
   */
  private extractStoreCoordinates(
    prices: Array<PriceData & { latitude?: number; longitude?: number }>
  ): Array<{ id: string; name: string; location: string; latitude: number; longitude: number }> {
    const storeMap = new Map<
      string,
      { id: string; name: string; location: string; latitude: number; longitude: number }
    >();

    for (const price of prices) {
      if (price.latitude !== undefined && price.longitude !== undefined) {
        storeMap.set(price.storeId, {
          id: price.storeId,
          name: price.storeName,
          location: price.storeName, // Simplifié
          latitude: price.latitude,
          longitude: price.longitude
        });
      }
    }

    return Array.from(storeMap.values());
  }
}
