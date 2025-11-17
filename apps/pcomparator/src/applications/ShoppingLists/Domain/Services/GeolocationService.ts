/**
 * Service de géolocalisation pour calculer les distances à vol d'oiseau
 * Utilise la formule de Haversine pour calculer la distance entre deux points GPS
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface StoreWithDistance {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
}

/**
 * Calcule la distance à vol d'oiseau entre deux coordonnées GPS
 * Utilise la formule de Haversine
 * @param point1 Premier point (coordonnées GPS)
 * @param point2 Second point (coordonnées GPS)
 * @returns Distance en kilomètres
 */
export function calculateDistance(point1: Coordinates, point2: Coordinates): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) *
      Math.cos(toRadians(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Arrondi à 2 décimales
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Filtre les magasins dans un rayon donné
 * @param stores Liste des magasins avec coordonnées
 * @param userLocation Position de l'utilisateur
 * @param maxRadiusKm Rayon maximum en km
 * @returns Magasins filtrés et triés par distance
 */
export function filterStoresByRadius(
  stores: Array<{ id: string; name: string; location: string; latitude: number; longitude: number }>,
  userLocation: Coordinates,
  maxRadiusKm: number
): StoreWithDistance[] {
  return stores
    .map((store) => ({
      ...store,
      distanceKm: calculateDistance(userLocation, {
        latitude: store.latitude,
        longitude: store.longitude
      })
    }))
    .filter((store) => store.distanceKm <= maxRadiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Calcule un score combiné prix + distance
 * Plus le score est bas, meilleur est le compromis
 * @param priceEuros Prix en euros
 * @param distanceKm Distance en km
 * @param priceWeight Pondération du prix (0-1, défaut 0.7 = 70% prix, 30% distance)
 * @returns Score normalisé
 */
export function calculatePriceDistanceScore(
  priceEuros: number,
  distanceKm: number,
  priceWeight = 0.7
): number {
  // Normalisation simple : on considère qu'un déplacement de 1km "coûte" environ 0.5€
  const distanceCost = distanceKm * 0.5;
  return priceEuros * priceWeight + distanceCost * (1 - priceWeight);
}
