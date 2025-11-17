import type { ProductCreationRequest } from "../ValueObjects/ProductCreationRequest.vo";

/**
 * Interface pour un service d'application qui gère la création de produits
 * Cette interface permet de découpler le bounded context ShoppingList
 * du bounded context Product/Catalog
 */
export interface ProductCreationService {
  /**
   * Crée un produit à partir d'une demande de création
   * Retourne l'ID du produit créé
   */
  createProductFromRequest(request: ProductCreationRequest): Promise<string>;
}
