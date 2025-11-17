import { PrismaPriceRepository } from "~/applications/Prices/Infrastructure/Repositories/PrismaPriceRepository";
import { errorHandler } from "~/core/errorHandler";
import { withAuthentication } from "~/libraries/nextauth/authConfig";
import { HttpStatus } from "~/types/httpError";

const priceRepository = new PrismaPriceRepository();

export const DELETE = withAuthentication(
  errorHandler(async (_, ctx) => {
    const { priceId } = await (ctx.params as unknown as Promise<{ id: string; priceId: string }>);

    await priceRepository.delete(priceId);

    return new Response(null, { status: HttpStatus.NO_CONTENT });
  })
);
