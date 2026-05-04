import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, PoundSterling, ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface Wallet {
  userId: string;
  balance: string | number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Form schema for depositing funds
const depositSchema = z.object({
  amount: z.string()
    .refine(val => !isNaN(parseFloat(val)), {
      message: "Amount must be a valid number",
    })
    .refine(val => parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    })
    .refine(val => parseFloat(val) <= 10000, {
      message: "Maximum deposit amount is £10,000",
    }),
});

// Form schema for withdrawing funds
const withdrawSchema = z.object({
  amount: z.string()
    .refine(val => !isNaN(parseFloat(val)), {
      message: "Amount must be a valid number",
    })
    .refine(val => parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    }),
});

type DepositFormValues = z.infer<typeof depositSchema>;
type WithdrawFormValues = z.infer<typeof withdrawSchema>;

interface Transaction {
  id: number;
  type: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
}

export default function WalletOverview() {
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query wallet data
  const { data: wallet, isLoading: isWalletLoading } = useQuery<Wallet>({
    queryKey: ['/api/wallet'],
    retry: 1,
  });

  // Query recent transactions
  const { data: transactions = [], isLoading: isTransactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    retry: 1,
  });

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: (data: { amount: number }) => 
      apiRequest('POST', '/api/wallet/deposit', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      setIsDepositOpen(false);
      toast({
        title: "Deposit Successful",
        description: "Your funds have been added to your balance.",
      });
    },
    onError: (error) => {
      toast({
        title: "Deposit Failed",
        description: error instanceof Error ? error.message : "Unable to process your deposit",
        variant: "destructive",
      });
    },
  });

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: (data: { amount: number }) => 
      apiRequest('POST', '/api/wallet/withdraw', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      setIsWithdrawOpen(false);
      toast({
        title: "Withdrawal Successful",
        description: "Your funds have been withdrawn.",
      });
    },
    onError: (error) => {
      toast({
        title: "Withdrawal Failed",
        description: error instanceof Error ? error.message : "Unable to process your withdrawal",
        variant: "destructive",
      });
    },
  });

  // Deposit form
  const depositForm = useForm<DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: "",
    },
  });

  // Withdraw form
  const withdrawForm = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: "",
    },
  });

  // Handle deposit submission
  const onDepositSubmit = (values: DepositFormValues) => {
    depositMutation.mutate({ 
      amount: parseFloat(values.amount)
    });
  };

  // Handle withdraw submission
  const onWithdrawSubmit = (values: WithdrawFormValues) => {
    // Convert wallet balance to numeric for comparison - handles both string and number types
    const numericBalance = wallet?.balance 
      ? parseFloat(typeof wallet.balance === 'string' ? wallet.balance : wallet.balance.toString())
      : 0;
      
    // Check if withdrawal amount exceeds balance
    if (parseFloat(values.amount) > numericBalance) {
      toast({
        title: "Insufficient Funds",
        description: "You do not have enough funds to withdraw this amount.",
        variant: "destructive",
      });
      return;
    }
    
    withdrawMutation.mutate({ 
      amount: parseFloat(values.amount)
    });
  };

  // Format currency function
  const formatCurrency = (amount: number | string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(numericAmount);
  };

  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isWalletLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Wallet Balance</CardTitle>
          <CardDescription>
            Your current balance for auctions and purchases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 bg-primary/5 rounded-lg">
            <PoundSterling className="h-10 w-10 text-primary mb-2" />
            <h2 className="text-3xl font-bold">
              {wallet?.balance ? formatCurrency(wallet.balance) : "£0.00"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Available Balance</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-2">
          <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" variant="default">
                <ArrowDownLeft className="mr-2 h-4 w-4" />
                Deposit Funds
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deposit Funds</DialogTitle>
                <DialogDescription>
                  Add money to your account balance for bidding in auctions and purchasing items.
                </DialogDescription>
              </DialogHeader>
              <Form {...depositForm}>
                <form onSubmit={depositForm.handleSubmit(onDepositSubmit)} className="space-y-4">
                  <FormField
                    control={depositForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2">£</span>
                            <Input 
                              {...field}
                              className="pl-8" 
                              placeholder="0.00"
                              type="number"
                              step="0.01"
                              min="0.01"
                              max="10000"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Minimum £0.01, maximum £10,000 per transaction
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDepositOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={depositMutation.isPending}
                    >
                      {depositMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : "Deposit"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" variant="outline">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Withdraw Funds
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Withdraw Funds</DialogTitle>
                <DialogDescription>
                  Withdraw money from your account to your registered payment method.
                </DialogDescription>
              </DialogHeader>
              <Form {...withdrawForm}>
                <form onSubmit={withdrawForm.handleSubmit(onWithdrawSubmit)} className="space-y-4">
                  <FormField
                    control={withdrawForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2">£</span>
                            <Input 
                              {...field}
                              className="pl-8" 
                              placeholder="0.00"
                              type="number"
                              step="0.01"
                              min="0.01"
                              max={wallet?.balance 
                        ? parseFloat(typeof wallet.balance === 'string' ? wallet.balance : wallet.balance.toString())
                        : 0}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Available balance: {wallet?.balance 
                            ? formatCurrency(wallet.balance) 
                            : "£0.00"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsWithdrawOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={
                        withdrawMutation.isPending || 
                        !wallet?.balance || 
                        parseFloat(typeof wallet.balance === 'string' 
                          ? wallet.balance 
                          : wallet.balance.toString()) <= 0
                      }
                    >
                      {withdrawMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : "Withdraw"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Your most recent account activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isTransactionsLoading ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-muted-foreground">No transactions found</p>
              <p className="text-sm mt-1">Your transaction history will appear here once you make deposits or payments.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(transactions as Transaction[]).map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'deposit' ? 'bg-green-100' : 
                      transaction.type === 'withdrawal' ? 'bg-orange-100' : 
                      transaction.type === 'auction_win' ? 'bg-blue-100' : 
                      transaction.type === 'raffle_win' ? 'bg-purple-100' : 'bg-gray-100'
                    }`}>
                      {transaction.type === 'deposit' ? (
                        <ArrowDownLeft className="h-4 w-4 text-green-600" />
                      ) : transaction.type === 'withdrawal' ? (
                        <ArrowUpRight className="h-4 w-4 text-orange-600" />
                      ) : (
                        <PoundSterling className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{transaction.type.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(transaction.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.type === 'deposit' || transaction.type === 'raffle_win' 
                        ? 'text-green-600' 
                        : transaction.type === 'withdrawal' || transaction.type === 'auction_bid'
                        ? 'text-orange-600'
                        : ''
                    }`}>
                      {transaction.type === 'deposit' || transaction.type === 'raffle_win' 
                        ? '+' 
                        : transaction.type === 'withdrawal' || transaction.type === 'auction_bid'
                        ? '-'
                        : ''
                      }
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{transaction.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="link" className="px-0 w-full justify-center">
            View All Transactions
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}