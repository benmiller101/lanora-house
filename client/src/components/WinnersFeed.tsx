import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Ticket, Coins } from "lucide-react";
import { useState } from "react";

interface Winner {
  id: number;
  raffleId: number;
  winnerName: string;
  winningTicketNumber: number;
  prizeValue: number;
  prizeName: string;
  raffleName: string;
  raffleImage: string;
  wonAt: string;
}

export default function WinnersFeed() {
  const [displayCount, setDisplayCount] = useState(10);

  const { data: winnersData, isLoading } = useQuery({
    queryKey: ["/api/raffle-winners/recent", displayCount],
    queryFn: async () => {
      const response = await fetch(`/api/raffle-winners/recent?limit=${displayCount}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to fetch winners");
      return response.json();
    },
  });

  const winners = winnersData?.winners || [];

  const loadMore = () => {
    setDisplayCount(prev => prev + 10);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (winners.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Winners Yet</h3>
          <p className="text-gray-500">Recent raffle winners will appear here when raffles are completed.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-2xl font-bold">Recent Winners</h2>
        <Badge variant="outline" className="ml-auto">
          {winners.length} {winners.length === 1 ? 'Winner' : 'Winners'}
        </Badge>
      </div>

      <div className="space-y-3">
        {winners.map((winner: Winner, index: number) => (
          <Card key={winner.id} className="hover:shadow-md transition-shadow border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Winner Number */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    #{index + 1}
                  </div>
                </div>

                {/* Winner Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 truncate">
                        🎉 {winner.winnerName} Won!
                      </h3>
                      <p className="text-gray-600 text-sm truncate">
                        {winner.raffleName}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-green-600">
                        £{winner.prizeValue.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Prize Value
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Ticket className="w-4 h-4" />
                      <span>Ticket #{winner.winningTicketNumber}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(winner.wonAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Raffle Image */}
                {winner.raffleImage && (
                  <div className="flex-shrink-0">
                    <img 
                      src={winner.raffleImage} 
                      alt={winner.raffleName}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      <div className="text-center pt-4">
        <button
          onClick={loadMore}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Load More Winners
        </button>
      </div>
    </div>
  );
}