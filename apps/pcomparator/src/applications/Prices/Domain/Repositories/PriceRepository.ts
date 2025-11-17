import type { Price } from "~/applications/Prices/Domain/Entities/Price";

export interface PriceRepository {
  create(price: Price): Promise<Price>;
}
