import type { Brand, CreateBrand } from "~/applications/Prices/Domain/Entities/Brand";
import { prisma } from "~/libraries/prisma";

export class PrismaBrandRepository {
  async create(brand: CreateBrand): Promise<Brand> {
    const createdBrand = await prisma.brand.create({
      data: {
        name: brand.name,
        description: brand.description,
        website_url: brand.websiteUrl
      }
    });

    return {
      description: createdBrand.description,
      id: createdBrand.id,
      name: createdBrand.name,
      websiteUrl: createdBrand.website_url
    };
  }

  async findUnique(name: string): Promise<Brand | null> {
    const foundBrand = await prisma.brand.findUnique({
      where: { name }
    });

    return foundBrand
      ? {
          description: foundBrand.description,
          id: foundBrand.id,
          name: foundBrand.name,
          websiteUrl: foundBrand.website_url
        }
      : null;
  }

  async findOrCreate(name: string, brandData: CreateBrand) {
    let brand = await this.findUnique(name);

    if (!brand) brand = await this.create(brandData);

    return brand;
  }
}
