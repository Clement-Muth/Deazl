import { auth } from "@deazl/system";
import { ShoppingListItem } from "../../Domain/Entities/ShoppingListItem.entity";
import type { ShoppingListItemRepository } from "../../Domain/Repositories/ShoppingListItemRepository";
import type { ShoppingListRepository } from "../../Domain/Repositories/ShoppingListRepository";
import { UnitType } from "../../Domain/ValueObjects/Unit.vo";

/**
 * Service d'application pour la gestion des articles de listes de courses
 */
export class ShoppingListItemApplicationService {
  constructor(
    private readonly listRepository: ShoppingListRepository,
    private readonly itemRepository: ShoppingListItemRepository
  ) {}

  /**
   * Ajoute un article à une liste de courses
   */
  async addItemToList(
    listId: string,
    itemData: {
      productId: string | null;
      recipeId?: string | null;
      recipeName?: string | null;
      quantity: number;
      unit: string;
      isCompleted?: boolean;
      notes?: string | null;
    }
  ): Promise<ShoppingListItem> {
    try {
      const session = await auth();
      if (!session?.user?.id) throw new Error("User not authenticated");

      const list = await this.listRepository.findById(listId);
      if (!list) throw new Error("Shopping list not found");

      // Vérifier les permissions de modification
      const userRole = list.getUserRole(session.user.id);
      if (!list.canUserModify(session.user.id, userRole || undefined)) {
        throw new Error("Unauthorized - insufficient permissions to modify list");
      }

      // Note: La validation des données est maintenant effectuée au niveau API avec les Value Objects

      // Créer l'entité article
      const item = ShoppingListItem.create({
        shoppingListId: listId,
        productId: itemData.productId,
        recipeId: itemData.recipeId || undefined,
        recipeName: itemData.recipeName || undefined,
        quantity: itemData.quantity,
        unit: itemData.unit,
        isCompleted: itemData.isCompleted || false,
        notes: itemData.notes || undefined
      });

      return this.itemRepository.addItem(listId, item);
    } catch (error) {
      console.error("Error adding item to list", error);
      throw error;
    }
  }

  /**
   * Met à jour un article de liste de courses
   */
  async updateShoppingListItem(
    itemId: string,
    data: Partial<{
      quantity: number;
      unit: string;
      isCompleted: boolean;
      notes: string | null;
      recipeId: string | null;
      recipeName: string | null;
    }>
  ): Promise<ShoppingListItem> {
    try {
      const session = await auth();
      if (!session?.user?.id) throw new Error("User not authenticated");

      const item = await this.itemRepository.findItemById(itemId);
      if (!item) throw new Error("Item not found");

      const list = await this.listRepository.findById(item.shoppingListId);
      if (!list) throw new Error("Shopping list not found");

      // Vérifier les permissions de modification
      const userRole = list.getUserRole(session.user.id);
      if (!list.canUserModify(session.user.id, userRole || undefined)) {
        throw new Error("Unauthorized - insufficient permissions to modify list");
      }

      // Create updated item using immutable methods
      let updatedItem = item;

      if (data.quantity !== undefined) {
        updatedItem = updatedItem.withQuantity(data.quantity);
      }

      if (data.unit !== undefined && Object.values(UnitType).includes(data.unit as UnitType)) {
        updatedItem = updatedItem.withUnit(data.unit);
      }

      if (data.isCompleted !== undefined) {
        if (data.isCompleted) {
          updatedItem = updatedItem.withCompletion();
        } else {
          updatedItem = updatedItem.withReset();
        }
      }

      if (data.notes !== undefined) {
        updatedItem = updatedItem.withNotes(data.notes);
      }

      if (data.recipeId !== undefined || data.recipeName !== undefined) {
        updatedItem = updatedItem.withRecipe(
          data.recipeId !== undefined ? data.recipeId : (updatedItem.recipeId ?? null),
          data.recipeName !== undefined ? data.recipeName : (updatedItem.recipeName ?? null)
        );
      }

      const result = await this.itemRepository.updateItem(updatedItem);

      return result;
    } catch (error) {
      console.error("Error updating shopping list item", error);
      throw error;
    }
  }

  /**
   * Supprime un article d'une liste de courses
   */
  async removeShoppingListItem(itemId: string): Promise<void> {
    try {
      const session = await auth();
      if (!session?.user?.id) throw new Error("User not authenticated");

      const item = await this.itemRepository.findItemById(itemId);
      if (!item) throw new Error("Item not found");

      const list = await this.listRepository.findById(item.shoppingListId);
      if (!list) throw new Error("Shopping list not found");

      // Vérifier les permissions de modification
      const userRole = list.getUserRole(session.user.id);
      if (!list.canUserModify(session.user.id, userRole || undefined)) {
        throw new Error("Unauthorized - insufficient permissions to modify list");
      }

      await this.itemRepository.removeItem(itemId);
    } catch (error) {
      console.error("Error removing shopping list item", error);
      throw error;
    }
  }

  /**
   * Bascule l'état de completion d'un article
   */
  async toggleItemCompletion(itemId: string): Promise<ShoppingListItem> {
    try {
      const session = await auth();
      if (!session?.user?.id) throw new Error("User not authenticated");

      const item = await this.itemRepository.findItemById(itemId);
      if (!item) throw new Error("Item not found");

      const list = await this.listRepository.findById(item.shoppingListId);
      if (!list) throw new Error("Shopping list not found");

      // Vérifier les permissions de modification
      const userRole = list.getUserRole(session.user.id);
      if (!list.canUserModify(session.user.id, userRole || undefined)) {
        throw new Error("Unauthorized - insufficient permissions to modify list");
      }

      const updatedItem = item.withUpdates(
        {
          isCompleted: !item.isCompleted
        },
        item.id
      );

      return this.itemRepository.updateItem(updatedItem);
    } catch (error) {
      console.error("Error toggling item completion", error);
      throw error;
    }
  }

  /**
   * Supprime tous les articles d'une liste de courses associés à une recette
   */
  async removeRecipeItemsFromList(listId: string, recipeId: string): Promise<number> {
    try {
      const session = await auth();
      if (!session?.user?.id) throw new Error("User not authenticated");

      const list = await this.listRepository.findById(listId);
      if (!list) throw new Error("Shopping list not found");

      // Vérifier les permissions de modification
      const userRole = list.getUserRole(session.user.id);
      if (!list.canUserModify(session.user.id, userRole || undefined)) {
        throw new Error("Unauthorized - insufficient permissions to modify list");
      }

      return this.itemRepository.removeRecipeItems(listId, recipeId);
    } catch (error) {
      console.error("Error removing recipe items from list", error);
      throw error;
    }
  }
}
