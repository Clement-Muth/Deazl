import type { RecipeIngredient } from "../Entities/RecipeIngredient.entity";

/**
 * Contexte utilisateur pour le calcul de prix personnalisé
 */
export interface UserPricingContext {
  userId: string;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  maxDistanceKm?: number;
  favoriteStoreIds?: string[];
  excludedStoreIds?: string[];
  preferredBrands?: string[];
  // Pondérations pour l'optimisation
  priceWeight?: number; // 0-1, défaut 0.6
  qualityWeight?: number; // 0-1, défaut 0.25
  distanceWeight?: number; // 0-1, défaut 0.15
}

/**
 * Prix d'un produit dans un magasin spécifique
 */
export interface PriceCandidate {
  id: string;
  productId: string;
  storeId: string;
  storeName: string;
  storeLocation: string;
  amount: number;
  currency: string;
  unit: string;
  dateRecorded: Date;
  distanceKm?: number;
  qualityScore?: number;
  confidence: number; // 0-1
}

/**
 * Prix sélectionné pour un ingrédient
 */
export interface SelectedPrice {
  productId: string;
  productName: string;
  storeId: string;
  storeName: string;
  price: number;
  unit: string;
  distanceKm?: number;
  confidence: number;
  dateRecorded: Date;
}

/**
 * Alternative de prix pour un ingrédient
 */
export interface PriceAlternative {
  storeId: string;
  storeName: string;
  price: number;
  distanceKm?: number;
  confidence: number;
  qualityScore?: number;
}

/**
 * Détail de prix pour un ingrédient
 */
export interface IngredientPricingBreakdown {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
  selected: SelectedPrice | null;
  alternatives: PriceAlternative[];
  missing: boolean;
  estimatedCost: number; // Coût pour la quantité requise
}

/**
 * Total par magasin
 */
export interface StoreTotal {
  storeId: string;
  storeName: string;
  total: number;
  itemCount: number;
  missingCount: number;
  available: boolean;
  averageDistance?: number;
}

/**
 * Résultat complet du calcul de prix
 */
export interface RecipePricingResult {
  mode: "user" | "public";
  totals: {
    optimizedMix: number; // Mix optimal multi-magasins
    perStore: StoreTotal[]; // Total si tout dans un magasin
  };
  breakdown: IngredientPricingBreakdown[];
  missingCount: number;
  dataTimestamp: Date;
  confidence: number; // Confiance globale 0-1
}

/**
 * Service de domaine pour le calcul dynamique des prix de recettes
 *
 * Calcule les prix en temps réel selon le contexte utilisateur :
 * - Mode user : prix personnalisés (localisation, magasins favoris, préférences)
 * - Mode public : prix moyens du marché
 */
export class RecipePricingService {
  /**
   * Calcule le prix d'une recette pour un utilisateur spécifique
   * Prix personnalisé basé sur les préférences et la localisation
   */
  public static async computeForUser(
    ingredients: RecipeIngredient[],
    pricesCandidates: Map<string, PriceCandidate[]>,
    userContext: UserPricingContext,
    servings: number
  ): Promise<RecipePricingResult> {
    const breakdown: IngredientPricingBreakdown[] = [];
    const storeMap = new Map<
      string,
      { name: string; total: number; itemCount: number; missingCount: number; distances: number[] }
    >();
    let totalOptimized = 0;
    let missingCount = 0;
    let totalConfidence = 0;
    let confidenceCount = 0;

    // Traiter chaque ingrédient
    for (const ingredient of ingredients) {
      const candidates = pricesCandidates.get(ingredient.productId) || [];

      if (candidates.length === 0) {
        // Ingrédient sans prix disponible
        breakdown.push({
          ingredientId: ingredient.id,
          name: ingredient.productName || "Produit inconnu",
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          selected: null,
          alternatives: [],
          missing: true,
          estimatedCost: 0
        });
        missingCount++;
        continue;
      }

      // Filtrer et scorer les candidats
      const scoredCandidates = RecipePricingService.scoreAndFilterCandidates(candidates, userContext);

      if (scoredCandidates.length === 0) {
        // Aucun candidat ne correspond aux critères
        breakdown.push({
          ingredientId: ingredient.id,
          name: ingredient.productName || "Produit inconnu",
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          selected: null,
          alternatives: [],
          missing: true,
          estimatedCost: 0
        });
        missingCount++;
        continue;
      }

      // Sélectionner le meilleur candidat
      const best = scoredCandidates[0];
      const cost = RecipePricingService.calculateCost(
        ingredient.quantity,
        ingredient.unit,
        best.amount,
        best.unit
      );

      // Construire les alternatives
      const alternatives: PriceAlternative[] = scoredCandidates.slice(1, 4).map((c) => ({
        storeId: c.storeId,
        storeName: c.storeName,
        price: c.amount,
        distanceKm: c.distanceKm,
        confidence: c.confidence,
        qualityScore: c.qualityScore
      }));

      breakdown.push({
        ingredientId: ingredient.id,
        name: ingredient.productName || "Produit inconnu",
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        selected: {
          productId: best.productId,
          productName: ingredient.productName || "Produit inconnu",
          storeId: best.storeId,
          storeName: best.storeName,
          price: best.amount,
          unit: best.unit,
          distanceKm: best.distanceKm,
          confidence: best.confidence,
          dateRecorded: best.dateRecorded
        },
        alternatives,
        missing: false,
        estimatedCost: cost
      });

      totalOptimized += cost;
      totalConfidence += best.confidence;
      confidenceCount++;

      // Mise à jour du total par magasin
      if (!storeMap.has(best.storeId)) {
        storeMap.set(best.storeId, {
          name: best.storeName,
          total: 0,
          itemCount: 0,
          missingCount: 0,
          distances: []
        });
      }
      const storeData = storeMap.get(best.storeId)!;
      storeData.total += cost;
      storeData.itemCount++;
      if (best.distanceKm !== undefined) {
        storeData.distances.push(best.distanceKm);
      }
    }

    // Calculer les totaux par magasin
    const perStore: StoreTotal[] = Array.from(storeMap.entries()).map(([storeId, data]) => ({
      storeId,
      storeName: data.name,
      total: data.total,
      itemCount: data.itemCount,
      missingCount: data.missingCount,
      available: data.missingCount === 0,
      averageDistance:
        data.distances.length > 0
          ? data.distances.reduce((a, b) => a + b, 0) / data.distances.length
          : undefined
    }));

    // Trier par total croissant
    perStore.sort((a, b) => a.total - b.total);

    return {
      mode: "user",
      totals: {
        optimizedMix: totalOptimized,
        perStore
      },
      breakdown,
      missingCount,
      dataTimestamp: new Date(),
      confidence: confidenceCount > 0 ? totalConfidence / confidenceCount : 0
    };
  }

