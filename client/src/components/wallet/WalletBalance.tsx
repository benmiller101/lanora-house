import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, TrendingDown, CreditCard, Download } from "lucide-react";
import { WalletTopupModal } from "./WalletTopupModal";
import { WalletWithdrawModal } from "./WalletWithdrawModal";

export function WalletBalance() {
  const [showTopup, setShowTopup] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const { data: walletData, isLoading } = useQuery({
    queryKey: ["/api/wallet"],
  });

  const { data: transactionsData } = useQuery({
    queryKey: ["/api/wallet/transactions"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-primary" />
            <CardTitle>Wallet Balance</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
            <div className="h-4 w-40 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const balance = walletData?.balance || 0;
  const recentTransactions = transactionsData?.transactions?.slice(0, 3) || [];

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Site Credit Balance</CardTitle>
                <CardDescription>
                  Use your credit for prize draw tickets and purchases
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                £{balance.toFixed(2)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Button 
              onClick={() => setShowTopup(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Add Credit
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowWithdraw(true)}
              disabled={balance < 5}
            >
              <Download className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          </div>

          {recentTransactions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Recent Activity</h4>
              {recentTransactions.map((transaction: any) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    {transaction.isCredit ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={transaction.isCredit ? "default" : "secondary"}
                    className={
                      transaction.isCredit 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {transaction.isCredit ? '+' : '-'}£{parseFloat(transaction.amount).toFixed(2)}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="text-blue-600">💡</div>
              <div className="text-sm text-blue-800">
                <p className="font-medium">How to earn credit:</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• Win instant prizes from prize draws</li>
                  <li>• Win main prize draw competitions</li>
                  <li>• Add funds directly with your payment method</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <WalletTopupModal
        isOpen={showTopup}
        onClose={() => setShowTopup(false)}
        currentBalance={balance}
      />

      <WalletWithdrawModal
        isOpen={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        currentBalance={balance}
      />
    </>
  );
}