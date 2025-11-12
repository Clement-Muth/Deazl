"use server";

import { AuthenticationService } from "@deazl/shared";
import { prisma } from "@deazl/system";

/**
 * Server Action pour récupérer toutes les alternatives de prix pour un item
 */
export async function getItemPriceAlternatives(itemId: string) {
  try {
    const authService = new AuthenticationService();
    const currentUser: any = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error("Unauthorized - user must be logged in");
    }

    // Récupérer l'item avec son produit
    const item = await prisma.shoppingListItem.findUnique({
      where: { id: itemId },
      include: {
        product: true,
        shoppingList: {
          include: {
            collaborators: true
          }
        }
      }
    });

    if (!item) {
      throw new Error("Item not found");
    }

    // Vérifier les permissions
    const isOwner = item.shoppingList.userId === currentUser.id;
    const isCollaborator = item.shoppingList.collaborators.some((c) => c.userId === currentUser.id);

    if (!isOwner && !isCollaborator) {
      throw new Error("Unauthorized - you don't have access to this list");
    }

    // Récupérer tous les prix disponibles pour ce produit
    const prices = await prisma.price.findMany({
      where: {
        product_id: item.productId
      },
      include: {
        store: true,
        product: {
          include: {
            brand: true
          }
        }
      },
      orderBy: {
        amount: "asc"
      }
    });

    // Transformer en format PriceAlternative
    const alternatives = prices.map((price) => ({
      id: price.id,
      amount: price.amount,
      currency: price.currency,
      unit: price.unit,
      storeName: price.store.name,
      storeLocation: price.store.location,
      dateRecorded: price.date_recorded,
      nutritionScore: price.product.nutrition_score
        ? (price.product.nutrition_score as any)?.score
        : undefined,
      // TODO: Intégrer distance depuis les préférences utilisateur/géolocalisation
      distance: undefined
    }));

    return {
      success: true,
      itemName: item.product?.name || "Unknown product",
      currentPriceId: item.selectedPriceId,
      alternatives
    };
  } catch (error) {
    console.error("Error getting item price alternatives:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      alternatives: []
    };
  }
}
