import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, DollarSign, CreditCard, Building2 } from "lucide-react";

interface WalletWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

export function WalletWithdrawModal({ isOpen, onClose, currentBalance }: WalletWithdrawModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [withdrawalMethod, setWithdrawalMethod] = useState<"paypal" | "bank_transfer">("paypal");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [bankDetails, setBankDetails] = useState({
    accountName: "",
    sortCode: "",
    accountNumber: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const withdrawMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/wallet/withdraw", data);
    },
    onSuccess: (response) => {
      toast({
        title: "Withdrawal Processed",
        description: response.message,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      onClose();
      setAmount("");
      setPaypalEmail("");
      setBankDetails({ accountName: "", sortCode: "", accountNumber: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountValue = parseFloat(amount);
    if (!amountValue || amountValue < 5) {
      toast({
        title: "Invalid Amount",
        description: "Minimum withdrawal amount is £5",
        variant: "destructive",
      });
      return;
    }

    if (amountValue > currentBalance) {
      toast({
        title: "Insufficient Balance",
        description: "Withdrawal amount cannot exceed your current balance",
        variant: "destructive",
      });
      return;
    }

    let withdrawalDetails: any = {};

    if (withdrawalMethod === "paypal") {
      if (!paypalEmail) {
        toast({
          title: "PayPal Email Required",
          description: "Please enter your PayPal email address",
          variant: "destructive",
        });
        return;
      }
      withdrawalDetails = { paypalEmail };
    } else if (withdrawalMethod === "bank_transfer") {
      if (!bankDetails.accountName || !bankDetails.sortCode || !bankDetails.accountNumber) {
        toast({
          title: "Bank Details Required",
          description: "Please fill in all bank account details",
          variant: "destructive",
        });
        return;
      }
      withdrawalDetails = { bankDetails };
    }

    withdrawMutation.mutate({
      amount: amountValue,
      withdrawalMethod,
      withdrawalDetails,
    });
  };

  const quickAmounts = [5, 10, 25, 50].filter(amt => amt <= currentBalance);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-primary" />
            <span>Withdraw from Wallet</span>
          </DialogTitle>
          <DialogDescription>
            Withdraw funds from your wallet to your chosen payment method.
            Available balance: <span className="font-semibold text-primary">£{currentBalance.toFixed(2)}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Withdrawal Amount (£5 minimum)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  min="5"
                  max={currentBalance}
                  step="0.01"
                  placeholder="25.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {quickAmounts.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(quickAmount.toString())}
                    className="h-10"
                  >
                    £{quickAmount}
                  </Button>
                ))}
                {currentBalance >= 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(Math.floor(currentBalance).toString())}
                    className="h-10 text-xs"
                  >
                    All
                  </Button>
                )}
              </div>
            )}
          </div>

          <Tabs value={withdrawalMethod} onValueChange={(value) => setWithdrawalMethod(value as "paypal" | "bank_transfer")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paypal" className="flex items-center space-x-2">
                <span className="w-4 h-4 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">P</span>
                <span>PayPal</span>
              </TabsTrigger>
              <TabsTrigger value="bank_transfer" className="flex items-center space-x-2">
                <Building2 className="w-4 h-4" />
                <span>Bank Transfer</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="paypal" className="space-y-4">
              <div>
                <Label htmlFor="paypalEmail">PayPal Email Address</Label>
                <Input
                  id="paypalEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  required
                />
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  Funds will be sent to your PayPal account within 1-2 business days.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="bank_transfer" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="accountName">Account Holder Name</Label>
                  <Input
                    id="accountName"
                    placeholder="John Smith"
                    value={bankDetails.accountName}
                    onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="sortCode">Sort Code</Label>
                    <Input
                      id="sortCode"
                      placeholder="12-34-56"
                      value={bankDetails.sortCode}
                      onChange={(e) => setBankDetails({...bankDetails, sortCode: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      placeholder="12345678"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  Bank transfers typically take 3-5 business days to process.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 mb-1">Withdrawal Summary</h4>
            <div className="text-sm text-amber-700 space-y-1">
              <div className="flex justify-between">
                <span>Withdrawal amount:</span>
                <span className="font-medium">£{amount || "0.00"}</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining balance:</span>
                <span className="font-medium">
                  £{(currentBalance - parseFloat(amount || "0")).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!amount || parseFloat(amount) < 5 || parseFloat(amount) > currentBalance || withdrawMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {withdrawMutation.isPending ? (
                "Processing..."
              ) : (
                `Withdraw £${amount || "0.00"}`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}