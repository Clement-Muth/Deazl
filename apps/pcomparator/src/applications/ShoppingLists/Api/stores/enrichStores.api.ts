"use server";

import { auth, prisma } from "@deazl/system";
import { enrichStoreCoordinates } from "./geocodeStore.api";

/**
 * Enrichit un magasin existant avec des coordonnées GPS
 * @param storeId - ID du magasin à enrichir
 * @returns Le magasin mis à jour avec les coordonnées GPS
 */
export async function enrichSingleStore(storeId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    // Récupérer le magasin
    const store = await prisma.store.findUnique({
      where: { id: storeId }
    });

    if (!store) {
      throw new Error("Store not found");
    }

    // Si le magasin a déjà des coordonnées, ne rien faire
    if (store.latitude && store.longitude) {
      return {
        success: true,
        message: "Store already has coordinates",
        store
      };
    }

    // Enrichir avec Photon API
    const coordinates = await enrichStoreCoordinates(store.name, store.location);

    if (!coordinates) {
      return {
        success: false,
        message: "Unable to find coordinates for this store",
        store
      };
    }

    // Mettre à jour le magasin
    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      }
    });

    return {
      success: true,
      message: "Store enriched successfully",
      store: updatedStore
    };
  } catch (error) {
    console.error("Error enriching store:", error);
    throw new Error("Failed to enrich store");
  }
}

/**
 * Enrichit tous les magasins sans coordonnées GPS
 * @returns Statistiques d'enrichissement
 */
export async function enrichAllStores() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    // Récupérer tous les magasins sans coordonnées
    const storesWithoutCoordinates = await prisma.store.findMany({
      where: {
        OR: [{ latitude: null }, { longitude: null }]
      }
    });

    if (storesWithoutCoordinates.length === 0) {
      return {
        success: true,
        message: "All stores already have coordinates",
        total: 0,
        enriched: 0,
        failed: 0
      };
    }

    let enriched = 0;
    let failed = 0;

    // Enrichir chaque magasin avec un délai pour éviter de surcharger l'API
    for (const store of storesWithoutCoordinates) {
      try {
        const coordinates = await enrichStoreCoordinates(store.name, store.location);

        if (coordinates) {
          await prisma.store.update({
            where: { id: store.id },
            data: {
              latitude: coordinates.latitude,
              longitude: coordinates.longitude
            }
          });
          enriched++;
        } else {
          failed++;
          console.warn(`✗ Failed: ${store.name} @ ${store.location}`);
        }

        // Délai de 500ms entre chaque requête pour respecter les limites de l'API
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        failed++;
        console.error(`Error enriching store ${store.name}:`, error);
      }
    }

    return {
      success: true,
      message: `Enrichment completed: ${enriched} succeeded, ${failed} failed`,
      total: storesWithoutCoordinates.length,
      enriched,
      failed
    };
  } catch (error) {
    console.error("Error enriching stores:", error);
    throw new Error("Failed to enrich stores");
  }
}

/**
 * Liste les magasins sans coordonnées GPS
 * @returns Liste des magasins sans coordonnées
 */
export async function listStoresWithoutCoordinates() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const stores = await prisma.store.findMany({
      where: {
        OR: [{ latitude: null }, { longitude: null }]
      },
      select: {
        id: true,
        name: true,
        location: true,
        latitude: true,
        longitude: true,
        _count: {
          select: {
            prices: true
          }
        }
      },
      orderBy: {
        name: "asc"
      }
    });

    return stores;
  } catch (error) {
    console.error("Error listing stores:", error);
    throw new Error("Failed to list stores");
  }
}
