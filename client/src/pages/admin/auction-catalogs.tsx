import { useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiCalendar,
  FiClock,
  FiPackage,
  FiArrowLeft,
  FiUpload,
  FiMonitor
} from "react-icons/fi";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AdminNavigation } from "@/components/admin/AdminNavigation";

// Define catalog schema
const catalogSchema = z.object({
  name: z.string().min(3, "Catalog name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(), // Optional - end time varies during live auction
  status: z.string(),
  imageUrl: z.string().optional(),
});

type CatalogFormValues = z.infer<typeof catalogSchema>;

type AuctionCatalog = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string; // Optional - end time varies during live auction
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  itemCount: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

type AuctionItem = {
  id: string;
  name: string;
  description: string;
  startingBid: string;
  currentBid: string | null;
  catalogId: string;
  imageUrl: string;
  status: string;
  createdAt: string;
};

export default function AuctionCatalogsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isItemsDialogOpen, setIsItemsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<AuctionCatalog | null>(null);
  const [selectedTab, setSelectedTab] = useState("all");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [bulkImages, setBulkImages] = useState<FileList | null>(null);

  // Form for creating/editing catalogs
  const form = useForm<CatalogFormValues>({
    resolver: zodResolver(catalogSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      status: "draft",
      imageUrl: "",
    },
  });

  // Fetch auction catalogs
  const { data: catalogs = [], isLoading } = useQuery({
    queryKey: ['/api/admin/auction-catalogues'],
    staleTime: 10000,
    placeholderData: []
  });

  // Fetch items for a specific catalog
  const { data: catalogItems = [], isLoading: isLoadingItems } = useQuery({
    queryKey: [`/api/admin/auction-catalogues/${selectedCatalog?.id}/lots`],
    enabled: !!selectedCatalog?.id && isItemsDialogOpen,
    staleTime: 10000,
    placeholderData: []
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CatalogFormValues) => {
      return apiRequest("POST", "/api/admin/auction-catalogues", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['/api/admin/auction-catalogues']});
      toast({ 
        title: "Success",
        description: "Auction catalog created successfully",
      });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error",
        description: error.message || "Failed to create auction catalog",
        variant: "destructive"
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: CatalogFormValues & { id: string }) => {
      return apiRequest("PUT", `/api/admin/auction-catalogues/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['/api/admin/auction-catalogues']});
      toast({ 
        title: "Success",
        description: "Auction catalog updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedCatalog(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error",
        description: error.message || "Failed to update auction catalog",
        variant: "destructive"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return apiRequest("DELETE", `/api/admin/auction-catalogues/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['/api/admin/auction-catalogues']});
      toast({ 
        title: "Success",
        description: "Auction catalog deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error",
        description: error.message || "Failed to delete auction catalog",
        variant: "destructive"
      });
    }
  });

  // Import CSV mutation
  const importCsvMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`/api/auction-catalogs/${selectedCatalog?.id}/import`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to import items');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['/api/auction-catalogs']});
      queryClient.invalidateQueries({queryKey: ['/api/auction-items', selectedCatalog?.id]});
      toast({ 
        title: "Success",
        description: "Items imported successfully",
      });
      setIsImportDialogOpen(false);
      setCsvFile(null);
      setBulkImages(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error",
        description: error.message || "Failed to import items",
        variant: "destructive"
      });
    }
  });

  // Handle form submission for creating a catalog
  const onCreateSubmit = (data: CatalogFormValues) => {
    createMutation.mutate(data);
  };

  // Handle form submission for updating a catalog
  const onUpdateSubmit = (data: CatalogFormValues) => {
    if (selectedCatalog) {
      updateMutation.mutate({ ...data, id: selectedCatalog.id });
    }
  };

  // Handle edit button click
  const handleEdit = (catalog: AuctionCatalog) => {
    setSelectedCatalog(catalog);
    // Format datetime for datetime-local input (YYYY-MM-DDTHH:mm)
    const startDateTime = new Date(catalog.startDate).toISOString().slice(0, 16);
    
    form.reset({
      name: catalog.name,
      description: catalog.description,
      startDate: startDateTime,
      endDate: catalog.endDate ? new Date(catalog.endDate).toISOString().slice(0, 16) : undefined,
      status: catalog.status,
      imageUrl: catalog.imageUrl || "",
    });
    setIsEditDialogOpen(true);
  };

  // Handle view items click
  const handleViewItems = (catalog: AuctionCatalog) => {
    setSelectedCatalog(catalog);
    setIsItemsDialogOpen(true);
  };

  // Handle import button click
  const handleImport = (catalog: AuctionCatalog) => {
    setSelectedCatalog(catalog);
    setIsImportDialogOpen(true);
  };

  // Handle delete button click
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this catalog?')) {
      deleteMutation.mutate(id);
    }
  };

  // Handle CSV file upload
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
    }
  };

  // Handle bulk images upload
  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setBulkImages(e.target.files);
    }
  };

  // Handle import submission
  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      toast({
        title: "Error",
        description: "Please select a CSV file",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append('csv', csvFile);
    
    if (bulkImages) {
      for (let i = 0; i < bulkImages.length; i++) {
        formData.append('images', bulkImages[i]);
      }
    }

    importCsvMutation.mutate(formData);
  };

  // Filter catalogs based on tab
  const filteredCatalogs = catalogs.filter((catalog: AuctionCatalog) => {
    if (selectedTab === "all") return true;
    return catalog.status === selectedTab;
  });

  // Format date function
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <>
      <Helmet>
        <title>Auction Catalogs | Admin | LANORA HOUSE</title>
        <meta name="description" content="Manage auction catalogs for LANORA HOUSE." />
      </Helmet>
      
      <div className="bg-neutral-ivory min-h-screen py-8">
        <AdminNavigation />
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Button
                variant="ghost"
                className="mb-4"
                onClick={() => setLocation("/admin")}
              >
                <FiArrowLeft className="mr-2" /> Back to Dashboard
              </Button>
              <h1 className="font-display text-3xl mb-2">Auction Catalogs</h1>
              <p className="text-neutral-wood">Manage your auction catalogs and their items</p>
            </div>
            <Button onClick={() => {
              form.reset({
                name: "",
                description: "",
                startDate: "",
                endDate: "",
                status: "draft",
                imageUrl: "",
              });
              setIsAddDialogOpen(true);
            }}>
              <FiPlus className="mr-2" /> Add Catalog
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="bg-neutral-paper">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="draft">Draft</TabsTrigger>
                  <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : filteredCatalogs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-neutral-wood">No catalogs found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Date & Time</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCatalogs.map((catalog: AuctionCatalog) => (
                      <TableRow key={catalog.id}>
                        <TableCell className="font-medium">{catalog.name}</TableCell>
                        <TableCell>
                          <Badge variant={
                            catalog.status === "active" ? "success" :
                            catalog.status === "scheduled" ? "warning" :
                            catalog.status === "completed" ? "secondary" :
                            catalog.status === "cancelled" ? "destructive" :
                            "outline"
                          }>
                            {catalog.status.charAt(0).toUpperCase() + catalog.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(catalog.startDate)}</TableCell>
                        <TableCell>{catalog.itemCount || 0}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setLocation(`/admin/live-auction/${catalog.id}`)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <FiMonitor className="mr-1" /> Live Control
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewItems(catalog)}
                          >
                            <FiEye className="mr-1" /> Items
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleImport(catalog)}
                          >
                            <FiUpload className="mr-1" /> Import
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEdit(catalog)}
                          >
                            <FiEdit2 className="mr-1" /> Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDelete(catalog.id)}
                          >
                            <FiTrash2 className="mr-1" /> Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Add Catalog Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Add New Auction Catalog</DialogTitle>
            <DialogDescription>Create a new auction catalog to group auction items.</DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catalog Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Spring 2023 Antiques" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A collection of fine antiques from the 19th century..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Auction Start Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>
                      When the auction will begin. A countdown timer will be displayed on the site.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormItem>
                <FormLabel>Catalog Image</FormLabel>
                <FormControl>
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const formData = new FormData();
                        formData.append('image', file);
                        try {
                          const response = await fetch('/api/admin/upload/catalog-image', {
                            method: 'POST',
                            body: formData,
                            credentials: 'include',
                            headers: {
                              'x-admin-email': localStorage.getItem('adminEmail') || '',
                              'x-admin-password': localStorage.getItem('adminPassword') || '',
                            },
                          });
                          if (response.ok) {
                            const data = await response.json();
                            form.setValue('imageUrl', data.url);
                            toast({ title: "Image uploaded successfully" });
                          }
                        } catch (error) {
                          toast({ title: "Failed to upload image", variant: "destructive" });
                        }
                      }
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Upload an image for this catalog (JPEG, PNG, or WebP)
                </FormDescription>
                <FormMessage />
              </FormItem>
              
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Catalog"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Catalog Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Edit Auction Catalog</DialogTitle>
            <DialogDescription>Update auction catalog details.</DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onUpdateSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catalog Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Spring 2023 Antiques" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A collection of fine antiques from the 19th century..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Auction Start Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>
                      When the auction will begin. A countdown timer will be displayed on the site.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormItem>
                <FormLabel>Catalog Image</FormLabel>
                <FormControl>
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const formData = new FormData();
                        formData.append('image', file);
                        try {
                          const response = await fetch('/api/admin/upload/catalog-image', {
                            method: 'POST',
                            body: formData,
                            credentials: 'include',
                            headers: {
                              'x-admin-email': localStorage.getItem('adminEmail') || '',
                              'x-admin-password': localStorage.getItem('adminPassword') || '',
                            },
                          });
                          if (response.ok) {
                            const data = await response.json();
                            form.setValue('imageUrl', data.url);
                            toast({ title: "Image uploaded successfully" });
                          }
                        } catch (error) {
                          toast({ title: "Failed to upload image", variant: "destructive" });
                        }
                      }
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Upload an image for this catalog (JPEG, PNG, or WebP)
                </FormDescription>
                <FormMessage />
              </FormItem>
              
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update Catalog"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* View Items Dialog */}
      <Dialog open={isItemsDialogOpen} onOpenChange={setIsItemsDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Items in {selectedCatalog?.name}</DialogTitle>
            <DialogDescription>
              Manage the auction items in this catalog.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-between items-center my-4">
            <div>
              <h3 className="text-lg font-semibold">{catalogItems.length} Items</h3>
            </div>
            <Button onClick={() => setLocation(`/admin/auction-lots?catalogId=${selectedCatalog?.id}`)}>
              <FiPlus className="mr-2" /> Add New Lot
            </Button>
          </div>
          
          {isLoadingItems ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : catalogItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-wood">No items found in this catalog</p>
              <p className="text-neutral-wood text-sm mt-2">Add items or import them using the CSV import feature</p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Starting Bid</TableHead>
                    <TableHead>Current Bid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {catalogItems.map((item: AuctionItem) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>£{item.startingBid}</TableCell>
                      <TableCell>{item.currentBid ? `£${item.currentBid}` : "No bids"}</TableCell>
                      <TableCell>
                        <Badge variant={
                          item.status === "active" ? "success" :
                          item.status === "scheduled" ? "warning" :
                          item.status === "sold" ? "secondary" :
                          "outline"
                        }>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setLocation(`/admin/auction-lots/${item.id}`)}
                        >
                          <FiEdit2 className="mr-1" /> Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Import Items Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Import Items to {selectedCatalog?.name}</DialogTitle>
            <DialogDescription>
              Import multiple auction items using a CSV file.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleImportSubmit} className="space-y-6">
            <div>
              <Label htmlFor="csvFile">CSV File</Label>
              <Input 
                id="csvFile" 
                type="file" 
                accept=".csv" 
                onChange={handleCsvFileChange}
                className="mt-1"
              />
              <p className="text-sm text-neutral-wood mt-1">
                CSV should include columns: name, description, startingBid, imageFilename
              </p>
            </div>
            
            <div>
              <Label htmlFor="images">Item Images (Optional)</Label>
              <Input 
                id="images" 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleImagesChange}
                className="mt-1"
              />
              <p className="text-sm text-neutral-wood mt-1">
                Upload images for the items. Image names should match the imageFilename in CSV.
              </p>
            </div>
            
            <div className="bg-neutral-paper p-4 rounded-md">
              <h4 className="font-semibold mb-2">CSV Format Example:</h4>
              <pre className="text-xs overflow-x-auto">
                name,description,startingBid,imageFilename<br />
                "Victorian Chair","An elegant Victorian chair circa 1880",195.00,victorian-chair.jpg<br />
                "Art Deco Lamp","Beautiful art deco lamp from 1920s",145.50,art-deco-lamp.jpg
              </pre>
            </div>
            
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={importCsvMutation.isPending || !csvFile}
              >
                {importCsvMutation.isPending ? "Importing..." : "Import Items"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}