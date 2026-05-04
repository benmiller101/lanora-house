import React from "react";
import { useRecommendations } from "@/hooks/useRecommendations";
import { Product } from "@/lib/types";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProductRecommendationsProps {
  currentProductId?: string;
  title?: string;
  limit?: number;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  currentProductId,
  title = "You Might Also Like",
  limit = 4,
}) => {
  const { recommendations, isLoading } = useRecommendations(limit, currentProductId);

  if (isLoading) {
    return (
      <div className="mt-10 space-y-4">
        <h2 className="font-display text-2xl md:text-3xl mb-6">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {Array(limit)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="p-0">
                  <Skeleton className="w-full h-48" />
                </CardHeader>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-9 w-1/3" />
                </CardFooter>
              </Card>
            ))}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 space-y-4">
      <h2 className="font-display text-2xl md:text-3xl mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((product: Product) => (
          <Card key={product.id} className="overflow-hidden">
            <Link href={`/product/${product.id}`}>
              <a className="block">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {parseFloat(product.originalPrice) > parseFloat(product.price) && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                        Sale
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-base font-medium truncate">
                    {product.name}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">{product.era}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                  <div className="flex items-center">
                    {parseFloat(product.originalPrice) > parseFloat(product.price) ? (
                      <>
                        <span className="font-bold text-primary">£{parseFloat(product.price).toFixed(2)}</span>
                        <span className="text-sm text-gray-500 line-through ml-2">
                          £{parseFloat(product.originalPrice).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold text-primary">£{parseFloat(product.price).toFixed(2)}</span>
                    )}
                  </div>
                </CardFooter>
              </a>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendations;