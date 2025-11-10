"use server";

import { PrismaProductRepository } from "~/applications/Prices/Infrastructure/Repositories/PrismaProductRepository";
import { ShoppingListItemApplicationService } from "../Application/Services/ShoppingListItem.service";
import { ItemQuantity } from "../Domain/ValueObjects/ItemQuantity.vo";
import { Unit } from "../Domain/ValueObjects/Unit.vo";
import { PrismaShoppingListRepository } from "../Infrastructure/Repositories/PrismaShoppingList.infrastructure";
import { PrismaShoppingListItemRepository } from "../Infrastructure/Repositories/PrismaShoppingListItem.infrastructure";

const shoppingListItemService = new ShoppingListItemApplicationService(
  new PrismaShoppingListRepository(),
  new PrismaShoppingListItemRepository()
);

interface CreateProductAndAddToListParams {
  listId: string;
  productData: {
    name: string;
    barcode?: string;
  };
  itemData: {
    quantity: number;
    unit: string;
  };
}

export const createProductAndAddToList = async (params: CreateProductAndAddToListParams) => {
  try {
    const { listId, productData, itemData } = params;

    // Validation
    const quantity = ItemQuantity.create(itemData.quantity);
    const unit = Unit.create(itemData.unit);

    if (productData.name.trim().length < 2) {
      throw new Error("Product name must be at least 2 characters long");
    }

    // 1. Prepare product data
    let productName = productData.name;
    const productBarcode =
      productData.barcode || `MANUAL-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    // 2. If barcode is provided, try to fetch product info from Open Food Facts
    // ALWAYS prioritize Open Food Facts name over user input for consistency
    if (productData.barcode) {
      try {
        const openFoodFactsResponse = await fetch(
          `https://world.openfoodfacts.org/api/v2/product/${productData.barcode}.json`
        );

        if (openFoodFactsResponse.ok) {
          const data = await openFoodFactsResponse.json();

          if (data.status === 1 && data.product && data.product.product_name) {
            // Use Open Food Facts name (more accurate and consistent)
            productName = data.product.product_name;
            console.log(`Using Open Food Facts name: "${productName}" instead of "${productData.name}"`);
          }
        }
      } catch (error) {
        console.warn("Failed to fetch Open Food Facts data, using manual input:", error);
      }
    }

    // 3. Create the Product in database
    const productRepository = new PrismaProductRepository();
    const createdProduct = await productRepository.findOrCreate(productBarcode, {
      barcode: productBarcode,
      name: productName,
      description: null,
      categoryId: null,
      brandId: null,
      nutritionScore: null
    });

    // 4. Create shopping list item linked to the product
    const item = await shoppingListItemService.addItemToList(listId, {
      productId: createdProduct.id,
      quantity: quantity.value,
      unit: unit.value,
      isCompleted: false
    });

    return item.toObject();
  } catch (error) {
    console.error("Error creating product and adding to list:", error);

    if (error instanceof Error && error.message.includes("Quantity must be at least")) {
      throw new Error(`Invalid quantity: ${error.message}`);
    }
    if (error instanceof Error && error.message.includes("Unit")) {
      throw new Error(`Invalid unit: ${error.message}`);
    }

    throw new Error("Failed to create product and add to list");
  }
};
