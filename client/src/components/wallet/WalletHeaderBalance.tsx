import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { Link } from "wouter";

export function WalletHeaderBalance() {
  const { isAuthenticated } = useAuth();

  const { data: balanceData, isLoading } = useQuery({
    queryKey: ["/api/withdrawals/balance"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Don't show anything if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const balance = balanceData?.availableBalance || 0;

  return (
    <Link href="/members?tab=wallet">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2 bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors"
      >
        <Wallet className="w-4 h-4 text-primary" />
        <span className="font-medium text-primary">
          {isLoading ? "..." : `£${balance.toFixed(2)}`}
        </span>
      </Button>
    </Link>
  );
}