"use client";

import { Card, CardBody, Spinner } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { AlertCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getProductById, getProductStats } from "~/applications/Products/Api/getProductById";
import type { ProductDetail } from "~/applications/Products/Api/getProductById";
import { ProductDetailsPage } from "~/applications/Products/Ui/ProductDetailsPage";

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [stats, setStats] = useState<{
    priceCount: number;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productData, statsData] = await Promise.all([
        getProductById(productId),
        getProductStats(productId)
      ]);

      if (!productData) {
        setError("Product not found");
        return;
      }

      setProduct(productData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load product:", err);
      setError("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card>
          <CardBody className="items-center space-y-2 py-8 text-center">
            <AlertCircle className="h-12 w-12 text-danger" />
            <p className="font-semibold">
              <Trans>Product Not Found</Trans>
            </p>
            <p className="text-sm text-default-500">
              <Trans>The product you are looking for does not exist or has been removed</Trans>
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return <ProductDetailsPage product={product} stats={stats} onRefresh={loadProduct} />;
}
