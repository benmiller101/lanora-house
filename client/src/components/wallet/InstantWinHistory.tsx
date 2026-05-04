import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Gift, Calendar } from "lucide-react";

interface InstantWin {
  id: number;
  raffleName: string;
  prizeType: string;
  prizeAmount: string;
  ticketNumber: number;
  claimed: boolean;
  createdAt: string;
}

export default function InstantWinHistory() {
  const { data: instantWins, isLoading } = useQuery<InstantWin[]>({
    queryKey: ["/api/instant-wins"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!instantWins || instantWins.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Instant Win History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Gift className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No instant wins yet</p>
            <p className="text-sm">Keep playing prize draws to win instant prizes!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const claimedWins = instantWins.filter((win: InstantWin) => win.claimed);
  const totalWinnings = claimedWins
    .filter((win: InstantWin) => win.prizeType === 'cash')
    .reduce((sum: number, win: InstantWin) => sum + parseFloat(win.prizeAmount), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Instant Win History
        </CardTitle>
        <div className="text-sm text-gray-600">
          {claimedWins.length} wins claimed • £{totalWinnings.toFixed(2)} total cash prizes
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {instantWins.map((win: InstantWin) => (
            <div 
              key={win.id} 
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div className="flex-1">
                <div className="mb-1">
                  <p className="font-medium text-sm">{win.raffleName}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(win.createdAt).toLocaleDateString()}
                  </span>
                  <span>Ticket #{win.ticketNumber}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-primary">
                  {win.prizeType === 'cash' ? `£${win.prizeAmount}` : win.prizeType}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}