import type { ShoppingListItem } from "../Entities/ShoppingListItem.entity";

/**
 * Repository interface pour la gestion des articles de listes de courses
 */
export interface ShoppingListItemRepository {
  /**
   * Ajoute un article à une liste de courses
   */
  addItem(listId: string, item: ShoppingListItem): Promise<ShoppingListItem>;

  /**
   * Met à jour un article de liste de courses
   */
  updateItem(item: ShoppingListItem): Promise<ShoppingListItem>;

  /**
   * Supprime un article d'une liste de courses
   */
  removeItem(itemId: string): Promise<void>;

  /**
   * Récupère un article par son ID
   */
  findItemById(id: string): Promise<ShoppingListItem | null>;

  /**
   * Supprime tous les articles associés à une recette dans une liste de courses
   * Retourne le nombre d'articles supprimés
   */
  removeRecipeItems(listId: string, recipeId: string): Promise<number>;
}
