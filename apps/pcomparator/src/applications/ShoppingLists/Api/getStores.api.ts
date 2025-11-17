"use server";

import { auth, prisma } from "@deazl/system";

export interface StoreInfo {
  id: string;
  name: string;
  location: string;
}

export async function getStores(): Promise<StoreInfo[]> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    // Simplifions la requête pour éviter tout problème potentiel
    const stores = await prisma.store.findMany({
      select: {
        id: true,
        name: true,
        location: true
      },
      orderBy: { name: "asc" }
    });

    return stores;
  } catch (error) {
    console.error("Error fetching stores:", error);
    return []; // Retourner un tableau vide en cas d'erreur plutôt que de lancer une exception
  }
}
