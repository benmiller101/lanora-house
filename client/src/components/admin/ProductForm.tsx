import { useState } from "react";
import { z } from "zod";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  sku: z.string().optional(),
  vendorNumber: z.string().optional(),
  price: z.string().min(1, {
    message: "Price is required.",
  }),
  originalPrice: z.string().optional(),
  categoryId: z.union([z.string(), z.number()]).refine(val => !!val, {
    message: "Category is required.",
  }).optional(), // Make backward compatible
  categoryIds: z.array(z.string()).optional(),
  era: z.string().min(1, {
    message: "Era is required.",
  }),
  condition: z.string().min(1, {
    message: "Condition is required.",
  }),
  materials: z.union([z.string(), z.array(z.string())]).optional(),
  dimensions: z.string().optional(),
  origin: z.string().optional(),
  provenance: z.string().optional(),
  imageUrl: z.string().min(1, {
    message: "Main image is required.",
  }),
  additionalImages: z.any().optional(), // Allow any type to prevent validation errors during transitions
  inStock: z.boolean().default(true),
  stockQuantity: z.string().min(1, {
    message: "Stock quantity is required.",
  }),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  status: z.enum(['draft', 'published']).default('published'),
  // Shipping fields
  weightGrams: z.string().default("0"),
  parcelType: z.enum(['letter', 'large_letter', 'small_parcel', 'medium_parcel', 'large_parcel']).default('small_parcel'),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  initialValues?: Partial<ProductFormValues> & { id?: string };
  categories: Category[];
  onSuccess: () => void;
  isEditing?: boolean;
  productId?: number;
  form?: UseFormReturn<ProductFormValues>;
  onSubmit?: (data: ProductFormValues) => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
  onCancel?: () => void;
}