  /**
   * Calcule le prix moyen public (pour utilisateurs non connectés)
   */
  public static async computePublic(
    ingredients: RecipeIngredient[],
    pricesCandidates: Map<string, PriceCandidate[]>,
    servings: number
  ): Promise<RecipePricingResult> {
    const breakdown: IngredientPricingBreakdown[] = [];
    let totalAverage = 0;
    let missingCount = 0;
    let totalConfidence = 0;
    let confidenceCount = 0;

    for (const ingredient of ingredients) {
      const candidates = pricesCandidates.get(ingredient.productId) || [];

      if (candidates.length === 0) {
        breakdown.push({
          ingredientId: ingredient.id,
          name: ingredient.productName || "Produit inconnu",
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          selected: null,
          alternatives: [],
          missing: true,
          estimatedCost: 0
        });
        missingCount++;
        continue;
      }

      // Calculer le prix moyen
      const avgPrice = candidates.reduce((sum, c) => sum + c.amount, 0) / candidates.length;
      const avgUnit = candidates[0].unit; // On prend la première unité
      const cost = RecipePricingService.calculateCost(
        ingredient.quantity,
        ingredient.unit,
        avgPrice,
        avgUnit
      );

      // Prendre les 3 meilleurs prix comme alternatives
      const sortedByPrice = [...candidates].sort((a, b) => a.amount - b.amount);
      const alternatives: PriceAlternative[] = sortedByPrice.slice(0, 3).map((c) => ({
        storeId: c.storeId,
        storeName: c.storeName,
        price: c.amount,
        confidence: c.confidence
      }));

      const avgConfidence = candidates.reduce((sum, c) => sum + c.confidence, 0) / candidates.length;

      breakdown.push({
        ingredientId: ingredient.id,
        name: ingredient.productName || "Produit inconnu",
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        selected: {
          productId: ingredient.productId,
          productName: ingredient.productName || "Produit inconnu",
          storeId: "avg",
          storeName: "Prix moyen",
          price: avgPrice,
          unit: avgUnit,
          confidence: avgConfidence,
          dateRecorded: new Date()
        },
        alternatives,
        missing: false,
        estimatedCost: cost
      });

      totalAverage += cost;
      totalConfidence += avgConfidence;
      confidenceCount++;
    }

    return {
      mode: "public",
      totals: {
        optimizedMix: totalAverage,
        perStore: []
      },
      breakdown,
      missingCount,
      dataTimestamp: new Date(),
      confidence: confidenceCount > 0 ? totalConfidence / confidenceCount : 0
    };
  }

