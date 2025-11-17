/**
 * Unit conversion utilities for recipe ingredients
 * Handles weight, volume, and display formatting
 */

interface ConversionResult {
  value: number;
  unit: string;
}

// Weight conversions (base: grams)
const WEIGHT_UNITS: Record<string, number> = {
  g: 1,
  kg: 1000,
  mg: 0.001,
  oz: 28.3495,
  lb: 453.592
};

// Volume conversions (base: milliliters)
const VOLUME_UNITS: Record<string, number> = {
  ml: 1,
  l: 1000,
  cl: 10,
  dl: 100,
  cup: 240,
  tbsp: 15,
  tsp: 5,
  "fl oz": 29.5735
};

/**
 * Convert between weight units
 */
export function convertWeight(value: number, fromUnit: string, toUnit: string): number {
  const from = WEIGHT_UNITS[fromUnit.toLowerCase()];
  const to = WEIGHT_UNITS[toUnit.toLowerCase()];

  if (!from || !to) return value;

  return (value * from) / to;
}

/**
 * Convert between volume units
 */
export function convertVolume(value: number, fromUnit: string, toUnit: string): number {
  const from = VOLUME_UNITS[fromUnit.toLowerCase()];
  const to = VOLUME_UNITS[toUnit.toLowerCase()];

  if (!from || !to) return value;

  return (value * from) / to;
}

/**
 * Smart unit conversion - automatically switches to larger unit when appropriate
 * Examples: 1500g → 1.5kg, 2500ml → 2.5L
 */
export function smartConvertWeight(grams: number): ConversionResult {
  if (grams >= 1000) {
    return {
      value: Math.round((grams / 1000) * 10) / 10,
      unit: "kg"
    };
  }

  if (grams < 1) {
    return {
      value: Math.round(grams * 1000),
      unit: "mg"
    };
  }

  return {
    value: Math.round(grams),
    unit: "g"
  };
}

/**
 * Smart unit conversion for volumes
 */
export function smartConvertVolume(ml: number): ConversionResult {
  if (ml >= 1000) {
    return {
      value: Math.round((ml / 1000) * 10) / 10,
      unit: "L"
    };
  }

  if (ml >= 100) {
    return {
      value: Math.round(ml / 10),
      unit: "cl"
    };
  }

  return {
    value: Math.round(ml),
    unit: "ml"
  };
}

/**
 * Scale ingredient quantity based on serving ratio
 */
export function scaleQuantity(quantity: number, unit: string, scaleFactor: number): ConversionResult {
  const scaled = quantity * scaleFactor;

  // Detect if it's weight or volume
  if (WEIGHT_UNITS[unit.toLowerCase()]) {
    const grams = convertWeight(scaled, unit, "g");
    return smartConvertWeight(grams);
  }

  if (VOLUME_UNITS[unit.toLowerCase()]) {
    const ml = convertVolume(scaled, unit, "ml");
    return smartConvertVolume(ml);
  }

  // For other units (pieces, etc.), just scale
  return {
    value: formatQuantity(scaled),
    unit
  };
}

/**
 * Format quantity with smart rounding
 * - Integers: no decimals (5)
 * - Common fractions: 1 decimal (2.5, 3.3)
 * - Small decimals: 1 decimal (0.5)
 */
export function formatQuantity(value: number): number {
  // Round to 1 decimal
  const rounded = Math.round(value * 10) / 10;

  // If it's essentially an integer, return integer
  if (Math.abs(rounded - Math.round(rounded)) < 0.01) {
    return Math.round(rounded);
  }

  return rounded;
}

/**
 * Format quantity with unit for display
 */
export function formatQuantityWithUnit(quantity: number, unit: string): string {
  const formatted = formatQuantity(quantity);
  return `${formatted} ${unit}`;
}

/**
 * Check if a unit is a weight unit
 */
export function isWeightUnit(unit: string): boolean {
  return unit.toLowerCase() in WEIGHT_UNITS;
}

/**
 * Check if a unit is a volume unit
 */
export function isVolumeUnit(unit: string): boolean {
  return unit.toLowerCase() in VOLUME_UNITS;
}
