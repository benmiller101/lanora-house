import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Prize {
  type: string;
  count: number;
  amount: number;
}

interface InstantWinDisplayProps {
  title?: string;
  amount?: number;
  selectedPrize?: Prize | null;
  winners?: any[];
  onClose: () => void;
  isOpen: boolean;
  raffleId?: string;
}

// Sample winners for display when no actual winners exist yet
const sampleWinners = [
  { number: 31862, winner: "Helen B" },
  { number: 40517, winner: "Ann M" },
  { number: 112389, winner: "Ann M" },
  { number: 286576, winner: "Susan D" },
  { number: 532938, winner: "Kristy W" },
  { number: 581753, winner: "Leanne H" },
  { number: 589960, winner: "Laura R" },
];

// Generate grid of ticket numbers
const generateTicketGrid = (prizeCount: number) => {
  const grid = [];
  const totalTickets = 20; // Fixed grid size
  
  // Create base ticket numbers
  for (let i = 0; i < totalTickets; i++) {
    const ticketNumber = Math.floor(Math.random() * 900000) + 100000;
    grid.push({ number: ticketNumber, winner: "" });
  }
  
  // Add sample winners (this would be replaced with real winners in production)
  const winnerCount = Math.min(prizeCount, sampleWinners.length);
  for (let i = 0; i < winnerCount; i++) {
    const randomIndex = Math.floor(Math.random() * totalTickets);
    grid[randomIndex] = { ...sampleWinners[i] };
  }
  
  return grid;
};

const InstantWinDisplay: React.FC<InstantWinDisplayProps> = ({ 
  title,
  amount, 
  selectedPrize, 
  winners = [],
  onClose, 
  isOpen,
  raffleId
}) => {  
  // Get prize details
  const prizeAmount = selectedPrize?.amount || amount || 250;
  const prizeCount = selectedPrize?.count || 25;
  const prizeTitle = title || "YOU'VE WON BIG FAT POUND NOTES";
  
  // Generate ticket grid with some random winning tickets
  const [ticketGrid, setTicketGrid] = useState<Array<{number: number, winner: string}>>([]);
  
  useEffect(() => {
    if (isOpen) {
      setTicketGrid(generateTicketGrid(prizeCount));
    }
  }, [isOpen, prizeCount, selectedPrize]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border border-purple-600 p-4 max-w-2xl">
        <DialogTitle className="text-xl text-white text-center">
          x{prizeCount} - £{prizeAmount} {prizeTitle}
        </DialogTitle>
        
        <p className="text-white text-sm text-center mt-2 mb-4">
          If any of your randomly allocated tickets match those below, you win the prize!
        </p>
        
        <div className="grid grid-cols-4 gap-2">
          {ticketGrid.map((ticket, index) => {
            // Calculate color based on position (checkerboard pattern)
            const row = Math.floor(index / 4);
            const col = index % 4;
            const isPurple = (row % 2 === 0 && col % 2 === 0) || 
                            (row % 2 === 1 && col % 2 === 1);
            
            return (
              <div 
                key={index} 
                className={`${isPurple ? 'bg-purple-600' : 'bg-gray-800'} rounded overflow-hidden`}
              >
                <div className="p-2 text-center text-white font-bold">
                  {ticket.number}
                </div>
                <div className={`p-1 text-center ${ticket.winner ? 'bg-gray-700' : 'bg-purple-700'} text-white font-bold`}>
                  {ticket.winner || "WIN"}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            className="bg-gray-700 text-white border-none"
            onClick={onClose}
          >
            « Previous
          </Button>
          <Button
            variant="outline"
            className="bg-purple-600 text-white border-none"
            onClick={onClose}
          >
            Next »
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstantWinDisplay;