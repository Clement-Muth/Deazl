"use server";

import { prisma } from "@deazl/system";

export interface ProductSearchFilters {
  searchTerm?: string;
  categoryId?: string;
  brandId?: string;
  sortBy?: "name" | "newest" | "popular";
  limit?: number;
  offset?: number;
}

export interface ProductSearchResult {
  id: string;
  barcode: string;
  name: string;
  description?: string;
  category?: {
    id: string;
    name: string;
  };
  brand?: {
    id: string;
    name: string;
  };
  priceCount: number;
  createdAt: Date;
}

export interface ProductSearchResponse {
  products: ProductSearchResult[];
  total: number;
  page: number;
  totalPages: number;
}

export async function searchProducts(filters: ProductSearchFilters = {}): Promise<ProductSearchResponse> {
  const { searchTerm, categoryId, brandId, sortBy = "popular", limit = 12, offset = 0 } = filters;

  const where: any = {};

  if (searchTerm) {
    where.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
      { barcode: { contains: searchTerm } }
    ];
  }

  if (categoryId) {
    where.category_id = categoryId;
  }

  if (brandId) {
    where.brand_id = brandId;
  }

  let orderBy: any = {};
  switch (sortBy) {
    case "name":
      orderBy = { name: "asc" };
      break;
    case "newest":
      orderBy = { created_at: "desc" };
      break;
    default:
      orderBy = [{ prices: { _count: "desc" } }, { created_at: "desc" }];
      break;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        brand: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            prices: true
          }
        }
      },
      orderBy,
      take: limit,
      skip: offset
    }),
    prisma.product.count({ where })
  ]);

  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return {
    products: products.map((product) => ({
      id: product.id,
      barcode: product.barcode,
      name: product.name,
      description: product.description ?? undefined,
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name
          }
        : undefined,
      brand: product.brand
        ? {
            id: product.brand.id,
            name: product.brand.name
          }
        : undefined,
      priceCount: product._count.prices,
      createdAt: product.created_at
    })),
    total,
    page,
    totalPages
  };
}

export async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });

  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description ?? undefined
  }));
}

export async function getBrands() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" }
  });

  return brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    description: brand.description ?? undefined
  }));
}
