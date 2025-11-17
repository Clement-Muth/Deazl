import type { CreateStore, Store } from "~/applications/Prices/Domain/Entities/Store";
import type { StoreRepository } from "~/applications/Prices/Domain/Repositories/StoreRepository";
import { prisma } from "~/libraries/prisma";

export class PrismaStoreRepository implements StoreRepository {
  async create(store: CreateStore): Promise<Store> {
    const createdStore = await prisma.store.create({
      data: {
        name: store.name,
        location: store.location,
        website_url: store.websiteUrl
      }
    });
    return {
      id: createdStore.id,
      name: createdStore.name,
      location: createdStore.location,
      websiteUrl: createdStore.website_url
    };
  }

  async findUnique(location: string, name: string): Promise<Store | null> {
    const foundStore = await prisma.store.findFirst({
      where: { location, name }
    });

    return foundStore
      ? {
          id: foundStore.id,
          location: foundStore?.location,
          name: foundStore?.name,
          websiteUrl: foundStore?.website_url
        }
      : null;
  }

  async findOrCreate(location: string, name: string, productData: CreateStore) {
    let product = await this.findUnique(location, name);

    if (!product) product = await this.create(productData);

    return product;
  }
}
