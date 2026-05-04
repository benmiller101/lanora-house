import { useBasket } from "@/contexts/BasketContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, ShoppingCart } from "lucide-react";
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";

export default function Cart() {
  const { items, removeItem, subtotal } = useBasket();
  const { toast } = useToast();

  const formatPrice = (price: number) => `£${price.toFixed(2)}`;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SEOHead
          title="Shopping Cart - Review Your Items"
          description="Review the items in your shopping cart at Lanora House. Browse antiques, collectibles and unique finds ready for checkout with secure payment."
          path="/cart"
          noindex
        />
        <div className="max-w-4xl mx-auto text-center">
          <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your Basket is Empty</h1>
          <p className="text-gray-600 mb-6">Find some treasures!</p>
          <Link href="/shop">
            <Button>Browse</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SEOHead
        title="Shopping Cart - Review Your Items"
        description="Review the items in your shopping cart at Lanora House. Browse antiques, collectibles and unique finds ready for checkout with secure payment."
        path="/cart"
        noindex
      />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Basket</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.productId}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <Link href={`/product/${item.productId}`}>
                          <h3 className="font-semibold text-lg hover:text-primary cursor-pointer">
                            {item.name}
                          </h3>
                        </Link>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-lg font-semibold min-w-[80px] text-right">
                        £{parseFloat(item.price).toFixed(2)}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          removeItem(item.productId);
                          toast({
                            title: "Item Removed",
                            description: `${item.name} has been removed from your basket.`,
                          });
                        }}
                        data-testid={`button-remove-${item.productId}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold">Order Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">Calculated at checkout</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                </div>
                <Link href="/checkout">
                  <Button className="w-full" size="lg" data-testid="button-checkout">
                    Proceed to Checkout
                  </Button>
                </Link>
                <Link href="/shop">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
