"use client";

import { Card, CardBody, CardFooter, Chip } from "@heroui/react";
import { Barcode, Package, Tag } from "lucide-react";
import Link from "next/link";
import type { ProductSearchResult } from "../Api/searchProducts";

interface ProductCardProps {
  product: ProductSearchResult;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardBody className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-base line-clamp-2 mb-1">{product.name}</h3>
              {product.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
              )}
            </div>
            <div className="ml-2 bg-primary-50 p-2 rounded-lg">
              <Package className="w-5 h-5 text-primary-600" />
            </div>
          </div>

          <div className="space-y-2">
            {product.brand && (
              <div className="flex items-center gap-2 text-sm">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{product.brand.name}</span>
              </div>
            )}
            {product.category && (
              <Chip size="sm" variant="flat" color="primary">
                {product.category.name}
              </Chip>
            )}
          </div>
        </CardBody>

        <CardFooter className="pt-0 px-4 pb-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Barcode className="w-4 h-4" />
            <span className="font-mono text-xs">{product.barcode}</span>
          </div>
          {product.priceCount > 0 && (
            <Chip size="sm" variant="flat" color="success">
              {product.priceCount} {product.priceCount === 1 ? "price" : "prices"}
            </Chip>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
