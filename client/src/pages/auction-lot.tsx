import { useParams, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useModals } from "@/contexts/ModalContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  FiArrowLeft,
  FiClock,
  FiInfo,
  FiPackage,
  FiHeart,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiTruck
} from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { getShippingBandDetails } from "@/../../shared/shipping-bands";

type AuctionLot = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  additionalImages?: string[] | null;
  lotNumber: number;
  catalogId: string;
  status: string | null;
  era: string | null;
  condition: string | null;
  provenance: string | null;
  materials: string | null;
  dimensions: string | null;
  weight: string | null;
  estimatedValueLow: string | null;
  estimatedValueHigh: string | null;
  reservePrice: string | null;
  startingBid: string | null;
  notes: string | null;
  shippingBand: string | null;
  createdAt: string;
  updatedAt: string;
};

// Helper function to format shipping details for display
const formatShippingDetails = (bandCode: string | null) => {
  const bandDetails = getShippingBandDetails(bandCode);
  if (!bandDetails) return null;
  
  return {
    title: bandDetails.title,
    price: `£${bandDetails.price.toFixed(2)}`,
    dimensions: bandDetails.dimensions,
    weight: bandDetails.weight,
    description: bandDetails.description
  };
};

export default function AuctionLotPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { openLoginModal } = useModals();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [bidAmount, setBidAmount] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  // Fetch lot details
  const { data: lot, isLoading } = useQuery<AuctionLot>({
    queryKey: [`/api/auction-lots/${id}`],
    enabled: !!id,
  });

  // Combine all images (primary + additional)
  const allImages = lot 
    ? [lot.imageUrl, ...(lot.additionalImages || [])].filter(Boolean)
    : [];

  // Fetch bids for this lot
  const { data: bids = [] } = useQuery({
    queryKey: [`/api/auction/lots/${id}/bids`],
    enabled: !!id,
  });

  // Calculate current (highest) bid from bids array
  const currentBid = bids.length > 0 
    ? Math.max(...bids.map((bid: any) => parseFloat(bid.bidAmount)))
    : 0;

  // Check if lot is in user's wishlist
  const { data: watchingData } = useQuery({
    queryKey: [`/api/auction/lots/${id}/is-watching`],
    enabled: !!id && isAuthenticated,
  });

  const isWatching = watchingData?.isWatching || false;

  // Place bid mutation
  const placeBidMutation = useMutation({
    mutationFn: async (bidData: { bidAmount: number; maxBid?: number; bidType?: string }) => {
      return await apiRequest("POST", `/api/auction/lots/${id}/bid`, bidData);
    },
    onSuccess: () => {
      toast({
        title: "Bid placed successfully!",
        description: "Your bid has been recorded.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/auction-lots/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/auction/lots/${id}/bids`] });
      setBidAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Error placing bid",
        description: error.message || "Failed to place bid",
        variant: "destructive",
      });
    },
  });

  // Watch lot mutation
  const watchLotMutation = useMutation({
    mutationFn: async () => {
      if (isWatching) {
        return await apiRequest("DELETE", `/api/auction/lots/${id}/watch`);
      } else {
        return await apiRequest("POST", `/api/auction/lots/${id}/watch`, {});
      }
    },
    onSuccess: () => {
      toast({
        title: isWatching ? "Removed from watchlist" : "Added to watchlist",
        description: isWatching 
          ? "You'll no longer receive updates about this lot" 
          : "You'll receive updates about this lot",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/auction/lots/${id}/is-watching`] });
      queryClient.invalidateQueries({ queryKey: [`/api/auction/my-wishlist`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update wishlist",
        variant: "destructive",
      });
    },
  });

  const handlePlaceBid = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    const amount = parseFloat(bidAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid bid amount",
        description: "Please enter a valid bid amount",
        variant: "destructive",
      });
      return;
    }

    if (amount <= currentBid) {
      toast({
        title: "Bid too low",
        description: `Your bid must be higher than the current bid of £${currentBid.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }

    placeBidMutation.mutate({ 
      bidAmount: amount,
      bidType: 'standard'
    });
  };

  const handleWatch = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    watchLotMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display mb-4">Lot Not Found</h1>
          <Button onClick={() => setLocation('/auctions')} data-testid="button-back-to-auctions">
            <FiArrowLeft className="mr-2" /> Back to Auctions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Lot ${lot.lotNumber}: ${lot.title} | Lanora House`}</title>
        <meta name="description" content={lot.description?.substring(0, 155)} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://www.lanorahouse.com/auctions/lots/${id}`} />
        <meta property="og:title" content={`Lot ${lot.lotNumber}: ${lot.title} | Lanora House`} />
        <meta property="og:description" content={lot.description?.substring(0, 155)} />
        <meta property="og:url" content={`https://www.lanorahouse.com/auctions/lots/${id}`} />
        <meta property="og:type" content="product" />
        {lot.imageUrl && <meta property="og:image" content={lot.imageUrl} />}
      </Helmet>

      <div className="bg-neutral-ivory dark:bg-neutral-900 min-h-screen pb-16">
        {/* Header */}
        <section className="bg-primary text-white py-8">
          <div className="container mx-auto px-4">
            <Button 
              variant="ghost" 
              className="text-white hover:text-white/80 mb-4"
              onClick={() => setLocation(`/auctions/${lot.catalogId}`)}
              data-testid="button-back-to-catalogue"
            >
              <FiArrowLeft className="mr-2" /> Back to Catalogue
            </Button>
          </div>
        </section>

        {/* Lot Details */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Gallery */}
              <div>
                <Card className="overflow-hidden">
                  <div 
                    className="aspect-square w-full bg-neutral-100 dark:bg-neutral-800 relative cursor-zoom-in group"
                    onClick={() => setIsImageDialogOpen(true)}
                  >
                    <img 
                      src={allImages[selectedImageIndex]} 
                      alt={lot.title}
                      className="w-full h-full object-contain p-4"
                      data-testid="img-lot-main"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="text-lg px-4 py-1" data-testid="badge-lot-number">
                        Lot {lot.lotNumber}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImageIndex + 1} / {allImages.length}
                    </div>
                    
                    {/* Navigation Arrows */}
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                          data-testid="button-prev-main-image"
                        >
                          <FiChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                          data-testid="button-next-main-image"
                        >
                          <FiChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}
                  </div>
                </Card>
                
                {/* Thumbnails */}
                {allImages.length > 1 && (
                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {allImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index 
                            ? 'border-primary ring-2 ring-primary' 
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-primary/50'
                        }`}
                        data-testid={`button-thumbnail-${index}`}
                      >
                        <img 
                          src={image} 
                          alt={`${lot.title} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div>
                <div className="mb-6">
                  <h1 className="font-display text-4xl mb-4" data-testid="text-lot-title">
                    {lot.title}
                  </h1>
                  
                  {(lot.estimatedValueLow || lot.estimatedValueHigh) && (
                    <div className="mb-4">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Estimated Value</p>
                      <p className="text-3xl font-semibold text-primary" data-testid="text-lot-estimate">
                        {lot.estimatedValueLow && lot.estimatedValueHigh 
                          ? `£${lot.estimatedValueLow} - £${lot.estimatedValueHigh}`
                          : lot.estimatedValueLow 
                          ? `From £${lot.estimatedValueLow}`
                          : `Up to £${lot.estimatedValueHigh}`
                        }
                      </p>
                    </div>
                  )}

                  {lot.startingBid && (
                    <div className="mb-6">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Starting Bid</p>
                      <p className="text-2xl font-semibold" data-testid="text-lot-starting-bid">
                        £{lot.startingBid}
                      </p>
                    </div>
                  )}
                </div>

                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="description" data-testid="tab-description">Description</TabsTrigger>
                    <TabsTrigger value="details" data-testid="tab-details">Details</TabsTrigger>
                    <TabsTrigger value="shipping" data-testid="tab-shipping">Shipping</TabsTrigger>
                    <TabsTrigger value="delivery" data-testid="tab-delivery">Delivery</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="description" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <FiInfo className="mr-2" />
                          Description
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-line" data-testid="text-lot-description">
                          {lot.description}
                        </p>
                        {lot.provenance && (
                          <>
                            <Separator className="my-4" />
                            <div>
                              <h3 className="font-semibold mb-2">Provenance</h3>
                              <p className="text-neutral-700 dark:text-neutral-300" data-testid="text-lot-provenance">
                                {lot.provenance}
                              </p>
                            </div>
                          </>
                        )}
                        {lot.notes && (
                          <>
                            <Separator className="my-4" />
                            <div>
                              <h3 className="font-semibold mb-2">Additional Notes</h3>
                              <p className="text-neutral-700 dark:text-neutral-300" data-testid="text-lot-notes">
                                {lot.notes}
                              </p>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="details" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <FiPackage className="mr-2" />
                          Lot Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {lot.era && (
                          <div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Era</p>
                            <p className="font-medium" data-testid="text-lot-era">{lot.era}</p>
                          </div>
                        )}
                        {lot.condition && (
                          <div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Condition</p>
                            <p className="font-medium" data-testid="text-lot-condition">{lot.condition}</p>
                          </div>
                        )}
                        {lot.materials && (
                          <div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Materials</p>
                            <p className="font-medium" data-testid="text-lot-materials">{lot.materials}</p>
                          </div>
                        )}
                        {lot.dimensions && (
                          <div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Dimensions</p>
                            <p className="font-medium" data-testid="text-lot-dimensions">{lot.dimensions}</p>
                          </div>
                        )}
                        {lot.weight && (
                          <div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Weight</p>
                            <p className="font-medium" data-testid="text-lot-weight">{lot.weight}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="shipping" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <FiPackage className="mr-2" />
                          Shipping Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Introduction */}
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <h3 className="font-semibold text-lg mb-2 text-neutral-900 dark:text-white">Lanora House Auction – Transparent & Fair Shipping</h3>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              At Lanora House Auction we pride ourselves on transparent and fair shipping, offering a wide range of shipping bands to ensure you are charged fairly based on size and weight. These shipping bands are clearly displayed on each lot.
                            </p>
                          </div>

                          {/* This Lot's Shipping Band */}
                          {lot.shippingBand && (() => {
                            const shippingInfo = formatShippingDetails(lot.shippingBand);
                            return shippingInfo ? (
                              <div className="bg-primary/5 border-2 border-primary rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-2">THIS LOT'S SHIPPING BAND</h4>
                                <div>
                                  <p className="text-lg font-semibold text-primary mb-1" data-testid="text-shipping-title">
                                    {shippingInfo.title}
                                  </p>
                                  <p className="text-2xl font-bold text-neutral-900 dark:text-white mb-2" data-testid="text-shipping-price">
                                    {shippingInfo.price}
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-3">
                                  <div>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Maximum Dimensions</p>
                                    <p className="font-medium" data-testid="text-shipping-dimensions">{shippingInfo.dimensions}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Maximum Weight</p>
                                    <p className="font-medium" data-testid="text-shipping-weight">{shippingInfo.weight}</p>
                                  </div>
                                </div>
                              </div>
                            ) : null;
                          })()}

                          {/* Pallet Shipping Option */}
                          <div>
                            <h4 className="font-semibold text-lg mb-3 text-neutral-900 dark:text-white">Pallet Shipping Option</h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                              For larger or heavier items, or when multiple lots are purchased, it may be more cost-effective to send your items on a pallet rather than individually boxed parcels.
                            </p>
                            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Pallet shipping is ideal for:</p>
                              <ul className="list-disc list-inside space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                                <li>Stone and ceramics</li>
                                <li>Tools, machinery, metal goods</li>
                                <li>Heavy items</li>
                                <li>Bulky or oversized lots</li>
                                <li>Multiple lots being combined</li>
                                <li>Items unsafe or uneconomical to ship via parcel courier</li>
                              </ul>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-3">
                                If pallet delivery will save you money, we will notify you. If you can receive a pallet at your address, please let us know and we can arrange this for you.
                              </p>
                            </div>
                          </div>

                          {/* Local Delivery */}
                          <div>
                            <h4 className="font-semibold text-lg mb-3 text-neutral-900 dark:text-white">Local Delivery Available</h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                              We also offer local delivery directly to your door.
                            </p>
                            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Local Areas:</span>
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">Cornwall & Devon</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Rate:</span>
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">£1.20 per mile</span>
                              </div>
                              <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
                                Calculated from our Hayle auction house.
                              </p>
                            </div>
                          </div>

                          {/* Delivery Times */}
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-base mb-2 text-neutral-900 dark:text-white">Delivery Times</h4>
                              <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                                <p>We aim to dispatch all items within <strong className="text-neutral-900 dark:text-white">5 working days</strong> of payment.</p>
                                <p>During busy periods, please allow up to <strong className="text-neutral-900 dark:text-white">10 working days</strong>.</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">For urgent deliveries, contact us for an expedited quote.</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-base mb-2 text-neutral-900 dark:text-white">Tracking</h4>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                A tracking number will be emailed to you once your parcel has been dispatched.
                              </p>
                            </div>
                          </div>

                          {/* International Shipping */}
                          <div>
                            <h4 className="font-semibold text-lg mb-2 text-neutral-900 dark:text-white">International Shipping</h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                              Yes, we ship internationally.
                            </p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              Please email <a href="mailto:info@lanorahouse.com" className="text-primary hover:underline font-medium">info@lanorahouse.com</a> with your lot number and full delivery address, and we will provide a custom international shipping quote.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="delivery" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <FiTruck className="mr-2" />
                          Local Delivery Service
                        </CardTitle>
                        <CardDescription>
                          We offer local delivery for purchased items based on your location
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                            <p className="text-sm text-neutral-700 dark:text-neutral-300">
                              Our delivery service covers the South West region with mileage-based pricing. Choose the tier that matches your location below.
                            </p>
                          </div>
                          
                          <div className="space-y-3">
                            {/* Tier 1 - Local */}
                            <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-semibold text-lg text-neutral-900 dark:text-white" data-testid="text-delivery-tier1-name">
                                    Tier 1 – Local
                                  </h3>
                                  <p className="text-sm text-neutral-600 dark:text-neutral-400" data-testid="text-delivery-tier1-area">
                                    Cornwall, Devon
                                  </p>
                                </div>
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" data-testid="badge-delivery-tier1-rate">
                                  £1.20/mile
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Tier 2 - Regional */}
                            <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-semibold text-lg text-neutral-900 dark:text-white" data-testid="text-delivery-tier2-name">
                                    Tier 2 – Regional
                                  </h3>
                                  <p className="text-sm text-neutral-600 dark:text-neutral-400" data-testid="text-delivery-tier2-area">
                                    Somerset, Dorset
                                  </p>
                                </div>
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" data-testid="badge-delivery-tier2-rate">
                                  £1.50/mile
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Tier 3 - Extended */}
                            <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-semibold text-lg text-neutral-900 dark:text-white" data-testid="text-delivery-tier3-name">
                                    Tier 3 – Extended
                                  </h3>
                                  <p className="text-sm text-neutral-600 dark:text-neutral-400" data-testid="text-delivery-tier3-area">
                                    Wiltshire, Gloucestershire
                                  </p>
                                </div>
                                <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100" data-testid="badge-delivery-tier3-rate">
                                  £2.00/mile
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Tier 4 - National */}
                            <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-semibold text-lg text-neutral-900 dark:text-white" data-testid="text-delivery-tier4-name">
                                    Tier 4 – National
                                  </h3>
                                  <p className="text-sm text-neutral-600 dark:text-neutral-400" data-testid="text-delivery-tier4-area">
                                    All other areas (South Wales, Hampshire, etc.)
                                  </p>
                                </div>
                                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100" data-testid="badge-delivery-tier4-rate">
                                  Quote Required
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              <strong>How it works:</strong> Delivery costs are calculated based on the straight-line distance from our location in Hayle, Cornwall (TR27 4AB) to your delivery address. For Tier 4 deliveries or large/fragile items, please contact us for a custom quote.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Bidding Section */}
                <div className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Place Your Bid</CardTitle>
                      <CardDescription>
                        {currentBid > 0
                          ? `Current bid: £${currentBid.toFixed(2)}` 
                          : "No bids yet - be the first!"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="bid-amount">Your Bid (£)</Label>
                          <Input
                            id="bid-amount"
                            type="number"
                            placeholder="Enter your bid"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            min={currentBid + 1}
                            step="1"
                            data-testid="input-bid-amount"
                          />
                        </div>
                        <div className="flex gap-4">
                          <Button 
                            size="lg" 
                            className="flex-1" 
                            onClick={handlePlaceBid}
                            disabled={placeBidMutation.isPending}
                            data-testid="button-place-bid"
                          >
                            {placeBidMutation.isPending ? "Placing..." : "Place Bid"}
                          </Button>
                          <Button 
                            size="lg" 
                            variant="outline" 
                            className="flex-1" 
                            onClick={handleWatch}
                            disabled={watchLotMutation.isPending}
                            data-testid="button-watch-lot"
                          >
                            <FiHeart className={`mr-2 ${isWatching ? 'fill-current text-red-500' : ''}`} /> 
                            {isWatching ? "Watching" : "Watch Lot"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Bid History */}
                {bids && bids.length > 0 && (
                  <div className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <FiUser className="mr-2" />
                          Bid History ({bids.length} {bids.length === 1 ? 'bid' : 'bids'})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {bids.slice(0, 5).map((bid: any, index: number) => (
                            <div 
                              key={bid.id} 
                              className={`flex justify-between items-center p-3 rounded-lg ${
                                index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                              }`}
                            >
                              <span className="font-semibold">
                                {index === 0 && "🏆 "}£{parseFloat(bid.bidAmount).toFixed(2)}
                              </span>
                              <span className="text-sm text-neutral-600">
                                {new Date(bid.createdAt).toLocaleDateString()} {new Date(bid.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Image Zoom Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          <div className="relative w-full h-[90vh] bg-black">
            <img 
              src={allImages[selectedImageIndex]} 
              alt={lot.title}
              className="w-full h-full object-contain"
              data-testid="img-lot-zoom"
            />
            
            {/* Navigation Buttons */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full transition-all"
                  data-testid="button-prev-image"
                >
                  <FiChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full transition-all"
                  data-testid="button-next-image"
                >
                  <FiChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            
            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
              {selectedImageIndex + 1} / {allImages.length}
            </div>
            
            {/* Close Button */}
            <button
              onClick={() => setIsImageDialogOpen(false)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-all"
              data-testid="button-close-zoom"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
