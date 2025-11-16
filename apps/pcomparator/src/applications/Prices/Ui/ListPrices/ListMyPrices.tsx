"use client";

import { useEffect, useState } from "react";
import { listUserPrices } from "~/applications/Prices/Api/listUserPrices";
import { CardPrice } from "~/applications/Prices/Ui/ListPrices/CardPrice/CardPrice";

export const ListMyPrices = () => {
  const [prices, setPrices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPrices = async () => {
      try {
        const data = await listUserPrices();
        setPrices(data || []);
      } catch (error) {
        console.error("Failed to load prices:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPrices();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
      {prices.length > 0 ? (
        prices.map((price) => <CardPrice key={price.priceId} {...price} />)
      ) : (
        <p>No prices</p>
      )}
    </div>
  );
};
