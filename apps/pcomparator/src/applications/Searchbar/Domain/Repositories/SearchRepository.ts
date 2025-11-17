import type { Price } from "~/applications/Searchbar/Domain/Entities/Price";

export interface SearchRepository {
  search(query: string): Promise<Price[] | null>;
  findIfProductExists(query: string): Promise<boolean>;
}
