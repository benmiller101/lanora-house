import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Helmet } from "react-helmet";
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiX, FiImage, FiStar } from "react-icons/fi";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { BeforeAfterImageUploader } from "@/components/admin/BeforeAfterImageUploader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BeforeAfterPost {
  id: number;
  title: string;
  description: string;
  beforeImageUrls: string[];
  afterImageUrls: string[];
  category: string;
  location: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BeforeAfterAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPost, setSelectedPost] = useState<BeforeAfterPost | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    beforeImageUrls: [] as string[],
    afterImageUrls: [] as string[],
    category: "general",
    location: "",
    featured: false,
    published: true,
  });

  // Fetch before/after posts
  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['/api/admin/before-after'],
    queryFn: async () => {
      const res = await fetch('/api/admin/before-after');
      if (!res.ok) throw new Error('Failed to fetch before/after posts');
      return res.json();
    }
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: Partial<BeforeAfterPost>) => {
      return await apiRequest('POST', '/api/admin/before-after', postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/before-after'] });
      toast({ title: "Success", description: "Before/after post created successfully" });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create before/after post",
        variant: "destructive" 
      });
    }
  });

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async ({ id, ...postData }: Partial<BeforeAfterPost> & { id: number }) => {
      return await apiRequest('PUT', `/api/admin/before-after/${id}`, postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/before-after'] });
      toast({ title: "Success", description: "Before/after post updated successfully" });
      setIsEditDialogOpen(false);
      setSelectedPost(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update before/after post",
        variant: "destructive" 
      });
    }
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/admin/before-after/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/before-after'] });
      toast({ title: "Success", description: "Before/after post deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete before/after post",
        variant: "destructive" 
      });
    }
  });

  // Quick-toggle featured flag without opening the edit dialog
  const toggleFeaturedMutation = useMutation({
    mutationFn: async (post: BeforeAfterPost) => {
      const featuredCount = posts.filter((p: BeforeAfterPost) => p.featured).length;
      if (!post.featured && featuredCount >= 3) {
        throw new Error('You can only feature up to 3 posts on the website. Un-feature another post first.');
      }
      return await apiRequest('PUT', `/api/admin/before-after/${post.id}`, {
        title: post.title,
        description: post.description,
        beforeImageUrls: post.beforeImageUrls,
        afterImageUrls: post.afterImageUrls,
        category: post.category,
        location: post.location,
        published: post.published,
        featured: !post.featured,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/before-after'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Cannot feature post',
        description: error.message || 'Failed to update featured status',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      beforeImageUrls: [],
      afterImageUrls: [],
      category: "general",
      location: "",
      featured: false,
      published: true,
    });
  };

  const handleCreate = () => {
    setIsCreateDialogOpen(true);
    resetForm();
  };

  const handleEdit = (post: BeforeAfterPost) => {
    setSelectedPost(post);
    setFormData({
      title: post.title,
      description: post.description || "",
      beforeImageUrls: post.beforeImageUrls || [],
      afterImageUrls: post.afterImageUrls || [],
      category: post.category || "general",
      location: post.location || "",
      featured: post.featured,
      published: post.published,
    });
    setIsEditDialogOpen(true);
  };

  const handleView = (post: BeforeAfterPost) => {
    setSelectedPost(post);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (post: BeforeAfterPost) => {
    if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
      deletePostMutation.mutate(post.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.beforeImageUrls.length || !formData.afterImageUrls.length) {
      toast({
        title: "Error",
        description: "Title, before images, and after images are required",
        variant: "destructive"
      });
      return;
    }

    if (selectedPost) {
      updatePostMutation.mutate({ id: selectedPost.id, ...formData });
    } else {
      createPostMutation.mutate(formData);
    }
  };

  const handleImagesChanged = (beforeImages: string[], afterImages: string[]) => {
    setFormData({ ...formData, beforeImageUrls: beforeImages, afterImageUrls: afterImages });
  };

  const publishedPosts = posts.filter((post: BeforeAfterPost) => post.published);
  const draftPosts    = posts.filter((post: BeforeAfterPost) => !post.published);
  const featuredCount = posts.filter((post: BeforeAfterPost) => post.featured).length;

  return (
    <>
      <Helmet>
        <title>Before & After Posts - Admin | Lanora House</title>
        <meta name="description" content="Manage before and after transformation posts" />
      </Helmet>

      <AdminNavigation />
      
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Before & After Posts</h1>
            <p className="text-neutral-600">Manage your before and after transformation showcases</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${featuredCount >= 3 ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
              <FiStar className={featuredCount > 0 ? 'text-amber-400 fill-amber-400' : 'text-gray-400'} size={14} />
              {featuredCount}/3 featured on website
            </div>
            <Button onClick={handleCreate}>
              <FiPlus className="mr-2 h-4 w-4" /> Create Post
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading before/after posts...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">Error loading posts</div>
        ) : (
          <div className="space-y-6">
            {/* Published Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Published Posts ({publishedPosts.length})</CardTitle>
                <CardDescription>Posts visible to the public</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {publishedPosts.map((post: BeforeAfterPost) => (
                    <div key={post.id} className={`border rounded-lg p-4 space-y-3 transition-colors ${post.featured ? 'border-amber-300 bg-amber-50/30' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{post.title}</h3>
                          {post.location && (
                            <p className="text-xs text-neutral-500">{post.location}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          title={post.featured ? 'Remove from website slider' : 'Feature on website slider'}
                          onClick={() => toggleFeaturedMutation.mutate(post)}
                          disabled={toggleFeaturedMutation.isPending}
                          className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${
                            post.featured
                              ? 'text-amber-400 hover:text-amber-500'
                              : 'text-gray-300 hover:text-amber-300'
                          }`}
                        >
                          <FiStar size={16} className={post.featured ? 'fill-amber-400' : ''} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">Before ({post.beforeImageUrls?.length || 0})</p>
                          {post.beforeImageUrls && post.beforeImageUrls.length > 0 ? (
                            <img 
                              src={post.beforeImageUrls[0]} 
                              alt="Before" 
                              className="w-full h-20 object-cover rounded border"
                            />
                          ) : (
                            <div className="w-full h-20 bg-gray-200 rounded border flex items-center justify-center">
                              <FiImage className="text-gray-400" size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">After ({post.afterImageUrls?.length || 0})</p>
                          {post.afterImageUrls && post.afterImageUrls.length > 0 ? (
                            <img 
                              src={post.afterImageUrls[0]} 
                              alt="After" 
                              className="w-full h-20 object-cover rounded border"
                            />
                          ) : (
                            <div className="w-full h-20 bg-gray-200 rounded border flex items-center justify-center">
                              <FiImage className="text-gray-400" size={16} />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 items-center">
                        {post.featured && (
                          <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                            <FiStar size={11} className="fill-amber-400 text-amber-400" /> Featured
                          </span>
                        )}
                        <div className="flex gap-2 ml-auto">
                          <Button size="sm" variant="outline" onClick={() => handleView(post)}>
                            <FiEye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(post)}>
                            <FiEdit2 className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(post)}>
                            <FiTrash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {publishedPosts.length === 0 && (
                  <p className="text-center text-neutral-500 py-4">No published posts yet</p>
                )}
              </CardContent>
            </Card>

            {/* Draft Posts */}
            {draftPosts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Draft Posts ({draftPosts.length})</CardTitle>
                  <CardDescription>Unpublished posts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {draftPosts.map((post: BeforeAfterPost) => (
                      <div key={post.id} className="border rounded-lg p-4 space-y-3 opacity-75">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">{post.title}</h3>
                            {post.location && (
                              <p className="text-xs text-neutral-500">{post.location}</p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs flex-shrink-0">Draft</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Before ({post.beforeImageUrls?.length || 0})</p>
                            {post.beforeImageUrls && post.beforeImageUrls.length > 0 ? (
                              <img 
                                src={post.beforeImageUrls[0]} 
                                alt="Before" 
                                className="w-full h-20 object-cover rounded border"
                              />
                            ) : (
                              <div className="w-full h-20 bg-gray-200 rounded border flex items-center justify-center">
                                <FiImage className="text-gray-400" size={16} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">After ({post.afterImageUrls?.length || 0})</p>
                            {post.afterImageUrls && post.afterImageUrls.length > 0 ? (
                              <img 
                                src={post.afterImageUrls[0]} 
                                alt="After" 
                                className="w-full h-20 object-cover rounded border"
                              />
                            ) : (
                              <div className="w-full h-20 bg-gray-200 rounded border flex items-center justify-center">
                                <FiImage className="text-gray-400" size={16} />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleView(post)}>
                            <FiEye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(post)}>
                            <FiEdit2 className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(post)}>
                            <FiTrash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setSelectedPost(null);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedPost ? 'Edit Before & After Post' : 'Create Before & After Post'}
              </DialogTitle>
              <DialogDescription>
                {selectedPost ? 'Update the before and after transformation post' : 'Create a new before and after transformation post'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter post title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter post description"
                  rows={3}
                />
              </div>

              <BeforeAfterImageUploader
                onImagesChanged={handleImagesChanged}
                existingBeforeImages={formData.beforeImageUrls}
                existingAfterImages={formData.afterImageUrls}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., kitchen, garden, house clearance"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Cornwall, Devon"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                  />
                  <Label htmlFor="published">Published</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setIsEditDialogOpen(false);
                    setSelectedPost(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPostMutation.isPending || updatePostMutation.isPending}
                >
                  {createPostMutation.isPending || updatePostMutation.isPending ? 'Saving...' : 'Save Post'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPost?.title}</DialogTitle>
              <DialogDescription>
                {selectedPost?.location && `Location: ${selectedPost.location} • `}
                Category: {selectedPost?.category}
              </DialogDescription>
            </DialogHeader>
            
            {selectedPost && (
              <div className="space-y-4">
                {selectedPost.description && (
                  <p className="text-neutral-700">{selectedPost.description}</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2 text-center">Before Images ({selectedPost.beforeImageUrls?.length || 0})</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedPost.beforeImageUrls && selectedPost.beforeImageUrls.length > 0 ? (
                        selectedPost.beforeImageUrls.map((imageUrl, index) => (
                          <img 
                            key={index}
                            src={imageUrl} 
                            alt={`Before ${index + 1}`} 
                            className="w-full h-64 object-cover rounded border"
                          />
                        ))
                      ) : (
                        <div className="w-full h-64 bg-gray-200 rounded border flex items-center justify-center">
                          <FiImage className="text-gray-400" size={48} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-center">After Images ({selectedPost.afterImageUrls?.length || 0})</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedPost.afterImageUrls && selectedPost.afterImageUrls.length > 0 ? (
                        selectedPost.afterImageUrls.map((imageUrl, index) => (
                          <img 
                            key={index}
                            src={imageUrl} 
                            alt={`After ${index + 1}`} 
                            className="w-full h-64 object-cover rounded border"
                          />
                        ))
                      ) : (
                        <div className="w-full h-64 bg-gray-200 rounded border flex items-center justify-center">
                          <FiImage className="text-gray-400" size={48} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 text-sm text-neutral-500">
                  <div>
                    Created: {new Date(selectedPost.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    {selectedPost.featured && <Badge variant="secondary">Featured</Badge>}
                    <Badge variant={selectedPost.published ? "default" : "outline"}>
                      {selectedPost.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}