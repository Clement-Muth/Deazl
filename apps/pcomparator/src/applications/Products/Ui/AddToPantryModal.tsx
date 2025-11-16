"use client";

import { Button, Input, Select, SelectItem } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Package, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "~/components/Modal/Modal";
import { createPantryItem } from "~/packages/applications/pantry";

interface AddToPantryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

const LOCATIONS = [
  { value: "pantry", label: "Pantry" },
  { value: "fridge", label: "Fridge" },
  { value: "freezer", label: "Freezer" },
  { value: "countertop", label: "Countertop" }
];

export function AddToPantryModal({ isOpen, onClose, productId, productName }: AddToPantryModalProps) {
  const { t } = useLingui();
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("unit");
  const [expiration, setExpiration] = useState("");
  const [location, setLocation] = useState("pantry");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuantity("1");
      setUnit("unit");
      setExpiration("");
      setLocation("pantry");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await createPantryItem({
        name: productName,
        quantity: Number.parseFloat(quantity),
        unit,
        expiration: expiration || null,
        location,
        productId
      });

      onClose();
    } catch (error) {
      console.error("Failed to add to pantry:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header={<Trans>Add to Pantry</Trans>}
      body={
        <div className="space-y-4">
          <div className="rounded-lg bg-default-100 p-3">
            <p className="text-sm font-medium text-default-700">{productName}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t`Quantity`}
              type="number"
              step="0.1"
              min="0"
              value={quantity}
              onValueChange={setQuantity}
              isRequired
            />

            <Select
              label={t`Unit`}
              selectedKeys={[unit]}
              onSelectionChange={(keys) => setUnit(Array.from(keys)[0] as string)}
            >
              <SelectItem key="unit">{t`Unit`}</SelectItem>
              <SelectItem key="kg">{t`Kilogram`}</SelectItem>
              <SelectItem key="g">{t`Gram`}</SelectItem>
              <SelectItem key="l">{t`Liter`}</SelectItem>
              <SelectItem key="ml">{t`Milliliter`}</SelectItem>
            </Select>
          </div>

          <Input
            label={t`Expiration Date`}
            type="date"
            value={expiration}
            onValueChange={setExpiration}
            placeholder={t`Optional`}
          />

          <Select
            label={t`Storage Location`}
            selectedKeys={[location]}
            onSelectionChange={(keys) => setLocation(Array.from(keys)[0] as string)}
            startContent={<Package className="h-4 w-4" />}
          >
            {LOCATIONS.map((loc) => (
              <SelectItem key={loc.value}>{t(loc.label as any)}</SelectItem>
            ))}
          </Select>
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
            isDisabled={!quantity || Number.parseFloat(quantity) <= 0}
            startContent={!loading && <Plus className="h-4 w-4" />}
            fullWidth
          >
            <Trans>Add to Pantry</Trans>
          </Button>
        </div>
      }
    />
  );
}
