import { useState, useEffect } from "react";
import SEOHead from "@/components/SEOHead";
import { useAuth } from "@/hooks/useAuth";
import { useModals } from "@/contexts/ModalContext";
import { useBasket } from "@/contexts/BasketContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SustainableLoader, PageLoader } from "@/components/ui/SustainableLoader";
import { TransitionWrapper, StaggeredContainer, StaggeredItem } from "@/components/ui/TransitionWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FiArrowLeft,
  FiUser,
  FiSettings,
  FiShoppingBag,
  FiHeart,
  FiClock,
  FiCreditCard,
  FiEdit2,
  FiPackage,
  FiCheck,
  FiSend,
  FiUpload,
  FiLoader,
  FiShare2,
  FiLink,
  FiCheckCircle,
  FiBell,
  FiTag,
} from "react-icons/fi";
import { MdConfirmationNumber } from "react-icons/md";
import { 
  RiInstagramLine, 
  RiFacebookLine, 
  RiTwitterLine, 
  RiTiktokLine,
  RiLinkedinLine,
  RiSnapchatLine
} from "react-icons/ri";
import PrizeDrawEntries from "@/components/account/RaffleEntries";
import ManagePrizeDraws from "@/components/account/ManageRaffles";
import { ItemSubmissionForm } from "@/components/account/ItemSubmissionForm";
import { ItemSubmissionsList } from "@/components/account/ItemSubmissionsList";
import { WalletBalance } from "@/components/wallet/WalletBalance";
import { WalletTransactionHistory } from "@/components/wallet/WalletTransactionHistory";
import SimpleWithdrawalPage from "@/components/wallet/SimpleWithdrawalPage";
import InstantWinHistory from "@/components/wallet/InstantWinHistory";
import { AuctionInvoice } from "@/components/auction/AuctionInvoice";
import { AuctionShippingSelector } from "@/components/shipping/AuctionShippingSelector";

import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Gift, Trophy, Coins, Clock, Banknote, CreditCard, Building2, Wallet, Ticket, MapPin, Truck } from "lucide-react";
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import SimpleAvatarSelector from "@/components/avatars/SimpleAvatarSelector";

interface ProfileFormData {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  username: string | null;
  profileImageUrl: string | null;
}


import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";

