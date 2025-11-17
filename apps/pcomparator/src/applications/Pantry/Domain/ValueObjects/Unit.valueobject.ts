export type UnitType = "g" | "kg" | "ml" | "L" | "unit" | "tsp" | "tbsp" | "cup";

export class Unit {
  private constructor(private readonly value: UnitType) {}

  public static create(value: string): Unit {
    const normalized = value.toLowerCase().trim();

    const validUnits: UnitType[] = ["g", "kg", "ml", "L", "unit", "tsp", "tbsp", "cup"];

    if (!validUnits.includes(normalized as UnitType)) {
      return new Unit("unit");
    }

    return new Unit(normalized as UnitType);
  }

  public getValue(): UnitType {
    return this.value;
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: Unit): boolean {
    return this.value === other.value;
  }

  public isWeight(): boolean {
    return this.value === "g" || this.value === "kg";
  }

  public isVolume(): boolean {
    return this.value === "ml" || this.value === "L";
  }

  public isUnit(): boolean {
    return this.value === "unit";
  }
}
