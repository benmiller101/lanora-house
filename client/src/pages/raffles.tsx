import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Raffle } from "@/lib/types";
import SEOHead from "@/components/SEOHead";
import { Countdown } from "@/components/ui/countdown";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import Newsletter from "@/components/home/Newsletter";
import PrizeDrawCard from "@/components/raffles/RaffleCard";
import WinnersFeed from "@/components/raffles/WinnersFeed";
import InstantWinPopup from "@/components/ui/instant-win-popup";

export default function Raffles() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("current");
  const [lastInstantWinCheck, setLastInstantWinCheck] = useState<string>(new Date().toISOString());
  const [instantWinPopup, setInstantWinPopup] = useState<any>(null);
  
  // Get current prize draws (active and upcoming)
  const { data: currentRaffles, isLoading: isLoadingCurrent } = useQuery({ 
    queryKey: ['/api/raffles'],
    queryFn: async () => {
      const res = await fetch('/api/raffles');
      if (!res.ok) throw new Error('Failed to fetch current prize draws');
      return res.json() as Promise<Raffle[]>;
    }
  });
  
  // Get past prize draws (completed/ended)
  const { data: pastRaffles, isLoading: isLoadingPast } = useQuery({ 
    queryKey: ['/api/raffles/past'],
    queryFn: async () => {
      const res = await fetch('/api/raffles/past');
      if (!res.ok) throw new Error('Failed to fetch past prize draws');
      return res.json() as Promise<Raffle[]>;
    },
    enabled: activeTab === "old"
  });
  
  // Check for recent instant wins every 10 seconds for confetti popups
  useQuery({
    queryKey: ['/api/winners-feed/recent-instant', lastInstantWinCheck],
    queryFn: async () => {
      const res = await fetch(`/api/winners-feed/recent-instant?since=${lastInstantWinCheck}`);
      if (!res.ok) throw new Error('Failed to fetch recent instant wins');
      return res.json();
    },
    refetchInterval: 10000, // Check every 10 seconds
    onSuccess: (data) => {
      if (data.instantWins && data.instantWins.length > 0) {
        // Show popup for most recent instant win
        const mostRecent = data.instantWins[0];
        setInstantWinPopup(mostRecent);
        setLastInstantWinCheck(new Date().toISOString());
      }
    }
  });

  // We no longer use upcoming prize draws - only active and past
  // All prize draws are either active or ended

  return (
    <>
      <SEOHead
        title="Prize Draws - Win Extraordinary Antiques"
        description="Enter our exclusive prize draws for a chance to win extraordinary antiques at a fraction of their value. Browse current draws, past winners, and upcoming prizes."
        path="/raffles"
      />
      
      {/* Prize Draws Section with Tabs */}
      <section className="py-16 bg-neutral-paper">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl md:text-5xl mb-4 text-primary">Our Prize Draws</h1>
            <p className="text-lg md:text-xl text-neutral-wood max-w-2xl mx-auto">
              Ready to test your luck? Jump in for a chance to win big and have some fun along the way!
            </p>
          </div>
          
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="current">Current Prize Draws</TabsTrigger>
              <TabsTrigger value="old">Past Winners</TabsTrigger>
            </TabsList>
            
            {/* Current Prize Draws Tab */}
            <TabsContent value="current" className="space-y-8">
              {isLoadingCurrent ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {Array(3).fill(0).map((_, index) => (
                    <div key={index} className="bg-neutral-ivory rounded-xl shadow-lg overflow-hidden animate-pulse">
                      <div className="h-[400px] bg-neutral-paper"></div>
                    </div>
                  ))}
                </div>
              ) : currentRaffles && currentRaffles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {currentRaffles.map((raffle) => (
                    <PrizeDrawCard key={raffle.id} raffle={raffle} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <i className="ri-ticket-2-line text-4xl text-secondary mb-3"></i>
                  <h3 className="font-display text-xl mb-2 text-primary">No Current Prize Draws</h3>
                  <p className="text-neutral-wood mb-4">Check back soon for new opportunities to win big!</p>
                </div>
              )}
            </TabsContent>
            
            {/* Past Prize Draws Tab */}
            <TabsContent value="old" className="space-y-8">
              {isLoadingPast ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {Array(3).fill(0).map((_, index) => (
                    <div key={index} className="bg-neutral-ivory rounded-xl shadow-lg overflow-hidden animate-pulse">
                      <div className="h-[400px] bg-neutral-paper"></div>
                    </div>
                  ))}
                </div>
              ) : pastRaffles && pastRaffles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pastRaffles.map((raffle) => (
                    <PrizeDrawCard key={raffle.id} raffle={raffle} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <i className="ri-trophy-line text-4xl text-secondary mb-3"></i>
                  <h3 className="font-display text-xl mb-2 text-primary">No Past Prize Draws</h3>
                  <p className="text-neutral-wood mb-4">Past prize draws and winners will appear here.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* Winners Feed - Full Width Section */}
      <section className="py-16 bg-neutral-ivory">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl mb-4 text-primary">Recent Winners</h2>
            <p className="text-lg text-neutral-wood max-w-2xl mx-auto">
              See who's been getting lucky lately! Maybe you'll be next on this list.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <WinnersFeed />
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl mb-3">How Our Prize Draws Work</h2>
            <p className="text-neutral-wood opacity-70 max-w-2xl mx-auto">
              Our transparent prize draw system is designed to be fair and accessible to all.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-accent border border-secondary/20 p-8 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
                <i className="ri-ticket-2-line text-2xl text-primary-foreground"></i>
              </div>
              <h3 className="font-display text-xl mb-2 text-primary">1. Purchase Tickets</h3>
              <p className="text-neutral-wood">
                Select the number of tickets you wish to purchase for any active prize draw. More tickets increase your chances of winning.
              </p>
            </div>
            
            <div className="bg-accent border border-secondary/20 p-8 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
                <i className="ri-timer-line text-2xl text-primary-foreground"></i>
              </div>
              <h3 className="font-display text-xl mb-2 text-primary">2. Wait for the Draw</h3>
              <p className="text-neutral-wood">
                Each prize draw has a set end date. When the countdown reaches zero, our system automatically selects a random winner.
              </p>
            </div>
            
            <div className="bg-accent border border-secondary/20 p-8 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
                <i className="ri-trophy-line text-2xl text-primary-foreground"></i>
              </div>
              <h3 className="font-display text-xl mb-2 text-primary">3. Claim Your Prize</h3>
              <p className="text-neutral-wood">
                If you win, you'll be notified immediately. We'll arrange delivery of your prize to your location.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Instant Win Popup */}
      <InstantWinPopup 
        instantWin={instantWinPopup}
        onClose={() => setInstantWinPopup(null)}
        isCurrentUser={false}
      />
      
      {/* Prize Draw FAQs */}
      <section className="py-16 bg-neutral-ivory">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl mb-3">Frequently Asked Questions</h2>
            <p className="text-neutral-wood opacity-70 max-w-2xl mx-auto">
              Learn more about our prize draw system and how it works.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
              <h3 className="font-display text-xl mb-2">How are winners selected?</h3>
              <p className="text-neutral-wood opacity-80">
                Winners are selected using a cryptographically secure random number generator. Each ticket purchased is assigned a unique sequential number, and one of these numbers is randomly selected when the prize draw ends.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
              <h3 className="font-display text-xl mb-2">What happens if I win?</h3>
              <p className="text-neutral-wood opacity-80">
                If you win, you'll be notified immediately via email and through your account dashboard. We'll arrange delivery of your prize at no additional cost. International winners may be responsible for import duties.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
              <h3 className="font-display text-xl mb-2">Can I purchase multiple tickets?</h3>
              <p className="text-neutral-wood opacity-80">
                Yes, you can purchase multiple tickets for any prize draw to increase your chances of winning. We offer discounts when purchasing tickets in bulk (e.g., 3 or 5 tickets at once).
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
              <h3 className="font-display text-xl mb-2">What if not all tickets are sold?</h3>
              <p className="text-neutral-wood opacity-80">
                Our prize draws proceed regardless of the number of tickets sold. This means your odds of winning may actually improve if a prize draw has fewer participants. The stated maximum number of tickets is never exceeded.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
              <h3 className="font-display text-xl mb-2">Are prize draw entries refundable?</h3>
              <p className="text-neutral-wood opacity-80">
                Prize draw entries are non-refundable once purchased. By participating, you agree to these terms and understand that prize draws are a form of entertainment with no guaranteed outcome.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-display text-xl mb-2">Can I enter for free?</h3>
              <p className="text-neutral-wood opacity-80 mb-4">
                Yes! Free postal entry is available for all competitions. To enter for free, send a postcard with your full name, address, telephone number, email address, chosen competition, and your answer (if applicable).
              </p>
              <div className="bg-neutral-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">Post to:</h4>
                <p className="text-neutral-wood">
                  Lanora House<br/>
                  Lanarth House, Penpol Avenue, Hayle
                </p>
              </div>
              <div className="text-sm text-neutral-wood opacity-70">
                <strong>Postal Entry Conditions:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>A separate, individually posted postcard is required for each free entry</li>
                  <li>Bulk entries will be treated as a single entry</li>
                  <li>Postal entries must arrive before the advertised closing date</li>
                  <li>A registered online account is required for processing free entries. Your postal entry must match your account details</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletter */}
      <Newsletter />
    </>
  );
}
