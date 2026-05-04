import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isAfter } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

type Raffle = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  endDate: string;
  status: string;
  ticketPrice: number;
  maxTickets: number;
  soldTickets: number;
};

export function PrizeDrawEntries() {
  console.log("🎫 PrizeDrawEntries Component - MOUNTING!");
  
  // Use the correct working endpoint
  const { data: userEntries, isLoading: entriesLoading, refetch } = useQuery({
    queryKey: ['/api/raffles/user-raffle-tickets'],
    queryFn: async () => {
      console.log("🎫 PrizeDrawEntries - Fetching data...");
      const response = await fetch(`/api/raffles/user-raffle-tickets`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch prize draw entries');
      }
      
      const data = await response.json();
      console.log("🎫 PrizeDrawEntries - RECEIVED DATA:", data);
      return data;
    },
  });

  console.log("🎫 PrizeDrawEntries - Component State:", {
    loading: entriesLoading,
    data: userEntries,
    isArray: Array.isArray(userEntries),
    length: userEntries?.length
  });

  // Show loading state
  if (entriesLoading) {
    console.log("🎫 PrizeDrawEntries - SHOWING LOADING STATE");
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Prize Draw Entries - Loading...</h2>
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  // Show empty state if no prize draw entries
  if (!userEntries || !Array.isArray(userEntries) || userEntries.length === 0) {
    console.log("🎫 PrizeDrawEntries - SHOWING EMPTY STATE");
    return (
      <div className="text-center p-8">
        <h3 className="text-2xl font-semibold mb-4">No Active Prize Draws</h3>
        <p className="text-muted-foreground mb-6">You don't have tickets for any currently active prize draws. Browse our available prize draws and try your luck!</p>
        <button 
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          onClick={() => document.location.href = '/raffles'}
        >
          View Active Prize Draws
        </button>
      </div>
    );
  }

  // Render user's prize draw entries directly from the API data
  console.log("🎫 RaffleEntries - RENDERING ENTRIES, count:", userEntries.length);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Prize Draw Entries ({userEntries.length})</h2>
      <p className="text-muted-foreground">Active prize draws you've entered</p>
      
      {(userEntries as any[]).map((entry) => {
        const isEnding = new Date(entry.raffleEndDate).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000;
        
        return (
          <Card key={entry.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{entry.raffleName}</h3>
                  <Badge className={`mt-2 ${isEnding ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                    {isEnding ? 'Ending Soon' : entry.raffleStatus}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">£{entry.totalSpent?.toFixed(2) || '0.00'}</p>
                  <p className="text-sm text-muted-foreground">Total spent</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Your Tickets: {entry.ticketNumbers?.length || 0}</p>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(entry.ticketNumbers) && entry.ticketNumbers.length > 0 ? (
                      entry.ticketNumbers.map((num: number, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-primary/10 text-xs">
                          #{num}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">Loading ticket numbers...</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Entry Details</p>
                  <p className="text-sm text-muted-foreground">
                    Entered: {format(new Date(entry.createdAt), 'PPP')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ends: {format(new Date(entry.raffleEndDate), 'PPP')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    £{(entry.totalSpent / (entry.ticketNumbers?.length || 1)).toFixed(2)} per ticket
                  </p>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default PrizeDrawEntries;