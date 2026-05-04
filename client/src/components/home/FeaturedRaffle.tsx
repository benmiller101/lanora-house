import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Raffle } from "@/lib/types";
import { Countdown } from "@/components/ui/countdown";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from '@/hooks/useAuth';
import InstantWinTicketsModal from "@/components/raffles/InstantWinTicketsModal";
import PrizeTicketsModal from "@/components/raffles/PrizeTicketsModal";

export default function FeaturedPrizeDraw() {
  const [selectedTickets, setSelectedTickets] = useState(1);
  const [showInstantWinModal, setShowInstantWinModal] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<{amount: number, type: string, count: number} | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  
  const { data: featuredRaffle, isLoading } = useQuery({ 
    queryKey: ['/api/raffles/featured'],
    queryFn: async () => {
      const res = await fetch('/api/raffles/featured');
      if (!res.ok) throw new Error('Failed to fetch featured prize draw');
      return res.json() as Promise<Raffle>;
    }
  });
  
  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/cart', {
        type: 'raffle_ticket',
        raffleId: featuredRaffle?.id,
        quantity: selectedTickets
      });
    },
    onSuccess: () => {
      // Force immediate refresh of cart and raffle data
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/raffles/featured'] });
      queryClient.invalidateQueries({ queryKey: ['/api/raffles'] });
      queryClient.refetchQueries({ queryKey: ['/api/cart'] });
      
      toast({
        title: "Added to Cart!",
        description: `${selectedTickets} prize draw tickets for ${featuredRaffle?.name} added to your cart.`,
        action: (
          <Link href="/cart">
            <Button variant="outline" size="sm">View Cart</Button>
          </Link>
        ),
      });
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
          title: "Error",
          description: "Failed to add tickets to cart. Please try again.",
          variant: "destructive",
        });
      }
      console.error('Add to cart error:', error);
    }
  });

  const handleTicketSelection = (amount: number) => {
    setSelectedTickets(amount);
  };
  
  // Calculate ticket availability
  const ticketsRemaining = featuredRaffle ? featuredRaffle.maxTickets - featuredRaffle.ticketsSold : 0;
  const isSoldOut = ticketsRemaining <= 0;

  const incrementTickets = () => {
    if (featuredRaffle && selectedTickets < ticketsRemaining) {
      setSelectedTickets(prev => prev + 1);
    }
  };
  
  const decrementTickets = () => {
    if (selectedTickets > 1) {
      setSelectedTickets(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (selectedTickets === 0) {
      toast({
        title: "Please select tickets",
        description: "Please select how many tickets you would like to purchase.",
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated before allowing raffle ticket purchase
    if (!isAuthenticated) {
      toast({
        title: "Account Required",
        description: "Please sign up or log in to enter prize draws and purchase tickets.",
        variant: "default",
        className: "border-primary bg-primary/5 text-primary",
      });
      return;
    }
    
    addToCartMutation.mutate();
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-neutral-ivory">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-4 bg-neutral-paper rounded w-1/6 mx-auto mb-2"></div>
            <div className="h-8 bg-neutral-paper rounded w-1/3 mx-auto mb-2"></div>
            <div className="h-4 bg-neutral-paper rounded w-2/3 mx-auto"></div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="h-[400px] bg-neutral-paper animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!featuredRaffle) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-neutral-ivory">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-secondary font-medium uppercase tracking-wider text-sm">Limited Time Opportunity</span>
          <h2 className="font-display text-3xl md:text-4xl mt-2 mb-3">Featured Prize Draw</h2>
          <p className="text-neutral-wood opacity-70 max-w-2xl mx-auto">
            Enter our exclusive prize draw for a chance to win extraordinary antiques at a fraction of their value.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2">
            <div className="p-6 md:p-8 lg:p-12 flex flex-col justify-between h-full">
              <div>
                <h3 className="font-display text-2xl md:text-3xl mb-3">{featuredRaffle.name}</h3>
                <p className="mb-4 text-neutral-wood opacity-80">{featuredRaffle.excerpt || featuredRaffle.description}</p>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <i className="ri-ticket-2-line text-secondary mr-2"></i>
                      <span className="font-medium">Ticket Price:</span>
                    </div>
                    <span className="text-2xl font-bold text-primary">£{Number(featuredRaffle.ticketPrice).toFixed(2)}</span>
                  </div>
                  
                  {/* Simplified availability indicator */}
                  {!isSoldOut && ticketsRemaining <= 10 && (
                    <div className="text-center py-2 text-primary font-medium">
                      Only {ticketsRemaining} tickets left!
                    </div>
                  )}
                  
                  {isSoldOut && (
                    <div className="text-center py-2 text-red-600 font-bold">
                      SOLD OUT
                    </div>
                  )}
                </div>

                {/* Instant Win Prizes Display */}
                {featuredRaffle.instantWinEnabled && (
                  <div 
                    className="mb-6 p-4 bg-primary/5 border-2 border-primary/20 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setShowInstantWinModal(true)}
                  >
                    <div className="flex items-center justify-center mb-3">
                      <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                        <i className="ri-gift-line mr-1"></i>
                        Instant Wins
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {featuredRaffle.instantWinPrizes && featuredRaffle.instantWinPrizes.length > 0 ? (
                        featuredRaffle.instantWinPrizes.map((prize, index) => (
                          <div 
                            key={index} 
                            className="bg-white border border-primary/30 rounded-md p-3 text-center shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPrize(prize);
                            }}
                          >
                            <div className="text-lg font-display font-semibold text-primary">
                              £{prize.amount} {prize.type === 'cash' ? 'Cash' : (prize.type || 'Prize').replace(/^\w/, c => c.toUpperCase())}
                            </div>
                            <div className="text-sm text-neutral-wood">
                              {prize.count} {prize.count === 1 ? 'winner' : 'winners'} selected instantly
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-white border border-primary/30 rounded-md p-3 text-center shadow-sm">
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
                        <i className="ri-flashlight-line mr-1"></i>
                        Winners selected automatically upon ticket purchase
                      </p>
                      <p className="text-xs text-primary font-medium mt-1">
                        Click to see winning tickets
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <div className="raffle-countdown p-4 rounded-lg mb-6">
                  <div className="text-center">
                    <h4 className="font-medium mb-2 text-primary uppercase">ENDS IN:</h4>
                    <Countdown targetDate={new Date(featuredRaffle.endDate)} />
                    {/* Simple progress bar - just the bar, no text */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div 
                        className="h-2 rounded-full transition-all duration-300 bg-primary"
                        style={{ 
                          width: `${((featuredRaffle.ticketsSold) / featuredRaffle.maxTickets) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="font-medium mb-2">Select Ticket Quantity:</div>
                  <div className="flex items-center">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={decrementTickets}
                      disabled={selectedTickets <= 1 || isSoldOut}
                      className="h-10 w-10"
                    >
                      <span className="text-lg">-</span>
                    </Button>
                    
                    <div className="flex-1 mx-3">
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max={ticketsRemaining}
                          value={selectedTickets}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            setSelectedTickets(Math.min(value, ticketsRemaining));
                          }}
                          disabled={isSoldOut}
                          placeholder={isSoldOut ? "Sold Out" : "1"}
                          className="w-full h-10 border rounded-md px-3 text-center disabled:bg-gray-100"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-wood opacity-70">
                          tickets
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={incrementTickets}
                      disabled={selectedTickets >= ticketsRemaining || isSoldOut}
                      className="h-10 w-10"
                    >
                      <span className="text-lg">+</span>
                    </Button>
                  </div>
                  
                  <div className="text-sm text-neutral-wood opacity-70 mt-1 text-right">
                    Total: £{(selectedTickets * (featuredRaffle?.ticketPrice ? parseFloat(featuredRaffle.ticketPrice) : 0)).toFixed(2)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {isSoldOut ? (
                    <Button 
                      disabled
                      className="bg-red-100 text-red-800 border border-red-200 font-medium"
                    >
                      Sold Out
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleAddToCart}
                      disabled={selectedTickets === 0 || addToCartMutation.isPending}
                      className="bg-primary hover:bg-primary/90 text-white font-medium"
                    >
                      {addToCartMutation.isPending ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Adding...
                        </>
                      ) : (
                        <>Add to Cart</>
                      )}
                    </Button>
                  )}
                  
                  <Button 
                    onClick={() => window.location.href = `/raffle/${featuredRaffle.id}`}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="relative h-48 md:h-72 lg:h-auto">
              <img 
                src={featuredRaffle.imageUrl} 
                alt={featuredRaffle.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-lg shadow-md">
                <div className="text-sm">
                  <span className="font-medium">{featuredRaffle.entryCount || 0}</span> tickets sold
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-10 text-center">
          <Link href="/raffles">
            <a className="inline-flex items-center text-primary hover:text-primary-dark transition-colors font-medium">
              <span>View All Raffles</span>
              <i className="ri-arrow-right-line ml-2"></i>
            </a>
          </Link>
        </div>
      </div>
      
      {/* Instant Win Tickets Modal */}
      <InstantWinTicketsModal
        open={showInstantWinModal}
        onOpenChange={setShowInstantWinModal}
        raffleId={featuredRaffle.id}
        raffleName={featuredRaffle.name}
        instantWinPrizes={featuredRaffle.instantWinPrizes || []}
      />
      
      {/* Prize-specific tickets modal */}
      {selectedPrize && (
        <PrizeTicketsModal
          open={!!selectedPrize}
          onOpenChange={(open) => !open && setSelectedPrize(null)}
          raffleId={featuredRaffle.id}
          prizeAmount={selectedPrize.amount}
          prizeType={selectedPrize.type}
          prizeCount={selectedPrize.count}
        />
      )}
    </section>
  );
}
