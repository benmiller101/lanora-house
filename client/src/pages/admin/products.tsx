import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { ProductForm } from "@/components/admin/ProductForm";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiImage,
  FiSearch,
  FiFilter,
  FiDollarSign
} from "react-icons/fi";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FiRefreshCw } from "react-icons/fi";

type Product = {
  id: number;
  name: string;
  description?: string;
  detailedDescription?: string;
  price: string;
  originalPrice?: string;
  category_id?: number;
  categoryId?: number;
  categoryName?: string;
  category_name?: string;
  category_slug?: string;
  era?: string;
  condition?: string;
  materials?: string[];
  imageUrl?: string;
  image_url?: string;
  additionalImages?: string[];
  dimensions?: string;
  origin?: string;
  provenance?: string;
  is_featured: boolean;
  is_bestseller: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  inStock?: boolean;
  stockQuantity?: number;
  sku?: string;
  vendorNumber?: string;
  weightGrams?: number;
  parcelType?: string;
  status?: string;
  sold_at?: string;
  order_id?: string;
};

type Category = {
  id: number;
  name: string;
  slug: string;
};

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isOffersDialogOpen, setIsOffersDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["/db/products"],
    staleTime: 30000,
  });

  // Fetch sold products from orders
  const { data: soldProductsData, isLoading: soldLoading } = useQuery({
    queryKey: ["/api/products/sold"],
    staleTime: 30000,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    staleTime: 300000, // 5 minutes
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest("DELETE", `/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/db/products"] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  // Restore product to stock mutation
  const restoreProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest("PATCH", `/api/products/${productId}`, {
        inStock: true,
        stockQuantity: 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/db/products"] });
      toast({
        title: "Success",
        description: "Product restored to stock",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to restore product",
        variant: "destructive",
      });
    },
  });

  const products = (productsData as any)?.products || [];
  const soldProductsList = (soldProductsData as any)?.products || [];
  
  // Debug: Log products data to verify status field is present
  console.log("📦 Products data from /db/products:", products.length, "products");
  if (products.length > 0) {
    console.log("📦 First product sample:", { 
      id: products[0].id, 
      name: products[0].name, 
      status: products[0].status,
      hasStatusField: 'status' in products[0]
    });
  }

  // Separate products into active (published, in stock), drafts, and sold
  const activeProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
      (product.categoryId || product.category_id)?.toString() === selectedCategory;
    const isPublished = product.status !== 'draft';
    const isInStock = product.inStock !== false && (product.stockQuantity === undefined || product.stockQuantity > 0);
    return matchesSearch && matchesCategory && isPublished && isInStock;
  });

  const draftProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
      (product.categoryId || product.category_id)?.toString() === selectedCategory;
    const isDraft = product.status === 'draft';
    return matchesSearch && matchesCategory && isDraft;
  });

  // Use sold products from the API (based on actual order data)
  const soldProducts = soldProductsList.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
      (product.categoryId || product.category_id)?.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRestoreToStock = (product: Product) => {
    if (confirm(`Restore "${product.name}" to active stock?`)) {
      restoreProductMutation.mutate(product.id);
    }
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `£${numPrice.toFixed(2)}`;
  };

  const handleEdit = async (product: Product) => {
    console.log("handleEdit called with product:", product);
    try {
      // Fetch complete product details for editing
      const response = await fetch(`/api/products/${product.id}`);
      const fullProduct = await response.json();
      console.log("Full product data for editing:", fullProduct);
      setSelectedProduct(fullProduct);
      setIsEditDialogOpen(true);
    } catch (error) {
      console.error("Error fetching product details:", error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
    }
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteProductMutation.mutate(product.id);
    }
  };

  const handleOffers = (product: Product) => {
    setSelectedProduct(product);
    setIsOffersDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["/db/products"] });
    toast({
      title: "Success",
      description: "Product created successfully",
    });
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedProduct(null);
    queryClient.invalidateQueries({ queryKey: ["/db/products"] });
    toast({
      title: "Success",
      description: "Product updated successfully",
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNavigation />
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Products</h1>
              <p className="text-neutral-600">Manage your product inventory</p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <FiPlus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Products Tabs */}
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="active" className="flex items-center gap-2">
                Active Products
                <Badge variant="secondary" className="ml-1">{activeProducts.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="drafts" className="flex items-center gap-2">
                Drafts
                <Badge variant="secondary" className="ml-1">{draftProducts.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="sold" className="flex items-center gap-2">
                Sold Items
                <Badge variant="secondary" className="ml-1">{soldProducts.length}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Active Products Tab */}
            <TabsContent value="active">
              <Card>
                <CardHeader>
                  <CardTitle>Active Products ({activeProducts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {productsLoading ? (
                    <div className="text-center py-8">Loading products...</div>
                  ) : activeProducts.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500">No active products found</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeProducts.map((product: Product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded-md"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                                  <FiImage className="text-gray-500" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                {product.sku && (
                                  <div className="text-sm text-gray-500">
                                    SKU: {product.sku}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {product.categoryName || "Uncategorized"}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{formatPrice(product.price)}</div>
                                {product.originalPrice && (
                                  <div className="text-sm text-gray-500 line-through">
                                    {formatPrice(product.originalPrice)}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  In Stock
                                </Badge>
                                {product.is_featured && (
                                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                    Featured
                                  </Badge>
                                )}
                                {product.is_bestseller && (
                                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                    Best Seller
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(product)}
                                  className="w-8 h-8 p-0"
                                  data-testid={`button-edit-${product.id}`}
                                >
                                  <FiEdit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleView(product)}
                                  className="w-8 h-8 p-0"
                                >
                                  <FiEye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOffers(product)}
                                  className="w-8 h-8 p-0 text-blue-500 hover:text-blue-700"
                                >
                                  <FiDollarSign className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(product)}
                                  className="w-8 h-8 p-0 text-red-500 hover:text-red-700"
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Drafts Tab */}
            <TabsContent value="drafts">
              <Card>
                <CardHeader>
                  <CardTitle>Draft Products ({draftProducts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {productsLoading ? (
                    <div className="text-center py-8">Loading products...</div>
                  ) : draftProducts.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500">No draft products found</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {draftProducts.map((product: Product) => (
                          <TableRow key={product.id} className="bg-amber-50/30">
                            <TableCell>
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded-md opacity-75"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                                  <FiImage className="text-gray-500" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                {product.sku && (
                                  <div className="text-sm text-gray-500">
                                    SKU: {product.sku}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {product.categoryName || product.category_name || "Uncategorized"}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{formatPrice(product.price)}</div>
                                {product.originalPrice && (
                                  <div className="text-sm text-gray-500 line-through">
                                    {formatPrice(product.originalPrice)}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                Draft
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(product)}
                                  className="w-8 h-8 p-0"
                                  data-testid={`button-edit-draft-${product.id}`}
                                >
                                  <FiEdit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleView(product)}
                                  className="w-8 h-8 p-0"
                                >
                                  <FiEye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(product)}
                                  className="w-8 h-8 p-0 text-red-500 hover:text-red-700"
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sold Items Tab */}
            <TabsContent value="sold">
              <Card>
                <CardHeader>
                  <CardTitle>Sold Items ({soldProducts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {soldLoading || productsLoading ? (
                    <div className="text-center py-8">Loading products...</div>
                  ) : soldProducts.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500">No sold items found</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Sold Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {soldProducts.map((product: Product) => (
                          <TableRow key={product.id} className="bg-neutral-50">
                            <TableCell>
                              {(product.imageUrl || product.image_url) ? (
                                <img
                                  src={product.imageUrl || product.image_url}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded-md opacity-75"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                                  <FiImage className="text-gray-500" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium text-neutral-600">{product.name}</div>
                                {product.sku && (
                                  <div className="text-sm text-gray-500">
                                    SKU: {product.sku}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-neutral-600">
                              {product.categoryName || product.category_name || "Uncategorized"}
                            </TableCell>
                            <TableCell>
                              <div className="text-neutral-600">
                                <div className="font-medium">{formatPrice(product.price)}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Sold
                                </Badge>
                                {product.sold_at && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {new Date(product.sold_at).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleRestoreToStock(product)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  disabled={restoreProductMutation.isPending}
                                  data-testid={`button-restore-${product.id}`}
                                >
                                  <FiRefreshCw className="h-4 w-4 mr-1" />
                                  Restore
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleView(product)}
                                  className="w-8 h-8 p-0"
                                >
                                  <FiEye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(product)}
                                  className="w-8 h-8 p-0 text-red-500 hover:text-red-700"
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Product Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new product to your store
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            categories={categories as any}
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <ProductForm
              categories={categories as any}
              initialValues={{
                name: selectedProduct.name,
                description: selectedProduct.description || "",
                detailedDescription: selectedProduct.detailedDescription || "",
                price: selectedProduct.price,
                originalPrice: selectedProduct.originalPrice || "",
                categoryId: (selectedProduct.categoryId || selectedProduct.category_id)?.toString() || "",
                era: selectedProduct.era || "",
                condition: selectedProduct.condition || "",
                materials: Array.isArray(selectedProduct.materials) 
                  ? selectedProduct.materials.join(", ") 
                  : (selectedProduct.materials || "") as string,
                imageUrl: selectedProduct.imageUrl || "",
                inStock: selectedProduct.inStock !== false,
                stockQuantity: selectedProduct.stockQuantity?.toString() || "1",
                isFeatured: selectedProduct.isFeatured || selectedProduct.is_featured,
                isBestSeller: selectedProduct.isBestSeller || selectedProduct.is_bestseller,
                sku: selectedProduct.sku || "",
                dimensions: selectedProduct.dimensions || "",
                origin: selectedProduct.origin || "",
                provenance: selectedProduct.provenance || "",
                status: selectedProduct.status || "published",
                weightGrams: selectedProduct.weightGrams?.toString() || "0",
                parcelType: selectedProduct.parcelType || "small_parcel",
              }}
              isEditing={true}
              productId={selectedProduct.id}
              onSuccess={handleEditSuccess}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedProduct(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              {selectedProduct.imageUrl && (
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-full h-64 object-cover rounded-md"
                />
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Name</h3>
                  <p>{selectedProduct.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Category</h3>
                  <p>{selectedProduct.category_name || "Uncategorized"}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Price</h3>
                  <p>{formatPrice(selectedProduct.price)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Era</h3>
                  <p>{selectedProduct.era || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Condition</h3>
                  <p>{selectedProduct.condition || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Materials</h3>
                  <p>{Array.isArray(selectedProduct.materials) 
                    ? selectedProduct.materials.join(", ") 
                    : selectedProduct.materials || "N/A"}</p>
                </div>
              </div>
              {selectedProduct.description && (
                <div>
                  <h3 className="font-semibold">Description</h3>
                  <p>{selectedProduct.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Offers Dialog */}
      <ProductOffersDialog 
        open={isOffersDialogOpen} 
        onClose={() => setIsOffersDialogOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
}

interface ProductOffer {
  id: number;
  productId: number;
  userId: string;
  offerAmount: string;
  message: string | null;
  status: string;
  adminResponse: string | null;
  expiresAt: Date | null;
  acceptedAt: Date | null;
  rejectedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductOffersDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

function ProductOffersDialog({ open, onClose, product }: ProductOffersDialogProps) {
  const [selectedOffer, setSelectedOffer] = useState<ProductOffer | null>(null);
  const [responseText, setResponseText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: offersData, isLoading } = useQuery({
    queryKey: [`/api/products/${product?.id}/offers`],
    enabled: open && !!product,
  });
  
  // Handle both array and object response formats
  const offers = Array.isArray(offersData) ? offersData : (offersData as any)?.offers || [];

  const acceptOfferMutation = useMutation({
    mutationFn: async (offerId: number) => {
      return apiRequest("POST", `/api/offers/${offerId}/accept`, { adminResponse: responseText });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${product?.id}/offers`] });
      toast({
        title: "Success",
        description: "Offer accepted successfully",
      });
      setSelectedOffer(null);
      setResponseText("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to accept offer",
        variant: "destructive",
      });
    },
  });

  const rejectOfferMutation = useMutation({
    mutationFn: async (offerId: number) => {
      return apiRequest("POST", `/api/offers/${offerId}/reject`, { adminResponse: responseText });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${product?.id}/offers`] });
      toast({
        title: "Success",
        description: "Offer rejected successfully",
      });
      setSelectedOffer(null);
      setResponseText("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject offer",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Offers - {product?.name}</DialogTitle>
          <DialogDescription>
            Manage offers for this product. Accept offers to start the ordering process.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">Loading offers...</div>
        ) : !offers || offers.length === 0 ? (
          <div className="text-center py-8">
            <FiDollarSign className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">No Offers Yet</h3>
            <p className="text-neutral-600">This product hasn't received any offers from customers.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer: ProductOffer) => (
              <Card key={offer.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">Offer #{offer.id}</h4>
                      {getStatusBadge(offer.status)}
                    </div>
                    <p className="text-sm text-neutral-600">
                      User: {offer.userId} • {formatDate(offer.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      £{parseFloat(offer.offerAmount).toFixed(2)}
                    </div>
                  </div>
                </div>

                {offer.message && (
                  <div className="mb-3">
                    <h5 className="font-medium text-sm mb-1">Customer Message:</h5>
                    <p className="text-sm bg-neutral-50 p-2 rounded border">
                      {offer.message}
                    </p>
                  </div>
                )}

                {offer.adminResponse && (
                  <div className="mb-3">
                    <h5 className="font-medium text-sm mb-1">Your Response:</h5>
                    <p className="text-sm bg-blue-50 p-2 rounded border border-blue-200">
                      {offer.adminResponse}
                    </p>
                  </div>
                )}

                {offer.status === 'pending' && (
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedOffer(offer)}
                      className="text-green-600 hover:text-green-700"
                    >
                      Accept Offer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedOffer(offer)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Reject Offer
                    </Button>
                  </div>
                )}

                {offer.status === 'accepted' && (
                  <div className="pt-3 border-t">
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <p className="text-green-800 text-sm">
                        ✅ Offer accepted on {offer.acceptedAt ? formatDate(offer.acceptedAt) : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}

                {offer.status === 'rejected' && (
                  <div className="pt-3 border-t">
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-red-800 text-sm">
                        ❌ Offer rejected on {offer.rejectedAt ? formatDate(offer.rejectedAt) : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Response Dialog */}
        {selectedOffer && (
          <Dialog open={!!selectedOffer} onOpenChange={() => setSelectedOffer(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Respond to Offer #{selectedOffer.id}
                </DialogTitle>
                <DialogDescription>
                  Offer Amount: £{parseFloat(selectedOffer.offerAmount).toFixed(2)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Response Message (Optional)</label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                    rows={3}
                    placeholder="Add a personal message to the customer..."
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedOffer(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => rejectOfferMutation.mutate(selectedOffer.id)}
                    disabled={rejectOfferMutation.isPending}
                    className="text-red-600 hover:text-red-700"
                  >
                    {rejectOfferMutation.isPending ? "Rejecting..." : "Reject Offer"}
                  </Button>
                  <Button
                    onClick={() => acceptOfferMutation.mutate(selectedOffer.id)}
                    disabled={acceptOfferMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {acceptOfferMutation.isPending ? "Accepting..." : "Accept Offer"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}