import { ValueObject } from "~/applications/Shared/Domain/Core/ValueObject";

interface ProductInformationProps {
  name: string;
  price: number; // Prix total de l'élément dans la liste de courses
  unit: string; // Unité dans la liste de courses (ex: pièce, kg, g)
  quantity: number; // Quantité dans la liste de courses
  referencePrice?: number; // Prix au kg/unité de référence du produit en magasin
  referenceUnit?: string; // Unité de référence du produit (ex: kg, L, pièce)
  brandName?: string;
  storeName?: string;
  storeLocation?: string;
}

export class ProductInformation extends ValueObject<ProductInformationProps> {
  private constructor(props: ProductInformationProps) {
    super(props);
  }

  public static create(props: ProductInformationProps): ProductInformation {
    if (!props.name || props.name.trim().length < 2) {
      throw new Error("Product name must be at least 2 characters long");
    }

    if (props.price <= 0) {
      throw new Error("Price must be greater than zero");
    }

    if (props.referencePrice !== undefined && props.referencePrice <= 0) {
      throw new Error("Reference price must be greater than zero");
    }

    if (props.referencePrice && !props.referenceUnit) {
      throw new Error("Reference unit is required when reference price is provided");
    }

    return new ProductInformation({
      ...props,
      // Valeurs par défaut
      brandName: props.brandName || "Generic",
      storeName: props.storeName || "My Local Store",
      storeLocation: props.storeLocation || "Default Location",
      referenceUnit: props.referenceUnit || "kg" // Par défaut on utilise le kg comme unité de référence
    });
  }

  get name(): string {
    return this.props.name;
  }

  get price(): number {
    return this.props.price;
  }

  get unit(): string {
    return this.props.unit;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get brandName(): string {
    return this.props.brandName!;
  }

  get storeName(): string {
    return this.props.storeName!;
  }

  get storeLocation(): string {
    return this.props.storeLocation!;
  }

  get referencePrice(): number | undefined {
    return this.props.referencePrice;
  }

  get referenceUnit(): string | undefined {
    return this.props.referenceUnit;
  }
}
