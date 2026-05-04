import { useState, useRef } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiUpload } from "react-icons/fi";
import { useToast } from "@/hooks/use-toast";

// Define blog categories
const BLOG_CATEGORIES = [
  "Lanora House Clearances",
  "Lanora House Antiques", 
  "Lanora House Selling Items",
  "Lanora House Saving Money",
  "Lanora House Raffle",
  "Lanora House Valuation"
] as const;

// Blog post schema for form validation
const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  coverImage: z.string().url("Please enter a valid image URL"),
  tags: z.string(),
  category: z.enum(BLOG_CATEGORIES, {
    errorMap: () => ({ message: "Please select a valid category" })
  }),
  status: z.enum(["draft", "published"]),
  featured: z.boolean(),
});

type BlogPostFormValues = z.infer<typeof blogPostSchema>;

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string[];
  category: string;
  status: string;
  featured: boolean;
  authorName: string;
  metaTitle: string;
  metaDescription: string;
  publishedAt: string | null;
  createdAt: string;
};

export default function BlogManagement() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form setup
  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImage: "",
      tags: "",
      category: "Lanora House Antiques",
      status: "draft",
      featured: false,
    },
  });

  // Fetch blog posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["/api/admin/blog/posts"],
    retry: false,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: BlogPostFormValues) => {
      const processedData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
      };
      const response = await fetch('/api/admin/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData),
      });
      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog/posts"] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Blog post created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create blog post",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: BlogPostFormValues & { id: string }) => {
      const { id, ...updateData } = data;
      const processedData = {
        ...updateData,
        tags: updateData.tags ? updateData.tags.split(',').map(tag => tag.trim()) : [],
      };
      const response = await fetch(`/api/admin/blog/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData),
      });
      if (!response.ok) throw new Error('Failed to update post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog/posts"] });
      setIsEditDialogOpen(false);
      setSelectedPost(null);
      form.reset();
      toast({
        title: "Success",
        description: "Blog post updated successfully",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/blog/posts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog/posts"] });
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
    },
  });

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error", 
        description: "Image must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploadingImage(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/admin/upload/blog-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const { imageUrl } = await response.json();
      form.setValue('coverImage', imageUrl);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle form submission for creating a post
  const onCreateSubmit = (data: BlogPostFormValues) => {
    createMutation.mutate(data);
  };

  // Handle form submission for updating a post
  const onUpdateSubmit = (data: BlogPostFormValues) => {
    if (selectedPost) {
      updateMutation.mutate({ ...data, id: selectedPost.id });
    }
  };

  // Handle edit button click
  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    form.reset({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage,
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
      category: post.category as any,
      status: post.status as "draft" | "published",
      featured: post.featured,
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  // Handle view button click
  const handleView = (slug: string) => {
    window.open(`/blog/${slug}`, '_blank');
  };

  // Generate slug from title
  const generateSlug = () => {
    const title = form.getValues('title');
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      form.setValue('slug', slug);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Filter posts based on tab
  const filteredPosts = (posts as BlogPost[]).filter((post: BlogPost) => {
    if (selectedTab === "all") return true;
    if (selectedTab === "published") return post.status === "published";
    if (selectedTab === "draft") return post.status === "draft";
    return true;
  });

  // Render the blog form
  const renderBlogForm = (isEdit = false) => (
    <form onSubmit={form.handleSubmit(isEdit ? onUpdateSubmit : onCreateSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter post title..." {...field} onChange={(e) => {
                  field.onChange(e);
                  if (!form.getValues('slug')) {
                    generateSlug();
                  }
                }} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="post-url-slug" {...field} />
              </FormControl>
              <FormDescription>
                URL-friendly version of the title
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BLOG_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
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
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input placeholder="antiques, clearance, valuation" {...field} />
              </FormControl>
              <FormDescription>
                Comma-separated list of tags
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="coverImage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Featured Image</FormLabel>
            <div className="space-y-4">
              {!field.value ? (
                <div className="border-2 border-dashed border-neutral-paper rounded-lg p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <FiUpload className="text-2xl text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">Upload Featured Image</h3>
                  <p className="text-sm text-neutral-wood mb-4">Select an image file from your computer</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="bg-primary text-white hover:bg-primary-dark"
                  >
                    <FiUpload className="mr-2 h-4 w-4" />
                    {uploadingImage ? "Uploading..." : "Choose File"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="border rounded-lg p-2">
                    <img 
                      src={field.value} 
                      alt="Featured image preview" 
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="flex-1"
                    >
                      <FiUpload className="mr-2 h-4 w-4" />
                      {uploadingImage ? "Uploading..." : "Change Image"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.setValue('coverImage', '')}
                      className="px-4"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="excerpt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Excerpt</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Brief summary of your post..." 
                {...field} 
                className="min-h-[80px]"
              />
            </FormControl>
            <FormDescription>
              A short summary that appears in blog listings (max 300 characters)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Content</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Your blog post content..." 
                {...field} 
                className="min-h-[200px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex items-center space-x-6">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Featured Post</FormLabel>
                <FormDescription>
                  Display this post prominently on the blog homepage
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => {
          if (isEdit) {
            setIsEditDialogOpen(false);
          } else {
            setIsAddDialogOpen(false);
          }
        }}>
          Cancel
        </Button>
        <Button type="submit" disabled={isEdit ? updateMutation.isPending : createMutation.isPending}>
          {isEdit 
            ? (updateMutation.isPending ? "Updating..." : "Update Post")
            : (createMutation.isPending ? "Creating..." : "Create Post")
          }
        </Button>
      </div>
    </form>
  );

  return (
    <>
      <Helmet>
        <title>Blog Management | Admin | LANORA HOUSE</title>
        <meta name="description" content="Manage blog posts for LANORA HOUSE." />
      </Helmet>
      
      <div className="bg-neutral-ivory min-h-screen py-8">
        <div className="container mx-auto px-4">
          <AdminNavigation />
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="font-display text-3xl mb-2">Blog Management</h1>
              <p className="text-neutral-wood">Manage your blog content</p>
            </div>
            <Button onClick={() => {
              form.reset({
                title: "",
                slug: "",
                excerpt: "",
                content: "",
                coverImage: "",
                tags: "",
                category: "Lanora House Antiques",
                status: "draft",
                featured: false,
              });
              setIsAddDialogOpen(true);
            }}>
              <FiPlus className="mr-2" /> Add New Post
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="bg-neutral-paper">
                  <TabsTrigger value="all">All Posts</TabsTrigger>
                  <TabsTrigger value="published">Published</TabsTrigger>
                  <TabsTrigger value="draft">Drafts</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-neutral-wood">No blog posts found</p>
                  <p className="text-sm text-neutral-wood mt-2">Create your first blog post to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post: BlogPost) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>{post.category}</TableCell>
                        <TableCell>
                          {post.status === "published" ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Published</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-800 hover:bg-amber-100">Draft</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(post.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-neutral-paper"
                              onClick={() => handleView(post.slug)}
                            >
                              <FiEye className="mr-1" /> View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-neutral-paper"
                              onClick={() => handleEdit(post)}
                            >
                              <FiEdit2 className="mr-1" /> Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(post.id)}
                            >
                              <FiTrash2 className="mr-1" /> Delete
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
        </div>
      </div>

      {/* Add Post Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Blog Post</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            {renderBlogForm(false)}
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            {renderBlogForm(true)}
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}