"use server";

import { pcomparatorAuthenticatedApiClient } from "@deazl/system";
// import { HTTPError } from "ky";
import { z } from "zod";

const ParamsSchema = z.object({
  search: z.string({ message: "This field is requried" }).min(1, "This field is required")
});

type SearchReturnType = {
  success: boolean;
  search: string;
  prices?: any[] | null;
  errors?: any;
  reason?: string;
};

export const search = async (_: any, data: FormData): Promise<SearchReturnType> => {
  let product = null;
  const formData = Object.fromEntries(data);
  const payload = ParamsSchema.safeParse(formData);

  try {
    if (!payload.success) {
      return {
        success: false,
        errors: payload.error.flatten(),
        search: "",
        reason: ""
      };
    }

    product = (
      await pcomparatorAuthenticatedApiClient.get("/v1/prices/search", {
        params: { query: { q: payload.data.search } }
      })
    ).data;

    if (!product) throw new Error("");
    // @ts-ignore
    if (!product.prices || product.reason === "NO_PRICES")
      return { success: false, search: payload.data.search, reason: "NO_PRICES" };

    // @ts-ignore
    return { success: true, prices: product.prices, search: payload.data.search };
  } catch (error) {
    // if (error instanceof ) {
    //   if (error?.response?.status === 404)
    //     return {
    //       success: false,
    //       prices: product?.prices,
    //       search: payload.data!.search!,
    //       reason: "NO_PRODUCTS"
    //     };
    // }
    console.error(error);
    throw error;
  }
};
