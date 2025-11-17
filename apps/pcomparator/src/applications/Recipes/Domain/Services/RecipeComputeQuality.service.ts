// @ts-nocheck
import type { RecipeIngredient } from "../Entities/RecipeIngredient.entity";

/**
 * Données de qualité d'un produit (provenant de nutrition_score JSON)
 */
export interface ProductQualityData {
  nutriScore?: {
    grade?: "A" | "B" | "C" | "D" | "E" | "unknown";
    score?: number; // 0-100
  };
  novaGroup?: {
    group?: number; // 1-4
    score?: number; // 0-100
  };
  ecoScore?: {
    grade?: "A" | "B" | "C" | "D" | "E" | "unknown";
    score?: number; // 0-100
  };
  overallQualityScore?: number; // 0-100
  additives?: Array<{
    id: string;
    name: string;
    riskLevel?: "safe" | "moderate" | "high_risk" | "dangerous";
  }>;
  allergens?: string[];
}

/**
 * Produit avec ses données de qualité
 */
export interface ProductWithQuality {
  id: string;
  name: string;
  nutrition_score?: any; // JSON brut de la BDD
  qualityData?: ProductQualityData; // Données parsées
}

/**
 * Résultat du calcul de qualité d'une recette
 */
export interface RecipeQualityResult {
  qualityScore: number; // Score global 0-100
  averageNutriScore: string; // Grade moyen A-E
  averageEcoScore: string; // Grade moyen A-E
  avgNovaGroup: number; // Groupe Nova moyen 1-4
  additivesCount: number; // Nombre total d'additifs
  allergensCount: number; // Nombre total d'allergènes
  additives?: Array<{
    id: string;
    name: string;
    riskLevel: "safe" | "moderate" | "high_risk" | "dangerous";
  }>; // Liste complète des additifs trouvés
  allergens?: string[]; // Liste complète des allergènes
  nutritionalAlerts: NutritionalAlert[]; // Alertes nutritionnelles
  details: QualityBreakdownItem[]; // Détail par ingrédient
  recommendations: QualityRecommendation[]; // Suggestions d'amélioration
}

export interface QualityBreakdownItem {
  ingredientId: string;
  ingredientName?: string;
  productId: string;
  productName: string;
  weight: number; // Pondération proportionnelle à la quantité
  nutriScore?: string;
  ecoScore?: string;
  novaGroup?: number;
  qualityScore: number;
}

/**
 * Alert nutritionnel (sel, sucre, graisses)
 */
export interface NutritionalAlert {
  type: "salt" | "sugar" | "saturated_fat"; // Type d'alerte
  severity: "warning" | "danger"; // Niveau de gravité
  value: number; // Valeur détectée (g/100g)
  threshold: number; // Seuil recommandé (g/100g)
  message: string; // Message explicatif
}

/**
 * Recommandation pour améliorer la qualité
 */
export interface QualityRecommendation {
  type: "substitute" | "reduce" | "remove"; // Type de suggestion
  ingredientId: string;
  ingredientName: string;
  currentQuality: number; // Score actuel 0-100
  reason: string; // Raison (e.g., "Trop d'additifs", "Nova 4")
  suggestion: string; // Action suggérée (e.g., "Remplacer par X")
  alternativeProductId?: string; // ID du produit alternatif
  alternativeProductName?: string; // Nom du produit alternatif
  expectedQualityGain: number; // Points de qualité gagnés
  expectedCostChange?: number; // Impact prix (€)
  priority: "high" | "medium" | "low"; // Priorité
}

/**
 * Service de domaine pour calculer la qualité nutritionnelle globale d'une recette
 *
 * Logique métier :
 * - Pondérer chaque ingrédient par sa quantité
 * - Calculer les moyennes pondérées des scores
 * - Agréger les additifs et allergènes
 */
