import { NextResponse } from "next/server";
import { PrismaPriceRepository } from "~/applications/Prices/Infrastructure/Repositories/PrismaPriceRepository";
import { errorHandler } from "~/core/errorHandler";
import { withAuthentication } from "~/libraries/nextauth/authConfig";
import { HttpStatus } from "~/types/httpError";

const priceRepository = new PrismaPriceRepository();

export const GET = withAuthentication(
  errorHandler(async (_, ctx) => {
    const { id } = await (ctx.params as unknown as Promise<{ id: string }>);

    const prices = await priceRepository.listByUser(id);

    return NextResponse.json(prices, { status: HttpStatus.OK });
  })
);
