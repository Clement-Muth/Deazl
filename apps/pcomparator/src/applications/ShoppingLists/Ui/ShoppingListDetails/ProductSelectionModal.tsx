"use client";

import {
  Avatar,
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { CalendarIcon, PackageIcon, StoreIcon, TagIcon, TrendingDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { UnitSelector } from "~/components/UnitSelector";
import type { ProductSearchResult } from "../../Api/searchProducts.api";

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductSearchResult | null;
  defaultQuantity?: number;
  defaultUnit?: string;
  defaultPrice?: number;
  onConfirm: (data: {
    productId: string;
    quantity: number;
    unit: string;
    price?: number;
    store?: {
      id: string;
      name: string;
      location: string;
    };
  }) => void;
}

export const ProductSelectionModal = ({
  isOpen,
  onClose,
  product,
  defaultQuantity = 1,
  defaultUnit = "unit",
  defaultPrice,
  onConfirm
}: ProductSelectionModalProps) => {
  const [quantity, setQuantity] = useState(defaultQuantity.toString());
  const [unit, setUnit] = useState(defaultUnit);
  const [selectedPriceId, setSelectedPriceId] = useState("");

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      setQuantity(defaultQuantity.toString());
      setUnit(defaultUnit);
      setSelectedPriceId("");

      // Auto-select best price if available
      if (product.bestPrice) {
        const bestPriceEntry = product.prices.find((p) => p.amount === product.bestPrice?.amount);
        if (bestPriceEntry) {
          setSelectedPriceId(bestPriceEntry.id);
        }
      }
    }
  }, [product, defaultQuantity, defaultUnit]);

  if (!product) return null;

  const handleClose = () => {
    setQuantity("1");
    setUnit("unit");
    setSelectedPriceId("");
    onClose();
  };

  const handleConfirm = () => {
    const selectedPrice = product.prices.find((p) => p.id === selectedPriceId);
    const quantityValue = Number.parseFloat(quantity) || 1;
    const totalPrice = selectedPrice ? selectedPrice.amount * quantityValue : undefined;

    onConfirm({
      productId: product.id,
      quantity: quantityValue,
      unit,
      price: totalPrice,
      store: selectedPrice?.store
    });

    onClose();
  };

  // Trier les prix par montant croissant
  const sortedPrices = [...product.prices].sort((a, b) => a.amount - b.amount);
  const selectedPrice = product.prices.find((p) => p.id === selectedPriceId);
  const totalPrice = selectedPrice ? selectedPrice.amount * (Number.parseFloat(quantity) || 1) : undefined;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            {product.brand && <Avatar size="sm" name={product.brand.name} className="w-10 h-10" />}
            <div>
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {product.brand && (
                  <span className="flex items-center gap-1">
                    <TagIcon size={12} />
                    {product.brand.name}
                  </span>
                )}
                {product.category && (
                  <span className="flex items-center gap-1">
                    <PackageIcon size={12} />
                    {product.category.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={<Trans>Quantity</Trans>}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                type="number"
                min="0"
                step="0.1"
                placeholder="1"
              />
              <UnitSelector value={unit} onValueChange={setUnit} includeUnits="all" />
            </div>

            {/* Sélection de prix */}
            {sortedPrices.length > 0 && (
              <div>
                <h4 className="text-md font-medium mb-3 flex items-center gap-2">
                  <StoreIcon size={16} />
                  <Trans>Select a price and store</Trans>
                </h4>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sortedPrices.map((price, index) => (
                    <Card
                      key={price.id}
                      isPressable
                      isHoverable
                      className={`cursor-pointer transition-all ${
                        selectedPriceId === price.id
                          ? "ring-2 ring-primary-500 bg-primary-50"
                          : "hover:bg-gray-50"
                      }`}
                      onPress={() => setSelectedPriceId(price.id)}
                    >
                      <CardBody className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-lg">{price.amount.toFixed(2)}€</span>
                              {index === 0 && (
                                <Chip
                                  size="sm"
                                  color="success"
                                  variant="flat"
                                  startContent={<TrendingDownIcon size={12} />}
                                >
                                  <Trans>Best Price</Trans>
                                </Chip>
                              )}
                              {price.currency !== "EUR" && (
                                <Chip size="sm" variant="flat">
                                  {price.currency}
                                </Chip>
                              )}
                            </div>

                            <div className="text-sm text-gray-600 mt-1">
                              <div className="font-medium">{price.store.name}</div>
                              <div className="text-xs text-gray-500">{price.store.location}</div>
                            </div>
                          </div>

                          <div className="text-right text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <CalendarIcon size={12} />
                              {new Date(price.dateRecorded).toLocaleDateString()}
                            </div>
                            <div className="text-xs">{price.unit}</div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>

                {/* Résumé du prix total */}
                {totalPrice && (
                  <>
                    <Divider className="my-4" />
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-medium">
                          <Trans>Total Price</Trans>
                        </span>
                        <span className="text-xl font-bold text-primary-600">{totalPrice.toFixed(2)}€</span>
                      </div>
                      {selectedPrice && (
                        <div className="text-sm text-gray-500 mt-1">
                          {quantity} {unit} × {selectedPrice.amount.toFixed(2)}€{" • "}
                          {selectedPrice.store.name}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Message si pas de prix */}
            {sortedPrices.length === 0 && (
              <Card>
                <CardBody className="text-center py-8">
                  <div className="text-gray-500">
                    <StoreIcon size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="mb-2">
                      <Trans>No price available for this product</Trans>
                    </p>
                    <p className="text-sm">
                      <Trans>The product will be added without a reference price</Trans>
                    </p>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            <Trans>Cancel</Trans>
          </Button>
          <Button color="primary" onPress={handleConfirm}>
            <Trans>Add to list</Trans>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
