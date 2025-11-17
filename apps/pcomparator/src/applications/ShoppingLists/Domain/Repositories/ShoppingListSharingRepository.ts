import type { ShoppingList } from "../Entities/ShoppingList.entity";
import type { CollaboratorRole, ShoppingListCollaborator } from "../Entities/ShoppingListCollaborator.entity";

/**
 * Repository interface pour la gestion du partage des listes de courses
 */
export interface ShoppingListSharingRepository {
  /**
   * Trouve un utilisateur par son email
   */
  findUserByEmail(email: string): Promise<{ id: string; email: string } | null>;

  /**
   * Trouve un utilisateur par son ID
   */
  findUserById(id: string): Promise<{ id: string; email: string } | null>;

  /**
   * Génère un token de partage pour une liste
   */
  generateShareToken(listId: string): Promise<string>;

  /**
   * Récupère une liste par son token de partage
   */
  getByShareToken(token: string): Promise<ShoppingList | null>;

  /**
   * Met à jour le statut public d'une liste
   */
  updatePublicStatus(listId: string, isPublic: boolean): Promise<void>;

  /**
   * Ajoute un collaborateur à une liste
   */
  addCollaborator(listId: string, email: string, role: CollaboratorRole): Promise<ShoppingListCollaborator>;

  /**
   * Supprime un collaborateur d'une liste
   */
  removeCollaborator(listId: string, userId: string): Promise<void>;

  /**
   * Met à jour le rôle d'un collaborateur
   */
  updateCollaboratorRole(listId: string, userId: string, role: CollaboratorRole): Promise<void>;

  /**
   * Récupère tous les collaborateurs d'une liste
   */
  getCollaborators(listId: string): Promise<ShoppingListCollaborator[]>;
}
