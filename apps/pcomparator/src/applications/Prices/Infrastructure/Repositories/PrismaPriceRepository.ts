import type { CreatePrice, Price } from "~/applications/Prices/Domain/Entities/Price";
import type { Product } from "~/applications/Prices/Domain/Entities/Product";
import type { Store } from "~/applications/Prices/Domain/Entities/Store";
import type { Currency } from "~/applications/Prices/Domain/ValueObjects/Currency";
import { prisma } from "~/libraries/prisma";

export class PrismaPriceRepository {
  async create(price: CreatePrice): Promise<Price> {
    const createdPrice = await prisma.price.create({
      data: {
        amount: price.amount,
        currency: price.currency,
        unit: price.unit ?? "kg",
        date_recorded: price.dateRecorded ?? undefined,
        price_proof_image: price.priceProofImage,
        product_id: price.productId,
        store_id: price.storeId
      }
    });

    return {
      amount: createdPrice.amount,
      currency: createdPrice.currency as Currency,
      dateRecorded: createdPrice.date_recorded,
      id: createdPrice.id,
      priceProofImage: createdPrice.price_proof_image,
      productId: createdPrice.product_id,
      storeId: createdPrice.store_id
    };
  }

  // TODO – Handle userId to filter price results
  async listByUser(userId: string): Promise<(Price & { product: Product; store: Store })[] | null> {
    const userPrices = await prisma.price.findMany({ take: 10, include: { product: true, store: true } });

    return userPrices.map((price) => ({
      amount: price.amount,
      id: price.id,
      priceProofImage: price.price_proof_image,
      productId: price.product_id,
      storeId: price.store_id,
      dateRecorded: price.date_recorded,
      currency: price.currency as Currency,
      product: {
        id: price.product.id,
        barcode: price.product.barcode,
        name: price.product.name,
        description: price.product.description,
        categoryId: price.product.category_id,
        brandId: price.product.brand_id,
        nutritionScore: price.product.nutrition_score,
        createdAt: price.product.created_at,
        updatedAt: price.product.updated_at
      },
      store: {
        id: price.store.id,
        location: price.store?.location,
        name: price.store?.name,
        websiteUrl: price.store?.website_url
      }
    }));
  }

  async delete(priceId: string): Promise<void> {
    await prisma.price.delete({ where: { id: priceId } });
  }
}
