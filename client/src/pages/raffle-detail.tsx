import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Raffle } from "@/lib/types";
import { Countdown } from "@/components/ui/countdown";
import { isPast, format } from "date-fns";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Award, 
  Star, 
  Clock, 
  Users, 
  Trophy,
  ArrowLeft,
  Ticket,
  Eye,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import SocialSharePanel from "@/components/social/SocialSharePanel";
import WinnerDisplay from "@/components/raffles/WinnerDisplay";
import PrizeTicketsModal from "@/components/raffles/PrizeTicketsModal";
import WinnerSelectionWheel from "@/components/raffles/WinnerSelectionWheel";
import { useAuth } from '@/hooks/useAuth';
import { queryClient } from '@/lib/queryClient';

export default function RaffleDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTickets, setSelectedTickets] = useState(1);
  const [showWinDialog, setShowWinDialog] = useState(false);
  const [instantWinAmount, setInstantWinAmount] = useState(0);
  const [showWinnersList, setShowWinnersList] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [selectedPrize, setSelectedPrize] = useState<{amount: number, type: string, count: number} | null>(null);
  const [showWinnerSelection, setShowWinnerSelection] = useState(false);
  
  // Fetch raffle details
  const { data: raffle, isLoading } = useQuery({
    queryKey: [`/api/raffles/${id}`],
    queryFn: async () => {
      const res = await fetch(`/api/raffles/${id}`);
      if (!res.ok) throw new Error('Failed to fetch raffle details');
      return res.json() as Promise<Raffle>;
    }
  });
  
  // Fetch user's tickets for this raffle
  const { data: userTickets, isLoading: isLoadingTickets } = useQuery({
    queryKey: [`/api/raffles/${id}/my-tickets`],
    queryFn: async () => {
      const res = await fetch(`/api/raffles/${id}/my-tickets`);
      if (!res.ok) throw new Error('Failed to fetch your tickets');
      return res.json();
    }
  });
  
  // Fetch instant winners for this raffle
  const { data: instantWinData } = useQuery({
    queryKey: [`/api/raffles/${id}/instant-winners`],
    queryFn: async () => {
      const res = await fetch(`/api/raffles/${id}/instant-winners`);
      if (!res.ok) throw new Error('Failed to fetch instant winners');
      return res.json();
    },
    enabled: !!raffle?.instantWinEnabled
  });
  
  // Check if raffle has ended
  const hasEnded = raffle ? isPast(new Date(raffle.endDate)) : false;
  
  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/cart", { 
        raffleId: parseInt(id || "0"),
        quantity: selectedTickets,
        type: "raffle_ticket"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: [`/api/raffles/${id}`] });
      
      toast({
        title: "Added to Cart!",
        description: `${selectedTickets} raffle tickets for ${raffle?.name} added to your cart.`,
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
          description: "Please sign up or log in to enter raffles and purchase tickets.",
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
    }
  });
  
  const handleAddToCart = () => {
    if (selectedTickets === 0) {
      toast({
        title: "Please select tickets",
        description: "Choose how many tickets you'd like to purchase.",
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated before allowing raffle ticket purchase
    if (!isAuthenticated) {
      toast({
        title: "Account Required",
        description: "Please sign up or log in to enter raffles and purchase tickets.",
        variant: "default",
        className: "border-primary bg-primary/5 text-primary",
      });
      return;
    }
    
    addToCartMutation.mutate();
  };

  const incrementTickets = () => {
    if (raffle && selectedTickets < ticketsRemaining) {
      setSelectedTickets(prev => prev + 1);
    }
  };
  
  const decrementTickets = () => {
    if (selectedTickets > 1) {
      setSelectedTickets(prev => prev - 1);
    }
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
  
  if (!raffle) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="font-display text-2xl mb-4">Raffle Not Found</h2>
        <p className="mb-6">The raffle you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/raffles')} className="bg-primary hover:bg-primary-dark text-white">
          Browse Raffles
        </Button>
      </div>
    );
  }

  // Calculate ticket availability
  const ticketsRemaining = raffle ? raffle.maxTickets - raffle.ticketsSold : 0;
  const isSoldOut = ticketsRemaining <= 0;

  // Get all images (main + additional)
  const allImages = [raffle.imageUrl, ...(raffle.additionalImages || [])].filter(Boolean);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };
  
  return (
    <>
      <Helmet>
        <title>{`${raffle.name} | Lanora House Raffles`}</title>
        <meta name="description" content={(raffle.description || raffle.itemDescription)?.substring(0, 155)} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://www.lanorahouse.com/raffle/${id}`} />
        <meta property="og:title" content={`${raffle.name} | Lanora House Raffles`} />
        <meta property="og:description" content={(raffle.description || raffle.itemDescription)?.substring(0, 155)} />
        <meta property="og:url" content={`https://www.lanorahouse.com/raffle/${id}`} />
        <meta property="og:type" content="product" />
        {raffle.imageUrl && <meta property="og:image" content={raffle.imageUrl} />}
      </Helmet>
      
      <section className="py-16 bg-neutral-ivory">
        <div className="container mx-auto px-4">
          {/* Breadcrumb Navigation */}
          <div className="mb-8">
            <Link href="/raffles" className="inline-flex items-center text-neutral-wood hover:text-primary transition-colors">
              <ArrowLeft size={16} className="mr-2" />
              Back to Raffles
            </Link>
          </div>

          <div className="text-center mb-12">
            <span className="text-secondary font-medium uppercase tracking-wider text-sm">
              {raffle.instantWinEnabled ? 'Instant Wins' : 'Limited Time Opportunity'}
            </span>
            <h1 className="font-display text-4xl md:text-5xl mt-2 mb-3">{raffle.name}</h1>
            <p className="text-neutral-wood opacity-70 max-w-3xl mx-auto text-lg">
              {raffle.itemDescription || raffle.description}
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-between h-full">
                <div>
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <i className="ri-ticket-2-line text-secondary mr-2"></i>
                      <span className="font-medium">Ticket Price:</span>
                      <span className="ml-2 text-lg font-semibold">£{Number(raffle.ticketPrice).toLocaleString()} each</span>
                    </div>
                    <div className="flex items-center mb-3">
                      <i className="ri-ticket-line text-secondary mr-2"></i>
                      <span className="font-medium">Tickets Available:</span>
                      <span className={`ml-2 font-bold ${
                        isSoldOut ? 'text-red-600' : 'text-primary'
                      }`}>
                        {isSoldOut ? 'SOLD OUT' : `${ticketsRemaining} left`}
                      </span>
                    </div>
                    <div className="flex items-center mb-4">
                      <i className="ri-user-line text-secondary mr-2"></i>
                      <span className="font-medium">Tickets Sold:</span>
                      <span className="ml-2">{raffle.ticketsSold} / {raffle.maxTickets}</span>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${
                            isSoldOut ? 'bg-red-500' : 'bg-primary'
                          }`}
                          style={{ 
                            width: `${((raffle.maxTickets - ticketsRemaining) / raffle.maxTickets) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-primary/70 mt-2">
                        {raffle.ticketsSold} sold • <span className="text-primary font-medium">{ticketsRemaining} left</span>
                      </div>
                    </div>
                  </div>

                  {/* Instant Win Prizes Display */}
                  {raffle.instantWinEnabled && (
                    <div className="mb-6 p-4 bg-primary/5 border-2 border-primary/20 rounded-lg">
                      <div className="flex items-center justify-center mb-3">
                        <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                          <i className="ri-gift-line mr-1"></i>
                          Instant Wins
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {raffle.instantWinPrizes && raffle.instantWinPrizes.length > 0 ? (
                          raffle.instantWinPrizes.map((prize, index) => (
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
                              Instant Cash
                            </div>
                            <div className="text-sm text-neutral-wood">
                              Win cash instantly!
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 text-center">
                        <p className="text-xs text-neutral-wood italic">
                          <i className="ri-flashlight-line mr-1"></i>
                          Winners selected automatically upon ticket purchase
                        </p>
                      </div>
                    </div>
                  )}


                </div>
                
                <div>
                  <div className="raffle-countdown p-4 rounded-lg mb-6">
                    <div className="text-center">
                      <h4 className="font-medium mb-2 text-primary uppercase">
                        {hasEnded ? 'ENDED' : 'ENDS IN:'}
                      </h4>
                      {!hasEnded && <Countdown targetDate={new Date(raffle.endDate)} />}
                      {hasEnded && !raffle.winner && (
                        <div className="space-y-4">
                          <div className="text-xl font-bold text-orange-600">
                            Raffle Completed
                          </div>
                          <Button
                            onClick={() => setShowWinnerSelection(true)}
                            className="bg-primary hover:bg-primary/90 text-white"
                            size="lg"
                          >
                            <Trophy className="mr-2 h-5 w-5" />
                            Select Winner
                          </Button>
                        </div>
                      )}
                      {hasEnded && raffle.winner && (
                        <div className="space-y-2">
                          <div className="text-lg text-primary font-semibold">
                            🎉 {raffle.winner.name || 'Anonymous'} won!
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {!hasEnded && !isSoldOut && (
                    <>
                      <div className="mb-4">
                        <div className="font-medium mb-2">Select Ticket Quantity:</div>
                        <div className="flex items-center">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={decrementTickets}
                            disabled={selectedTickets <= 1}
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
                                className="w-full h-10 border rounded-md px-3 text-center"
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
                            disabled={selectedTickets >= ticketsRemaining}
                            className="h-10 w-10"
                          >
                            <span className="text-lg">+</span>
                          </Button>
                        </div>
                        
                        <div className="text-sm text-neutral-wood opacity-70 mt-1 text-right">
                          Total: £{(selectedTickets * (raffle?.ticketPrice ? parseFloat(raffle.ticketPrice.toString()) : 0)).toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <Button 
                          onClick={handleAddToCart}
                          disabled={selectedTickets === 0 || addToCartMutation.isPending}
                          className="bg-primary hover:bg-primary/90 text-white font-medium h-12"
                        >
                          {addToCartMutation.isPending ? (
                            <>
                              <span className="animate-spin mr-2">⏳</span>
                              Adding to Cart...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="mr-2" size={18} />
                              Add {selectedTickets} Ticket{selectedTickets !== 1 ? 's' : ''} to Cart
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}

                  {isSoldOut && (
                    <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-red-800 font-medium text-lg">This raffle is sold out</div>
                      <div className="text-red-600 text-sm mt-1">All tickets have been purchased</div>
                    </div>
                  )}

                  {hasEnded && (
                    <div className="space-y-4">
                      {raffle.winner ? (
                        <div className="space-y-4">
                          <WinnerDisplay 
                            winner={raffle.winner} 
                            raffleName={raffle.name}
                            showConfetti={true}
                          />
                          <Link href={`/raffle/${raffle.id}/complete`}>
                            <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold">
                              🎰 Watch Live Draw Replay
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="text-gray-800 font-medium text-lg">This raffle has ended</div>
                          <div className="text-gray-600 text-sm mt-1">
                            Ended on {format(new Date(raffle.endDate), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Admin Controls */}
                  {user?.email === 'admin@lanorahouse.com' && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-3">Admin Controls</h4>
                      <div className="space-y-2">
                        {!hasEnded && !raffle.winner && (
                          <Button 
                            onClick={async () => {
                              try {
                                await apiRequest("POST", `/api/raffles/${raffle.id}/force-complete`);
                                window.location.reload();
                              } catch (error) {
                                console.error("Error completing raffle:", error);
                              }
                            }}
                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                          >
                            🎯 Complete Raffle & Select Winner
                          </Button>
                        )}
                        {raffle.winner && (
                          <Link href={`/raffle/${raffle.id}/complete`}>
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                              🎰 Launch Live Draw Experience
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="relative h-72 md:h-auto">
                {allImages.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white"
                      onClick={prevImage}
                    >
                      <ChevronLeft size={20} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white"
                      onClick={nextImage}
                    >
                      <ChevronRight size={20} />
                    </Button>
                  </>
                )}
                
                <img 
                  src={allImages[currentImageIndex]} 
                  alt={`${raffle.name} - Image ${currentImageIndex + 1}`} 
                  className="w-full h-full object-cover"
                />
                
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {allImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
                
                <div className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-lg shadow-md">
                  <div className="text-sm">
                    <span className="font-medium">{raffle.ticketsSold || 0}</span> tickets sold
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Share Panel */}
          {raffle && (
            <div className="mt-12 max-w-6xl mx-auto">
              <SocialSharePanel 
                raffleId={raffle.id}
                raffleName={raffle.name}
                raffleDescription={raffle.description || raffle.itemDescription || ""}
                currentUrl={`${window.location.origin}/raffle/${raffle.id}`}
              />
            </div>
          )}

          {/* Your Tickets Section */}
          {userTickets && userTickets.length > 0 && (
            <div className="mt-12 bg-white rounded-xl shadow-lg overflow-hidden max-w-6xl mx-auto">
              <div className="p-8">
                <h3 className="text-2xl font-display text-center mb-6">
                  Your Tickets ({userTickets.length})
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                  {userTickets.map((ticket: any) => (
                    <div 
                      key={ticket.ticketNumber} 
                      className={`
                        border-2 rounded-lg p-3 text-center font-semibold transition-all hover:scale-105
                        ${ticket.isInstantWinner 
                          ? 'bg-yellow-100 border-yellow-400 text-yellow-800 shadow-lg' 
                          : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
                        }
                      `}
                    >
                      {ticket.ticketNumber}
                      {ticket.isInstantWinner && (
                        <div className="text-xs text-yellow-600 mt-1">
                          <Star size={12} className="inline mr-1" />
                          Winner!
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Back to Raffles Link */}
          <div className="mt-10 text-center">
            <Link href="/raffles">
              <a className="inline-flex items-center text-primary hover:text-primary-dark transition-colors font-medium">
                <span>View All Raffles</span>
                <i className="ri-arrow-right-line ml-2"></i>
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* Winner Selection Modal */}
      <Dialog open={showWinnerSelection} onOpenChange={setShowWinnerSelection}>
        <DialogContent className="max-w-4xl">
          <WinnerSelectionWheel
            raffleId={raffle?.id || ''}
            raffleName={raffle?.name || ''}
            totalTickets={raffle?.ticketsSold || 0}
            onWinnerSelected={(winner) => {
              queryClient.invalidateQueries({ queryKey: [`/api/raffles/${id}`] });
              setTimeout(() => {
                setShowWinnerSelection(false);
              }, 3000);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Prize-specific tickets modal */}
      {selectedPrize && (
        <PrizeTicketsModal
          open={!!selectedPrize}
          onOpenChange={(open) => !open && setSelectedPrize(null)}
          raffleId={raffle?.id || ''}
          prizeAmount={selectedPrize.amount}
          prizeType={selectedPrize.type}
          prizeCount={selectedPrize.count}
        />
      )}

      {/* Instant Win Dialog */}
      <Dialog open={showWinDialog} onOpenChange={setShowWinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">🎉 Instant Winner!</DialogTitle>
            <DialogDescription className="text-center text-lg">
              Congratulations! You've won £{instantWinAmount} in store credit!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              onClick={() => setShowWinDialog(false)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Claim Prize
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}