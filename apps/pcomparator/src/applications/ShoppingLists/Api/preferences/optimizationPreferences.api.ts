"use server";

import { prisma } from "@deazl/system";
import { AuthenticationService } from "~/applications/Shared/Application/Services/Authentication.service";
import {
  DEFAULT_OPTIMIZATION_PREFERENCES,
  type OptimizationPreferences,
  OptimizationPreferencesSchema,
  normalizeWeights
} from "../../Domain/ValueObjects/OptimizationPreferences.vo";

/**
 * Récupère les préférences d'optimisation de l'utilisateur
 */
export async function getUserOptimizationPreferences(): Promise<OptimizationPreferences> {
  try {
    const authService = new AuthenticationService();
    const currentUser: any = await authService.getCurrentUser();

    if (!currentUser) {
      // Retourner les préférences par défaut si non connecté
      return DEFAULT_OPTIMIZATION_PREFERENCES;
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { optimizationPreferences: true }
    });

    if (!user?.optimizationPreferences) {
      return DEFAULT_OPTIMIZATION_PREFERENCES;
    }

    // Valider et parser les préférences
    const parsed = OptimizationPreferencesSchema.parse(user.optimizationPreferences);
    return normalizeWeights(parsed);
  } catch (error) {
    console.error("Error getting user optimization preferences:", error);
    return DEFAULT_OPTIMIZATION_PREFERENCES;
  }
}

/**
 * Met à jour les préférences d'optimisation de l'utilisateur
 */
export async function updateUserOptimizationPreferences(
  preferences: Partial<OptimizationPreferences>
): Promise<{ success: boolean; preferences?: OptimizationPreferences; error?: string }> {
  try {
    const authService = new AuthenticationService();
    const currentUser: any = await authService.getCurrentUser();

    if (!currentUser) {
      return { success: false, error: "Non authentifié" };
    }

    // Récupérer les préférences actuelles
    const current = await getUserOptimizationPreferences();

    // Merger avec les nouvelles préférences
    const merged = { ...current, ...preferences };

    // Valider
    const validated = OptimizationPreferencesSchema.parse(merged);

    // Normaliser les pondérations
    const normalized = normalizeWeights(validated);

    // Sauvegarder
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        optimizationPreferences: normalized as any
      }
    });

    return { success: true, preferences: normalized };
  } catch (error) {
    console.error("Error updating user optimization preferences:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la sauvegarde"
    };
  }
}

/**
 * Réinitialise les préférences aux valeurs par défaut
 */
export async function resetOptimizationPreferences(): Promise<{
  success: boolean;
  preferences?: OptimizationPreferences;
  error?: string;
}> {
  try {
    const authService = new AuthenticationService();
    const currentUser: any = await authService.getCurrentUser();

    if (!currentUser) {
      return { success: false, error: "Non authentifié" };
    }

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        optimizationPreferences: DEFAULT_OPTIMIZATION_PREFERENCES as any
      }
    });

    return { success: true, preferences: DEFAULT_OPTIMIZATION_PREFERENCES };
  } catch (error) {
    console.error("Error resetting optimization preferences:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la réinitialisation"
    };
  }
}
