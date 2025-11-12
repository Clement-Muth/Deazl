import { z } from "zod";

/**
 * Schema pour les préférences d'optimisation utilisateur
 */
export const OptimizationPreferencesSchema = z.object({
  // Pondérations pour l'algorithme (doivent totaliser 1.0)
  priceWeight: z.number().min(0).max(1).default(0.4),
  qualityWeight: z.number().min(0).max(1).default(0.3),
  distanceWeight: z.number().min(0).max(1).default(0.2),
  availabilityWeight: z.number().min(0).max(1).default(0.1),

  // Configuration qualité
  qualityConfig: z
    .object({
      nutriScoreWeight: z.number().min(0).max(1).default(0.4),
      novaGroupWeight: z.number().min(0).max(1).default(0.3),
      ecoScoreWeight: z.number().min(0).max(1).default(0.3)
    })
    .default({
      nutriScoreWeight: 0.4,
      novaGroupWeight: 0.3,
      ecoScoreWeight: 0.3
    }),

  // Filtres
  maxDistance: z.number().optional(), // en km
  excludedStores: z.array(z.string()).default([]),
  onlyInStock: z.boolean().default(false),

  // Marques préférées
  preferredBrands: z.array(z.string()).default([])
});

export type OptimizationPreferences = z.infer<typeof OptimizationPreferencesSchema>;

/**
 * Préférences par défaut
 */
export const DEFAULT_OPTIMIZATION_PREFERENCES: OptimizationPreferences = {
  priceWeight: 0.4,
  qualityWeight: 0.3,
  distanceWeight: 0.2,
  availabilityWeight: 0.1,
  qualityConfig: {
    nutriScoreWeight: 0.4,
    novaGroupWeight: 0.3,
    ecoScoreWeight: 0.3
  },
  excludedStores: [],
  onlyInStock: false,
  preferredBrands: []
};

/**
 * Valide et normalise les pondérations pour qu'elles totalisent 1.0
 */
export function normalizeWeights(prefs: OptimizationPreferences): OptimizationPreferences {
  const total = prefs.priceWeight + prefs.qualityWeight + prefs.distanceWeight + prefs.availabilityWeight;

  if (Math.abs(total - 1.0) < 0.001) {
    return prefs; // Déjà normalisé
  }

  // Normaliser
  return {
    ...prefs,
    priceWeight: prefs.priceWeight / total,
    qualityWeight: prefs.qualityWeight / total,
    distanceWeight: prefs.distanceWeight / total,
    availabilityWeight: prefs.availabilityWeight / total
  };
}
