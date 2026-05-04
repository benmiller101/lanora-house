import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// @ts-ignore
import confetti from "canvas-confetti";
import { Trophy, Users, Ticket } from "lucide-react";

interface WinnerSelectionWheelProps {
  raffleId: string;
  raffleName: string;
  totalTickets: number;
  onWinnerSelected: (winner: any) => void;
}

export default function WinnerSelectionWheel({
  raffleId,
  raffleName,
  totalTickets,
  onWinnerSelected,
}: WinnerSelectionWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [winner, setWinner] = useState<any | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [animatedNumber, setAnimatedNumber] = useState(1);

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const selectWinner = async () => {
    setIsSpinning(true);
    setHasSpun(true);

    // Animate through random numbers for dramatic effect
    let currentNum = 1;
    const animationDuration = 3000; // 3 seconds
    const intervalTime = 100; // Change number every 100ms
    
    const animationInterval = setInterval(() => {
      currentNum = Math.floor(Math.random() * totalTickets) + 1;
      setAnimatedNumber(currentNum);
    }, intervalTime);

    // Stop animation and select final winner after 3 seconds
    setTimeout(async () => {
      clearInterval(animationInterval);
      
      try {
        // Call API to select winner
        const response = await fetch(`/api/raffles/${raffleId}/select-winner`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to select winner');
        }

        const winnerData = await response.json();
        
        setSelectedNumber(winnerData.winningTicketNumber);
        setAnimatedNumber(winnerData.winningTicketNumber);
        setWinner(winnerData);
        setIsSpinning(false);
        
        // Trigger confetti celebration
        setTimeout(() => {
          triggerConfetti();
        }, 500);
        
        onWinnerSelected(winnerData);
        
      } catch (error) {
        console.error('Error selecting winner:', error);
        setIsSpinning(false);
      }
    }, animationDuration);
  };

  const formatWinnerName = (name: string) => {
    if (!name) return "Anonymous";
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
    }
    return parts[0];
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-primary/5 border-2 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary flex items-center justify-center">
            <Trophy className="mr-2 h-6 w-6" />
            Winner Selection
          </CardTitle>
          <p className="text-neutral-wood">
            {raffleName}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Spinning Number Display */}
          <div className="relative">
            <div className="w-48 h-48 mx-auto bg-white rounded-full border-8 border-primary flex items-center justify-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute inset-4 rounded-full border-2 border-primary/20"></div>
              <div className="absolute inset-8 rounded-full border border-primary/10"></div>
              
              {/* Number display */}
              <div 
                className={`text-6xl font-bold text-primary transition-all duration-200 ${
                  isSpinning ? 'animate-pulse scale-110' : 'scale-100'
                }`}
              >
                {animatedNumber}
              </div>
              
              {/* Spinning indicator */}
              {isSpinning && (
                <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
              )}
            </div>
            
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-primary"></div>
            </div>
          </div>

          {/* Raffle Stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white p-4 rounded-lg border border-primary/20">
              <div className="flex items-center justify-center mb-2">
                <Ticket className="h-5 w-5 text-primary mr-1" />
                <span className="font-medium text-primary">Total Tickets</span>
              </div>
              <div className="text-2xl font-bold text-neutral-900">
                {totalTickets}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-primary/20">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-primary mr-1" />
                <span className="font-medium text-primary">Participants</span>
              </div>
              <div className="text-2xl font-bold text-neutral-900">
                {Math.floor(totalTickets * 0.7)} {/* Estimate based on tickets */}
              </div>
            </div>
          </div>

          {/* Winner Information */}
          {winner && !isSpinning && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <h3 className="text-xl font-bold text-amber-800 mb-2">Congratulations!</h3>
              <div className="text-lg text-amber-700">
                <span className="font-semibold">{formatWinnerName(winner.winnerName || winner.firstName)}</span>
              </div>
              <div className="text-sm text-amber-600 mt-1">
                Winning Ticket: #{selectedNumber}
              </div>
            </div>
          )}

          {/* Action Button */}
          {!hasSpun ? (
            <div className="text-center">
              <Button
                onClick={selectWinner}
                disabled={isSpinning}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg"
              >
                {isSpinning ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Selecting Winner...
                  </>
                ) : (
                  <>
                    <Trophy className="mr-2 h-5 w-5" />
                    Select Winner
                  </>
                )}
              </Button>
            </div>
          ) : winner ? (
            <div className="text-center space-y-2">
              <div className="text-green-600 font-medium">
                Winner has been selected and notified!
              </div>
              <div className="text-sm text-neutral-600">
                The winner will be contacted via email with prize details.
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}