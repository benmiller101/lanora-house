import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface SpinningWheelProps {
  tickets: number[];
  winningTicket: number;
  onSpinComplete: (winner: number) => void;
  raffleName: string;
}

export default function SpinningWheel({ tickets, winningTicket, onSpinComplete, raffleName }: SpinningWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(tickets[0] || 1);
  const [hasSpun, setHasSpun] = useState(false);
  const [showWinner, setShowWinner] = useState(false);

  // Define wheel segments: 5 pink, 10 purple, 2 red, 6 blue, 1 green = 24 total
  const wheelSegments = [
    ...Array(5).fill('#ff69b4'), // pink
    ...Array(10).fill('#9932cc'), // purple
    ...Array(2).fill('#dc143c'), // red
    ...Array(6).fill('#1e90ff'), // blue
    ...Array(1).fill('#32cd32'), // green
  ];

  // Create SVG path for each segment
  const createSegmentPath = (index: number, total: number, radius: number) => {
    const anglePerSegment = (2 * Math.PI) / total;
    const startAngle = index * anglePerSegment - Math.PI / 2; // Start from top
    const endAngle = (index + 1) * anglePerSegment - Math.PI / 2;
    
    const centerX = radius;
    const centerY = radius;
    const innerRadius = 0; // Full pie slices from center
    
    const x1 = centerX + (radius - 8) * Math.cos(startAngle); // Subtract 8 for border
    const y1 = centerY + (radius - 8) * Math.sin(startAngle);
    const x2 = centerX + (radius - 8) * Math.cos(endAngle);
    const y2 = centerY + (radius - 8) * Math.sin(endAngle);
    
    const largeArcFlag = anglePerSegment > Math.PI ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius - 8} ${radius - 8} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const startSpin = () => {
    setIsSpinning(true);
    setHasSpun(true);
    
    // Simulate spinning through random tickets for 3 seconds
    const spinDuration = 3000;
    const intervalTime = 50;
    let elapsed = 0;
    
    const spinInterval = setInterval(() => {
      elapsed += intervalTime;
      
      // Random ticket selection during spin
      const randomIndex = Math.floor(Math.random() * tickets.length);
      setCurrentTicket(tickets[randomIndex]);
      
      // Slow down the spin as we approach the end
      if (elapsed >= spinDuration) {
        clearInterval(spinInterval);
        
        // Final reveal - show the winning ticket
        setTimeout(() => {
          setCurrentTicket(winningTicket);
          setIsSpinning(false);
          
          // Trigger confetti
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          
          setTimeout(() => {
            setShowWinner(true);
            onSpinComplete(winningTicket);
          }, 500);
        }, 200);
      }
    }, intervalTime);
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-8 bg-primary/5 rounded-lg">
      <h2 className="text-2xl font-display text-center mb-4">
        🎯 Raffle Draw: {raffleName}
      </h2>
      
      {/* Spinning Wheel Display */}
      <div className="relative">
        <div className={`
          w-48 h-48 rounded-full border-8 border-primary relative
          transform transition-transform duration-100
          ${isSpinning ? 'animate-spin' : ''}
        `}
        style={{
          background: `conic-gradient(
            #ff69b4 0deg 75deg,
            #9932cc 75deg 225deg,
            #dc143c 225deg 255deg,
            #1e90ff 255deg 345deg,
            #32cd32 345deg 360deg
          )`
        }}>
          
          {/* Ticket Number Display - Positioned over the wheel */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-white/90 rounded-full w-20 h-20 flex flex-col items-center justify-center border-2 border-primary">
              <div className="text-xs text-primary font-medium uppercase tracking-wide">
                #
              </div>
              <div className="text-xl font-bold text-primary">
                {currentTicket}
              </div>
            </div>
          </div>
        </div>
        
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500"></div>
        </div>
      </div>

      {/* Tickets Display */}
      <div className="text-center">
        <div className="text-sm text-neutral-wood mb-2">
          Total Tickets: {tickets.length}
        </div>
        <div className="flex flex-wrap gap-1 justify-center max-w-md">
          {tickets.slice(0, 20).map((ticket) => (
            <span 
              key={ticket}
              className={`
                px-2 py-1 rounded text-xs font-medium
                ${ticket === currentTicket && hasSpun ? 
                  'bg-primary text-primary-foreground' : 
                  'bg-neutral-paper text-neutral-wood border'
                }
              `}
            >
              {ticket}
            </span>
          ))}
          {tickets.length > 20 && (
            <span className="px-2 py-1 rounded text-xs text-neutral-wood">
              +{tickets.length - 20} more
            </span>
          )}
        </div>
      </div>

      {/* Spin Button */}
      {!hasSpun && (
        <Button 
          onClick={startSpin}
          className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg font-semibold"
          size="lg"
        >
          🎰 Start Draw!
        </Button>
      )}

      {/* Spinning Status */}
      {isSpinning && (
        <div className="text-center">
          <div className="text-lg font-semibold text-primary animate-pulse">
            🎯 Drawing Winner...
          </div>
          <div className="text-sm text-neutral-wood">
            Selecting from {tickets.length} tickets
          </div>
        </div>
      )}

      {/* Winner Announcement */}
      {showWinner && !isSpinning && (
        <div className="text-center space-y-3 animate-bounce">
          <div className="text-2xl font-bold text-primary">
            🏆 WINNER!
          </div>
          <div className="text-lg text-primary">
            Ticket #{winningTicket}
          </div>
          <div className="text-sm text-neutral-wood">
            Congratulations to the winner!
          </div>
        </div>
      )}
    </div>
  );
}