  /**
   * Filtre et score les candidats de prix selon le contexte utilisateur
   */
  private static scoreAndFilterCandidates(
    candidates: PriceCandidate[],
    context: UserPricingContext
  ): PriceCandidate[] {
    // Filtrer
    const filtered = candidates.filter((c) => {
      // Exclure les magasins exclus
      if (context.excludedStoreIds?.includes(c.storeId)) {
        return false;
      }

      // Filtrer par distance max
      if (context.maxDistanceKm !== undefined && c.distanceKm !== undefined) {
        if (c.distanceKm > context.maxDistanceKm) {
          return false;
        }
      }

      return true;
    });

    if (filtered.length === 0) {
      return [];
    }

    // Poids par défaut
    const priceWeight = context.priceWeight ?? 0.6;
    const qualityWeight = context.qualityWeight ?? 0.25;
    const distanceWeight = context.distanceWeight ?? 0.15;

    // Normaliser les valeurs pour le scoring
    const prices = filtered.map((c) => c.amount);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const distances = filtered.map((c) => c.distanceKm ?? 0).filter((d) => d > 0);
    const minDistance = distances.length > 0 ? Math.min(...distances) : 0;
    const maxDistance = distances.length > 0 ? Math.max(...distances) : 0;

    const qualities = filtered.map((c) => c.qualityScore ?? 50);
    const minQuality = Math.min(...qualities);
    const maxQuality = Math.max(...qualities);

    // Scorer chaque candidat
    const scored = filtered.map((c) => {
      let score = 0;

      // Score prix (inversé : moins cher = mieux)
      const priceScore = maxPrice > minPrice ? 1 - (c.amount - minPrice) / (maxPrice - minPrice) : 1;
      score += priceScore * priceWeight;

      // Score distance (inversé : plus proche = mieux)
      if (c.distanceKm !== undefined && maxDistance > minDistance) {
        const distanceScore = 1 - (c.distanceKm - minDistance) / (maxDistance - minDistance);
        score += distanceScore * distanceWeight;
      } else {
        score += 0.5 * distanceWeight; // Neutre si pas de distance
      }

      // Score qualité
      if (c.qualityScore !== undefined && maxQuality > minQuality) {
        const qualScore = (c.qualityScore - minQuality) / (maxQuality - minQuality);
        score += qualScore * qualityWeight;
      } else {
        score += 0.5 * qualityWeight; // Neutre si pas de qualité
      }

      // Bonus pour magasins favoris
      if (context.favoriteStoreIds?.includes(c.storeId)) {
        score *= 1.1;
      }

      return { ...c, score };
    });

    // Trier par score décroissant
    scored.sort((a, b) => b.score - a.score);

    return scored;
  }

  /**
   * Calcule le coût d'un ingrédient
   */
  private static calculateCost(
    ingredientQty: number,
    ingredientUnit: string,
    priceAmount: number,
    priceUnit: string
  ): number {
    const normalizedIngredientUnit = RecipePricingService.normalizeUnit(ingredientUnit);
    const normalizedPriceUnit = RecipePricingService.normalizeUnit(priceUnit);

    if (normalizedIngredientUnit === normalizedPriceUnit) {
      return ingredientQty * priceAmount;
    }

    // Conversions kg/g
    if (normalizedIngredientUnit === "g" && normalizedPriceUnit === "kg") {
      return (ingredientQty / 1000) * priceAmount;
    }
    if (normalizedIngredientUnit === "kg" && normalizedPriceUnit === "g") {
      return ingredientQty * 1000 * priceAmount;
    }

    // Conversions L/ml
    if (normalizedIngredientUnit === "ml" && normalizedPriceUnit === "l") {
      return (ingredientQty / 1000) * priceAmount;
    }
    if (normalizedIngredientUnit === "l" && normalizedPriceUnit === "ml") {
      return ingredientQty * 1000 * priceAmount;
    }

    // Conversions cl/l
    if (normalizedIngredientUnit === "cl" && normalizedPriceUnit === "l") {
      return (ingredientQty / 100) * priceAmount;
    }
    if (normalizedIngredientUnit === "l" && normalizedPriceUnit === "cl") {
      return ingredientQty * 100 * priceAmount;
    }

    // Fallback 1:1
    return ingredientQty * priceAmount;
  }

  /**
   * Normalise les unités
   */
  private static normalizeUnit(unit: string): string {
    const normalized = unit.toLowerCase().trim();
    const unitMap: Record<string, string> = {
      kilogram: "kg",
      kilograms: "kg",
      gram: "g",
      grams: "g",
      gramme: "g",
      grammes: "g",
      liter: "l",
      liters: "l",
      litre: "l",
      litres: "l",
      milliliter: "ml",
      milliliters: "ml",
      millilitre: "ml",
      millilitres: "ml",
      centiliter: "cl",
      centiliters: "cl",
      centilitre: "cl",
      centilitres: "cl",
      piece: "unit",
      pieces: "unit",
      unité: "unit",
      unités: "unit",
      pièce: "unit",
      pièces: "unit"
    };
    return unitMap[normalized] || normalized;
  }

  /**
   * Calcule la confiance d'un prix
   */
  public static calculateConfidence(dateRecorded: Date, hasStock = true): number {
    const now = new Date();
    const ageInDays = (now.getTime() - dateRecorded.getTime()) / (1000 * 60 * 60 * 24);

    let confidence = 1.0;

    // Pénalité pour ancienneté
    if (ageInDays > 30) {
      confidence *= 0.5;
    } else if (ageInDays > 14) {
      confidence *= 0.7;
    } else if (ageInDays > 7) {
      confidence *= 0.9;
    }

    // Pénalité si pas de stock
    if (!hasStock) {
      confidence *= 0.3;
    }

    return Math.max(0, Math.min(1, confidence));
  }
}
