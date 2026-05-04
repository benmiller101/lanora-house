import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Search, Users, Plus, Edit, Trash2, User, Upload, X } from "lucide-react";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTeamMemberSchema, type InsertTeamMember, type TeamMember } from "@shared/schema";
import { z } from "zod";

const editTeamMemberSchema = insertTeamMemberSchema.extend({
  id: z.number(),
});
type EditTeamMember = z.infer<typeof editTeamMemberSchema>;

export default function AdminTeamMembers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: teamMembers = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/admin/team-members"],
  });

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch('/api/admin/team-members/upload-image', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      return response.json();
    },
  });

  // Handle file selection
  const handleFileSelect = (file: File | null, isEdit: boolean = false) => {
    setSelectedImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Upload and set image URL
  const uploadAndSetImage = async (form: any) => {
    if (!selectedImage) return;
    
    setUploadingImage(true);
    try {
      const result = await uploadImageMutation.mutateAsync(selectedImage);
      form.setValue('imageUrl', result.imageUrl);
      toast({
        title: "Image Uploaded",
        description: "Team member image has been uploaded successfully.",
      });
      // Clear the selected image state after successful upload
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to prevent form submission
    } finally {
      setUploadingImage(false);
    }
  };

  const addForm = useForm<InsertTeamMember>({
    resolver: zodResolver(insertTeamMemberSchema),
    defaultValues: {
      name: "",
      role: "",
      about: "",
      imageUrl: "",
      displayOrder: 0,
      isActive: true,
    },
  });

  const editForm = useForm<EditTeamMember>({
    resolver: zodResolver(editTeamMemberSchema),
    defaultValues: {
      id: 0,
      name: "",
      role: "",
      about: "",
      imageUrl: "",
      displayOrder: 0,
      isActive: true,
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: InsertTeamMember) => {
      return await apiRequest("POST", "/api/admin/team-members", data);
    },
    onSuccess: () => {
      toast({
        title: "Team Member Added",
        description: "The team member has been successfully added.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/team-members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      setIsAddDialogOpen(false);
      addForm.reset();
      setSelectedImage(null);
      setImagePreview(null);
      if (addFileInputRef.current) {
        addFileInputRef.current.value = '';
      }
    },
    onError: (error) => {
      toast({
        title: "Error Adding Team Member",
        description: "Failed to add team member. Please try again.",
        variant: "destructive",
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async (data: EditTeamMember) => {
      return await apiRequest("PUT", `/api/admin/team-members/${data.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Team Member Updated",
        description: "The team member has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/team-members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      setEditingMember(null);
      editForm.reset();
      setSelectedImage(null);
      setImagePreview(null);
      if (editFileInputRef.current) {
        editFileInputRef.current.value = '';
      }
    },
    onError: (error) => {
      toast({
        title: "Error Updating Team Member",
        description: "Failed to update team member. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/team-members/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Team Member Deleted",
        description: "The team member has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/team-members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
    },
    onError: (error) => {
      toast({
        title: "Error Deleting Team Member",
        description: "Failed to delete team member. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredMembers = teamMembers.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubmit = async (data: InsertTeamMember) => {
    try {
      // Upload image first if one is selected
      if (selectedImage) {
        await uploadAndSetImage(addForm);
        // Get the updated form data after image upload
        const updatedData = addForm.getValues();
        addMutation.mutate(updatedData);
      } else {
        addMutation.mutate(data);
      }
    } catch (error) {
      // Upload failed, don't proceed with form submission
      console.error('Image upload failed:', error);
    }
  };

  const handleEditSubmit = async (data: EditTeamMember) => {
    try {
      // Upload image first if one is selected
      if (selectedImage) {
        await uploadAndSetImage(editForm);
        // Get the updated form data after image upload
        const updatedData = editForm.getValues();
        editMutation.mutate(updatedData);
      } else {
        editMutation.mutate(data);
      }
    } catch (error) {
      // Upload failed, don't proceed with form submission
      console.error('Image upload failed:', error);
    }
  };

  const handleEditClick = (member: TeamMember) => {
    setEditingMember(member);
    editForm.reset({
      id: member.id,
      name: member.name,
      role: member.role,
      about: member.about,
      imageUrl: member.imageUrl || "",
      displayOrder: member.displayOrder,
      isActive: member.isActive,
    });
  };

  const handleDeleteClick = (id: number) => {
    if (window.confirm("Are you sure you want to delete this team member?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <AdminNavigation />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Team Members Management</h1>
          <p className="text-muted-foreground">Manage your team members displayed on the Meet the Team page</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {teamMembers.length} Members
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>View, add, edit, and manage your team members</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) {
                // Clean up when dialog closes
                setSelectedImage(null);
                setImagePreview(null);
                if (addFileInputRef.current) {
                  addFileInputRef.current.value = '';
                }
              }
            }}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2" data-testid="button-add-team-member">
                  <Plus className="h-4 w-4" />
                  Add Team Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Team Member</DialogTitle>
                  <DialogDescription>
                    Fill out the form below to add a new team member.
                  </DialogDescription>
                </DialogHeader>
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(handleAddSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-role" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={addForm.control}
                      name="about"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>About</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={4} data-testid="input-about" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team Member Image (Optional)</FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => addFileInputRef.current?.click()}
                                  className="flex items-center gap-2"
                                  data-testid="button-upload-image"
                                >
                                  <Upload className="h-4 w-4" />
                                  {selectedImage ? 'Change Image' : 'Upload Image'}
                                </Button>
                                {selectedImage && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedImage(null);
                                      setImagePreview(null);
                                      if (addFileInputRef.current) {
                                        addFileInputRef.current.value = '';
                                      }
                                    }}
                                    data-testid="button-remove-image"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              
                              <input
                                ref={addFileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  handleFileSelect(file, false);
                                }}
                                data-testid="input-image-file"
                              />
                              
                              {imagePreview && (
                                <div className="mt-2">
                                  <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="h-24 w-24 object-cover rounded-lg border"
                                  />
                                </div>
                              )}
                              
                              {field.value && !imagePreview && (
                                <div className="mt-2">
                                  <img
                                    src={field.value}
                                    alt="Current"
                                    className="h-24 w-24 object-cover rounded-lg border"
                                  />
                                </div>
                              )}
                              
                              {selectedImage && (
                                <p className="text-sm text-muted-foreground">
                                  Selected: {selectedImage.name}
                                </p>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addForm.control}
                        name="displayOrder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Order</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                value={field.value}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                data-testid="input-display-order"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Active</FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Show this member on the public page
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
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddDialogOpen(false)}
                        data-testid="button-cancel-add"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={addMutation.isPending || uploadingImage}
                        data-testid="button-submit-add"
                      >
                        {uploadingImage ? "Uploading..." : addMutation.isPending ? "Adding..." : "Add Member"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
              data-testid="input-search"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Display Order</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No team members found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id} data-testid={`row-team-member-${member.id}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {member.imageUrl ? (
                            <img 
                              src={member.imageUrl} 
                              alt={member.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <span data-testid={`text-name-${member.id}`}>{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-role-${member.id}`}>{member.role}</TableCell>
                      <TableCell>
                        <Badge variant={member.isActive ? "default" : "secondary"} data-testid={`status-${member.id}`}>
                          {member.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-order-${member.id}`}>{member.displayOrder}</TableCell>
                      <TableCell data-testid={`text-created-${member.id}`}>{formatDate(member.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(member)}
                            data-testid={`button-edit-${member.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(member.id)}
                            className="text-red-600 hover:text-red-700"
                            data-testid={`button-delete-${member.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingMember} onOpenChange={(open) => {
        if (!open) {
          setEditingMember(null);
          // Clean up when dialog closes
          setSelectedImage(null);
          setImagePreview(null);
          if (editFileInputRef.current) {
            editFileInputRef.current.value = '';
          }
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update the team member information below.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-edit-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-edit-role" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="about"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} data-testid="input-edit-about" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Member Image (Optional)</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => editFileInputRef.current?.click()}
                            className="flex items-center gap-2"
                            data-testid="button-edit-upload-image"
                          >
                            <Upload className="h-4 w-4" />
                            {selectedImage ? 'Change Image' : 'Upload New Image'}
                          </Button>
                          {selectedImage && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedImage(null);
                                setImagePreview(null);
                                if (editFileInputRef.current) {
                                  editFileInputRef.current.value = '';
                                }
                              }}
                              data-testid="button-edit-remove-image"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <input
                          ref={editFileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleFileSelect(file, true);
                          }}
                          data-testid="input-edit-image-file"
                        />
                        
                        {imagePreview && (
                          <div className="mt-2">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="h-24 w-24 object-cover rounded-lg border"
                            />
                          </div>
                        )}
                        
                        {field.value && !imagePreview && (
                          <div className="mt-2">
                            <img
                              src={field.value}
                              alt="Current"
                              className="h-24 w-24 object-cover rounded-lg border"
                            />
                          </div>
                        )}
                        
                        {selectedImage && (
                          <p className="text-sm text-muted-foreground">
                            Selected: {selectedImage.name}
                          </p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          value={field.value}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-edit-display-order"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Show this member on the public page
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-edit-is-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingMember(null)}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={editMutation.isPending || uploadingImage}
                  data-testid="button-submit-edit"
                >
                  {uploadingImage ? "Uploading..." : editMutation.isPending ? "Updating..." : "Update Member"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}