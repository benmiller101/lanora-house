import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Wallet, CreditCard, Building2, DollarSign } from "lucide-react";

interface WalletData {
  balance: number;
  transactions: Array<{
    id: number;
    amount: number;
    type: string;
    description: string;
    status: string;
    created_at: string;
    is_credit: boolean;
  }>;
}

export default function SimpleWithdrawalPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");

  // Fetch wallet balance
  const { data: walletData, isLoading } = useQuery<WalletData>({
    queryKey: ["/api/wallet/balance"],
    retry: false,
  });

  // Process withdrawal
  const withdrawMutation = useMutation({
    mutationFn: async (withdrawalData: { amount: number; method: string }) => {
      return await apiRequest("POST", "/api/withdrawals/process", withdrawalData);
    },
    onSuccess: (response: any) => {
      toast({
        title: "Withdrawal Successful",
        description: `£${amount} has been processed for withdrawal via ${method}.`,
      });
      setAmount("");
      setMethod("");
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    },
  });

  const handleWithdraw = () => {
    const withdrawAmount = parseFloat(amount);
    
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    if (withdrawAmount < 5) {
      toast({
        title: "Minimum Withdrawal",
        description: "Minimum withdrawal amount is £5.00",
        variant: "destructive",
      });
      return;
    }

    if (!walletData || withdrawAmount > walletData.balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      });
      return;
    }

    if (!method) {
      toast({
        title: "Payment Method Required",
        description: "Please select a withdrawal method",
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate({ amount: withdrawAmount, method });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const balance = walletData?.balance || 0;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Withdraw Funds</h1>
        <p className="text-gray-600">Withdraw your instant win prizes and wallet credit</p>
      </div>

      {/* Current Balance */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Available Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">£{balance.toFixed(2)}</div>
          <p className="text-sm text-gray-500 mt-1">
            Minimum withdrawal: £5.00
          </p>
        </CardContent>
      </Card>

      {/* Withdrawal Form */}
      <Card>
        <CardHeader>
          <CardTitle>Request Withdrawal</CardTitle>
          <CardDescription>
            Choose your withdrawal method and amount
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Withdrawal Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">£</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="5"
                max={balance}
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Withdrawal Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paypal">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    PayPal
                  </div>
                </SelectItem>
                <SelectItem value="stripe">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Card (Stripe)
                  </div>
                </SelectItem>
                <SelectItem value="bank_transfer">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Bank Transfer
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleWithdraw}
            disabled={withdrawMutation.isPending || balance < 5}
            className="w-full"
          >
            {withdrawMutation.isPending ? "Processing..." : `Withdraw £${amount || "0.00"}`}
          </Button>

          {balance < 5 && (
            <p className="text-sm text-gray-500 text-center">
              You need at least £5.00 in your wallet to make a withdrawal
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      {walletData?.transactions && walletData.transactions.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {walletData.transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{transaction.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString()} • {transaction.status}
                    </p>
                  </div>
                  <div className={`text-sm font-medium ${transaction.is_credit ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.is_credit ? '+' : '-'}£{transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}