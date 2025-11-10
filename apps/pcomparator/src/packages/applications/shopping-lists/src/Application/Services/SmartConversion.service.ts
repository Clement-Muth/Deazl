import { auth } from "@deazl/system";
import { ProductSearchApplicationService } from "../../Application/Services/ProductSearch.service";
import { ShoppingListItem } from "../../Domain/Entities/ShoppingListItem.entity";
import type { ShoppingListItemRepository } from "../../Domain/Repositories/ShoppingListItemRepository";
import type { ShoppingListRepository } from "../../Domain/Repositories/ShoppingListRepository";
import { ProductCreationRequest } from "../../Domain/ValueObjects/ProductCreationRequest.vo";

/**
 * Types pour les réponses de l'API OpenFoodFacts
 */
interface OpenFoodFactsProduct {
  code: string;
  product_name?: string;
  product_name_fr?: string;
  brands?: string;
  image_url?: string;
  nutrition_grades?: string;
  nutriscore_grade?: string;
  categories?: string;
}

interface OpenFoodFactsSearchResponse {
  products: OpenFoodFactsProduct[];
}

interface OpenFoodFactsProductResponse {
  product?: OpenFoodFactsProduct;
}

/**
 * Suggestion de conversion d'un item vers un produit
 */
export interface ConversionSuggestion {
  itemId: string;
  itemName: string;
  confidence: number;
  suggestedProducts: Array<{
    id: string;
    name: string;
    brand?: string;
    barcode?: string;
    imageUrl?: string;
    nutritionGrade?: string;
    matchScore: number;
    source: "existing" | "openfoodfacts";
  }>;
  openFoodFactsData?: {
    barcode: string;
    productName: string;
    brands: string;
    imageUrl?: string;
    nutritionGrade?: string;
    categories?: string;
  };
}

/**
 * Résultat d'une conversion d'item vers produit
 */
export interface ConversionResult {
  success: boolean;
  itemId: string;
  productId?: string;
  error?: string;
}

/**
 * Service d'application pour la conversion intelligente d'items en produits
 * Orchestre la logique de suggestion et de conversion avec enrichissement OpenFoodFacts
 */
export class SmartConversionApplicationService {
  private readonly productSearchService: ProductSearchApplicationService;

  constructor(
    private readonly listRepository: ShoppingListRepository,
    private readonly itemRepository: ShoppingListItemRepository
    // private readonly productCreationService: ProductCreationService
  ) {
    this.productSearchService = new ProductSearchApplicationService();
  }

  /**
   * Génère des suggestions de conversion pour un item
   */
  async generateConversionSuggestions(itemId: string): Promise<ConversionSuggestion | null> {
    try {
      const session = await auth();
      if (!session?.user?.id) throw new Error("User not authenticated");

      // Récupérer l'item
      const item = await this.itemRepository.findItemById(itemId);
      if (!item) throw new Error("Item not found");

      // Vérifier les permissions
      const list = await this.listRepository.findById(item.shoppingListId);
      if (!list) throw new Error("Shopping list not found");

      const userRole = list.getUserRole(session.user.id);
      if (!list.canUserView(session.user.id, userRole || undefined)) {
        throw new Error("Unauthorized - insufficient permissions");
      }

      // Si l'item a déjà un produit associé, pas de suggestion
      if (item.productId) {
        return null;
      }

      const itemName = item.product?.name || "";
      if (!itemName.trim()) {
        return null;
      }

      // 🚀 Stratégie optimisée : privilégier le code-barres
      if (item.product?.barcode) {
        return await this.generateBarcodeBasedSuggestion(item);
      }

      // Fallback : recherche textuelle (plus lente mais toujours utile)
      return await this.generateTextBasedSuggestion(item);
    } catch (error) {
      console.error("Error generating conversion suggestions", error);
      return null;
    }
  }

