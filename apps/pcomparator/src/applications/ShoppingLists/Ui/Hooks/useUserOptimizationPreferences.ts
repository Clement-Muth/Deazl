import { useEffect, useState } from "react";
import { getUserOptimizationPreferences } from "../../Api/preferences/optimizationPreferences.api";
import type { UserOptimizationPreferences } from "../../Domain/Services/OptimalPricingService";

/**
 * Hook pour récupérer les préférences d'optimisation de l'utilisateur
 * Convertit le format OptimizationPreferences vers UserOptimizationPreferences
 */
export function useUserOptimizationPreferences() {
  const [preferences, setPreferences] = useState<UserOptimizationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true);
        const prefs = await getUserOptimizationPreferences();

        // Adapter le format de OptimizationPreferences vers UserOptimizationPreferences
        const adapted: UserOptimizationPreferences = {
          userLocation: prefs.userLocation || undefined,
          maxRadiusKm: prefs.maxDistance || 10,
          priceWeight: prefs.priceWeight || 0.7,
          favoriteStoreIds: prefs.favoriteStoreIds || [],
          showSavingSuggestions: true
        };

        setPreferences(adapted);
      } catch (err) {
        console.error("Error loading user preferences:", err);
        setError(err as Error);
        // Fallback sur des préférences par défaut
        setPreferences({
          showSavingSuggestions: true,
          maxRadiusKm: 10,
          priceWeight: 0.7
        });
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  return { preferences, loading, error };
}
