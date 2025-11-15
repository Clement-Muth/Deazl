import { z } from "zod";

/**
 * Schema pour les données de qualité d'un produit (OpenFoodFacts)
 */
export const ProductQualityDataSchema = z.object({
  // Nutri-Score (A-E ou score numérique)
  nutriScore: z
    .object({
      grade: z.enum(["A", "B", "C", "D", "E", "unknown"]).optional(),
      score: z.number().min(0).max(100).optional() // Score normalisé 0-100
    })
    .optional(),

  // Nova Group (1-4: niveau de transformation)
  novaGroup: z
    .object({
      group: z.number().min(1).max(4).optional(),
      score: z.number().min(0).max(100).optional() // Score normalisé: 1→100, 4→25
    })
    .optional(),

  // Eco-Score (A-E ou score numérique)
  ecoScore: z
    .object({
      grade: z.enum(["A", "B", "C", "D", "E", "unknown"]).optional(),
      score: z.number().min(0).max(100).optional() // Score normalisé 0-100
    })
    .optional(),

  // Score global calculé (0-100)
  overallQualityScore: z.number().min(0).max(100).optional(),

  // Informations nutritionnelles complètes
  nutriments: z
    .object({
      energyKcal: z.number().optional(),
      energyKj: z.number().optional(),
      fat: z.number().optional(),
      saturatedFat: z.number().optional(),
      carbohydrates: z.number().optional(),
      sugars: z.number().optional(),
      fiber: z.number().optional(),
      proteins: z.number().optional(),
      salt: z.number().optional(),
      sodium: z.number().optional()
    })
    .optional(),

  // Additifs
  additives: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        riskLevel: z.enum(["safe", "moderate", "high_risk", "dangerous"]).optional()
      })
    )
    .optional(),

  // Allergènes
  allergens: z.array(z.string()).optional(),

  // Labels (Bio, Fair Trade, etc.)
  labels: z.array(z.string()).optional(),

  // Ingrédients
  ingredients: z
    .object({
      text: z.string().optional(),
      count: z.number().optional(),
      hasAllergens: z.boolean().optional(),
      hasPalmOil: z.boolean().optional()
    })
    .optional(),

  // Santé
  healthWarnings: z
    .object({
      hasSugar: z.boolean().optional(),
      hasSalt: z.boolean().optional(),
      hasSaturatedFat: z.boolean().optional()
    })
    .optional()
});

export type ProductQualityData = z.infer<typeof ProductQualityDataSchema>;

/**
 * Convertit une note lettre (A-E) en score numérique (0-100)
 */
export function gradeToScore(grade: "A" | "B" | "C" | "D" | "E" | "unknown"): number {
  const gradeMap: Record<string, number> = {
    A: 100,
    B: 75,
    C: 50,
    D: 25,
    E: 0,
    unknown: 50 // Neutre si inconnu
  };
  return gradeMap[grade] ?? 50;
}

/**
 * Convertit un Nova Group (1-4) en score (0-100)
 * 1 = non transformé = 100
 * 4 = ultra-transformé = 0
 */
export function novaGroupToScore(group: number): number {
  if (group < 1 || group > 4) return 50;
  return 100 - ((group - 1) * 100) / 3;
}

/**
 * Calcule le score de qualité global à partir des données OpenFoodFacts
 */
