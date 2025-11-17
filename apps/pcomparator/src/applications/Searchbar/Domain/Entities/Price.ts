import { z } from "zod";
import { Currency } from "~/applications/Prices/Domain/ValueObjects/Currency";

export const PriceSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  storeId: z.string().uuid(),
  amount: z.number().min(0),
  currency: z.nativeEnum(Currency),
  priceProofImage: z.string().url().nullable().optional(),
  dateRecorded: z.date().nullable().optional()
});

export type Price = z.infer<typeof PriceSchema>;
