import { useEffect, useState } from "react";
import { getRecipePricing } from "../../Api/recipes/getRecipePricing.api";
import { getRecipeQuality } from "../../Api/recipes/getRecipeQuality.api";
import { getRecipeTips } from "../../Api/recipes/getRecipeTips.api";
import type { RecipeQualityResult } from "../../Domain/Services/RecipeComputeQuality.service";
import type { RecipePricingResult } from "../../Domain/Services/RecipePricing.service";

interface UseRecipeDataParams {
  recipeId: string;
  userId?: string;
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
 */
export function useRecipeData({ recipeId, userId }: UseRecipeDataParams): UseRecipeDataReturn {
  const [pricing, setPricing] = useState<RecipePricingResult | null>(null);
  const [quality, setQuality] = useState<RecipeQualityResult | null>(null);
  const [tips, setTips] = useState<RecipeTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Charger pricing, qualité et tips en parallèle
        const [pricingResult, qualityResult, tipsResult] = await Promise.all([
          getRecipePricing(recipeId, userId),
          getRecipeQuality(recipeId),
          getRecipeTips(recipeId)
        ]);

        // Pricing
        if ("error" in pricingResult) {
          console.error("Erreur pricing:", pricingResult.error);
        } else {
          setPricing(pricingResult);
        }

        // Quality
        if ("error" in qualityResult) {
          console.error("Erreur quality:", qualityResult.error);
        } else {
          setQuality(qualityResult);
        }

        // Tips
        setTips(tipsResult);
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
