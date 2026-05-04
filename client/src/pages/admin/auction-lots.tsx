import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FiArrowLeft,
  FiSave,
  FiImage,
} from "react-icons/fi";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { getAllShippingBands } from "@/../../shared/shipping-bands";
import { AdminNavigation } from "@/components/admin/AdminNavigation";

const lotSchema = z.object({
  catalogId: z.string().min(1, "Please select a catalog"),
  lotNumber: z.string().min(1, "Lot number is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().optional(),
  reservePrice: z.string().min(1, "Reserve price is required"),
  estimatedValueLow: z.string().optional(),
  estimatedValueHigh: z.string().optional(),
  imageUrl: z.string().optional(),
  condition: z.string().optional(),
  provenance: z.string().optional(),
  shippingBand: z.string().min(1, "Please select a shipping band"),
});

type LotFormValues = z.infer<typeof lotSchema>;

export default function AdminAuctionLotsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [match, params] = useRoute("/admin/auction-lots/:id");
  const [, catalogParams] = useRoute("/admin/auction-lots");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  const lotId = match ? params?.id : null;
  const catalogIdParam = new URLSearchParams(window.location.search).get("catalogId");
  const isEditing = !!lotId;

  const form = useForm<LotFormValues>({
    resolver: zodResolver(lotSchema),
    defaultValues: {
      catalogId: catalogIdParam || "",
      lotNumber: "",
      title: "",
      description: "",
      category: "",
      reservePrice: "",
      estimatedValueLow: "",
      estimatedValueHigh: "",
      imageUrl: "",
      condition: "",
      provenance: "",
      shippingBand: "",
    },
  });

  // Fetch catalogs for selection
  const { data: catalogs = [] } = useQuery({
    queryKey: ['/api/admin/auction-catalogues'],
    staleTime: 10000,
  });

  // Fetch lot details if editing
  const { data: lot, isLoading: isLoadingLot } = useQuery({
    queryKey: [`/api/admin/auction-lots/${lotId}`],
    enabled: isEditing,
  });

  // Populate form when editing
  useEffect(() => {
    if (lot && isEditing) {
      form.reset({
        catalogId: lot.catalogId?.toString() || "",
        lotNumber: lot.lotNumber?.toString() || "",
        title: lot.title || "",
        description: lot.description || "",
        category: lot.category || "",
        reservePrice: lot.reservePrice?.toString() || "",
        estimatedValueLow: lot.estimatedValueLow?.toString() || "",
        estimatedValueHigh: lot.estimatedValueHigh?.toString() || "",
        imageUrl: lot.imageUrl || "",
        condition: lot.condition || "",
        provenance: lot.provenance || "",
        shippingBand: lot.shippingBand || "",
      });
    }
  }, [lot, isEditing, form]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: LotFormValues) => {
      return apiRequest("POST", "/api/admin/auction-lots", {
        ...data,
        reservePrice: parseFloat(data.reservePrice),
        estimatedValueLow: data.estimatedValueLow ? parseFloat(data.estimatedValueLow) : undefined,
        estimatedValueHigh: data.estimatedValueHigh ? parseFloat(data.estimatedValueHigh) : undefined,
        additionalImages: uploadedImages.length > 0 ? uploadedImages.slice(1) : [],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['/api/admin/auction-lots']});
      queryClient.invalidateQueries({queryKey: ['/api/admin/auction-catalogues']});
      toast({ 
        title: "Success",
        description: "Auction lot created successfully",
      });
      setLocation("/admin/auction-catalogs");
    },
    onError: (error: any) => {
      toast({ 
        title: "Error",
        description: error.message || "Failed to create auction lot",
        variant: "destructive"
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: LotFormValues) => {
      return apiRequest("PUT", `/api/admin/auction-lots/${lotId}`, {
        ...data,
        reservePrice: parseFloat(data.reservePrice),
        estimatedValueLow: data.estimatedValueLow ? parseFloat(data.estimatedValueLow) : undefined,
        estimatedValueHigh: data.estimatedValueHigh ? parseFloat(data.estimatedValueHigh) : undefined,
        additionalImages: uploadedImages.length > 0 ? uploadedImages.slice(1) : [],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: [`/api/admin/auction-lots/${lotId}`]});
      queryClient.invalidateQueries({queryKey: ['/api/admin/auction-lots']});
      queryClient.invalidateQueries({queryKey: ['/api/admin/auction-catalogues']});
      toast({ 
        title: "Success",
        description: "Auction lot updated successfully",
      });
      setLocation("/admin/auction-catalogs");
    },
    onError: (error: any) => {
      toast({ 
        title: "Error",
        description: error.message || "Failed to update auction lot",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: LotFormValues) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEditing && isLoadingLot) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isEditing ? "Edit" : "Add"} Auction Lot | Admin | LANORA HOUSE</title>
      </Helmet>
      
      <div className="bg-neutral-ivory min-h-screen py-8">
        <AdminNavigation />
        <div className="container mx-auto px-4 max-w-4xl">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => setLocation("/admin/auction-catalogs")}
          >
            <FiArrowLeft className="mr-2" /> Back to Catalogs
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {isEditing ? "Edit Auction Lot" : "Add New Auction Lot"}
              </CardTitle>
              <CardDescription>
                {isEditing 
                  ? "Update the details of this auction lot" 
                  : "Fill in the details below to create a new auction lot"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Catalog Selection */}
                  <FormField
                    control={form.control}
                    name="catalogId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catalog *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a catalog" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {catalogs.map((catalog: any) => (
                              <SelectItem key={catalog.id} value={catalog.id.toString()}>
                                {catalog.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Basic Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="lotNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lot Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input placeholder="Furniture, Jewelry, Art..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Victorian Mahogany Chair" {...field} />
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
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detailed description of the item, including condition, history, measurements..."
                            rows={6}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Pricing */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="reservePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reserve Price (£) *</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="100.00" {...field} />
                          </FormControl>
                          <FormDescription>Minimum sale price</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estimatedValueLow"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Est. Value Low (£)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="150.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estimatedValueHigh"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Est. Value High (£)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="250.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Images */}
                  <FormItem>
                    <FormLabel>Lot Images</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        accept="image/*"
                        multiple
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            const formData = new FormData();
                            Array.from(files).forEach(file => {
                              formData.append('images', file);
                            });
                            
                            try {
                              const response = await fetch('/api/admin/upload/lot-images', {
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
                                setUploadedImages(data.urls);
                                // Store first image as primary
                                form.setValue('imageUrl', data.urls[0]);
                                toast({ 
                                  title: "Images uploaded successfully",
                                  description: `${data.urls.length} image(s) uploaded`
                                });
                              }
                            } catch (error) {
                              toast({ 
                                title: "Failed to upload images", 
                                variant: "destructive" 
                              });
                            }
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload up to 10 images for this lot (JPEG, PNG, or WebP)
                    </FormDescription>
                    {uploadedImages.length > 0 && (
                      <div className="mt-2 grid grid-cols-5 gap-2">
                        {uploadedImages.map((url, index) => (
                          <img 
                            key={index} 
                            src={url} 
                            alt={`Lot image ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>

                  {/* Additional Details */}
                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condition</FormLabel>
                        <FormControl>
                          <Input placeholder="Excellent, Good, Fair, Poor..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="provenance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provenance / History</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Origin, previous ownership, historical background..."
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Shipping Band */}
                  <FormField
                    control={form.control}
                    name="shippingBand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Band *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select shipping band" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getAllShippingBands().map(band => (
                              <SelectItem key={band.code} value={band.code}>
                                {band.title} (£{band.price.toFixed(2)}) - {band.dimensions}, {band.weight}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the appropriate shipping band for this lot (used to calculate customer shipping costs)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation("/admin/auction-catalogs")}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      <FiSave className="mr-2" />
                      {createMutation.isPending || updateMutation.isPending 
                        ? (isEditing ? "Updating..." : "Creating...") 
                        : (isEditing ? "Update Lot" : "Create Lot")}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
