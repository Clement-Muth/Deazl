"use server";

import { pcomparatorAuthenticatedApiClient } from "@deazl/system";
import { z } from "zod";
import { type Currency, getCurrencySymbol } from "~/applications/Prices/Domain/ValueObjects/Currency";
import { auth } from "~/libraries/nextauth/authConfig";
import { HTTPError } from "~/types/error";

const ParamsSchema = z.object({
  userId: z.string().uuid()
});

const PayloadSchema = z
  .object({
    priceId: z.string(),
    name: z.string(),
    proof: z.string(),
    location: z.string(),
    price: z.string()
  })
  .array()
  .nullable();

type Payload = z.infer<typeof PayloadSchema>;

export const listUserPrices = async (): Promise<Payload> => {
  try {
    const session = await auth();
    const paramsPayload = ParamsSchema.parse({ userId: session?.user.id });

    const prices = (
      await pcomparatorAuthenticatedApiClient.get("/v1/user/{id}/prices", {
        params: { path: { id: paramsPayload.userId } }
      })
    ).data;

    return PayloadSchema.parse(
      prices?.map((price: any) => ({
        priceId: price.id,
        name: price.product.name as string,
        proof: price.priceProofImage as string,
        location: price.store.location as string,
        price: `${getCurrencySymbol(price.currency as Currency)}${price.amount}`
      }))
    );
  } catch (error) {
    if (error instanceof HTTPError) {
      switch (error.status) {
        case 404:
      }
      console.error("error message:", error);
    }

    throw error;
  }
};
