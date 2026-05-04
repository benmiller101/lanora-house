import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiGlobe, FiCreditCard, FiMail, FiKey, FiSave } from "react-icons/fi";
import { Hammer, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { useToast } from "@/hooks/use-toast";

interface AuctionSettings {
  id?: number;
  nextAuctionDate: string;
  catalogueImageUrl: string | null;
  catalogueLink: string | null;
  auctionScheduleText: string;
  locationText: string;
}

export default function SettingsPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get("tab") || "general";
  const [activeTab, setActiveTab] = useState(initialTab);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: auctionSettings, isLoading: auctionLoading } = useQuery<AuctionSettings>({
    queryKey: ["/api/auction-homepage-settings"],
  });

  const [auctionForm, setAuctionForm] = useState<AuctionSettings>({
    nextAuctionDate: "",
    catalogueImageUrl: null,
    catalogueLink: null,
    auctionScheduleText: "",
    locationText: "",
  });
  const [auctionFormLoaded, setAuctionFormLoaded] = useState(false);

  useEffect(() => {
    if (auctionSettings) {
      setAuctionForm({
        nextAuctionDate: auctionSettings.nextAuctionDate || "",
        catalogueImageUrl: auctionSettings.catalogueImageUrl || null,
        catalogueLink: auctionSettings.catalogueLink || null,
        auctionScheduleText: auctionSettings.auctionScheduleText || "",
        locationText: auctionSettings.locationText || "",
      });
      setAuctionFormLoaded(true);
    }
  }, [auctionSettings]);

  const handleSaveAuction = () => {
    if (!auctionForm.nextAuctionDate.trim()) {
      toast({ title: "Validation Error", description: "Next auction date is required.", variant: "destructive" });
      return;
    }
    const payload = {
      ...auctionForm,
      catalogueImageUrl: auctionForm.catalogueImageUrl?.trim() || null,
      catalogueLink: auctionForm.catalogueLink?.trim() || null,
    };
    auctionMutation.mutate(payload);
  };

  const auctionMutation = useMutation({
    mutationFn: async (data: AuctionSettings) => {
      const res = await apiRequest("PUT", "/api/admin/auction-homepage-settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auction-homepage-settings"] });
      toast({ title: "Saved", description: "Auction homepage settings updated successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save auction settings.", variant: "destructive" });
    },
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully.",
    });
  };

  return (
    <>
      <Helmet>
        <title>Settings | Admin | LANORA HOUSE</title>
        <meta name="description" content="Admin settings for LANORA HOUSE." />
      </Helmet>
      
      <div className="bg-neutral-ivory min-h-screen py-8">
        <div className="container mx-auto px-4">
          <AdminNavigation />
          
          <div className="mb-6">
            <h1 className="font-display text-3xl mb-2">Settings</h1>
            <p className="text-neutral-wood">Configure your store settings</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
            <Card className="h-fit">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-1 items-start justify-start">
                  <button 
                    onClick={() => setActiveTab("general")}
                    className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeTab === "general" ? "bg-primary/10 text-primary" : "hover:bg-gray-100"}`}
                  >
                    <FiGlobe className="mr-2" /> General
                  </button>
                  <button 
                    onClick={() => setActiveTab("payment")}
                    className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeTab === "payment" ? "bg-primary/10 text-primary" : "hover:bg-gray-100"}`}
                  >
                    <FiCreditCard className="mr-2" /> Payment
                  </button>
                  <button 
                    onClick={() => setActiveTab("email")}
                    className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeTab === "email" ? "bg-primary/10 text-primary" : "hover:bg-gray-100"}`}
                  >
                    <FiMail className="mr-2" /> Email
                  </button>
                  <button 
                    onClick={() => setActiveTab("auction")}
                    className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeTab === "auction" ? "bg-primary/10 text-primary" : "hover:bg-gray-100"}`}
                  >
                    <Hammer className="mr-2 h-4 w-4" /> Auction Info
                  </button>
                  <button 
                    onClick={() => setActiveTab("api")}
                    className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeTab === "api" ? "bg-primary/10 text-primary" : "hover:bg-gray-100"}`}
                  >
                    <FiKey className="mr-2" /> API Keys
                  </button>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              {activeTab === "general" && (
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Basic store configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="text-sm font-medium">Site Name</label>
                      <Input 
                        defaultValue="LANORA HOUSE"
                        className="mt-1.5"
                      />
                      <p className="text-sm text-muted-foreground mt-1.5">
                        The name of your store as it appears to customers
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Site Description</label>
                      <Input 
                        defaultValue="Established 2023 - Antiques and Collectibles"
                        className="mt-1.5"
                      />
                      <p className="text-sm text-muted-foreground mt-1.5">
                        A brief description of your store
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Contact Email</label>
                      <Input 
                        defaultValue="info@lanorahouse.com"
                        type="email"
                        className="mt-1.5"
                      />
                      <p className="text-sm text-muted-foreground mt-1.5">
                        Primary contact email address
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Contact Phone</label>
                      <Input 
                        defaultValue="07843930927"
                        className="mt-1.5"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Contact Address</label>
                      <Textarea 
                        defaultValue="Lanarth House, TR27 4NQ, Penpol avenue, Cornwall"
                        className="mt-1.5 min-h-[80px]"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <label className="text-base font-medium">Maintenance Mode</label>
                        <p className="text-sm text-muted-foreground">
                          When enabled, the site will display a maintenance message to visitors
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4">
                    <Button onClick={handleSave} className="ml-auto">
                      <FiSave className="mr-2" /> Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              {activeTab === "payment" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Settings</CardTitle>
                    <CardDescription>Configure store payment options</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium">Currency</label>
                        <Input 
                          defaultValue="GBP"
                          className="mt-1.5"
                        />
                        <p className="text-sm text-muted-foreground mt-1.5">
                          Currency code (e.g., GBP, USD, EUR)
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Currency Symbol</label>
                        <Input 
                          defaultValue="£"
                          className="mt-1.5"
                        />
                        <p className="text-sm text-muted-foreground mt-1.5">
                          Currency symbol (e.g., £, $, €)
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <h3 className="text-lg font-medium">Payment Gateways</h3>
                    
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <label className="text-base font-medium">Stripe</label>
                        <p className="text-sm text-muted-foreground">
                          Accept credit/debit card payments via Stripe
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <label className="text-base font-medium">PayPal</label>
                        <p className="text-sm text-muted-foreground">
                          Accept payments via PayPal
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4">
                    <Button onClick={handleSave} className="ml-auto">
                      <FiSave className="mr-2" /> Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              {activeTab === "email" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Email Settings</CardTitle>
                    <CardDescription>Configure transactional emails</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium">From Name</label>
                        <Input 
                          defaultValue="LANORA HOUSE"
                          className="mt-1.5"
                        />
                        <p className="text-sm text-muted-foreground mt-1.5">
                          Name that appears in the email "From" field
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">From Email</label>
                        <Input 
                          defaultValue="info@lanorahouse.co.uk"
                          type="email"
                          className="mt-1.5"
                        />
                        <p className="text-sm text-muted-foreground mt-1.5">
                          Email address that appears in the "From" field
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <label className="text-base font-medium">SendGrid Integration</label>
                        <p className="text-sm text-muted-foreground">
                          Use SendGrid for sending transactional emails
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Email Footer Text</label>
                      <Textarea 
                        defaultValue="© 2023 LANORA HOUSE. All rights reserved."
                        className="mt-1.5 min-h-[80px]"
                      />
                      <p className="text-sm text-muted-foreground mt-1.5">
                        Text to display at the bottom of all emails
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4">
                    <Button onClick={handleSave} className="ml-auto">
                      <FiSave className="mr-2" /> Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              {activeTab === "auction" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hammer className="h-5 w-5" />
                      Auction Homepage Settings
                    </CardTitle>
                    <CardDescription>Edit the auction information shown on the homepage</CardDescription>
                  </CardHeader>
                  {auctionLoading ? (
                    <CardContent className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </CardContent>
                  ) : (
                  <CardContent className="space-y-6">
                    <div>
                      <label className="text-sm font-medium">Next Auction Date *</label>
                      <Input
                        value={auctionForm.nextAuctionDate}
                        onChange={(e) => setAuctionForm(prev => ({ ...prev, nextAuctionDate: e.target.value }))}
                        placeholder="e.g., Wednesday 6th May 2026"
                        className="mt-1.5"
                      />
                      <p className="text-sm text-muted-foreground mt-1.5">
                        This is displayed on the homepage as "Our Next Auction: ..."
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Schedule Text</label>
                      <Input
                        value={auctionForm.auctionScheduleText}
                        onChange={(e) => setAuctionForm(prev => ({ ...prev, auctionScheduleText: e.target.value }))}
                        placeholder="Auctions Held On The First Wednesday Of Every Month at 5PM"
                        className="mt-1.5"
                      />
                      <p className="text-sm text-muted-foreground mt-1.5">
                        The main heading text on the auction section
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Location</label>
                      <Input
                        value={auctionForm.locationText}
                        onChange={(e) => setAuctionForm(prev => ({ ...prev, locationText: e.target.value }))}
                        placeholder="The Old Foundry Chapel, Hayle, Cornwall"
                        className="mt-1.5"
                      />
                    </div>

                    <Separator />

                    <div>
                      <label className="text-sm font-medium">Catalogue Image URL</label>
                      <Input
                        value={auctionForm.catalogueImageUrl || ""}
                        onChange={(e) => setAuctionForm(prev => ({ ...prev, catalogueImageUrl: e.target.value }))}
                        placeholder="https://example.com/catalogue-image.jpg"
                        className="mt-1.5"
                      />
                      <p className="text-sm text-muted-foreground mt-1.5">
                        Image displayed in the "View Catalogue" card on the homepage
                      </p>
                      {auctionForm.catalogueImageUrl && (
                        <div className="mt-3 rounded-lg overflow-hidden border max-w-sm">
                          <img
                            src={auctionForm.catalogueImageUrl}
                            alt="Catalogue preview"
                            className="w-full h-40 object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium">Catalogue Link</label>
                      <Input
                        value={auctionForm.catalogueLink || ""}
                        onChange={(e) => setAuctionForm(prev => ({ ...prev, catalogueLink: e.target.value }))}
                        placeholder="/auctions or https://example.com/catalogue"
                        className="mt-1.5"
                      />
                      <p className="text-sm text-muted-foreground mt-1.5">
                        Where clicking the catalogue image takes the user (e.g., /auctions/1 or an external link)
                      </p>
                    </div>
                  </CardContent>
                  )}
                  <CardFooter className="border-t px-6 py-4">
                    <Button
                      onClick={handleSaveAuction}
                      disabled={auctionMutation.isPending || auctionLoading}
                      className="ml-auto"
                    >
                      {auctionMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <FiSave className="mr-2" />
                      )}
                      Save Auction Settings
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {activeTab === "api" && (
                <Card>
                  <CardHeader>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>Manage external service integrations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">Stripe</h3>
                          <p className="text-muted-foreground">Payment processing</p>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-green-700 px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-700">Connected</span>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                          <div>
                            <label htmlFor="stripePublicKey" className="text-sm font-medium">Public Key</label>
                            <div className="flex items-center mt-1.5">
                              <Input
                                id="stripePublicKey"
                                value="pk_•••••••••••••••••••••••••••••"
                                readOnly
                                className="font-mono text-sm bg-muted"
                              />
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="mt-6">
                            Update
                          </Button>
                        </div>
                        <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                          <div>
                            <label htmlFor="stripeSecretKey" className="text-sm font-medium">Secret Key</label>
                            <div className="flex items-center mt-1.5">
                              <Input
                                id="stripeSecretKey"
                                value="sk_•••••••••••••••••••••••••••••"
                                readOnly
                                className="font-mono text-sm bg-muted"
                              />
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="mt-6">
                            Update
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">SendGrid</h3>
                          <p className="text-muted-foreground">Email delivery service</p>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-orange-700 px-2.5 py-0.5 text-xs font-semibold bg-orange-50 text-orange-700">Not Connected</span>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                          <div>
                            <label htmlFor="sendgridApiKey" className="text-sm font-medium">API Key</label>
                            <div className="flex items-center mt-1.5">
                              <Input
                                id="sendgridApiKey"
                                placeholder="Enter your SendGrid API key"
                                className="font-mono text-sm"
                              />
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="mt-6">
                            Connect
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm">
                      Note: API keys are sensitive information. They are stored securely and never displayed in full.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}