import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, CreditCard, Clock, CheckCircle, X, ExternalLink } from "lucide-react";
import AdminNavigation from "@/components/admin/AdminNavigation";

interface Withdrawal {
  id: number;
  user_id: string;
  user_email: string;
  user_name: string;
  amount: string;
  withdrawal_method: string;
  withdrawal_details: any;
  status: string;
  created_at: string;
  processed_at?: string;
  transaction_id?: string;
  prizes_count: number;
}

export default function WithdrawalsAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [processingNotes, setProcessingNotes] = useState("");
  const [transactionReference, setTransactionReference] = useState("");

  // Fetch all pending withdrawals
  const { data: withdrawals = [], isLoading, error } = useQuery({
    queryKey: ["/api/admin/withdrawals"],
    queryFn: async () => {
      const response = await fetch("/api/admin/withdrawals", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to fetch withdrawals");
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Process withdrawal mutation
  const processWithdrawal = useMutation({
    mutationFn: async ({ withdrawalId, action, transactionId, notes }: { 
      withdrawalId: number; 
      action: 'complete' | 'reject'; 
      transactionId?: string; 
      notes?: string; 
    }) => {
      const response = await fetch(`/api/admin/withdrawals/${withdrawalId}/process`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, transactionId, notes })
      });
      if (!response.ok) throw new Error("Failed to process withdrawal");
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      toast({
        title: variables.action === 'complete' ? "✅ Withdrawal Completed" : "❌ Withdrawal Rejected",
        description: variables.action === 'complete' 
          ? `£${selectedWithdrawal?.amount} payout has been marked as completed.`
          : "Withdrawal has been rejected and funds returned to user.",
        duration: 5000,
      });
      setSelectedWithdrawal(null);
      setProcessingNotes("");
      setTransactionReference("");
    },
    onError: (error: any) => {
      toast({
        title: "Processing Error",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    },
  });

  const pendingWithdrawals = withdrawals.filter((w: Withdrawal) => w.status === 'pending');
  const completedWithdrawals = withdrawals.filter((w: Withdrawal) => w.status === 'completed');
  const rejectedWithdrawals = withdrawals.filter((w: Withdrawal) => w.status === 'failed');

  const formatBankDetails = (details: any) => {
    if (typeof details === 'string') {
      try {
        details = JSON.parse(details);
      } catch {
        return details;
      }
    }
    
    if (details.accountNumber) {
      return `${details.accountName}\nAccount: ${details.accountNumber}\nSort Code: ${details.sortCode}`;
    } else if (details.email) {
      return details.email;
    }
    return JSON.stringify(details);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <AdminNavigation />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Withdrawal Management</h1>
          <p className="text-muted-foreground">Process instant win prize payouts</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">
            {pendingWithdrawals.length} pending • {completedWithdrawals.length} completed
          </div>
        </div>
      </div>

      {/* Pending Withdrawals */}
      <Card className="border-orange-200 bg-orange-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <Clock className="w-5 h-5" />
            Pending Bank Transfer Payouts ({pendingWithdrawals.length})
          </CardTitle>
          <CardDescription>
            Withdrawals requiring manual bank transfer processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingWithdrawals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No pending bank transfer withdrawals</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingWithdrawals.map((withdrawal: Withdrawal) => (
                <div key={withdrawal.id} className="bg-white p-4 rounded-lg border border-orange-200">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="text-xl font-bold text-primary">£{parseFloat(withdrawal.amount).toFixed(2)}</div>
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                          {withdrawal.withdrawal_method === 'bank_transfer' ? 'Bank Transfer' : 
                           withdrawal.withdrawal_method === 'paypal' ? 'PayPal' : 'Stripe'}
                        </Badge>
                        <Badge variant="secondary">{withdrawal.prizes_count} prizes</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div><strong>User:</strong> {withdrawal.user_name || withdrawal.user_email}</div>
                        <div><strong>Email:</strong> {withdrawal.user_email}</div>
                        <div><strong>Requested:</strong> {new Date(withdrawal.created_at).toLocaleString()}</div>
                      </div>
                      <div className="text-sm bg-gray-50 p-2 rounded border">
                        <strong>Payment Details:</strong><br />
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {formatBankDetails(withdrawal.withdrawal_details)}
                        </pre>
                      </div>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={() => setSelectedWithdrawal(withdrawal)}
                          className="bg-primary text-white hover:bg-primary/90"
                        >
                          Process Payout
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Process Bank Transfer Withdrawal</DialogTitle>
                          <DialogDescription>
                            Mark this £{parseFloat(withdrawal.amount).toFixed(2)} withdrawal as completed or rejected
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="bg-blue-50 p-3 rounded">
                            <div className="text-sm font-medium">Payment Details:</div>
                            <pre className="text-xs mt-1 whitespace-pre-wrap">
                              {formatBankDetails(withdrawal.withdrawal_details)}
                            </pre>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="transaction-ref">Bank Transfer Reference (Optional)</Label>
                            <Input
                              id="transaction-ref"
                              placeholder="e.g., FP12345678 or bank confirmation number"
                              value={transactionReference}
                              onChange={(e) => setTransactionReference(e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="notes">Processing Notes (Optional)</Label>
                            <Textarea
                              id="notes"
                              placeholder="Add any notes about this transfer..."
                              value={processingNotes}
                              onChange={(e) => setProcessingNotes(e.target.value)}
                              rows={3}
                            />
                          </div>
                          
                          <div className="flex gap-2 pt-4">
                            <Button
                              onClick={() => processWithdrawal.mutate({
                                withdrawalId: withdrawal.id,
                                action: 'complete',
                                transactionId: transactionReference || undefined,
                                notes: processingNotes || undefined
                              })}
                              disabled={processWithdrawal.isPending}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Paid
                            </Button>
                            <Button
                              onClick={() => processWithdrawal.mutate({
                                withdrawalId: withdrawal.id,
                                action: 'reject',
                                notes: processingNotes || undefined
                              })}
                              disabled={processWithdrawal.isPending}
                              variant="destructive"
                              className="flex-1"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Completed Withdrawals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            Recent Completed Withdrawals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedWithdrawals.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No completed withdrawals yet</p>
          ) : (
            <div className="space-y-3">
              {completedWithdrawals.slice(0, 10).map((withdrawal: Withdrawal) => (
                <div key={withdrawal.id} className="bg-green-50 p-3 rounded border border-green-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">£{parseFloat(withdrawal.amount).toFixed(2)} to {withdrawal.user_email}</div>
                      <div className="text-xs text-gray-500">
                        Completed: {withdrawal.processed_at ? new Date(withdrawal.processed_at).toLocaleString() : 'N/A'}
                        {withdrawal.transaction_id && (
                          <span className="ml-2">• Ref: {withdrawal.transaction_id}</span>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}