"use client";

import { Button, Chip, Pagination, Spinner } from "@heroui/react";
import { ArrowLeft, Package } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { ProductSearchFilters, ProductSearchResult } from "../Api/searchProducts";
import { getBrands, getCategories, searchProducts } from "../Api/searchProducts";
import { ProductCard } from "./ProductCard";
import { ProductFiltersModal } from "./ProductFiltersModal";
import { ProductSearchBar } from "./ProductSearchBar";

const ITEMS_PER_PAGE = 12;

export function ProductBrowserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<ProductSearchFilters>({});
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

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
    const page = Number.parseInt(searchParams.get("page") || "1", 10);

    const initialFilters: ProductSearchFilters = {
      searchTerm: query || undefined,
      categoryId: categoryId || undefined,
      brandId: brandId || undefined,
      sortBy: (sort as any) || "popular"
    };

    setFilters(initialFilters);
    setCurrentPage(page);
    loadProducts(initialFilters, page);
  }, [searchParams]);

  const loadProducts = async (searchFilters: ProductSearchFilters, page = 1) => {
    setIsLoading(true);
    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const response = await searchProducts({
        ...searchFilters,
        limit: ITEMS_PER_PAGE,
        offset
      });
      setProducts(response.products);
      setTotalPages(response.totalPages);
      setTotalProducts(response.total);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to search products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    const newFilters = { ...filters, searchTerm: query };
    setFilters(newFilters);
    updateURL(newFilters, 1);
    loadProducts(newFilters, 1);
  };

  const handleApplyFilters = (newFilters: ProductSearchFilters) => {
    setFilters(newFilters);
    updateURL(newFilters, 1);
    loadProducts(newFilters, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL(filters, page);
    loadProducts(filters, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateURL = (searchFilters: ProductSearchFilters, page = 1) => {
    const params = new URLSearchParams();

    if (searchFilters.searchTerm) params.set("q", searchFilters.searchTerm);
    if (searchFilters.categoryId) params.set("category", searchFilters.categoryId);
    if (searchFilters.brandId) params.set("brand", searchFilters.brandId);
    if (searchFilters.sortBy) params.set("sort", searchFilters.sortBy);
    if (page > 1) params.set("page", page.toString());

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

        <h1 className="text-3xl font-bold text-foreground">Browse Products</h1>

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
                loadProducts({}, 1);
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
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                {Math.min(currentPage * ITEMS_PER_PAGE, totalProducts)} of {totalProducts} products
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  total={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  showControls
                  color="primary"
                  size="lg"
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="mb-4">
              <Package className="w-16 h-16 text-gray-300 mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">No products found</h2>
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
