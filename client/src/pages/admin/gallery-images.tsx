import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Edit, Trash2, Eye, EyeOff, Image, GripVertical, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { AdminNavigation } from "@/components/admin/AdminNavigation";

const galleryFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  estimate: z.string().optional(),
  soldPrice: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL"),
  displayOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

type GalleryFormValues = z.infer<typeof galleryFormSchema>;

interface GalleryImage {
  id: number;
  title: string;
  estimate: string | null;
  soldPrice: string | null;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export default function GalleryImagesPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);

  const form = useForm<GalleryFormValues>({
    resolver: zodResolver(galleryFormSchema),
    defaultValues: {
      title: "",
      estimate: "",
      soldPrice: "",
      imageUrl: "",
      displayOrder: 0,
      isActive: true,
    },
  });

  const { data: images = [], isLoading } = useQuery<GalleryImage[]>({
    queryKey: ["/api/admin/gallery-images"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: GalleryFormValues) => {
      return apiRequest("POST", "/api/admin/gallery-images", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery-images"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery-images"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Gallery image created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create image",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: GalleryFormValues }) => {
      return apiRequest("PUT", `/api/admin/gallery-images/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery-images"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery-images"] });
      setIsDialogOpen(false);
      setEditingImage(null);
      form.reset();
      toast({
        title: "Success",
        description: "Gallery image updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update image",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/gallery-images/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery-images"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery-images"] });
      toast({
        title: "Success",
        description: "Gallery image deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete image",
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest("PUT", `/api/admin/gallery-images/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery-images"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery-images"] });
    },
  });

  interface SyncResult {
    message: string;
    imported: number;
    lastSyncAt: string | null;
  }

  const syncMutation = useMutation<SyncResult, Error>({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/gallery-images/sync", {});
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ message: "Sync failed" }));
        throw new Error((errBody as { message?: string }).message || "Sync failed");
      }
      return res.json() as Promise<SyncResult>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery-images"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery-images"] });
      toast({
        title: "EasyLive Sync Complete",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Could not sync from EasyLive.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GalleryFormValues) => {
    if (editingImage) {
      updateMutation.mutate({ id: editingImage.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (image: GalleryImage) => {
    setEditingImage(image);
    form.reset({
      title: image.title,
      estimate: image.estimate || "",
      soldPrice: image.soldPrice || "",
      imageUrl: image.imageUrl,
      displayOrder: image.displayOrder,
      isActive: image.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this image?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenDialog = () => {
    setEditingImage(null);
    form.reset({
      title: "",
      estimate: "",
      soldPrice: "",
      imageUrl: "",
      displayOrder: images.length,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminNavigation />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gallery Images</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage images displayed in the homepage carousel
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            title="Pull sold lots from EasyLive auction catalogues"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncMutation.isPending ? "animate-spin" : ""}`} />
            {syncMutation.isPending ? "Syncing…" : "Sync from EasyLive"}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog} data-testid="button-add-gallery-image">
              <Plus className="w-4 h-4 mr-2" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingImage ? "Edit Gallery Image" : "Add Gallery Image"}
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
                        <Input placeholder="e.g. Victorian Mahogany Desk" {...field} data-testid="input-gallery-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimate (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. £200 - £400" {...field} data-testid="input-gallery-estimate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="soldPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sold Price (optional - shown on hover)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. £350" {...field} data-testid="input-gallery-sold-price" />
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
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} data-testid="input-gallery-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("imageUrl") && (
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={form.watch("imageUrl")}
                      alt="Preview"
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}

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
                          data-testid="input-gallery-order"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Active (visible on website)</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-gallery-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-gallery-image"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : editingImage
                      ? "Update"
                      : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {images.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Image className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No gallery images yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
              Add images to display in the homepage carousel
            </p>
            <Button onClick={handleOpenDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Image
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((image) => (
              <Card key={image.id} className={`overflow-hidden ${!image.isActive ? "opacity-60" : ""}`}>
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Badge variant={image.isActive ? "default" : "secondary"}>
                      {image.isActive ? (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          Hidden
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge variant="outline" className="bg-white/90">
                      <GripVertical className="w-3 h-3 mr-1" />
                      Order: {image.displayOrder}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{image.title}</h3>
                  {image.estimate && (
                    <p className="text-primary font-medium">Est: {image.estimate}</p>
                  )}
                  {image.soldPrice && (
                    <p className="text-green-600 font-medium mb-3">Sold: {image.soldPrice}</p>
                  )}
                  {!image.estimate && !image.soldPrice && <div className="mb-3" />}
                  <div className="flex items-center justify-between">
                    <Switch
                      checked={image.isActive}
                      onCheckedChange={(checked) =>
                        toggleActiveMutation.mutate({ id: image.id, isActive: checked })
                      }
                      data-testid={`switch-toggle-${image.id}`}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(image)}
                        data-testid={`button-edit-${image.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(image.id)}
                        data-testid={`button-delete-${image.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
