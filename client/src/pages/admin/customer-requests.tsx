import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Home, 
  Image as ImageIcon,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { AdminNavigation } from "@/components/admin/AdminNavigation";

interface CustomerRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  propertyType?: string;
  clearanceType?: string;
  timeframe?: string;
  additionalInfo?: string;
  imageUrls?: string[];
  status: string;
  requestType: string;
  createdAt: string;
  updatedAt: string;
}

const CustomerRequestsAdmin = () => {
  const [selectedRequest, setSelectedRequest] = useState<CustomerRequest | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const prevImage = useCallback(() =>
    setLightboxIndex(i => (i - 1 + lightboxImages.length) % lightboxImages.length), [lightboxImages.length]);

  const nextImage = useCallback(() =>
    setLightboxIndex(i => (i + 1) % lightboxImages.length), [lightboxImages.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, closeLightbox, prevImage, nextImage]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["/api/clearance-stories/quotes"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/clearance-stories/quotes");
      return response.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest("PUT", `/api/clearance-stories/quotes/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clearance-stories/quotes"] });
      toast({
        title: "Status Updated",
        description: "Request status has been updated successfully.",
      });
    },
  });

  const filteredRequests = requests?.filter((request: CustomerRequest) => {
    const statusMatch = statusFilter === "all" || request.status === statusFilter;
    const typeMatch = typeFilter === "all" || request.requestType === typeFilter;
    return statusMatch && typeMatch;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "responded": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "responded": return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleViewDetails = (request: CustomerRequest) => {
    setSelectedRequest(request);
    setIsDetailDialogOpen(true);
  };

  const handleStatusChange = (requestId: number, newStatus: string) => {
    updateStatusMutation.mutate({ id: requestId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading customer requests...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <AdminNavigation />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customer Requests</h1>
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="clearance">Clearance Quotes</SelectItem>
              <SelectItem value="contact">Contact Requests</SelectItem>
              <SelectItem value="general">General Inquiries</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRequests.map((request: CustomerRequest) => (
          <Card key={request.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{request.name}</CardTitle>
                <Badge className={getStatusColor(request.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(request.status)}
                    {request.status}
                  </div>
                </Badge>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(request.createdAt).toLocaleDateString()} • {request.requestType}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{request.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{request.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="line-clamp-2">{request.address}</span>
                </div>
              </div>

              {request.clearanceType && (
                <div className="flex items-center gap-2 text-sm">
                  <Home className="w-4 h-4 text-gray-400" />
                  <span>{request.clearanceType}</span>
                </div>
              )}

              {request.timeframe && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{request.timeframe}</span>
                </div>
              )}

              {request.imageUrls && request.imageUrls.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <ImageIcon className="w-4 h-4" />
                  <span>{request.imageUrls.length} photo(s) attached</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(request)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Button>
                
                <Select
                  value={request.status}
                  onValueChange={(value) => handleStatusChange(request.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-500">
            {statusFilter !== "all" || typeFilter !== "all" 
              ? "Try adjusting your filters to see more requests." 
              : "Customer requests will appear here when submitted."}
          </p>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Request Details</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Customer Name</Label>
                    <p className="text-lg font-medium">{selectedRequest.name}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p>{selectedRequest.email}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Phone</Label>
                    <p>{selectedRequest.phone}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <Badge className={getStatusColor(selectedRequest.status)}>
                      {selectedRequest.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Property Address</Label>
                    <p>{selectedRequest.address}</p>
                  </div>
                  
                  {selectedRequest.propertyType && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Property Type</Label>
                      <p>{selectedRequest.propertyType}</p>
                    </div>
                  )}
                  
                  {selectedRequest.clearanceType && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Clearance Type</Label>
                      <p>{selectedRequest.clearanceType}</p>
                    </div>
                  )}
                  
                  {selectedRequest.timeframe && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Timeframe</Label>
                      <p>{selectedRequest.timeframe}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedRequest.additionalInfo && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Additional Information</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedRequest.additionalInfo}</p>
                </div>
              )}

              {selectedRequest.imageUrls && selectedRequest.imageUrls.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-500 mb-3 block">
                    Attached Photos ({selectedRequest.imageUrls.length}) — click to view fullscreen
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedRequest.imageUrls.map((url, index) => (
                      <button
                        key={index}
                        type="button"
                        className="relative group rounded-lg overflow-hidden border focus:outline-none focus:ring-2 focus:ring-primary"
                        onClick={() => openLightbox(selectedRequest.imageUrls!, index)}
                      >
                        <img
                          src={url}
                          alt={`Request photo ${index + 1}`}
                          className="w-full h-32 object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                          <ZoomIn className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500">
                <p>Submitted: {new Date(selectedRequest.createdAt).toLocaleString()}</p>
                <p>Last Updated: {new Date(selectedRequest.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Fullscreen Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-7 h-7" />
          </button>

          {/* Counter */}
          {lightboxImages.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium bg-black/40 px-3 py-1 rounded-full">
              {lightboxIndex + 1} / {lightboxImages.length}
            </div>
          )}

          {/* Prev */}
          {lightboxImages.length > 1 && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Image */}
          <img
            src={lightboxImages[lightboxIndex]}
            alt={`Photo ${lightboxIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          />

          {/* Next */}
          {lightboxImages.length > 1 && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Next photo"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Thumbnail strip */}
          {lightboxImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {lightboxImages.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={e => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                    i === lightboxIndex ? "border-white scale-110" : "border-white/30 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={url} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerRequestsAdmin;