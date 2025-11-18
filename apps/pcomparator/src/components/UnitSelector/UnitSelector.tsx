import { Select, SelectItem } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import type { UnitType } from "~/applications/ShoppingLists/Domain/ValueObjects/Unit.vo";

export interface UnitOption {
  value: UnitType | string;
  label: string;
}

interface UnitSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  isDisabled?: boolean;
  includeUnits?: "all" | "basic" | "cooking" | "weight" | "volume";
}

export const UnitSelector = ({
  value,
  onValueChange,
  label,
  size = "md",
  className,
  isDisabled,
  includeUnits = "all"
}: UnitSelectorProps) => {
  const { t } = useLingui();

  const allUnits: UnitOption[] = [
    { value: "unit", label: t`Unit(s)` },
    { value: "piece", label: t`Piece(s)` },
    { value: "kg", label: t`Kilogram (kg)` },
    { value: "g", label: t`Gram (g)` },
    { value: "l", label: t`Liter (l)` },
    { value: "cl", label: t`Centiliter (cl)` },
    { value: "ml", label: t`Milliliter (ml)` },
    { value: "teaspoon", label: t`Teaspoon (tsp)` },
    { value: "tablespoon", label: t`Tablespoon (tbsp)` },
    { value: "cup", label: t`Cup` },
    { value: "pinch", label: t`Pinch` }
  ];

  const basicUnits: UnitOption[] = [
    { value: "unit", label: t`Unit(s)` },
    { value: "kg", label: t`Kilogram (kg)` },
    { value: "g", label: t`Gram (g)` },
    { value: "l", label: t`Liter (l)` },
    { value: "ml", label: t`Milliliter (ml)` }
  ];

  const cookingUnits: UnitOption[] = [
    { value: "teaspoon", label: t`Teaspoon (tsp)` },
    { value: "tablespoon", label: t`Tablespoon (tbsp)` },
    { value: "cup", label: t`Cup` },
    { value: "pinch", label: t`Pinch` }
  ];

  const weightUnits: UnitOption[] = [
    { value: "kg", label: t`Kilogram (kg)` },
    { value: "g", label: t`Gram (g)` }
  ];

  const volumeUnits: UnitOption[] = [
    { value: "l", label: t`Liter (l)` },
    { value: "cl", label: t`Centiliter (cl)` },
    { value: "ml", label: t`Milliliter (ml)` }
  ];

  const getUnits = (): UnitOption[] => {
    switch (includeUnits) {
      case "basic":
        return basicUnits;
      case "cooking":
        return cookingUnits;
      case "weight":
        return weightUnits;
      case "volume":
        return volumeUnits;
      default:
        return allUnits;
    }
  };

  const units = getUnits();

  return (
    <Select
      label={label || t`Unit`}
      selectedKeys={[value]}
      onSelectionChange={(keys) => {
        const selectedValue = Array.from(keys)[0] as string;
        onValueChange(selectedValue);
      }}
      size={size}
      className={className}
      isDisabled={isDisabled}
    >
      {units.map((unit) => (
        <SelectItem key={unit.value}>{unit.label}</SelectItem>
      ))}
    </Select>
  );
};
