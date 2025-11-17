import type { Price } from "~/applications/Prices/Domain/Entities/Price";
import type { Currency } from "~/applications/Prices/Domain/ValueObjects/Currency";
import type { SearchRepository } from "~/applications/Searchbar/Domain/Repositories/SearchRepository";
import { prisma } from "~/libraries/prisma";

export class PrismaSearchRepository implements SearchRepository {
  async search(query: string): Promise<Price[] | null> {
    const prices = await prisma.price.findMany({
      where: { product: { name: { contains: query, mode: "insensitive" } } },
      include: { product: true, store: true }
    });

    return prices.length
      ? prices.map((price) => ({
          amount: price.amount,
          currency: price.currency as Currency,
          unit: price.unit,
          id: price.id,
          productId: price.product_id,
          storeId: price.store_id,
          dateRecorded: price.date_recorded,
          priceProofImage: price.price_proof_image,
          product: price.product,
          store: price.store
        }))
      : null;
  }

  async findIfProductExists(query: string): Promise<boolean> {
    const isProductExists = !!(await prisma.product.count({
      where: { name: { contains: query, mode: "insensitive" } }
    }));

    return isProductExists;
  }
}
