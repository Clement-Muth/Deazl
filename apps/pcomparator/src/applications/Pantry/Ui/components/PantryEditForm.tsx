"use client";

import { Button, Input, Radio, RadioGroup } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useEffect, useState } from "react";
import { Modal } from "~/components/Modal/Modal";
import type { PantryItemPayload } from "../../Domain/Schemas/PantryItem.schema";
import type { UpdatePantryItemInput } from "../../Domain/Schemas/PantryItem.schema";

interface PantryEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: UpdatePantryItemInput) => Promise<void>;
  item: PantryItemPayload | null;
}

const LOCATIONS = [
  { value: "pantry", label: "Pantry" },
  { value: "fridge", label: "Fridge" },
  { value: "freezer", label: "Freezer" },
  { value: "countertop", label: "Countertop" }
];

export const PantryEditForm = ({ isOpen, onClose, onSubmit, item }: PantryEditFormProps) => {
  const { t } = useLingui();
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("unit");
  const [expiration, setExpiration] = useState<string | undefined>();
  const [location, setLocation] = useState("pantry");

  useEffect(() => {
    if (item) {
      setQuantity(item.quantity);
      setUnit(item.unit);
      setExpiration(item.expiration ? new Date(item.expiration).toISOString().split("T")[0] : undefined);
      setLocation(item.location || "pantry");
    }
  }, [item]);

  const handleSubmit = async () => {
    if (!item) return;

    try {
      setIsLoading(true);
      await onSubmit(item.id, {
        quantity,
        unit,
        expiration,
        location
      });
      onClose();
    } catch (error) {
      console.error("Failed to update item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      sheetHeight="md"
      header={
        <h2 className="text-xl font-semibold">
          <Trans>Edit {item.name}</Trans>
        </h2>
      }
      body={
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              type="number"
              label={t`Quantity`}
              value={quantity.toString()}
              onValueChange={(value) => setQuantity(Number.parseFloat(value) || 1)}
              min="0.01"
              step="0.01"
              className="flex-1"
            />

            <Input label={t`Unit`} value={unit} onValueChange={setUnit} className="flex-1" />
          </div>

          <Input
            type="date"
            label={t`Expiration (optional)`}
            value={expiration || ""}
            onValueChange={(value) => setExpiration(value || undefined)}
          />

          <RadioGroup
            label={t`Location`}
            value={location}
            onValueChange={setLocation}
            orientation="horizontal"
            classNames={{ wrapper: "gap-2" }}
          >
            {LOCATIONS.map((loc) => (
              <Radio key={loc.value} value={loc.value} size="sm">
                {loc.label}
              </Radio>
            ))}
          </RadioGroup>
        </div>
      }
      footer={
        <div className="flex gap-2">
          <Button variant="flat" onPress={onClose} className="flex-1">
            <Trans>Cancel</Trans>
          </Button>
          <Button color="primary" onPress={handleSubmit} isLoading={isLoading} className="flex-1">
            <Trans>Save</Trans>
          </Button>
        </div>
      }
    />
  );
};
