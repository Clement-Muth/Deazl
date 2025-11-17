export type LocationType = "fridge" | "freezer" | "pantry" | "countertop" | "other";

export class Location {
  private constructor(private readonly value: LocationType) {}

  public static create(value?: string): Location {
    if (!value) {
      return new Location("pantry");
    }

    const normalized = value.toLowerCase().trim();

    const validLocations: LocationType[] = ["fridge", "freezer", "pantry", "countertop", "other"];

    if (!validLocations.includes(normalized as LocationType)) {
      return new Location("pantry");
    }

    return new Location(normalized as LocationType);
  }

  public getValue(): LocationType {
    return this.value;
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: Location): boolean {
    return this.value === other.value;
  }

  public requiresRefrigeration(): boolean {
    return this.value === "fridge" || this.value === "freezer";
  }

  public isFrozen(): boolean {
    return this.value === "freezer";
  }
}
