import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Hammer, Plus, Pencil, Trash2, ExternalLink, Calendar, Clock, Eye, Upload, X, ImageIcon } from "lucide-react";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface AuctionHighlight {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  ctaUrl: string;
  auctionDate: string;
  auctionTime: string | null;
  viewingInfo: string | null;
  badgeText: string | null;
  displayOrder: number | null;
  isActive: boolean | null;
  createdAt: string;
  updatedAt: string;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  ctaUrl: z.string().url("Must be a valid URL").min(1, "URL is required"),
  auctionDate: z.string().min(1, "Auction date is required"),
  auctionTime: z.string().optional(),
  viewingInfo: z.string().optional(),
  badgeText: z.string().optional(),
  displayOrder: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

export default function AdminAuctionHighlights() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<AuctionHighlight | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const adminEmail = localStorage.getItem("adminEmail") || "";
  const adminPassword = localStorage.getItem("adminPassword") || "";

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch("/api/admin/upload/catalog-image", {
        method: "POST",
        headers: {
          "x-admin-email": adminEmail,
          "x-admin-password": adminPassword,
        },
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      form.setValue("imageUrl", data.imageUrl, { shouldValidate: true });
      toast({ title: "Image uploaded successfully" });
    } catch {
      toast({ title: "Image upload failed", variant: "destructive" });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const { data: highlights = [], isLoading } = useQuery<AuctionHighlight[]>({
    queryKey: ["/api/admin/auction-highlights"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      ctaUrl: "",
      auctionDate: "",
      auctionTime: "",
      viewingInfo: "",
      badgeText: "Featured Auction",
      displayOrder: 0,
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/admin/auction-highlights", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/auction-highlights"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auction-highlights"] });
      toast({ title: "Auction listing created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ title: "Failed to create auction listing", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await apiRequest("PUT", `/api/admin/auction-highlights/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/auction-highlights"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auction-highlights"] });
      toast({ title: "Auction listing updated successfully" });
      setIsDialogOpen(false);
      setEditingHighlight(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({ title: "Failed to update auction listing", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/auction-highlights/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/auction-highlights"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auction-highlights"] });
      toast({ title: "Auction listing deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete auction listing", variant: "destructive" });
    },
  });

  const handleEdit = (highlight: AuctionHighlight) => {
    setEditingHighlight(highlight);
    form.reset({
      title: highlight.title,
      description: highlight.description || "",
      imageUrl: highlight.imageUrl || "",
      ctaUrl: highlight.ctaUrl,
      auctionDate: highlight.auctionDate ? format(new Date(highlight.auctionDate), "yyyy-MM-dd") : "",
      auctionTime: highlight.auctionTime || "",
      viewingInfo: highlight.viewingInfo || "",
      badgeText: highlight.badgeText || "Featured Auction",
      displayOrder: highlight.displayOrder || 0,
      isActive: highlight.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingHighlight(null);
    form.reset({
      title: "",
      description: "",
      imageUrl: "",
      ctaUrl: "",
      auctionDate: "",
      auctionTime: "",
      viewingInfo: "",
      badgeText: "Featured Auction",
      displayOrder: 0,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: FormData) => {
    if (editingHighlight) {
      updateMutation.mutate({ id: editingHighlight.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <AdminNavigation />
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display text-primary flex items-center gap-3">
              <Hammer className="w-8 h-8" />
              Auction Listings
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              Manage auction listings that appear on the Browse tab of the Auctions page
            </p>
          </div>
          <Button onClick={handleCreate} className="gap-2" data-testid="button-add-highlight">
            <Plus className="w-4 h-4" />
            Add Listing
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-neutral-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : highlights.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Hammer className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Auction Listings</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Add your first auction listing to display on the Browse tab
              </p>
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Listing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {highlights.map((highlight) => (
              <Card key={highlight.id} className={!highlight.isActive ? "opacity-60" : ""}>
                {highlight.imageUrl && (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img 
                      src={highlight.imageUrl} 
                      alt={highlight.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant={highlight.isActive ? "default" : "secondary"} className="mb-2">
                        {highlight.badgeText || "Featured Auction"}
                      </Badge>
                      <CardTitle className="text-lg">{highlight.title}</CardTitle>
                    </div>
                    {!highlight.isActive && (
                      <Badge variant="outline" className="text-neutral-500">Inactive</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {highlight.description && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                      {highlight.description}
                    </p>
                  )}
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-primary">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(highlight.auctionDate), "dd MMMM yyyy")}
                        {highlight.auctionTime && ` at ${highlight.auctionTime}`}
                      </span>
                    </div>
                    {highlight.viewingInfo && (
                      <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                        <Eye className="w-4 h-4" />
                        <span className="line-clamp-1">{highlight.viewingInfo}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <ExternalLink className="w-3 h-3" />
                    <a 
                      href={highlight.ctaUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline truncate"
                    >
                      {highlight.ctaUrl}
                    </a>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(highlight)}
                      className="flex-1 gap-1"
                      data-testid={`button-edit-highlight-${highlight.id}`}
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          data-testid={`button-delete-highlight-${highlight.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Auction Listing</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{highlight.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(highlight.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingHighlight ? "Edit Auction Listing" : "Add Auction Listing"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Christmas Auction: Antiques & Collectables" {...field} />
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
                        <Textarea 
                          placeholder="Antiques & Collectables, Artwork, Vintage Toys, Gold & Silver..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Listing Image</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file);
                            }}
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1"
                              disabled={isUploadingImage}
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {isUploadingImage ? "Uploading..." : field.value ? "Replace Image" : "Upload Image"}
                            </Button>
                            {field.value && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => form.setValue("imageUrl", "")}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          {field.value ? (
                            <div className="relative rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50">
                              <img
                                src={field.value}
                                alt="Listing preview"
                                className="w-full h-40 object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 text-neutral-400">
                              <ImageIcon className="w-8 h-8 mb-1" />
                              <p className="text-sm">No image selected</p>
                            </div>
                          )}
                          <input type="hidden" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ctaUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link URL (where clicking goes to)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://auctions.lanorahouse.com/catalogue/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="auctionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Auction Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="auctionTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Auction Time</FormLabel>
                        <FormControl>
                          <Input placeholder="17:30" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="viewingInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Viewing Information</FormLabel>
                      <FormControl>
                        <Input placeholder="15th & 16th December, 9am - 7pm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="badgeText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Badge Text</FormLabel>
                        <FormControl>
                          <Input placeholder="Featured Auction" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="displayOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Active (visible on Browse tab)</FormLabel>
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1"
                  >
                    {createMutation.isPending || updateMutation.isPending 
                      ? "Saving..." 
                      : editingHighlight ? "Update Listing" : "Create Listing"
                    }
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