export class RecipeComputeQualityService {
  /**
   * Calcule la qualité globale d'une recette
   */
  public static computeRecipeQuality(
    ingredients: RecipeIngredient[],
    products: ProductWithQuality[]
  ): RecipeQualityResult {
    // Map pour accès rapide aux produits
    const productMap = new Map<string, ProductWithQuality>();
    for (const product of products) {
      productMap.set(product.id, product);
    }

    // Parse et calcule les données de qualité
    const qualityItems: QualityBreakdownItem[] = [];
    const allAdditivesMap = new Map<
      string,
      { id: string; name: string; riskLevel: "safe" | "moderate" | "high_risk" | "dangerous" }
    >();
    const allAllergens = new Set<string>();

    let totalWeight = 0;
    let weightedNutriScoreSum = 0;
    let weightedEcoScoreSum = 0;
    let weightedNovaGroupSum = 0;
    let weightedQualitySum = 0;

    let nutriScoreCount = 0;
    let ecoScoreCount = 0;
    let novaGroupCount = 0;

    // Parcourir chaque ingrédient
    for (const ingredient of ingredients) {
      const product = productMap.get(ingredient.productId);

      if (!product) {
        continue;
      }

      // Parser les données de qualité
      const qualityData = RecipeComputeQualityService.parseQualityData(product.nutrition_score);

      // Calculer le poids de l'ingrédient (proportionnel à sa quantité)
      const weight = ingredient.quantity;
      totalWeight += weight;

      // Extraire les scores
      const nutriScoreValue = RecipeComputeQualityService.getNutriScoreValue(qualityData);
      const ecoScoreValue = RecipeComputeQualityService.getEcoScoreValue(qualityData);
      const novaGroupValue = qualityData.novaGroup?.group || 0;
      const productQualityScore = qualityData.overallQualityScore || 50;

      // Accumuler les scores pondérés
      if (nutriScoreValue > 0) {
        weightedNutriScoreSum += nutriScoreValue * weight;
        nutriScoreCount++;
      }

      if (ecoScoreValue > 0) {
        weightedEcoScoreSum += ecoScoreValue * weight;
        ecoScoreCount++;
      }

      if (novaGroupValue > 0) {
        weightedNovaGroupSum += novaGroupValue * weight;
        novaGroupCount++;
      }

      weightedQualitySum += productQualityScore * weight;

      // Collecter additifs et allergènes
      if (qualityData.additives) {
        for (const additive of qualityData.additives) {
          if (!allAdditivesMap.has(additive.id)) {
            allAdditivesMap.set(additive.id, {
              id: additive.id,
              name: additive.name,
              riskLevel: additive.riskLevel || "safe"
            });
          }
        }
      }

      if (qualityData.allergens) {
        for (const allergen of qualityData.allergens) {
          allAllergens.add(allergen);
        }
      }

      // Ajouter au détail
      qualityItems.push({
        ingredientId: ingredient.id,
        ingredientName: ingredient.productName,
        productId: product.id,
        productName: product.name,
        weight,
        nutriScore: qualityData.nutriScore?.grade,
        ecoScore: qualityData.ecoScore?.grade,
        novaGroup: qualityData.novaGroup?.group,
        qualityScore: productQualityScore
      });
    }

    // Calculer les moyennes pondérées
    const avgNutriScore = totalWeight > 0 ? weightedNutriScoreSum / totalWeight : 0;
    const avgEcoScore = totalWeight > 0 ? weightedEcoScoreSum / totalWeight : 0;
    const avgNovaGroup = totalWeight > 0 ? weightedNovaGroupSum / totalWeight : 0;
    const overallQualityScore = totalWeight > 0 ? weightedQualitySum / totalWeight : 50;

    // Convertir les scores moyens en grades
    const averageNutriScoreGrade = RecipeComputeQualityService.scoreToGrade(avgNutriScore);
    const averageEcoScoreGrade = RecipeComputeQualityService.scoreToGrade(avgEcoScore);

    // Générer des recommandations
    const recommendations = RecipeComputeQualityService.generateRecommendations(
      qualityItems,
      productMap,
      overallQualityScore
    );

    // Générer des alertes nutritionnelles
    const nutritionalAlerts = RecipeComputeQualityService.generateNutritionalAlerts(
      qualityItems,
      productMap,
      totalWeight
    );

    return {
      qualityScore: Math.round(overallQualityScore),
      averageNutriScore: averageNutriScoreGrade,
      averageEcoScore: averageEcoScoreGrade,
      avgNovaGroup: Math.round(avgNovaGroup * 10) / 10, // Arrondi à 1 décimale
      additivesCount: allAdditivesMap.size,
      allergensCount: allAllergens.size,
      additives: Array.from(allAdditivesMap.values()),
      allergens: Array.from(allAllergens),
      nutritionalAlerts,
      details: qualityItems,
      recommendations
    };
  }

