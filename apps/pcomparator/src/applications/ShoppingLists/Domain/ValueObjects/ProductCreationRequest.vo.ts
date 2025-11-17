/**
 * Value Object représentant une demande de création de produit à partir d'un article de liste
 * Ce VO encapsule toutes les informations nécessaires pour créer un produit dans un autre bounded context
 */
export class ProductCreationRequest {
  constructor(
    public readonly name: string,
    public readonly price: number,
    public readonly unit: string,
    public readonly quantity: number,
    public readonly brandName: string,
    public readonly storeName: string,
    public readonly storeLocation: string,
    public readonly referencePrice: number,
    public readonly referenceUnit: string
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.name?.trim()) {
      throw new Error("Product name is required");
    }
    if (this.price <= 0) {
      throw new Error("Price must be positive");
    }
    if (!this.unit?.trim()) {
      throw new Error("Unit is required");
    }
    if (this.quantity <= 0) {
      throw new Error("Quantity must be positive");
    }
    if (!this.brandName?.trim()) {
      throw new Error("Brand name is required");
    }
    if (!this.storeName?.trim()) {
      throw new Error("Store name is required");
    }
    if (!this.storeLocation?.trim()) {
      throw new Error("Store location is required");
    }
    if (this.referencePrice <= 0) {
      throw new Error("Reference price must be positive");
    }
    if (!this.referenceUnit?.trim()) {
      throw new Error("Reference unit is required");
    }
  }

  /**
   * Crée une instance depuis un objet plain
   */
  static fromData(data: {
    name: string;
    price: number;
    unit: string;
    quantity: number;
    brandName: string;
    storeName: string;
    storeLocation: string;
    referencePrice: number;
    referenceUnit: string;
  }): ProductCreationRequest {
    return new ProductCreationRequest(
      data.name,
      data.price,
      data.unit,
      data.quantity,
      data.brandName,
      data.storeName,
      data.storeLocation,
      data.referencePrice,
      data.referenceUnit
    );
  }
}
