import { NextResponse } from "next/server";
import { PrismaSearchRepository } from "~/applications/Searchbar/Infrastructure/Repositories/PrismaSearchRepository";
import { errorHandler } from "~/core/errorHandler";
import { withAuthentication } from "~/libraries/nextauth/authConfig";
import { HttpStatus } from "~/types/httpError";

const SearchRepository = new PrismaSearchRepository();

export const GET = withAuthentication(
  errorHandler(async (request) => {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") as string;

    const prices = await SearchRepository.search(search);

    if (!prices) {
      const isProductExists = await SearchRepository.findIfProductExists(search);

      return isProductExists
        ? NextResponse.json({ reason: "NO_PRICES" }, { status: HttpStatus.OK })
        : new Response(null, { status: HttpStatus.NOT_FOUND });
    }

    return NextResponse.json({ prices: prices }, { status: HttpStatus.OK });
  })
);
