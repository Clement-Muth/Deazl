import { NextResponse } from "next/server";
import { z } from "zod";
import { Currency } from "~/applications/Prices/Domain/ValueObjects/Currency";
import { PrismaBrandRepository } from "~/applications/Prices/Infrastructure/Repositories/PrismaBrandRepository";
import { PrismaCategoryRepository } from "~/applications/Prices/Infrastructure/Repositories/PrismaCategoryRepository";
import { PrismaPriceRepository } from "~/applications/Prices/Infrastructure/Repositories/PrismaPriceRepository";
import { PrismaProductRepository } from "~/applications/Prices/Infrastructure/Repositories/PrismaProductRepository";
import { PrismaStoreRepository } from "~/applications/Prices/Infrastructure/Repositories/PrismaStoreRepository";
import { errorHandler } from "~/core/errorHandler";
import { withAuthentication } from "~/libraries/nextauth/authConfig";
import { HttpStatus } from "~/types/httpError";

export const ParamsSchema = z.object({
  barcode: z.string(),
  storeName: z.string(),
  productName: z.string(),
  categoryName: z.string(),
  brandName: z.string(),
  location: z.string(),
  amount: z.number().positive(),
  unit: z.string().default("kg"),
  proof: z.string(),
  currency: z.nativeEnum(Currency)
});

const categoryRepository = new PrismaCategoryRepository();
const productRepository = new PrismaProductRepository();
const storeRepository = new PrismaStoreRepository();
const priceRepository = new PrismaPriceRepository();
const brandRepository = new PrismaBrandRepository();

export const POST = withAuthentication(
  errorHandler(async (request): Promise<NextResponse> => {
    const paramsPayload = ParamsSchema.parse(await request.json());

    const category = await categoryRepository.findOrCreate(paramsPayload.categoryName, {
      description: "",
      name: paramsPayload.categoryName
    });

    const brand = await brandRepository.findOrCreate(paramsPayload.brandName, {
      description: "",
      name: paramsPayload.brandName
    });

    const product = await productRepository.findOrCreate(paramsPayload.barcode, {
      name: paramsPayload.productName,
      categoryId: category.id,
      brandId: brand.id,
      barcode: paramsPayload.barcode
    });

    const store = await storeRepository.findOrCreate(paramsPayload.location, paramsPayload.storeName, {
      location: paramsPayload.location,
      name: paramsPayload.storeName
    });

    const createdPrice = await priceRepository.create({
      productId: product.id,
      storeId: store.id,
      amount: paramsPayload.amount,
      currency: paramsPayload.currency,
      unit: paramsPayload.unit,
      priceProofImage: paramsPayload.proof
    });

    return NextResponse.json({ name: product.name }, { status: HttpStatus.CREATED });
  })
);
