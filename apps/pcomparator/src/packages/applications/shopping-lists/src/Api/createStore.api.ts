"use server";

import { auth, prisma } from "@deazl/system";
import { enrichStoreCoordinates } from "./stores/geocodeStore.api";

interface CreateStoreParams {
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

export async function createStore(params: CreateStoreParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    // Vérifier si le magasin existe déjà
    const existingStore = await prisma.store.findFirst({
      where: {
        name: params.name,
        location: params.location
      }
    });

    if (existingStore) {
      return existingStore;
    }

    // Enrichir avec les coordonnées GPS si elles ne sont pas fournies
    let latitude = params.latitude;
    let longitude = params.longitude;

    if (!latitude || !longitude) {
      const coordinates = await enrichStoreCoordinates(params.name, params.location);
      if (coordinates) {
        latitude = coordinates.latitude;
        longitude = coordinates.longitude;
        console.log(`[GPS Enrichment] ${params.name} @ ${params.location}:`, coordinates);
      }
    }

    // Créer un nouveau magasin avec coordonnées GPS si disponibles
    const newStore = await prisma.store.create({
      data: {
        name: params.name,
        location: params.location,
        latitude,
        longitude
      }
    });

    return newStore;
  } catch (error) {
    console.error("Error creating store:", error);
    throw new Error("Failed to create store");
  }
}
