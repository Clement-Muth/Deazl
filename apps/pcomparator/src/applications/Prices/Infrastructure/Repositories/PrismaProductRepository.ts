import type { CreateProduct, Product } from "~/applications/Prices/Domain/Entities/Product";
import type { ProductRepository } from "~/applications/Prices/Domain/Repositories/ProductRepository";
import { prisma } from "~/libraries/prisma";

export class PrismaProductRepository implements ProductRepository {
  async create(product: CreateProduct): Promise<Product> {
    const createdProduct = await prisma.product.create({
      data: {
        barcode: product.barcode,
        name: product.name,
        description: product.description,
        category_id: product.categoryId,
        brand_id: product.brandId,
        nutrition_score: product.nutritionScore
      }
    });
    return {
      id: createdProduct.id,
      barcode: createdProduct.barcode,
      name: createdProduct.name,
      description: createdProduct.description,
      categoryId: createdProduct.category_id,
      brandId: createdProduct.brand_id,
      nutritionScore: createdProduct.nutrition_score,
      createdAt: createdProduct.created_at,
      updatedAt: createdProduct.updated_at
    };
  }

  async findUnique(barcode: string): Promise<Product | null> {
    const foundProduct = await prisma.product.findUnique({
      where: { barcode }
    });
    return foundProduct
      ? {
          id: foundProduct.id,
          barcode: foundProduct.barcode,
          name: foundProduct.name,
          description: foundProduct.description,
          categoryId: foundProduct.category_id,
          brandId: foundProduct.brand_id,
          nutritionScore: foundProduct.nutrition_score,
          createdAt: foundProduct.created_at,
          updatedAt: foundProduct.updated_at
        }
      : null;
  }

  async findOrCreate(barcode: string, productData: CreateProduct) {
    let product = await this.findUnique(barcode);

    if (!product) product = await this.create(productData);

    return product;
  }
}
