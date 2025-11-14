"use server";

import { AuthenticationService } from "@deazl/shared";
import { prisma } from "@deazl/system";
import { revalidatePath } from "next/cache";
import {
  PriceOptimizationService,
  type UserPreferences
} from "../../Domain/Services/PriceOptimization.service";
import { PrismaShoppingListRepository } from "../../Infrastructure/Repositories/PrismaShoppingList.infrastructure";
import { PrismaShoppingListItemRepository } from "../../Infrastructure/Repositories/PrismaShoppingListItem.infrastructure";

/**
 * Server Action pour optimiser automatiquement tous les prix d'une liste
 */
export async function optimizeShoppingList(listId: string, preferences?: Partial<UserPreferences>) {
  try {
    const authService = new AuthenticationService();
    const currentUser: any = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error("Unauthorized - user must be logged in");
    }

    const listRepository = new PrismaShoppingListRepository();
    const itemRepository = new PrismaShoppingListItemRepository();

    // Récupérer la liste
    const list = await listRepository.findById(listId);
    if (!list) {
      throw new Error("Shopping list not found");
    }

    // Vérifier les permissions
    const userRole = list.getUserRole(currentUser.id);
    const canEdit = list.canUserModify(currentUser.id, userRole || undefined);
    if (!canEdit) {
      throw new Error("Unauthorized - you don't have permission to edit this list");
    }

    // Charger les préférences utilisateur depuis la base de données
    const userOptimizationPreferences = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { optimizationPreferences: true }
    });

    // Utiliser les préférences stockées, puis celles fournies en paramètre, puis les valeurs par défaut
    const userPrefs = {
      ...PriceOptimizationService.defaultPreferences(),
      ...((userOptimizationPreferences?.optimizationPreferences as Partial<UserPreferences>) || {}),
      ...preferences
    };

    // OPTIMISATION: Charger tous les prix en une seule requête batch
    const productIds = list.items.map((item) => item.productId).filter((id): id is string => id !== null);

    if (productIds.length === 0) {
      return {
        success: true,
        optimizedItems: 0,
        results: []
      };
    }

    // Une seule requête pour tous les prix de tous les produits
    const allPrices = await prisma.price.findMany({
      where: {
        product_id: {
          in: productIds
        }
      },
      include: {
        store: true,
        product: {
          include: {
            brand: true
          }
        }
      }
    });

    // Grouper les prix par productId
    const pricesByProduct = new Map<string, typeof allPrices>();
    for (const price of allPrices) {
      const existing = pricesByProduct.get(price.product_id) || [];
      existing.push(price);
      pricesByProduct.set(price.product_id, existing);
    }

    // Construire les alternatives pour chaque item
    const itemsWithAlternatives = list.items
      .filter((item) => item.productId)
      .map((item) => {
        const prices = pricesByProduct.get(item.productId!) || [];

        // Transformer en format PriceAlternative
        const alternatives = prices.map((price) => ({
          id: price.id,
          productId: price.product_id,
          storeId: price.store_id,
          storeName: price.store.name,
          storeLocation: price.store.location,
          amount: price.amount,
          currency: price.currency,
          unit: price.unit,
          dateRecorded: price.date_recorded,
          nutritionScore: price.product.nutrition_score
            ? (price.product.nutrition_score as any)?.score
            : undefined,
          brandName: price.product.brand?.name,
          // TODO: Intégrer distance et stock depuis d'autres sources
          isInStock: undefined,
          distance: undefined
        }));

        return {
          itemId: item.id,
          alternatives
        };
      });

    const validItems = itemsWithAlternatives;

    // Optimiser tous les items
    const optimizationResults = PriceOptimizationService.optimizeList(validItems, userPrefs);

    // Mettre à jour chaque item avec le prix optimisé
    const updates: Promise<any>[] = [];
    for (const [itemId, result] of optimizationResults.entries()) {
      const item = list.items.find((i) => i.id === itemId);
      if (item) {
        const updatedItem = item.withSelectedPrice(result.selectedPriceId);
        updates.push(itemRepository.updateItem(updatedItem));
      }
    }

    await Promise.all(updates);

    // Invalider le cache pour la liste de courses
    revalidatePath("/[locale]/shopping-lists/[id]", "page");
    revalidatePath(`/fr/shopping-lists/${listId}`);

    // Retourner les résultats avec les explications
    const results = Array.from(optimizationResults.entries()).map(([itemId, result]) => ({
      itemId,
      selectedPriceId: result.selectedPriceId,
      reason: result.reason,
      score: result.score
    }));

    return {
      success: true,
      optimizedItems: results.length,
      results
    };
  } catch (error) {
    console.error("Error optimizing shopping list:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}
