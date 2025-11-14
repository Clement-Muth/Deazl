"use server";

import { AuthenticationService } from "@deazl/shared";
import { revalidatePath } from "next/cache";
import { PrismaShoppingListRepository } from "../../Infrastructure/Repositories/PrismaShoppingList.infrastructure";
import { PrismaShoppingListItemRepository } from "../../Infrastructure/Repositories/PrismaShoppingListItem.infrastructure";

/**
 * Server Action pour sélectionner manuellement un prix pour un item
 */
export async function selectItemPrice(itemId: string, priceId: string | null) {
  try {
    const authService = new AuthenticationService();
    const currentUser: any = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error("Unauthorized - user must be logged in");
    }

    const itemRepository = new PrismaShoppingListItemRepository();
    const listRepository = new PrismaShoppingListRepository();

    // Récupérer l'item
    const item = await itemRepository.findItemById(itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Vérifier que l'utilisateur a accès à la liste
    const list = await listRepository.findById(item.shoppingListId);
    if (!list) {
      throw new Error("Shopping list not found");
    }

    // Vérifier les permissions (propriétaire ou collaborateur éditeur)
    const userRole = list.getUserRole(currentUser.id);
    const canEdit = list.canUserModify(currentUser.id, userRole || undefined);
    if (!canEdit) {
      throw new Error("Unauthorized - you don't have permission to edit this list");
    }

    // Mettre à jour l'item avec le prix sélectionné
    const updatedItem = item.withSelectedPrice(priceId);
    await itemRepository.updateItem(updatedItem);

    // Invalider le cache pour la liste de courses
    revalidatePath("/[locale]/shopping-lists/[id]", "page");
    revalidatePath(`/fr/shopping-lists/${updatedItem.shoppingListId}`);

    return {
      success: true,
      itemId: updatedItem.id,
      selectedPriceId: priceId
    };
  } catch (error) {
    console.error("Error selecting item price:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}
