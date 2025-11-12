"use client";

import { Button, Chip } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { CheckIcon, MapPinIcon, ShoppingBagIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "~/components/Modal/Modal";
import { selectItemPrice } from "~/packages/applications/shopping-lists/src/Api/items/selectItemPrice.api";

interface PriceAlternative {
  id: string;
  amount: number;
  currency: string;
  unit: string;
  storeName: string;
  storeLocation: string;
  nutritionScore?: number;
  distance?: number;
  dateRecorded: Date;
}

interface ItemPriceAlternativesModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemName: string;
  currentPriceId?: string | null;
  alternatives: PriceAlternative[];
  onPriceSelected?: (priceId: string) => void;
}

type SortOption = "price-asc" | "price-desc" | "quality-desc" | "distance-asc";

export const ItemPriceAlternativesModal = ({
  isOpen,
  onClose,
  itemId,
  itemName,
  currentPriceId,
  alternatives,
  onPriceSelected
}: ItemPriceAlternativesModalProps) => {
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(currentPriceId || null);
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSelectedPriceId(currentPriceId || null);
  }, [currentPriceId]);

  const sortedAlternatives = [...alternatives].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.amount - b.amount;
      case "price-desc":
        return b.amount - a.amount;
      case "quality-desc":
        return (b.nutritionScore || 0) - (a.nutritionScore || 0);
      case "distance-asc":
        return (a.distance || 999) - (b.distance || 999);
      default:
        return 0;
    }
  });

  const handleSelectPrice = async (priceId: string) => {
    setSelectedPriceId(priceId);
    setIsLoading(true);

    try {
      const result = await selectItemPrice(itemId, priceId);
      if (result.success) {
        onPriceSelected?.(priceId);
        onClose();
      } else {
        console.error("Failed to select price:", result.error);
        // TODO: Afficher un toast d'erreur
      }
    } catch (error) {
      console.error("Error selecting price:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency
    }).format(amount);
  };

  const getNutritionScoreColor = (score?: number) => {
    if (!score) return "default";
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "danger";
  };

  const getNutritionScoreLabel = (score?: number) => {
    if (!score) return "N/A";
    if (score >= 80) return "A";
    if (score >= 60) return "B";
    if (score >= 40) return "C";
    if (score >= 20) return "D";
    return "E";
  };

  const minPrice = Math.min(...alternatives.map((a) => a.amount));
  const maxPrice = Math.max(...alternatives.map((a) => a.amount));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      sheetHeight="lg"
      header={
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">
            <Trans>Choose a price</Trans>
          </h2>
          <p className="text-sm text-default-500">{itemName}</p>
        </div>
      }
      body={
        <div className="flex flex-col gap-4">
          {/* Filtres de tri */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              size="sm"
              variant={sortBy === "price-asc" ? "flat" : "bordered"}
              color={sortBy === "price-asc" ? "primary" : "default"}
              onPress={() => setSortBy("price-asc")}
              startContent={<TrendingDownIcon size={16} />}
            >
              <Trans>Price: Low to High</Trans>
            </Button>
            <Button
              size="sm"
              variant={sortBy === "quality-desc" ? "flat" : "bordered"}
              color={sortBy === "quality-desc" ? "primary" : "default"}
              onPress={() => setSortBy("quality-desc")}
              startContent={<TrendingUpIcon size={16} />}
            >
              <Trans>Quality</Trans>
            </Button>
            {alternatives.some((a) => a.distance) && (
              <Button
                size="sm"
                variant={sortBy === "distance-asc" ? "flat" : "bordered"}
                color={sortBy === "distance-asc" ? "primary" : "default"}
                onPress={() => setSortBy("distance-asc")}
                startContent={<MapPinIcon size={16} />}
              >
                <Trans>Distance</Trans>
              </Button>
            )}
          </div>

          {/* Liste des alternatives */}
          <div className="flex flex-col gap-3">
            {sortedAlternatives.map((alternative) => {
              const isSelected = selectedPriceId === alternative.id;
              const isCheapest = alternative.amount === minPrice;
              const isMostExpensive = alternative.amount === maxPrice;

              return (
                <button
                  key={alternative.id}
                  type="button"
                  onClick={() => handleSelectPrice(alternative.id)}
                  disabled={isLoading}
                  className={`
                    relative flex flex-col gap-3 rounded-lg border-2 p-4 text-left transition-all
                    ${
                      isSelected
                        ? "border-primary bg-primary-50/50"
                        : "border-default-200 hover:border-primary-300"
                    }
                    ${isLoading ? "opacity-50" : ""}
                  `}
                >
                  {/* Header: Store et prix */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <ShoppingBagIcon size={18} className="text-default-500" />
                        <h3 className="font-semibold">{alternative.storeName}</h3>
                      </div>
                      <p className="text-sm text-default-500">{alternative.storeLocation}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">
                          {formatPrice(alternative.amount, alternative.currency)}
                        </span>
                        <span className="text-sm text-default-500">/{alternative.unit}</span>
                      </div>
                      {isCheapest && alternatives.length > 1 && (
                        <Chip size="sm" color="success" variant="flat">
                          <Trans>Best Price</Trans>
                        </Chip>
                      )}
                    </div>
                  </div>

                  {/* Informations supplémentaires */}
                  <div className="flex flex-wrap gap-2">
                    {alternative.nutritionScore !== undefined && (
                      <Chip
                        size="sm"
                        color={getNutritionScoreColor(alternative.nutritionScore)}
                        variant="flat"
                      >
                        <Trans>Nutri-Score</Trans>: {getNutritionScoreLabel(alternative.nutritionScore)}
                      </Chip>
                    )}
                    {alternative.distance !== undefined && (
                      <Chip size="sm" variant="flat" startContent={<MapPinIcon size={14} />}>
                        {alternative.distance.toFixed(1)} km
                      </Chip>
                    )}
                  </div>

                  {/* Indicateur de sélection */}
                  {isSelected && (
                    <div className="absolute right-3 top-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <CheckIcon size={14} className="text-white" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {alternatives.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <ShoppingBagIcon size={48} className="text-default-300" />
              <p className="text-default-500">
                <Trans>No price available for this product</Trans>
              </p>
            </div>
          )}
        </div>
      }
      footer={
        <div className="flex gap-2">
          <Button variant="bordered" onPress={onClose} className="flex-1">
            <Trans>Cancel</Trans>
          </Button>
        </div>
      }
    />
  );
};
