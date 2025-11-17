import { ValueObject } from "~/applications/Shared/Domain/Core/ValueObject";

interface PriceProps {
  value: number | null;
  currency: string;
}

export class Price extends ValueObject<PriceProps> {
  private constructor(props: PriceProps) {
    super(props);
  }

  public static create(value: number | null, currency = "EUR"): Price {
    if (value !== null && value < 0) {
      throw new Error("Price cannot be negative");
    }

    return new Price({ value, currency });
  }

  public static createOptional(value: number | null | undefined, currency = "EUR"): Price | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    return Price.create(value, currency);
  }

  public get value(): number | null {
    return this.props.value;
  }

  public get currency(): string {
    return this.props.currency;
  }

  public get isSet(): boolean {
    return this.props.value !== null;
  }

  public get formatted(): string {
    if (this.props.value === null) return "N/A";

    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: this.props.currency
    }).format(this.props.value);
  }
}
