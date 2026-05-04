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
import { CreditCard, Wallet, DollarSign } from "lucide-react";

interface WalletTopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

export function WalletTopupModal({ isOpen, onClose, currentBalance }: WalletTopupModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"paytriot" | "paypal">("paytriot");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const topupMutation = useMutation({
    mutationFn: async (data: { amount: number; paymentMethod: string }) => {
      return await apiRequest("POST", "/api/wallet/topup", data);
    },
    onSuccess: (response) => {
      toast({
        title: "Credit Added Successfully",
        description: response.message,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      onClose();
      setAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Topup Failed",
        description: error.message || "Failed to add credit to wallet",
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
        description: "Minimum topup amount is £5",
        variant: "destructive",
      });
      return;
    }

    if (amountValue > 1000) {
      toast({
        title: "Invalid Amount",
        description: "Maximum topup amount is £1000",
        variant: "destructive",
      });
      return;
    }

    topupMutation.mutate({
      amount: amountValue,
      paymentMethod,
    });
  };

  const quickAmounts = [10, 25, 50, 100];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-primary" />
            <span>Add Credit to Wallet</span>
          </DialogTitle>
          <DialogDescription>
            Add funds to your wallet to use for prize draw tickets and purchases.
            Current balance: <span className="font-semibold text-primary">£{currentBalance.toFixed(2)}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (£5 - £1000)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  min="5"
                  max="1000"
                  step="0.01"
                  placeholder="25.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

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
            </div>
          </div>

          <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "paytriot" | "paypal")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paytriot" className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4" />
                <span>Card Payment</span>
              </TabsTrigger>
              <TabsTrigger value="paypal" className="flex items-center space-x-2">
                <span className="w-4 h-4 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">P</span>
                <span>PayPal</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="paytriot" className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Secure Card Payment</h4>
                <p className="text-sm text-gray-600">
                  Pay securely with your credit or debit card. Your payment will be processed immediately.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="paypal" className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">PayPal Payment</h4>
                <p className="text-sm text-blue-700">
                  Pay with your PayPal account or linked payment methods. Secure and instant processing.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 mb-1">Payment Summary</h4>
            <div className="text-sm text-amber-700 space-y-1">
              <div className="flex justify-between">
                <span>Amount to add:</span>
                <span className="font-medium">£{amount || "0.00"}</span>
              </div>
              <div className="flex justify-between">
                <span>New balance:</span>
                <span className="font-medium">
                  £{(currentBalance + parseFloat(amount || "0")).toFixed(2)}
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
              disabled={!amount || parseFloat(amount) < 5 || topupMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {topupMutation.isPending ? (
                "Processing..."
              ) : (
                `Add £${amount || "0.00"}`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}