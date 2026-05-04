import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PrizeTicketsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  raffleId: string;
  prizeAmount: number;
  prizeType: string;
  prizeCount: number;
}

interface WinningTicket {
  ticket_number: number;
  prize_type: string;
  prize_amount: number;
  winner_name?: string;
  claimed: boolean;
  created_at?: string;
}

export default function PrizeTicketsModal({
  open,
  onOpenChange,
  raffleId,
  prizeAmount,
  prizeType,
  prizeCount,
}: PrizeTicketsModalProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const ticketsPerPage = 16; // 4x4 grid

  const { data: allWinningTickets, isLoading } = useQuery({
    queryKey: [`/api/raffles/${raffleId}/instant-win-tickets`],
    queryFn: async () => {
      const response = await fetch(`/api/raffles/${raffleId}/instant-win-tickets`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch instant win tickets");
      return response.json() as Promise<WinningTicket[]>;
    },
    enabled: open && !!raffleId,
  });

  // Filter tickets for this specific prize
  const prizeTickets = allWinningTickets?.filter(
    ticket => 
      ticket.prize_type === prizeType && 
      parseFloat(ticket.prize_amount.toString()) === prizeAmount
  ) || [];

  // Create array of all possible ticket slots for this prize
  const allTicketSlots = Array(prizeCount).fill(null).map((_, index) => {
    const winningTicket = prizeTickets[index];
    return winningTicket || null;
  });

  const totalPages = Math.ceil(allTicketSlots.length / ticketsPerPage);
  const currentTickets = allTicketSlots.slice(
    currentPage * ticketsPerPage,
    (currentPage + 1) * ticketsPerPage
  );

  const formatWinnerName = (name: string) => {
    if (!name) return "";
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
    }
    return parts[0];
  };

  const getTicketStyle = (ticket: WinningTicket | null) => {
    if (!ticket) {
      // Not won yet - gray
      return "bg-gray-600 text-white";
    }
    if (ticket.claimed) {
      // Won and claimed - keep primary color
      return "bg-primary text-primary-foreground";
    }
    // Won but not claimed - keep primary color
    return "bg-primary text-primary-foreground";
  };

  const getTicketContent = (ticket: WinningTicket | null, index: number) => {
    if (!ticket) {
      return {
        topText: `Ticket #${index + 1}`,
        bottomText: "Available",
      };
    }
    
    return {
      topText: ticket.ticket_number.toString(),
      bottomText: ticket.winner_name ? formatWinnerName(ticket.winner_name) : "Won",
    };
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Loading tickets...
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gray-900 text-white border-primary">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-white">
            <span>£{prizeAmount} {prizeType.toUpperCase()}</span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <p className="text-sm text-gray-300">
            If any of your randomly allocated tickets match those below, you win the prize!
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* 4x4 Grid of tickets */}
          <div className="grid grid-cols-4 gap-2">
            {currentTickets.map((ticket, index) => {
              const content = getTicketContent(ticket, currentPage * ticketsPerPage + index);
              const style = getTicketStyle(ticket);
              
              return (
                <div
                  key={currentPage * ticketsPerPage + index}
                  className={`${style} rounded-lg p-4 text-center transition-all hover:scale-105`}
                >
                  <div className="font-bold text-lg mb-1">
                    {content.topText}
                  </div>
                  <div className="text-sm opacity-90">
                    {content.bottomText}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              >
                ← Previous
              </Button>
              
              <span className="text-sm text-gray-300">
                Page {currentPage + 1} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              >
                Next →
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}