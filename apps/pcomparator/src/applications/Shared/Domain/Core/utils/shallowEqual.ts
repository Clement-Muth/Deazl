/**
 * Performs a shallow equality comparison between two objects.
 * @param objA First object to compare
 * @param objB Second object to compare
 * @returns True if the objects have the same keys with the same values (using strict equality), false otherwise
 */
export function shallowEqual(objA: Record<string, unknown>, objB: Record<string, unknown>): boolean {
  // Identical references are equal
  if (objA === objB) return true;

  // If either is null/undefined, they're not equal
  if (!objA || !objB) return false;

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  // Different number of properties means objects are different
  if (keysA.length !== keysB.length) return false;

  // Check if every key-value pair is identical
  for (const key of keysA) if (objA[key] !== objB[key]) return false;

  return true;
}
