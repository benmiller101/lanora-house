import { useParams, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  FiCalendar,
  FiMapPin,
  FiClock,
  FiArrowLeft,
  FiPackage,
  FiArrowRight
} from "react-icons/fi";
import { Video, PlayCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

type AuctionCatalogue = {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: string;
  imageUrl: string | null;
  location: string | null;
  viewingStartDate: string | null;
  viewingEndDate: string | null;
  auctionType: string | null;
  lots?: AuctionLot[];
};

type AuctionLot = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  lotNumber: number;
  catalogId: string;
  status: string | null;
  era: string | null;
  condition: string | null;
  provenance: string | null;
  estimatedValueLow: string | null;
  estimatedValueHigh: string | null;
};

export default function AuctionCataloguePage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  // Fetch catalogue with its lots
  const { data: catalogue, isLoading } = useQuery<AuctionCatalogue>({
    queryKey: [`/api/auction-catalogues/${id}`],
    enabled: !!id,
  });

  // Fetch live stream for this catalog
  const { data: liveStream } = useQuery({
    queryKey: [`/api/auction-catalogs/${id}/live-stream`],
    enabled: !!id,
    retry: false,
    refetchInterval: 10000,
  });

  // Fetch live auction session for real-time bidding
  const { data: liveSession } = useQuery({
    queryKey: [`/api/auction-catalogs/${id}/live-session`],
    enabled: !!id,
    refetchInterval: 3000, // Refresh every 3 seconds
    retry: false,
  });

  const { toast } = useToast();

  // Mutation for placing a live bid
  const placeBidMutation = useMutation({
    mutationFn: async ({ lotId, bidAmount }: { lotId: string; bidAmount: number }) => {
      return await apiRequest("POST", `/api/auction/lots/${lotId}/bid`, {
        bidAmount: bidAmount.toString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Bid placed successfully!",
        description: "Your bid has been recorded and is now live.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/auction-catalogs/${id}/live-session`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to place bid",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Format date function
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy');
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!catalogue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display mb-4">Catalogue Not Found</h1>
          <Button onClick={() => setLocation('/auctions')} data-testid="button-back-to-auctions">
            <FiArrowLeft className="mr-2" /> Back to Auctions
          </Button>
        </div>
      </div>
    );
  }

  const lots = catalogue.lots || [];

  return (
    <>
      <Helmet>
        <title>{`${catalogue.name} | Auctions | Lanora House`}</title>
        <meta name="description" content={catalogue.description || `View lots in ${catalogue.name} at Lanora House auctions in Cornwall`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://www.lanorahouse.com/auctions/${id}`} />
        <meta property="og:title" content={`${catalogue.name} | Auctions | Lanora House`} />
        <meta property="og:description" content={catalogue.description || `View lots in ${catalogue.name}`} />
        <meta property="og:url" content={`https://www.lanorahouse.com/auctions/${id}`} />
        <meta property="og:type" content="website" />
        {catalogue.imageUrl && <meta property="og:image" content={catalogue.imageUrl} />}
      </Helmet>

      <div className="bg-neutral-ivory dark:bg-neutral-900 min-h-screen">
        {/* Header */}
        <section className="bg-primary text-white py-12">
          <div className="container mx-auto px-4">
            <Button 
              variant="ghost" 
              className="text-white hover:text-white/80 mb-6"
              onClick={() => setLocation('/auctions')}
              data-testid="button-back"
            >
              <FiArrowLeft className="mr-2" /> Back to Auctions
            </Button>
            <div className="max-w-4xl">
              <h1 className="font-display text-4xl md:text-5xl mb-4" data-testid="text-catalogue-title">
                {catalogue.name}
              </h1>
              {catalogue.description && (
                <p className="text-xl opacity-90 mb-6" data-testid="text-catalogue-description">
                  {catalogue.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center" data-testid="text-auction-dates">
                  <FiCalendar className="mr-2" />
                  <span>Auction: {formatDate(catalogue.startDate)} - {formatDate(catalogue.endDate)}</span>
                </div>
                {catalogue.location && (
                  <div className="flex items-center" data-testid="text-location">
                    <FiMapPin className="mr-2" />
                    <span>{catalogue.location}</span>
                  </div>
                )}
                {catalogue.viewingStartDate && catalogue.viewingEndDate && (
                  <div className="flex items-center" data-testid="text-viewing-dates">
                    <FiClock className="mr-2" />
                    <span>Viewing: {formatDate(catalogue.viewingStartDate)} - {formatDate(catalogue.viewingEndDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Live Auction Section - Stream + Current Lot Side by Side */}
        {liveSession?.currentLot && (
          <section className="py-8 bg-white dark:bg-neutral-800">
            <div className="container mx-auto px-4">
              <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  {liveStream && liveStream.status === "live" && (
                    <>
                      <Video className="w-6 h-6 text-primary" />
                      <h2 className="font-display text-2xl" data-testid="text-live-stream-heading">
                        Live Auction
                      </h2>
                      <Badge className="bg-red-500 animate-pulse">
                        <PlayCircle className="w-3 h-3 mr-1" /> LIVE
                      </Badge>
                    </>
                  )}
                  {(!liveStream || liveStream.status !== "live") && (
                    <>
                      <h2 className="font-display text-2xl">Live Auction</h2>
                      <Alert className="flex-1">
                        <Video className="h-4 w-4" />
                        <AlertDescription>
                          Stream is temporarily offline. Bidding continues below.
                        </AlertDescription>
                      </Alert>
                    </>
                  )}
                </div>

                {/* Side by Side Layout */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Left: Live Stream */}
                  {liveStream && liveStream.status === "live" && (
                    <div>
                      <div className="rounded-lg overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 h-full min-h-[600px]">
                        <iframe
                          src={`https://customer-xteyp3xgc98d1gn8.cloudflarestream.com/${liveStream.cloudflareUid}/iframe`}
                          className="w-full h-full"
                          style={{
                            border: "none",
                            minHeight: "600px",
                          }}
                          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                          allowFullScreen={true}
                          data-testid="iframe-live-stream"
                        />
                      </div>
                    </div>
                  )}

                  {/* Right: Current Lot and Bidding */}
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Badge>Lot {liveSession.currentLot.lotNumber}</Badge>
                          <span className="text-lg">Now Selling</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Lot Image and Title */}
                          <div>
                            {liveSession.currentLot.imageUrl && (
                              <div className="aspect-video w-full bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden mb-4">
                                <img 
                                  src={liveSession.currentLot.imageUrl} 
                                  alt={liveSession.currentLot.title}
                                  className="w-full h-full object-cover"
                                  data-testid="img-live-lot"
                                />
                              </div>
                            )}
                            <h3 className="font-display text-2xl mb-4" data-testid="text-live-lot-title">
                              {liveSession.currentLot.title}
                            </h3>
                          </div>

                          {/* Current Bid and Estimate */}
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Current Bid</p>
                              <p className="text-3xl font-bold text-primary" data-testid="text-live-current-bid">
                                £{liveSession.currentLot.currentBid || "0"}
                              </p>
                            </div>
                            {liveSession.currentLot.estimatedValueLow && (
                              <div>
                                <p className="text-sm text-muted-foreground">Estimate</p>
                                <p className="text-lg">
                                  £{liveSession.currentLot.estimatedValueLow} - £{liveSession.currentLot.estimatedValueHigh}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {/* Live Bidding Form */}
                          <div className="border rounded-lg p-4 bg-neutral-50 dark:bg-neutral-900">
                            <h4 className="font-semibold mb-3">Place Your Bid</h4>
                            
                            {/* Quick Bid Button */}
                            <div className="mb-4">
                              <Button 
                                onClick={() => {
                                  const currentBid = parseFloat(liveSession.currentLot.currentBid || "0");
                                  const nextBid = currentBid + 1;
                                  
                                  placeBidMutation.mutate({
                                    lotId: liveSession.currentLot.id,
                                    bidAmount: nextBid,
                                  });
                                }}
                                disabled={placeBidMutation.isPending}
                                className="w-full h-12 text-lg font-semibold"
                                data-testid="button-quick-bid"
                              >
                                {placeBidMutation.isPending 
                                  ? "Placing Bid..." 
                                  : `Bid £${(parseFloat(liveSession.currentLot.currentBid || "0") + 1).toFixed(2)}`
                                }
                              </Button>
                            </div>

                            {/* Manual Bid Entry */}
                            <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                              </div>
                              <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-neutral-50 dark:bg-neutral-900 px-2 text-muted-foreground">
                                  Or enter custom amount
                                </span>
                              </div>
                            </div>
                            
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const bidAmount = formData.get('bidAmount') as string;
                                
                                if (!bidAmount || parseFloat(bidAmount) <= 0) {
                                  toast({
                                    title: "Invalid bid amount",
                                    description: "Please enter a valid bid amount",
                                    variant: "destructive",
                                  });
                                  return;
                                }

                                const currentBid = parseFloat(liveSession.currentLot.currentBid || "0");
                                if (parseFloat(bidAmount) <= currentBid) {
                                  toast({
                                    title: "Bid too low",
                                    description: `Your bid must be higher than £${currentBid}`,
                                    variant: "destructive",
                                  });
                                  return;
                                }

                                placeBidMutation.mutate({
                                  lotId: liveSession.currentLot.id,
                                  bidAmount: parseFloat(bidAmount),
                                });
                              }}
                              className="mt-4"
                            >
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <Input
                                    name="bidAmount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="Enter custom amount"
                                    className="w-full"
                                    data-testid="input-live-bid-amount"
                                  />
                                </div>
                                <Button 
                                  type="submit" 
                                  disabled={placeBidMutation.isPending}
                                  variant="outline"
                                  data-testid="button-place-custom-bid"
                                >
                                  {placeBidMutation.isPending ? "Placing..." : "Bid"}
                                </Button>
                              </div>
                            </form>
                          </div>

                          {/* Recent Bids */}
                          <div>
                            <h4 className="font-semibold mb-3">Recent Bids</h4>
                            {liveSession.currentBids && liveSession.currentBids.length > 0 ? (
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {liveSession.currentBids.map((bid: any, index: number) => (
                                  <div 
                                    key={bid.id} 
                                    className={`p-3 rounded-lg border ${index === 0 ? 'bg-primary/5 border-primary' : 'bg-neutral-50 dark:bg-neutral-800'}`}
                                    data-testid={`live-bid-${index}`}
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="font-semibold text-lg">£{bid.bidAmount}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {format(new Date(bid.createdAt), "HH:mm:ss")}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground text-sm">No bids yet</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Sold Lots Section */}
        {lots.filter(lot => lot.status === 'sold').length > 0 && (
          <section className="py-16 bg-neutral-50 dark:bg-neutral-900">
            <div className="container mx-auto px-4">
              <div className="mb-8">
                <h2 className="font-display text-3xl mb-2 flex items-center gap-2">
                  <Badge variant="secondary" className="text-lg px-3 py-1">SOLD</Badge>
                  <span>Completed Lots ({lots.filter(lot => lot.status === 'sold').length})</span>
                </h2>
                <p className="text-muted-foreground mt-2">Lots that have been successfully sold</p>
                <Separator className="mt-4" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lots.filter(lot => lot.status === 'sold').map((lot: any) => (
                  <Card 
                    key={lot.id} 
                    className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer opacity-90"
                    onClick={() => setLocation(`/auctions/lots/${lot.id}`)}
                    data-testid={`card-sold-lot-${lot.id}`}
                  >
                    <div className="aspect-square w-full bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden">
                      <img 
                        src={lot.imageUrl} 
                        alt={lot.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white text-primary">
                          Lot {lot.lotNumber}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-green-600 text-white">
                          SOLD
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl font-display line-clamp-2">
                        {lot.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3 mb-4">
                        {lot.description}
                      </p>
                      {lot.hammerPrice && (
                        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <p className="text-xs text-green-700 dark:text-green-400 mb-1">Hammer Price</p>
                          <p className="font-bold text-xl text-green-800 dark:text-green-300" data-testid={`text-hammer-price-${lot.id}`}>
                            £{parseFloat(lot.hammerPrice).toFixed(2)}
                          </p>
                        </div>
                      )}
                      <Button variant="outline" className="w-full" data-testid={`button-view-sold-lot-${lot.id}`}>
                        View Details <FiArrowRight className="ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Lots Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="font-display text-3xl mb-2" data-testid="text-lots-heading">
                Catalogue Lots ({lots.filter(lot => lot.status !== 'sold').length})
              </h2>
              <Separator className="mt-4" />
            </div>

            {lots.length === 0 ? (
              <div className="text-center py-16">
                <FiPackage className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
                <p className="text-neutral-600 dark:text-neutral-400 text-lg" data-testid="text-no-lots">
                  No lots available in this catalogue yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lots.filter(lot => lot.status !== 'sold').map((lot) => (
                  <Card 
                    key={lot.id} 
                    className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    onClick={() => setLocation(`/auctions/lots/${lot.id}`)}
                    data-testid={`card-lot-${lot.id}`}
                  >
                    <div className="aspect-square w-full bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden">
                      <img 
                        src={lot.imageUrl} 
                        alt={lot.title}
                        className="w-full h-full object-cover"
                        data-testid={`img-lot-${lot.id}`}
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white text-primary" data-testid={`badge-lot-number-${lot.id}`}>
                          Lot {lot.lotNumber}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl font-display line-clamp-2" data-testid={`text-lot-title-${lot.id}`}>
                        {lot.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3 mb-4" data-testid={`text-lot-desc-${lot.id}`}>
                        {lot.description}
                      </p>
                      {(lot.estimatedValueLow || lot.estimatedValueHigh) && (
                        <div className="mb-4">
                          <p className="text-xs text-neutral-500 dark:text-neutral-500 mb-1">Estimate</p>
                          <p className="font-semibold" data-testid={`text-lot-estimate-${lot.id}`}>
                            {lot.estimatedValueLow && lot.estimatedValueHigh 
                              ? `£${lot.estimatedValueLow} - £${lot.estimatedValueHigh}`
                              : lot.estimatedValueLow 
                              ? `From £${lot.estimatedValueLow}`
                              : `Up to £${lot.estimatedValueHigh}`
                            }
                          </p>
                        </div>
                      )}
                      <Button variant="outline" className="w-full" data-testid={`button-view-lot-${lot.id}`}>
                        View Details <FiArrowRight className="ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
