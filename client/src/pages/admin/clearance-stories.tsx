import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Image as ImageIcon, Eye, EyeOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ClearanceStory } from "@shared/schema";
import { AdminNavigation } from "@/components/admin/AdminNavigation";

interface ClearanceStoryForm {
  title: string;
  description: string;
  amountSaved: string;
  wasteDiverted: string;
  isActive: boolean;
  sortOrder: string;
  image?: File | null;
  beforeImage?: File | null;
  afterImage?: File | null;
}

const ClearanceStoriesAdmin = () => {
  const [editingStory, setEditingStory] = useState<ClearanceStory | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ClearanceStoryForm>({
    title: "",
    description: "",
    amountSaved: "",
    wasteDiverted: "",
    isActive: true,
    sortOrder: "0",
    image: null,
    beforeImage: null,
    afterImage: null,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stories, isLoading } = useQuery({
    queryKey: ["/api/clearance-stories"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/clearance-stories");
      return response.json();
    },
  });

  const createStoryMutation = useMutation({
    mutationFn: (data: FormData) => {
      return fetch("/api/clearance-stories", {
        method: "POST",
        body: data,
      }).then((res) => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clearance-stories"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Clearance story created successfully",
      });
    },
  });

  const updateStoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => {
      return fetch(`/api/clearance-stories/${id}`, {
        method: "PUT",
        body: data,
      }).then((res) => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clearance-stories"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Clearance story updated successfully",
      });
    },
  });

  const deleteStoryMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/clearance-stories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clearance-stories"] });
      toast({
        title: "Success",
        description: "Clearance story deleted successfully",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      amountSaved: "",
      wasteDiverted: "",
      isActive: true,
      sortOrder: "0",
      image: null,
      beforeImage: null,
      afterImage: null,
    });
    setEditingStory(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("amountSaved", formData.amountSaved);
    formDataToSend.append("wasteDiverted", formData.wasteDiverted);
    formDataToSend.append("isActive", formData.isActive.toString());
    formDataToSend.append("sortOrder", formData.sortOrder);
    
    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }
    if (formData.beforeImage) {
      formDataToSend.append("beforeImage", formData.beforeImage);
    }
    if (formData.afterImage) {
      formDataToSend.append("afterImage", formData.afterImage);
    }

    if (editingStory) {
      updateStoryMutation.mutate({ id: editingStory.id, data: formDataToSend });
    } else {
      createStoryMutation.mutate(formDataToSend);
    }
  };

  const handleEdit = (story: ClearanceStory) => {
    setEditingStory(story);
    setFormData({
      title: story.title,
      description: story.description,
      amountSaved: story.amountSaved?.toString() || "",
      wasteDiverted: story.wasteDiverted || "",
      isActive: story.isActive,
      sortOrder: story.sortOrder?.toString() || "0",
      image: null,
      beforeImage: null,
      afterImage: null,
    });
    setIsDialogOpen(true);
  };

  const handleFileChange = (field: keyof ClearanceStoryForm, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AdminNavigation />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Clearance Success Stories</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Story
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingStory ? "Edit Clearance Story" : "Add New Clearance Story"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="wasteDiverted">Waste Diverted</Label>
                  <Input
                    id="wasteDiverted"
                    value={formData.wasteDiverted}
                    onChange={(e) => setFormData(prev => ({ ...prev, wasteDiverted: e.target.value }))}
                    placeholder="e.g., 0.5 tonnes"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="amountSaved">Amount Saved (£)</Label>
                  <Input
                    id="amountSaved"
                    type="number"
                    step="0.01"
                    value={formData.amountSaved}
                    onChange={(e) => setFormData(prev => ({ ...prev, amountSaved: e.target.value }))}
                    placeholder="300.00"
                  />
                </div>
                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: e.target.value }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="image">Main Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange("image", e.target.files?.[0] || null)}
                  />
                </div>
                <div>
                  <Label htmlFor="beforeImage">Before Image</Label>
                  <Input
                    id="beforeImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange("beforeImage", e.target.files?.[0] || null)}
                  />
                </div>
                <div>
                  <Label htmlFor="afterImage">After Image</Label>
                  <Input
                    id="afterImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange("afterImage", e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-amber-600 hover:bg-amber-700"
                  disabled={createStoryMutation.isPending || updateStoryMutation.isPending}
                >
                  {editingStory ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories?.map((story: ClearanceStory) => (
          <Card key={story.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{story.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={story.isActive ? "default" : "secondary"}>
                    {story.isActive ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                    {story.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 line-clamp-3">{story.description}</p>
              
              <div className="flex justify-between text-sm">
                <span>Amount Saved: £{story.amountSaved || "N/A"}</span>
                <span>Order: {story.sortOrder}</span>
              </div>
              
              {story.wasteDiverted && (
                <div className="text-sm text-primary">
                  Waste Diverted: {story.wasteDiverted}
                </div>
              )}

              <div className="flex gap-2 text-xs">
                {story.imageUrl && (
                  <Badge variant="outline">
                    <ImageIcon className="w-3 h-3 mr-1" />
                    Main
                  </Badge>
                )}
                {story.beforeImageUrl && (
                  <Badge variant="outline">
                    <ImageIcon className="w-3 h-3 mr-1" />
                    Before
                  </Badge>
                )}
                {story.afterImageUrl && (
                  <Badge variant="outline">
                    <ImageIcon className="w-3 h-3 mr-1" />
                    After
                  </Badge>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(story)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteStoryMutation.mutate(story.id)}
                  disabled={deleteStoryMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stories?.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No success stories yet</h3>
          <p className="text-gray-600 mb-4">Create your first clearance success story to showcase your work.</p>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Story
          </Button>
        </div>
      )}
    </div>
  );
};

export default ClearanceStoriesAdmin;