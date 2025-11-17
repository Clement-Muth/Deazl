import type { ProductQualityData } from "../ValueObjects/ProductQuality.vo";

/**
 * Service d'optimisation des prix pour les items de liste de courses
 *
 * Ce service calcule le meilleur choix de prix/magasin pour chaque item
 * basé sur plusieurs critères pondérés :
 * - Prix (moins cher = meilleur)
 * - Distance du magasin (plus proche = meilleur)
 * - Qualité globale (Nutri-Score, Nova, Eco-Score)
 * - Stock disponible (en rupture = exclu)
 * - Marques préférées (bonus)
 */

export interface PriceAlternative {
  id: string;
  productId: string;
  storeId: string;
  storeName: string;
  storeLocation: string;
  amount: number;
  currency: string;
  unit: string;
  dateRecorded: Date;
  nutritionScore?: number; // Ancien: Score de 0 à 100 (DEPRECATED, utiliser qualityData)
  qualityData?: ProductQualityData; // Nouveau: Données de qualité étendues
  isInStock?: boolean;
  distance?: number; // Distance en km
  brandName?: string;
}

export interface UserPreferences {
  // Poids des critères (somme doit faire 1.0)
  priceWeight: number; // Par défaut: 0.4
  qualityWeight: number; // Par défaut: 0.3
  distanceWeight: number; // Par défaut: 0.2
  availabilityWeight: number; // Par défaut: 0.1

  // Préférences utilisateur
  maxDistance?: number; // Distance max acceptable en km
  preferredBrands?: string[]; // Marques préférées
  excludedStores?: string[]; // Magasins à exclure
}

export interface OptimizationResult {
  selectedPriceId: string;
  score: number;
  reason: string; // Explication du choix
  details: {
    priceScore: number;
    qualityScore: number;
    distanceScore: number;
    availabilityScore: number;
  };
}

export class PriceOptimizationService {
  /**
   * Optimise le choix de prix pour un item donné
   */
  public static optimizeItem(
    alternatives: PriceAlternative[],
    preferences: UserPreferences
  ): OptimizationResult | null {
    // Filtrer les alternatives
    const filtered = PriceOptimizationService.filterAlternatives(alternatives, preferences);

    if (filtered.length === 0) {
      return null;
    }

    // Si une seule alternative, la retourner directement
    if (filtered.length === 1) {
      return {
        selectedPriceId: filtered[0].id,
        score: 1.0,
        reason: "Seule option disponible",
        details: {
          priceScore: 1.0,
          qualityScore: 1.0,
          distanceScore: 1.0,
          availabilityScore: 1.0
        }
      };
    }

    // Calculer les scores pour chaque alternative
    const scoredAlternatives = filtered.map((alt) => ({
      alternative: alt,
      ...PriceOptimizationService.calculateScore(alt, filtered, preferences)
    }));

    // Trouver la meilleure alternative
    const best = scoredAlternatives.reduce((prev, current) =>
      current.totalScore > prev.totalScore ? current : prev
    );

    // Générer l'explication
    const reason = PriceOptimizationService.generateReason(best.alternative, best.details, preferences);

    return {
      selectedPriceId: best.alternative.id,
      score: best.totalScore,
      reason,
      details: best.details
    };
  }

  /**
   * Optimise tous les items d'une liste de courses
   */
  public static optimizeList(
    itemsWithAlternatives: Array<{
      itemId: string;
      alternatives: PriceAlternative[];
    }>,
    preferences: UserPreferences
  ): Map<string, OptimizationResult> {
    const results = new Map<string, OptimizationResult>();

    for (const item of itemsWithAlternatives) {
      const result = PriceOptimizationService.optimizeItem(item.alternatives, preferences);
      if (result) {
        results.set(item.itemId, result);
      }
    }

    return results;
  }

