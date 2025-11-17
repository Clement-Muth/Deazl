"use server";

import { z } from "zod";

const ParamsSchema = z.object({
  barcode: z.string()
});

type SearchByBarcodeReturn =
  | {
      name: string;
      success: true;
      product: {
        product_name: string;
        brands: string;
        code: string;
      };
      error?: never;
    }
  | {
      name?: never;
      success: false;
      product?: never;
      error: {
        reason: string;
      };
    };

export const searchByBarcode = async (
  params: z.infer<typeof ParamsSchema>
): Promise<SearchByBarcodeReturn> => {
  try {
    const payload = ParamsSchema.parse(params);

    const { product } = await (
      await fetch(`https://world.openfoodfacts.net/api/v2/product/${payload.barcode}`, { method: "get" })
    ).json();

    if (!product)
      return {
        success: false,
        error: {
          reason: "not found"
        }
      };

    return { name: product.product_name as string, product, success: true };
    // return { success: true, prices: res, search: payload.data.search };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
