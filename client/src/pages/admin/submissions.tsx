import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { FiCheck, FiX, FiEye, FiMail } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { AdminNavigation } from "@/components/admin/AdminNavigation";

interface ItemSubmission {
  id: number;
  user_id: string;
  title: string;
  description: string;
  type: string;
  condition: string;
  photos: string[];
  estimated_value: number | null;
  status: string;
  admin_feedback: string | null;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_username?: string;
  user_full_name?: string;
}

export default function AdminSubmissionsPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedSubmission, setSelectedSubmission] = useState<ItemSubmission | null>(null);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedGallery, setSelectedGallery] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [valuation, setValuation] = useState("");
  const [responseStatus, setResponseStatus] = useState<"approved" | "rejected">("approved");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get admin credentials from local storage
  const adminEmail = localStorage.getItem('adminEmail');
  const adminPassword = localStorage.getItem('adminPassword');
  
  const { data: directSubmissionsData, isLoading: isLoadingDebug } = useQuery({
    queryKey: ["/api/admin/debug-submissions"],
    queryFn: async () => {
      const response = await fetch(`/api/admin/debug-submissions`);
      if (!response.ok) {
        console.error("Failed to fetch debug submissions");
        return { count: 0, data: [] };
      }
      return response.json();
    },
    refetchInterval: 10000 // Auto-refresh every 10 seconds
  });
  
  // Process the direct submissions data
  const directSubmissions = React.useMemo(() => {
    if (!directSubmissionsData || !directSubmissionsData.data) {
      console.log("No direct submissions data available");
      return [];
    }
    
    console.log(`Processing ${directSubmissionsData.count} submissions from debug endpoint`);
    
    return directSubmissionsData.data.map((row: any) => {
      // Process photos field which could be JSON string or array
      let photos: string[] = [];
      try {
        if (typeof row.photos === 'string') {
          photos = JSON.parse(row.photos);
          console.log(`Parsed photos for submission ${row.id} from JSON string:`, photos);
        } else if (Array.isArray(row.photos)) {
          photos = row.photos;
          console.log(`Using array photos for submission ${row.id}:`, photos);
        }
      } catch (e) {
        console.log(`Error parsing photos for submission ${row.id}:`, e);
        photos = [];
      }
      
      // Return the formatted submission
      return {
        id: row.id,
        user_id: row.user_id,
        title: row.title || "Untitled Submission",
        description: row.description || "",
        type: row.type || "auction",
        condition: row.condition || "",
        photos: photos,
        estimated_value: row.estimated_value ? Number(row.estimated_value) : null,
        status: row.status || "pending",
        admin_feedback: row.admin_feedback || null,
        admin_valuation: null, // This field may not exist in all records
        created_at: row.created_at,
        updated_at: row.updated_at || row.created_at,
        source_table: row.source_table || 'unknown', // Track which table it came from
        user_email: row.user_email || null, // Add email if available
        user_username: row.user_username || null,
        user_full_name: row.user_full_name || null
      };
    });
  }, [directSubmissionsData]);
  
  // Regular admin API submissions (still needed for the submission response functionality)
  const { data: regularSubmissions = [], isLoading, refetch } = useQuery<ItemSubmission[]>({
    queryKey: ["/api/admin/submissions"],
    queryFn: async () => {
      // Use our improved submissions endpoint
      const url = `/api/admin/submissions`;
      
      console.log("Fetching submissions from improved endpoint:", url);
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error("Failed to fetch submissions:", response.status, response.statusText);
        return []; // Return empty array instead of throwing
      }
      
      const data = await response.json();
      console.log(`Loaded ${data.data?.length || 0} submissions from admin API`);
      return data.data || [];
    },
    refetchInterval: 15000 // Auto-refresh every 15 seconds to show new submissions
  });
  
  // Combine both submission sources, prioritizing direct submissions
  const submissions = React.useMemo(() => {
    // Use a Map to deduplicate by ID
    const submissionsMap = new Map();
    
    // First add direct submissions (from debug endpoint)
    directSubmissions.forEach((submission: ItemSubmission) => {
      submissionsMap.set(submission.id, submission);
    });
    
    // Then add any regular submissions not already in the map
    regularSubmissions.forEach((submission: ItemSubmission) => {
      if (!submissionsMap.has(submission.id)) {
        submissionsMap.set(submission.id, submission);
      }
    });
    
    console.log(`Combined ${directSubmissions.length} direct and ${regularSubmissions.length} regular submissions`);
    
    // Convert back to array
    return Array.from(submissionsMap.values());
  }, [directSubmissions, regularSubmissions]);

  const respond = useMutation({
    mutationFn: async (data: { 
      id: number; 
      status: string; 
      adminFeedback: string; 
      adminValuation?: number;
      offerAmount?: number;
    }) => {
      // Use the admin submissions endpoint for the new offer system
      return apiRequest(
        "POST", 
        `/api/admin/submissions/${data.id}`, 
        data
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate all related query keys to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/item-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/debug-submissions"] });
      
      // Show different toast messages based on the response status
      if (variables.status === "approved") {
        const contactEmail = selectedSubmission?.user_email;
        const offerAmount = variables.offerAmount;
        toast({
          title: "Offer Sent",
          description: contactEmail 
            ? `Your offer of £${offerAmount} has been sent to ${contactEmail}. They can now accept, reject, or counter-offer.`
            : `Your offer of £${offerAmount} has been sent. The member will be able to respond via their members portal.`,
          duration: 5000,
        });
      } else {
        toast({
          title: "Submission Rejected",
          description: "The member has been notified of your decision.",
        });
      }
      
      // Reset form and close dialog
      setIsResponseDialogOpen(false);
      setFeedback("");
      setValuation("");
    },
    onError: (error) => {
      toast({
        title: "Failed to respond",
        description: "There was an error submitting your response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getTypeLabel = (type: string) => {
    switch(type) {
      case "auction":
        return "Auction Item";
      case "sale":
        return "Item for Sale";
      case "raffle_prize":
        return "Raffle Prize";
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string, negotiationStatus?: string) => {
    // Handle negotiation-specific statuses
    if (status === "negotiating" && negotiationStatus) {
      switch (negotiationStatus) {
        case "offered":
          return <Badge variant="default" className="bg-blue-500">Offer Sent</Badge>;
        case "user_countered":
          return <Badge variant="default" className="bg-orange-500">Counter Offer Received</Badge>;
        case "admin_countered":
          return <Badge variant="default" className="bg-purple-500">Counter Offer Sent</Badge>;
        case "user_accepted":
          return <Badge variant="default" className="bg-emerald-500">Accepted</Badge>;
        case "user_rejected":
          return <Badge variant="destructive">Rejected</Badge>;
        default:
          return <Badge variant="default" className="bg-blue-500">Negotiating</Badge>;
      }
    }

    switch(status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "approved":
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case "negotiating":
        return <Badge variant="default" className="bg-blue-500">Negotiating</Badge>;
      case "accepted":
        return <Badge variant="default" className="bg-emerald-500">Accepted</Badge>;
      case "shipping":
        return <Badge variant="default" className="bg-purple-500">Shipping</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleRespond = (submission: ItemSubmission) => {
    setSelectedSubmission(submission);
    setIsResponseDialogOpen(true);
  };

  const handleCounterOfferResponse = async (submissionId: number, action: 'accept' | 'reject' | 'counter') => {
    if (!submissionId) return;

    if (action === 'accept') {
      // Accept the user's counter offer - use their counter amount as final price
      const submission = submissions.find(s => s.id === submissionId);
      if (!submission || !submission.user_counter_offer) return;

      try {
        const response = await fetch(`/api/admin/submissions/${submissionId}/negotiate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'admin_accept_counter',
            finalAmount: submission.user_counter_offer,
            adminResponse: `Counter offer of £${parseFloat(submission.user_counter_offer).toFixed(2)} accepted.`
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to accept counter offer');
        }

        toast({
          title: "Counter offer accepted",
          description: `User's counter offer of £${parseFloat(submission.user_counter_offer).toFixed(2)} has been accepted.`,
        });

        refetch();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to accept counter offer. Please try again.",
          variant: "destructive",
        });
      }
    } else if (action === 'reject') {
      // Reject the counter offer - end negotiation
      try {
        const response = await fetch(`/api/admin/submissions/${submissionId}/negotiate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'admin_reject_counter',
            adminResponse: 'We cannot accept your counter offer. Thank you for your interest.'
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to reject counter offer');
        }

        toast({
          title: "Counter offer rejected",
          description: "The user's counter offer has been rejected.",
        });

        refetch();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to reject counter offer. Please try again.",
          variant: "destructive",
        });
      }
    } else if (action === 'counter') {
      // Make admin counter offer - show dialog for new amount
      const submission = submissions.find(s => s.id === submissionId);
      if (!submission) return;
      
      const newAmount = prompt(`User's counter offer: £${parseFloat(submission.user_counter_offer || '0').toFixed(2)}\n\nEnter your counter offer amount:`);
      
      if (newAmount && !isNaN(parseFloat(newAmount))) {
        try {
          const response = await fetch(`/api/admin/submissions/${submissionId}/negotiate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'admin_counter',
              counterAmount: parseFloat(newAmount),
              adminResponse: `We appreciate your interest. We can offer £${parseFloat(newAmount).toFixed(2)}.`
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to make counter offer');
          }

          toast({
            title: "Counter offer sent",
            description: `Your counter offer of £${parseFloat(newAmount).toFixed(2)} has been sent to the user.`,
          });

          refetch();
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to send counter offer. Please try again.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const handleView = (submission: ItemSubmission) => {
    setSelectedSubmission(submission);
    setIsViewDialogOpen(true);
  };

  const handleSubmitResponse = () => {
    if (!selectedSubmission) return;
    
    const valuationNumber = valuation ? parseFloat(valuation) : undefined;
    
    // Validation: If approving, an offer amount is required
    if (responseStatus === 'approved' && !valuationNumber) {
      toast({
        title: "Offer Amount Required",
        description: "Please enter an offer amount before approving the submission.",
        variant: "destructive",
      });
      return;
    }
    
    respond.mutate({
      id: selectedSubmission.id,
      status: responseStatus,
      adminFeedback: feedback,
      ...(valuationNumber && { adminValuation: valuationNumber }),
      ...(responseStatus === 'approved' && { offerAmount: valuationNumber }),
    });
  };

  const filteredSubmissions = submissions.filter(
    (submission) => submission.status === activeTab
  );

  return (
    <>
      <Helmet>
        <title>Item Submissions | Admin Dashboard</title>
      </Helmet>
      
      <div className="flex min-h-screen flex-col">
        <div className="p-4">
          <AdminNavigation />
        </div>
        
        <div className="flex-1 space-y-4 p-8 pt-0">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Item Submissions</h2>
          </div>
          
          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending">
                Pending
                <Badge variant="outline" className="ml-2">
                  {submissions.filter(s => s.status === "pending").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="negotiating">
                Negotiating
                <Badge variant="outline" className="ml-2">
                  {submissions.filter(s => s.status === "negotiating").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="accepted">
                Accepted
                <Badge variant="outline" className="ml-2">
                  {submissions.filter(s => s.status === "accepted").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected
                <Badge variant="outline" className="ml-2">
                  {submissions.filter(s => s.status === "rejected").length}
                </Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-lg text-muted-foreground mb-2">No {activeTab} submissions</p>
                    <p className="text-sm text-muted-foreground mb-6">
                      {activeTab === "pending" 
                        ? "There are no pending submissions to review at the moment." 
                        : `There are no ${activeTab} submissions.`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredSubmissions.map((submission) => (
                  <Card key={submission.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <CardTitle>{submission.title}</CardTitle>
                          <CardDescription>
                            {getTypeLabel(submission.type)} · Submitted on {new Date(submission.created_at).toLocaleDateString()}
                          </CardDescription>
                          <div className="text-sm mt-1 text-blue-600">
                            <span className="font-medium">Member ID:</span> {submission.user_id}
                          </div>
                          {submission.user_email ? (
                            <div className="text-sm mt-1 text-blue-600 flex items-center">
                              <span className="font-medium mr-1">Email:</span> 
                              <span className="flex items-center">
                                <FiMail className="mr-1 h-4 w-4" />
                                {submission.user_email}
                              </span>
                            </div>
                          ) : (
                            <div className="text-sm mt-1 text-gray-400 italic">
                              <span className="font-medium">Email:</span> Not available
                            </div>
                          )}
                          {submission.user_username && (
                            <div className="text-sm mt-1 text-blue-600">
                              <span className="font-medium">Username:</span> {submission.user_username}
                            </div>
                          )}
                          {submission.user_full_name && (
                            <div className="text-sm mt-1 text-blue-600">
                              <span className="font-medium">Name:</span> {submission.user_full_name}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleView(submission)}
                          >
                            <FiEye className="mr-1 h-4 w-4" />
                            View
                          </Button>
                          
                          {submission.status === "pending" && (
                            <>
                              <Button 
                                size="sm" 
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  setResponseStatus("approved");
                                  handleRespond(submission);
                                }}
                              >
                                <FiCheck className="mr-1 h-4 w-4" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => {
                                  setResponseStatus("rejected");
                                  handleRespond(submission);
                                }}
                              >
                                <FiX className="mr-1 h-4 w-4" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="col-span-2">
                          <h4 className="font-medium mb-1">Description</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {submission.description.length > 150 
                              ? `${submission.description.substring(0, 150)}...` 
                              : submission.description}
                          </p>
                          
                          {submission.condition && (
                            <div className="mb-3">
                              <span className="text-sm font-medium mr-2">Condition:</span>
                              <span className="text-sm">{submission.condition}</span>
                            </div>
                          )}
                          
                          {submission.estimated_value !== null && submission.estimated_value !== undefined && (
                            <div>
                              <span className="text-sm font-medium mr-2">Estimated Value:</span>
                              <span className="text-sm">£{Number(submission.estimated_value).toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          {submission.photos && (
                            <div>
                              <h4 className="font-medium mb-1">Primary Photo</h4>
                              {(() => {
                                // Handle different photo formats safely
                                let photoArray = [];
                                try {
                                  if (typeof submission.photos === 'string') {
                                    photoArray = JSON.parse(submission.photos);
                                  } else if (Array.isArray(submission.photos)) {
                                    photoArray = submission.photos;
                                  }
                                } catch (e) {
                                  console.error('Error parsing photos:', e);
                                  photoArray = [];
                                }
                                
                                if (photoArray.length > 0) {
                                  return (
                                    <>
                                      <img 
                                        src={photoArray[0]} 
                                        alt={submission.title}
                                        className="w-full h-32 object-cover rounded-md cursor-pointer" 
                                        onClick={() => {
                                          setSelectedGallery(photoArray);
                                          setCurrentPhotoIndex(0);
                                          setSelectedPhoto(photoArray[0]);
                                          setIsPhotoViewerOpen(true);
                                        }}
                                      />
                                      {photoArray.length > 1 && (
                                        <p 
                                          className="text-xs text-muted-foreground mt-1 cursor-pointer hover:text-blue-500"
                                          onClick={() => {
                                            setSelectedGallery(photoArray);
                                            setCurrentPhotoIndex(0);
                                            setSelectedPhoto(photoArray[0]);
                                            setIsPhotoViewerOpen(true);
                                          }}
                                        >
                                          + {photoArray.length - 1} more photos (click to view all)
                                        </p>
                                      )}
                                    </>
                                  );
                                } else {
                                  return (
                                    <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-md">
                                      <p className="text-sm text-gray-500">No photo available</p>
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Photo Viewer Dialog */}
      <Dialog open={isPhotoViewerOpen} onOpenChange={setIsPhotoViewerOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Photo Viewer</DialogTitle>
            <DialogDescription>
              {selectedGallery.length > 1 
                ? `Photo ${currentPhotoIndex + 1} of ${selectedGallery.length}` 
                : "View and download high-resolution image"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPhoto && (
            <div className="flex flex-col items-center space-y-4">
              <div className="max-h-[70vh] overflow-hidden relative">
                <img 
                  src={selectedPhoto} 
                  alt="Submission photo" 
                  className="max-w-full max-h-[70vh] object-contain"
                />
                
                {/* Navigation arrows for gallery */}
                {selectedGallery.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
                    <Button 
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-white/80 shadow-md pointer-events-auto ml-2"
                      onClick={() => {
                        const newIndex = (currentPhotoIndex - 1 + selectedGallery.length) % selectedGallery.length;
                        setCurrentPhotoIndex(newIndex);
                        setSelectedPhoto(selectedGallery[newIndex]);
                      }}
                      disabled={selectedGallery.length <= 1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </Button>
                    
                    <Button 
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-white/80 shadow-md pointer-events-auto mr-2"
                      onClick={() => {
                        const newIndex = (currentPhotoIndex + 1) % selectedGallery.length;
                        setCurrentPhotoIndex(newIndex);
                        setSelectedPhoto(selectedGallery[newIndex]);
                      }}
                      disabled={selectedGallery.length <= 1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Thumbnail navigation */}
              {selectedGallery.length > 1 && (
                <div className="flex justify-center gap-2 overflow-x-auto py-2 w-full max-w-full">
                  {selectedGallery.map((photo, index) => (
                    <div
                      key={index}
                      className={`w-16 h-16 cursor-pointer ${index === currentPhotoIndex ? 'ring-2 ring-primary' : 'opacity-70'}`}
                      onClick={() => {
                        setCurrentPhotoIndex(index);
                        setSelectedPhoto(photo);
                      }}
                    >
                      <img 
                        src={photo} 
                        alt={`Thumbnail ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-center space-x-3 w-full">
                <Button 
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = selectedPhoto;
                    a.download = `submission-photo-${Date.now()}.jpg`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Image
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    window.open(selectedPhoto, '_blank');
                  }}
                >
                  Open in New Tab
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {responseStatus === "approved" ? "Approve" : "Reject"} Submission
            </DialogTitle>
            <DialogDescription>
              {responseStatus === "approved" 
                ? "Make an offer to purchase this item. The member will receive your offer and can accept, reject, or counter-offer." 
                : "Provide feedback for the rejected item. The member will be notified of your decision."}
            </DialogDescription>
            {selectedSubmission?.user_email && (
              <p className="text-sm font-medium mt-2">
                You'll be communicating with: <span className="text-blue-600">{selectedSubmission.user_email}</span>
              </p>
            )}
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="feedback">Feedback for Member</Label>
              <Textarea 
                id="feedback" 
                value={feedback} 
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={responseStatus === "approved" 
                  ? "Example: Thank you for your submission. We would like to make an offer to purchase your item. Please review our offer below and let us know if you accept, reject, or would like to make a counter-offer."
                  : "Example: Thank you for your submission. Unfortunately, this item doesn't meet our current requirements. We encourage you to submit other items in the future."
                }
                rows={4}
                className="mt-1.5"
              />
              
            </div>
            
            {responseStatus === "approved" && (
              <div>
                <Label htmlFor="valuation">Offer Amount (£)</Label>
                <Input 
                  id="valuation" 
                  type="number" 
                  value={valuation} 
                  onChange={(e) => setValuation(e.target.value)}
                  placeholder="Enter the amount you want to offer"
                  className="mt-1.5"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  This will be sent to the member as your purchase offer. They can accept, reject, or counter-offer.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {selectedSubmission?.user_email && responseStatus === "approved" && (
              <div className="flex-1 text-left mb-2 sm:mb-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mr-2"
                  onClick={() => {
                    // Open email client
                    window.open(`mailto:${selectedSubmission.user_email}?subject=Your item submission at Lanora House&body=Thank you for your submission. We are interested in your item.`, '_blank');
                  }}
                >
                  <FiMail className="mr-1 h-4 w-4" />
                  Email Member
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsResponseDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitResponse}
                className={responseStatus === "approved" ? "bg-green-600 hover:bg-green-700" : ""}
                variant={responseStatus === "approved" ? "default" : "destructive"}
                disabled={!feedback || (responseStatus === "approved" && !valuation)}
              >
                Submit Response
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Submission Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              {selectedSubmission && (
                <div className="flex items-center gap-2 mt-1">
                  <span>{getTypeLabel(selectedSubmission.type)}</span>
                  <span>•</span>
                  <span>
                    Submitted on {new Date(selectedSubmission.created_at).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  {getStatusBadge(selectedSubmission.status, selectedSubmission.negotiation_status)}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">{selectedSubmission.title}</h3>
                <p className="text-muted-foreground">{selectedSubmission.description}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedSubmission.condition && (
                  <div>
                    <h4 className="font-medium mb-1">Condition</h4>
                    <p>{selectedSubmission.condition}</p>
                  </div>
                )}
                
                {selectedSubmission.estimated_value !== null && selectedSubmission.estimated_value !== undefined && (
                  <div>
                    <h4 className="font-medium mb-1">Estimated Value</h4>
                    <p>£{Number(selectedSubmission.estimated_value).toFixed(2)}</p>
                  </div>
                )}
              </div>
              
              {selectedSubmission.photos && selectedSubmission.photos.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Photos</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedSubmission.photos.map((photo, index) => (
                      <img 
                        key={index} 
                        src={photo} 
                        alt={`${selectedSubmission.title} - Photo ${index + 1}`}
                        className="w-full h-40 object-cover rounded-md"
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {selectedSubmission.status !== "pending" && selectedSubmission.admin_feedback && (
                <div>
                  <h4 className="font-medium mb-1">Admin Feedback</h4>
                  <p className="text-muted-foreground">{selectedSubmission.admin_feedback}</p>
                </div>
              )}

              {/* Negotiation Details */}
              {selectedSubmission.status === "negotiating" && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Negotiation Details</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedSubmission.admin_valuation && (
                      <div>
                        <h5 className="font-medium mb-1 text-blue-600">Admin Valuation</h5>
                        <p className="text-sm text-blue-700">
                          £{parseFloat(selectedSubmission.admin_valuation).toFixed(2)}
                        </p>
                      </div>
                    )}
                    
                    {selectedSubmission.offer_amount && (
                      <div>
                        <h5 className="font-medium mb-1 text-green-600">Current Offer</h5>
                        <p className="text-sm text-green-700">
                          £{parseFloat(selectedSubmission.offer_amount).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Counter Offer Information */}
                  {selectedSubmission.negotiation_status === "user_countered" && selectedSubmission.user_counter_offer && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                      <h5 className="font-medium mb-2 text-orange-800">User Counter Offer</h5>
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-lg font-semibold text-orange-700">
                          £{parseFloat(selectedSubmission.user_counter_offer).toFixed(2)}
                        </span>
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                          Counter Offer Received
                        </Badge>
                      </div>
                      {selectedSubmission.user_response && (
                        <div>
                          <h6 className="font-medium text-sm text-orange-700 mb-1">User Message:</h6>
                          <p className="text-sm text-orange-600 italic">{selectedSubmission.user_response}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {selectedSubmission.negotiation_status === "user_accepted" && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                      <h5 className="font-medium mb-1 text-green-800">Offer Accepted!</h5>
                      <p className="text-sm text-green-600">The user has accepted your offer of £{parseFloat(selectedSubmission.offer_amount).toFixed(2)}.</p>
                    </div>
                  )}
                  
                  {selectedSubmission.negotiation_status === "user_rejected" && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <h5 className="font-medium mb-1 text-red-800">Offer Rejected</h5>
                      <p className="text-sm text-red-600">The user has rejected your offer.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            
            {/* Actions for Pending Submissions */}
            {selectedSubmission && selectedSubmission.status === "pending" && (
              <>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setResponseStatus("rejected");
                    handleRespond(selectedSubmission);
                  }}
                >
                  <FiX className="mr-1 h-4 w-4" />
                  Reject
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setResponseStatus("approved");
                    handleRespond(selectedSubmission);
                  }}
                >
                  <FiCheck className="mr-1 h-4 w-4" />
                  Approve
                </Button>
              </>
            )}
            
            {/* Actions for Counter Offers */}
            {selectedSubmission && selectedSubmission.status === "negotiating" && selectedSubmission.negotiation_status === "user_countered" && (
              <>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    // Handle rejecting counter offer - end negotiation
                    handleCounterOfferResponse(selectedSubmission.id, 'reject');
                  }}
                >
                  <FiX className="mr-1 h-4 w-4" />
                  Reject Counter
                </Button>
                <Button 
                  variant="outline"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    // Handle making new counter offer
                    handleCounterOfferResponse(selectedSubmission.id, 'counter');
                  }}
                >
                  Make Counter Offer
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    // Handle accepting counter offer
                    handleCounterOfferResponse(selectedSubmission.id, 'accept');
                  }}
                >
                  <FiCheck className="mr-1 h-4 w-4" />
                  Accept Counter
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}