export interface ProductBasicInfo {
  id: string;
  name: string;
  barcode: string;
  brand?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
}

export interface CreateProductPayload {
  name: string;
  barcode: string;
  categoryId?: string;
  brandId?: string;
  description?: string;
}

export interface ProductRepository {
  /**
   * Search products by name, barcode, brand or category
   */
  searchProducts(query: string, limit?: number): Promise<ProductBasicInfo[]>;

  /**
   * Create a new product in the database
   */
  createProduct(payload: CreateProductPayload): Promise<ProductBasicInfo>;

  /**
   * Find a product by ID
   */
  findById(productId: string): Promise<ProductBasicInfo | null>;

  /**
   * Find a product by barcode
   */
  findByBarcode(barcode: string): Promise<ProductBasicInfo | null>;
}
