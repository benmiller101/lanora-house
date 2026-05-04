import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiCelebrationProps {
  trigger: boolean;
  duration?: number;
  colors?: string[];
}

export default function ConfettiCelebration({ 
  trigger, 
  duration = 3000,
  colors = ['#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE', '#EDE9FE'] // Purple theme
}: ConfettiCelebrationProps) {
  
  useEffect(() => {
    if (!trigger) return;

    let animationEnd = Date.now() + duration;
    let defaults = { 
      startVelocity: 30, 
      spread: 360, 
      ticks: 60, 
      zIndex: 9999,
      colors: colors
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    let interval = setInterval(() => {
      let timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      let particleCount = 50 * (timeLeft / duration);
      
      // Left side burst
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      
      // Right side burst
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
      
      // Center burst for extra excitement
      if (Math.random() > 0.7) {
        confetti({
          ...defaults,
          particleCount: particleCount * 2,
          origin: { x: 0.5, y: 0.3 },
          spread: 120
        });
      }
    }, 250);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [trigger, duration, colors]);

  return null; // This component doesn't render anything visible
}