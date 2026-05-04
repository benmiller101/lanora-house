import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Raffle } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import CountdownTimer from "./CountdownTimer";
import WinnerDisplay from "./WinnerDisplay";
import InstantWinTicketsModal from "./InstantWinTicketsModal";
import PrizeTicketsModal from "./PrizeTicketsModal";
import { format } from "date-fns";
import { FiShoppingCart, FiCheckCircle, FiPlus, FiMinus, FiUserCheck } from "react-icons/fi";
import { X } from "lucide-react";
import { Link, useLocation } from "wouter";

interface PrizeDrawCardProps {
  raffle: Raffle;
}

export default function PrizeDrawCard({ raffle }: PrizeDrawCardProps) {
  const [selectedTickets, setSelectedTickets] = useState(0);
  const [customTickets, setCustomTickets] = useState("");
  const [showInstantWinModal, setShowInstantWinModal] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<{amount: number, type: string, count: number} | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/cart", {
        type: "raffle_ticket",
        raffleId: raffle.id,
        quantity: selectedTickets
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/raffles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/raffles/featured"] });
      toast({
        title: "Added to Cart!",
        description: `Added ${selectedTickets} prize draw ticket${selectedTickets > 1 ? 's' : ''} to your cart.`,
      });
      setSelectedTickets(0);
    },
    onError: (error: any) => {
      // Check if error requires authentication
      if (error?.requireAuth || error?.message?.includes("must be logged in")) {
        toast({
          title: "Account Required",
          description: "Please sign up or log in to enter prize draws and purchase tickets.",
          variant: "default",
          className: "border-primary bg-primary/5 text-primary",
        });
      } else {
        toast({
          title: "Failed to add to cart",
          description: error instanceof Error ? error.message : "An unknown error occurred.",
          variant: "destructive",
        });
      }
    }
  });
  
  // Handle button click - require authentication for raffle tickets
  const handlePurchaseClick = () => {
    if (selectedTickets === 0) {
      toast({
        title: "Select tickets",
        description: "Please select the number of tickets you want to purchase.",
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated before allowing prize draw ticket purchase
    if (!isAuthenticated) {
      toast({
        title: "Account Required",
        description: "Please sign up or log in to enter prize draws and purchase tickets.",
        variant: "default",
        className: "border-primary bg-primary/5 text-primary",
      });
      return;
    }

    // Add prize draw tickets to cart (authenticated users only)
    addToCartMutation.mutate();
  };
  
  const handleTicketSelection = (amount: number) => {
    setSelectedTickets(amount === selectedTickets ? 0 : amount);
    setCustomTickets("");
  };
  
  const handleCustomTicketChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow positive numbers
    if (/^\d*$/.test(value)) {
      setCustomTickets(value);
      if (value) {
        const numValue = parseInt(value);
        // Don't allow more tickets than remaining
        if (numValue <= ticketsRemaining) {
          setSelectedTickets(numValue);
        } else {
          // Cap at remaining tickets
          setSelectedTickets(ticketsRemaining);
          setCustomTickets(ticketsRemaining.toString());
        }
      } else {
        setSelectedTickets(0);
      }
    }
  };

  const ticketsRemaining = raffle.maxTickets - raffle.ticketsSold;
  
  // Check if raffle should be active based on current time
  const now = new Date();
  const startDate = new Date(raffle.startDate);
  const endDate = new Date(raffle.endDate);
  
  const isActive = raffle.status === "active" && now >= startDate && now < endDate;
  const isCompleted = raffle.status === "completed" || now >= endDate;
  const isSoldOut = ticketsRemaining <= 0;

  return (
    <div className="bg-accent border border-secondary/20 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Image section */}
      <div className="relative group">
        <Link href={`/raffle/${raffle.id}`}>
          <img 
            src={raffle.imageUrl} 
            alt={raffle.name} 
            className="w-full h-60 object-cover cursor-pointer"
          />
          
          {/* Instant win ribbon on the image */}
          {raffle.instantWinEnabled && (
            <div className="absolute -top-1 -right-1 transform rotate-12 z-10">
              <div className="bg-primary text-primary-foreground px-4 py-1 font-medium uppercase text-xs shadow-lg border border-secondary">
                Instant Win
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* Content section */}
      <div className="p-4">
        {/* Title with ticket price */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-display text-xl text-primary flex-1">{raffle.name}</h3>
          <div className="text-right ml-4">
            <div className="text-lg font-bold text-primary">£{Number(raffle.ticketPrice).toFixed(2)}</div>
            <div className="text-xs text-neutral-wood">per ticket</div>
          </div>
        </div>
        {(raffle.excerpt || raffle.description) && (
          <p className="text-sm text-neutral-wood mb-3">{raffle.excerpt || raffle.description}</p>
        )}
        
        {/* Instant win prizes - elegant Lanora House design */}
        {raffle.instantWinEnabled && (
          <div className="relative mb-5 mt-1">
            <div 
              className="bg-accent border-2 border-primary/20 p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setShowInstantWinModal(true)}
            >
              <div className="flex items-center justify-center mb-3">
                <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                  Instant Wins
                </div>
              </div>
              
              <div className="space-y-2">
                {/* Display actual instant win prizes if available */}
                {raffle.instantWinPrizes && raffle.instantWinPrizes.map((prize, index) => (
                  <div 
                    key={index} 
                    className="bg-accent border border-secondary/30 rounded-md p-3 text-center cursor-pointer hover:shadow-md transition-shadow"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPrize(prize);
                    }}
                  >
                    <div className="text-lg font-display font-semibold text-primary">
                      £{prize.amount} {prize.type === 'cash' ? 'Cash' : (prize.type || 'Prize').replace(/^\w/, c => c.toUpperCase())}
                    </div>
                    <div className="text-sm text-neutral-wood">
                      {prize.count} {prize.count === 1 ? 'winner' : 'winners'} selected
                    </div>
                  </div>
                ))}
                
                {/* Default display if no specific prizes configured */}
                {(!raffle.instantWinPrizes || raffle.instantWinPrizes.length === 0) && (
                  <div className="bg-accent border border-secondary/30 rounded-md p-3 text-center">
                    <div className="text-lg font-display font-semibold text-primary">
                      Instant Cash Prizes
                    </div>
                    <div className="text-sm text-neutral-wood">
                      Win cash prizes instantly!
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-3 text-center">
                <p className="text-xs text-neutral-wood italic">
                  Winners selected automatically upon ticket purchase
                </p>
                <p className="text-xs text-primary font-medium mt-1">
                  Click to see winning tickets
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Timer and status */}
        <div className="mb-4">
          {isActive && (
            <>
              <CountdownTimer endDate={raffle.endDate} />
              {/* Simple progress bar - just the bar, no text */}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="h-2 rounded-full transition-all duration-300 bg-primary"
                  style={{ 
                    width: `${((raffle.ticketsSold) / raffle.maxTickets) * 100}%` 
                  }}
                ></div>
              </div>
            </>
          )}
          
          

          
          {/* Simplified availability indicator - only show when almost sold out */}
          {isActive && !isSoldOut && ticketsRemaining <= 10 && (
            <div className="text-center py-1 text-amber-600 text-sm font-medium">
              Only {ticketsRemaining} tickets left!
            </div>
          )}
          
          {/* Sold out indicator */}
          {isSoldOut && (
            <div className="text-center py-2 text-red-600 font-bold">
              SOLD OUT
            </div>
          )}
        </div>

        {/* Streamlined ticket selection */}
        {(isActive && !isSoldOut) && (
          <div className="mb-4">
            <div className="relative">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <button 
                  type="button"
                  onClick={() => {
                    if (selectedTickets > 1) {
                      setSelectedTickets(selectedTickets - 1);
                      setCustomTickets((selectedTickets - 1).toString());
                    }
                  }}
                  className="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  disabled={selectedTickets <= 1}
                >
                  <FiMinus size={14} />
                </button>
                
                <div className="text-center min-w-[80px]">
                  <div className="text-2xl font-bold text-primary">{selectedTickets}</div>
                  <div className="text-xs text-neutral-wood">tickets</div>
                </div>
                
                <button 
                  type="button"
                  onClick={() => {
                    const newValue = selectedTickets + 1;
                    if (newValue <= ticketsRemaining) {
                      setSelectedTickets(newValue);
                      setCustomTickets(newValue.toString());
                    }
                  }}
                  className="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  disabled={selectedTickets >= ticketsRemaining}
                >
                  <FiPlus size={14} />
                </button>
              </div>
              
              {selectedTickets > 0 && (
                <div className="text-center">
                  <span className="text-lg font-bold text-primary">£{(Number(raffle.ticketPrice) * selectedTickets).toFixed(2)}</span>
                  <span className="text-sm text-neutral-wood ml-2">total</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Winner display for completed raffles */}
        {isCompleted && raffle.winner && (
          <div className="mb-4">
            <WinnerDisplay 
              winner={raffle.winner} 
              raffleName={raffle.name}
              showConfetti={false}
            />
          </div>
        )}

        {/* Action button */}
        <div className="space-y-2">
          {isSoldOut ? (
            <Button disabled className="w-full bg-red-100 text-red-800 border border-red-200">
              <X className="mr-2" size={16} />
              Sold Out
            </Button>
          ) : isActive ? (
            <Button
              onClick={handlePurchaseClick}
              disabled={selectedTickets === 0 || addToCartMutation.isPending || selectedTickets > ticketsRemaining}
              className="w-full"
            >
              {addToCartMutation.isPending ? (
                "Adding to Cart..."
              ) : selectedTickets > ticketsRemaining ? (
                `Only ${ticketsRemaining} left`
              ) : (
                <>
                  <FiShoppingCart className="mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          ) : isCompleted ? (
            <Button disabled className="w-full bg-neutral-100 text-neutral-600">
              <FiCheckCircle className="mr-2" />
              Draw Complete
            </Button>
          ) : null}
          
          <Link href={`/raffle/${raffle.id}`}>
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Instant Win Tickets Modal */}
      <InstantWinTicketsModal
        open={showInstantWinModal}
        onOpenChange={setShowInstantWinModal}
        raffleId={raffle.id}
        raffleName={raffle.name}
        instantWinPrizes={raffle.instantWinPrizes || []}
      />
      
      {/* Prize-specific tickets modal */}
      {selectedPrize && (
        <PrizeTicketsModal
          open={!!selectedPrize}
          onOpenChange={(open) => !open && setSelectedPrize(null)}
          raffleId={raffle.id}
          prizeAmount={selectedPrize.amount}
          prizeType={selectedPrize.type}
          prizeCount={selectedPrize.count}
        />
      )}
    </div>
  );
}