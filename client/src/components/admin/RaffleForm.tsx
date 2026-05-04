import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useEffect } from "react";

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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import PrizeDrawImageUploader from "./RaffleImageUploader";
import MultipleImageUploader from "./MultipleImageUploader";

// Define prize schema for instant win configurations
export const prizeSchema = z.object({
  type: z.string(),
  count: z.number().or(z.string()).transform(val => 
    typeof val === 'string' ? parseInt(val) || 0 : val
  ),
  amount: z.number().or(z.string()).transform(val => 
    typeof val === 'string' ? parseInt(val) || 0 : val
  )
});

export type PrizeConfig = z.infer<typeof prizeSchema>;

// Define prize draw schema with better validation messages (removed status and social sharing)
const prizeDrawSchema = z.object({
  name: z.string().min(3, "Prize Draw name must be at least 3 characters").max(100, "Prize Draw name too long"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters").max(200, "Excerpt must be under 200 characters"),
  itemDescription: z.string().min(10, "Item description must be at least 10 characters"),
  retailValue: z.string().min(1, "Retail value is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Must be a valid price"),
  ticketPrice: z.string().min(1, "Ticket price is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Must be a valid price"),
  startDate: z.string().min(1, "Start date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endDate: z.string().min(1, "End date is required"),
  endTime: z.string().min(1, "End time is required"),
  maxTickets: z.string().min(1, "Maximum number of tickets is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Must be a valid number"),
  imageUrl: z.string().min(1, "Prize Draw image is required"),
  additionalImages: z.array(z.string()).optional().default([]),
  isFeatured: z.boolean().default(false),
  immediateStart: z.boolean().default(false),
  useRuntime: z.boolean().default(false),
  runtimeDays: z.string().optional(),
  // Instant win configuration
  instantWinEnabled: z.boolean().default(false),
  instantWinTitle: z.string().optional(),
  instantWinPrizes: z.array(prizeSchema).optional().default([]),
  // Legacy fields for backwards compatibility
  instantWinCount: z.string().optional(),
  instantWinAmount: z.string().optional(),
  instantWinPrizeType: z.string().default("cash"),
  // These fields are kept in the schema but will be empty to maintain compatibility
  description: z.string().optional(),
  retailPrice: z.string().optional(),
});

export type RaffleFormValues = z.infer<typeof prizeDrawSchema>;

// Helper function to get user-friendly field labels
const getFieldLabel = (fieldName: string): string => {
  const labels: Record<string, string> = {
    name: "Prize Draw Name",
    excerpt: "Short Description (Front Page)",
    itemDescription: "Full Description (Detail Page)", 
    retailValue: "Retail Value",
    ticketPrice: "Ticket Price",
    startDate: "Start Date",
    startTime: "Start Time",
    endDate: "End Date",
    endTime: "End Time",
    maxTickets: "Maximum Tickets",
    runtimeDays: "Runtime Duration",
    imageUrl: "Prize Draw Image",
  };
  return labels[fieldName] || fieldName;
};

interface PrizeDrawFormProps {
  initialValues?: Partial<RaffleFormValues>;
  defaultValues?: any; // For backward compatibility with ManagePrizeDraws
  onSubmit: (data: RaffleFormValues) => void;
  onCancel?: () => void; // Add cancel handler
  isSubmitting?: boolean;
  submitLabel?: string;
}

const PrizeDrawForm = ({
  initialValues,
  defaultValues, // Support both initialValues and defaultValues
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Submit"
}: PrizeDrawFormProps) => {
  // Combine defaultValues and initialValues for backward compatibility
  const combinedInitialValues = {
    ...(defaultValues || {}),
    ...(initialValues || {})
  };
  // Initialize form with default or provided values
  const form = useForm<RaffleFormValues>({
    resolver: zodResolver(prizeDrawSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      excerpt: "",
      itemDescription: "",
      retailValue: "50",
      ticketPrice: "2",
      startDate: "",
      startTime: "12:00",
      endDate: "",
      endTime: "23:59",
      maxTickets: "100",
      imageUrl: "",
      additionalImages: [],
      isFeatured: false,
      immediateStart: false,
      useRuntime: false,
      runtimeDays: "7",
      instantWinEnabled: false,
      instantWinTitle: "COSMIC CASH",
      instantWinPrizes: [],
      instantWinCount: "5",
      instantWinAmount: "10",
      instantWinPrizeType: "cash",
      description: "",
      retailPrice: "", 
      ...combinedInitialValues
    },
  });
  
  // Handle initialization of instant win prizes from defaultValues
  useEffect(() => {
    if (defaultValues?.instantWinPrizes) {
      try {
        let prizes = defaultValues.instantWinPrizes;
        
        // Handle if it's a string (needs parsing)
        if (typeof prizes === 'string') {
          prizes = JSON.parse(prizes);
        }
        
        // Ensure we have a valid array
        if (Array.isArray(prizes) && prizes.length > 0) {
          console.log("Setting instant win prizes:", prizes);
          form.setValue('instantWinPrizes', prizes);
        }
      } catch (error) {
        console.error("Error parsing instant win prizes:", error);
        form.setValue('instantWinPrizes', [{ type: 'cash', count: 5, amount: 10 }]);
      }
    }
  }, [defaultValues]);

  // Auto-calculate end date when using runtime duration
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (value.useRuntime && (name === 'startDate' || name === 'runtimeDays' || name === 'startTime')) {
        const startDate = value.startDate;
        const startTime = value.startTime;
        const runtimeDays = parseInt(value.runtimeDays || '7');

        if (startDate && runtimeDays > 0) {
          // Create start date object
          const start = new Date(`${startDate}T${startTime || '12:00'}:00`);
          
          // Add runtime days to get end date
          const end = new Date(start.getTime() + (runtimeDays * 24 * 60 * 60 * 1000));
          
          // Format dates for the form
          const endDate = format(end, 'yyyy-MM-dd');
          const endTime = format(end, 'HH:mm');
          
          // Update form values
          form.setValue('endDate', endDate);
          form.setValue('endTime', endTime);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = (data: RaffleFormValues) => {
    try {
      // Validate the form data before submission
      const errors = form.formState.errors;
      if (Object.keys(errors).length > 0) {
        console.log("Form validation errors:", errors);
        return; // Don't submit if there are validation errors
      }

      // Get the instant win prizes from form state
      const instantWinPrizes = form.getValues("instantWinPrizes") || [];
      let validatedPrizes = instantWinPrizes;

      // If instant win is enabled but no prizes, add a default prize
      if (data.instantWinEnabled && (!instantWinPrizes || instantWinPrizes.length === 0)) {
        validatedPrizes = [{ type: 'cash', count: 5, amount: 10 }];
        console.log("Added default prize configuration because none was provided");
        
        // Update the form state with the default prizes so they're included in the submission
        form.setValue('instantWinPrizes', validatedPrizes);
      }

      // Create submission data with validated prizes
      const submissionData = {
        ...data,
        instantWinPrizes: validatedPrizes,
        // Set default status to active (removed from form)
        status: "active"
      };

      console.log("Submitting prize draw form:", submissionData);
      onSubmit(submissionData);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-medium mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prize Draw Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Beautiful Antique Vase" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description (Front Page)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description that appears on the main page..."
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Brief description shown on prize draw cards and homepage
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="mt-4">
            <FormField
              control={form.control}
              name="itemDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Description (Detail Page)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detailed description of the item..."
                      className="min-h-[120px] resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Complete description shown on the individual prize draw page
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-medium mb-4">Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="retailValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Retail Value (£)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" placeholder="50.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="ticketPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket Price (£)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0.01" step="0.01" placeholder="2.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="maxTickets"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Tickets</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" placeholder="100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Schedule */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-medium mb-4">Schedule</h3>
          
          <FormField
            control={form.control}
            name="useRuntime"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mb-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Use Runtime Duration</FormLabel>
                  <FormDescription>
                    Automatically calculate end date based on start date and runtime days
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {form.watch("useRuntime") ? (
            <div className="mt-4">
              <FormField
                control={form.control}
                name="runtimeDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Runtime Duration (Days)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="7" {...field} />
                    </FormControl>
                    <FormDescription>
                      Number of days the prize draw will run from start date
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        {/* Images */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-medium mb-4">Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Prize Draw Image</FormLabel>
                  <FormControl>
                    <PrizeDrawImageUploader
                      onImageUploaded={(url) => {
                        field.onChange(url);
                      }}
                      currentImageUrl={field.value}
                    />
                  </FormControl>
                  <FormDescription>
                    Main image for the prize draw (will be displayed prominently)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="additionalImages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Images (Optional)</FormLabel>
                  <FormControl>
                    <MultipleImageUploader
                      onImagesUploaded={(urls) => {
                        field.onChange(urls);
                      }}
                      currentImages={field.value || []}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload up to 5 additional photos to showcase different angles and details of your prize draw item
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-white mt-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Featured Prize Draw</FormLabel>
                  <FormDescription>
                    Display this prize draw prominently on the homepage
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        {/* Instant Win Configuration Section */}
        <div className="border rounded-lg p-4 bg-purple-50">
          <h3 className="text-lg font-medium mb-4">Instant Win Configuration</h3>
          
          <FormField
            control={form.control}
            name="instantWinEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Enable Instant Win</FormLabel>
                  <FormDescription>
                    When enabled, some ticket numbers will be instant winners
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          {form.watch("instantWinEnabled") && (
            <div className="space-y-6 mt-4">
              {/* First row: Title */}
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="instantWinTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instant Win Title</FormLabel>
                      <FormControl>
                        <Input placeholder="COSMIC CASH" {...field} />
                      </FormControl>
                      <FormDescription>
                        Title for the instant win prize (e.g., "COSMIC CASH")
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Multi-row prize configuration section */}
              <div className="border rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-lg">Instant Win Prizes</h3>
                  
                  <Button 
                    type="button" 
                    variant="outline"
                    className="text-sm"
                    onClick={() => {
                      const currentPrizes = form.getValues().instantWinPrizes || [];
                      const updatedPrizes = [
                        ...currentPrizes,
                        { type: 'cash', count: 5, amount: 10 }
                      ];
                      form.setValue('instantWinPrizes', updatedPrizes);
                    }}
                  >
                    + Add Prize
                  </Button>
                </div>
                
                {/* Header row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2 font-medium text-sm px-2">
                  <div>Prize Type</div>
                  <div>Number of Instant Wins</div>
                  <div>Instant Win Amount (£)</div>
                </div>
                
                {/* Dynamic rows for prizes */}
                {(form.watch('instantWinPrizes')?.length > 0) ? (
                  form.watch('instantWinPrizes').map((prize: PrizeConfig, index: number) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-center bg-gray-50 rounded-md p-2 relative">
                      {/* Remove button */}
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-200"
                        onClick={() => {
                          const currentPrizes = [...form.getValues().instantWinPrizes];
                          currentPrizes.splice(index, 1);
                          form.setValue('instantWinPrizes', currentPrizes);
                        }}
                      >
                        ×
                      </button>
                      
                      {/* Type - Fixed as Cash for now */}
                      <div className="text-sm text-gray-600">Cash Prize</div>
                      
                      {/* Count input */}
                      <div>
                        <Input
                          type="number"
                          min="1"
                          max="50"
                          placeholder="5"
                          value={prize.count}
                          onChange={(e) => {
                            const currentPrizes = [...form.getValues().instantWinPrizes];
                            currentPrizes[index].count = parseInt(e.target.value) || 1;
                            form.setValue('instantWinPrizes', currentPrizes);
                          }}
                        />
                      </div>
                      
                      {/* Amount input */}
                      <div>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="10"
                          value={prize.amount}
                          onChange={(e) => {
                            const currentPrizes = [...form.getValues().instantWinPrizes];
                            currentPrizes[index].amount = parseInt(e.target.value) || 1;
                            form.setValue('instantWinPrizes', currentPrizes);
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : null}

                {/* Default prize if none are configured */}
                {(!form.watch('instantWinPrizes') || form.watch('instantWinPrizes').length === 0) && (
                  <div className="mt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        form.setValue('instantWinPrizes', [
                          { type: 'cash', count: 5, amount: 10 }
                        ]);
                      }}
                    >
                      Add Default Prize (£10 Cash × 5 tickets)
                    </Button>
                  </div>
                )}
              </div>

              <div className="bg-purple-100 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Winner Display</h4>
                <p className="text-sm text-gray-700 mb-3">
                  When tickets are purchased, winners will automatically be displayed on the raffle page with their ticket number and first name (like "Deanna R" or "Karin H").
                </p>
                <p className="text-sm text-purple-700">
                  This feature helps create excitement by showing actual winners in real-time!
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Validation Summary */}
        {Object.keys(form.formState.errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h4 className="text-red-800 font-medium mb-2">Please fix the following errors:</h4>
            <ul className="list-disc list-inside text-red-700 space-y-1">
              {Object.entries(form.formState.errors).map(([field, error]) => (
                <li key={field}>
                  <span className="font-medium">{getFieldLabel(field)}:</span> {error?.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isSubmitting || Object.keys(form.formState.errors).length > 0}
            className={Object.keys(form.formState.errors).length > 0 ? "opacity-50 cursor-not-allowed" : ""}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                <span>Saving...</span>
              </div>
            ) : Object.keys(form.formState.errors).length > 0 ? (
              `Fix ${Object.keys(form.formState.errors).length} error${Object.keys(form.formState.errors).length > 1 ? 's' : ''} to continue`
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PrizeDrawForm;