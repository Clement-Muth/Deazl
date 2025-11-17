"use client";

import { Card, CardBody, Chip } from "@heroui/react";
import { MapPinIcon, TrophyIcon } from "lucide-react";

interface Price {
  id: string;
  amount: number;
  currency: string;
  unit: string;
  dateRecorded: Date;
  store: {
    id: string;
    name: string;
    location: string;
  };
}

interface ProductPriceListProps {
  prices: Price[];
}

export const ProductPriceList = ({ prices }: ProductPriceListProps) => {
  if (prices.length === 0) return null;

  const lowestPrice = prices[0];

  const formatDate = (date: Date) => {
    const now = new Date();
    const priceDate = new Date(date);
    const diffDays = Math.floor((now.getTime() - priceDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30)
      return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? "s" : ""}`;
    return `Il y a ${Math.floor(diffDays / 30)} mois`;
  };

  return (
    <div className="flex flex-col gap-2">
      {prices.map((price, index) => {
        const isBestPrice = price.id === lowestPrice.id;

        return (
          <Card
            key={price.id}
            shadow="none"
            className={`border ${isBestPrice ? "border-success-500 bg-success-50" : "border-gray-200"}`}
          >
            <CardBody className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm truncate">{price.store.name}</h4>
                    {isBestPrice && (
                      <Chip
                        size="sm"
                        color="success"
                        variant="flat"
                        startContent={<TrophyIcon className="h-3 w-3" />}
                      >
                        Meilleur prix
                      </Chip>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPinIcon className="h-3 w-3" />
                    <span className="truncate">{price.store.location}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(price.dateRecorded)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-lg font-bold ${isBestPrice ? "text-success-600" : "text-gray-900"}`}>
                    {price.amount.toFixed(2)}€
                  </p>
                  <p className="text-xs text-gray-500">/ {price.unit}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
};
