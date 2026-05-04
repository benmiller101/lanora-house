import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FiSearch, FiImage, FiGrid, FiList } from "react-icons/fi";
import { Package } from "lucide-react";

type Product = {
  id: number;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  categoryId?: number;
  categoryName?: string;
  sku?: string;
  era?: string;
  condition?: string;
  materials?: string[];
  imageUrl?: string;
  additionalImages?: string[];
  inStock?: boolean;
  stockQuantity?: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  status?: 'draft' | 'published';
};

type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
};

export default function ShopPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", { pageSize: 100 }],
    staleTime: 30000,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    staleTime: 300000,
  });

  const products = (productsData as any)?.products || [];

  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
      product.categoryId?.toString() === selectedCategory;
    const isInStock = product.inStock !== false;
    const isPublished = product.status !== 'draft';
    return matchesSearch && matchesCategory && isInStock && isPublished;
  });

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `£${numPrice.toFixed(2)}`;
  };

  return (
    <>
      <SEOHead
        title="Shop | Browse Products & Make Offers"
        description="Browse our collection of quality antiques, vintage items, and collectibles. Make offers on items you love and track your offers in your account."
        path="/shop"
      />

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop</h1>
            <p className="text-gray-600">
              Browse our collection and make offers on items you love
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-56" data-testid="select-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <FiGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <FiList className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-6 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">
                Try adjusting your search or filter to find what you're looking for.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product: Product) => (
                <Card 
                  key={product.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer"
                  data-testid={`card-product-${product.id}`}
                >
                  <a href={`/product/${product.id}`} className="block">
                    <div className="relative h-64 bg-gray-100">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiImage className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                      {product.isFeatured && (
                        <Badge className="absolute top-2 left-2 bg-primary">Featured</Badge>
                      )}
                      {product.isBestSeller && (
                        <Badge className="absolute top-2 right-2 bg-amber-500">Best Seller</Badge>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                        <h3 className="text-white text-lg font-semibold text-center px-4" data-testid={`text-product-name-${product.id}`}>
                          {product.name}
                        </h3>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-white text-xl font-bold" data-testid={`text-price-${product.id}`}>
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-white/70 text-sm line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </a>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product: Product) => (
                <Card 
                  key={product.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  data-testid={`card-product-${product.id}`}
                >
                  <a href={`/product/${product.id}`} className="flex flex-col md:flex-row">
                    <div className="md:w-48 h-48 md:h-auto bg-gray-100 flex-shrink-0">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiImage className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <div className="flex gap-2">
                            {product.isFeatured && (
                              <Badge className="bg-primary">Featured</Badge>
                            )}
                            {product.isBestSeller && (
                              <Badge className="bg-amber-500">Best Seller</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
