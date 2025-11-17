import { UnitType } from "~/applications/ShoppingLists/Domain/ValueObjects/Unit.vo";

/**
 * Normalise une unité en chaîne de caractères vers le type UnitType
 * Gère les variations communes (majuscules, pluriels, variantes)
 */
export function normalizeUnit(unit: string): UnitType {
  const normalized = unit.toLowerCase().trim();

  // Mapping des variations vers les unités standardisées
  const unitMappings: Record<string, UnitType> = {
    // Weight units
    kg: UnitType.KG,
    kilo: UnitType.KG,
    kilos: UnitType.KG,
    kilogram: UnitType.KG,
    kilograms: UnitType.KG,
    kilogramme: UnitType.KG,
    kilogrammes: UnitType.KG,

    g: UnitType.G,
    gr: UnitType.G,
    gram: UnitType.G,
    grams: UnitType.G,
    gramme: UnitType.G,
    grammes: UnitType.G,

    // Volume units
    l: UnitType.L,
    liter: UnitType.L,
    liters: UnitType.L,
    litre: UnitType.L,
    litres: UnitType.L,

    ml: UnitType.ML,
    milliliter: UnitType.ML,
    milliliters: UnitType.ML,
    millilitre: UnitType.ML,
    millilitres: UnitType.ML,

    // Count units
    unit: UnitType.UNIT,
    units: UnitType.UNIT,
    unité: UnitType.UNIT,
    unités: UnitType.UNIT,

    piece: UnitType.PIECE,
    pieces: UnitType.PIECE,
    pièce: UnitType.PIECE,
    pièces: UnitType.PIECE,
    pc: UnitType.PIECE,
    pcs: UnitType.PIECE
  };

  const mappedUnit = unitMappings[normalized];

  if (mappedUnit) {
    return mappedUnit;
  }

  // Si l'unité est déjà valide, la retourner telle quelle
  if (Object.values(UnitType).includes(normalized as UnitType)) {
    return normalized as UnitType;
  }

  // Par défaut, retourner "unit" si l'unité n'est pas reconnue
  console.warn(`Unknown unit "${unit}", defaulting to "unit"`);
  return UnitType.UNIT;
}

/**
 * Vérifie si une unité est valide
 */
export function isValidUnit(unit: string): boolean {
  try {
    normalizeUnit(unit);
    return true;
  } catch {
    return false;
  }
}
