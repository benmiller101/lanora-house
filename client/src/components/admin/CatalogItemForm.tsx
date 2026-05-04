import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultipleImageUploader } from "./MultipleImageUploader";
import { Loader2 } from "lucide-react";

// Define the form schema
const catalogItemSchema = z.object({
  itemNumber: z.string().min(1, "Lot number is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  estimate: z.string().min(1, "Estimate is required"),
  images: z.array(z.string()).optional(),
});

type CatalogItemFormValues = z.infer<typeof catalogItemSchema>;

interface CatalogItemFormProps {
  catalogId: string;
  onItemAdded: () => void;
  onCancel: () => void;
  existingItem?: any; // For future use with editing
}

export function CatalogItemForm({ 
  catalogId, 
  onItemAdded, 
  onCancel,
  existingItem
}: CatalogItemFormProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize the form
  const form = useForm<CatalogItemFormValues>({
    resolver: zodResolver(catalogItemSchema),
    defaultValues: {
      itemNumber: existingItem?.itemNumber || "",
      title: existingItem?.title || "",
      description: existingItem?.description || "",
      estimate: existingItem?.estimate || "",
      images: existingItem?.images || [],
    },
  });

  // Update form when images are uploaded
  useEffect(() => {
    form.setValue("images", uploadedImages);
  }, [uploadedImages, form]);

  // Handle form submission
  const onSubmit = async (data: CatalogItemFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Get admin credentials from localStorage
      const adminEmail = localStorage.getItem("adminEmail");
      const adminPassword = localStorage.getItem("adminPassword");
      
      if (!adminEmail || !adminPassword) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in as admin to add items",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Create item with images
      const formData = {
        ...data,
        catalogId,
      };

      // Send the request with admin credentials
      await apiRequest("POST", "/api/catalog-items", formData, {
        "Authorization": `Basic ${btoa(`${adminEmail}:${adminPassword}`)}`,
      });

      // Notify parent component
      onItemAdded();
    } catch (error) {
      console.error("Error adding catalog item:", error);
      toast({
        title: "Error",
        description: "Failed to add item to catalog",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {existingItem ? "Edit Lot" : "Add New Lot to Catalog"}
          </h3>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="itemNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lot Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 1" {...field} />
                    </FormControl>
                    <FormDescription>
                      The number for this lot in the catalog
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimate</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. £1,000 - £1,500" {...field} />
                    </FormControl>
                    <FormDescription>
                      The estimated value range for this item
                    </FormDescription>
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
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Item title" {...field} />
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
                      placeholder="Detailed description of the item"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="images"
              render={() => (
                <FormItem>
                  <FormLabel>Images</FormLabel>
                  <FormControl>
                    <MultipleImageUploader
                      uploadUrl="/api/upload/catalog-item-image"
                      initialImages={existingItem?.images || []}
                      onImagesChange={setUploadedImages}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload images of the catalog item. First image will be the main display image.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {existingItem ? "Update Lot" : "Add Lot"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}