export interface PriceData {
  id: string;
  productId: string;
  storeId: string;
  storeName: string;
  amount: number;
  currency: string;
  unit: string;
  dateRecorded: Date;
}

/**
 * Normalizes unit names to standard English equivalents
 * Handles French variants, abbreviations, and common aliases
 */
function normalizeUnit(unit: string): string {
  const normalized = unit.toLowerCase().trim();
  const unitMap: Record<string, string> = {
    // Weight
    kilogram: "kg",
    kilograms: "kg",
    kilo: "kg",
    kilos: "kg",
    gram: "g",
    grams: "g",
    gramme: "g",
    grammes: "g",
    // Volume
    liter: "l",
    liters: "l",
    litre: "l",
    litres: "l",
    milliliter: "ml",
    milliliters: "ml",
    millilitre: "ml",
    millilitres: "ml",
    centiliter: "cl",
    centiliters: "cl",
    centilitre: "cl",
    centilitres: "cl",
    // Units
    piece: "unit",
    pieces: "unit",
    unité: "unit",
    unités: "unit",
    pièce: "unit",
    pièces: "unit",
    // Cooking units - English
    tsp: "teaspoon",
    t: "teaspoon",
    tbsp: "tablespoon",
    T: "tablespoon",
    c: "cup",
    // Cooking units - French
    "cuillère à café": "teaspoon",
    "cuillères à café": "teaspoon",
    "cuillere a cafe": "teaspoon",
    "cuilleres a cafe": "teaspoon",
    "c. à café": "teaspoon",
    "c à café": "teaspoon",
    cac: "teaspoon",
    cc: "teaspoon",
    "cuillère à soupe": "tablespoon",
    "cuillères à soupe": "tablespoon",
    "cuillere a soupe": "tablespoon",
    "cuilleres a soupe": "tablespoon",
    "c. à soupe": "tablespoon",
    "c à soupe": "tablespoon",
    cas: "tablespoon",
    cs: "tablespoon",
    tasse: "cup",
    tasses: "cup",
    pincée: "pinch",
    pincées: "pinch"
  };
  return unitMap[normalized] || normalized;
}

/**
 * Converts a quantity from one unit to another
 * Supports: kg, g, l, ml, cl, unit, teaspoon, tablespoon, cup, pinch
 */
function convertUnit(quantity: number, fromUnit: string, toUnit: string): number {
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);

  // Same unit, no conversion needed
  if (from === to) return quantity;

  // Cooking units to ml first
  const cookingToMl: Record<string, number> = {
    teaspoon: 5,
    tablespoon: 15,
    cup: 240,
    pinch: 0.5
  };

  // If fromUnit is a cooking unit, convert to ml first, then to target
  if (cookingToMl[from]) {
    const inMl = quantity * cookingToMl[from];
    // If target is ml, return directly
    if (to === "ml") return inMl;
    // If target is cl, convert ml → cl
    if (to === "cl") return inMl / 10;
    // If target is l, convert ml → l
    if (to === "l") return inMl / 1000;
    // If target is kg (assume 1ml = 1g for liquids), convert ml → g → kg
    if (to === "kg") return inMl / 1000;
    // If target is g, convert ml → g
    if (to === "g") return inMl;
    // Otherwise return the ml value
    return inMl;
  }

  // If toUnit is a cooking unit, convert from ml first
  if (cookingToMl[to]) {
    let inMl = quantity;
    // Convert source to ml first
    if (from === "l") inMl = quantity * 1000;
    else if (from === "kg")
      inMl = quantity * 1000; // Assume 1g = 1ml for liquids
    else if (from === "g") inMl = quantity;
    else if (from === "cl") inMl = quantity * 10;
    // Then convert ml to target cooking unit
    return inMl / cookingToMl[to];
  }

  // Weight conversions
  if (from === "kg" && to === "g") return quantity * 1000;
  if (from === "g" && to === "kg") return quantity / 1000;

  // Volume conversions
  if (from === "l" && to === "ml") return quantity * 1000;
  if (from === "ml" && to === "l") return quantity / 1000;
  if (from === "l" && to === "cl") return quantity * 100;
  if (from === "cl" && to === "l") return quantity / 100;
  if (from === "cl" && to === "ml") return quantity * 10;
  if (from === "ml" && to === "cl") return quantity / 10;

  // Volume to weight conversions (approximate 1ml = 1g for liquids)
  if (from === "cl" && to === "kg") return (quantity * 10) / 1000; // cl → ml → g → kg
  if (from === "cl" && to === "g") return quantity * 10; // cl → ml → g
  if (from === "ml" && to === "kg") return quantity / 1000; // ml → g → kg
  if (from === "ml" && to === "g") return quantity; // ml → g
  if (from === "l" && to === "kg") return quantity; // l → ml → g → kg (1l = 1kg)
  if (from === "l" && to === "g") return quantity * 1000; // l → ml → g

  // Weight to volume conversions (approximate 1g = 1ml for liquids)
  if (from === "kg" && to === "l") return quantity; // kg → g → ml → l
  if (from === "kg" && to === "cl") return quantity * 100; // kg → g → ml → cl
  if (from === "kg" && to === "ml") return quantity * 1000; // kg → g → ml
  if (from === "g" && to === "l") return quantity / 1000; // g → ml → l
  if (from === "g" && to === "cl") return quantity / 10; // g → ml → cl
  if (from === "g" && to === "ml") return quantity; // g → ml

  // If units are incompatible or "unit", return original quantity
  return quantity;
}