export function ProductForm({ 
  initialValues, 
  categories, 
  onSuccess, 
  isEditing = false,
  productId,
  form: externalForm,
  onSubmit: externalSubmit,
  isSubmitting = false,
  submitButtonText = isEditing ? "Update Product" : "Create Product"
}: ProductFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Log initialValues when component mounts to debug
  console.log("ProductForm initialValues:", initialValues);

  // Use the external form if provided, otherwise create our own
  const form = externalForm || useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      sku: initialValues?.sku || "",
      vendorNumber: initialValues?.vendorNumber || "",
      price: initialValues?.price ? String(initialValues.price) : "",
      originalPrice: initialValues?.originalPrice ? String(initialValues.originalPrice) : "",
      categoryId: initialValues?.categoryId ? String(initialValues.categoryId) : "",
      categoryIds: initialValues?.categoryIds ? initialValues.categoryIds.map(String) : [],
      era: initialValues?.era || "",
      condition: initialValues?.condition || "",
      materials: Array.isArray(initialValues?.materials) ? initialValues.materials.join(', ') : initialValues?.materials || "",
      dimensions: initialValues?.dimensions || "",
      origin: initialValues?.origin || "",
      provenance: initialValues?.provenance || "",
      imageUrl: initialValues?.imageUrl || "",
      additionalImages: Array.isArray(initialValues?.additionalImages) ? 
        initialValues.additionalImages.join(', ') : 
        initialValues?.additionalImages || "",
      inStock: initialValues?.inStock !== undefined ? initialValues.inStock : true,
      stockQuantity: initialValues?.stockQuantity ? String(initialValues.stockQuantity) : "1",
      isFeatured: initialValues?.isFeatured !== undefined ? initialValues.isFeatured : false,
      isBestSeller: initialValues?.isBestSeller !== undefined ? initialValues.isBestSeller : false,
      status: (initialValues?.status as 'draft' | 'published') || 'published',
      // Shipping fields
      weightGrams: initialValues?.weightGrams ? String(initialValues.weightGrams) : "0",
      parcelType: initialValues?.parcelType || 'small_parcel',
    },
  });

  const createProduct = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      // Convert materials from comma-separated to array
      console.log("Form data before formatting:", data);
      
      // Log the categoryId for debugging
      console.log("CategoryID before formatting:", data.categoryId, "type:", typeof data.categoryId);
      console.log("CategoryIDs before formatting:", data.categoryIds);
      
      // Safely convert values with strong type checking
      let priceValue: number;
      try {
        priceValue = parseFloat(data.price);
        if (isNaN(priceValue)) priceValue = 0;
      } catch (e) {
        console.error("Error parsing price:", e);
        priceValue = 0;
      }
      
      let originalPriceValue: number | undefined = undefined;
      if (data.originalPrice) {
        try {
          originalPriceValue = parseFloat(data.originalPrice);
          if (isNaN(originalPriceValue)) originalPriceValue = undefined;
        } catch (e) {
          console.error("Error parsing original price:", e);
        }
      }
      
      let stockQuantityValue: number;
      try {
        stockQuantityValue = parseInt(data.stockQuantity);
        if (isNaN(stockQuantityValue)) stockQuantityValue = 1;
      } catch (e) {
        console.error("Error parsing stock quantity:", e);
        stockQuantityValue = 1;
      }
      
      const formattedData = {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        categoryIds: data.categoryIds,
        era: data.era,
        condition: data.condition,
        materials: typeof data.materials === 'string' ? data.materials.split(',').map((m: string) => m.trim()) : Array.isArray(data.materials) ? data.materials : [],
        dimensions: data.dimensions,
        origin: data.origin,
        provenance: data.provenance,
        imageUrl: data.imageUrl,
        additionalImages: Array.isArray(data.additionalImages) ? data.additionalImages : 
                         typeof data.additionalImages === 'string' && data.additionalImages ? 
                         data.additionalImages.split(/[\n,]/).map((img: string) => img.trim()).filter((img: string) => img.length > 0) : [],
        price: priceValue,
        originalPrice: originalPriceValue,
        stockQuantity: stockQuantityValue,
        inStock: data.inStock,
        isFeatured: data.isFeatured,
        isBestSeller: data.isBestSeller,
        sku: data.sku || undefined,
        vendorNumber: data.vendorNumber || undefined,
        status: data.status || 'published',
        // Handle the simplified description
        detailedDescription: data.description, // Use the same description for both fields
        // Shipping fields
        weightGrams: parseInt(data.weightGrams) || 0,
        parcelType: data.parcelType || 'small_parcel',
      };
      
      console.log("Formatted data for API request:", formattedData);
      
      try {
        // Use direct fetch to handle 201 responses correctly
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-email': 'Mattapinch@gmail.com',
            'x-admin-password': '@Kawasak167'
          },
          body: JSON.stringify(formattedData)
        });
        
        if (response.ok || response.status === 201) {
          return await response.json();
        } else {
          throw new Error(`Failed to create product: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error creating product:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Product created",
        description: "The product has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/db/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/admin"] });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
      console.error("Create product error:", error);
    },
  });

  const updateProduct = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      // Log the data we're updating with
      console.log("Updating product with raw data:", JSON.stringify(data));
      
      // Convert materials from comma-separated to array
      // Log information about the categoryId for debugging
      console.log("CategoryID in update before formatting:", data.categoryId, "type:", typeof data.categoryId);
      
      // Safely convert values with strong type checking
      let priceValue: number;
      try {
        priceValue = parseFloat(data.price);
        if (isNaN(priceValue)) priceValue = 0;
      } catch (e) {
        console.error("Error parsing price:", e);
        priceValue = 0;
      }
      
      let originalPriceValue: number | undefined = undefined;
      if (data.originalPrice) {
        try {
          originalPriceValue = parseFloat(data.originalPrice);
          if (isNaN(originalPriceValue)) originalPriceValue = undefined;
        } catch (e) {
          console.error("Error parsing original price:", e);
        }
      }
      
      let stockQuantityValue: number;
      try {
        stockQuantityValue = parseInt(data.stockQuantity);
        if (isNaN(stockQuantityValue)) stockQuantityValue = 1;
      } catch (e) {
        console.error("Error parsing stock quantity:", e);
        stockQuantityValue = 1;
      }
      
      const formattedData = {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        categoryIds: data.categoryIds,
        era: data.era,
        condition: data.condition,
        materials: typeof data.materials === 'string' ? data.materials.split(',').map((m: string) => m.trim()) : Array.isArray(data.materials) ? data.materials : [],
        dimensions: data.dimensions,
        origin: data.origin,
        provenance: data.provenance,
        imageUrl: data.imageUrl,
        additionalImages: typeof data.additionalImages === 'string' ? data.additionalImages.split(',').map((img: string) => img.trim()) : Array.isArray(data.additionalImages) ? data.additionalImages : [],
        price: priceValue,
        originalPrice: originalPriceValue,
        stockQuantity: stockQuantityValue,
        inStock: data.inStock,
        isFeatured: data.isFeatured,
        isBestSeller: data.isBestSeller,
        sku: data.sku || undefined,
        vendorNumber: data.vendorNumber || undefined,
        status: data.status || 'published',
        // Handle the simplified description (formerly short description)
        detailedDescription: data.description, // Use the same description for both fields
        // Shipping fields
        weightGrams: parseInt(data.weightGrams) || 0,
        parcelType: data.parcelType || 'small_parcel',
      };

      if (!productId) {
        throw new Error("Product ID is missing for update");
      }

      console.log("Sending update with formatted data:", formattedData);
      
      try {
        // Use direct fetch like we did for create to properly handle responses
        const response = await fetch(`/api/products/${productId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-email': 'Mattapinch@gmail.com',
            'x-admin-password': '@Kawasak167'
          },
          body: JSON.stringify(formattedData)
        });
        
        if (response.ok) {
          return await response.json();
        } else {
          throw new Error(`Failed to update product: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error updating product:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Product updated",
        description: "The product has been updated successfully.",
      });
      // Invalidate all product list queries to ensure all views are updated
      queryClient.invalidateQueries({ queryKey: ["/db/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/admin"] });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
      console.error("Update product error:", error);
    },
  });

  function onSubmit(data: ProductFormValues) {
    console.log("Form submission attempted:", { data, isEditing });
    
    // Check form validity and show specific error messages
    if (Object.keys(form.formState.errors).length > 0) {
      console.error("Form has errors:", form.formState.errors);
      
      // Get the first error message to show in the toast
      const firstError = Object.values(form.formState.errors)[0];
      const errorMessage = (firstError?.message as string) || "Please fix the form errors before submitting.";
      
      toast({
        title: "Required Field Missing",
        description: String(errorMessage),
        variant: "destructive",
      });
      return;
    }
    
    // Make sure we have a valid value for additional images
    const processedData = {
      ...data,
      // Ensure additionalImages is an array
      additionalImages: Array.isArray(data.additionalImages) 
        ? data.additionalImages 
        : (typeof data.additionalImages === 'string' && data.additionalImages 
          ? data.additionalImages.split(/[\n,]/).map(img => img.trim()).filter(img => img.length > 0) 
          : [])
    };
    
    console.log("Processed form data:", processedData);
    
    // If there's an external submit handler provided by the parent, use that
    if (externalSubmit) {
      console.log("Using external submit handler");
      externalSubmit(processedData);
      return;
    }
    
    // Otherwise use our internal mutation functions
    if (isEditing) {
      console.log("Attempting to update product...");
      updateProduct.mutate(processedData);
    } else {
      console.log("Attempting to create product...");
      createProduct.mutate(processedData);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className={fieldState.error ? "text-red-600" : ""}>
                Product Name *
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Victorian Mahogany Writing Desk" 
                  {...field}
                  className={fieldState.error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                />
              </FormControl>
              <FormMessage className="text-red-600" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. LH-ANT-001" {...field} />
                </FormControl>
                <FormDescription>
                  For warehouse management
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vendorNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. V-12345" {...field} data-testid="input-vendor-number" />
                </FormControl>
                <FormDescription>
                  Supplier reference (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className={fieldState.error ? "text-red-600" : ""}>
                  Price (£) *
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="1250.00" 
                    {...field}
                    className={fieldState.error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  />
                </FormControl>
                <FormMessage className="text-red-600" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="originalPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Original Price (£, optional)</FormLabel>
                <FormControl>
                  <Input placeholder="1500.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className={fieldState.error ? "text-red-600" : ""}>
                Category *
              </FormLabel>
              <Select 
                onValueChange={(value) => {
                  console.log("Category selected:", value);
                  // Ensure value is properly registered in form state
                  field.onChange(value);
                  form.setValue("categoryId", value, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                }} 
                value={field.value ? String(field.value) : undefined}
                defaultValue={field.value ? String(field.value) : undefined}
              >
                <FormControl>
                  <SelectTrigger className={fieldState.error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryIds"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className={fieldState.error ? "text-red-600" : ""}>
                Additional Categories (Multi-Select)
              </FormLabel>
              <FormControl>
                <MultiSelect
                  options={categories.map(cat => ({ 
                    label: cat.name, 
                    value: String(cat.id) 
                  }))}
                  selected={(field.value || []).map(String)}
                  onChange={(values: string[]) => {
                    console.log("Multiple categories selected:", values);
                    field.onChange(values);
                    form.setValue("categoryIds", values, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                  }}
                  placeholder="Select additional categories..."
                  className={fieldState.error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                />
              </FormControl>
              <FormDescription>
                Select multiple categories that apply to this product. The first category selected above will be the primary category.
              </FormDescription>
              <FormMessage className="text-red-600" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className={fieldState.error ? "text-red-600" : ""}>
                Description *
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Comprehensive product description..." 
                  {...field} 
                  className={`resize-none h-40 ${fieldState.error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                />
              </FormControl>
              <FormDescription>
                Full product description that will be displayed in both listings and product details
              </FormDescription>
              <FormMessage className="text-red-600" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="era"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className={fieldState.error ? "text-red-600" : ""}>
                  Era *
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Victorian, 1880s" 
                    {...field}
                    className={fieldState.error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  />
                </FormControl>
                <FormMessage className="text-red-600" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="condition"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className={fieldState.error ? "text-red-600" : ""}>
                  Condition *
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Excellent" 
                    {...field}
                    className={fieldState.error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  />
                </FormControl>
                <FormMessage className="text-red-600" />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="materials"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Materials</FormLabel>
                <FormControl>
                  <Input placeholder="Mahogany, Brass, Velvet" {...field} />
                </FormControl>
                <FormDescription>
                  Comma-separated list
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="dimensions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dimensions</FormLabel>
                <FormControl>
                  <Input placeholder="H: 80cm, W: 60cm, D: 50cm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="origin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Origin</FormLabel>
              <FormControl>
                <Input placeholder="England, 1880s" {...field} />
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
              <FormLabel>Provenance</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="History and ownership details..." 
                  {...field} 
                  className="resize-none h-20"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className={fieldState.error ? "text-red-600" : ""}>
                Main Image URL *
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/image.jpg" 
                  {...field}
                  className={fieldState.error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                />
              </FormControl>
              {field.value && (
                <div className="mt-2">
                  <img 
                    src={field.value} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded border"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
              <FormMessage className="text-red-600" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="additionalImages"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Image URLs</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter image URLs, one per line:&#10;https://example.com/image1.jpg&#10;https://example.com/image2.jpg" 
                  {...field}
                  value={Array.isArray(field.value) ? field.value.join('\n') : field.value || ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="resize-none h-24"
                />
              </FormControl>
              <FormDescription>
                Enter multiple image URLs, one per line (up to 5 images)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="inStock"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>In Stock</FormLabel>
                  <FormDescription>
                    Product is available for purchase
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="stockQuantity"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className={fieldState.error ? "text-red-600" : ""}>
                  Stock Quantity *
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    {...field}
                    className={fieldState.error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  />
                </FormControl>
                <FormMessage className="text-red-600" />
              </FormItem>
            )}
          />

          {/* Product Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Status *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || 'published'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft (Hidden from shop)</SelectItem>
                    <SelectItem value="published">Published (Visible in shop)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Draft products are hidden from customers until published.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Shipping Information Section */}
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-semibold mb-4 text-[#2D317C]">Shipping Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="weightGrams"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className={fieldState.error ? "text-red-600" : ""}>
                    Weight (grams) *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      placeholder="e.g. 500"
                      {...field}
                      className={fieldState.error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter weight in grams (1000g = 1kg)
                  </FormDescription>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="parcelType"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className={fieldState.error ? "text-red-600" : ""}>
                    Parcel Type *
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className={fieldState.error ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select parcel type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="letter">Letter (up to 100g)</SelectItem>
                      <SelectItem value="large_letter">Large Letter (up to 750g)</SelectItem>
                      <SelectItem value="small_parcel">Small Parcel (up to 2kg)</SelectItem>
                      <SelectItem value="medium_parcel">Medium Parcel (up to 20kg)</SelectItem>
                      <SelectItem value="large_parcel">Large Parcel (20-30kg)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select based on item dimensions and weight
                  </FormDescription>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Featured Product</FormLabel>
                  <FormDescription>
                    Product will appear in featured sections
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isBestSeller"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Best Seller</FormLabel>
                  <FormDescription>
                    Product will appear in best seller sections
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => {
              form.setValue("name", "Antique Victorian Mahogany Writing Desk");
              form.setValue("description", "A stunning example of Victorian craftsmanship, this mahogany writing desk features intricate carved details and brass hardware.");
              form.setValue("price", "1250.00");
              form.setValue("categoryId", "2"); // Ornaments category
              form.setValue("era", "Victorian");
              form.setValue("condition", "Excellent");
              form.setValue("stockQuantity", "1");
              form.setValue("materials", "Mahogany, Brass");
              form.setValue("dimensions", "120cm x 60cm x 75cm");
              form.setValue("origin", "England");
              form.setValue("imageUrl", "https://via.placeholder.com/400x300?text=Test+Product+Image");
            }}
            className="w-full"
          >
            Fill Test Data
          </Button>

          <Button 
            type="submit" 
            disabled={isSubmitting || createProduct.isPending || updateProduct.isPending}
            className="w-full"
          >
            {isSubmitting || createProduct.isPending || updateProduct.isPending ? (
              <>Processing...</>
            ) : (
              <>{submitButtonText}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}