import { type NextRequest, NextResponse } from "next/server";
import { SmartConversionApplicationService } from "../../../Application/Services/SmartConversion.service";
import { PrismaShoppingListRepository } from "../../../Infrastructure/Repositories/PrismaShoppingList.infrastructure";
import { PrismaShoppingListItemRepository } from "../../../Infrastructure/Repositories/PrismaShoppingListItem.infrastructure";

const conversionService = new SmartConversionApplicationService(
  new PrismaShoppingListRepository(),
  new PrismaShoppingListItemRepository()
);

/**
 * API pour convertir un item en produit
 */
export async function POST(request: NextRequest, { params }: { params: { itemId: string } }) {
  try {
    const { itemId } = params;

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { type, productId, openFoodFactsBarcode, customProductData } = body;

    if (!type || !["existing", "create_from_openfoodfacts", "create_custom"].includes(type)) {
      return NextResponse.json({ error: "Valid conversion type is required" }, { status: 400 });
    }

    const result = await conversionService.convertItemToProduct(itemId, {
      type,
      productId,
      openFoodFactsBarcode,
      customProductData
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error converting item to product:", error);

    if (error instanceof Error) {
      if (error.message.includes("not authenticated")) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      if (error.message.includes("Unauthorized")) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
      }
      if (error.message.includes("not found")) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