/**
 * Calculates the price for a given quantity, handling unit conversions
 * @param priceAmount Price per unit (e.g., 2.54€/kg)
 * @param priceUnit Unit of the price (e.g., "kg")
 * @param itemQuantity Quantity of the item (e.g., 50)
 * @param itemUnit Unit of the item quantity (e.g., "g")
 * @returns Total price for the quantity
 */
function calculatePriceForQuantity(
  priceAmount: number,
  priceUnit: string,
  itemQuantity: number,
  itemUnit: string
): number {
  // Convert item quantity to price unit
  const convertedQuantity = convertUnit(itemQuantity, itemUnit, priceUnit);
  return priceAmount * convertedQuantity;
}

export interface BestPriceResult {
  price: PriceData;
  savings: number; // Savings compared to highest price
  savingsPercentage: number;
  rank: number; // 1 = best, 2 = second best, etc.
}

export interface PriceStats {
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  priceRange: number;
  bestStore: string;
  worstStore: string;
  totalPrices: number;
}

export enum PriceTrend {
  INCREASING = "increasing",
  DECREASING = "decreasing",
  STABLE = "stable",
  INSUFFICIENT_DATA = "insufficient_data"
}

export interface PriceTrendResult {
  trend: PriceTrend;
  changePercentage: number;
  previousPrice: number | null;
  currentPrice: number;
  daysAgo: number;
}

/**
 * Finds the best price for a product from a list of prices
 * Returns the price with the lowest amount per unit
 */
export function findBestPrice(prices: PriceData[]): BestPriceResult | null {
  if (prices.length === 0) return null;

  // Sort prices by amount (ascending)
  const sortedPrices = [...prices].sort((a, b) => a.amount - b.amount);

  const bestPrice = sortedPrices[0];
  const worstPrice = sortedPrices[sortedPrices.length - 1];
  const savings = worstPrice.amount - bestPrice.amount;
  const savingsPercentage = worstPrice.amount > 0 ? (savings / worstPrice.amount) * 100 : 0;

  return {
    price: bestPrice,
    savings,
    savingsPercentage,
    rank: 1
  };
}

/**
 * Calculates comprehensive statistics for a set of prices
 */
export function calculatePriceStats(prices: PriceData[]): PriceStats | null {
  if (prices.length === 0) return null;

  const amounts = prices.map((p) => p.amount);
  const lowestPrice = Math.min(...amounts);
  const highestPrice = Math.max(...amounts);
  const averagePrice = amounts.reduce((sum, price) => sum + price, 0) / amounts.length;
  const priceRange = highestPrice - lowestPrice;

  const bestPriceEntry = prices.find((p) => p.amount === lowestPrice);
  const worstPriceEntry = prices.find((p) => p.amount === highestPrice);

  return {
    lowestPrice,
    highestPrice,
    averagePrice,
    priceRange,
    bestStore: bestPriceEntry?.storeName ?? "Unknown",
    worstStore: worstPriceEntry?.storeName ?? "Unknown",
    totalPrices: prices.length
  };
}

/**
 * Analyzes price trends over time
 * Compares most recent price with previous prices to determine trend
 */
