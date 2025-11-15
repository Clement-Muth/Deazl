import type { ProductBasicInfo } from "../../Domain/Repositories/ProductRepository";
import { PrismaProductRepository } from "../../Infrastructure/Repositories/PrismaProductRepository";

export interface IngredientMapping {
  productName: string;
  quantity: number;
  unit: string;
  matchedProduct: ProductBasicInfo;
  confidence: "exact" | "high" | "medium" | "low" | "none" | "created";
}

/**
 * Service for mapping ingredient names to database products
 * Uses fuzzy matching to find the best product match
 */
export class IngredientMapperService {
  private productRepository: PrismaProductRepository;

  constructor() {
    this.productRepository = new PrismaProductRepository();
  }

  /**
   * Map a single ingredient name to a product
   * Creates a new product if no match is found
   */
  async mapIngredient(productName: string, quantity: number, unit: string): Promise<IngredientMapping> {
    if (!productName || productName.trim().length < 2) {
      const createdProduct = await this.createProductFromIngredient(productName || "Unknown ingredient");
      return {
        productName,
        quantity,
        unit,
        matchedProduct: createdProduct,
        confidence: "created"
      };
    }

    try {
      const products = await this.productRepository.searchProducts(productName, 5);

      if (products.length === 0) {
        console.log(`No product found for "${productName}", creating new product...`);
        const createdProduct = await this.createProductFromIngredient(productName);
        return {
          productName,
          quantity,
          unit,
          matchedProduct: createdProduct,
          confidence: "created"
        };
      }

      const bestMatch = this.findBestMatch(productName, products);

      if (bestMatch.confidence === "low") {
        console.log(
          `Low confidence match for "${productName}" (matched: "${bestMatch.product.name}"), creating new product...`
        );
        const createdProduct = await this.createProductFromIngredient(productName);
        return {
          productName,
          quantity,
          unit,
          matchedProduct: createdProduct,
          confidence: "created"
        };
      }

      return {
        productName,
        quantity,
        unit,
        matchedProduct: bestMatch.product,
        confidence: bestMatch.confidence
      };
    } catch (error) {
      console.error("Error mapping ingredient:", error);
      const createdProduct = await this.createProductFromIngredient(productName);
      return {
        productName,
        quantity,
        unit,
        matchedProduct: createdProduct,
        confidence: "created"
      };
    }
  }

  /**
   * Create a new product from an ingredient name
   */
  private async createProductFromIngredient(productName: string): Promise<ProductBasicInfo> {
    try {
      const barcode = `RECIPE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const product = await this.productRepository.createProduct({
        name: productName,
        barcode,
        description: "Product created from recipe photo import"
      });

      console.log(`Created new product: ${product.name} (ID: ${product.id})`);
      return product;
    } catch (error) {
      console.error("Error creating product:", error);
      throw new Error(`Failed to create product for ingredient: ${productName}`);
    }
  }

  /**
   * Map multiple ingredients in parallel
   */
  async mapIngredients(
    ingredients: Array<{ productName: string; quantity: number; unit: string }>
  ): Promise<IngredientMapping[]> {
    return Promise.all(ingredients.map((ing) => this.mapIngredient(ing.productName, ing.quantity, ing.unit)));
  }

  /**
   * Find the best matching product using fuzzy matching
   */
  private findBestMatch(
    ingredientName: string,
    products: ProductBasicInfo[]
  ): { product: ProductBasicInfo; confidence: "exact" | "high" | "medium" | "low" } {
    const normalizedIngredient = this.normalizeText(ingredientName);

    for (const product of products) {
      const normalizedProduct = this.normalizeText(product.name);

      if (normalizedProduct === normalizedIngredient) {
        return { product, confidence: "exact" };
      }

      if (normalizedProduct.includes(normalizedIngredient)) {
        return { product, confidence: "high" };
      }

      if (normalizedIngredient.includes(normalizedProduct)) {
        return { product, confidence: "high" };
      }
    }

    const firstProduct = products[0];
    const similarity = this.calculateSimilarity(normalizedIngredient, this.normalizeText(firstProduct.name));

    if (similarity > 0.7) {
      return { product: firstProduct, confidence: "high" };
    }

    if (similarity > 0.5) {
      return { product: firstProduct, confidence: "medium" };
    }

    return { product: firstProduct, confidence: "low" };
  }

  /**
   * Normalize text for comparison
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\p{Diacritic}]/gu, "")
      .replace(/[^a-z0-9\s]/g, "")
      .trim();
  }

  /**
   * Calculate similarity score between two strings (Levenshtein distance)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}
