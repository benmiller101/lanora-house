import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import SpinningWheel from '@/components/raffles/SpinningWheel';
import WinnerDisplay from '@/components/raffles/WinnerDisplay';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function RaffleCompletion() {
  const [, params] = useRoute('/raffle/:id/complete');
  const raffleId = params?.id;
  const [showWheel, setShowWheel] = useState(true);
  const [winner, setWinner] = useState<any>(null);

  // Fetch raffle data
  const { data: raffle, isLoading } = useQuery({
    queryKey: [`/api/raffles/${raffleId}`],
    enabled: !!raffleId
  });

  // Fetch raffle entries to get all tickets
  const { data: raffleEntries, isLoading: entriesLoading } = useQuery({
    queryKey: [`/api/raffles/${raffleId}/entries`],
    enabled: !!raffleId,
    queryFn: async () => {
      const response = await fetch(`/api/raffles/${raffleId}/entries`);
      if (!response.ok) throw new Error('Failed to fetch entries');
      return response.json();
    }
  });

  // Extract all ticket numbers from entries
  const allTickets = raffleEntries ? 
    raffleEntries.flatMap((entry: any) => {
      try {
        return Array.isArray(entry.ticket_numbers) ? entry.ticket_numbers : JSON.parse(entry.ticket_numbers || '[]');
      } catch {
        return [];
      }
    }).sort((a: number, b: number) => a - b) : 
    Array.from({ length: 20 }, (_, i) => i + 1); // fallback for demo

  const handleSpinComplete = (winningTicket: number) => {
    setTimeout(() => {
      setShowWheel(false);
      if (raffle?.winner) {
        setWinner(raffle.winner);
      }
    }, 2000);
  };

  if (isLoading || entriesLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse">Loading raffle completion...</div>
      </div>
    );
  }

  if (!raffle) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="font-display text-2xl mb-4">Raffle Not Found</h2>
        <Link href="/raffles">
          <Button>Back to Raffles</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Raffle Completion - {raffle.name} | LANORA HOUSE</title>
        <meta name="description" content={`Watch the live draw for ${raffle.name}`} />
      </Helmet>

      <section className="py-16 bg-primary/5 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link href={`/raffle/${raffleId}`} className="inline-flex items-center text-neutral-wood hover:text-primary transition-colors">
              <ArrowLeft size={16} className="mr-2" />
              Back to Raffle Details
            </Link>
          </div>

          <div className="max-w-4xl mx-auto">
            {showWheel ? (
              <SpinningWheel
                tickets={allTickets}
                winningTicket={raffle.winningTicketNumber || 42}
                onSpinComplete={handleSpinComplete}
                raffleName={raffle.name}
              />
            ) : (
              <div className="space-y-8">
                <div className="text-center">
                  <h1 className="font-display text-4xl mb-4">🎉 Draw Complete!</h1>
                  <p className="text-lg text-neutral-wood">
                    The winner has been selected for "{raffle.name}"
                  </p>
                </div>

                {winner && (
                  <WinnerDisplay 
                    winner={winner}
                    raffleName={raffle.name}
                    showConfetti={true}
                  />
                )}

                <div className="text-center space-y-4">
                  <div className="bg-white rounded-lg p-6 shadow-lg">
                    <h3 className="font-display text-xl mb-3">Raffle Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total Tickets:</span>
                        <div>{allTickets.length}</div>
                      </div>
                      <div>
                        <span className="font-medium">Winning Ticket:</span>
                        <div className="font-bold text-primary">#{raffle.winningTicketNumber}</div>
                      </div>
                      <div>
                        <span className="font-medium">Prize Value:</span>
                        <div>£{raffle.retailPrice}</div>
                      </div>
                      <div>
                        <span className="font-medium">Draw Date:</span>
                        <div>{new Date().toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>

                  <Link href="/raffles">
                    <Button size="lg">View More Raffles</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}