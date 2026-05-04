import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { 
  Play, 
  Pause, 
  SkipForward, 
  Gavel, 
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { AdminNavigation } from "@/components/admin/AdminNavigation";

type AuctionLot = {
  id: string;
  lotNumber: number;
  title: string;
  description: string;
  imageUrl: string;
  currentBid: string | null;
  estimatedValueLow: string | null;
  estimatedValueHigh: string | null;
  status: string;
};

type AuctionBid = {
  id: string;
  userId: string;
  bidAmount: string;
  createdAt: string;
};

type LiveAuctionSession = {
  id: number;
  catalogId: string;
  currentLotId: string | null;
  status: string;
  startedAt: string | null;
};

export default function LiveAuctionControl() {
  const { catalogId } = useParams<{ catalogId: string }>();
  const { toast } = useToast();
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);

  const { data: auctionData, refetch } = useQuery({
    queryKey: [`/api/admin/live-auctions/catalog/${catalogId}`],
    enabled: !!catalogId,
    refetchInterval: 3000,
  });

  const session: LiveAuctionSession | undefined = auctionData?.session;
  const currentLot: AuctionLot | null = auctionData?.currentLot || null;
  const lots: AuctionLot[] = auctionData?.lots || [];
  const recentBids: AuctionBid[] = auctionData?.recentBids || [];

  const startAuctionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/admin/live-auctions", {
        catalogId,
        status: "active",
      });
    },
    onSuccess: () => {
      toast({ title: "Auction started successfully!" });
      refetch();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to start auction", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const changeLotMutation = useMutation({
    mutationFn: async (lotId: string) => {
      return await apiRequest("PATCH", `/api/admin/live-auctions/${session?.id}/lot`, {
        lotId,
      });
    },
    onSuccess: () => {
      toast({ title: "Lot changed successfully!" });
      refetch();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to change lot", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return await apiRequest("PATCH", `/api/admin/live-auctions/${session?.id}/status`, {
        status,
      });
    },
    onSuccess: () => {
      toast({ title: "Auction status updated!" });
      refetch();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update status", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const acceptHammerMutation = useMutation({
    mutationFn: async ({ lotId, winnerId, hammerPrice }: any) => {
      return await apiRequest(
        "PATCH",
        `/api/admin/live-auctions/${session?.id}/lots/${lotId}/hammer`, 
        { winnerId, hammerPrice }
      );
    },
    onSuccess: () => {
      toast({ title: "Hammer price accepted! Lot sold." });
      refetch();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to accept hammer", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleNextLot = () => {
    if (!currentLot) return;
    const currentIndex = lots.findIndex((lot) => lot.id === currentLot.id);
    if (currentIndex < lots.length - 1) {
      changeLotMutation.mutate(lots[currentIndex + 1].id);
    }
  };

  const handleAcceptBid = (bid: AuctionBid) => {
    if (!currentLot) return;
    acceptHammerMutation.mutate({
      lotId: currentLot.id,
      winnerId: bid.userId,
      hammerPrice: bid.bidAmount,
    });
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <AdminNavigation />
        <div className="container mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Start Live Auction</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                No active auction session. Start the auction to begin accepting bids.
              </p>
              <Button
                onClick={() => startAuctionMutation.mutate()}
                disabled={startAuctionMutation.isPending}
                data-testid="button-start-auction"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Auction
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNavigation />
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display" data-testid="text-live-auction-title">
          Live Auction Control
        </h1>
        <div className="flex gap-2">
          {session.status === "active" && (
            <Button
              variant="outline"
              onClick={() => updateStatusMutation.mutate("paused")}
              disabled={updateStatusMutation.isPending}
              data-testid="button-pause-auction"
            >
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
          )}
          {session.status === "paused" && (
            <Button
              variant="outline"
              onClick={() => updateStatusMutation.mutate("active")}
              disabled={updateStatusMutation.isPending}
              data-testid="button-resume-auction"
            >
              <Play className="mr-2 h-4 w-4" />
              Resume
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={() => updateStatusMutation.mutate("completed")}
            disabled={updateStatusMutation.isPending}
            data-testid="button-end-auction"
          >
            End Auction
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Current Lot</CardTitle>
              <Badge 
                variant={session.status === "active" ? "default" : "secondary"}
                data-testid="badge-auction-status"
              >
                {session.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentLot ? (
              <>
                <div className="aspect-video bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
                  <img 
                    src={currentLot.imageUrl} 
                    alt={currentLot.title}
                    className="w-full h-full object-cover"
                    data-testid="img-current-lot"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>Lot {currentLot.lotNumber}</Badge>
                    <h3 className="text-2xl font-display" data-testid="text-current-lot-title">
                      {currentLot.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground mb-4" data-testid="text-current-lot-description">
                    {currentLot.description}
                  </p>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Bid</p>
                      <p className="text-2xl font-bold text-primary" data-testid="text-current-bid">
                        £{currentLot.currentBid || "0"}
                      </p>
                    </div>
                    {currentLot.estimatedValueLow && currentLot.estimatedValueHigh && (
                      <div>
                        <p className="text-sm text-muted-foreground">Estimate</p>
                        <p className="text-lg" data-testid="text-estimate">
                          £{currentLot.estimatedValueLow} - £{currentLot.estimatedValueHigh}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button
                    onClick={handleNextLot}
                    disabled={changeLotMutation.isPending}
                    data-testid="button-next-lot"
                  >
                    <SkipForward className="mr-2 h-4 w-4" />
                    Next Lot
                  </Button>
                </div>
              </>
            ) : (
              <Alert>
                <AlertDescription>
                  Select a lot from the list to begin auctioning.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Live Bids
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentBids.length > 0 ? (
              <div className="space-y-2">
                {recentBids.map((bid) => (
                  <div 
                    key={bid.id} 
                    className="p-3 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    data-testid={`bid-${bid.id}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-lg">£{bid.bidAmount}</span>
                      <Button
                        size="sm"
                        onClick={() => handleAcceptBid(bid)}
                        disabled={acceptHammerMutation.isPending}
                        data-testid={`button-accept-bid-${bid.id}`}
                      >
                        <Gavel className="mr-1 h-3 w-3" />
                        Accept
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(bid.createdAt), "HH:mm:ss")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm" data-testid="text-no-bids">
                No bids yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Lots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lots.map((lot) => (
              <div
                key={lot.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  currentLot?.id === lot.id
                    ? "border-primary bg-primary/5"
                    : "hover:border-neutral-300 dark:hover:border-neutral-700"
                }`}
                onClick={() => changeLotMutation.mutate(lot.id)}
                data-testid={`lot-card-${lot.id}`}
              >
                <div className="flex gap-3">
                  <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={lot.imageUrl} 
                      alt={lot.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        Lot {lot.lotNumber}
                      </Badge>
                      {lot.status === "sold" && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Sold
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-sm truncate" title={lot.title}>
                      {lot.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Current: £{lot.currentBid || "0"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
