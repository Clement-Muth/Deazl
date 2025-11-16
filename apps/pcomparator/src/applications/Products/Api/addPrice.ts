"use server";

import { prisma } from "@deazl/system";
import type { Currency } from "~/applications/Prices/Domain/ValueObjects/Currency";

export interface AddPriceInput {
  productId: string;
  storeId: string;
  amount: number;
  currency: string;
  unit: string;
  dateRecorded: Date;
  priceProofImage?: string;
}

export async function addPrice(input: AddPriceInput) {
  try {
    const price = await prisma.price.create({
      data: {
        product_id: input.productId,
        store_id: input.storeId,
        amount: input.amount,
        currency: input.currency as Currency,
        unit: input.unit,
        date_recorded: input.dateRecorded,
        price_proof_image: input.priceProofImage
      }
    });

    return { success: true, price };
  } catch (error) {
    console.error("Failed to add price:", error);
    return { success: false, error: "Failed to add price" };
  }
}
