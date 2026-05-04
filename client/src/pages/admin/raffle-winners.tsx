import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy, Package, Mail, MapPin, Clock, User, Edit3 } from "lucide-react";
import AdminNavigation from "@/components/admin/AdminNavigation";

interface RaffleWinner {
  raffle_id: number;
  raffle_name: string;
  winning_ticket_number: number;
  won_at: string;
  user_id: string;
  winner_email: string;
  winner_first_name: string;
  winner_last_name: string;
  delivery_id?: number;
  delivery_type?: string;
  delivery_email?: string;
  delivery_address?: any;
  delivery_status?: string;
  delivery_requested_at?: string;
}

export default function RaffleWinnersAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWinner, setSelectedWinner] = useState<RaffleWinner | null>(null);
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    notes: ""
  });

  // Fetch all raffle winners
  const { data: winners, isLoading } = useQuery({
    queryKey: ["/api/admin/raffle-winners"],
    queryFn: async () => {
      const response = await fetch("/api/admin/raffle-winners", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch raffle winners");
      return response.json();
    },
    retry: 2,
  });

  // Update delivery status mutation
  const updateDeliveryStatus = useMutation({
    mutationFn: async ({ raffleId, status, notes }: { raffleId: number; status: string; notes: string }) => {
      const response = await apiRequest("PUT", `/api/admin/raffle-winners/${raffleId}/delivery-status`, {
        status,
        notes
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/raffle-winners"] });
      setSelectedWinner(null);
      setStatusUpdate({ status: "", notes: "" });
      toast({
        title: "Status Updated",
        description: "Delivery status has been updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update delivery status",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="secondary">No Delivery Request</Badge>;
    
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'shipped':
        return <Badge className="bg-purple-100 text-purple-800">Shipped</Badge>;
      case 'delivered':
        return <Badge className="bg-primary text-primary-foreground">Delivered</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatAddress = (address: any) => {
    if (!address || typeof address === 'string') {
      try {
        address = JSON.parse(address || '{}');
      } catch {
        return 'Invalid address format';
      }
    }
    
    const parts = [
      address.fullName,
      address.address1,
      address.address2,
      address.city,
      address.postcode,
      address.country
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          <p className="ml-3">Loading raffle winners...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Raffle Winners Management - Admin</title>
      </Helmet>
      
      <div className="container mx-auto p-6">
        <AdminNavigation />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Raffle Winners Management</h1>
          <p className="text-gray-600">Manage prize deliveries and winner communications</p>
        </div>

        <div className="grid gap-6">
          {winners?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Raffle Winners Yet</h3>
                <p className="text-gray-500">Winners will appear here once raffles are completed</p>
              </CardContent>
            </Card>
          ) : (
            winners?.map((winner: RaffleWinner) => (
              <Card key={winner.raffle_id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-primary" />
                        {winner.raffle_name}
                      </CardTitle>
                      <CardDescription>
                        Won on {new Date(winner.won_at).toLocaleDateString()} • Ticket #{winner.winning_ticket_number}
                      </CardDescription>
                    </div>
                    {getStatusBadge(winner.delivery_status)}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Winner Information */}
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Winner Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Name:</strong> {winner.winner_first_name} {winner.winner_last_name}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${winner.winner_email}`} className="text-primary hover:underline">
                            {winner.winner_email}
                          </a>
                        </div>
                        <div>
                          <strong>User ID:</strong> <code className="text-xs bg-gray-100 px-1 rounded">{winner.user_id}</code>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Information */}
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Delivery Information
                      </h4>
                      
                      {winner.delivery_id ? (
                        <div className="space-y-2 text-sm">
                          <div>
                            <strong>Type:</strong> {winner.delivery_type === 'digital' ? 'Digital Delivery' : 'Physical Shipping'}
                          </div>
                          <div>
                            <strong>Contact Email:</strong> 
                            <a href={`mailto:${winner.delivery_email}`} className="text-primary hover:underline ml-1">
                              {winner.delivery_email}
                            </a>
                          </div>
                          {winner.delivery_type === 'physical' && winner.delivery_address && (
                            <div>
                              <strong>Address:</strong>
                              <div className="mt-1 p-2 bg-gray-50 rounded text-xs">
                                {formatAddress(winner.delivery_address)}
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            Requested: {new Date(winner.delivery_requested_at || '').toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">Winner has not requested delivery yet</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {winner.delivery_id && (
                    <div className="mt-6 pt-4 border-t">
                      <Dialog open={selectedWinner?.raffle_id === winner.raffle_id} onOpenChange={(open) => {
                        if (!open) {
                          setSelectedWinner(null);
                          setStatusUpdate({ status: "", notes: "" });
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => {
                              setSelectedWinner(winner);
                              setStatusUpdate({ 
                                status: winner.delivery_status || 'pending', 
                                notes: '' 
                              });
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Update Status
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Delivery Status</DialogTitle>
                            <DialogDescription>
                              Update the delivery status for {winner.winner_first_name}'s prize
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="status">Delivery Status</Label>
                              <Select value={statusUpdate.status} onValueChange={(value) => 
                                setStatusUpdate(prev => ({ ...prev, status: value }))
                              }>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="shipped">Shipped</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label htmlFor="notes">Admin Notes (Optional)</Label>
                              <Textarea
                                id="notes"
                                placeholder="Add any notes about the delivery..."
                                value={statusUpdate.notes}
                                onChange={(e) => setStatusUpdate(prev => ({ ...prev, notes: e.target.value }))}
                                rows={3}
                              />
                            </div>
                            
                            <Button
                              onClick={() => {
                                if (selectedWinner) {
                                  updateDeliveryStatus.mutate({
                                    raffleId: selectedWinner.raffle_id,
                                    status: statusUpdate.status,
                                    notes: statusUpdate.notes
                                  });
                                }
                              }}
                              disabled={updateDeliveryStatus.isPending}
                              className="w-full"
                            >
                              {updateDeliveryStatus.isPending ? (
                                <>
                                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                  Updating...
                                </>
                              ) : (
                                'Update Status'
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}