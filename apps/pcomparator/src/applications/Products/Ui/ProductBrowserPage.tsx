"use client";

import { Button, Chip, Spinner } from "@heroui/react";
import { ArrowLeft, Package } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { ProductSearchFilters, ProductSearchResult } from "../Api/searchProducts";
import { getBrands, getCategories, searchProducts } from "../Api/searchProducts";
import { ProductCard } from "./ProductCard";
import { ProductFiltersModal } from "./ProductFiltersModal";
import { ProductSearchBar } from "./ProductSearchBar";

export function ProductBrowserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<ProductSearchFilters>({});
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const loadFiltersData = async () => {
      const [categoriesData, brandsData] = await Promise.all([getCategories(), getBrands()]);
      setCategories(categoriesData);
      setBrands(brandsData);
    };

    loadFiltersData();
  }, []);

  useEffect(() => {
    const query = searchParams.get("q");
    const categoryId = searchParams.get("category");
    const brandId = searchParams.get("brand");
    const sort = searchParams.get("sort");

    const initialFilters: ProductSearchFilters = {
      searchTerm: query || undefined,
      categoryId: categoryId || undefined,
      brandId: brandId || undefined,
      sortBy: (sort as any) || "popular"
    };

    setFilters(initialFilters);
    loadProducts(initialFilters);
  }, [searchParams]);

  const loadProducts = async (searchFilters: ProductSearchFilters) => {
    setIsLoading(true);
    try {
      const results = await searchProducts(searchFilters);
      setProducts(results);
    } catch (error) {
      console.error("Failed to search products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    const newFilters = { ...filters, searchTerm: query };
    setFilters(newFilters);
    updateURL(newFilters);
    loadProducts(newFilters);
  };

  const handleApplyFilters = (newFilters: ProductSearchFilters) => {
    setFilters(newFilters);
    updateURL(newFilters);
    loadProducts(newFilters);
  };

  const updateURL = (searchFilters: ProductSearchFilters) => {
    const params = new URLSearchParams();

    if (searchFilters.searchTerm) params.set("q", searchFilters.searchTerm);
    if (searchFilters.categoryId) params.set("category", searchFilters.categoryId);
    if (searchFilters.brandId) params.set("brand", searchFilters.brandId);
    if (searchFilters.sortBy) params.set("sort", searchFilters.sortBy);

    router.push(`/products?${params.toString()}`);
  };

  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name;
  const getBrandName = (id: string) => brands.find((b) => b.id === id)?.name;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <Button
          variant="light"
          startContent={<ArrowLeft className="w-4 h-4" />}
          onPress={() => router.push("/")}
        >
          Back to Home
        </Button>

        <h1 className="text-3xl font-bold text-gray-900">Browse Products</h1>

        <div className="flex gap-2">
          <div className="flex-1">
            <ProductSearchBar
              onSearch={handleSearch}
              onFilterClick={() => setIsFiltersOpen(true)}
              placeholder="Search by name, description, or barcode..."
              defaultValue={filters.searchTerm}
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.categoryId || filters.brandId || filters.searchTerm) && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.searchTerm && (
              <Chip
                size="sm"
                variant="flat"
                color="primary"
                onClose={() => {
                  const { searchTerm, ...newFilters } = filters;
                  handleApplyFilters(newFilters);
                }}
              >
                Search: {filters.searchTerm}
              </Chip>
            )}
            {filters.categoryId && (
              <Chip
                size="sm"
                variant="flat"
                color="primary"
                onClose={() => {
                  const { categoryId, ...newFilters } = filters;
                  handleApplyFilters(newFilters);
                }}
              >
                Category: {getCategoryName(filters.categoryId)}
              </Chip>
            )}
            {filters.brandId && (
              <Chip
                size="sm"
                variant="flat"
                color="primary"
                onClose={() => {
                  const { brandId, ...newFilters } = filters;
                  handleApplyFilters(newFilters);
                }}
              >
                Brand: {getBrandName(filters.brandId)}
              </Chip>
            )}
            <Button
              size="sm"
              variant="light"
              color="danger"
              onPress={() => {
                setFilters({});
                router.push("/products");
                loadProducts({});
              }}
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Results */}
      <div>
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" />
          </div>
        ) : products.length > 0 ? (
          <>
            <p className="text-gray-600 mb-6">{products.length} products found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="mb-4">
              <Package className="w-16 h-16 text-gray-300 mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No products found</h2>
            <p className="text-gray-500 mb-6">Try adjusting your search criteria</p>
            <Button color="primary" onPress={() => setIsFiltersOpen(true)}>
              Modify Filters
            </Button>
          </div>
        )}
      </div>

      {/* Filters Modal */}
      <ProductFiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
