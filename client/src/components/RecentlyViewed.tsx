import { Link } from "wouter";
import { getRecentlyViewed, type RecentlyViewedProduct } from "@/lib/recentlyViewed";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

export function RecentlyViewed() {
  const recentProducts = getRecentlyViewed();

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-5 h-5 text-primary" />
        <h3 className="font-display text-xl">Recently Viewed</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {recentProducts.map((product) => (
          <Link key={product.id} href={`/product/${product.id}`}>
            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-3">
                <div className="aspect-square mb-2 overflow-hidden rounded-md bg-neutral-paper">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-medium text-sm line-clamp-2 mb-1 text-neutral-charcoal">
                  {product.name}
                </h4>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    £{Number(product.price).toFixed(2)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}