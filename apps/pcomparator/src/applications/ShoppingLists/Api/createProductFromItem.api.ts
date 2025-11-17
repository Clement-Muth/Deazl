"use server";

import { auth } from "@deazl/system";

// TODO: Cette fonctionnalité devrait être déplacée vers un service Products dédié
// plutôt que d'être dans les services ShoppingLists

export async function createProductFromItem(data: {
  name: string;
  price: number;
  unit: string;
  quantity: number;
  brandName: string;
  storeName: string;
  storeLocation: string;
  referencePrice: number;
  referenceUnit: string;
}): Promise<any> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    // TODO: Implementer cette fonctionnalité dans un service Products dédié
    // const result = await productService.createProductFromItem(data);
    throw new Error("Feature not implemented - should be moved to Products service");
  } catch (error) {
    console.error("Error creating product from item:", error);
    throw new Error("Failed to create product", { cause: "FormError" });
  }
}
