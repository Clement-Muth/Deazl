import { NextResponse } from "next/server";
import { z } from "zod";
import { PrismaBrandRepository } from "~/applications/Prices/Infrastructure/Repositories/PrismaBrandRepository";
import { PrismaCategoryRepository } from "~/applications/Prices/Infrastructure/Repositories/PrismaCategoryRepository";
import { PrismaProductRepository } from "~/applications/Prices/Infrastructure/Repositories/PrismaProductRepository";
import { errorHandler } from "~/core/errorHandler";
import { withAuthentication } from "~/libraries/nextauth/authConfig";
import { HttpStatus } from "~/types/httpError";

export const ParamsSchema = z.object({
  categoryName: z.string(),
  brandName: z.string(),
  productName: z.string(),
  barcode: z.string()
});

const categoryRepository = new PrismaCategoryRepository();
const productRepository = new PrismaProductRepository();
const brandRepository = new PrismaBrandRepository();

export const POST = withAuthentication(
  errorHandler(async (request, ctx): Promise<NextResponse> => {
    const { barcode } = await (ctx.params as unknown as Promise<{ barcode: string }>);
    const paramsPayload = ParamsSchema.parse({ ...(await request.json()), barcode });

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

    return NextResponse.json(product, { status: HttpStatus.CREATED });
  })
);
