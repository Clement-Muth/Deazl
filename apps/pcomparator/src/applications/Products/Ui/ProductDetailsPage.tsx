"use client";

import { Button, Card, CardBody, CardHeader, Chip, Divider } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  ArrowLeft,
  Barcode,
  Building2,
  Calendar,
  ExternalLink,
  MapPin,
  Package,
  Plus,
  ShoppingCart,
  Tag,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAllStores } from "../Api/getAllStores";
import type { ProductDetail } from "../Api/getProductById";
import { AddPriceModal } from "./AddPriceModal";
import { AddToListModal } from "./AddToListModal";
import { AddToPantryModal } from "./AddToPantryModal";

interface ProductDetailsPageProps {
  product: ProductDetail;
  stats: {
    priceCount: number;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
  } | null;
  onRefresh: () => void;
}

export function ProductDetailsPage({ product, stats, onRefresh }: ProductDetailsPageProps) {
  const router = useRouter();
  const { t } = useLingui();
  const [isAddPriceModalOpen, setIsAddPriceModalOpen] = useState(false);
  const [isAddToPantryModalOpen, setIsAddToPantryModalOpen] = useState(false);
  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false);
  const [stores, setStores] = useState<Array<{ id: string; name: string; location: string }>>([]);

  useEffect(() => {
    async function loadStores() {
      const storesList = await getAllStores();
      setStores(storesList);
    }
    loadStores();
  }, []);

  const handlePriceAdded = () => {
    onRefresh();
  };

  const getNutritionScoreDisplay = () => {
    if (!product.nutritionScore) return null;

    if (typeof product.nutritionScore === "string") {
      return product.nutritionScore;
    }

    if (typeof product.nutritionScore === "object" && product.nutritionScore !== null) {
      if ("nutriScore" in product.nutritionScore) {
        return product.nutritionScore.nutriScore;
      }
      if ("score" in product.nutritionScore) {
        return product.nutritionScore.score;
      }
    }

    return null;
  };

  const nutritionScore = getNutritionScoreDisplay();

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(new Date(date));
  };

  const pricesByStore = product.prices.reduce(
    (acc, price) => {
      if (!acc[price.store.id]) {
        acc[price.store.id] = {
          store: price.store,
          prices: []
        };
      }
      acc[price.store.id].prices.push(price);
      return acc;
    },
    {} as Record<
      string,
      { store: { id: string; name: string; location: string }; prices: typeof product.prices }
    >
  );

  return (
    <>
      <div className="flex min-h-screen flex-col bg-default-50 w-full">
        <div className="sticky top-0 z-10 border-b border-divider bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 px-4 py-3">
            <Button isIconOnly variant="light" onPress={() => router.back()} aria-label={t`Go back`}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">
              <Trans>Product Details</Trans>
            </h1>
          </div>
        </div>

        <div className="flex-1 space-y-3 p-4">
          <Card className="shadow-sm">
            <CardBody className="gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-start gap-2">
                    <Package className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                    <div className="flex-1">
                      <h2 className="text-xl font-bold leading-tight">{product.name}</h2>
                      {product.brand && (
                        <div className="mt-1 flex items-center gap-2">
                          <p className="text-sm text-default-600">{product.brand.name}</p>
                          {product.brand.websiteUrl && (
                            <Link
                              href={product.brand.websiteUrl}
                              target="_blank"
                              className="text-primary hover:text-primary-600"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {product.description && (
                    <p className="text-sm leading-relaxed text-default-600">{product.description}</p>
                  )}
                </div>
                {nutritionScore && typeof nutritionScore === "string" && (
                  <Chip
                    variant="flat"
                    color={
                      nutritionScore === "A" || nutritionScore === "a"
                        ? "success"
                        : nutritionScore === "B" || nutritionScore === "b"
                          ? "primary"
                          : nutritionScore === "C" || nutritionScore === "c"
                            ? "warning"
                            : "danger"
                    }
                    size="lg"
                    className="font-bold"
                  >
                    {nutritionScore.toUpperCase()}
                  </Chip>
                )}
              </div>

              <Divider />

              <div className="flex flex-wrap gap-2">
                {product.category && (
                  <Chip
                    startContent={<Tag className="h-3.5 w-3.5" />}
                    variant="flat"
                    color="secondary"
                    size="sm"
                  >
                    {product.category.name}
                  </Chip>
                )}
                <Chip startContent={<Barcode className="h-3.5 w-3.5" />} variant="flat" size="sm">
                  {product.barcode}
                </Chip>
              </div>
            </CardBody>
          </Card>

          {stats && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <h3 className="text-base font-semibold">
                  <Trans>Price Statistics</Trans>
                </h3>
              </CardHeader>
              <CardBody className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-default-500">
                    <Trans>Average Price</Trans>
                  </p>
                  <p className="text-xl font-bold">{formatPrice(stats.averagePrice, "EUR")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-default-500">
                    <Trans>Prices Recorded</Trans>
                  </p>
                  <p className="text-xl font-bold">{stats.priceCount}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <TrendingDown className="h-3.5 w-3.5 text-success" />
                    <p className="text-xs text-success">
                      <Trans>Lowest</Trans>
                    </p>
                  </div>
                  <p className="text-xl font-bold text-success">{formatPrice(stats.minPrice, "EUR")}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-danger" />
                    <p className="text-xs text-danger">
                      <Trans>Highest</Trans>
                    </p>
                  </div>
                  <p className="text-xl font-bold text-danger">{formatPrice(stats.maxPrice, "EUR")}</p>
                </div>
              </CardBody>
            </Card>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">
                <Trans>Prices by Store</Trans>
              </h3>
              <Button
                size="sm"
                color="primary"
                variant="flat"
                startContent={<Plus className="h-4 w-4" />}
                onPress={() => setIsAddPriceModalOpen(true)}
              >
                <Trans>Add Price</Trans>
              </Button>
            </div>

            {Object.values(pricesByStore).map((storeData) => {
              const latestPrice = storeData.prices[0];
              const priceHistory = storeData.prices.slice(1);

              return (
                <Card key={storeData.store.id} className="shadow-sm">
                  <CardBody className="gap-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold">{storeData.store.name}</h4>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-default-500">
                          <MapPin className="h-3 w-3" />
                          {storeData.store.location}
                        </div>
                        <p className="text-xs text-default-400">
                          {latestPrice.unit} • {formatDate(latestPrice.dateRecorded)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {formatPrice(latestPrice.amount, latestPrice.currency)}
                        </p>
                      </div>
                    </div>
                    {priceHistory.length > 0 && (
                      <>
                        <Divider />
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-default-500">
                            <Trans>Price History</Trans>
                          </p>
                          <div className="space-y-1.5">
                            {priceHistory.slice(0, 3).map((price) => (
                              <div key={price.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1.5 text-default-500">
                                  <Calendar className="h-3 w-3" />
                                  <span className="text-xs">{formatDate(price.dateRecorded)}</span>
                                </div>
                                <span className="font-semibold">
                                  {formatPrice(price.amount, price.currency)}
                                </span>
                              </div>
                            ))}
                          </div>
                          {priceHistory.length > 3 && (
                            <p className="text-xs text-default-400">
                              <Trans>+{priceHistory.length - 3} more prices</Trans>
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </CardBody>
                </Card>
              );
            })}

            {product.prices.length === 0 && (
              <Card className="shadow-sm">
                <CardBody className="items-center gap-3 py-12 text-center">
                  <div className="rounded-full bg-default-100 p-4">
                    <Package className="h-8 w-8 text-default-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-default-600">
                      <Trans>No prices recorded yet</Trans>
                    </p>
                    <p className="text-sm text-default-400">
                      <Trans>Be the first to add a price for this product</Trans>
                    </p>
                  </div>
                  <Button
                    color="primary"
                    variant="flat"
                    startContent={<Plus className="h-4 w-4" />}
                    onPress={() => setIsAddPriceModalOpen(true)}
                  >
                    <Trans>Add First Price</Trans>
                  </Button>
                </CardBody>
              </Card>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-divider bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex gap-2">
            <Button
              color="primary"
              variant="flat"
              startContent={<Package className="h-4 w-4" />}
              onPress={() => setIsAddToPantryModalOpen(true)}
              fullWidth
            >
              <Trans>Add to Pantry</Trans>
            </Button>
            <Button
              color="primary"
              startContent={<ShoppingCart className="h-4 w-4" />}
              onPress={() => setIsAddToListModalOpen(true)}
              fullWidth
            >
              <Trans>Add to List</Trans>
            </Button>
          </div>
        </div>
      </div>

      <AddPriceModal
        isOpen={isAddPriceModalOpen}
        onClose={() => setIsAddPriceModalOpen(false)}
        productId={product.id}
        stores={stores}
        onPriceAdded={handlePriceAdded}
      />

      <AddToPantryModal
        isOpen={isAddToPantryModalOpen}
        onClose={() => setIsAddToPantryModalOpen(false)}
        productId={product.id}
        productName={product.name}
      />

      <AddToListModal
        isOpen={isAddToListModalOpen}
        onClose={() => setIsAddToListModalOpen(false)}
        productId={product.id}
        productName={product.name}
      />
    </>
  );
}