export function calculateOverallQualityScore(
  data: ProductQualityData,
  config: {
    nutriScoreWeight: number;
    novaGroupWeight: number;
    ecoScoreWeight: number;
  } = {
    nutriScoreWeight: 0.4,
    novaGroupWeight: 0.3,
    ecoScoreWeight: 0.3
  }
): number {
  let totalWeight = 0;
  let weightedSum = 0;

  // Nutri-Score
  if (data.nutriScore?.score !== undefined) {
    weightedSum += data.nutriScore.score * config.nutriScoreWeight;
    totalWeight += config.nutriScoreWeight;
  } else if (data.nutriScore?.grade) {
    const score = gradeToScore(data.nutriScore.grade);
    weightedSum += score * config.nutriScoreWeight;
    totalWeight += config.nutriScoreWeight;
  }

  // Nova Group
  if (data.novaGroup?.score !== undefined) {
    weightedSum += data.novaGroup.score * config.novaGroupWeight;
    totalWeight += config.novaGroupWeight;
  } else if (data.novaGroup?.group !== undefined) {
    const score = novaGroupToScore(data.novaGroup.group);
    weightedSum += score * config.novaGroupWeight;
    totalWeight += config.novaGroupWeight;
  }

  // Eco-Score
  if (data.ecoScore?.score !== undefined) {
    weightedSum += data.ecoScore.score * config.ecoScoreWeight;
    totalWeight += config.ecoScoreWeight;
  } else if (data.ecoScore?.grade) {
    const score = gradeToScore(data.ecoScore.grade);
    weightedSum += score * config.ecoScoreWeight;
    totalWeight += config.ecoScoreWeight;
  }

  // Si aucune donnée, retourner 50 (neutre)
  if (totalWeight === 0) return 50;

  // Normaliser en fonction du poids total disponible
  return weightedSum / totalWeight;
}

/**
 * Parse les données de qualité depuis le JSON OpenFoodFacts
 */
