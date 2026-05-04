import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function AdminOffersPage() {
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [counterOfferAmount, setCounterOfferAmount] = useState("");
  const [counterOfferMessage, setCounterOfferMessage] = useState("");
  const [counterOfferDialogOpen, setCounterOfferDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingOffers = [], isLoading } = useQuery({
    queryKey: ['/api/admin/offers/pending'],
    refetchInterval: 30000,
  });

  const acceptOfferMutation = useMutation({
    mutationFn: (offerId: number) => 
      apiRequest("POST", `/api/offers/${offerId}/accept`),
    onSuccess: () => {
      toast({
        title: "Offer Accepted",
        description: "The offer has been accepted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/offers/pending'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to accept offer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectOfferMutation = useMutation({
    mutationFn: ({ offerId, adminResponse }: { offerId: number; adminResponse: string }) =>
      apiRequest("POST", `/api/offers/${offerId}/reject`, { adminResponse }),
    onSuccess: () => {
      toast({
        title: "Offer Rejected",
        description: "The offer has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/offers/pending'] });
      setSelectedOffer(null);
      setRejectReason("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reject offer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const counterOfferMutation = useMutation({
    mutationFn: ({ offerId, counterOfferAmount, counterOfferMessage }: { offerId: number; counterOfferAmount: string; counterOfferMessage: string }) =>
      apiRequest("POST", `/api/offers/${offerId}/counter`, { counterOfferAmount, counterOfferMessage }),
    onSuccess: () => {
      toast({
        title: "Counter-Offer Sent",
        description: "Your counter-offer has been sent to the customer.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/offers/pending'] });
      setSelectedOffer(null);
      setCounterOfferAmount("");
      setCounterOfferMessage("");
      setCounterOfferDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send counter-offer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAcceptOffer = (offerId: number) => {
    acceptOfferMutation.mutate(offerId);
  };

  const handleRejectOffer = () => {
    if (!selectedOffer || !rejectReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }
    
    rejectOfferMutation.mutate({
      offerId: selectedOffer.id,
      adminResponse: rejectReason,
    });
  };

  const handleCounterOffer = () => {
    if (!selectedOffer || !counterOfferAmount.trim()) {
      toast({
        title: "Error",
        description: "Please provide a counter-offer amount.",
        variant: "destructive",
      });
      return;
    }
    
    const amount = parseFloat(counterOfferAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }
    
    counterOfferMutation.mutate({
      offerId: selectedOffer.id,
      counterOfferAmount: counterOfferAmount,
      counterOfferMessage: counterOfferMessage,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <AdminNavigation />
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">Loading pending offers...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Pending Offers | Admin Dashboard</title>
        <meta name="description" content="Manage pending product offers" />
      </Helmet>
      
      <div className="min-h-screen bg-neutral-50">
        <AdminNavigation />
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">Pending Offers</h1>
                <p className="text-neutral-600">
                  Review and manage customer offers ({pendingOffers.length} pending)
                </p>
              </div>
            </div>

            {pendingOffers.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-neutral-500">No pending offers to review</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {pendingOffers.map((offer: any) => (
                  <Card key={offer.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            Offer for {offer.product?.name || 'Unknown Product'}
                          </CardTitle>
                          <CardDescription>
                            From {offer.user?.firstName} {offer.user?.lastName} ({offer.user?.email})
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">
                          {offer.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            {offer.product?.imageUrl && (
                              <img
                                src={offer.product.imageUrl}
                                alt={offer.product.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            )}
                            <div>
                              <p className="font-medium">{offer.product?.name}</p>
                              <p className="text-sm text-neutral-600">
                                Listed Price: £{offer.product?.price}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-neutral-600">Offer Amount</p>
                            <p className="text-2xl font-bold text-green-600">
                              £{parseFloat(offer.offerAmount).toFixed(2)}
                            </p>
                          </div>
                          
                          {offer.message && (
                            <div>
                              <p className="text-sm text-neutral-600">Customer Message</p>
                              <p className="text-sm bg-neutral-50 p-3 rounded-lg">
                                {offer.message}
                              </p>
                            </div>
                          )}
                          
                          <div>
                            <p className="text-sm text-neutral-600">Submitted</p>
                            <p className="text-sm">
                              {format(new Date(offer.createdAt), 'PPp')}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-6 pt-4 border-t">
                        <Button
                          onClick={() => handleAcceptOffer(offer.id)}
                          className="bg-[#2D317C] hover:bg-[#2D317C]/90"
                          disabled={acceptOfferMutation.isPending}
                        >
                          {acceptOfferMutation.isPending ? "Accepting..." : "Accept Offer"}
                        </Button>
                        
                        <Dialog open={counterOfferDialogOpen && selectedOffer?.id === offer.id} onOpenChange={(open) => {
                          setCounterOfferDialogOpen(open);
                          if (!open) {
                            setSelectedOffer(null);
                            setCounterOfferAmount("");
                            setCounterOfferMessage("");
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="border-[#A6C1E4] text-[#2D317C] hover:bg-[#A6C1E4]/20"
                              onClick={() => {
                                setSelectedOffer(offer);
                                setCounterOfferDialogOpen(true);
                              }}
                            >
                              Counter-Offer
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Send Counter-Offer</DialogTitle>
                              <DialogDescription>
                                Propose a different price to the customer. They can accept or decline your counter-offer.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-600">Customer's offer: <span className="font-bold">£{parseFloat(offer.offerAmount).toFixed(2)}</span></p>
                                <p className="text-sm text-gray-600">Listed price: <span className="font-bold">£{offer.product?.price}</span></p>
                              </div>
                              <div>
                                <Label htmlFor="counter-amount">Your Counter-Offer (£)</Label>
                                <Input
                                  id="counter-amount"
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="Enter your counter-offer amount..."
                                  value={counterOfferAmount}
                                  onChange={(e) => setCounterOfferAmount(e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="counter-message">Message to Customer (optional)</Label>
                                <Textarea
                                  id="counter-message"
                                  placeholder="Add a message explaining your counter-offer..."
                                  value={counterOfferMessage}
                                  onChange={(e) => setCounterOfferMessage(e.target.value)}
                                  rows={3}
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => {
                                  setSelectedOffer(null);
                                  setCounterOfferAmount("");
                                  setCounterOfferMessage("");
                                  setCounterOfferDialogOpen(false);
                                }}>
                                  Cancel
                                </Button>
                                <Button
                                  className="bg-[#2D317C] hover:bg-[#2D317C]/90"
                                  onClick={handleCounterOffer}
                                  disabled={counterOfferMutation.isPending}
                                >
                                  {counterOfferMutation.isPending ? "Sending..." : "Send Counter-Offer"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="destructive"
                              onClick={() => setSelectedOffer(offer)}
                            >
                              Reject Offer
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Offer</DialogTitle>
                              <DialogDescription>
                                Please provide a reason for rejecting this offer. This will be sent to the customer.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="reject-reason">Rejection Reason</Label>
                                <Textarea
                                  id="reject-reason"
                                  placeholder="Please explain why this offer cannot be accepted..."
                                  value={rejectReason}
                                  onChange={(e) => setRejectReason(e.target.value)}
                                  rows={4}
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => {
                                  setSelectedOffer(null);
                                  setRejectReason("");
                                }}>
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={handleRejectOffer}
                                  disabled={rejectOfferMutation.isPending}
                                >
                                  {rejectOfferMutation.isPending ? "Rejecting..." : "Reject Offer"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}