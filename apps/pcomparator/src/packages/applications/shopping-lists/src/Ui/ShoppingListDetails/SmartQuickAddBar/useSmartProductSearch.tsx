import { useCallback, useEffect, useState } from "react";
import { type ProductSearchResult, searchProducts } from "../../../Api/searchProducts.api";
import {
  type ParsedItem,
  type ProductMatch,
  ProductMatcher
} from "../../../Application/Services/ProductMatcher.service";

interface UseSmartProductSearchProps {
  onProductSelected?: (product: ProductSearchResult, parsedItem: ParsedItem) => void;
  debounceMs?: number;
  maxResults?: number;
}

export interface SmartSuggestion {
  id: string;
  type: "product" | "quick-add" | "create-product";
  product?: ProductSearchResult;
  parsedItem: ParsedItem;
  match?: ProductMatch;
  displayText: string;
  subtitle?: string;
  confidence: number;
}

export const useSmartProductSearch = ({
  onProductSelected,
  debounceMs = 300,
  maxResults = 8
}: UseSmartProductSearchProps = {}) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedInput, setParsedInput] = useState<ParsedItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Debounced search
  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim() || query.length < 2) {
        setSuggestions([]);
        setParsedInput(null);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);

      try {
        // 1. Parser l'input pour extraire les informations
        const parsed = ProductMatcher.parseInput(query);
        setParsedInput(parsed);

        // 2. Rechercher les produits correspondants
        const searchResults = await searchProducts(parsed.productName, maxResults);

        // 3. Calculer les matches avec score de pertinence
        const matches = ProductMatcher.findBestMatches(parsed, searchResults, maxResults - 1);

        // 4. Créer les suggestions
        const productSuggestions: SmartSuggestion[] = matches.map((match) => ({
          id: `product-${match.product.id}`,
          type: "product" as const,
          product: match.product,
          parsedItem: parsed,
          match,
          displayText: match.product.name,
          subtitle: match.product.brand
            ? `${match.product.brand.name}${match.product.averagePrice ? ` • ~${match.product.averagePrice.toFixed(2)}€` : ""}`
            : match.product.averagePrice
              ? `~${match.product.averagePrice.toFixed(2)}€`
              : undefined,
          confidence: match.similarity
        }));

        // 5. Ajouter option "Créer nouveau produit" si aucun ou peu de résultats
        const allSuggestions: SmartSuggestion[] = [...productSuggestions];

        if (searchResults.length === 0 && parsed.productName.length >= 2) {
          // Aucun produit trouvé → proposer la création
          allSuggestions.push({
            id: `create-product-${parsed.productName}`,
            type: "create-product",
            parsedItem: parsed,
            displayText: `Créer "${parsed.productName}" comme nouveau produit`,
            subtitle: `${parsed.quantity} ${parsed.unit}${parsed.price ? ` • ${parsed.price.toFixed(2)}€` : ""}`,
            confidence: 0.9
          });
        } else if (searchResults.length > 0 && searchResults.length < 3 && parsed.productName.length >= 2) {
          // Peu de résultats → proposer la création en dernier
          allSuggestions.push({
            id: `create-product-${parsed.productName}`,
            type: "create-product",
            parsedItem: parsed,
            displayText: `Créer "${parsed.productName}" comme nouveau produit`,
            subtitle: "Pas trouvé ce que vous cherchiez ?",
            confidence: 0.3
          });
        }

        setSuggestions(allSuggestions);
        setIsOpen(allSuggestions.length > 0);
      } catch (error) {
        console.error("Error during smart search:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [maxResults]
  );

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(inputValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [inputValue, debounceMs, performSearch]);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);
  const handleSuggestionSelect = useCallback(
    (suggestion: SmartSuggestion) => {
      if (suggestion.type === "product" && suggestion.product) {
        onProductSelected?.(suggestion.product, suggestion.parsedItem);
      }

      // Pour les deux types, fermer les suggestions
      setIsOpen(false);
      setSuggestions([]);
      setInputValue("");
    },
    [onProductSelected]
  );

  const handleInputBlur = useCallback(() => {
    // Délai pour permettre le clic sur une suggestion
    setTimeout(() => setIsOpen(false), 150);
  }, []);

  const handleInputFocus = useCallback(() => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  }, [suggestions.length]);

  const clearInput = useCallback(() => {
    setInputValue("");
    setSuggestions([]);
    setParsedInput(null);
    setIsOpen(false);
  }, []);

  return {
    inputValue,
    suggestions,
    isLoading,
    isOpen,
    parsedInput,
    handleInputChange,
    handleSuggestionSelect,
    handleInputBlur,
    handleInputFocus,
    clearInput,
    setIsOpen
  };
};