  /**
   * Génère des recommandations pour améliorer la qualité
   */
  private static generateRecommendations(
    qualityItems: QualityBreakdownItem[],
    productMap: Map<string, ProductWithQuality>,
    currentQuality: number
  ): QualityRecommendation[] {
    const recommendations: QualityRecommendation[] = [];

    for (const item of qualityItems) {
      const product = productMap.get(item.productId);
      if (!product) continue;

      const qualityData = RecipeComputeQualityService.parseQualityData(product.nutrition_score);

      // Recommandation 1 : Produits Nova 4 (ultra-transformés)
      if (qualityData.novaGroup?.group === 4) {
        recommendations.push({
          type: "substitute",
          ingredientId: item.ingredientId,
          ingredientName: item.ingredientName || item.productName,
          currentQuality: item.qualityScore,
          reason: "Produit ultra-transformé (Nova 4)",
          suggestion: "Remplacer par une alternative moins transformée",
          expectedQualityGain: 25,
          priority: "high"
        });
      }

      // Recommandation 2 : NutriScore D ou E
      if (qualityData.nutriScore?.grade === "D" || qualityData.nutriScore?.grade === "E") {
        recommendations.push({
          type: "substitute",
          ingredientId: item.ingredientId,
          ingredientName: item.ingredientName || item.productName,
          currentQuality: item.qualityScore,
          reason: `Faible qualité nutritionnelle (NutriScore ${qualityData.nutriScore.grade})`,
          suggestion: "Choisir un produit avec un meilleur NutriScore (A ou B)",
          expectedQualityGain: 20,
          priority: "high"
        });
      }

      // Recommandation 3 : Nombreux additifs
      const additivesCount = qualityData.additives?.length || 0;
      if (additivesCount >= 5) {
        recommendations.push({
          type: "substitute",
          ingredientId: item.ingredientId,
          ingredientName: item.ingredientName || item.productName,
          currentQuality: item.qualityScore,
          reason: `Contient ${additivesCount} additifs`,
          suggestion: "Préférer un produit avec moins d'additifs",
          expectedQualityGain: 15,
          priority: "medium"
        });
      }

      // Recommandation 4 : EcoScore faible
      if (qualityData.ecoScore?.grade === "D" || qualityData.ecoScore?.grade === "E") {
        recommendations.push({
          type: "substitute",
          ingredientId: item.ingredientId,
          ingredientName: item.ingredientName || item.productName,
          currentQuality: item.qualityScore,
          reason: `Faible impact environnemental (EcoScore ${qualityData.ecoScore.grade})`,
          suggestion: "Choisir une alternative plus durable",
          expectedQualityGain: 10,
          priority: "low"
        });
      }
    }

    // Dédupliquer par ingredientId (garder la plus haute priorité)
    const deduped = new Map<string, QualityRecommendation>();
    for (const rec of recommendations) {
      const existing = deduped.get(rec.ingredientId);
      if (!existing) {
        deduped.set(rec.ingredientId, rec);
      } else {
        // Garder la plus haute priorité
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[rec.priority] > priorityOrder[existing.priority]) {
          deduped.set(rec.ingredientId, rec);
        }
      }
    }

