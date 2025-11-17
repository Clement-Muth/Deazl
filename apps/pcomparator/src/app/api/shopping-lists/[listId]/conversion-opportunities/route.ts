import { type NextRequest, NextResponse } from "next/server";

// const conversionService = new SmartConversionApplicationService(
//   new PrismaShoppingListRepository(),
//   new PrismaShoppingListItemRepository()
// );

/**
 * API pour identifier les opportunités de conversion dans une liste
 */
export async function GET(request: NextRequest, { params }: { params: { listId: string } }) {
  try {
    const { listId } = await params;

    if (!listId) {
      return NextResponse.json({ error: "List ID is required" }, { status: 400 });
    }

    // const opportunities = await conversionService.identifyConversionOpportunities(listId);

    return NextResponse.json([]);
  } catch (error) {
    console.error("Error identifying conversion opportunities:", error);

    if (error instanceof Error) {
      if (error.message.includes("not authenticated")) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      if (error.message.includes("Unauthorized")) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
      }
      if (error.message.includes("not found")) {
        return NextResponse.json({ error: "List not found" }, { status: 404 });
      }
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
