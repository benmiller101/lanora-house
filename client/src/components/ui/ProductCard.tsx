import React, { useState } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QuickViewModal } from "@/components/ui/QuickViewModal";
import { 
  FloatingActionButton, 
  AnimatedBadge, 
  AnimatedPrice,
  LoadingButton
} from "@/components/ui/MicroInteractions";
import { 
  ShoppingCart, 
  Heart, 
  Eye, 
  MapPin, 
  Calendar, 
  Ruler, 
  Palette,
  Star,
  Info
} from "lucide-react";
import { Product } from "@/lib/types";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useModals } from "@/contexts/ModalContext";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  isAddingToCart?: boolean;
  showQuickView?: boolean;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  isAddingToCart = false,
  showQuickView = true,
  className = ""
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { openLoginModal } = useModals();

  // Check if item is in wishlist - only when authenticated
  const { data: wishlistCheck, refetch: refetchWishlistCheck } = useQuery({
    queryKey: ["/api/wishlist/check", product.id],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/wishlist/check/${product.id}`, {
          method: "GET",
          credentials: "include"
        });
        if (!response.ok) {
          console.log("Wishlist check failed:", response.status);
          return { isWishlisted: false };
        }
        const result = await response.json();
        console.log(`Wishlist check for product ${product.id}:`, result);
        return result;
      } catch (error) {
        console.log("Wishlist check error:", error);
        return { isWishlisted: false };
      }
    },
    enabled: !!product.id && isAuthenticated,
    retry: false,
    staleTime: 0, // No stale time - always fresh data
    gcTime: 1000, // Short cache time
  });

  const isWishlisted = wishlistCheck?.isWishlisted || false;

  // Add to wishlist mutation
  const addToWishlist = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ productId: product.id })
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to add to wishlist");
        }
        return await response.json();
      } catch (error) {
        console.error("Add to wishlist error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log(`Successfully added product ${product.id} to wishlist`);
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist/check", product.id] });
      refetchWishlistCheck(); // Force immediate refetch
      toast({
        title: "Added to wishlist!",
        description: `${product.name} has been added to your wishlist.`,
      });
    },
    onError: (error: any) => {
      console.error("Wishlist add mutation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add to wishlist",
        variant: "destructive",
      });
    },
  });

  // Remove from wishlist mutation
  const removeFromWishlist = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(`/api/wishlist/product/${product.id}`, {
          method: "DELETE",
          credentials: "include"
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to remove from wishlist");
        }
        return await response.json();
      } catch (error) {
        console.error("Remove from wishlist error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log(`Successfully removed product ${product.id} from wishlist`);
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist/check", product.id] });
      refetchWishlistCheck(); // Force immediate refetch
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      });
    },
    onError: (error: any) => {
      console.error("Wishlist remove mutation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove from wishlist",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
      setAddToCartSuccess(true);
      setTimeout(() => setAddToCartSuccess(false), 2000);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Account Required",
        description: "Please sign up or log in to save items and access all features.",
        variant: "default",
        className: "border-primary bg-primary/5 text-primary",
      });
      openLoginModal();
      return;
    }
    
    if (isWishlisted) {
      removeFromWishlist.mutate();
    } else {
      addToWishlist.mutate();
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const isOnSale = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);
  const discountPercentage = isOnSale 
    ? Math.round(((parseFloat(product.originalPrice!) - parseFloat(product.price)) / parseFloat(product.originalPrice!)) * 100)
    : 0;

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-200 h-full">
        <div className="relative overflow-hidden">
          <Link href={`/product/${product.id}`}>
            <a className="block relative">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              
              {/* Interactive overlay with floating action buttons */}
              <div className={`absolute inset-0 bg-black/30 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'} flex items-center justify-center`}>
                <div className="flex gap-3">
                  {showQuickView && (
                    <FloatingActionButton
                      icon={<Eye className="w-4 h-4" />}
                      onClick={handleQuickView}
                      variant="default"
                    />
                  )}
                  <FloatingActionButton
                    icon={<Heart className="w-4 h-4" />}
                    onClick={handleWishlist}
                    variant="wishlist"
                    isActive={isWishlisted}
                  />
                </div>
              </div>

              {/* Animated Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.isFeatured && (
                  <AnimatedBadge variant="featured">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </AnimatedBadge>
                )}
                {product.isBestSeller && (
                  <AnimatedBadge variant="bestseller">
                    Best Seller
                  </AnimatedBadge>
                )}
                {isOnSale && (
                  <AnimatedBadge variant="sale">
                    -{discountPercentage}% OFF
                  </AnimatedBadge>
                )}

              </div>


            </a>
          </Link>
        </div>

        <CardContent className="p-4">
          {/* Era badge */}
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-xs bg-accent/20 text-accent">
              <Calendar className="w-3 h-3 mr-1" />
              {product.era}
            </Badge>
            {product.condition && (
              <Badge variant="outline" className="text-xs">
                {product.condition}
              </Badge>
            )}
          </div>

          <Link href={`/product/${product.id}`}>
            <a className="block">
              <h3 className="font-bold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
                {product.name}
              </h3>
            </a>
          </Link>

          {/* Simple description preview */}
          {product.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
          )}



          {/* Animated price and actions */}
          <div className="flex justify-between items-center">
            <AnimatedPrice 
              currentPrice={parseFloat(product.price)}
              originalPrice={product.originalPrice ? parseFloat(product.originalPrice) : undefined}
            />
            
            <LoadingButton
              onClick={handleAddToCart}
              isLoading={isAddingToCart}
              success={addToCartSuccess}
              disabled={false}
              size="sm"
            >
              <ShoppingCart className="w-4 h-4" />
            </LoadingButton>
          </div>
        </CardContent>
      </Card>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={onAddToCart}
        isAddingToCart={isAddingToCart}
      />
    </div>
  );
};

export default ProductCard;