export function parseOpenFoodFactsQuality(offData: any): ProductQualityData {
  const data: ProductQualityData = {};

  // Nutri-Score - essayer plusieurs chemins possibles dans l'API
  const nutriGrade = offData.nutriscore_grade || offData.nutrition_grades || offData.nutriscore_data?.grade;
  if (nutriGrade && typeof nutriGrade === "string") {
    const grade = nutriGrade.toUpperCase();
    if (["A", "B", "C", "D", "E"].includes(grade)) {
      data.nutriScore = {
        grade: grade as any,
        score: gradeToScore(grade as any)
      };
    }
  } else if (offData.nutriscore_score !== undefined) {
    // Score numérique OpenFoodFacts: -15 à +40, normaliser à 0-100
    const normalized = Math.max(0, Math.min(100, ((offData.nutriscore_score + 15) / 55) * 100));
    data.nutriScore = {
      score: normalized
    };
  }

  // Nova Group - essayer plusieurs formats
  const novaGroup = offData.nova_group || offData.nova_groups || offData.nova_groups_tags?.[0];
  if (novaGroup) {
    const group = typeof novaGroup === "string" ? Number.parseInt(novaGroup) : novaGroup;
    if (!Number.isNaN(group) && group >= 1 && group <= 4) {
      data.novaGroup = {
        group,
        score: novaGroupToScore(group)
      };
    }
  }

  // Eco-Score - essayer plusieurs chemins
  const ecoGrade = offData.ecoscore_grade || offData.ecoscore_data?.grade;
  if (ecoGrade && typeof ecoGrade === "string") {
    const grade = ecoGrade.toUpperCase();
    if (["A", "B", "C", "D", "E"].includes(grade)) {
      data.ecoScore = {
        grade: grade as any,
        score: gradeToScore(grade as any)
      };
    }
  } else if (offData.ecoscore_score !== undefined) {
    // Score numérique: 0-100
    data.ecoScore = {
      score: Math.max(0, Math.min(100, offData.ecoscore_score))
    };
  }

  // Nutriments
  const nutriments = offData.nutriments || offData.nutriments_100g;
  if (nutriments) {
    data.nutriments = {
      energyKcal: nutriments["energy-kcal_100g"] || nutriments["energy-kcal"] || nutriments.energy_kcal,
      energyKj: nutriments["energy-kj_100g"] || nutriments["energy-kj"] || nutriments.energy_kj,
      fat: nutriments.fat_100g || nutriments.fat,
      saturatedFat:
        nutriments["saturated-fat_100g"] || nutriments["saturated-fat"] || nutriments.saturated_fat,
      carbohydrates: nutriments.carbohydrates_100g || nutriments.carbohydrates,
      sugars: nutriments.sugars_100g || nutriments.sugars,
      fiber: nutriments.fiber_100g || nutriments.fiber,
      proteins: nutriments.proteins_100g || nutriments.proteins,
      salt: nutriments.salt_100g || nutriments.salt,
      sodium: nutriments.sodium_100g || nutriments.sodium
    };
  }

  // Additifs avec noms et niveaux de risque
  if (offData.additives_tags && Array.isArray(offData.additives_tags)) {
    data.additives = offData.additives_tags.map((tag: string) => {
      // Extraire le code E (ex: "en:e330" -> "e330")
      const cleanTag = tag.replace("en:", "").toLowerCase();

      // Récupérer le nom depuis OpenFoodFacts ou utiliser le tag
      const name =
        offData.additives_original_tags?.[tag] ||
        offData.additives_names?.[tag] ||
        tag.replace("en:", "").replace("-", " ");

      // Déterminer le niveau de risque depuis OFF ou base de données
      let riskLevel: "safe" | "moderate" | "high_risk" | "dangerous" = "safe";

      // Utiliser les données OFF sur les risques si disponibles
      if (
        offData.additives_prev_tags?.includes(tag) ||
        offData.additives_that_may_be_from_palm_oil_tags?.includes(tag)
      ) {
        riskLevel = "moderate";
      }

      // Logique basée sur les catégories OFF
      if (tag.includes("sulphite") || tag.includes("benzoate") || tag.includes("nitrite")) {
        riskLevel = "high_risk";
      }

      if (tag.includes("tartrazine") || tag.includes("carmine") || tag.includes("aspartame")) {
        riskLevel = "dangerous";
      }

      return {
        id: cleanTag,
        name,
        riskLevel
      };
    });
  }

  // Allergènes
  if (offData.allergens_tags && Array.isArray(offData.allergens_tags)) {
    data.allergens = offData.allergens_tags.map((tag: string) => tag.replace("en:", ""));
  }

  // Labels
  if (offData.labels_tags && Array.isArray(offData.labels_tags)) {
    data.labels = offData.labels_tags.map((tag: string) => tag.replace("en:", ""));
  }

  // Ingrédients
  if (offData.ingredients_text || offData.ingredients) {
    data.ingredients = {
      text: offData.ingredients_text,
      count: offData.ingredients?.length || offData.ingredients_n,
      hasAllergens: offData.allergens_tags?.length > 0,
      hasPalmOil:
        offData.ingredients_from_palm_oil_n > 0 || offData.ingredients_that_may_be_from_palm_oil_n > 0
    };
  }

  // Avertissements santé
  data.healthWarnings = {
    hasSugar: nutriments?.sugars_100g > 15 || nutriments?.sugars > 15,
    hasSalt: nutriments?.salt_100g > 1.5 || nutriments?.salt > 1.5,
    hasSaturatedFat: nutriments?.["saturated-fat_100g"] > 5 || nutriments?.["saturated-fat"] > 5
  };

  // Calculer le score global
  data.overallQualityScore = calculateOverallQualityScore(data);

  return data;
}

/**
 * Formate un résumé lisible de la qualité
 * Ex: "Qualité : 82/100 - Nutri A / Eco B / Nova 2"
 */
export function formatQualitySummary(data: ProductQualityData): string {
  if (!data.overallQualityScore) return "Qualité : Non évaluée";

  const parts: string[] = [`Qualité : ${Math.round(data.overallQualityScore)}/100`];
  const details: string[] = [];

  if (data.nutriScore?.grade && data.nutriScore.grade !== "unknown") {
    details.push(`Nutri ${data.nutriScore.grade}`);
  }

  if (data.ecoScore?.grade && data.ecoScore.grade !== "unknown") {
    details.push(`Eco ${data.ecoScore.grade}`);
  }

  if (data.novaGroup?.group) {
    details.push(`Nova ${data.novaGroup.group}`);
  }

  if (details.length > 0) {
    parts.push(details.join(" / "));
  }

  return parts.join(" - ");
}
