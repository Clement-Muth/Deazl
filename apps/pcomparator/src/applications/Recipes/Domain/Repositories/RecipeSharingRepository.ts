import type { Recipe } from "../Entities/Recipe.entity";
import type { RecipeCollaborator, RecipeRole } from "../Entities/RecipeCollaborator.entity";

/**
 * Repository interface pour la gestion du partage des recettes
 */
export interface RecipeSharingRepository {
  /**
   * Trouve un utilisateur par son email
   */
  findUserByEmail(email: string): Promise<{ id: string; email: string } | null>;

  /**
   * Trouve un utilisateur par son ID
   */
  findUserById(id: string): Promise<{ id: string; email: string } | null>;

  /**
   * Génère un token de partage unique pour une recette
   */
  generateShareToken(recipeId: string): Promise<string>;

  /**
   * Récupère une recette par son token de partage
   */
  getByShareToken(token: string): Promise<Recipe | null>;

  /**
   * Met à jour le statut public d'une recette
   */
  updatePublicStatus(recipeId: string, isPublic: boolean): Promise<void>;

  /**
   * Ajoute un collaborateur à une recette
   */
  addCollaborator(recipeId: string, email: string, role: RecipeRole): Promise<RecipeCollaborator>;

  /**
   * Supprime un collaborateur d'une recette
   */
  removeCollaborator(recipeId: string, userId: string): Promise<void>;

  /**
   * Met à jour le rôle d'un collaborateur
   */
  updateCollaboratorRole(recipeId: string, userId: string, role: RecipeRole): Promise<void>;

  /**
   * Récupère tous les collaborateurs d'une recette
   */
  getCollaborators(recipeId: string): Promise<RecipeCollaborator[]>;
}
