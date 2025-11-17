import { type NextRequest, NextResponse } from "next/server";
// import { SmartConversionApplicationService } from "~/Application/Services/SmartConversion.service";
// import { PrismaShoppingListRepository } from "~/Infrastructure/Repositories/PrismaShoppingList.infrastructure";
// import { PrismaShoppingListItemRepository } from "~/Infrastructure/Repositories/PrismaShoppingListItem.infrastructure";

// const conversionService = new SmartConversionApplicationService(
//   new PrismaShoppingListRepository(),
//   new PrismaShoppingListItemRepository()
// );

/**
 * API pour générer des suggestions de conversion d'un item vers un produit
 */
export async function GET(request: NextRequest, { params }: { params: { itemId: string } }) {
  try {
    const { itemId } = params;

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    // const suggestions = await conversionService.generateConversionSuggestions(itemId);

    // if (!suggestions) {
    //   return NextResponse.json(
    //     { message: "No conversion suggestions available for this item" },
    //     { status: 200 }
    //   );
    // }

    return NextResponse.json([]);
  } catch (error) {
    console.error("Error generating conversion suggestions:", error);

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
