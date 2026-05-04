import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { FiUserCheck, FiAward, FiHash } from 'react-icons/fi';
import { Button } from '@/components/ui/button';

interface WinnerDisplayProps {
  winner: {
    id: string;
    name: string;
    ticketNumber?: number;
  };
  raffleName: string;
  showConfetti?: boolean;
}

export default function WinnerDisplay({ winner, raffleName, showConfetti = false }: WinnerDisplayProps) {
  useEffect(() => {
    if (showConfetti) {
      // Trigger confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Left side
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#2D317C', '#A6C1E4', '#ffffff']
        });
        
        // Right side
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#2D317C', '#A6C1E4', '#ffffff']
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [showConfetti]);

  return (
    <div className="bg-primary/5 border-2 border-primary/30 rounded-lg p-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full opacity-20 transform translate-x-8 -translate-y-8"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-secondary/20 rounded-full opacity-20 transform -translate-x-6 translate-y-6"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-center mb-4">
          <div className="bg-primary rounded-full p-3 mr-3">
            <FiAward className="text-white" size={24} />
          </div>
        </div>
        
        {/* Winner info */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <FiUserCheck className="text-primary" size={20} />
            <span className="font-semibold text-primary text-lg">
              {winner.name}
            </span>
          </div>
          
          {winner.ticketNumber && (
            <div className="flex items-center justify-center space-x-2">
              <FiHash className="text-primary" size={16} />
              <span className="text-primary text-sm">
                Winning Ticket: <span className="font-bold">#{winner.ticketNumber}</span>
              </span>
            </div>
          )}
          
          <div className="text-sm text-primary/80 mt-2">
            Congratulations on winning "{raffleName}"!
          </div>
        </div>
        
        {/* Celebration effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-2 left-2 text-2xl animate-bounce">✨</div>
            <div className="absolute top-4 right-4 text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎉</div>
            <div className="absolute bottom-4 left-4 text-2xl animate-bounce" style={{ animationDelay: '0.4s' }}>🏆</div>
            <div className="absolute bottom-2 right-2 text-2xl animate-bounce" style={{ animationDelay: '0.6s' }}>✨</div>
          </div>
        )}
      </div>
    </div>
  );
}