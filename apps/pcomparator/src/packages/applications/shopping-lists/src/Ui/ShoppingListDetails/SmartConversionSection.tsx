"use client";

import {
  Button,
  Card,
  CardBody,
  Chip,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner
} from "@heroui/react";
import { CheckIcon, ExternalLinkIcon, Package2Icon, SparklesIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type {
  ConversionResult,
  ConversionSuggestion
} from "../../Application/Services/SmartConversion.service";

interface SmartConversionSectionProps {
  itemId: string;
  itemName: string;
  isVisible: boolean;
  onConversionComplete?: (result: ConversionResult) => void;
  onDismiss?: () => void;
}

interface ProductSuggestionCardProps {
  suggestion: ConversionSuggestion["suggestedProducts"][0];
  isSelected: boolean;
  onSelect: () => void;
}

const ProductSuggestionCard = ({ suggestion, isSelected, onSelect }: ProductSuggestionCardProps) => {
  return (
    <Card
      className={`cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-primary-500 bg-primary-50" : "hover:shadow-md border border-gray-200"
      }`}
      isPressable
      onPress={onSelect}
    >
      <CardBody className="p-3">
        <div className="flex items-center gap-3">
          {suggestion.imageUrl && (
            <Image
              src={suggestion.imageUrl}
              alt={suggestion.name}
              className="w-12 h-12 object-cover rounded"
              fallbackSrc="/images/product-placeholder.png"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm truncate">{suggestion.name}</h4>
              {suggestion.source === "openfoodfacts" && (
                <Chip size="sm" variant="flat" color="success" className="text-xs">
                  OpenFoodFacts
                </Chip>
              )}
            </div>
            {suggestion.brand && <p className="text-xs text-gray-600 truncate">{suggestion.brand}</p>}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-gray-500">{Math.round(suggestion.matchScore)}% match</span>
              </div>
              {suggestion.nutritionGrade && (
                <Chip
                  size="sm"
                  variant="flat"
                  color={
                    suggestion.nutritionGrade === "a"
                      ? "success"
                      : suggestion.nutritionGrade === "b"
                        ? "primary"
                        : suggestion.nutritionGrade === "c"
                          ? "warning"
                          : "danger"
                  }
                  className="text-xs"
                >
                  Nutri-Score {suggestion.nutritionGrade.toUpperCase()}
                </Chip>
              )}
            </div>
          </div>
          {isSelected && <CheckIcon className="w-5 h-5 text-primary-500 flex-shrink-0" />}
        </div>
      </CardBody>
    </Card>
  );
};

export const SmartConversionSection = ({
  itemId,
  itemName,
  isVisible,
  onConversionComplete,
  onDismiss
}: SmartConversionSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ConversionSuggestion | null>(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Charger les suggestions
  const loadSuggestions = useCallback(async () => {
    if (!isVisible || !itemId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/shopping-lists/items/${itemId}/conversion-suggestions`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowModal(data?.suggestedProducts?.length > 0);
      }
    } catch (error) {
      console.error("Error loading conversion suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [itemId, isVisible]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const handleConvertToExisting = async () => {
    if (selectedSuggestionIndex === null || !suggestions) return;

    const selectedSuggestion = suggestions.suggestedProducts[selectedSuggestionIndex];
    setIsConverting(true);

    try {
      const response = await fetch(`/api/shopping-lists/items/${itemId}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedSuggestion.source === "existing" ? "existing" : "create_from_openfoodfacts",
          productId: selectedSuggestion.source === "existing" ? selectedSuggestion.id : undefined,
          openFoodFactsBarcode:
            selectedSuggestion.source === "openfoodfacts" ? selectedSuggestion.barcode : undefined
        })
      });

      const result = await response.json();
      onConversionComplete?.(result);
      setShowModal(false);
    } catch (error) {
      console.error("Error converting item:", error);
    } finally {
      setIsConverting(false);
    }
  };

  const handleCreateCustomProduct = async () => {
    setIsConverting(true);

    try {
      const response = await fetch(`/api/shopping-lists/items/${itemId}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "create_custom",
          customProductData: {
            name: itemName
          }
        })
      });

      const result = await response.json();
      onConversionComplete?.(result);
      setShowModal(false);
    } catch (error) {
      console.error("Error creating custom product:", error);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDismiss = () => {
    setShowModal(false);
    onDismiss?.();
  };

  if (!isVisible || isLoading) {
    return isLoading ? (
      <div className="flex items-center justify-center p-4">
        <Spinner size="sm" />
      </div>
    ) : null;
  }

  if (!suggestions || suggestions.suggestedProducts.length === 0) {
    return null;
  }

  return (
    <Modal isOpen={showModal} onClose={handleDismiss} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-primary-500" />
          <div>
            <h3 className="text-lg font-semibold">Smart Product Conversion</h3>
            <p className="text-sm text-gray-600 font-normal">Convert "{itemName}" to a tracked product</p>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            {/* Confidence Score */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-blue-700">Confidence: {Math.round(suggestions.confidence)}%</span>
              {suggestions.confidence > 80 && (
                <Chip size="sm" variant="flat" color="success">
                  High confidence
                </Chip>
              )}
            </div>

            {/* Product Suggestions */}
            <div>
              <h4 className="font-medium text-sm mb-3 text-gray-700">
                Suggested Products ({suggestions.suggestedProducts.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {suggestions.suggestedProducts.map((suggestion, index) => (
                  <ProductSuggestionCard
                    key={`${suggestion.source}_${suggestion.id}`}
                    suggestion={suggestion}
                    isSelected={selectedSuggestionIndex === index}
                    onSelect={() => setSelectedSuggestionIndex(index)}
                  />
                ))}
              </div>
            </div>

            {/* OpenFoodFacts Enhancement */}
            {suggestions.openFoodFactsData && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <ExternalLinkIcon className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Enhanced with OpenFoodFacts data</span>
                </div>
                <p className="text-xs text-green-600">
                  Nutritional information and product details will be automatically imported
                </p>
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="flex items-center justify-between w-full">
            <Button
              variant="light"
              size="sm"
              startContent={<Package2Icon className="w-4 h-4" />}
              onPress={handleCreateCustomProduct}
              isDisabled={isConverting}
            >
              Create Custom Product
            </Button>

            <div className="flex gap-2">
              <Button variant="light" size="sm" onPress={handleDismiss} isDisabled={isConverting}>
                Dismiss
              </Button>
              <Button
                color="primary"
                size="sm"
                onPress={handleConvertToExisting}
                isDisabled={selectedSuggestionIndex === null || isConverting}
                isLoading={isConverting}
              >
                Convert to Product
              </Button>
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
