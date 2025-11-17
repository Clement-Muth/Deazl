import type { ProductSearchResult } from "../../Api/searchProducts.api";

export interface ParsedItem {
  quantity: number;
  unit: string;
  productName: string;
  price?: number;
  confidence: number; // 0-1, confiance dans le parsing
}

export interface ProductMatch {
  product: ProductSearchResult;
  similarity: number; // 0-1, similarité avec le texte recherché
  priceMatch?: {
    expectedPrice: number;
    actualPrice: number;
    priceDifference: number;
  };
}

/**
 * Service de matching intelligent pour produits
 */
export class ProductMatcher {
  /**
   * Parse le texte d'entrée pour extraire quantité, unité, nom de produit et prix
   */
  static parseInput(input: string): ParsedItem {
    // Regex améliorée pour capturer différents formats
    const patterns = [
      // Format: "2 kg pommes 4.99€" ou "2kg pommes 4.99"
      /^([\d.,]+)\s*([a-zA-Zé]{1,4})?\s+(.+?)(?:\s+([\d.,]+)(?:€|\$|£|EUR)?)?$/,
      // Format: "pommes 2kg 4.99€" (nom en premier)
      /^(.+?)\s+([\d.,]+)\s*([a-zA-Zé]{1,4})\s*(?:([\d.,]+)(?:€|\$|£|EUR)?)?$/,
      // Format simple: "pommes" ou "2 pommes"
      /^(?:([\d.,]+)\s+)?(.+?)$/
    ];

    for (const pattern of patterns) {
      const match = input.trim().match(pattern);
      if (match) {
        return ProductMatcher.extractFromMatch(match, input);
      }
    }

    // Fallback si aucun pattern ne matche
    return {
      quantity: 1,
      unit: "unit",
      productName: input.trim(),
      confidence: 0.3
    };
  }

  private static extractFromMatch(match: RegExpMatchArray, originalInput: string): ParsedItem {
    let quantity: number;
    let unit: string;
    let productName: string;
    let price: number | undefined;
    let confidence = 0.8;

    // Déterminer l'ordre des éléments selon le pattern
    if (match[0].match(/^[\d.,]/)) {
      // Quantité en premier
      quantity = ProductMatcher.parseNumber(match[1]) || 1;
      unit = ProductMatcher.normalizeUnit(match[2]) || "unit";
      productName = match[3]?.trim() || "";
      price = ProductMatcher.parseNumber(match[4]);
    } else if (match[3]?.match(/^[\d.,]/)) {
      // Nom en premier, puis quantité
      productName = match[1]?.trim() || "";
      quantity = ProductMatcher.parseNumber(match[2]) || 1;
      unit = ProductMatcher.normalizeUnit(match[3]) || "unit";
      price = ProductMatcher.parseNumber(match[4]);
    } else {
      // Format simple
      quantity = ProductMatcher.parseNumber(match[1]) || 1;
      productName = match[2]?.trim() || "";
      unit = "unit";
      confidence = 0.6;
    }

    // Nettoyer le nom du produit
    productName = ProductMatcher.cleanProductName(productName);

    // Ajuster la confiance selon la qualité du parsing
    if (!productName) confidence = 0.2;
    if (price && price > 0) confidence += 0.1;
    if (quantity > 0 && unit !== "unit") confidence += 0.1;

    return {
      quantity: Math.max(quantity, 0.1),
      unit,
      productName,
      price,
      confidence: Math.min(confidence, 1)
    };
  }

  private static parseNumber(str: string | undefined): number | undefined {
    if (!str) return undefined;
    const cleaned = str.replace(",", ".");
    const num = Number.parseFloat(cleaned);
    return Number.isNaN(num) ? undefined : num;
  }

