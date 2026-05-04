import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CalendarIcon, Clock, Map, Video, Image, Edit, 
  Plus, Trash2, Eye, MoreHorizontal
} from "lucide-react";
import { CatalogItemForm } from "./CatalogItemForm";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CatalogItem {
  id: string;
  catalogId: string;
  itemNumber: string;
  title: string;
  description: string;
  estimate: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

interface Catalog {
  id: string;
  name: string;
  description: string;
  eventDate: string;
  status: string;
  imageUrl: string | null;
  location: string | null;
  isOnline: boolean;
  streamUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CatalogViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  catalogId: string;
}

export function CatalogViewDialog({ isOpen, onClose, catalogId }: CatalogViewDialogProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const { toast } = useToast();

  // Fetch catalog details with admin auth headers
  const { data: catalog, isLoading: loadingCatalog } = useQuery({
    queryKey: ["/api/auction-catalogs", catalogId],
    enabled: isOpen && !!catalogId,
    staleTime: 0,
    gcTime: 0,
    queryFn: async () => {
      const adminEmail = localStorage.getItem("adminEmail");
      const adminPassword = localStorage.getItem("adminPassword");
      
      if (!adminEmail || !adminPassword) {
        throw new Error("Admin credentials not found");
      }
      
      console.log("Added admin auth headers");
      
      const response = await fetch(`/api/auction-catalogs/${catalogId}`, {
        headers: {
          "X-Admin-Email": adminEmail,
          "X-Admin-Password": adminPassword,
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error fetching catalog: ${errorText}`);
      }
      
      return response.json();
    }
  });

  // Fetch catalog items with admin auth headers
  const { data: itemsData, isLoading: loadingItems, refetch: refetchItems } = useQuery({
    queryKey: ["/api/catalog-items", catalogId],
    enabled: isOpen && !!catalogId,
    staleTime: 0,
    gcTime: 0,
    queryFn: async () => {
      // Get admin credentials from localStorage
      const adminEmail = localStorage.getItem("adminEmail");
      const adminPassword = localStorage.getItem("adminPassword");
      
      if (!adminEmail || !adminPassword) {
        throw new Error("Admin credentials not found");
      }
      
      console.log("Fetching catalog items with admin auth");
      
      // Make the request with admin headers
      const response = await fetch(`/api/catalog-items?catalogId=${catalogId}`, {
        headers: {
          "X-Admin-Email": adminEmail,
          "X-Admin-Password": adminPassword,
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error fetching catalog items: ${errorText}`);
      }
      
      return response.json();
    }
  });

  // Extract catalog items with proper fallback
  const catalogItems = itemsData ? (itemsData.items || []) : [];

  // Handle deleting a catalog item
  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        // Get admin credentials from localStorage
        const adminEmail = localStorage.getItem("adminEmail");
        const adminPassword = localStorage.getItem("adminPassword");
        
        if (!adminEmail || !adminPassword) {
          toast({
            title: "Authentication Error",
            description: "You must be logged in as admin to delete items",
            variant: "destructive",
          });
          return;
        }
        
        // Create authorization header
        const headers = {
          "Authorization": `Basic ${btoa(`${adminEmail}:${adminPassword}`)}`,
          "Content-Type": "application/json",
        };
        
        const response = await fetch(`/api/catalog-items/${itemId}`, {
          method: "DELETE",
          headers,
        });
        
        if (!response.ok) {
          throw new Error("Failed to delete catalog item");
        }
        
        // Show success message
        toast({
          title: "Success",
          description: "Catalog item deleted successfully",
        });
        
        // Refresh the items list
        refetchItems();
        
      } catch (error) {
        console.error("Error deleting catalog item:", error);
        toast({
          title: "Error",
          description: "Failed to delete catalog item",
          variant: "destructive",
        });
      }
    }
  };

  // Handle adding a new item
  const handleItemAdded = () => {
    setShowAddItemForm(false);
    refetchItems();
    
    // Show success message
    toast({
      title: "Success",
      description: "Item added to catalog successfully",
    });
  };

  if (loadingCatalog) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading catalog details...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (!catalog) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Catalog Not Found</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  // Safely extract catalog data with proper typing
  const catalogData = catalog?.catalog as Catalog;
  
  if (!catalogData) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading Catalog</DialogTitle>
            <p className="text-muted-foreground">Please wait while we load the catalog information...</p>
          </DialogHeader>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{catalogData.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Catalog Details</TabsTrigger>
            <TabsTrigger value="items">Catalog Items</TabsTrigger>
          </TabsList>
          
          {/* Catalog Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{catalogData.description}</p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    <span>
                      Event Date: {new Date(catalogData.eventDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>
                      Status: <span className="capitalize">{catalogData.status}</span>
                    </span>
                  </div>
                  
                  {catalogData.location && (
                    <div className="flex items-center gap-2">
                      <Map className="w-4 h-4 text-muted-foreground" />
                      <span>Location: {catalogData.location}</span>
                    </div>
                  )}
                  
                  {catalogData.isOnline && (
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {catalogData.streamUrl 
                          ? `Stream URL: ${catalogData.streamUrl}` 
                          : "Online Event (No Stream URL Set)"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                {catalogData.imageUrl ? (
                  <div className="rounded-md overflow-hidden h-48 bg-muted">
                    <img 
                      src={catalogData.imageUrl} 
                      alt={catalogData.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="rounded-md overflow-hidden h-48 bg-muted flex items-center justify-center">
                    <Image className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Catalog Items Tab */}
          <TabsContent value="items" className="space-y-4">
            {showAddItemForm ? (
              <CatalogItemForm 
                catalogId={catalogId}
                onItemAdded={handleItemAdded}
                onCancel={() => setShowAddItemForm(false)}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Lots in this Catalog</h3>
                  <Button onClick={() => setShowAddItemForm(true)} size="lg" className="bg-primary">
                    <Plus className="mr-2 h-4 w-4" /> Add Lots
                  </Button>
                </div>
                
                {loadingItems ? (
                  <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                    <p className="mt-2">Loading catalog items...</p>
                  </div>
                ) : catalogItems.length === 0 ? (
                  <div className="text-center py-8 border rounded-md">
                    <p className="text-muted-foreground">No items in this catalog yet.</p>
                    <Button 
                      size="lg"
                      className="mt-4 bg-primary"
                      onClick={() => setShowAddItemForm(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add First Lot
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {catalogItems.map((item: CatalogItem) => (
                      <Card key={item.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm text-muted-foreground">Lot #{item.itemNumber}</div>
                              <CardTitle className="text-xl">{item.title}</CardTitle>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onSelect={() => {
                                    // View functionality - could open a details dialog
                                    alert(`Viewing details for: ${item.title}`);
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-2" /> View
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onSelect={() => {
                                    // Edit functionality - will be implemented later
                                    alert(`Edit functionality for "${item.title}" will be implemented soon`);
                                  }}
                                >
                                  <Edit className="w-4 h-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onSelect={() => handleDeleteItem(item.id)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {item.images && item.images.length > 0 ? (
                            <div className="rounded-md overflow-hidden h-40 bg-muted mb-3">
                              <img 
                                src={item.images[0]} 
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="rounded-md overflow-hidden h-40 bg-muted flex items-center justify-center mb-3">
                              <Image className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                          
                          {item.description && (
                            <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                          )}
                        </CardContent>
                        {item.estimate && (
                          <CardFooter className="pt-0">
                            <div className="text-sm font-medium">
                              Estimate: {item.estimate}
                            </div>
                          </CardFooter>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}