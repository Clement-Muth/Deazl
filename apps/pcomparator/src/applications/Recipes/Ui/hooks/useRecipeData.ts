import { useEffect, useState } from "react";
import { getRecipePricing } from "../../Api/recipes/getRecipePricing.api";
import { getRecipeQuality } from "../../Api/recipes/getRecipeQuality.api";
import { getRecipeTips } from "../../Api/recipes/getRecipeTips.api";
import type { RecipeQualityResult } from "../../Domain/Services/RecipeComputeQuality.service";
import type { RecipePricingResult } from "../../Domain/Services/RecipePricing.service";

interface UseRecipeDataParams {
  recipeId: string;
  userId?: string;
  initialPublicPricing?: RecipePricingResult | null;
}

interface RecipeTip {
  id: string;
  title: string | null;
  content: string;
  category: string;
  order: number;
}

interface UseRecipeDataReturn {
  pricing: RecipePricingResult | null;
  quality: RecipeQualityResult | null;
  tips: RecipeTip[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook pour charger les données de pricing et qualité d'une recette
 * Utilisé dans RecipeDetailsMobile pour afficher les prix et scores
 * Supporte le progressive enhancement avec initialPublicPricing pour le SEO
 */
export function useRecipeData({
  recipeId,
  userId,
  initialPublicPricing
}: UseRecipeDataParams): UseRecipeDataReturn {
  const [pricing, setPricing] = useState<RecipePricingResult | null>(initialPublicPricing || null);
  const [quality, setQuality] = useState<RecipeQualityResult | null>(null);
  const [tips, setTips] = useState<RecipeTip[]>([]);
  const [loading, setLoading] = useState(!initialPublicPricing);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const fetchPromises = [getRecipeQuality(recipeId), getRecipeTips(recipeId)] as const;

        if (userId) {
          const userPricingPromise = getRecipePricing(recipeId, userId);
          const [userPricingResult, qualityResult, tipsResult] = await Promise.all([
            userPricingPromise,
            ...fetchPromises
          ]);

          if ("error" in userPricingResult) {
            console.error("Erreur pricing:", userPricingResult.error);
          } else {
            setPricing(userPricingResult);
          }

          if ("error" in qualityResult) {
            console.error("Erreur quality:", qualityResult.error);
          } else {
            setQuality(qualityResult);
          }

          setTips(tipsResult);
        } else {
          const [qualityResult, tipsResult] = await Promise.all(fetchPromises);

          if ("error" in qualityResult) {
            console.error("Erreur quality:", qualityResult.error);
          } else {
            setQuality(qualityResult);
          }

          setTips(tipsResult);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors du chargement des données";
        setError(message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [recipeId, userId]);

  return { pricing, quality, tips, loading, error };
}