  private static normalizeUnit(unit: string | undefined): string {
    if (!unit) return "unit";

    const unitMapping: Record<string, string> = {
      g: "g",
      gr: "g",
      gramme: "g",
      grammes: "g",
      kg: "kg",
      kilo: "kg",
      kilos: "kg",
      kilogramme: "kg",
      kilogrammes: "kg",
      l: "l",
      litre: "l",
      litres: "l",
      ml: "ml",
      millilitre: "ml",
      millilitres: "ml",
      cl: "cl",
      centilitre: "cl",
      centilitres: "cl",
      u: "unit",
      unité: "unit",
      unités: "unit",
      pièce: "unit",
      pièces: "unit",
      pc: "unit",
      pcs: "unit"
    };

    const normalized = unit.toLowerCase();
    return unitMapping[normalized] || "unit";
  }

  private static cleanProductName(name: string): string {
    if (!name) return "";

    // Supprimer les mots de quantité/unité qui auraient pu être mal parsés
    const quantityWords =
      /\b(kg|kilo|gramme|grammes|litre|litres|ml|cl|pièce|pièces|unité|unités|pc|pcs)\b/gi;

    return name.replace(quantityWords, " ").replace(/\s+/g, " ").trim();
  }

  /**
   * Calcule la similarité entre le texte recherché et un produit
   */
  static calculateSimilarity(searchTerm: string, product: ProductSearchResult): number {
    const term = searchTerm.toLowerCase();
    const productName = product.name.toLowerCase();
    const brandName = product.brand?.name.toLowerCase() || "";
    const categoryName = product.category?.name.toLowerCase() || "";

    let similarity = 0;

    // Correspondance exacte du nom
    if (productName === term) {
      similarity = 1.0;
    }
    // Nom contient le terme de recherche
    else if (productName.includes(term)) {
      similarity = 0.8;
    }
    // Terme de recherche contient le nom du produit
    else if (term.includes(productName)) {
      similarity = 0.7;
    }
    // Correspondance par mots-clés
    else {
      const termWords = term.split(" ");
      const productWords = productName.split(" ");
      const matchingWords = termWords.filter((word) =>
        productWords.some((productWord) => productWord.includes(word) || word.includes(productWord))
      );
      similarity = (matchingWords.length / Math.max(termWords.length, 1)) * 0.6;
    }

    // Bonus pour correspondance de marque
    if (brandName && term.includes(brandName)) {
      similarity += 0.2;
    }

    // Bonus pour correspondance de catégorie
    if (categoryName && term.includes(categoryName)) {
      similarity += 0.1;
    }

    return Math.min(similarity, 1.0);
  }

  /**
   * Trouve les meilleurs matches pour un produit parsé
   */
  static findBestMatches(
    parsedItem: ParsedItem,
    searchResults: ProductSearchResult[],
    maxResults = 5
  ): ProductMatch[] {
    const matches: ProductMatch[] = searchResults
      .map((product) => {
        const similarity = ProductMatcher.calculateSimilarity(parsedItem.productName, product);

        const match: ProductMatch = {
          product,
          similarity
        };

        // Ajouter analyse des prix si disponible
        if (parsedItem.price && product.averagePrice) {
          const priceDifference = Math.abs(parsedItem.price - product.averagePrice);
          const relativeError = priceDifference / product.averagePrice;

          match.priceMatch = {
            expectedPrice: parsedItem.price,
            actualPrice: product.averagePrice,
            priceDifference
          };

          // Bonus de similarité si les prix sont proches (moins de 20% d'écart)
          if (relativeError < 0.2) {
            match.similarity += 0.1;
          }
        }

        return match;
      })
      .filter((match) => match.similarity > 0.1) // Seuil minimum de pertinence
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxResults);

    return matches;
  }

  /**
   * Détermine si un match est suffisamment confiant pour être auto-sélectionné
   */
  static isHighConfidenceMatch(parsedItem: ParsedItem, match: ProductMatch): boolean {
    return parsedItem.confidence > 0.7 && match.similarity > 0.8;
  }
}
