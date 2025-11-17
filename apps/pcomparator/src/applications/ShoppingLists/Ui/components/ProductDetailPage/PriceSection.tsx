import { Accordion, AccordionItem, Card, CardBody, Chip, Radio, RadioGroup } from "@heroui/react";
import { ArrowDownUp, Calendar, DollarSign, MapPin, TrendingUp, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import type { PriceData } from "../../../Domain/Utils/priceComparison";
import { findBestPrice } from "../../../Domain/Utils/priceComparison";

interface PriceSectionProps {
  prices: PriceData[];
  compact?: boolean;
}

type SortOption = "price-asc" | "price-desc" | "date-recent" | "date-old" | "store-name";

/**
 * PriceSection - Display prices by store with sorting/filtering
 */
export function PriceSection({ prices, compact = false }: PriceSectionProps) {
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");
  const [filterStore, setFilterStore] = useState<string>("all");

  // Get unique stores
  const stores = useMemo(() => {
    const uniqueStores = new Map<string, string>();
    for (const price of prices) {
      uniqueStores.set(price.storeId, price.storeName);
    }
    return Array.from(uniqueStores.entries());
  }, [prices]);

  // Filter and sort prices
  const sortedPrices = useMemo(() => {
    let filtered = prices;

    // Filter by store
    if (filterStore !== "all") {
      filtered = filtered.filter((p) => p.storeId === filterStore);
    }

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.amount - b.amount);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.amount - a.amount);
        break;
      case "date-recent":
        sorted.sort((a, b) => b.dateRecorded.getTime() - a.dateRecorded.getTime());
        break;
      case "date-old":
        sorted.sort((a, b) => a.dateRecorded.getTime() - b.dateRecorded.getTime());
        break;
      case "store-name":
        sorted.sort((a, b) => a.storeName.localeCompare(b.storeName));
        break;
    }

    return sorted;
  }, [prices, sortBy, filterStore]);

  // Get best price
  const bestPriceResult = useMemo(() => findBestPrice(prices), [prices]);
  const bestPriceId = bestPriceResult?.price.id;

  if (prices.length === 0) {
    return (
      <Card shadow="none" className="border border-gray-200">
        <CardBody className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Prix</h2>
          </div>
          <div className="text-center py-8 text-foreground-400">
            <DollarSign size={32} className="mx-auto mb-2 text-foreground-300" />
            <p className="text-sm">Aucun prix disponible pour ce produit</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card shadow="none" className="border border-gray-200">
        <CardBody>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DollarSign size={20} className="text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Prix</h2>
            </div>
            <Chip size="sm" variant="flat" color="default">
              {prices.length} magasin{prices.length > 1 ? "s" : ""}
            </Chip>
          </div>

          {/* Best price card */}
          {bestPriceResult && (
            <div className="p-4 bg-success-50 border-2 border-success-200 rounded-lg mb-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy size={16} className="text-success" />
                    <span className="text-sm font-semibold text-success-700">Meilleur prix</span>
                  </div>
                  <p className="text-xs text-foreground-500 mb-2">{bestPriceResult.price.storeName}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {bestPriceResult.price.amount.toFixed(2)} {bestPriceResult.price.currency}
                  </p>
                  <p className="text-xs text-foreground-400 mt-1">pour {bestPriceResult.price.unit}</p>
                </div>
                {bestPriceResult.savingsPercentage > 0 && (
                  <div className="text-right">
                    <Chip size="sm" variant="solid" color="success">
                      -{bestPriceResult.savingsPercentage.toFixed(0)}%
                    </Chip>
                    <p className="text-xs text-success-700 mt-1">
                      Économie : {bestPriceResult.savings.toFixed(2)} {bestPriceResult.price.currency}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Other prices (compact) */}
          {prices.length > 1 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground-500">Autres magasins</p>
              {prices
                .filter((p) => p.id !== bestPriceId)
                .slice(0, 2)
                .map((price) => (
                  <div key={price.id} className="flex items-center justify-between p-2 bg-default-50 rounded">
                    <span className="text-sm text-foreground">{price.storeName}</span>
                    <span className="text-sm font-semibold text-foreground">
                      {price.amount.toFixed(2)} {price.currency}
                    </span>
                  </div>
                ))}
              {prices.length > 3 && (
                <p className="text-xs text-center text-foreground-400">
                  +{prices.length - 3} autre{prices.length - 3 > 1 ? "s" : ""} magasin
                  {prices.length - 3 > 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    );
  }

  // Detailed view
  return (
    <Card shadow="none" className="border border-gray-200">
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Prix par magasin</h2>
          </div>
          <Chip size="sm" variant="flat" color="default">
            {prices.length} prix
          </Chip>
        </div>

        <Accordion selectionMode="multiple" defaultExpandedKeys={["best", "list"]}>
          {/* Best Price */}
          {bestPriceResult && (
            <AccordionItem
              key="best"
              title={
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-success" />
                  <span className="font-semibold">Meilleur prix</span>
                </div>
              }
            >
              <div className="pb-4">
                <div className="p-4 bg-success-50 border-2 border-success rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-success-700 mb-1">
                        {bestPriceResult.price.storeName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-foreground-500">
                        <Calendar size={12} />
                        <span>
                          {new Date(bestPriceResult.price.dateRecorded).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>
                    <Chip size="lg" variant="solid" color="success" className="font-bold text-lg">
                      -{bestPriceResult.savingsPercentage.toFixed(0)}%
                    </Chip>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold text-foreground">
                        {bestPriceResult.price.amount.toFixed(2)} {bestPriceResult.price.currency}
                      </p>
                      <p className="text-sm text-foreground-500 mt-1">pour {bestPriceResult.price.unit}</p>
                    </div>

                    {bestPriceResult.savings > 0 && (
                      <div className="text-right">
                        <p className="text-sm text-success-700">Économie</p>
                        <p className="text-xl font-bold text-success">
                          {bestPriceResult.savings.toFixed(2)} {bestPriceResult.price.currency}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </AccordionItem>
          )}

          {/* All Prices with filters/sort */}
          <AccordionItem
            key="list"
            title={
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span className="font-semibold">Tous les prix</span>
              </div>
            }
          >
            <div className="pb-4 space-y-4">
              {/* Filters and sort */}
              <div className="space-y-3 p-3 bg-default-50 rounded-lg">
                {/* Store filter */}
                {stores.length > 1 && (
                  <div>
                    <p className="text-xs font-semibold text-foreground-600 mb-2">Filtrer par magasin</p>
                    <RadioGroup
                      value={filterStore}
                      onValueChange={setFilterStore}
                      orientation="horizontal"
                      size="sm"
                    >
                      <Radio value="all">Tous</Radio>
                      {stores.map(([storeId, storeName]) => (
                        <Radio key={storeId} value={storeId}>
                          {storeName}
                        </Radio>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Sort options */}
                <div>
                  <p className="text-xs font-semibold text-foreground-600 mb-2 flex items-center gap-1">
                    <ArrowDownUp size={12} />
                    Trier par
                  </p>
                  <RadioGroup
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value as SortOption)}
                    orientation="horizontal"
                    size="sm"
                  >
                    <Radio value="price-asc">Prix ↑</Radio>
                    <Radio value="price-desc">Prix ↓</Radio>
                    <Radio value="date-recent">Date ↓</Radio>
                    <Radio value="store-name">Magasin</Radio>
                  </RadioGroup>
                </div>
              </div>

              {/* Price list */}
              <div className="space-y-2">
                {sortedPrices.map((price, index) => {
                  const isBest = price.id === bestPriceId;
                  const savingsVsBest = bestPriceResult
                    ? ((price.amount - bestPriceResult.price.amount) / bestPriceResult.price.amount) * 100
                    : 0;

                  return (
                    <div
                      key={price.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        isBest ? "bg-success-50 border-success" : "bg-default-50 border-default-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {isBest && <Trophy size={14} className="text-success" />}
                          <span className="text-sm font-semibold text-foreground">{price.storeName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-foreground">
                            {price.amount.toFixed(2)} {price.currency}
                          </span>
                          {!isBest && savingsVsBest > 0 && (
                            <Chip
                              size="sm"
                              variant="flat"
                              color="danger"
                              startContent={<TrendingUp size={12} />}
                            >
                              +{savingsVsBest.toFixed(0)}%
                            </Chip>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-foreground-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{new Date(price.dateRecorded).toLocaleDateString("fr-FR")}</span>
                        </div>
                        <span>pour {price.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {sortedPrices.length === 0 && (
                <div className="text-center py-4 text-foreground-400">
                  <p className="text-sm">Aucun prix ne correspond aux filtres</p>
                </div>
              )}
            </div>
          </AccordionItem>
        </Accordion>
      </CardBody>
    </Card>
  );
}
