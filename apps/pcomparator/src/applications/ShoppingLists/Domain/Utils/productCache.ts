/**
 * Cache simple pour les données produits
 * Améliore les performances en évitant de recharger les mêmes produits
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class ProductCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > this.TTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }

  remove(key: string): void {
    this.cache.delete(key);
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const isExpired = Date.now() - entry.timestamp > this.TTL;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

export const productCache = new ProductCache();

/**
 * Hook pour charger les données produits avec cache
 */
export const getCachedProductData = async <T>(key: string, fetcher: () => Promise<T>): Promise<T> => {
  // Vérifier le cache
  const cached = productCache.get<T>(key);
  if (cached) {
    return cached;
  }

  // Charger les données
  const data = await fetcher();

  // Mettre en cache
  productCache.set(key, data);

  return data;
};
