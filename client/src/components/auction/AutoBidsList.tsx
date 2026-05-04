import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { FiTrash, FiEye, FiClock, FiAlertTriangle } from "react-icons/fi";
import { LoaderCircle, FolderOpen } from "lucide-react";

interface AutoBid {
  id: number;
  userId: string;
  auctionId?: string;
  catalogItemId?: string;
  maxAmount: string;
  currentAmount: string;
  isActive: boolean;
  paymentMethodId: number;
  createdAt: string;
  updatedAt: string;
  catalogItem?: {
    id: string;
    lotTitle: string;
    lotNumber: string;
    estimatedValue: string;
    imageUrl: string;
  };
  paymentMethod?: {
    id: number;
    cardBrand: string;
    cardLast4: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
  };
}

export default function AutoBidsList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    setLocation("/api/login");
    return null;
  }

  // Fetch auto bids
  const { data: autoBids, isLoading, error } = useQuery({
    queryKey: ["/api/auto-bids"],
    retry: false,
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => 
      apiRequest("PATCH", `/api/auto-bids/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auto-bids"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating auto-bid",
        description: error.message || "There was a problem updating your auto-bid.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/auto-bids/${id}`),
    onSuccess: () => {
      toast({
        title: "Auto-bid deleted",
        description: "Your auto-bid has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auto-bids"] });
      setDeletingId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting auto-bid",
        description: error.message || "There was a problem removing your auto-bid.",
        variant: "destructive",
      });
      setDeletingId(null);
    },
  });

  // Handle toggle active
  const handleToggleActive = (id: number, currentValue: boolean) => {
    toggleActiveMutation.mutate({ id, isActive: !currentValue });
  };

  // Handle delete
  const handleDelete = (id: number) => {
    setDeletingId(id);
  };

  // Confirm deletion
  const confirmDelete = () => {
    if (deletingId !== null) {
      deleteMutation.mutate(deletingId);
    }
  };

  // View lot detail
  const viewLotDetail = (lotId: string) => {
    setLocation(`/lot/${lotId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-start justify-between border-b pb-4">
                  <div className="flex items-start space-x-4">
                    <Skeleton className="h-16 w-16 rounded" />
                    <div>
                      <Skeleton className="h-5 w-64 mb-2" />
                      <Skeleton className="h-4 w-40 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
          <p className="font-medium">Error loading auto-bids</p>
          <p className="text-sm">Please try again or contact support.</p>
        </div>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/auto-bids"] })}>
          Try Again
        </Button>
      </div>
    );
  }

  const hasAutoBids = autoBids && autoBids.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Your Auto Bids</h3>
      </div>

      {hasAutoBids ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {autoBids.map((bid: AutoBid) => (
                <div 
                  key={bid.id} 
                  className="flex flex-col md:flex-row md:items-center justify-between border-b pb-6 last:border-0 last:pb-0"
                >
                  <div className="flex items-start space-x-4">
                    {bid.catalogItem?.imageUrl ? (
                      <img 
                        src={bid.catalogItem.imageUrl} 
                        alt={bid.catalogItem.lotTitle}
                        className="h-16 w-16 object-cover rounded"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-gray-100 flex items-center justify-center rounded">
                        <FolderOpen className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium">{bid.catalogItem?.lotTitle || "Auction Lot"}</h4>
                      <p className="text-sm text-muted-foreground">
                        Lot #{bid.catalogItem?.lotNumber || "N/A"} • Max bid: {formatCurrency(parseFloat(bid.maxAmount))}
                      </p>
                      <div className="flex items-center mt-1 text-sm">
                        <FiClock className="mr-1 h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Added {new Date(bid.createdAt).toLocaleDateString()}</span>
                      </div>
                      {bid.paymentMethod && (
                        <div className="flex items-center mt-1 text-xs">
                          <span className="text-muted-foreground">Payment: {bid.paymentMethod.cardBrand} •••• {bid.paymentMethod.cardLast4}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-4 md:mt-0">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={bid.isActive}
                        onCheckedChange={() => handleToggleActive(bid.id, bid.isActive)}
                        disabled={toggleActiveMutation.isPending}
                      />
                      <span className={`text-sm ${bid.isActive ? "text-green-600" : "text-muted-foreground"}`}>
                        {bid.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => viewLotDetail(bid.catalogItemId || "")}
                      disabled={!bid.catalogItemId}
                    >
                      <FiEye className="h-4 w-4" />
                    </Button>
                    <AlertDialog open={deletingId === bid.id} onOpenChange={(open) => !open && setDeletingId(null)}>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(bid.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <FiTrash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Auto-Bid</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove this auto-bid? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-red-500 hover:bg-red-600"
                            onClick={confirmDelete}
                          >
                            {deleteMutation.isPending ? (
                              <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              "Delete"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex items-start space-x-2 text-sm text-amber-600">
              <FiAlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                Auto-bids place bids on your behalf up to your maximum amount. You'll receive notifications for outbids or wins.
              </p>
            </div>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 pb-4 text-center">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="rounded-full bg-muted p-3 mb-4">
                <FiClock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium mb-1">No Auto-Bids Set Up</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                You haven't set up any auto-bids yet. Browse upcoming auctions and set up auto-bids to ensure you don't miss out on items you want.
              </p>
              <Button 
                onClick={() => setLocation("/auctions")}
                className="mt-2"
              >
                Browse Upcoming Auctions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}