"use server";

import { PrismaClient } from "@prisma/client";
import { RecipePricingService } from "../../Domain/Services/RecipePricing.service";
import type {
  PriceCandidate,
  RecipePricingResult,
  UserPricingContext
} from "../../Domain/Services/RecipePricing.service";
import { PrismaRecipeRepository } from "../../Infrastructure/Repositories/PrismaRecipe.infrastructure";

const prisma = new PrismaClient();

/**
 * Récupère le pricing dynamique d'une recette
 *
 * @param recipeId - ID de la recette
 * @param userId - ID utilisateur (optionnel, pour mode personnalisé)
 * @returns Résultat de pricing avec breakdown détaillé
 */
export async function getRecipePricing(
  recipeId: string,
  userId?: string
): Promise<RecipePricingResult | { error: string }> {
  try {
    // 1. Récupérer la recette avec ses ingrédients
    const recipeRepository = new PrismaRecipeRepository();
    const recipe = await recipeRepository.findById(recipeId);

    if (!recipe) {
      return { error: "Recette introuvable" };
    }

    // 2. Récupérer les produits et leurs prix
    const productIds = recipe.ingredients.map((ing) => ing.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        prices: {
          where: {
            date_recorded: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Prix des 90 derniers jours
            }
          },
          include: {
            store: {
              select: {
                id: true,
                name: true,
                location: true,
                latitude: true,
                longitude: true
              }
            }
          },
          orderBy: {
            date_recorded: "desc"
          },
          take: 100 // Limiter à 100 prix par produit
        }
      }
    });

    // 3. Construire la map de candidats de prix
    const pricesCandidates = new Map<string, PriceCandidate[]>();

    for (const product of products) {
      const candidates: PriceCandidate[] = product.prices.map((price) => {
        const qualityData = product.nutrition_score as any;
        return {
          id: price.id,
          productId: product.id,
          storeId: price.store.id,
          storeName: price.store.name,
          storeLocation: price.store.location || "Localisation inconnue",
          amount: price.amount,
          currency: price.currency,
          unit: price.unit,
          dateRecorded: price.date_recorded,
          distanceKm: undefined, // Calculé plus tard si localisation utilisateur disponible
          qualityScore: qualityData?.overallQualityScore,
          confidence: RecipePricingService.calculateConfidence(price.date_recorded, true)
        };
      });

      pricesCandidates.set(product.id, candidates);
    }

    // 4. Si userId fourni, récupérer le contexte utilisateur
    let userContext: UserPricingContext | undefined;

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          optimizationPreferences: true
        }
      });

      if (user?.optimizationPreferences) {
        const prefs = user.optimizationPreferences as any;

        userContext = {
          userId: user.id,
          userLocation:
            prefs.latitude && prefs.longitude
              ? { latitude: prefs.latitude, longitude: prefs.longitude }
              : undefined,
          maxDistanceKm: prefs.maxDistanceKm || 10,
          favoriteStoreIds: prefs.favoriteStoreIds || [],
          excludedStoreIds: prefs.excludedStoreIds || [],
          preferredBrands: prefs.preferredBrands || []
        };

        // Calculer les distances si localisation utilisateur disponible
        if (userContext.userLocation) {
          for (const [productId, candidates] of pricesCandidates.entries()) {
            for (const candidate of candidates) {
              const store = products
                .find((p) => p.id === productId)
                ?.prices.find((pr) => pr.id === candidate.id)?.store;

              if (store?.latitude && store?.longitude) {
                candidate.distanceKm = calculateDistance(
                  userContext.userLocation.latitude,
                  userContext.userLocation.longitude,
                  store.latitude,
                  store.longitude
                );
              }
            }
          }
        }
      }
    }

    // 5. Calculer le pricing
    const result = userContext
      ? await RecipePricingService.computeForUser(
          recipe.ingredients,
          pricesCandidates,
          userContext,
          recipe.servings
        )
      : await RecipePricingService.computePublic(recipe.ingredients, pricesCandidates, recipe.servings);

    return result;
  } catch (error) {
    console.error("Erreur lors du calcul du pricing:", error);
    return { error: "Erreur lors du calcul du prix de la recette" };
  }
}

/**
 * Calcule la distance entre deux points GPS (formule de Haversine)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
