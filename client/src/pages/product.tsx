import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useModals } from "@/contexts/ModalContext";
import { useBasket } from "@/contexts/BasketContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { FiImage, FiArrowLeft } from "react-icons/fi";
import { Send, Tag } from "lucide-react";
import { Link } from "wouter";

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
  dimensions?: string;
  origin?: string;
  provenance?: string;
  imageUrl?: string;
  additionalImages?: string[];
  inStock?: boolean;
  stockQuantity?: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
};

export default function ProductPage() {
  const [, params] = useRoute("/product/:id");
  const productId = params?.id;
  const [, setLocation] = useLocation();
  
  const [offerAmount, setOfferAmount] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const { isAuthenticated } = useAuth();
  const { openLoginModal } = useModals();
  const { addItem, isInBasket } = useBasket();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });

  const addToCartMutation = useMutation({
    mutationFn: async (data: { productId: number; quantity: number }) => {
      return apiRequest("POST", "/api/cart", {
        productId: data.productId,
        quantity: data.quantity,
        type: "product",
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to Basket",
        description: `${product?.name} has been added to your basket.`,
      });
      qc.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to basket.",
        variant: "destructive",
      });
    },
  });

  const createOfferMutation = useMutation({
    mutationFn: async (data: { productId: number; offerAmount: string; message: string }) => {
      return apiRequest("POST", `/api/products/${data.productId}/offers`, {
        offerAmount: data.offerAmount,
        message: data.message,
      });
    },
    onSuccess: () => {
      toast({
        title: "Offer Submitted!",
        description: "Your offer has been sent. You can track it in your Members Portal.",
      });
      setIsOfferDialogOpen(false);
      setOfferAmount("");
      setOfferMessage("");
      qc.invalidateQueries({ queryKey: ["/api/users/me/offers"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit offer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatPrice = (price: string | number | undefined) => {
    if (price === undefined || price === null) return "£0.00";
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numPrice)) return "£0.00";
    return `£${numPrice.toFixed(2)}`;
  };

  const handleMakeOffer = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login or create an account to make an offer.",
      });
      openLoginModal();
      return;
    }
    setIsOfferDialogOpen(true);
  };

  const handleBuyNow = () => {
    if (!product) return;
    // Go straight to checkout - allow guest checkout
    setLocation(`/checkout?productId=${product.id}`);
  };

  const handleAddToBasket = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    toast({
      title: "Added to Basket",
      description: `${product.name} has been added to your basket.`,
    });
  };

  const handleSubmitOffer = () => {
    if (!product || !offerAmount) {
      toast({
        title: "Error",
        description: "Please enter an offer amount.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(offerAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid offer amount.",
        variant: "destructive",
      });
      return;
    }

    createOfferMutation.mutate({
      productId: product.id,
      offerAmount: amount.toFixed(2),
      message: offerMessage,
    });
  };

  const allImages = product ? [product.imageUrl, ...(product.additionalImages || [])].filter(Boolean) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Link href="/shop">
            <Button>
              <FiArrowLeft className="mr-2" />
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${product.name} | Lanora House Shop`}</title>
        <meta name="description" content={product.description?.substring(0, 155)} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://www.lanorahouse.com/product/${id}`} />
        <meta property="og:title" content={`${product.name} | Lanora House Shop`} />
        <meta property="og:description" content={product.description?.substring(0, 155)} />
        <meta property="og:url" content={`https://www.lanorahouse.com/product/${id}`} />
        <meta property="og:type" content="product" />
        {product.imageUrl && <meta property="og:image" content={product.imageUrl} />}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.description,
            "image": product.imageUrl,
            "offers": {
              "@type": "Offer",
              "price": product.price,
              "priceCurrency": "GBP",
              "availability": "https://schema.org/InStock"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Link href="/shop">
            <Button variant="ghost" className="mb-6">
              <FiArrowLeft className="mr-2" />
              Back to Shop
            </Button>
          </Link>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
                {allImages[selectedImage] ? (
                  <img
                    src={allImages[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiImage className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                {product.isFeatured && (
                  <Badge className="absolute top-4 left-4 bg-primary">Featured</Badge>
                )}
                {product.isBestSeller && (
                  <Badge className="absolute top-4 right-4 bg-amber-500">Best Seller</Badge>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 rounded-md overflow-hidden border-2 flex-shrink-0 ${
                        selectedImage === idx ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                {product.categoryName && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                    <Tag className="w-4 h-4" />
                    {product.categoryName}
                  </div>
                )}
                {product.sku && (
                  <p className="text-sm text-gray-400">SKU: {product.sku}</p>
                )}
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary" data-testid="text-product-price">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleBuyNow}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90"
                  data-testid="button-buy-now"
                >
                  Buy Now
                </Button>
                <Button
                  onClick={handleAddToBasket}
                  size="lg"
                  variant="outline"
                  className="w-full"
                  disabled={isInBasket(product.id)}
                  data-testid="button-add-basket"
                >
                  {isInBasket(product.id) ? "In Basket" : "Add to Basket"}
                </Button>
                <Button
                  onClick={handleMakeOffer}
                  size="lg"
                  variant="outline"
                  className="w-full"
                  data-testid="button-make-offer"
                >
                  Make an Offer
                </Button>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg mb-3">Description</h3>
                <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
              </div>

              {(product.era || product.condition || product.materials || product.dimensions || product.origin) && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-3">Details</h3>
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    {product.era && (
                      <>
                        <dt className="text-gray-500">Era</dt>
                        <dd className="text-gray-900">{product.era}</dd>
                      </>
                    )}
                    {product.condition && (
                      <>
                        <dt className="text-gray-500">Condition</dt>
                        <dd className="text-gray-900">{product.condition}</dd>
                      </>
                    )}
                    {product.materials && product.materials.length > 0 && (
                      <>
                        <dt className="text-gray-500">Materials</dt>
                        <dd className="text-gray-900">{product.materials.join(", ")}</dd>
                      </>
                    )}
                    {product.dimensions && (
                      <>
                        <dt className="text-gray-500">Dimensions</dt>
                        <dd className="text-gray-900">{product.dimensions}</dd>
                      </>
                    )}
                    {product.origin && (
                      <>
                        <dt className="text-gray-500">Origin</dt>
                        <dd className="text-gray-900">{product.origin}</dd>
                      </>
                    )}
                  </dl>
                </div>
              )}

              {product.provenance && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-3">Provenance</h3>
                  <p className="text-gray-600">{product.provenance}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Make an Offer
            </DialogTitle>
            <DialogDescription>
              Submit your offer for this item. The seller will review and respond.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                  <FiImage className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div>
                <h4 className="font-medium">{product.name}</h4>
                <p className="text-sm text-gray-500">
                  Listed price: {formatPrice(product.price)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="offerAmount">Your Offer (£)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">£</span>
                <Input
                  id="offerAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  className="pl-7"
                  data-testid="input-offer-amount"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="offerMessage">Message (optional)</Label>
              <Textarea
                id="offerMessage"
                placeholder="Add a message to the seller..."
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                rows={3}
                data-testid="input-offer-message"
              />
            </div>

            <div className="bg-[#A6C1E4]/30 border border-[#2D317C]/30 rounded-lg p-3">
              <p className="text-sm text-[#2D317C]">
                <strong>*</strong> If your offer is accepted, you will have <strong>48 hours</strong> to complete payment. After this time, the offer will expire.
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleSubmitOffer}
              disabled={createOfferMutation.isPending || !offerAmount}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-submit-offer"
            >
              {createOfferMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Offer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
