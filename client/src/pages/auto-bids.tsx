import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FiArrowLeft } from "react-icons/fi";
import AutoBidsList from "@/components/auction/AutoBidsList";
import PaymentMethods from "@/components/payment/PaymentMethods";

export default function AutoBidsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("auto-bids");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/api/login";
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Auto Bids & Payment Methods | LANORA HOUSE</title>
        <meta name="description" content="Manage your auto bids and payment methods for auctions at LANORA HOUSE." />
      </Helmet>

      <div className="container max-w-6xl py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="mb-2"
            type="button"
            onClick={() => {
              // Using the native browser navigation for hard redirects
              document.location.href = "/members";
            }}
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Member Profile
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Auto Bids & Payment Methods</h1>
          <p className="text-lg text-muted-foreground mt-1">
            Manage your auto bids and payment methods for auctions
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="auto-bids">Auto Bids</TabsTrigger>
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="auto-bids" className="space-y-6">
              <AutoBidsList />
            </TabsContent>
            
            <TabsContent value="payment-methods" className="space-y-6">
              <PaymentMethods />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
}