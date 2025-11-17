import { NextResponse } from "next/server";
import { prisma } from "~/libraries/prisma";

export async function GET() {
  try {
    const [productsCount, usersCount, storesCount] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.store.count()
    ]);

    return NextResponse.json({
      productsCount,
      usersCount,
      storesCount
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