  /**
   * Convertit un item en produit
   */
  async convertItemToProduct(
    itemId: string,
    productChoice: {
      type: "existing" | "create_from_openfoodfacts" | "create_custom";
      productId?: string; // Pour existing
      openFoodFactsBarcode?: string; // Pour create_from_openfoodfacts
      customProductData?: {
        name: string;
        brand?: string;
        barcode?: string;
      }; // Pour create_custom
    }
  ): Promise<ConversionResult> {
    try {
      const session = await auth();
      if (!session?.user?.id) throw new Error("User not authenticated");

      // Récupérer l'item
      const item = await this.itemRepository.findItemById(itemId);
      if (!item) {
        return { success: false, itemId, error: "Item not found" };
      }

      // Vérifier les permissions
      const list = await this.listRepository.findById(item.shoppingListId);
      if (!list) {
        return { success: false, itemId, error: "Shopping list not found" };
      }

      const userRole = list.getUserRole(session.user.id);
      if (!list.canUserModify(session.user.id, userRole || undefined)) {
        return { success: false, itemId, error: "Unauthorized - insufficient permissions" };
      }

      let productId: string;

      switch (productChoice.type) {
        case "existing":
          if (!productChoice.productId) {
            return { success: false, itemId, error: "Product ID required for existing product" };
          }
          productId = productChoice.productId;
          break;

        case "create_from_openfoodfacts":
          if (!productChoice.openFoodFactsBarcode) {
            return { success: false, itemId, error: "OpenFoodFacts barcode required" };
          }
          productId = await this.createProductFromOpenFoodFacts(productChoice.openFoodFactsBarcode);
          break;

        case "create_custom":
          if (!productChoice.customProductData?.name) {
            return { success: false, itemId, error: "Product name required for custom product" };
          }
          productId = await this.createCustomProduct(productChoice.customProductData);
          break;

        default:
          return { success: false, itemId, error: "Invalid product choice type" };
      }

      // Mettre à jour l'item avec le produit en créant un nouvel item avec le productId
      const updatedItem = ShoppingListItem.create(
        {
          shoppingListId: item.shoppingListId,
          productId: productId,
          quantity: item.quantity,
          unit: item.unit,
          isCompleted: item.isCompleted,
          // Les anciennes données ne sont plus nécessaires
          notes: item.notes
        },
        item.id
      );

      await this.itemRepository.updateItem(updatedItem);

      return {
        success: true,
        itemId: updatedItem.id!,
        productId
      };
    } catch (error) {
      console.error("Error converting item to product", error);
      return {
        success: false,
        itemId,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  /**
   * Identifie les items qui pourraient bénéficier d'une conversion
   */
  async identifyConversionOpportunities(listId: string): Promise<string[]> {
    try {
      const session = await auth();
      if (!session?.user?.id) throw new Error("User not authenticated");

      const list = await this.listRepository.findById(listId);
      if (!list) return [];

      const userRole = list.getUserRole(session.user.id);
      if (!list.canUserView(session.user.id, userRole || undefined)) {
        return [];
      }

      // Identifier les items sans produit associé qui sont complétés
      const conversionCandidates = list.items
        .filter(
          (item) =>
            !item.productId && // Pas de produit associé
            item.isCompleted && // Item complété
            item.product?.name && // A un nom
            item.product.name.trim().length > 2 // Nom suffisamment long
        )
        .map((item) => item.id!)
        .filter(Boolean);

      return conversionCandidates;
    } catch (error) {
      console.error("Error identifying conversion opportunities", error);
      return [];
    }
  }

  /**
   * Recherche des produits sur OpenFoodFacts
   */
  private async searchOpenFoodFacts(query: string): Promise<
    Array<{
      barcode: string;
      productName: string;
      brands: string;
      imageUrl?: string;
      nutritionGrade?: string;
      categories?: string;
    }>
  > {
    try {
      const searchUrl = `https://world.openfoodfacts.net/api/v2/search?search_terms=${encodeURIComponent(query)}&fields=code,product_name,product_name_fr,brands,image_url,nutrition_grades,nutriscore_grade,categories&json=true&page_size=3`;
      const response = await fetch(searchUrl);

      if (!response.ok) {
        throw new Error(`OpenFoodFacts API error: ${response.status}`);
      }

      const data: OpenFoodFactsSearchResponse = await response.json();

      return data.products
        .map((product: OpenFoodFactsProduct) => ({
          barcode: product.code,
          productName: product.product_name || product.product_name_fr || "",
          brands: product.brands || "",
          imageUrl: product.image_url,
          nutritionGrade: product.nutrition_grades || product.nutriscore_grade,
          categories: product.categories
        }))
        .filter((product) => product.productName.trim() !== "");
    } catch (error) {
      console.error("Error searching OpenFoodFacts", error);
      return [];
    }
  }

  /**
   * Calcule un score de correspondance entre un nom d'item et un nom de produit
   */
  private calculateMatchScore(itemName: string, productName: string): number {
    const itemLower = itemName.toLowerCase().trim();
    const productLower = productName.toLowerCase().trim();

    // Score exact
    if (itemLower === productLower) return 100;

    // Score de correspondance des mots
    const itemWords = itemLower.split(/\s+/);
    const productWords = productLower.split(/\s+/);

    let matchingWords = 0;
    for (const itemWord of itemWords) {
      if (
        productWords.some((productWord) => productWord.includes(itemWord) || itemWord.includes(productWord))
      ) {
        matchingWords++;
      }
    }

    const wordMatchScore = (matchingWords / Math.max(itemWords.length, productWords.length)) * 80;

    // Score de similarité de chaîne (Levenshtein simplifié)
    const maxLength = Math.max(itemLower.length, productLower.length);
    let differences = 0;
    for (let i = 0; i < maxLength; i++) {
      if (itemLower[i] !== productLower[i]) differences++;
    }
    const similarityScore = ((maxLength - differences) / maxLength) * 60;

    return Math.max(wordMatchScore, similarityScore);
  }

  /**
   * Calcule la confiance dans les suggestions
   */
  private calculateConfidence(suggestions: Array<{ matchScore: number }>): number {
    if (suggestions.length === 0) return 0;

    const bestScore = suggestions[0]?.matchScore || 0;
    const avgScore = suggestions.reduce((sum, s) => sum + s.matchScore, 0) / suggestions.length;

    // Confiance basée sur le meilleur score et la cohérence des résultats
    return Math.min(100, bestScore * 0.7 + avgScore * 0.3);
  }

  /**
   * Crée un produit à partir des données OpenFoodFacts
   */
  private async createProductFromOpenFoodFacts(barcode: string): Promise<string> {
    try {
      // Récupérer les données du produit depuis OpenFoodFacts
      const productUrl = `https://world.openfoodfacts.net/api/v2/product/${barcode}`;
      const response = await fetch(productUrl);

      if (!response.ok) {
        throw new Error(`OpenFoodFacts API error: ${response.status}`);
      }

      const data: OpenFoodFactsProductResponse = await response.json();

      if (!data.product) {
        throw new Error("Product not found in OpenFoodFacts");
      }

      // Créer un produit personnalisé avec les données OpenFoodFacts
      return await this.createCustomProduct({
        name: data.product.product_name || data.product.product_name_fr || "Unknown Product",
        brand: data.product.brands || undefined,
        barcode: barcode
      });
    } catch (error) {
      console.error("Error creating product from OpenFoodFacts", error);
      // En cas d'erreur, créer un produit basique
      return await this.createCustomProduct({
        name: "Unknown Product",
        brand: undefined,
        barcode: barcode
      });
    }
  }

  /**
   * Crée un produit personnalisé
   */
  private async createCustomProduct(productData: {
    name: string;
    brand?: string;
    barcode?: string;
  }): Promise<string> {
    // Utiliser le service de domaine pour créer le produit dans le bounded context approprié
    const request = ProductCreationRequest.fromData({
      name: productData.name,
      price: 0, // Prix par défaut
      unit: "unité",
      quantity: 1,
      brandName: productData.brand || "Marque inconnue",
      storeName: "Magasin par défaut",
      storeLocation: "Location par défaut",
      referencePrice: 0, // Prix de référence par défaut
      referenceUnit: "unité"
    });

    return "";
    // Utiliser le service de domaine pour la création inter-bounded-context
    // return await this.productCreationService.createProductFromRequest(request);
  }

  /**
   * Génère des suggestions basées sur le code-barres (ultra-rapide et précis)
   */
  private async generateBarcodeBasedSuggestion(item: any): Promise<ConversionSuggestion> {
    try {
      // Recherche directe par code-barres sur OpenFoodFacts
      const openFoodFactsProduct = await this.fetchProductByBarcode(item.barcode!);

      if (openFoodFactsProduct) {
        return {
          itemId: item.id!,
          itemName: item.customName || "",
          confidence: 95, // Très haute confiance avec code-barres
          suggestedProducts: [
            {
              id: `off_${item.barcode}`,
              name: openFoodFactsProduct.product_name || openFoodFactsProduct.product_name_fr || "",
              brand: openFoodFactsProduct.brands,
              barcode: item.barcode!,
              imageUrl: openFoodFactsProduct.image_url,
              nutritionGrade: openFoodFactsProduct.nutriscore_grade || openFoodFactsProduct.nutrition_grades,
              matchScore: 95,
              source: "openfoodfacts"
            }
          ],
          openFoodFactsData: {
            barcode: item.barcode!,
            productName: openFoodFactsProduct.product_name || openFoodFactsProduct.product_name_fr || "",
            brands: openFoodFactsProduct.brands || "",
            imageUrl: openFoodFactsProduct.image_url,
            nutritionGrade: openFoodFactsProduct.nutriscore_grade || openFoodFactsProduct.nutrition_grades,
            categories: openFoodFactsProduct.categories
          }
        };
      }
    } catch (error) {
      console.error("Error in barcode-based suggestion:", error);
    }

    // Fallback si le code-barres ne donne rien
    return await this.generateTextBasedSuggestion(item);
  }

  /**
   * Génère des suggestions basées sur le nom (méthode de fallback)
   */
  private async generateTextBasedSuggestion(item: any): Promise<ConversionSuggestion> {
    const itemName = item.customName || "";

    // Rechercher des produits existants
    const existingProducts = await this.productSearchService.searchProducts(itemName, 5);

    // Rechercher sur OpenFoodFacts
    const openFoodFactsResults = await this.searchOpenFoodFacts(itemName);

    // Calculer les scores de correspondance
    const suggestedProducts = [
      ...existingProducts.map((product) => ({
        id: product.id,
        name: product.name,
        brand: product.brand?.name,
        barcode: product.barcode,
        imageUrl: undefined,
        nutritionGrade: undefined,
        matchScore: this.calculateMatchScore(itemName, product.name),
        source: "existing" as const
      })),
      ...openFoodFactsResults.map((product) => ({
        id: `off_${product.barcode}`,
        name: product.productName,
        brand: product.brands,
        barcode: product.barcode,
        imageUrl: product.imageUrl,
        nutritionGrade: product.nutritionGrade,
        matchScore: this.calculateMatchScore(itemName, product.productName),
        source: "openfoodfacts" as const
      }))
    ].sort((a, b) => b.matchScore - a.matchScore);

    // Calculer la confiance globale
    const confidence = this.calculateConfidence(suggestedProducts);

    return {
      itemId: item.id!,
      itemName,
      confidence,
      suggestedProducts: suggestedProducts.slice(0, 5),
      openFoodFactsData: openFoodFactsResults[0]
    };
  }

  /**
   * Récupère un produit OpenFoodFacts par code-barres (méthode directe et rapide)
   */
  private async fetchProductByBarcode(barcode: string): Promise<OpenFoodFactsProduct | null> {
    try {
      const productUrl = `https://world.openfoodfacts.net/api/v2/product/${barcode}?fields=code,product_name,product_name_fr,brands,image_url,nutrition_grades,nutriscore_grade,categories`;
      const response = await fetch(productUrl);

      if (!response.ok) {
        throw new Error(`OpenFoodFacts API error: ${response.status}`);
      }

      const data: OpenFoodFactsProductResponse = await response.json();
      return data.product || null;
    } catch (error) {
      console.error("Error fetching product by barcode:", error);
      return null;
    }
  }
}