  /**
   * Filtre les alternatives selon les préférences utilisateur
   */
  private static filterAlternatives(
    alternatives: PriceAlternative[],
    preferences: UserPreferences
  ): PriceAlternative[] {
    return alternatives.filter((alt) => {
      // Exclure les produits en rupture de stock
      if (alt.isInStock === false) {
        return false;
      }

      // Exclure les magasins trop éloignés
      if (preferences.maxDistance && alt.distance && alt.distance > preferences.maxDistance) {
        return false;
      }

      // Exclure les magasins exclus
      if (preferences.excludedStores?.includes(alt.storeId)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Calcule le score global d'une alternative
   */
  private static calculateScore(
    alternative: PriceAlternative,
    allAlternatives: PriceAlternative[],
    preferences: UserPreferences
  ): { totalScore: number; details: OptimizationResult["details"] } {
    const priceScore = PriceOptimizationService.calculatePriceScore(alternative, allAlternatives);
    const qualityScore = PriceOptimizationService.calculateQualityScore(alternative, preferences);
    const distanceScore = PriceOptimizationService.calculateDistanceScore(alternative, allAlternatives);
    const availabilityScore = PriceOptimizationService.calculateAvailabilityScore(alternative);

    const totalScore =
      priceScore * preferences.priceWeight +
      qualityScore * preferences.qualityWeight +
      distanceScore * preferences.distanceWeight +
      availabilityScore * preferences.availabilityWeight;

    return {
      totalScore,
      details: {
        priceScore,
        qualityScore,
        distanceScore,
        availabilityScore
      }
    };
  }

  /**
   * Score du prix (0-1, 1 = moins cher)
   * Normalise le prix entre le min et le max des alternatives
   */
  private static calculatePriceScore(
    alternative: PriceAlternative,
    allAlternatives: PriceAlternative[]
  ): number {
    const prices = allAlternatives.map((a) => a.amount);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return 1.0;
    }

    // Score inversé : prix bas = score élevé
    return 1 - (alternative.amount - minPrice) / (maxPrice - minPrice);
  }

  /**
   * Score de qualité (0-1, 1 = meilleure qualité)
   * Utilise les données de qualité étendues (Nutri-Score, Nova, Eco-Score)
   */
  private static calculateQualityScore(alternative: PriceAlternative, preferences: UserPreferences): number {
    let score = 0.5; // Score par défaut si pas de données

    // Priorité 1: Utiliser les données de qualité étendues si disponibles
    if (alternative.qualityData?.overallQualityScore !== undefined) {
      score = alternative.qualityData.overallQualityScore / 100;
    }
    // Priorité 2: Fallback sur l'ancien système (nutrition_score simple)
    else if (alternative.nutritionScore !== undefined) {
      score = alternative.nutritionScore / 100;
    }

    // Bonus pour les marques préférées (+20%)
    if (alternative.brandName && preferences.preferredBrands?.includes(alternative.brandName)) {
      score = Math.min(1.0, score * 1.2);
    }

    return score;
  }

  /**
   * Score de distance (0-1, 1 = plus proche)
   */
  private static calculateDistanceScore(
    alternative: PriceAlternative,
    allAlternatives: PriceAlternative[]
  ): number {
    // Si pas de données de distance, score neutre
    const distances = allAlternatives.map((a) => a.distance).filter((d): d is number => d !== undefined);

    if (distances.length === 0 || alternative.distance === undefined) {
      return 0.5;
    }

    const minDistance = Math.min(...distances);
    const maxDistance = Math.max(...distances);

    if (minDistance === maxDistance) {
      return 1.0;
    }

    // Score inversé : distance courte = score élevé
    return 1 - (alternative.distance - minDistance) / (maxDistance - minDistance);
  }

  /**
   * Score de disponibilité (0-1)
   */
  private static calculateAvailabilityScore(alternative: PriceAlternative): number {
    // Si stock connu et disponible
    if (alternative.isInStock === true) {
      return 1.0;
    }

    // Si stock inconnu, score neutre
    if (alternative.isInStock === undefined) {
      return 0.7;
    }

    // Si en rupture (ne devrait pas arriver vu le filtre)
    return 0.0;
  }

  /**
   * Génère une explication lisible du choix
   */
  private static generateReason(
    alternative: PriceAlternative,
    scores: OptimizationResult["details"],
    preferences: UserPreferences
  ): string {
    const reasons: string[] = [];

    // Identifier le critère dominant
    const maxScore = Math.max(
      scores.priceScore * preferences.priceWeight,
      scores.qualityScore * preferences.qualityWeight,
      scores.distanceScore * preferences.distanceWeight,
      scores.availabilityScore * preferences.availabilityWeight
    );

    if (scores.priceScore * preferences.priceWeight === maxScore && scores.priceScore > 0.8) {
      reasons.push("Meilleur prix");
    }

    if (scores.qualityScore * preferences.qualityWeight === maxScore && scores.qualityScore > 0.8) {
      reasons.push("Meilleure qualité");
    }

    if (scores.distanceScore * preferences.distanceWeight === maxScore && scores.distanceScore > 0.8) {
      reasons.push("Magasin le plus proche");
    }

    // Marque préférée
    if (alternative.brandName && preferences.preferredBrands?.includes(alternative.brandName)) {
      reasons.push(`Marque préférée (${alternative.brandName})`);
    }

    if (reasons.length === 0) {
      return "Meilleur compromis qualité-prix-distance";
    }

    return reasons.join(" · ");
  }

  /**
   * Crée des préférences par défaut
   */
  public static defaultPreferences(): UserPreferences {
    return {
      priceWeight: 0.4,
      qualityWeight: 0.3,
      distanceWeight: 0.2,
      availabilityWeight: 0.1,
      maxDistance: 10, // 10km par défaut
      preferredBrands: [],
      excludedStores: []
    };
  }
}
