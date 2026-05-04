import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const itemSubmissionSchema = z.object({
  type: z.enum(['sale'], {
    required_error: "Please select an item type",
  }),
  title: z.string().min(3, {
    message: "Title must be at least 3 characters",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters",
  }),
  condition: z.string().min(3, {
    message: "Please describe the item's condition",
  }),
  photos: z.array(z.string()).min(1, {
    message: "Please upload at least one photo",
  }),
});

type ItemSubmissionValues = z.infer<typeof itemSubmissionSchema>;

interface ItemSubmissionFormProps {
  onSubmitSuccess: () => void;
  submission?: {
    id: number;
    title: string;
    description: string;
    type: string;
    condition?: string;
    photos?: string[];
  };
  isEditing?: boolean;
}

export function ItemSubmissionForm({ onSubmitSuccess, submission, isEditing = false }: ItemSubmissionFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>(
    submission?.photos && Array.isArray(submission.photos) ? submission.photos : []
  );
  
  const form = useForm<ItemSubmissionValues>({
    resolver: zodResolver(itemSubmissionSchema),
    defaultValues: {
      type: submission?.type || 'sale',
      title: submission?.title || '',
      description: submission?.description || '',
      condition: submission?.condition || '',
      photos: submission?.photos && Array.isArray(submission.photos) ? submission.photos : [],
    }
  });
  
  const onSubmit = async (data: ItemSubmissionValues) => {
    try {
      if (!user) {
        toast({
          title: "Not logged in",
          description: "You must be logged in to submit an item",
          variant: "destructive",
        });
        return;
      }
      
      // Log submission data for debugging
      console.log(isEditing ? 'Updating item with data:' : 'Submitting item with data:', {
        ...data,
        photos: uploadedPhotos,
        userId: user.id,
      });
      
      let url = '/api/submissions/simple-submissions';
      let method = 'POST';
      
      // If editing, use the update endpoint
      if (isEditing && submission) {
        url = `/api/submissions/${submission.id}`;
        method = 'PUT';
      }
      
      // Send the request
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          photos: uploadedPhotos,
          userId: user.id,
        }),
      });
      
      // Handle successful submission without parsing the response
      if (response.ok) {
        try {
          // Try to parse response but don't require it
          const responseText = await response.text();
          if (responseText && responseText.trim()) {
            try {
              const responseData = JSON.parse(responseText);
              console.log('Parsed submission response:', responseData);
            } catch (parseError) {
              console.warn('Could not parse response as JSON, but submission was successful:', responseText);
            }
          }
          
          // Immediately verify the submission was saved by making a fresh request
          try {
            const verifyResponse = await fetch(`/api/submissions/public-submissions/${user.id}`);
            const submissions = await verifyResponse.json();
            console.log('Verification of submissions:', submissions);
            
            // Trigger a refresh of the submissions list
            window.localStorage.setItem('submission_updated', Date.now().toString());
            // This will trigger a refresh in any other tab/window
            window.dispatchEvent(new Event('storage'));
          } catch (verifyError) {
            console.warn('Verification request failed, but submission might still be successful');
          }
          
          toast({
            title: isEditing 
              ? "Item updated successfully" 
              : "Item submitted successfully",
            description: isEditing
              ? "Your changes have been saved."
              : "We'll review your submission and get back to you soon.",
          });
          
          onSubmitSuccess();
          
          // Force reload of the members page to show updated submissions
          setTimeout(() => {
            window.location.href = '/members?tab=submissions';
          }, 500);
        } catch (postSuccess) {
          // Even if we can't parse the response, the submission was successful
          console.warn('Error processing successful response:', postSuccess);
          toast({
            title: isEditing 
              ? "Item updated successfully" 
              : "Item submitted successfully",
            description: isEditing
              ? "Your changes have been saved."
              : "We'll review your submission and get back to you soon.",
          });
          onSubmitSuccess();
          
          // Force reload of the members page to show updated submissions
          setTimeout(() => {
            window.location.href = '/members?tab=submissions';
          }, 500);
        }
      } else {
        // Handle error response
        console.error('Response not OK:', response.status, response.statusText);
        const errorText = await response.text();
        throw new Error(`Failed to submit item: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error submitting item",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('photos', files[i]);
      }
      
      const response = await fetch('/api/upload/submissions', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload photos');
      }
      
      const data = await response.json();
      const newPhotos = [...uploadedPhotos, ...data.urls];
      setUploadedPhotos(newPhotos);
      form.setValue('photos', newPhotos);
      
      toast({
        title: "Photos uploaded",
        description: `${data.urls.length} photos uploaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error uploading photos",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const removePhoto = (index: number) => {
    const newPhotos = [...uploadedPhotos];
    newPhotos.splice(index, 1);
    setUploadedPhotos(newPhotos);
    form.setValue('photos', newPhotos);
  };
  
  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    form.handleSubmit(onSubmit)(event);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Submission Type</FormLabel>
                  <div className="p-3 bg-primary/5 rounded-md">
                    <p className="text-sm text-neutral-700 font-medium">Direct Sale Submission</p>
                    <p className="text-xs text-neutral-600">Your item will be evaluated for potential direct purchase or consignment sale.</p>
                  </div>
                  <input type="hidden" {...field} value="sale" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter item title" {...field} />
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
                  <FormLabel>Item Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your item in detail (history, materials, dimensions, etc.)"
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
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Condition</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the condition of your item (any damage, repairs, etc.)"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            

          </div>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="photos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Photos</FormLabel>
                  <FormControl>
                    <div className="border rounded-md p-4">
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {uploadedPhotos.length > 0 ? (
                          uploadedPhotos.map((photo, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={photo}
                                alt={`Item photo ${index + 1}`}
                                className="object-cover w-full h-32 rounded"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 flex items-center justify-center h-32 bg-muted rounded">
                            <p className="text-muted-foreground text-center">
                              No photos uploaded yet
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-center">
                        <label className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 py-2 px-4">
                          {isUploading ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Uploading...
                            </span>
                          ) : (
                            "Upload Photos"
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoUpload}
                            className="hidden"
                            disabled={isUploading}
                          />
                        </label>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-muted-foreground">
                    Upload clear photos of your item from multiple angles. At least one photo is required.
                  </p>
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onSubmitSuccess}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="bg-primary hover:bg-primary/90"
            disabled={isUploading || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Submitting..." : "Submit Item"}
          </Button>
        </div>
      </form>
    </Form>
  );
}