import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Star, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface InstantWinTicket {
  ticket_number: number;
  prize_type: string;
  prize_amount: number;
  winner_name?: string;
  claimed: boolean;
  created_at?: string;
}

interface InstantWinTicketsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  raffleId: string;
  raffleName: string;
  instantWinPrizes: Array<{
    type: string;
    count: number;
    amount: number;
  }>;
}

export default function InstantWinTicketsModal({
  open,
  onOpenChange,
  raffleId,
  raffleName,
  instantWinPrizes,
}: InstantWinTicketsModalProps) {
  const [showAllTickets, setShowAllTickets] = useState(false);

  const { data: winningTickets, isLoading, error } = useQuery({
    queryKey: [`/api/raffles/${raffleId}/instant-win-tickets`],
    queryFn: async () => {
      const response = await fetch(`/api/raffles/${raffleId}/instant-win-tickets`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch instant win tickets");
      return response.json() as Promise<InstantWinTicket[]>;
    },
    enabled: open && !!raffleId,
  });

  // Generate all potential winning ticket numbers based on prizes
  const allWinningTickets = instantWinPrizes?.flatMap(prize => 
    Array(prize.count).fill(0).map(() => ({
      type: prize.type,
      amount: prize.amount,
      found: false,
    }))
  ) || [];

  // Merge with actual winners
  const ticketsWithWinners = allWinningTickets.map((ticket, index) => {
    const winner = winningTickets?.find(w => 
      w.prize_type === ticket.type && 
      w.prize_amount === ticket.amount
    );
    
    if (winner && !ticket.found) {
      ticket.found = true;
      return {
        ...ticket,
        ticket_number: winner.ticket_number,
        winner_name: winner.winner_name,
        claimed: winner.claimed,
        created_at: winner.created_at,
      };
    }
    
    return {
      ...ticket,
      ticket_number: null,
      found: false,
    };
  });

  const foundTickets = ticketsWithWinners.filter(t => t.found);
  const unFoundTickets = ticketsWithWinners.filter(t => !t.found);
  const displayTickets = showAllTickets ? ticketsWithWinners : foundTickets;

  const formatWinnerName = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
    }
    return parts[0];
  };

  const getTicketStatusColor = (ticket: any) => {
    if (!ticket.found) return "bg-gray-100 border-gray-200";
    if (ticket.claimed) return "bg-primary/10 border-primary/30";
    return "bg-yellow-50 border-yellow-200";
  };

  const getTicketStatusBadge = (ticket: any) => {
    if (!ticket.found) return <Badge variant="secondary">Not Found</Badge>;
    if (ticket.claimed) return <Badge className="bg-primary text-primary-foreground">Claimed</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-800">Won</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Instant Win Tickets - {raffleName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{allWinningTickets.length}</div>
                <div className="text-sm text-muted-foreground">Total Prizes</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{foundTickets.length}</div>
                <div className="text-sm text-muted-foreground">Found</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{unFoundTickets.length}</div>
                <div className="text-sm text-muted-foreground">Remaining</div>
              </CardContent>
            </Card>
          </div>

          {/* Toggle Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowAllTickets(!showAllTickets)}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {showAllTickets ? 'Show Only Found Tickets' : 'Show All Possible Tickets'}
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-red-200">
              <CardContent className="p-4 text-center text-red-600">
                Failed to load instant win tickets
              </CardContent>
            </Card>
          )}

          {/* Tickets Grid */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayTickets.map((ticket, index) => (
                <Card key={index} className={`transition-all duration-200 ${getTicketStatusColor(ticket)}`}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Prize Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold text-primary">
                            £{ticket.amount}
                          </span>
                        </div>
                        {getTicketStatusBadge(ticket)}
                      </div>

                      {/* Ticket Number */}
                      <div className="text-center">
                        {ticket.found && ticket.ticket_number ? (
                          <div className="text-3xl font-bold text-primary">
                            #{ticket.ticket_number}
                          </div>
                        ) : (
                          <div className="text-2xl font-bold text-gray-400">
                            #???
                          </div>
                        )}
                      </div>

                      {/* Winner Info */}
                      {ticket.found && ticket.winner_name && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 justify-center">
                            <User className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                              {formatWinnerName(ticket.winner_name)}
                            </span>
                          </div>
                          
                          {ticket.created_at && (
                            <div className="text-xs text-muted-foreground text-center">
                              Won {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Placeholder for unfound tickets */}
                      {!ticket.found && (
                        <div className="text-center text-sm text-muted-foreground">
                          Waiting for a lucky winner...
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && displayTickets.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Instant Wins Yet</h3>
                <p className="text-muted-foreground">
                  {showAllTickets 
                    ? "No instant win prizes configured for this raffle"
                    : "No instant win tickets have been claimed yet"
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}