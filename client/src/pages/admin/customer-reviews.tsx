import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Star, Plus, Edit, Trash2, ExternalLink, Eye, EyeOff, CheckCircle2, AlertCircle, RefreshCw, Unlink, Link2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { AdminNavigation } from "@/components/admin/AdminNavigation";

// Form schema for customer reviews
const reviewFormSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  platform: z.string().min(1, "Platform is required"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  reviewText: z.string().min(10, "Review text must be at least 10 characters"),
  reviewDate: z.string().min(1, "Review date is required"),
  location: z.string().optional(),
  serviceType: z.string().optional(),
  platformUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  displayOrder: z.number().default(0),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface CustomerReview {
  id: number;
  customerName: string;
  platform: string;
  rating: number;
  reviewText: string;
  reviewDate: string;
  location?: string;
  serviceType?: string;
  platformUrl?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

const platformOptions = [
  { value: "Google", label: "Google Reviews" },
  { value: "Facebook", label: "Facebook" },
  { value: "Instagram", label: "Instagram" },
  { value: "TrustPilot", label: "TrustPilot" },
  { value: "Yelp", label: "Yelp" },
  { value: "Reviews.co.uk", label: "Reviews.co.uk" },
  { value: "Checkatrade", label: "Checkatrade" },
  { value: "MyBuilder", label: "MyBuilder" },
  { value: "Website", label: "Website" },
  { value: "Other", label: "Other" },
];

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
      <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
    </div>
  );
};

interface GbpStatus {
  connected: boolean;
  accountName: string | null;
  locationName: string | null;
  hasClientId: boolean;
  hasClientSecret: boolean;
  hasRedirectUri: boolean;
}

