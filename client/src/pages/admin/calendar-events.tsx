import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, Hammer, Package, Clock, MapPin, Link, Image } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { AdminNavigation } from "@/components/admin/AdminNavigation";

const eventFormSchema = z.object({
  eventDate: z.string().min(1, "Date is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  eventType: z.string().min(1, "Event type is required"),
  eventTime: z.string().optional(),
  eventEndTime: z.string().optional(),
  location: z.string().optional(),
  catalogUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  color: z.string().default("#2D317C"),
  isActive: z.boolean().default(true),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface CalendarEvent {
  id: number;
  eventDate: string;
  title: string;
  description: string | null;
  eventType: string;
  eventTime: string | null;
  eventEndTime: string | null;
  location: string | null;
  catalogUrl: string | null;
  imageUrl: string | null;
  color: string;
  isActive: boolean;
  createdAt: string;
}

const eventTypes = [
  { value: "auction", label: "Auction Day", icon: Hammer, color: "#2D317C" },
  { value: "viewing", label: "Viewing Day", icon: Eye, color: "#4CAF50" },
  { value: "collection", label: "Collection Day", icon: Package, color: "#FF9800" },
  { value: "special", label: "Special Event", icon: Clock, color: "#E91E63" },
];

export default function CalendarEventsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      eventDate: "",
      title: "",
      description: "",
      eventType: "auction",
      eventTime: "",
      eventEndTime: "",
      location: "",
      catalogUrl: "",
      imageUrl: "",
      color: "#2D317C",
      isActive: true,
    },
  });

  const { data: events = [], isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/admin/calendar-events"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: EventFormValues) => {
      return apiRequest("POST", "/api/admin/calendar-events", {
        ...data,
        eventDate: new Date(data.eventDate).toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/calendar-events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-events"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Calendar event created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: EventFormValues }) => {
      return apiRequest("PUT", `/api/admin/calendar-events/${id}`, {
        ...data,
        eventDate: new Date(data.eventDate).toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/calendar-events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-events"] });
      setIsDialogOpen(false);
      setEditingEvent(null);
      form.reset();
      toast({
        title: "Success",
        description: "Calendar event updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/calendar-events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/calendar-events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-events"] });
      toast({
        title: "Success",
        description: "Calendar event deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest("PUT", `/api/admin/calendar-events/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/calendar-events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-events"] });
    },
  });

  const onSubmit = (data: EventFormValues) => {
    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    form.reset({
      eventDate: format(new Date(event.eventDate), "yyyy-MM-dd"),
      title: event.title,
      description: event.description || "",
      eventType: event.eventType,
      eventTime: event.eventTime || "",
      eventEndTime: event.eventEndTime || "",
      location: event.location || "",
      catalogUrl: event.catalogUrl || "",
      imageUrl: event.imageUrl || "",
      color: event.color || "#2D317C",
      isActive: event.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenDialog = () => {
    setEditingEvent(null);
    form.reset({
      eventDate: "",
      title: "",
      description: "",
      eventType: "auction",
      eventTime: "",
      eventEndTime: "",
      location: "",
      catalogUrl: "",
      imageUrl: "",
      color: "#2D317C",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const getEventTypeInfo = (type: string) => {
    return eventTypes.find(t => t.value === type) || eventTypes[0];
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <AdminNavigation />
        <div className="text-center py-12">Loading calendar events...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminNavigation />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Auction Calendar Events</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Manage auction dates, viewing days, and collection schedules
          </p>
        </div>
        <Button onClick={handleOpenDialog} className="gap-2" data-testid="button-add-event">
          <Plus className="w-4 h-4" />
          Add Event
        </Button>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
            <p className="text-neutral-500">No calendar events yet</p>
            <p className="text-sm text-neutral-400 mt-2">Add your first auction date or viewing day</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()).map((event) => {
            const typeInfo = getEventTypeInfo(event.eventType);
            const Icon = typeInfo.icon;
            
            return (
              <Card key={event.id} className={`${!event.isActive ? 'opacity-60' : ''}`} data-testid={`card-event-${event.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: event.color || typeInfo.color }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <Badge variant="outline" style={{ borderColor: event.color || typeInfo.color, color: event.color || typeInfo.color }}>
                            {typeInfo.label}
                          </Badge>
                          {!event.isActive && (
                            <Badge variant="secondary">Hidden</Badge>
                          )}
                        </div>
                        <p className="text-primary font-medium">
                          {format(new Date(event.eventDate), "EEEE, d MMMM yyyy")}
                          {event.eventTime && ` at ${event.eventTime}`}
                          {event.eventTime && event.eventEndTime && ` - ${event.eventEndTime}`}
                        </p>
                        {event.location && (
                          <p className="text-neutral-600 dark:text-neutral-400 text-sm flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" /> {event.location}
                          </p>
                        )}
                        {event.description && (
                          <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
                            {event.description}
                          </p>
                        )}
                        <div className="flex gap-3 mt-2">
                          {event.catalogUrl && (
                            <a href={event.catalogUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                              <Link className="w-3 h-3" /> View Catalog
                            </a>
                          )}
                          {event.imageUrl && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <Image className="w-3 h-3" /> Has Image
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-500">Active</span>
                        <Switch
                          checked={event.isActive}
                          onCheckedChange={(checked) => 
                            toggleActiveMutation.mutate({ id: event.id, isActive: checked })
                          }
                          data-testid={`switch-active-${event.id}`}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(event)}
                        data-testid={`button-edit-${event.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(event.id)}
                        className="text-red-500 hover:text-red-700"
                        data-testid={`button-delete-${event.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Edit Calendar Event" : "Add Calendar Event"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-event-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., SciFi & Collectibles Auction" {...field} data-testid="input-title" />
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
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional details about the event..." {...field} data-testid="input-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="eventTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} data-testid="input-event-time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventEndTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} data-testid="input-event-end-time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., The Old Foundry Chapel, Hayle" {...field} data-testid="input-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="catalogUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catalog Link (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://auctions.lanorahouse.com/..." {...field} data-testid="input-catalog-url" />
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
                    <FormLabel>Image URL (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} data-testid="input-image-url" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-event-type">
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: type.color }}
                              />
                              {type.label}
                            </div>
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
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input type="color" {...field} className="w-16 h-10 p-1" data-testid="input-color" />
                        <Input value={field.value} onChange={field.onChange} placeholder="#2D317C" className="flex-1" />
                      </div>
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
                    <FormLabel>Show on Calendar</FormLabel>
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

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-event"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingEvent
                    ? "Update Event"
                    : "Create Event"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