    // Trier par priorité et gain attendu
    const uniqueRecs = Array.from(deduped.values());
    uniqueRecs.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.expectedQualityGain - a.expectedQualityGain;
    });

    // Limiter à 5 recommandations max
    return uniqueRecs.slice(0, 5);
  }

  /**
   * Parse les données de qualité depuis le JSON nutrition_score
   */
  public static parseQualityData(nutritionScore: any): ProductQualityData {
    if (!nutritionScore || typeof nutritionScore !== "object") {
      return {};
    }

    const data: ProductQualityData = {};

    // NutriScore
    if (nutritionScore.nutriScore) {
      data.nutriScore = {
        grade: nutritionScore.nutriScore.grade,
        score: nutritionScore.nutriScore.score
      };
    }

    // NovaGroup
    if (nutritionScore.novaGroup) {
      data.novaGroup = {
        group: nutritionScore.novaGroup.group,
        score: nutritionScore.novaGroup.score
      };
    }

    // EcoScore
    if (nutritionScore.ecoScore) {
      data.ecoScore = {
        grade: nutritionScore.ecoScore.grade,
        score: nutritionScore.ecoScore.score
      };
    }

    // Score global
    if (nutritionScore.overallQualityScore !== undefined) {
      data.overallQualityScore = nutritionScore.overallQualityScore;
    }

    // Additifs
    if (nutritionScore.additives && Array.isArray(nutritionScore.additives)) {
      data.additives = nutritionScore.additives;
    }

    // Allergènes
    if (nutritionScore.allergens && Array.isArray(nutritionScore.allergens)) {
      data.allergens = nutritionScore.allergens;
    }

    return data;
  }

  /**
   * Convertit un grade NutriScore en valeur numérique pour le calcul de moyenne
   */
  private static getNutriScoreValue(qualityData: ProductQualityData): number {
    if (qualityData.nutriScore?.score !== undefined) {
      return qualityData.nutriScore.score;
    }

    if (qualityData.nutriScore?.grade && qualityData.nutriScore.grade !== "unknown") {
      return RecipeComputeQualityService.gradeToScore(qualityData.nutriScore.grade);
    }

    return 0;
  }

  /**
   * Convertit un grade EcoScore en valeur numérique pour le calcul de moyenne
   */
  private static getEcoScoreValue(qualityData: ProductQualityData): number {
    if (qualityData.ecoScore?.score !== undefined) {
      return qualityData.ecoScore.score;
    }

    if (qualityData.ecoScore?.grade && qualityData.ecoScore.grade !== "unknown") {
      return RecipeComputeQualityService.gradeToScore(qualityData.ecoScore.grade);
    }

    return 0;
  }

  /**
   * Convertit un grade (A-E) en score numérique (0-100)
   */
  private static gradeToScore(grade: string): number {
    const gradeMap: Record<string, number> = {
      A: 100,
      B: 75,
      C: 50,
      D: 25,
      E: 0
    };
    return gradeMap[grade] || 0;
  }

  /**
   * Génère des alertes nutritionnelles (trop salé, sucré, gras)
   * Basé sur les recommandations WHO pour 100g de produit
   */
  private static generateNutritionalAlerts(
    qualityItems: QualityBreakdownItem[],
    productMap: Map<string, ProductWithQuality>,
    totalWeight: number
  ): NutritionalAlert[] {
    const alerts: NutritionalAlert[] = [];

    // Thresholds WHO pour 100g
    const SALT_WARNING = 1.25; // g/100g
    const SALT_DANGER = 1.5; // g/100g
    const SUGAR_WARNING = 12.5; // g/100g
    const SUGAR_DANGER = 22.5; // g/100g
    const SAT_FAT_WARNING = 5; // g/100g
    const SAT_FAT_DANGER = 10; // g/100g

    let totalSalt = 0;
    let totalSugar = 0;
    let totalSaturatedFat = 0;
    let countWithData = 0;

    // Agréger les nutriments pondérés par quantité
    for (const item of qualityItems) {
      const product = productMap.get(item.productId);
      if (!product?.nutrition_score) continue;

      const qualityData = RecipeComputeQualityService.parseQualityData(product.nutrition_score);
      if (!qualityData.nutriments) continue;

      const weight = item.weight;

      if (qualityData.nutriments.salt !== undefined) {
        totalSalt += qualityData.nutriments.salt * weight;
        countWithData++;
      }

      if (qualityData.nutriments.sugars !== undefined) {
        totalSugar += qualityData.nutriments.sugars * weight;
      }

      if (qualityData.nutriments.saturatedFat !== undefined) {
        totalSaturatedFat += qualityData.nutriments.saturatedFat * weight;
      }
    }

    if (countWithData === 0 || totalWeight === 0) return alerts;

    // Calculer les moyennes pondérées pour 100g
    const avgSalt = totalSalt / totalWeight;
    const avgSugar = totalSugar / totalWeight;
    const avgSaturatedFat = totalSaturatedFat / totalWeight;

    // Vérifier les seuils - Sel
    if (avgSalt >= SALT_DANGER) {
      alerts.push({
        type: "salt",
        severity: "danger",
        value: Math.round(avgSalt * 10) / 10,
        threshold: SALT_DANGER,
        message: `Very high salt content (${(avgSalt * 10) / 10}g/100g). WHO recommends less than ${SALT_DANGER}g/100g.`
      });
    } else if (avgSalt >= SALT_WARNING) {
      alerts.push({
        type: "salt",
        severity: "warning",
        value: Math.round(avgSalt * 10) / 10,
        threshold: SALT_WARNING,
        message: `High salt content (${(avgSalt * 10) / 10}g/100g). Consider reducing salt.`
      });
    }

    // Vérifier les seuils - Sucre
    if (avgSugar >= SUGAR_DANGER) {
      alerts.push({
        type: "sugar",
        severity: "danger",
        value: Math.round(avgSugar * 10) / 10,
        threshold: SUGAR_DANGER,
        message: `Very high sugar content (${(avgSugar * 10) / 10}g/100g). WHO recommends less than ${SUGAR_DANGER}g/100g.`
      });
    } else if (avgSugar >= SUGAR_WARNING) {
      alerts.push({
        type: "sugar",
        severity: "warning",
        value: Math.round(avgSugar * 10) / 10,
        threshold: SUGAR_WARNING,
        message: `High sugar content (${(avgSugar * 10) / 10}g/100g). Consider reducing sugar.`
      });
    }

    // Vérifier les seuils - Graisses saturées
    if (avgSaturatedFat >= SAT_FAT_DANGER) {
      alerts.push({
        type: "saturated_fat",
        severity: "danger",
        value: Math.round(avgSaturatedFat * 10) / 10,
        threshold: SAT_FAT_DANGER,
        message: `Very high saturated fat content (${(avgSaturatedFat * 10) / 10}g/100g). WHO recommends less than ${SAT_FAT_DANGER}g/100g.`
      });
    } else if (avgSaturatedFat >= SAT_FAT_WARNING) {
      alerts.push({
        type: "saturated_fat",
        severity: "warning",
        value: Math.round(avgSaturatedFat * 10) / 10,
        threshold: SAT_FAT_WARNING,
        message: `High saturated fat content (${(avgSaturatedFat * 10) / 10}g/100g). Consider reducing saturated fat.`
      });
    }

    return alerts;
  }

  /**
   * Convertit un score numérique (0-100) en grade (A-E)
   */
  private static scoreToGrade(score: number): string {
    if (score >= 90) return "A";
    if (score >= 70) return "B";
    if (score >= 50) return "C";
    if (score >= 30) return "D";
    if (score > 0) return "E";
    return "unknown";
  }
}