export default function CustomerReviewsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);

  interface BulkRow {
    customerName: string;
    platform: string;
    rating: number;
    reviewText: string;
    reviewDate: string;
    location: string;
  }
  const emptyRow = (): BulkRow => ({
    customerName: "",
    platform: "Google",
    rating: 5,
    reviewText: "",
    reviewDate: new Date().toISOString().split("T")[0],
    location: "Cornwall",
  });
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([emptyRow(), emptyRow(), emptyRow()]);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      customerName: "",
      platform: "",
      rating: 5,
      reviewText: "",
      reviewDate: new Date().toISOString().split('T')[0],
      location: "",
      serviceType: "",
      platformUrl: "",
      isActive: true,
      displayOrder: 0,
    },
  });

  // Handle OAuth callback result from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("googleConnected") === "1") {
      toast({ title: "Google Business Profile connected!", description: "All reviews will now sync automatically." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/google-business-status"] });
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("googleError")) {
      toast({ title: "Google connection failed", description: params.get("googleError") || "Unknown error", variant: "destructive" });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Google Business Profile status
  const { data: gbpStatus, isLoading: gbpLoading } = useQuery<GbpStatus>({
    queryKey: ["/api/admin/google-business-status"],
  });

  // Start OAuth flow
  const connectGbpMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("GET", "/api/admin/google-business-auth-url");
      const data = await res.json();
      return data.url as string;
    },
    onSuccess: (url: string) => {
      window.location.href = url;
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Could not generate auth URL", variant: "destructive" });
    },
  });

  // Force-refresh reviews cache
  const refreshGbpMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/google-business-refresh");
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "Reviews refreshed", description: `Fetched ${data.count} reviews from Google.` });
    },
    onError: () => {
      toast({ title: "Refresh failed", description: "Could not fetch reviews from Google.", variant: "destructive" });
    },
  });

  // Disconnect
  const disconnectGbpMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/google-business-disconnect");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/google-business-status"] });
      toast({ title: "Disconnected", description: "Google Business Profile integration removed." });
    },
  });

  // Fetch all customer reviews
  const { data: reviews = [], isLoading } = useQuery<CustomerReview[]>({
    queryKey: ["/api/admin/customer-reviews"],
  });

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      return apiRequest("POST", "/api/admin/customer-reviews", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customer-reviews"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Customer review created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create review",
        variant: "destructive",
      });
    },
  });

  // Update review mutation
  const updateReviewMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ReviewFormValues }) => {
      return apiRequest("PUT", `/api/admin/customer-reviews/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customer-reviews"] });
      setIsDialogOpen(false);
      setEditingReview(null);
      form.reset();
      toast({
        title: "Success",
        description: "Customer review updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update review",
        variant: "destructive",
      });
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/customer-reviews/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customer-reviews"] });
      toast({
        title: "Success",
        description: "Customer review deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete review",
        variant: "destructive",
      });
    },
  });

  // Bulk create mutation
  const bulkCreateMutation = useMutation({
    mutationFn: async (rows: BulkRow[]) => {
      const filled = rows.filter((r) => r.customerName.trim() && r.reviewText.trim());
      if (!filled.length) throw new Error("Please fill in at least one review");
      const res = await apiRequest("POST", "/api/admin/customer-reviews/bulk", filled);
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customer-reviews"] });
      setIsBulkDialogOpen(false);
      setBulkRows([emptyRow(), emptyRow(), emptyRow()]);
      const msg = data.errors?.length
        ? `Added ${data.created}, ${data.errors.length} failed.`
        : `${data.created} review${data.created !== 1 ? "s" : ""} added successfully.`;
      toast({ title: "Bulk import complete", description: msg });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to import reviews", variant: "destructive" });
    },
  });

  const updateBulkRow = (idx: number, field: keyof BulkRow, value: string | number) => {
    setBulkRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  const onSubmit = (data: ReviewFormValues) => {
    if (editingReview) {
      updateReviewMutation.mutate({ id: editingReview.id, data });
    } else {
      createReviewMutation.mutate(data);
    }
  };

  const handleEdit = (review: CustomerReview) => {
    setEditingReview(review);
    form.reset({
      customerName: review.customerName,
      platform: review.platform,
      rating: review.rating,
      reviewText: review.reviewText,
      reviewDate: new Date(review.reviewDate).toISOString().split('T')[0],
      location: review.location || "",
      serviceType: review.serviceType || "",
      platformUrl: review.platformUrl || "",
      isActive: review.isActive,
      displayOrder: review.displayOrder,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this review?")) {
      deleteReviewMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setEditingReview(null);
    form.reset();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <AdminNavigation />

      {/* ── Google Business Profile Integration Panel ── */}
      <Card className="mb-6 border-2 border-dashed border-blue-200 bg-blue-50/40">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <CardTitle className="text-base">Google Business Profile Reviews</CardTitle>
            {gbpStatus?.connected ? (
              <Badge className="bg-green-100 text-green-700 border-green-200">Connected</Badge>
            ) : (
              <Badge variant="outline" className="text-orange-600 border-orange-300">Not connected</Badge>
            )}
          </div>
          <CardDescription>
            Sync all your Google reviews directly — no 5-review cap. Requires a one-time OAuth setup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {gbpLoading ? (
            <p className="text-sm text-gray-500">Checking status…</p>
          ) : gbpStatus?.connected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>Reviews are syncing from Google automatically (cached 1 hour).</span>
              </div>
              <p className="text-xs text-gray-500">Location: <code className="bg-gray-100 px-1 rounded">{gbpStatus.locationName}</code></p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => refreshGbpMutation.mutate()}
                  disabled={refreshGbpMutation.isPending}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  {refreshGbpMutation.isPending ? "Refreshing…" : "Force Refresh"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                  onClick={() => {
                    if (confirm("Disconnect Google Business Profile? Reviews will stop syncing.")) {
                      disconnectGbpMutation.mutate();
                    }
                  }}
                  disabled={disconnectGbpMutation.isPending}
                >
                  <Unlink className="w-3 h-3 mr-1" />
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {(!gbpStatus?.hasClientId || !gbpStatus?.hasClientSecret || !gbpStatus?.hasRedirectUri) && (
                <div className="flex items-start gap-2 text-sm text-orange-700 bg-orange-50 rounded p-3">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Missing environment variables</p>
                    <ul className="mt-1 list-disc list-inside text-xs space-y-0.5">
                      {!gbpStatus?.hasClientId && <li>GOOGLE_CLIENT_ID</li>}
                      {!gbpStatus?.hasClientSecret && <li>GOOGLE_CLIENT_SECRET</li>}
                      {!gbpStatus?.hasRedirectUri && <li>GOOGLE_REDIRECT_URI</li>}
                    </ul>
                    <p className="mt-1 text-xs">Add these in Replit Secrets, then come back to connect.</p>
                  </div>
                </div>
              )}
              <Button
                size="sm"
                onClick={() => connectGbpMutation.mutate()}
                disabled={connectGbpMutation.isPending || !gbpStatus?.hasClientId || !gbpStatus?.hasClientSecret || !gbpStatus?.hasRedirectUri}
              >
                <Link2 className="w-3 h-3 mr-1" />
                {connectGbpMutation.isPending ? "Redirecting…" : "Connect Google Business Profile"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Customer Reviews</h1>
          <p className="text-gray-600">Manage customer reviews for the homepage carousel</p>
        </div>
        <div className="flex gap-2">
          {/* ── Bulk Add Dialog ── */}
          <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Bulk Add Reviews
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Bulk Add Reviews</DialogTitle>
                <p className="text-sm text-gray-500 mt-1">Fill in multiple reviews at once. Empty rows are skipped automatically.</p>
              </DialogHeader>

              <div className="space-y-3 mt-2">
                {bulkRows.map((row, idx) => (
                  <div key={idx} className="border rounded-lg p-3 bg-gray-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Review {idx + 1}</span>
                      {bulkRows.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                          onClick={() => setBulkRows((prev) => prev.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Customer Name *</Label>
                        <Input
                          className="h-8 text-sm mt-0.5"
                          placeholder="e.g. Sarah M."
                          value={row.customerName}
                          onChange={(e) => updateBulkRow(idx, "customerName", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Platform</Label>
                        <Select value={row.platform} onValueChange={(v) => updateBulkRow(idx, "platform", v)}>
                          <SelectTrigger className="h-8 text-sm mt-0.5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {platformOptions.map((p) => (
                              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Rating</Label>
                        <div className="flex gap-1 mt-1">
                          {[1,2,3,4,5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => updateBulkRow(idx, "rating", star)}
                              className="focus:outline-none"
                            >
                              <Star className={`w-5 h-5 ${star <= row.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Date</Label>
                        <Input
                          type="date"
                          className="h-8 text-sm mt-0.5"
                          value={row.reviewDate}
                          onChange={(e) => updateBulkRow(idx, "reviewDate", e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Review Text *</Label>
                      <Textarea
                        className="text-sm mt-0.5 min-h-[70px]"
                        placeholder="Paste the review text here…"
                        value={row.reviewText}
                        onChange={(e) => updateBulkRow(idx, "reviewText", e.target.value)}
                      />
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed"
                  onClick={() => setBulkRows((prev) => [...prev, emptyRow()])}
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Another Review
                </Button>
              </div>

              <div className="flex justify-between items-center pt-4 border-t mt-4">
                <span className="text-sm text-gray-500">
                  {bulkRows.filter((r) => r.customerName.trim() && r.reviewText.trim()).length} review{bulkRows.filter((r) => r.customerName.trim() && r.reviewText.trim()).length !== 1 ? "s" : ""} ready to save
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>Cancel</Button>
                  <Button
                    onClick={() => bulkCreateMutation.mutate(bulkRows)}
                    disabled={bulkCreateMutation.isPending}
                  >
                    {bulkCreateMutation.isPending ? "Saving…" : "Save All Reviews"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew} data-testid="button-add-review">
                <Plus className="w-4 h-4 mr-2" />
                Add Review
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingReview ? "Edit Customer Review" : "Add Customer Review"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-customer-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-platform">
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {platformOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating (1-5)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            data-testid="input-rating"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reviewDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Review Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-review-date" />
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
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-display-order"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="reviewText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review Text</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={4}
                          placeholder="Enter the customer's review text..."
                          data-testid="textarea-review-text"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Location (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Cornwall, UK" data-testid="input-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., House Clearance" data-testid="input-service-type" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="platformUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform URL (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." data-testid="input-platform-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <div className="text-sm text-gray-500">
                          Show this review in the carousel
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-is-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createReviewMutation.isPending || updateReviewMutation.isPending}
                    data-testid="button-submit"
                  >
                    {editingReview ? "Update" : "Create"} Review
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reviews.map((review) => (
          <Card key={review.id} className={`${!review.isActive ? "opacity-60" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div>
                    <CardTitle className="text-lg">{review.customerName}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{review.platform}</Badge>
                      {review.location && (
                        <Badge variant="outline" className="text-xs">
                          {review.location}
                        </Badge>
                      )}
                      {review.serviceType && (
                        <Badge variant="outline" className="text-xs">
                          {review.serviceType}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {review.isActive ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {review.platformUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      data-testid={`button-view-original-${review.id}`}
                    >
                      <a href={review.platformUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(review)}
                    data-testid={`button-edit-${review.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(review.id)}
                    className="text-red-600 hover:text-red-700"
                    data-testid={`button-delete-${review.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <StarRating rating={review.rating} />
                <p className="text-gray-700 leading-relaxed">{review.reviewText}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    Reviewed: {new Date(review.reviewDate).toLocaleDateString()}
                  </span>
                  <span>Order: {review.displayOrder}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {reviews.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Star className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-500 text-center mb-4">
                Start by adding your first customer review from Google, Facebook, or other platforms.
              </p>
              <Button onClick={handleAddNew} data-testid="button-add-first-review">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Review
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}