import { z } from "zod";
import { Currency } from "~/applications/Prices/Domain/ValueObjects/Currency";

export const PriceSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  storeId: z.string().uuid(),
  amount: z.number().min(0),
  currency: z.nativeEnum(Currency),
  unit: z.string().default("kg"),
  priceProofImage: z.string().url().nullable().optional(),
  dateRecorded: z.date().nullable().optional()
});

export const CreatePriceSchema = PriceSchema.omit({
  id: true
});

export type Price = z.infer<typeof PriceSchema>;
export type CreatePrice = z.infer<typeof CreatePriceSchema>;
