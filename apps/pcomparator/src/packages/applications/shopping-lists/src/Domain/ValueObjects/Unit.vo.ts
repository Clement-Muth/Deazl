import { ValueObject } from "@deazl/shared";
import type { z } from "zod";
import type { UnitSchema } from "../Schemas/ShoppingListItem.schema";

export enum UnitType {
  UNIT = "unit",
  KG = "kg",
  G = "g",
  L = "l",
  ML = "ml",
  CL = "cl",
  PIECE = "piece",
  TEASPOON = "teaspoon",
  TABLESPOON = "tablespoon",
  CUP = "cup",
  PINCH = "pinch"
}

export type UnitPayload = z.infer<typeof UnitSchema>;

interface UnitProps {
  value: UnitType;
}

export class Unit extends ValueObject<UnitProps> {
  private constructor(props: UnitProps) {
    super(props);
  }

  public static create(unit: string): Unit {
    if (!Object.values(UnitType).includes(unit as UnitType)) {
      throw new Error(`Invalid unit: ${unit}`);
    }

    return new Unit({ value: unit as UnitType });
  }

  public get value(): UnitType {
    return this.props.value;
  }

  public isWeightUnit(): boolean {
    return this.props.value === UnitType.KG || this.props.value === UnitType.G;
  }

  public isVolumeUnit(): boolean {
    return this.props.value === UnitType.L || this.props.value === UnitType.ML;
  }

  public isCountUnit(): boolean {
    return this.props.value === UnitType.UNIT || this.props.value === UnitType.PIECE;
  }

  public isCookingUnit(): boolean {
    return (
      this.props.value === UnitType.TEASPOON ||
      this.props.value === UnitType.TABLESPOON ||
      this.props.value === UnitType.CUP ||
      this.props.value === UnitType.PINCH
    );
  }
}
