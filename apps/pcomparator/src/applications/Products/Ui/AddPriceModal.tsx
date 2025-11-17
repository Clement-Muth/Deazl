"use client";

import { Button, Input, Select, SelectItem } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Building2, DollarSign, Package, Plus } from "lucide-react";
import { useState } from "react";
import { Modal } from "~/components/Modal/Modal";

interface AddPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  stores: Array<{ id: string; name: string; location: string }>;
  onPriceAdded: () => void;
}

export function AddPriceModal({ isOpen, onClose, productId, stores, onPriceAdded }: AddPriceModalProps) {
  const { t } = useLingui();
  const [storeId, setStoreId] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("unit");
  const [currency, setCurrency] = useState("EUR");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!storeId || !amount) return;

    try {
      setLoading(true);
      const { addPrice } = await import("../Api/addPrice");

      const result = await addPrice({
        productId,
        storeId,
        amount: Number.parseFloat(amount),
        unit,
        currency,
        dateRecorded: new Date()
      });

      if (result.success) {
        onPriceAdded();
        onClose();
        setStoreId("");
        setAmount("");
      }
    } catch (error) {
      console.error("Failed to add price:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header={<Trans>Add New Price</Trans>}
      body={
        <div className="space-y-4">
          <Select
            label={t`Store`}
            placeholder={t`Select a store`}
            selectedKeys={storeId ? [storeId] : []}
            onSelectionChange={(keys) => setStoreId(Array.from(keys)[0] as string)}
            startContent={<Building2 className="h-4 w-4" />}
            isRequired
          >
            {stores.map((store) => (
              <SelectItem key={store.id}>
                {store.name} - {store.location}
              </SelectItem>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t`Price`}
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onValueChange={setAmount}
              startContent={<DollarSign className="h-4 w-4" />}
              isRequired
            />

            <Select
              label={t`Unit`}
              selectedKeys={[unit]}
              onSelectionChange={(keys) => setUnit(Array.from(keys)[0] as string)}
              startContent={<Package className="h-4 w-4" />}
            >
              <SelectItem key="unit">{t`Unit`}</SelectItem>
              <SelectItem key="kg">{t`Kilogram`}</SelectItem>
              <SelectItem key="l">{t`Liter`}</SelectItem>
              <SelectItem key="g">{t`Gram`}</SelectItem>
            </Select>
          </div>

          <p className="text-xs text-default-500">
            <Trans>The price will be recorded for today</Trans>
          </p>
        </div>
      }
      footer={
        <div className="flex gap-2">
          <Button variant="flat" onPress={onClose} fullWidth>
            <Trans>Cancel</Trans>
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={loading}
            isDisabled={!storeId || !amount}
            startContent={!loading && <Plus className="h-4 w-4" />}
            fullWidth
          >
            <Trans>Add Price</Trans>
          </Button>
        </div>
      }
    />
  );
}
