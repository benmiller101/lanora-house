import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define a generic submission type that can handle different property naming
interface Submission {
  id: number;
  userId?: string;
  user_id?: string; // Alternative property name from database
  title: string;
  description: string;
  type: string;
  condition?: string;
  photos?: any; // Could be array or string (JSON)
  estimatedValue?: string;
  estimated_value?: string; // Alternative property name
  status?: string;
  adminFeedback?: string | null;
  admin_feedback?: string | null; // Alternative property name
  adminValuation?: string | null;
  admin_valuation?: string | null; // Alternative property name
  // New negotiation fields
  offerAmount?: string | null;
  offer_amount?: string | null;
  negotiationStatus?: string | null;
  negotiation_status?: string | null;
  currentOffer?: string | null;
  current_offer?: string | null;
  userCounterOffer?: string | null;
  user_counter_offer?: string | null;
  createdAt?: string;
  created_at?: string; // Alternative property name
  updatedAt?: string;
  updated_at?: string; // Alternative property name
}

interface ItemSubmissionsListProps {
  onAddNew: () => void;
  hideButton?: boolean;
}

interface ItemSubmissionsListProps {
  onAddNew: () => void;
  hideButton?: boolean;
  onEdit?: (submission: Submission) => void;
}

export function ItemSubmissionsList({
  onAddNew,
  hideButton = false,
  onEdit,
}: ItemSubmissionsListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] =
    useState<Submission | null>(null);
  // Negotiation dialog state
  const [negotiationDialogOpen, setNegotiationDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [counterOffer, setCounterOffer] = useState('');
  const [negotiationResponse, setNegotiationResponse] = useState('');

  // Get user data from auth
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Fetch submissions using the proper JSON API endpoint
  const fetchSubmissions = async () => {
    if (!user?.id) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/submissions/public-submissions/${user.id}`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to load submissions" }));
        throw new Error(errorData.message);
      }

      const data = await response.json();
      console.log("Successfully loaded submissions:", data);

      if (Array.isArray(data)) {
        setSubmissions(data);
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      console.error("Error loading submissions:", error);
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchSubmissions();
    }
  }, [user?.id]);

  // Add a key to ensure a refresh of the component when submission happens
  useEffect(() => {
    // Listen for storage events to detect form submission
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "submission_updated") {
        fetchSubmissions();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Handle edit button click
  const handleEdit = (submission: Submission) => {
    if (onEdit) {
      onEdit(submission);
    } else {
      // If no onEdit prop is provided, we'll redirect to the members page with a query parameter
      window.location.href = `/members?tab=submissions&edit=${submission.id}`;
    }
  };

  // Handle delete button click - opens confirmation dialog
  const handleDelete = (submission: Submission) => {
    setSubmissionToDelete(submission);
    setDeleteDialogOpen(true);
  };

  // Handle confirmed deletion
  const confirmDelete = async () => {
    if (!submissionToDelete || !user?.id) return;

    try {
      const response = await fetch(
        `/api/item-submissions/${submissionToDelete.id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
          }),
        },
      );

      if (response.ok) {
        toast({
          title: "Item deleted",
          description: "Your submission has been deleted.",
        });

        // Remove the item from the local state
        setSubmissions(
          submissions.filter((s) => s.id !== submissionToDelete.id),
        );
      } else {
        toast({
          title: "Error",
          description: "Failed to delete submission. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting submission:", error);
      toast({
        title: "Error",
        description: "Failed to delete submission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSubmissionToDelete(null);
    }
  };

  // Handle negotiation response
  const negotiationMutation = useMutation({
    mutationFn: async (data: {
      submissionId: number;
      action: 'accept' | 'reject' | 'counter';
      counterOffer?: number;
      response?: string;
    }) => {
      return apiRequest("POST", `/api/submissions/${data.submissionId}/respond`, data);
    },
    onSuccess: () => {
      toast({
        title: "Response Sent",
        description: "Your response has been sent to the admin team.",
      });
      setNegotiationDialogOpen(false);
      setCounterOffer('');
      setNegotiationResponse('');
      fetchSubmissions(); // Refresh submissions
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send response. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle opening negotiation dialog
  const handleNegotiation = (submission: Submission) => {
    setSelectedSubmission(submission);
    setNegotiationDialogOpen(true);
  };

  // Handle negotiation actions
  const handleAcceptOffer = () => {
    if (!selectedSubmission) return;
    negotiationMutation.mutate({
      submissionId: selectedSubmission.id,
      action: 'accept',
      response: negotiationResponse || 'I accept your offer.'
    });
  };

  const handleRejectOffer = () => {
    if (!selectedSubmission) return;
    negotiationMutation.mutate({
      submissionId: selectedSubmission.id,
      action: 'reject',
      response: negotiationResponse || 'I decline your offer.'
    });
  };

  const handleCounterOffer = () => {
    if (!selectedSubmission || !counterOffer) return;
    const counterAmount = parseFloat(counterOffer);
    if (isNaN(counterAmount) || counterAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid counter offer amount.",
        variant: "destructive",
      });
      return;
    }
    negotiationMutation.mutate({
      submissionId: selectedSubmission.id,
      action: 'counter',
      counterOffer: counterAmount,
      response: negotiationResponse || `I would like to counter-offer with £${counterAmount}.`
    });
  };

  // Helper functions for display
  const getTypeText = (type: string) => {
    switch (type) {
      case "auction":
        return "Auction Item";
      case "sale":
        return "Item for Sale";
      case "raffle_prize":
        return "Raffle Prize Donation";
      default:
        return type;
    }
  };

  const getStatusBadge = (status?: string, negotiationStatus?: string) => {
    const statusValue = status || "pending";

    // Handle negotiation-specific statuses
    if (statusValue === "negotiating" && negotiationStatus) {
      switch (negotiationStatus) {
        case "offered":
          return (
            <Badge
              variant="outline"
              className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300"
            >
              Offer Received
            </Badge>
          );
        case "user_countered":
          return (
            <Badge
              variant="outline"
              className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300"
            >
              Counter Offer Sent
            </Badge>
          );
        case "admin_countered":
          return (
            <Badge
              variant="outline"
              className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300"
            >
              Counter Offer Received
            </Badge>
          );
        default:
          return (
            <Badge
              variant="outline"
              className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300"
            >
              Negotiating
            </Badge>
          );
      }
    }

    switch (statusValue) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300"
          >
            Pending Review
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300"
          >
            Approved
          </Badge>
        );
      case "negotiating":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300"
          >
            Offer Received
          </Badge>
        );
      case "accepted":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300"
          >
            Accepted
          </Badge>
        );
      case "shipping":
        return (
          <Badge
            variant="outline"
            className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300"
          >
            Shipping
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 hover:bg-red-200 border-red-300"
          >
            Not Suitable
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Your Submissions</h3>
        {!hideButton && <Button onClick={onAddNew}>Submit New Item</Button>}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your submission. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Negotiation Dialog */}
      <Dialog open={negotiationDialogOpen} onOpenChange={setNegotiationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respond to Offer</DialogTitle>
            <DialogDescription>
              {selectedSubmission && (
                <>
                  We've made an offer of <strong>£{selectedSubmission.offerAmount || selectedSubmission.offer_amount}</strong> for your item: <strong>{selectedSubmission.title}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="response">Your Response (Optional)</Label>
              <Textarea
                id="response"
                value={negotiationResponse}
                onChange={(e) => setNegotiationResponse(e.target.value)}
                placeholder="Add any message or questions you'd like to include..."
                className="mt-1.5"
                rows={3}
              />
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Choose your response:</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleAcceptOffer}
                    disabled={negotiationMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Accept Offer
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Accept the offer and proceed to shipping
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleRejectOffer}
                    disabled={negotiationMutation.isPending}
                    variant="destructive"
                  >
                    Decline Offer
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Politely decline the offer
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Label htmlFor="counterOffer" className="text-base font-medium">
                      Counter Offer (£)
                    </Label>
                    <Input
                      id="counterOffer"
                      type="number"
                      value={counterOffer}
                      onChange={(e) => setCounterOffer(e.target.value)}
                      placeholder="Enter amount"
                      className="w-32"
                      min="0"
                      step="0.01"
                    />
                    <Button
                      onClick={handleCounterOffer}
                      disabled={negotiationMutation.isPending || !counterOffer}
                      variant="outline"
                    >
                      Send Counter Offer
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground ml-0">
                    Suggest a different amount you'd be willing to accept
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNegotiationDialogOpen(false)}
              disabled={negotiationMutation.isPending}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {submissions.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-muted/20">
          <h3 className="text-xl font-medium mb-4">No Submissions Yet</h3>
          <p className="text-muted-foreground mb-6">
            You haven't submitted any items for consideration yet. Submit your
            antiques, collectibles, or vintage items for our experts to value
            and potentially feature in our store or auctions.
          </p>
          {/* Single button here instead of duplicate */}
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => {
            // Safely get property values accounting for different naming conventions
            const submissionId = submission.id;
            const title = submission.title || "Untitled Item";
            const description =
              submission.description || "No description provided";
            const condition = submission.condition || "";
            const type = submission.type || "auction";
            const status = submission.status || submission.status || "pending";
            const estimatedValue =
              submission.estimatedValue || submission.estimated_value || "";
            const adminFeedback =
              submission.adminFeedback || submission.admin_feedback || null;
            const adminValuation =
              submission.adminValuation || submission.admin_valuation || null;
            const offerAmount =
              submission.offerAmount || submission.offer_amount || null;
            const currentOffer =
              submission.currentOffer || submission.current_offer || null;
            const negotiationStatus =
              submission.negotiationStatus || submission.negotiation_status || null;
            const createdAt =
              submission.createdAt ||
              submission.created_at ||
              new Date().toISOString();

            return (
              <Card
                key={submissionId}
                className="overflow-hidden shadow-sm border-l-4 border-l-primary"
              >
                <CardHeader className="p-4 bg-secondary/20">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <CardTitle className="text-base sm:text-lg">
                        {title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Submitted on {new Date(createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{getTypeText(type)}</Badge>
                        {getStatusBadge(status, negotiationStatus)}
                      </div>
                      {status === "pending" && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(submission)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(submission)}
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                      {status === "negotiating" && negotiationStatus === "offered" && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleNegotiation(submission)}
                            className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                          >
                            Respond to Offer
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {description}
                      </p>

                      {condition && (
                        <>
                          <h4 className="font-medium mb-1">Condition</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {condition}
                          </p>
                        </>
                      )}

                      {estimatedValue && (
                        <>
                          <h4 className="font-medium mb-1">
                            Your Estimated Value
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            £{estimatedValue}
                          </p>
                        </>
                      )}
                    </div>

                    <div>
                      {adminFeedback && (
                        <>
                          <h4 className="font-medium mb-1">Admin Feedback</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {adminFeedback}
                          </p>
                        </>
                      )}

                      {adminValuation && (
                        <>
                          <h4 className="font-medium mb-1">Admin Valuation</h4>
                          <p className="text-sm font-semibold">
                            £{adminValuation}
                          </p>
                        </>
                      )}

                      {offerAmount && (
                        <>
                          <h4 className="font-medium mb-1 text-blue-600">Our Offer</h4>
                          <p className="text-sm font-semibold text-blue-700">
                            £{parseFloat(offerAmount).toFixed(2)}
                          </p>
                          {status === "negotiating" && negotiationStatus === "offered" && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Awaiting your response
                            </p>
                          )}
                          {status === "negotiating" && negotiationStatus === "user_countered" && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Counter offer sent - awaiting admin response
                            </p>
                          )}
                        </>
                      )}

                      {status === "accepted" && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="font-medium text-green-800 mb-1">✓ Offer Accepted</h4>
                          <p className="text-sm text-green-700">
                            Instructions have been sent with a shipping label. 
                            Payment will be processed via bank transfer once we receive your item.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
