"use server";

import { pcomparatorAuthenticatedApiClient } from "@deazl/system";
import { ProductSchema } from "~/applications/Products/Domain/Entities/Product";
import { auth } from "~/libraries/nextauth/authConfig";
import { prisma } from "~/libraries/prisma";

export const createProduct = async (_: any, data: FormData): Promise<void> => {
  try {
    const formData = Object.fromEntries(data);
    const paramsPayload = ProductSchema.parse(formData);

    await pcomparatorAuthenticatedApiClient.post("/v1/products/{barcode}", {
      params: {
        path: {
          barcode: paramsPayload.barcode
        }
      },
      body: {
        productName: paramsPayload.name,
        categoryName: paramsPayload.categoryName,
        brandName: paramsPayload.brandName
      }
    });
  } catch (error) {
    console.error(error);
    throw new Error("Price not found", { cause: "FormError" });
    // if (error instanceof HTTPError) {
    //   switch (error.status) {
    //     case 404:
    //   }
    //   console.error("error message:", error);
    // }

    // throw error;
  }
};

interface CreateProductParams {
  name: string;
  price: number;
  unit: string;
  quantity: number;
  notes?: string;
}

export async function createProductFromItem(params: CreateProductParams) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  const { name, price, unit, quantity, notes } = params;

  // Generate a placeholder barcode (in a real app, you might want to handle this differently)
  const randomBarcode = `MANUAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Transaction to create both product and price
  const result = await prisma.$transaction(async (tx) => {
    // Create the product
    const product = await tx.product.create({
      data: {
        name,
        barcode: randomBarcode,
        description: notes
      }
    });

    // Create a default price for the product (using a generic store)
    // In a real app, you'd probably want to ask for the store or use the current user's preferred store
    let defaultStore = await tx.store.findFirst({
      where: { name: "My Local Store" }
    });

    if (!defaultStore) {
      defaultStore = await tx.store.create({
        data: {
          name: "My Local Store",
          location: "Default Location"
        }
      });
    }

    // Create the price record
    const priceRecord = await tx.price.create({
      data: {
        product_id: product.id,
        store_id: defaultStore.id,
        amount: price,
        currency: "EUR"
      }
    });

    return { product, priceRecord };
  });

  return result;
}
