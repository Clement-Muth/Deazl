"use server";

import { z } from "zod";

/**
 * Interface de réponse de l'API Photon
 * Documentation: https://photon.komoot.io/
 */
interface PhotonFeature {
  geometry: {
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    name?: string;
    city?: string;
    country?: string;
    osm_type?: string;
    osm_id?: number;
    extent?: [number, number, number, number];
  };
}

interface PhotonResponse {
  features: PhotonFeature[];
}

/**
 * Géocode une adresse en utilisant l'API Photon (Komoot)
 * @param address - Adresse complète du magasin (nom + ville)
 * @returns Coordonnées GPS { latitude, longitude } ou null si non trouvé
 */
export async function geocodeAddress(
  address: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    // Validation de l'entrée
    const schema = z.string().min(3);
    const validAddress = schema.parse(address);

    // Appel à l'API Photon
    const url = new URL("https://photon.komoot.io/api/");
    url.searchParams.set("q", validAddress);
    url.searchParams.set("limit", "1");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      console.error("Photon API error:", response.status, response.statusText);
      return null;
    }

    const data: PhotonResponse = await response.json();

    if (!data.features || data.features.length === 0) {
      console.warn("No geocoding result found for address:", address);
      return null;
    }

    const [longitude, latitude] = data.features[0].geometry.coordinates;

    return { latitude, longitude };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Enrichit un magasin avec ses coordonnées GPS en utilisant son nom et sa localisation
 * @param storeName - Nom du magasin
 * @param storeLocation - Localisation du magasin (ville, pays)
 * @returns Coordonnées GPS ou null
 */
export async function enrichStoreCoordinates(
  storeName: string,
  storeLocation: string
): Promise<{ latitude: number; longitude: number } | null> {
  const fullAddress = `${storeName}, ${storeLocation}`;
  return geocodeAddress(fullAddress);
}