export function getPriceTrends(prices: PriceData[]): PriceTrendResult | null {
  if (prices.length === 0) return null;

  // Sort by date (most recent first)
  const sortedPrices = [...prices].sort((a, b) => b.dateRecorded.getTime() - a.dateRecorded.getTime());

  const currentPrice = sortedPrices[0];

  // Need at least 2 prices to determine trend
  if (sortedPrices.length < 2) {
    return {
      trend: PriceTrend.INSUFFICIENT_DATA,
      changePercentage: 0,
      previousPrice: null,
      currentPrice: currentPrice.amount,
      daysAgo: 0
    };
  }

  const previousPrice = sortedPrices[1];
  const priceDiff = currentPrice.amount - previousPrice.amount;
  const changePercentage = previousPrice.amount > 0 ? (priceDiff / previousPrice.amount) * 100 : 0;

  // Calculate days between current and previous price
  const daysAgo = Math.floor(
    (currentPrice.dateRecorded.getTime() - previousPrice.dateRecorded.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Determine trend (threshold: 2% change to avoid noise)
  let trend: PriceTrend;
  if (Math.abs(changePercentage) < 2) {
    trend = PriceTrend.STABLE;
  } else if (priceDiff > 0) {
    trend = PriceTrend.INCREASING;
  } else {
    trend = PriceTrend.DECREASING;
  }

  return {
    trend,
    changePercentage,
    previousPrice: previousPrice.amount,
    currentPrice: currentPrice.amount,
    daysAgo
  };
}

/**
 * Calculates total cost for a shopping list with quantity consideration
 * Handles unit conversions automatically
 */
export function calculateTotalCost(
  items: Array<{
    productId: string;
    quantity: number;
    unit?: string;
    bestPrice?: PriceData | null;
  }>
): number {
  return items.reduce((total, item) => {
    if (!item.bestPrice) return total;
    const itemUnit = item.unit || item.bestPrice.unit || "unit";
    const price = calculatePriceForQuantity(
      item.bestPrice.amount,
      item.bestPrice.unit,
      item.quantity,
      itemUnit
    );
    return total + price;
  }, 0);
}

/**
 * Calculates the unit price for display, handling conversions
 * @param priceAmount Price per unit from DB (e.g., 2.54€/kg)
 * @param priceUnit Unit of the price (e.g., "kg")
 * @param displayUnit Unit to display (e.g., "g")
 * @returns Unit price in display unit (e.g., 0.00254€/g)
 */
export function getUnitPriceInDisplayUnit(
  priceAmount: number,
  priceUnit: string,
  displayUnit: string
): number {
  // Normalize units for accurate comparison
  const normalizedPriceUnit = normalizeUnit(priceUnit);
  const normalizedDisplayUnit = normalizeUnit(displayUnit);

  // If units are the same, return as is
  if (normalizedPriceUnit === normalizedDisplayUnit) {
    return priceAmount;
  }

  // Calculate what 1 unit of displayUnit costs
  return calculatePriceForQuantity(priceAmount, priceUnit, 1, displayUnit);
}

/**
 * Gets the price for a specific store from a list of prices
 */
export function getPriceForStore(prices: PriceData[], storeId: string): BestPriceResult | null {
  const storePrice = prices.find((p) => p.storeId === storeId);
  if (!storePrice) return null;

  const allAmounts = prices.map((p) => p.amount);
  const lowestAmount = Math.min(...allAmounts);
  const savings = storePrice.amount - lowestAmount;
  const savingsPercentage = lowestAmount > 0 ? (savings / lowestAmount) * 100 : 0;

  return {
    price: storePrice,
    savings,
    savingsPercentage,
    rank: 1
  };
}

/**
 * Finds the best store based on total savings across all items
 * Handles unit conversions automatically
 */
export function findBestStoreForList(
  itemsWithPrices: Array<{
    productId: string;
    quantity: number;
    unit?: string;
    prices: PriceData[];
  }>
): { storeName: string; totalCost: number; savings: number } | null {
  if (itemsWithPrices.length === 0) return null;

  // Get all unique stores
  const storeIds = new Set<string>();
  for (const item of itemsWithPrices) {
    for (const price of item.prices) {
      storeIds.add(price.storeId);
    }
  }

  if (storeIds.size === 0) return null;

  // Calculate total cost per store
  const storeCosts = Array.from(storeIds).map((storeId) => {
    let totalCost = 0;
    let storeName = "";

    for (const item of itemsWithPrices) {
      const storePrice = item.prices.find((p) => p.storeId === storeId);
      if (storePrice) {
        const itemUnit = item.unit || storePrice.unit || "unit";
        const price = calculatePriceForQuantity(storePrice.amount, storePrice.unit, item.quantity, itemUnit);
        totalCost += price;
        storeName = storePrice.storeName;
      }
    }

    return { storeId, storeName, totalCost };
  });

  // Sort by total cost (ascending)
  storeCosts.sort((a, b) => a.totalCost - b.totalCost);

  const bestStore = storeCosts[0];
  const worstStore = storeCosts[storeCosts.length - 1];
  const savings = worstStore.totalCost - bestStore.totalCost;

  return {
    storeName: bestStore.storeName,
    totalCost: bestStore.totalCost,
    savings
  };
}
