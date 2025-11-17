"use server";

import { prisma } from "@deazl/system";

export async function getAllStores() {
  const stores = await prisma.store.findMany({
    select: {
      id: true,
      name: true,
      location: true
    },
    orderBy: {
      name: "asc"
    }
  });

  return stores;
}
