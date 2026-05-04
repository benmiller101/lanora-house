import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, TrendingUp, TrendingDown, Gift, CreditCard, Trophy } from "lucide-react";

export function WalletTransactionHistory() {
  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ["/api/wallet/transactions"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between p-3 bg-gray-100 rounded">
                <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const transactions = transactionsData?.transactions || [];

  const getTransactionIcon = (type: string, isCredit: boolean) => {
    if (type === 'instant_win') return <Gift className="w-4 h-4 text-green-600" />;
    if (type === 'raffle_win') return <Trophy className="w-4 h-4 text-yellow-600" />;
    if (type === 'topup') return <CreditCard className="w-4 h-4 text-blue-600" />;
    return isCredit ? 
      <TrendingUp className="w-4 h-4 text-green-600" /> : 
      <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'instant_win': return 'Instant Win Prize';
      case 'raffle_win': return 'Prize Draw Win';
      case 'topup': return 'Wallet Top-up';
      case 'withdrawal': return 'Withdrawal';
      case 'purchase': return 'Purchase';
      default: return 'Transaction';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Transaction History
        </CardTitle>
        <CardDescription>
          Complete history of your wallet activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No transactions yet</p>
            <p className="text-sm text-gray-400">Your wallet activity will appear here</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.map((transaction: any) => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.type, transaction.isCredit)}
                  <div>
                    <p className="font-medium text-sm">
                      {getTransactionLabel(transaction.type)}
                    </p>
                    <p className="text-xs text-gray-600 max-w-60 truncate">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={transaction.isCredit ? "default" : "secondary"}
                    className={
                      transaction.isCredit 
                        ? "bg-green-100 text-green-800 border-green-200" 
                        : "bg-red-100 text-red-800 border-red-200"
                    }
                  >
                    {transaction.isCredit ? '+' : '-'}£{parseFloat(transaction.amount).toFixed(2)}
                  </Badge>
                  {transaction.status && transaction.status !== 'completed' && (
                    <p className="text-xs text-gray-500 mt-1 capitalize">
                      {transaction.status}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {transactions.length > 10 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Showing recent transactions. Full history available in your account.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}