import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Gift, Trophy, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import SEOHead from "@/components/SEOHead";

interface InstantWin {
  id: number;
  raffleId: number;
  raffleName: string;
  prizeType: string;
  prizeAmount: number;
  claimed: boolean;
  createdAt: string;
}

export default function InstantWinsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  const { data: instantWins, isLoading } = useQuery<InstantWin[]>({
    queryKey: ["/api/instant-wins"],
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your instant wins...</p>
        </div>
      </div>
    );
  }

  const totalWins = instantWins?.length || 0;
  const totalValue = instantWins?.reduce((sum, win) => sum + win.prizeAmount, 0) || 0;
  const claimedWins = instantWins?.filter(win => win.claimed).length || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <SEOHead
        title="Instant Win Prizes - Claim Your Rewards"
        description="View and claim your instant win prizes from Lanora House raffle purchases. Track your winnings, claim cash prizes and see your complete prize history."
        path="/instant-wins"
        noindex
      />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Your Instant Wins
          </h1>
          <p className="text-lg text-muted-foreground">
            Congratulations! You've won instant prizes from your raffle purchases.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Wins</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWins}</div>
              <p className="text-xs text-muted-foreground">
                {claimedWins} claimed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{totalValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Cash prizes won
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWins - claimedWins}</div>
              <p className="text-xs text-muted-foreground">
                Ready to claim
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Instant Wins List */}
        {totalWins === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Instant Wins Yet</h3>
              <p className="text-muted-foreground mb-4">
                Purchase raffle tickets to have a chance at winning instant prizes!
              </p>
              <Button onClick={() => navigate("/")}>
                Browse Raffles
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Your Prize History</h2>
            {instantWins?.map((win) => (
              <Card key={win.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-yellow-100 p-3 rounded-full">
                        <Coins className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          £{win.prizeAmount} Cash Prize
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          From: {win.raffleName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Won on {new Date(win.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={win.claimed ? "secondary" : "default"}
                        className="mb-2"
                      >
                        {win.claimed ? "Claimed" : "Available"}
                      </Badge>
                      {!win.claimed && (
                        <div>
                          <Button size="sm">
                            Claim Prize
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Instructions */}
        {totalWins > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>How to Claim Your Prizes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p>
                  <strong>Cash Prizes:</strong> Click "Claim Prize" to request a payout. 
                  We'll process your request within 2-3 business days.
                </p>
                <p>
                  <strong>Contact:</strong> For any questions about your prizes, 
                  email us at prizes@lanorahouse.com
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}