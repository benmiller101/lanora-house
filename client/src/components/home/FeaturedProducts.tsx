import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { SustainableLoader, SustainableCardSkeleton } from "@/components/ui/SustainableLoader";
import { StaggeredContainer, StaggeredItem } from "@/components/ui/TransitionWrapper";
import { ProductCard } from "@/components/ui/ProductCard";
import { AddToCartNotification } from "@/components/ui/CartMicroInteractions";
import { 
  ResponsiveGrid, 
  ResponsiveText, 
  DeviceSpecificWrapper, 
  MobileOptimizedCard 
} from "@/components/responsive";

export default function FeaturedProducts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationProduct, setNotificationProduct] = useState<string>("");

  const { data: products, isLoading } = useQuery({ 
    queryKey: ['/api/products/featured'],
    queryFn: async () => {
      const res = await fetch('/api/products/featured');
      if (!res.ok) throw new Error('Failed to fetch featured products');
      return res.json() as Promise<Product[]>;
    }
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, productName }: { productId: number; productName: string }) => {
      console.log("🛒 FEATURED: Adding product to cart:", { productId, productName });
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          productId, 
          quantity: 1,
          type: 'product'
        }),
      });
      
      if (!res.ok) {
        const error = await res.text();
        console.log("🛒 FEATURED: Cart API error:", error);
        throw new Error('Failed to add item to cart');
      }
      
      const result = await res.json();
      console.log("🛒 FEATURED: Cart API success:", result);
      return { productId, productName };
    },
    onMutate: ({ productId }) => {
      setAddingToCart(productId);
    },
    onSuccess: ({ productName }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      setNotificationProduct(productName);
      setShowNotification(true);
      setAddingToCart(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || 'Failed to add item to cart',
        variant: "destructive"
      });
      setAddingToCart(null);
    }
  });

  return (
    <>
      <AddToCartNotification 
        show={showNotification}
        productName={notificationProduct}
        onClose={() => setShowNotification(false)}
      />
      
      <section className="py-16 bg-white border-t border-b border-neutral-paper">
      <DeviceSpecificWrapper 
        className="container mx-auto"
        mobileClassName="px-4"
        desktopClassName="px-4"
      >
        <DeviceSpecificWrapper
          className="flex justify-between items-end mb-10"
          mobileClassName="text-center mb-8"
          desktopClassName="flex justify-between items-end mb-10"
        >
          <div>
            <ResponsiveText
              as="h2"
              mobileSize="2xl"
              desktopSize="4xl"
              className="font-display mb-3"
            >
              Featured Treasures
            </ResponsiveText>
            <ResponsiveText
              as="p"
              mobileSize="sm"
              desktopSize="base"
              className="text-neutral-wood opacity-70"
            >
              Handpicked rarities from our curated collection
            </ResponsiveText>
          </div>
          <Link href="/shop">
            <a className="hidden md:flex items-center text-primary hover:text-primary-dark transition-colors font-medium">
              <span>View All</span>
              <i className="ri-arrow-right-line ml-2"></i>
            </a>
          </Link>
        </DeviceSpecificWrapper>
        
        {isLoading ? (
          <div className="text-center py-12">
            <SustainableLoader variant="tree" size="lg" message="Growing our featured treasures..." />
            <ResponsiveGrid
              mobileColumns={1}
              desktopColumns={4}
              mobileGap="md"
              desktopGap="lg"
              className="mt-8"
            >
              {Array(4).fill(0).map((_, index) => (
                <SustainableCardSkeleton key={index} />
              ))}
            </ResponsiveGrid>
          </div>
        ) : (
          <StaggeredContainer>
            <ResponsiveGrid
              mobileColumns={1}
              desktopColumns={4}
              mobileGap="md"
              desktopGap="lg"
            >
              {products?.map((product) => (
                <StaggeredItem key={product.id}>
                  <MobileOptimizedCard
                    mobilePadding="sm"
                    desktopPadding="md"
                    mobileRounded="lg"
                    desktopRounded="xl"
                    mobileShadow="md"
                    desktopShadow="lg"
                    fullWidthOnMobile={true}
                    className="h-full"
                  >
                    <ProductCard 
                      product={product}
                      onAddToCart={(product) => addToCartMutation.mutate({ 
                        productId: product.id, 
                        productName: product.name 
                      })}
                      isAddingToCart={addingToCart === product.id}
                      showQuickView={false}
                      className="h-full border-0 shadow-none bg-transparent"
                    />
                  </MobileOptimizedCard>
                </StaggeredItem>
              ))}
            </ResponsiveGrid>
          </StaggeredContainer>
        )}
        
        <div className="mt-8 text-center md:hidden">
          <Link href="/shop">
            <a className="inline-flex items-center text-primary hover:text-primary-dark transition-colors font-medium">
              <span>View All Products</span>
              <i className="ri-arrow-right-line ml-2"></i>
            </a>
          </Link>
        </div>
      </DeviceSpecificWrapper>
    </section>
    </>
  );
}