// InstantWinsSection component
function InstantWinsSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch instant wins
  const { data: instantWins = [], isLoading: instantWinsLoading, error: instantWinsError } = useQuery({
    queryKey: ["/api/instant-wins"],
    queryFn: async () => {
      console.log("🎁 Fetching instant wins...");
      const response = await fetch("/api/instant-wins", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });
      console.log("🎁 Instant wins response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("🎁 Instant wins fetch error:", errorText);
        throw new Error(`Failed to fetch instant wins: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("🎁 Instant wins data:", data);
      return data;
    },
    retry: 2,
  });

  // Claim instant win mutation
  const claimInstantWin = useMutation({
    mutationFn: async (instantWinId: number) => {
      const response = await fetch(`/api/instant-wins/${instantWinId}/claim`, {
        method: "POST",
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to claim instant win");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/instant-wins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      
      // Notification with wallet details
      toast({
        title: "Prize Claimed! 🎉",
        description: data.message,
        duration: 6000,
        className: "bg-primary/10 border-primary",
      });

      // Bell notification for wallet credit
      fetch("/api/notifications", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: data.message,
          type: "success"
        })
      }).catch(err => console.log("Notification error:", err));
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to claim prize",
        variant: "destructive",
      });
    },
  });

  const unclaimedWins = instantWins.filter((win: any) => !win.claimed);
  const claimedWins = instantWins.filter((win: any) => win.claimed);
  const totalValue = unclaimedWins.reduce((sum: number, win: any) => sum + parseFloat(win.prizeAmount), 0);

  if (instantWinsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            <p className="ml-3">Loading your instant wins...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (instantWinsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Instant Wins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Unable to load your instant win prizes</p>
            <p className="text-sm text-gray-500">Error: {instantWinsError.message}</p>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/instant-wins"] })}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Instant Win Prizes
        </CardTitle>
        <CardDescription>
          Your instant win prizes from raffle purchases
        </CardDescription>
      </CardHeader>
      <CardContent>
        {instantWins.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No instant wins yet</p>
            <p className="text-sm text-gray-400">Purchase raffle tickets to earn instant win prizes!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/5 border border-primary p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">{unclaimedWins.length}</div>
                <div className="text-sm text-primary">Unclaimed Prizes</div>
              </div>
              <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">£{totalValue.toFixed(2)}</div>
                <div className="text-sm text-primary">Total Value</div>
              </div>
              <div className="bg-primary/5 border border-primary/10 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary/70">{claimedWins.length}</div>
                <div className="text-sm text-primary/70">Already Claimed</div>
              </div>
            </div>

            {/* Unclaimed Wins */}
            {unclaimedWins.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-primary" />
                  Unclaimed Prizes ({unclaimedWins.length})
                </h3>
                <div className="grid gap-3">
                  {unclaimedWins.map((win: any) => (
                    <div key={win.id} className="border rounded-lg p-4 flex items-center justify-between bg-primary/5 border-primary">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center">
                          <Gift className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold">£{parseFloat(win.prizeAmount).toFixed(2)} Cash Prize</div>
                          <div className="text-sm text-gray-600">From: {win.raffleName}</div>
                          <div className="text-xs text-gray-500">
                            Won: {new Date(win.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => claimInstantWin.mutate(win.id)}
                        disabled={claimInstantWin.isPending}
                        className="bg-primary hover:bg-primary/90 text-white"
                      >
                        {claimInstantWin.isPending ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Claiming...
                          </>
                        ) : (
                          <>
                            <Trophy className="w-4 h-4 mr-2" />
                            Claim Prize
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Withdrawal Section - Always show it when user is authenticated */}
            <WithdrawalSection />

            {/* Claimed Wins */}
            {claimedWins.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary/70" />
                  Claimed Prizes ({claimedWins.length})
                </h3>
                <div className="grid gap-3">
                  {claimedWins.map((win: any) => (
                    <div key={win.id} className="border rounded-lg p-4 flex items-center justify-between bg-primary/5 border-primary/20">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/70 text-white rounded-full w-10 h-10 flex items-center justify-center">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold">£{parseFloat(win.prizeAmount).toFixed(2)} Cash Prize</div>
                          <div className="text-sm text-gray-600">From: {win.raffleName}</div>
                          <div className="text-xs text-gray-500">
                            Claimed: {new Date(win.claimedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-primary/10 text-primary/70 border-primary/20">Claimed</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// WithdrawalSection component
function WithdrawalSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [withdrawalMethod, setWithdrawalMethod] = useState("");
  const [withdrawalDetails, setWithdrawalDetails] = useState({
    email: "",
    accountNumber: "",
    sortCode: "",
    accountName: ""
  });

  // Fetch withdrawal balance
  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ["/api/withdrawals/balance"],
    queryFn: async () => {
      const response = await fetch("/api/withdrawals/balance", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to fetch balance");
      return response.json();
    },
  });

  // Create withdrawal mutation
  const createWithdrawal = useMutation({
    mutationFn: async (withdrawalData: any) => {
      const response = await fetch("/api/withdrawals/request", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withdrawalData)
      });
      if (!response.ok) throw new Error("Failed to create withdrawal");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/instant-wins"] });
      
      // Show enhanced success message based on withdrawal method
      const isInstant = withdrawalMethod === 'stripe' || withdrawalMethod === 'paypal';
      toast({
        title: isInstant ? "💰 INSTANT WITHDRAWAL COMPLETE!" : "✅ Withdrawal Submitted!",
        description: isInstant 
          ? `£${availableBalance.toFixed(2)} has been instantly sent to your ${withdrawalMethod === 'stripe' ? 'debit card' : 'PayPal account'}. Check your banking app or email for confirmation.`
          : data.message,
        duration: 8000,
      });
      
      // Show additional confirmation for instant transfers
      if (isInstant) {
        setTimeout(() => {
          toast({
            title: "🎉 Money Transferred!",
            description: `Your £${availableBalance.toFixed(2)} instant win prize money is on its way. It should appear in your account within minutes.`,
            duration: 6000,
          });
        }, 2500);
      }
      
      setShowWithdrawal(false);
      setWithdrawalMethod("");
      setWithdrawalDetails({ email: "", accountNumber: "", sortCode: "", accountName: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Error",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    },
  });

  const handleWithdrawal = () => {
    if (!withdrawalMethod) {
      toast({
        title: "Error",
        description: "Please select a withdrawal method",
        variant: "destructive",
      });
      return;
    }

    let details = {};
    if (withdrawalMethod === 'paypal' || withdrawalMethod === 'stripe') {
      if (!withdrawalDetails.email) {
        toast({
          title: "Error",
          description: "Please enter your email address",
          variant: "destructive",
        });
        return;
      }
      details = { email: withdrawalDetails.email };
    } else if (withdrawalMethod === 'bank_transfer') {
      if (!withdrawalDetails.accountNumber || !withdrawalDetails.sortCode || !withdrawalDetails.accountName) {
        toast({
          title: "Error",
          description: "Please fill in all bank details",
          variant: "destructive",
        });
        return;
      }
      details = {
        accountNumber: withdrawalDetails.accountNumber,
        sortCode: withdrawalDetails.sortCode,
        accountName: withdrawalDetails.accountName
      };
    }

    createWithdrawal.mutate({
      withdrawalMethod,
      withdrawalDetails: details
    });
  };

  if (balanceLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const availableBalance = balanceData?.availableBalance || 0;

  return (
    <Card className="border-primary bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Wallet className="w-5 h-5" />
          Cash Withdrawal
        </CardTitle>
        <CardDescription className="text-primary/70">
          Instantly withdraw your claimed prize money
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-primary">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">£{availableBalance.toFixed(2)}</div>
              <div className="text-sm text-primary">Available to withdraw</div>
              <div className="text-xs text-gray-500 mt-1">
                From {balanceData?.prizeCount || 0} claimed prizes
              </div>
            </div>
          </div>

          {availableBalance >= 5 ? (
            <div className="space-y-3">
              {!showWithdrawal ? (
                <Button 
                  onClick={() => setShowWithdrawal(true)}
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  size="lg"
                >
                  <Banknote className="w-5 h-5 mr-2" />
                  Withdraw £{availableBalance.toFixed(2)}
                </Button>
              ) : (
                <div className="space-y-4 p-4 border rounded-lg bg-white">
                  <h4 className="font-semibold text-center">Choose Withdrawal Method</h4>
                  
                  <div className="grid gap-3">
                    <div 
                      className={`p-3 border rounded-lg cursor-pointer ${withdrawalMethod === 'paypal' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                      onClick={() => setWithdrawalMethod('paypal')}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium">PayPal</div>
                          <div className="text-xs text-gray-500">Instant transfer</div>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`p-3 border rounded-lg cursor-pointer ${withdrawalMethod === 'stripe' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                      onClick={() => setWithdrawalMethod('stripe')}
                    >
                      <div className="flex items-center gap-3">
                        <Wallet className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="font-medium">Stripe (Debit Card)</div>
                          <div className="text-xs text-gray-500">Instant transfer</div>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`p-3 border rounded-lg cursor-pointer ${withdrawalMethod === 'bank_transfer' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                      onClick={() => setWithdrawalMethod('bank_transfer')}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-medium">Bank Transfer</div>
                          <div className="text-xs text-gray-500">2-3 business days</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {withdrawalMethod === 'paypal' || withdrawalMethod === 'stripe' ? (
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={withdrawalDetails.email}
                        onChange={(e) => setWithdrawalDetails(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  ) : withdrawalMethod === 'bank_transfer' ? (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="accountName">Account Name</Label>
                        <Input
                          id="accountName"
                          placeholder="Your Full Name"
                          value={withdrawalDetails.accountName}
                          onChange={(e) => setWithdrawalDetails(prev => ({ ...prev, accountName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          placeholder="12345678"
                          value={withdrawalDetails.accountNumber}
                          onChange={(e) => setWithdrawalDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="sortCode">Sort Code</Label>
                        <Input
                          id="sortCode"
                          placeholder="12-34-56"
                          value={withdrawalDetails.sortCode}
                          onChange={(e) => setWithdrawalDetails(prev => ({ ...prev, sortCode: e.target.value }))}
                        />
                      </div>
                    </div>
                  ) : null}

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowWithdrawal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleWithdrawal}
                      disabled={createWithdrawal.isPending}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      {createWithdrawal.isPending ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Processing...
                        </>
                      ) : (
                        `Withdraw £${availableBalance.toFixed(2)}`
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">
                Minimum withdrawal amount is £5.00
              </p>
              {availableBalance > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  You need £{(5 - availableBalance).toFixed(2)} more to withdraw
                </p>
              )}
            </div>
          )}

          {balanceData?.withdrawalHistory?.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3 text-primary">Recent Withdrawals</h4>
              <div className="space-y-2">
                {balanceData.withdrawalHistory.slice(0, 3).map((withdrawal: any) => (
                  <div key={withdrawal.id} className="bg-white p-3 rounded border flex justify-between items-center">
                    <div>
                      <div className="font-medium">£{parseFloat(withdrawal.amount).toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(withdrawal.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge className={
                      withdrawal.status === 'completed' ? 'bg-primary/10 text-primary' :
                      withdrawal.status === 'processing' ? 'bg-primary/20 text-primary/80' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {withdrawal.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// RaffleWinningsSection component - shows main raffle wins
function RaffleWinningsSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWinnerForPayment, setSelectedWinnerForPayment] = React.useState<any>(null);
  const [selectedWinnerForDelivery, setSelectedWinnerForDelivery] = React.useState<any>(null);
  const [deliveryAddress, setDeliveryAddress] = React.useState({
    fullName: "",
    address1: "",
    address2: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
    email: "",
    deliveryType: "physical" as string // 'physical' or 'digital'
  });

  // Fetch prize draw winnings for user  
  const { data: winningsData, isLoading: winningsLoading } = useQuery({
    queryKey: ["/api/user-raffle-wins"],
    queryFn: async () => {
      const response = await fetch("/api/user-raffle-wins", {
        method: "GET",
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch prize draw winnings");
      return response.json();
    },
    retry: 2,
  });

  // Claim prize draw prize mutation
  const claimPrizeDrawPrize = useMutation({
    mutationFn: async ({ winnerId, claimType, deliveryAddress, paymentMethod }: { winnerId: number; claimType: 'cash' | 'delivery'; deliveryAddress?: any; paymentMethod?: string }) => {
      const response = await fetch(`/api/raffle-winners/claim/${winnerId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ claimType, deliveryAddress, paymentMethod })
      });
      if (!response.ok) throw new Error("Failed to claim prize draw prize");
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/raffle-winners/my-winnings"] });
      if (variables.claimType === 'cash') {
        queryClient.invalidateQueries({ queryKey: ["/api/withdrawals/balance"] });
      }
      setSelectedWinnerForPayment(null);
      setSelectedWinnerForDelivery(null);
      setDeliveryAddress({
        fullName: "",
        address1: "",
        address2: "",
        city: "",
        postcode: "",
        country: "United Kingdom",
        email: "",
        deliveryType: "physical"
      });
      toast({
        title: variables.claimType === 'cash' ? "Cash Prize Claimed! 💰" : "Delivery Arranged! 📦",
        description: data.message,
        duration: 5000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to claim prize",
        variant: "destructive",
      });
    },
  });

  const handleDeliverySubmit = () => {
    if (!selectedWinnerForDelivery) return;
    
    if (deliveryAddress.deliveryType === 'digital') {
      if (!deliveryAddress.email) {
        toast({
          title: "Email Required",
          description: "Please provide your email address for digital delivery",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!deliveryAddress.fullName || !deliveryAddress.address1 || !deliveryAddress.city || !deliveryAddress.postcode) {
        toast({
          title: "Incomplete Address",
          description: "Please fill in all required delivery fields",
          variant: "destructive",
        });
        return;
      }
    }

    // Use the correct API endpoint for prize draw prize delivery claim
    fetch(`/api/raffle-winners/claim/${selectedWinnerForDelivery.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        claimType: 'delivery',
        deliveryAddress
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        toast({
          title: "Delivery Request Submitted",
          description: data.message,
          variant: "default",
        });
        setSelectedWinnerForDelivery(null);
        setDeliveryAddress({
          deliveryType: 'physical',
          fullName: '',
          address1: '',
          address2: '',
          city: '',
          postcode: '',
          country: 'United Kingdom',
          email: '',
        });
        // Refresh both winnings and delivery status data
        queryClient.invalidateQueries({ queryKey: ["/api/user-raffle-wins"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user-delivery-status"] });
      } else {
        throw new Error(data.message || 'Failed to submit delivery request');
      }
    })
    .catch(error => {
      toast({
        title: "Request Failed", 
        description: error.message || "Failed to submit delivery request",
        variant: "destructive",
      });
    });
  };

  const winnings = winningsData || [];

  // Fetch delivery status for each win
  const { data: deliveryData } = useQuery({
    queryKey: ["/api/user-delivery-status"],
    queryFn: async () => {
      const response = await fetch("/api/user-delivery-status", {
        method: "GET",
        credentials: "include"
      });
      if (!response.ok) return {};
      const data = await response.json();
      // Convert array to object keyed by raffle_id for easy lookup
      return data.reduce((acc: any, delivery: any) => {
        acc[delivery.raffle_id] = delivery;
        return acc;
      }, {});
    },
    retry: 1,
    enabled: winnings.length > 0
  });

  // Map the API response to match the expected format
  const mappedWinnings = winnings.map((win: any) => {
    const delivery = deliveryData?.[win.id] || {};
    
    return {
      id: win.id,
      prizeDrawName: win.raffleName,
      winningTicketNumber: win.winningTicketNumber,
      completedAt: win.completedAt,
      prizeDrawImageUrl: win.raffleImageUrl,
      // Add fields that the UI expects
      prizeName: win.raffleName, // Use prize draw name as prize name
      prizeValue: 0, // Default value since main raffle prizes don't have set cash values
      claimed: !!delivery.delivery_id, // Has delivery arrangement
      wonAt: win.completedAt,
      claimedAt: delivery.created_at,
      // Delivery tracking info
      deliveryStatus: delivery.delivery_status,
      deliveryType: delivery.delivery_type,
      deliveryEmail: delivery.delivery_email,
      deliveryAddress: delivery.delivery_address
    };
  });

  if (winningsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            <p className="ml-3">Loading your prize draw winnings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mappedWinnings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Prize Draw Winnings
          </CardTitle>
          <CardDescription>Your major prize draw wins appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No Prize Draw Wins Yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Keep entering prize draws for a chance to win amazing antique prizes! Your big wins will appear here.
            </p>
            <Button className="mt-4" onClick={() => window.location.href = "/raffles"}>
              Browse Active Prize Draws
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Prize Draw Winnings ({mappedWinnings.length})
        </CardTitle>
        <CardDescription>
          Your major prize draw wins - congratulations!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mappedWinnings.map((winning: any) => (
            <div key={winning.id} className="border rounded-lg p-4 bg-primary/5 border-primary">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Winner Badge */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white">
                      <Trophy className="w-8 h-8" />
                    </div>
                  </div>

                  {/* Win Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">🎉 You Won!</h3>
                      {!winning.claimed && (
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          Unclaimed
                        </Badge>
                      )}
                      {winning.claimed && (
                        <Badge className="bg-primary/20 text-primary/80 border-primary/30">
                          Claimed
                        </Badge>
                      )}
                    </div>
                    
                    <h4 className="font-semibold text-lg text-gray-800 mb-1">
                      {winning.prizeName}
                    </h4>
                    
                    <p className="text-gray-600 mb-2">
                      Prize Draw: {winning.raffleName}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Ticket className="w-4 h-4" />
                        <span>Winning Ticket #{winning.winningTicketNumber}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(winning.wonAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {winning.claimedAt && (
                      <div className="mt-2 text-xs text-primary/70">
                        Delivery requested on {new Date(winning.claimedAt).toLocaleDateString()}
                      </div>
                    )}

                    {/* Delivery Status Tracking */}
                    {winning.deliveryStatus && (
                      <div className="mt-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-primary">Delivery Status</span>
                          <Badge className={
                            winning.deliveryStatus === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            winning.deliveryStatus === 'processing' ? 'bg-primary/10 text-primary border-primary/20' :
                            winning.deliveryStatus === 'shipped' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            winning.deliveryStatus === 'delivered' ? 'bg-primary text-white border-primary' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                          }>
                            {winning.deliveryStatus === 'pending' ? 'Pending Review' :
                             winning.deliveryStatus === 'processing' ? 'Processing' :
                             winning.deliveryStatus === 'shipped' ? 'Shipped' :
                             winning.deliveryStatus === 'delivered' ? 'Delivered ✓' :
                             winning.deliveryStatus}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-gray-600 space-y-1">
                          <div><strong>Method:</strong> {winning.deliveryType === 'digital' ? 'Digital Delivery' : 'Physical Shipping'}</div>
                          <div><strong>Contact:</strong> {winning.deliveryEmail}</div>
                          
                          {winning.deliveryStatus === 'pending' && (
                            <div className="text-amber-600 font-medium mt-2 flex items-center gap-2">
                              <span>📞</span>
                              <span>We'll contact you within 48 hours to arrange delivery</span>
                            </div>
                          )}
                          {winning.deliveryStatus === 'processing' && (
                            <div className="text-primary font-medium mt-2 flex items-center gap-2">
                              <span>📦</span>
                              <span>Your prize is being prepared for delivery</span>
                            </div>
                          )}
                          {winning.deliveryStatus === 'shipped' && (
                            <div className="text-blue-600 font-medium mt-2 flex items-center gap-2">
                              <span>🚚</span>
                              <span>Your prize has been shipped and is on its way</span>
                            </div>
                          )}
                          {winning.deliveryStatus === 'delivered' && (
                            <div className="text-primary font-medium mt-2 flex items-center gap-2">
                              <span>🎉</span>
                              <span>Prize delivered! We hope you enjoy your win!</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prize Value & Actions */}
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold text-primary mb-2">
                    £{winning.prizeValue.toFixed(2)}
                  </div>
                  
                  {!winning.claimed && !winning.deliveryStatus ? (
                    <div className="flex flex-col gap-2">
                      <Dialog open={selectedWinnerForPayment?.id === winning.id} onOpenChange={(open) => {
                        if (!open) {
                          setSelectedWinnerForPayment(null);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => {
                              setSelectedWinnerForPayment(winning);
                            }}
                            disabled={claimRafflePrize.isPending}
                            className="bg-primary hover:bg-primary/90 text-white"
                            size="sm"
                          >
                            {claimRafflePrize.isPending ? (
                              <>
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Banknote className="w-4 h-4 mr-2" />
                                Cash Prize
                              </>
                            )}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Wallet className="w-5 h-5 text-primary" />
                              Choose Payment Method
                            </DialogTitle>
                            <DialogDescription>
                              Select how you'd like to receive your £{winning.prizeValue.toFixed(2)} cash prize
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3">
                            <Button
                              className="w-full justify-start bg-primary hover:bg-primary/90"
                              onClick={() => {
                                claimRafflePrize.mutate({ winnerId: winning.id, claimType: 'cash', paymentMethod: 'stripe' });
                              }}
                              disabled={claimRafflePrize.isPending}
                            >
                              <CreditCard className="w-4 h-4 mr-3" />
                              Credit/Debit Card (Stripe)
                              <span className="ml-auto text-xs">Instant</span>
                            </Button>
                            
                            <Button
                              className="w-full justify-start bg-yellow-500 hover:bg-yellow-600"
                              onClick={() => {
                                claimRafflePrize.mutate({ winnerId: winning.id, claimType: 'cash', paymentMethod: 'paypal' });
                              }}
                              disabled={claimRafflePrize.isPending}
                              variant="outline"
                            >
                              <Wallet className="w-4 h-4 mr-3" />
                              PayPal Account
                              <span className="ml-auto text-xs">1-2 days</span>
                            </Button>
                            
                            <Button
                              className="w-full justify-start"
                              onClick={() => {
                                claimRafflePrize.mutate({ winnerId: winning.id, claimType: 'cash', paymentMethod: 'bank' });
                              }}
                              disabled={claimRafflePrize.isPending}
                              variant="outline"
                            >
                              <Building2 className="w-4 h-4 mr-3" />
                              Bank Transfer
                              <span className="ml-auto text-xs">3-5 days</span>
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Dialog open={selectedWinnerForDelivery?.id === winning.id} onOpenChange={(open) => {
                        if (!open) setSelectedWinnerForDelivery(null);
                        else setSelectedWinnerForDelivery(winning);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            disabled={claimRafflePrize.isPending}
                            variant="outline"
                            className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
                            size="sm"
                          >
                            <Trophy className="w-4 h-4 mr-2" />
                            Ship Item
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-blue-600" />
                              Delivery Options
                            </DialogTitle>
                            <DialogDescription>
                              Choose how you'd like to receive {winning.prizeName}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Delivery Type</Label>
                              <Select 
                                value={deliveryAddress.deliveryType} 
                                onValueChange={(value) => setDeliveryAddress(prev => ({ ...prev, deliveryType: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select delivery type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="physical">Physical Shipping</SelectItem>
                                  <SelectItem value="digital">Digital Delivery (Email)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {deliveryAddress.deliveryType === 'digital' ? (
                              <div>
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={deliveryAddress.email}
                                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, email: e.target.value }))}
                                  placeholder="your.email@example.com"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Digital certificates, vouchers, or documentation will be sent to this email
                                </p>
                              </div>
                            ) : (
                              <>
                                <div>
                                  <Label htmlFor="fullName">Full Name *</Label>
                                  <Input
                                    id="fullName"
                                    value={deliveryAddress.fullName}
                                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, fullName: e.target.value }))}
                                    placeholder="Enter your full name"
                                  />
                                </div>
                            <div>
                              <Label htmlFor="address1">Address Line 1 *</Label>
                              <Input
                                id="address1"
                                value={deliveryAddress.address1}
                                onChange={(e) => setDeliveryAddress(prev => ({ ...prev, address1: e.target.value }))}
                                placeholder="Street address"
                              />
                            </div>
                            <div>
                              <Label htmlFor="address2">Address Line 2</Label>
                              <Input
                                id="address2"
                                value={deliveryAddress.address2}
                                onChange={(e) => setDeliveryAddress(prev => ({ ...prev, address2: e.target.value }))}
                                placeholder="Apartment, suite, etc. (optional)"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor="city">City *</Label>
                                <Input
                                  id="city"
                                  value={deliveryAddress.city}
                                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                                  placeholder="City"
                                />
                              </div>
                              <div>
                                <Label htmlFor="postcode">Postcode *</Label>
                                <Input
                                  id="postcode"
                                  value={deliveryAddress.postcode}
                                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, postcode: e.target.value }))}
                                  placeholder="Postcode"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="country">Country</Label>
                              <Select 
                                value={deliveryAddress.country} 
                                onValueChange={(value) => setDeliveryAddress(prev => ({ ...prev, country: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                  <SelectItem value="Ireland">Ireland</SelectItem>
                                  <SelectItem value="France">France</SelectItem>
                                  <SelectItem value="Germany">Germany</SelectItem>
                                  <SelectItem value="Spain">Spain</SelectItem>
                                  <SelectItem value="Italy">Italy</SelectItem>
                                  <SelectItem value="Netherlands">Netherlands</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                              </>
                            )}
                            
                            <div className="flex gap-3 pt-4">
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setSelectedWinnerForDelivery(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                                onClick={handleDeliverySubmit}
                                disabled={claimRafflePrize.isPending}
                              >
                                {claimRafflePrize.isPending ? (
                                  <>
                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <Trophy className="w-4 h-4 mr-2" />
                                    Confirm {deliveryAddress.deliveryType === 'digital' ? 'Email' : 'Delivery'}
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) : (
                    <div className="text-sm text-green-600 font-medium">
                      {winning.claimType === 'cash' ? '✓ Cash Claimed' : '✓ Delivery Arranged'}
                    </div>
                  )}
                </div>
              </div>

              {/* Raffle Image */}
              {winning.raffleImage && (
                <div className="mt-4 pt-4 border-t border-yellow-200">
                  <img 
                    src={winning.raffleImage} 
                    alt={winning.raffleName}
                    className="w-24 h-24 object-cover rounded-lg border mx-auto"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// WishlistSection component
function WishlistSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch wishlist
  const { data: wishlistData, isLoading: wishlistLoading } = useQuery({
    queryKey: ["/api/wishlist"],
    queryFn: async () => {
      const response = await fetch("/api/wishlist", {
        method: "GET",
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch wishlist");
      return response.json();
    },
    retry: false,
  });

  const wishlistItems = wishlistData?.items || [];
  const totalValue = wishlistData?.totalValue || "0.00";
  const itemCount = wishlistData?.itemCount || 0;

  // Create wishlist offer mutation
  const createOffer = useMutation({
    mutationFn: async (data: { offerAmount: string; message: string; wishlistItemIds: number[] }) => {
      const response = await fetch("/api/wishlist/create-offer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to create offer");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Offer sent!",
        description: "Your wishlist offer has been sent to Lanora House.",
        duration: 5000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create offer",
        variant: "destructive",
      });
    },
  });

  if (wishlistLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <SustainableLoader variant="leaf" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FiHeart className="h-5 w-5" />
          My Wishlist ({itemCount} items)
        </CardTitle>
        <CardDescription>
          Total wishlist value: £{totalValue} - Create offers for individual items or bundle multiple items together
        </CardDescription>
      </CardHeader>
      <CardContent>
        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <FiHeart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Your wishlist is empty</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Add items to your wishlist from the shop to create custom offers and track your favorite pieces.
            </p>
            <Button className="mt-4" onClick={() => window.location.href = "/shop"}>
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlistItems.slice(0, 6).map((item: any) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-32 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-medium text-sm truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-lg font-bold text-primary">
                      £{item.product.price}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="secondary" className="text-xs">{item.product.era}</Badge>
                    <Badge variant="outline" className="text-xs">{item.product.condition}</Badge>
                  </div>
                </div>
              ))}
            </div>
            
            {wishlistItems.length > 6 && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">
                  And {wishlistItems.length - 6} more items...
                </p>
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div>
                  <p className="text-lg font-semibold">
                    Create offer for entire wishlist
                  </p>
                  <p className="text-sm text-gray-600">
                    Total value: £{totalValue} • {itemCount} items
                  </p>
                </div>
                <Button
                  onClick={() => window.location.href = "/wishlist"}
                  className="bg-primary hover:bg-primary/90"
                >
                  <FiSend className="mr-2 h-4 w-4" />
                  View Full Wishlist & Create Offer
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// PurchaseHistorySection component to show all user orders with tracking
function PurchaseHistorySection() {
  const {
    data: orders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/members/orders"],
    retry: false,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Delivered</Badge>;
      case 'shipped':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Shipped</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Processing</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiPackage className="w-5 h-5 text-primary" />
            Purchase History
          </CardTitle>
          <CardDescription>View all your orders and track deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            <p className="ml-3">Loading your orders...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiPackage className="w-5 h-5 text-primary" />
            Purchase History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">Error loading orders. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const orderList = Array.isArray(orders) ? orders : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FiPackage className="w-5 h-5 text-primary" />
          Purchase History
        </CardTitle>
        <CardDescription>
          View all your orders and track deliveries
        </CardDescription>
      </CardHeader>
      <CardContent>
        {orderList.length === 0 ? (
          <div className="text-center py-12">
            <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Orders Yet</h3>
            <p className="text-gray-500 mb-4">
              You haven't made any purchases yet. Start shopping!
            </p>
            <Link href="/shop">
              <Button className="bg-primary hover:bg-primary/90">
                <FiShoppingBag className="mr-2 h-4 w-4" />
                Browse Shop
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orderList.map((order: any) => (
              <div
                key={order.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                data-testid={`card-order-${order.id}`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">Order #{order.id}</h4>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-gray-500">
                      Placed: {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      £{parseFloat(order.total).toFixed(2)}
                    </p>
                  </div>
                </div>

                {order.trackingNumber && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Tracking Information</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Carrier:</span> {order.carrier || 'Royal Mail'}
                    </p>
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Tracking:</span> {order.trackingNumber}
                    </p>
                    {order.estimatedDelivery && (
                      <p className="text-sm text-blue-700">
                        <span className="font-medium">Expected:</span> {formatDate(order.estimatedDelivery)}
                      </p>
                    )}
                  </div>
                )}

                {order.items && order.items.length > 0 && (
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium mb-2">Items:</p>
                    <div className="space-y-2">
                      {order.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.name}</span>
                          <span className="font-medium">£{parseFloat(item.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {order.status === 'shipped' && order.shippedAt && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-500">
                      Shipped on {formatDate(order.shippedAt)}
                    </p>
                  </div>
                )}

                {order.status === 'delivered' && order.deliveredAt && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <FiCheck className="w-4 h-4" />
                      Delivered on {formatDate(order.deliveredAt)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// MyOffersSection component to show all user offers
function MyOffersSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addItem, items: basketItems } = useBasket();

  const {
    data: allOffers,
    isLoading: offersLoading,
    error: offersError,
  } = useQuery({
    queryKey: ["/api/users/me/offers"],
    retry: false,
  });

  const handleAddToBasket = (offer: any) => {
    // Only use counter-offer amount for accepted counter statuses
    const useCounterOfferPrice = ['user_accepted', 'accepted'].includes(offer.status) && offer.counterOfferAmount;
    const priceString = useCounterOfferPrice ? offer.counterOfferAmount : offer.offerAmount;
    const finalPrice = priceString ? parseFloat(priceString) : 0;
    
    if (isNaN(finalPrice) || finalPrice <= 0) {
      toast({
        title: "Error",
        description: "Invalid price. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    // Check if already in basket
    const isInBasket = basketItems.some(item => item.offerId === offer.id);
    if (isInBasket) {
      toast({
        title: "Already in Basket",
        description: "This offer is already in your basket.",
      });
      return;
    }
    
    addItem({
      productId: offer.productId,
      name: offer.product?.name || `Product #${offer.productId}`,
      price: finalPrice.toString(),
      imageUrl: offer.product?.imageUrl,
      offerId: offer.id,
    });
    
    toast({
      title: "Added to Basket",
      description: "Your accepted offer has been added to your basket.",
    });
  };

  const isOfferInBasket = (offerId: number) => {
    return basketItems.some(item => item.offerId === offerId);
  };

  const handleOfferPayment = (offer: any) => {
    // Only use counter-offer amount for accepted counter statuses
    const useCounterOfferPrice = ['user_accepted', 'accepted'].includes(offer.status) && offer.counterOfferAmount;
    const priceString = useCounterOfferPrice ? offer.counterOfferAmount : offer.offerAmount;
    const finalPrice = priceString ? parseFloat(priceString) : 0;
    
    if (isNaN(finalPrice) || finalPrice <= 0) {
      toast({
        title: "Error",
        description: "Invalid price. Please contact support.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Redirecting to Checkout",
      description: "Taking you to complete your purchase...",
    });
    
    // Redirect to checkout with offerId parameter
    window.location.href = `/checkout?offerId=${offer.id}`;
  };

  const respondToCounterOffer = useMutation({
    mutationFn: async ({ offerId, action }: { offerId: number; action: 'accept' | 'decline' }) => {
      const res = await fetch(`/api/offers/${offerId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error('Failed to respond to counter-offer');
      return res.json();
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/me/offers"] });
      toast({
        title: action === 'accept' ? "Counter-Offer Accepted" : "Counter-Offer Declined",
        description: action === 'accept' 
          ? "You can now proceed to payment!" 
          : "The offer has been declined.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to respond to counter-offer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'user_accepted':
        return <Badge className="bg-[#2D317C] text-white">Accepted</Badge>;
      case 'rejected':
      case 'user_declined':
        return <Badge className="bg-gray-500 text-white">Declined</Badge>;
      case 'expired':
        return <Badge className="bg-gray-400 text-white">Expired</Badge>;
      case 'paid':
      case 'completed':
        return <Badge className="bg-[#A6C1E4] text-[#2D317C]">Completed</Badge>;
      case 'counter_sent':
        return <Badge className="bg-[#A6C1E4] text-[#2D317C] border border-[#2D317C]">Counter-Offer</Badge>;
      default:
        return <Badge variant="outline" className="bg-white text-[#2D317C] border-[#2D317C]">Pending</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Calculate remaining payment time (48 hours from acceptance)
  const calculateTimeRemaining = (acceptedAt: string) => {
    const acceptedDate = new Date(acceptedAt);
    const deadline = new Date(acceptedDate.getTime() + 48 * 60 * 60 * 1000); // 48 hours
    const now = new Date();
    const remaining = deadline.getTime() - now.getTime();
    
    if (remaining <= 0) return "Expired";
    
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (offersLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiTag className="w-5 h-5 text-primary" />
            My Offers
          </CardTitle>
          <CardDescription>Track all your submitted offers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            <p className="ml-3">Loading your offers...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (offersError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiTag className="w-5 h-5 text-primary" />
            My Offers
          </CardTitle>
          <CardDescription>Track all your submitted offers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">Error loading offers. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const offers = Array.isArray(allOffers) ? allOffers : [];
  const pendingOffers = offers.filter((o: any) => o.status === 'pending');
  const counterOffers = offers.filter((o: any) => o.status === 'counter_sent');
  const acceptedOffers = offers.filter((o: any) => ['accepted', 'user_accepted'].includes(o.status));
  const rejectedOffers = offers.filter((o: any) => ['rejected', 'user_declined'].includes(o.status));
  const completedOffers = offers.filter((o: any) => ['paid', 'completed'].includes(o.status));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FiTag className="w-5 h-5 text-primary" />
          My Offers
        </CardTitle>
        <CardDescription>
          Track all your submitted offers and their status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {offers.length === 0 ? (
          <div className="text-center py-12">
            <FiTag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Offers Yet</h3>
            <p className="text-gray-500 mb-4">
              Browse our shop and make offers on items you love.
            </p>
            <Link href="/shop">
              <Button className="bg-primary hover:bg-primary/90">
                <FiShoppingBag className="mr-2 h-4 w-4" />
                Browse Shop
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white border border-[#2D317C] p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-[#2D317C]">{pendingOffers.length}</div>
                <div className="text-sm text-[#2D317C]">Pending</div>
              </div>
              <div className="bg-[#A6C1E4] border border-[#2D317C] p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-[#2D317C]">{counterOffers.length}</div>
                <div className="text-sm text-[#2D317C]">Counter-Offers</div>
              </div>
              <div className="bg-[#2D317C] border border-[#2D317C] p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-white">{acceptedOffers.length}</div>
                <div className="text-sm text-white">Accepted</div>
              </div>
              <div className="bg-gray-100 border border-gray-300 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-600">{rejectedOffers.length}</div>
                <div className="text-sm text-gray-500">Declined</div>
              </div>
              <div className="bg-[#A6C1E4]/50 border border-[#A6C1E4] p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-[#2D317C]">{completedOffers.length}</div>
                <div className="text-sm text-[#2D317C]">Completed</div>
              </div>
            </div>

            {counterOffers.length > 0 && (
              <div className="border-l-4 border-[#A6C1E4] bg-[#A6C1E4]/20 p-4 rounded-r-lg">
                <h4 className="font-semibold text-[#2D317C] mb-2">Counter-Offers Received!</h4>
                <p className="text-sm text-[#2D317C]">
                  You have {counterOffers.length} counter-offer(s) waiting for your response.
                </p>
              </div>
            )}

            {acceptedOffers.length > 0 && (
              <div className="border-l-4 border-[#2D317C] bg-[#2D317C]/10 p-4 rounded-r-lg">
                <h4 className="font-semibold text-[#2D317C] mb-2">Action Required!</h4>
                <p className="text-sm text-[#2D317C]">
                  You have {acceptedOffers.length} accepted offer(s) waiting for payment. Complete payment within 48 hours.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {offers.map((offer: any) => (
                <div
                  key={offer.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  data-testid={`card-offer-${offer.id}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {offer.product?.imageUrl ? (
                        <img
                          src={offer.product.imageUrl}
                          alt={offer.product?.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                          <FiPackage className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{offer.product?.name || `Product #${offer.productId}`}</h4>
                        <p className="text-sm text-gray-500">
                          Submitted: {formatDate(offer.createdAt)}
                        </p>
                        {offer.message && (
                          <p className="text-sm text-gray-600 mt-1 italic">"{offer.message}"</p>
                        )}
                        {offer.adminResponse && (
                          <p className="text-sm text-primary mt-1">
                            <span className="font-medium">Response:</span> {offer.adminResponse}
                          </p>
                        )}
                        {offer.status === 'counter_sent' && offer.counterOfferAmount && (
                          <div className="mt-2 p-2 bg-[#A6C1E4]/20 border border-[#A6C1E4] rounded-md">
                            <p className="text-sm font-medium text-[#2D317C]">
                              Counter-Offer: £{parseFloat(offer.counterOfferAmount).toFixed(2)}
                            </p>
                            {offer.counterOfferMessage && (
                              <p className="text-sm text-[#2D317C]/70 italic mt-1">"{offer.counterOfferMessage}"</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(offer.status)}
                      <div className="text-right">
                        {/* Show counter-offer price only for counter_sent or accepted counter statuses */}
                        {offer.counterOfferAmount && ['counter_sent', 'user_accepted', 'accepted'].includes(offer.status) ? (
                          <>
                            <p className="text-lg font-bold text-[#2D317C]">
                              £{parseFloat(offer.counterOfferAmount).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500 line-through">
                              Your offer: £{parseFloat(offer.offerAmount).toFixed(2)}
                            </p>
                          </>
                        ) : (
                          <p className="text-lg font-bold text-[#2D317C]">
                            £{parseFloat(offer.offerAmount || '0').toFixed(2)}
                          </p>
                        )}
                        {offer.product?.price && (
                          <p className="text-xs text-gray-500">
                            Listed: £{parseFloat(offer.product.price).toFixed(2)}
                          </p>
                        )}
                      </div>
                      {offer.status === 'counter_sent' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => respondToCounterOffer.mutate({ offerId: offer.id, action: 'accept' })}
                            className="bg-[#2D317C] hover:bg-[#2D317C]/90 text-white"
                            size="sm"
                            disabled={respondToCounterOffer.isPending}
                            data-testid={`button-accept-counter-${offer.id}`}
                          >
                            Accept
                          </Button>
                          <Button
                            onClick={() => respondToCounterOffer.mutate({ offerId: offer.id, action: 'decline' })}
                            variant="outline"
                            className="border-[#2D317C] text-[#2D317C] hover:bg-[#2D317C]/10"
                            size="sm"
                            disabled={respondToCounterOffer.isPending}
                            data-testid={`button-decline-counter-${offer.id}`}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                      {(offer.status === 'accepted' || offer.status === 'user_accepted') && (
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs text-[#2D317C] font-medium">
                              Time left: {calculateTimeRemaining(offer.updatedAt)}
                            </p>
                          </div>
                          {isOfferInBasket(offer.id) ? (
                            <Button
                              variant="outline"
                              className="border-[#2D317C] text-[#2D317C]"
                              size="sm"
                              disabled
                              data-testid={`button-in-basket-${offer.id}`}
                            >
                              <FiShoppingBag className="mr-1 h-3 w-3" />
                              In Basket
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleAddToBasket(offer)}
                              variant="outline"
                              className="border-[#2D317C] text-[#2D317C] hover:bg-[#2D317C]/10"
                              size="sm"
                              data-testid={`button-add-basket-${offer.id}`}
                            >
                              <FiShoppingBag className="mr-1 h-3 w-3" />
                              Add to Basket
                            </Button>
                          )}
                          <Button
                            onClick={() => handleOfferPayment(offer)}
                            className="bg-[#2D317C] hover:bg-[#2D317C]/90 text-white"
                            size="sm"
                            data-testid={`button-pay-offer-${offer.id}`}
                          >
                            Pay Now
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// AcceptedOffersSection component with payment functionality and 48-hour deadline
function AcceptedOffersSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch accepted offers for the user
  const {
    data: acceptedOffers,
    isLoading: offersLoading,
    error: offersError,
  } = useQuery({
    queryKey: ["/api/users/me/offers", "accepted"],
    retry: false,
  });

  // Redirect to checkout for offer payment
  const handleOfferPayment = (offer: any) => {
    toast({
      title: "Redirecting to Checkout",
      description: "Taking you to complete your purchase...",
    });
    
    // Redirect to checkout with offerId parameter
    window.location.href = `/checkout?offerId=${offer.id}`;
  };

  // Calculate remaining payment time (48 hours from acceptance)
  const calculateTimeRemaining = (acceptedAt: string) => {
    const acceptedDate = new Date(acceptedAt);
    const deadline = new Date(acceptedDate.getTime() + 48 * 60 * 60 * 1000); // 48 hours
    const now = new Date();
    const remaining = deadline.getTime() - now.getTime();
    
    if (remaining <= 0) return "Expired";
    
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (offersLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Accepted Offers</CardTitle>
          <CardDescription>Offers that have been accepted and require payment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (offersError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Accepted Offers</CardTitle>
          <CardDescription>Offers that have been accepted and require payment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">Error loading accepted offers. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const offers = Array.isArray(acceptedOffers) ? acceptedOffers : [];
  const acceptedOffersList = offers.filter((offer: any) => offer.status === 'accepted');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accepted Offers</CardTitle>
        <CardDescription>
          Offers that have been accepted and require payment within 48 hours
        </CardDescription>
      </CardHeader>
      <CardContent>
        {acceptedOffersList.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <FiSend className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No Accepted Offers</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              When your offers are accepted, they'll appear here with payment options.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {acceptedOffersList.map((offer: any) => {
              const timeRemaining = calculateTimeRemaining(offer.updatedAt);
              const isExpired = timeRemaining === "Expired";
              
              return (
                <div key={offer.id} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      {offer.product?.imageUrl ? (
                        <img
                          src={offer.product.imageUrl}
                          alt={offer.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <FiPackage className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Offer Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">
                        {offer.product?.name || `Product #${offer.productId}`}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Offer: £{Number(offer.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Accepted on {new Date(offer.updatedAt).toLocaleDateString("en-GB")}
                      </p>
                      
                      {/* Payment Deadline */}
                      <div className="mt-2">
                        {isExpired ? (
                          <Badge variant="destructive" className="text-xs">
                            Payment Deadline Expired
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Payment due in: {timeRemaining}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Payment Button */}
                    <div className="flex-shrink-0">
                      {isExpired ? (
                        <Button variant="secondary" size="sm" disabled>
                          Expired
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleOfferPayment(offer)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <FiCreditCard className="w-4 h-4 mr-2" />
                          Pay £{Number(offer.amount).toFixed(2)}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// OrdersSection component with dropdown status and detailed order info
function OrdersSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ["/api/orders"],
    retry: false,
  });

  // Function to group order data by order ID
  const groupOrdersByOrderId = (orderRows: any[]) => {
    const orderMap = new Map();
    
    orderRows.forEach(row => {
      const orderId = row.orderId;
      if (!orderMap.has(orderId)) {
        orderMap.set(orderId, {
          id: orderId,
          createdAt: row.createdAt,
          status: row.status,
          items: [],
          total: 0,
          subtotal: 0,
          shipping: 7.50, // Standard shipping
          tax: 0
        });
      }
      
      const order = orderMap.get(orderId);
      order.items.push({
        productId: row.productId,
        name: row.productName,
        quantity: row.quantity,
        unitPrice: parseFloat(row.unitPrice),
        imageUrl: `https://images.unsplash.com/400x400/?product,${row.productName.replace(/\s+/g, ',')}`,
        description: row.productName
      });
      
      // Calculate totals
      const itemTotal = row.quantity * parseFloat(row.unitPrice);
      order.subtotal += itemTotal;
      order.tax = order.subtotal * 0.08; // 8% tax
      order.total = order.subtotal + order.shipping + order.tax;
    });
    
    return Array.from(orderMap.values());
  };

  // Group order data by order ID to create proper order objects
  const orders = ordersData ? groupOrdersByOrderId(ordersData) : [];
  
  // Debug logging (temporary)
  console.log("OrdersData:", ordersData);
  console.log("Processed Orders:", orders);



  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      processing: {
        label: "Processing",
        className: "bg-blue-100 text-blue-800",
      },
      shipped: { label: "Shipped", className: "bg-purple-100 text-purple-800" },
      delivered: {
        label: "Delivered",
        className: "bg-green-100 text-green-800",
      },
      cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
      paid: { label: "Paid", className: "bg-emerald-100 text-emerald-800" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };



  if (ordersLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (ordersError) {
    console.error("Orders Error:", ordersError);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>Error loading orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500">Failed to load orders: {ordersError.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            View your recent orders and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <FiShoppingBag className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No Orders Yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              You haven't placed any orders yet. Browse our products and add
              items to your cart to get started.
            </p>
            <Button
              className="mt-4"
              onClick={() => (window.location.href = "/shop")}
            >
              Start Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>
          View your recent orders and track their status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div
              key={order.id}
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-lg">Order #{order.id}</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-primary">
                    £{Number(order.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Detailed Product Information */}
              <div className="mb-4">
                <h5 className="font-medium text-sm mb-3">Items Ordered:</h5>
                <div className="space-y-3">
                  {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAyNFYzNk0zMiA0NEg0NFYzNkgzMlYyNEgyMFYzNkgzMlYyNFoiIHN0cm9rZT0iIzk0QTNCOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHN2Zz4K';
                            }}
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h6 className="font-medium text-sm truncate">
                            {item.name}
                          </h6>
                          <p className="text-xs text-gray-500 mt-1">
                            Product ID: {item.productId}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-600">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-xs text-gray-600">
                              £{Number(item.unitPrice).toFixed(2)} each
                            </span>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <span className="font-medium text-sm">
                            £{Number(item.quantity * item.unitPrice).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <h5 className="font-medium text-sm mb-2">Order Summary:</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>£{Number(order.subtotal || 0).toFixed(2)}</span>
                  </div>
                  {order.shipping && (
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>£{Number(order.shipping).toFixed(2)}</span>
                    </div>
                  )}
                  {order.tax && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>£{Number(order.tax).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t font-medium">
                    <span>Total:</span>
                    <span>£{Number(order.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Order Status and Actions */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium">Order Status:</span>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex items-center space-x-2">
                  {(order.status === "pending" || order.status === "accepted") && (
                    <Button 
                      size="sm" 
                      className="bg-primary hover:bg-primary-dark"
                      onClick={() => window.location.href = `/order-payment?orderId=${order.id}`}
                    >
                      <FiCreditCard className="w-4 h-4 mr-2" />
                      Pay Now
                    </Button>
                  )}
                  
                  {order.status === "shipped" && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <FiPackage className="mr-1" />
                      Package dispatched
                    </div>
                  )}
                  
                  {order.status === "delivered" && (
                    <div className="flex items-center text-green-600 text-sm">
                      <FiCheck className="mr-1" />
                      Order completed
                    </div>
                  )}
                  
                  {!["shipped", "delivered", "pending", "accepted"].includes(order.status) && (
                    <span className="text-sm text-muted-foreground">Contact us for updates</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SocialAccountsSection() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Fetch connected accounts
  const { data: connectedAccountsData = {}, refetch: refetchConnections } = useQuery({
    queryKey: ["connected-accounts"],
    queryFn: async () => {
      const res = await fetch("/api/social-auth/connected", {
        credentials: "include"
      });
      if (!res.ok) {
        if (res.status === 401) return {};
        throw new Error("Failed to fetch connected accounts");
      }
      const data = await res.json();
      return data.connectedAccounts || {};
    }
  });

  // Mock social sharing history - replace with actual API call later
  const { data: shareHistory = [] } = useQuery({
    queryKey: ["social-shares"],
    queryFn: async () => {
      // This would fetch actual social sharing data from the API
      return [
        {
          id: 1,
          platform: "instagram",
          raffleId: 46,
          raffleName: "First Auction",
          ticketsEarned: 3,
          dateShared: "2025-07-14T10:00:00Z",
          verified: true
        },
        {
          id: 2,
          platform: "facebook",
          raffleId: 46,
          raffleName: "First Auction",
          ticketsEarned: 2,
          dateShared: "2025-07-14T09:30:00Z",
          verified: false
        }
      ];
    }
  });

  const socialPlatforms = [
    {
      id: "instagram",
      name: "Instagram",
      icon: RiInstagramLine,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      description: "Share raffle posts and stories",
      benefit: "Enable automatic share verification"
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: RiFacebookLine,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      description: "Share to your timeline or groups",
      benefit: "Enable automatic share verification"
    },
    {
      id: "twitter",
      name: "Twitter/X",
      icon: RiTwitterLine,
      color: "text-slate-800",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-200",
      description: "Tweet about raffles",
      benefit: "Enable automatic share verification"
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: RiTiktokLine,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      description: "Create TikTok videos",
      benefit: "Enable automatic share verification"
    }
  ];

  const handleConnectAccount = async (platform: string) => {
    try {
      setLoading(prev => ({ ...prev, [platform]: true }));
      
      // Get OAuth URL from backend
      const res = await fetch(`/api/social-auth/oauth/${platform}/initiate`, {
        credentials: "include"
      });
      
      if (!res.ok) {
        throw new Error(`Failed to initiate ${platform} connection`);
      }
      
      const data = await res.json();
      
      if (data.oauthUrl) {
        // Open OAuth flow in popup window
        const popup = window.open(
          data.oauthUrl,
          `${platform}-auth`,
          'width=600,height=600,scrollbars=yes,resizable=yes'
        );
        
        // Listen for popup completion
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            setLoading(prev => ({ ...prev, [platform]: false }));
            // Refresh connections after popup closes
            refetchConnections();
          }
        }, 1000);
        
        toast({
          title: "Authorization Required",
          description: `Please complete the ${platform} authorization in the popup window.`,
        });
      } else {
        throw new Error("No OAuth URL provided");
      }
    } catch (error) {
      console.error(`Error connecting ${platform}:`, error);
      setLoading(prev => ({ ...prev, [platform]: false }));
      toast({
        title: "Connection Failed",
        description: `Unable to connect ${platform} account. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const handleDisconnectAccount = async (platform: string) => {
    try {
      setLoading(prev => ({ ...prev, [platform]: true }));
      
      const res = await fetch(`/api/social-auth/disconnect/${platform}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      if (!res.ok) {
        throw new Error(`Failed to disconnect ${platform} account`);
      }
      
      await refetchConnections();
      setLoading(prev => ({ ...prev, [platform]: false }));
      
      toast({
        title: "Account Disconnected",
        description: `Your ${platform} account has been disconnected.`,
      });
    } catch (error) {
      console.error(`Error disconnecting ${platform}:`, error);
      setLoading(prev => ({ ...prev, [platform]: false }));
      toast({
        title: "Disconnection Failed",
        description: `Unable to disconnect ${platform} account. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const totalTicketsEarned = shareHistory.reduce((total: number, share: any) => total + share.ticketsEarned, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiShare2 className="h-5 w-5" />
            Social Media Accounts
          </CardTitle>
          <CardDescription>
            Connect your social accounts to automatically verify shares. Ticket rewards vary by raffle.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              const isConnected = connectedAccountsData[platform.id];
              const isLoading = loading[platform.id];
              
              return (
                <div
                  key={platform.id}
                  className={`p-4 border rounded-lg ${platform.bgColor} ${platform.borderColor}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-6 w-6 ${platform.color}`} />
                      <div>
                        <h4 className="font-semibold">{platform.name}</h4>
                        <p className="text-sm text-gray-600">{platform.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{platform.benefit}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isConnected ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 text-green-600">
                            <FiCheckCircle className="h-4 w-4" />
                            <div>
                              <span className="text-sm font-medium">Connected</span>
                              {isConnected.profileName && (
                                <p className="text-xs text-gray-500">@{isConnected.profileName}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisconnectAccount(platform.id)}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-700"
                          >
                            {isLoading ? <FiLoader className="h-4 w-4 animate-spin" /> : "Disconnect"}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConnectAccount(platform.id)}
                          disabled={isLoading}
                          className="flex items-center gap-2"
                        >
                          {isLoading ? (
                            <FiLoader className="h-4 w-4 animate-spin" />
                          ) : (
                            <FiLink className="h-4 w-4" />
                          )}
                          {isLoading ? "Connecting..." : "Connect"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Current Status</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{totalTicketsEarned}</div>
                <div className="text-sm text-gray-600">Total Tickets Earned</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{shareHistory.filter((s: any) => s.verified).length}</div>
                <div className="text-sm text-gray-600">Verified Shares</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{Object.keys(connectedAccountsData).length}</div>
                <div className="text-sm text-gray-600">Connected Accounts</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Social Shares</CardTitle>
          <CardDescription>
            Your social sharing activity and earned rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shareHistory.length > 0 ? (
            <div className="space-y-3">
              {shareHistory.map((share: any) => {
                const platform = socialPlatforms.find(p => p.id === share.platform);
                const Icon = platform?.icon || FiShare2;
                
                return (
                  <div key={share.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${platform?.color || 'text-gray-600'}`} />
                      <div>
                        <div className="font-medium">{share.raffleName}</div>
                        <div className="text-sm text-gray-600">
                          Shared on {platform?.name} • {new Date(share.dateShared).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={share.verified ? "default" : "outline"}>
                        +{share.ticketsEarned} tickets
                      </Badge>
                      {share.verified ? (
                        <FiCheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <FiShare2 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No social shares yet</p>
              <p className="text-sm">Share raffles on social media to earn bonus tickets!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How Social Sharing Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <div>
                <h4 className="font-semibold">Share on Social Media</h4>
                <p className="text-sm text-gray-600">Click share buttons on raffle pages to post about raffles</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <div>
                <h4 className="font-semibold">Earn Bonus Tickets</h4>
                <p className="text-sm text-gray-600">Get free raffle tickets - amounts are set individually for each raffle</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <div>
                <h4 className="font-semibold">Verification (Coming Soon)</h4>
                <p className="text-sm text-gray-600">Connect accounts for automatic verification, or submit proof manually</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// My Bids Tab Content Component
function MyBidsTabContent() {
  const { data: bids = [], isLoading } = useQuery({
    queryKey: ["/api/auction/my-bids"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            <p className="ml-3">Loading your bids...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          My Auction Bids
        </CardTitle>
        <CardDescription>
          Track all your bids on auction lots
        </CardDescription>
      </CardHeader>
      <CardContent>
        {bids.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No bids yet</p>
            <p className="text-sm text-gray-400">Start bidding on auction lots to see them here!</p>
            <Link href="/auctions">
              <Button className="mt-4">Browse Auctions</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bids.map((bid: any) => (
              <Link key={bid.id} href={`/auctions/lots/${bid.lotId}`}>
                <div className="flex items-center gap-4 p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                  {bid.lotImageUrl && (
                    <img
                      src={bid.lotImageUrl}
                      alt={bid.lotTitle}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold">Lot {bid.lotNumber}: {bid.lotTitle}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Your bid: <span className="font-semibold text-primary">£{parseFloat(bid.bidAmount).toFixed(2)}</span>
                    </div>
                    {bid.currentBid && (
                      <div className="text-sm text-gray-600">
                        Current bid: £{parseFloat(bid.currentBid).toFixed(2)}
                      </div>
                    )}
                    {bid.status && (
                      <div className="mt-2">
                        <Badge className={
                          bid.status === 'winning' ? 'bg-green-500' :
                          bid.status === 'outbid' ? 'bg-red-500' :
                          bid.status === 'won' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }>
                          {bid.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(bid.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// My Wishlist Tab Content Component
function MyWishlistTabContent() {
  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ["/api/auction/my-wishlist"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            <p className="ml-3">Loading your watchlist...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FiHeart className="w-5 h-5 text-primary" />
          My Watchlist
        </CardTitle>
        <CardDescription>
          Lots you're watching
        </CardDescription>
      </CardHeader>
      <CardContent>
        {wishlist.length === 0 ? (
          <div className="text-center py-8">
            <FiHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No lots in your watchlist</p>
            <p className="text-sm text-gray-400">Add lots to your watchlist to track them!</p>
            <Link href="/auctions">
              <Button className="mt-4">Browse Auctions</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wishlist.map((item: any) => (
              <Link key={item.id} href={`/auctions/lots/${item.lotId}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    {item.lotImageUrl && (
                      <img
                        src={item.lotImageUrl}
                        alt={item.lotTitle}
                        className="w-full h-40 object-cover rounded mb-3"
                      />
                    )}
                    <div className="font-semibold">Lot {item.lotNumber}</div>
                    <div className="text-sm mt-1">{item.lotTitle}</div>
                    {item.currentBid && (
                      <div className="text-sm text-gray-600 mt-2">
                        Current bid: <span className="font-semibold">£{parseFloat(item.currentBid).toFixed(2)}</span>
                      </div>
                    )}
                    {item.estimatedValueLow && item.estimatedValueHigh && (
                      <div className="text-sm text-gray-600">
                        Est: £{item.estimatedValueLow} - £{item.estimatedValueHigh}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      Added: {new Date(item.addedAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Won Lots Tab Content Component
function WonLotsTabContent() {
  const [selectedCatalogId, setSelectedCatalogId] = React.useState<string | null>(null);
  const [manageShippingCatalogId, setManageShippingCatalogId] = React.useState<string | null>(null);

  const { data: wonCatalogs = [], isLoading } = useQuery({
    queryKey: ["/api/auction/my-won-lots"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            <p className="ml-3">Loading your won lots...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {wonCatalogs.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center py-8">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No won lots yet</p>
              <p className="text-sm text-gray-400">Your winning lots from live auctions will appear here!</p>
              <Link href="/auctions">
                <Button className="mt-4">Browse Auctions</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        wonCatalogs.map((catalog: any) => (
          <Card key={catalog.catalogId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    {catalog.catalogName}
                  </CardTitle>
                  <CardDescription>
                    Auction Date: {new Date(catalog.catalogDate).toLocaleDateString()} • {catalog.lots.length} lot{catalog.lots.length !== 1 ? 's' : ''} won
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    £{(catalog.totalValue || 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">Hammer Price Total</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {catalog.lots.map((lot: any) => (
                  <div 
                    key={lot.lotId} 
                    className="flex items-center gap-4 p-4 border rounded-lg bg-primary/5 border-primary/20"
                    data-testid={`won-lot-${lot.lotId}`}
                  >
                    {lot.lotImageUrl && (
                      <img
                        src={lot.lotImageUrl}
                        alt={lot.lotTitle}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">Lot {lot.lotNumber}</Badge>
                        <Badge className="bg-green-500 text-white">Won</Badge>
                      </div>
                      <div className="font-semibold">{lot.lotTitle}</div>
                      <div className="text-sm text-gray-600 mt-1">{lot.lotDescription}</div>
                      <div className="flex items-center gap-4 mt-2">
                        <div>
                          <span className="text-sm text-muted-foreground">Hammer Price: </span>
                          <span className="font-semibold text-primary">
                            {lot.hammerPrice ? `£${parseFloat(lot.hammerPrice).toFixed(2)}` : 'Price pending'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Sold: {new Date(lot.soldAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Manage Shipping Section */}
              <div className="mt-6">
                {manageShippingCatalogId === catalog.catalogId ? (
                  <Card className="border-2 border-primary">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <FiPackage className="h-5 w-5" />
                          Manage Shipping & Delivery
                        </CardTitle>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setManageShippingCatalogId(null)}
                        >
                          Close
                        </Button>
                      </div>
                      <CardDescription>
                        Select your preferred shipping method for each lot
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AuctionShippingSelector 
                        catalogId={catalog.catalogId}
                        lots={catalog.lots.map((lot: any) => ({
                          lotId: lot.lotId,
                          lotNumber: lot.lotNumber,
                          lotTitle: lot.lotTitle,
                          lotImageUrl: lot.lotImageUrl,
                          shippingBand: lot.shippingBand,
                        }))}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => setManageShippingCatalogId(catalog.catalogId)}
                      data-testid={`button-manage-shipping-${catalog.catalogId}`}
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      Manage Shipping
                    </Button>
                  </div>
                )}
              </div>

              {/* Invoice Section */}
              <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-primary mb-1">Invoice Available</p>
                    <p className="text-sm text-muted-foreground">
                      View or print your invoice with payment details (includes 20% buyer's premium)
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => setSelectedCatalogId(catalog.catalogId)}
                        data-testid={`button-view-invoice-${catalog.catalogId}`}
                      >
                        <FiPackage className="mr-2 h-4 w-4" />
                        View Invoice
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                      {selectedCatalogId === catalog.catalogId && (
                        <AuctionInvoice 
                          catalogId={catalog.catalogId}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

export default function MembersPage() {
  const { user, isAuthenticated, isLoading, refetch } = useAuth();
  const { openRegisterModal, openLoginModal } = useModals();
  const { toast } = useToast();
  // Get the URL parameter for tab
  const initialTab = (() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (
        tabParam === "raffle-tickets" ||
        tabParam === "account" ||
        tabParam === "accepted-offers" ||
        tabParam === "my-offers" ||
        tabParam === "wishlist" ||
        tabParam === "instant-wins" ||
        tabParam === "raffle-winnings" ||
        tabParam === "sell-items" ||
        tabParam === "my-bids" ||
        tabParam === "won-lots" ||
        tabParam === "my-wishlist" ||
        tabParam === "notifications"
      ) {
        return tabParam;
      }
    }
    return "account";
  })();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    firstName: null,
    lastName: null,
    email: null,
    username: null,
    profileImageUrl: null,
  });

  // Fetch user notifications
  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Initialize profile data when user data is available
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        profileImageUrl: user.profileImageUrl,
      });
    }
  }, [user]);

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle profile image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    try {
      // Set loading state
      toast({
        title: "Uploading...",
        description: "Your profile image is being uploaded.",
      });

      // Use the dedicated profile image upload endpoint
      const response = await fetch("/api/upload/profile-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setProfileData((prev) => ({
        ...prev,
        profileImageUrl: data.url,
      }));

      // Refresh user data after successful upload
      await refetch();

      toast({
        title: "Image Uploaded",
        description: "Your profile image has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload profile image. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle profile form submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUpdateError(null);

    try {
      // Call API to update user profile
      const response = await apiRequest(
        "PATCH",
        "/api/user/profile",
        profileData,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      // Refresh user data after successful update
      await refetch();

      // Show success message
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });

      // Exit edit mode
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setUpdateError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Authentication check with redirect
  useEffect(() => {
    console.log("Members page auth state:", {
      isLoading,
      isAuthenticated,
      hasUser: !!user,
    });
  }, [isLoading, isAuthenticated, user]);

  if (isLoading) {
    return <PageLoader message="Loading your member portal..." />;
  }

  // Show authentication required page if not authenticated
  if (!isLoading && !isAuthenticated) {
    return (
      <TransitionWrapper variant="sustainable">
        <SEOHead
          title="Member Portal - Login Required"
          description="Access your member portal at Lanora House. Log in or create an account to view your orders, offers, and wishlist."
          path="/members"
          noindex
        />
        
        <div className="container max-w-md mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                Member Portal
              </h1>
              <p className="text-lg text-muted-foreground">
                Please sign in to access your account
              </p>
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={openLoginModal}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                Sign In
              </Button>
              
              <Button 
                onClick={openRegisterModal}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Create Account
              </Button>
            </div>
            
            <div className="pt-4">
              <Button
                variant="ghost"
                onClick={() => window.location.href = "/"}
                className="text-sm"
              >
                ← Back to Home
              </Button>
            </div>
          </div>
        </div>
      </TransitionWrapper>
    );
  }

  // For debugging purposes - check if user data is loaded
  console.log("Member portal user data:", user);

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <TransitionWrapper variant="sustainable">
      <SEOHead
        title="Member Profile"
        description="View and manage your Lanora House member profile, purchase history, offers, and account settings."
        path="/members"
        noindex
      />

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="mb-2"
            onClick={() => (window.location.href = "/")}
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Member Dashboard
          </h1>
          <p className="text-lg text-muted-foreground mt-1">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
          </p>
        </div>

        {/* Profile Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="text-2xl font-bold">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {user?.email}
                  </div>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() => (window.location.href = "/api/logout")}
              >
                Sign Out
              </Button>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Horizontal Tab Layout */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
              <TabsList className="flex flex-wrap justify-center gap-1 h-auto p-2 bg-neutral-ivory/50 rounded-lg">
                <TabsTrigger value="account" className="flex-shrink-0 px-4 py-2 rounded-md">Account</TabsTrigger>
                <TabsTrigger value="purchase-history" className="flex-shrink-0 px-4 py-2 rounded-md">Purchase History</TabsTrigger>
                <TabsTrigger value="my-offers" className="flex-shrink-0 px-4 py-2 rounded-md">My Offers</TabsTrigger>
                <TabsTrigger value="sell-items" className="flex-shrink-0 px-4 py-2 rounded-md">Submit Items</TabsTrigger>
              </TabsList>

              <div className="mt-6">
                {/* Purchase History Tab */}
                <TabsContent value="purchase-history" className="space-y-6">
                  <PurchaseHistorySection />
                </TabsContent>

                {/* My Offers Tab */}
                <TabsContent value="my-offers" className="space-y-6">
                  <MyOffersSection />
                </TabsContent>

                <TabsContent value="account" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Information</CardTitle>
                      <CardDescription>
                        View and update your account details
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!isEditing ? (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4 mb-6">
                            <Avatar className="w-20 h-20">
                              <AvatarImage
                                src={user?.profileImageUrl || undefined}
                              />
                              <AvatarFallback className="text-xl">
                                {getInitials()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-lg font-medium">
                                {user?.firstName} {user?.lastName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {user?.email}
                              </p>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium">
                              Username
                            </label>
                            <div className="mt-1 p-2 border rounded-md">
                              {user?.username || "No username set"}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">
                                First Name
                              </label>
                              <div className="mt-1 p-2 border rounded-md">
                                {user?.firstName || "Not provided"}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Last Name
                              </label>
                              <div className="mt-1 p-2 border rounded-md">
                                {user?.lastName || "Not provided"}
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Email Address
                            </label>
                            <div className="mt-1 p-2 border rounded-md">
                              {user?.email || "No email provided"}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <form
                          onSubmit={handleProfileSubmit}
                          className="space-y-4"
                        >
                          <div className="flex items-center space-x-4 mb-6">
                            <div className="relative">
                              <Avatar className="w-20 h-20">
                                <AvatarImage
                                  src={profileData.profileImageUrl || undefined}
                                />
                                <AvatarFallback className="text-xl">
                                  {getInitials()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute bottom-0 right-0">
                                <label
                                  htmlFor="profileImage"
                                  className="cursor-pointer bg-primary text-white rounded-full p-1 shadow-md"
                                >
                                  <FiEdit2 size={16} />
                                  <input
                                    id="profileImage"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                  />
                                </label>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Upload a profile photo
                              </p>
                              <p className="text-xs text-muted-foreground">
                                JPG, PNG or GIF. Max 2MB.
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="username"
                              className="text-sm font-medium"
                            >
                              Username
                            </label>
                            <input
                              id="username"
                              name="username"
                              type="text"
                              className="w-full p-2 border rounded-md"
                              value={profileData.username || ""}
                              onChange={handleProfileChange}
                              placeholder="Choose a unique username"
                            />
                            <p className="text-xs text-muted-foreground">
                              This will be your public display name.
                            </p>
                          </div>

                          {/* Avatar Selection */}
                          <div className="space-y-3 mb-6">
                            <label className="text-sm font-medium">Maritime Avatar</label>
                            <div className="flex items-center space-x-4">
                              <Avatar className="w-20 h-20">
                                <AvatarImage src={user?.profileImageUrl || undefined} />
                                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                                  {getInitials()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <SimpleAvatarSelector 
                                  currentAvatar={user?.profileImageUrl || ''}
                                  onAvatarSelect={(avatarUrl) => {
                                    // Update user data immediately for UI
                                    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
                                  }}
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                  Choose your character avatar from Lanora's Crew
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label
                                htmlFor="firstName"
                                className="text-sm font-medium"
                              >
                                First Name
                              </label>
                              <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                className="w-full p-2 border rounded-md"
                                value={profileData.firstName || ""}
                                onChange={handleProfileChange}
                                placeholder="Enter your first name"
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="lastName"
                                className="text-sm font-medium"
                              >
                                Last Name
                              </label>
                              <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                className="w-full p-2 border rounded-md"
                                value={profileData.lastName || ""}
                                onChange={handleProfileChange}
                                placeholder="Enter your last name"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label
                              htmlFor="email"
                              className="text-sm font-medium"
                            >
                              Email Address
                            </label>
                            <input
                              id="email"
                              name="email"
                              type="email"
                              className="w-full p-2 border rounded-md"
                              value={profileData.email || ""}
                              onChange={handleProfileChange}
                              placeholder="Enter your email address"
                            />
                          </div>

                          <div className="flex space-x-2 pt-4">
                            <Button
                              type="submit"
                              disabled={isSubmitting}
                              className="bg-primary text-white hover:bg-primary/90"
                            >
                              {isSubmitting ? (
                                <span className="flex items-center">
                                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                  Saving...
                                </span>
                              ) : (
                                "Save Changes"
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsEditing(false)}
                            >
                              Cancel
                            </Button>
                          </div>

                          {updateError && (
                            <div className="text-red-500 mt-2 text-sm">
                              {updateError}
                            </div>
                          )}
                        </form>
                      )}
                    </CardContent>
                    <CardFooter>
                      {!isEditing ? (
                        <Button
                          onClick={() => {
                            setProfileData({
                              firstName: user?.firstName || "",
                              lastName: user?.lastName || "",
                              email: user?.email || "",
                              username: user?.username || "",
                              profileImageUrl: user?.profileImageUrl || "",
                            });
                            setIsEditing(true);
                          }}
                          variant="outline"
                          className="ml-auto"
                        >
                          <FiEdit2 className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Button>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Update your profile information
                        </p>
                      )}
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="wallet" className="space-y-6">
                  <WalletBalance />
                  <WalletTransactionHistory />
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FiBell className="h-5 w-5" />
                        Notifications
                      </CardTitle>
                      <CardDescription>
                        Stay updated with offers, orders, and account updates
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {notificationsLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                        </div>
                      ) : notifications && notifications.notifications && notifications.notifications.length > 0 ? (
                        <div className="space-y-4">
                          {notifications.notifications.map((notification: any) => (
                            <div key={notification.id} className={`p-4 border rounded-lg ${
                              notification.type === 'success' ? 'bg-green-50 border-green-200' :
                              notification.type === 'info' ? 'bg-blue-50 border-blue-200' :
                              'bg-neutral-50 border-neutral-200'
                            }`}>
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-sm text-neutral-800">{notification.message}</p>
                                  <p className="text-xs text-neutral-500 mt-1">
                                    {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString()}
                                  </p>
                                </div>
                                {notification.type === 'success' && (
                                  <div className="ml-2">
                                    <FiCheckCircle className="h-4 w-4 text-green-600" />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          {notifications.totalNotifications > notifications.notifications.length && (
                            <div className="text-center pt-4">
                              <p className="text-sm text-neutral-500">
                                Showing recent notifications. You have {notifications.totalNotifications} total notifications.
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                            <FiBell className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-medium">No Notifications</h3>
                          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                            You're all caught up! We'll notify you about offer updates, order status changes, and important account information.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>






                <TabsContent value="sell-items" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <FiUpload className="h-5 w-5" />
                            Sell Your Items
                          </CardTitle>
                          <CardDescription>
                            Submit your antiques and collectibles for professional valuation and direct sale
                          </CardDescription>
                        </div>
                        {!showItemForm && (
                          <Button onClick={() => setShowItemForm(true)}>
                            Submit New Item
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {showItemForm ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Submit New Item</h3>
                            <Button 
                              variant="outline" 
                              onClick={() => setShowItemForm(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                          <ItemSubmissionForm 
                            onSubmitSuccess={() => setShowItemForm(false)} 
                          />
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="grid md:grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-lg">
                            <div className="text-center">
                              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                                <FiUpload className="h-6 w-6 text-primary" />
                              </div>
                              <h4 className="font-semibold text-sm">Submit Photos</h4>
                              <p className="text-xs text-neutral-600">Upload clear photos of your item</p>
                            </div>
                            <div className="text-center">
                              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                                <FiClock className="h-6 w-6 text-primary" />
                              </div>
                              <h4 className="font-semibold text-sm">Expert Review</h4>
                              <p className="text-xs text-neutral-600">Our specialists evaluate your item</p>
                            </div>
                            <div className="text-center">
                              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                                <Coins className="h-6 w-6 text-primary" />
                              </div>
                              <h4 className="font-semibold text-sm">Get Paid</h4>
                              <p className="text-xs text-neutral-600">Receive payment after direct sale or consignment</p>
                            </div>
                          </div>
                          
                          <ItemSubmissionsList 
                            onAddNew={() => setShowItemForm(true)}
                            hideButton={true}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="raffle-tickets" className="space-y-6">
                  <div className="bg-red-100 p-4 rounded">
                    <h2 className="text-xl font-bold text-red-800">TEST - Raffle Tickets Section</h2>
                    <p className="text-red-600">This is a test to see if the tab content renders</p>
                  </div>
                  <PrizeDrawEntries />
                </TabsContent>

                <TabsContent value="withdraw" className="space-y-6">
                  <SimpleWithdrawalPage />
                </TabsContent>

                <TabsContent value="instant-wins" className="space-y-6">
                  <InstantWinHistory />
                </TabsContent>

                <TabsContent value="prize-draw-winnings" className="space-y-6">
                  <RaffleWinningsSection />
                </TabsContent>

                <TabsContent value="wishlist" className="space-y-6">
                  <WishlistSection />
                </TabsContent>



              </div>
        </Tabs>
      </div>
    </TransitionWrapper>
  );
}
