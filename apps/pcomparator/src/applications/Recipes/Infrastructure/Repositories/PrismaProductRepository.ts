import { prisma } from "@deazl/system";
import { v4 as uuidv4 } from "uuid";
import type {
  CreateProductPayload,
  ProductBasicInfo,
  ProductRepository
} from "../../Domain/Repositories/ProductRepository";

export class PrismaProductRepository implements ProductRepository {
  async searchProducts(query: string, limit = 10): Promise<ProductBasicInfo[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { barcode: { contains: query, mode: "insensitive" } },
            { brand: { name: { contains: query, mode: "insensitive" } } },
            { category: { name: { contains: query, mode: "insensitive" } } }
          ]
        },
        include: {
          brand: true,
          category: true
        },
        take: limit
      });

      return products.map((product) => ({
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        brand: product.brand
          ? {
              id: product.brand.id,
              name: product.brand.name
            }
          : undefined,
        category: product.category
          ? {
              id: product.category.id,
              name: product.category.name
            }
          : undefined
      }));
    } catch (error) {
      console.error("Error searching products:", error);
      throw new Error("Failed to search products");
    }
  }

  async createProduct(payload: CreateProductPayload): Promise<ProductBasicInfo> {
    try {
      const product = await prisma.product.create({
        data: {
          id: uuidv4(),
          name: payload.name,
          barcode: payload.barcode,
          description: payload.description,
          category_id: payload.categoryId,
          brand_id: payload.brandId
        },
        include: {
          brand: true,
          category: true
        }
      });

      return {
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        brand: product.brand
          ? {
              id: product.brand.id,
              name: product.brand.name
            }
          : undefined,
        category: product.category
          ? {
              id: product.category.id,
              name: product.category.name
            }
          : undefined
      };
    } catch (error) {
      console.error("Error creating product:", error);
      throw new Error("Failed to create product");
    }
  }

  async findById(productId: string): Promise<ProductBasicInfo | null> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          brand: true,
          category: true
        }
      });

      if (!product) return null;

      return {
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        brand: product.brand
          ? {
              id: product.brand.id,
              name: product.brand.name
            }
          : undefined,
        category: product.category
          ? {
              id: product.category.id,
              name: product.category.name
            }
          : undefined
      };
    } catch (error) {
      console.error("Error finding product by ID:", error);
      return null;
    }
  }

  async findByBarcode(barcode: string): Promise<ProductBasicInfo | null> {
    try {
      const product = await prisma.product.findUnique({
        where: { barcode },
        include: {
          brand: true,
          category: true
        }
      });

      if (!product) return null;

      return {
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        brand: product.brand
          ? {
              id: product.brand.id,
              name: product.brand.name
            }
          : undefined,
        category: product.category
          ? {
              id: product.category.id,
              name: product.category.name
            }
          : undefined
      };
    } catch (error) {
      console.error("Error finding product by barcode:", error);
      return null;
    }
  }
}
