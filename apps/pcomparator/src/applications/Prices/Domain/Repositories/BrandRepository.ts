import type { Brand } from "~/applications/Prices/Domain/Entities/Brand";

export interface BrandRepository {
  create(brand: Brand): Promise<Brand>;

  findUnique(name: string): Promise<Brand | null>;
}
