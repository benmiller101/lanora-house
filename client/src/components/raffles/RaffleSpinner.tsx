import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FiAward, FiPlay, FiPause, FiRotateCw } from 'react-icons/fi';
import confetti from 'canvas-confetti';

interface RaffleSpinnerProps {
  ticketNumbers: number[];
  winningNumber?: number;
  onDraw?: (number: number) => void;
  isAdmin?: boolean;
}

export default function RaffleSpinner({ 
  ticketNumbers, 
  winningNumber, 
  onDraw,
  isAdmin = false
}: RaffleSpinnerProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(winningNumber || null);
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Create audio elements when component mounts
  useEffect(() => {
    // We'll simulate the click sound with JavaScript if the audio file isn't available
    audioRef.current = null;
    
    // Create a simple audio context for generating click sounds
    const simulateClick = () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const audioCtx = new AudioContext();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          
          oscillator.type = 'sine';
          oscillator.frequency.value = 800;
          gainNode.gain.value = 0.1;
          
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
          oscillator.start();
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
          oscillator.stop(audioCtx.currentTime + 0.1);
        }
      } catch (error) {
        console.log('Audio simulation not supported');
      }
    };
    
    // Assign the click simulation function
    audioRef.current = { 
      play: simulateClick,
      pause: () => {},
      currentTime: 0
    } as any;
    
    return () => {
      audioRef.current = null;
    };
  }, []);
  
  // Effect to trigger confetti when a winner is selected
  useEffect(() => {
    if (selectedNumber && !isSpinning && selectedNumber === displayNumber) {
      triggerWinningAnimation();
    }
  }, [selectedNumber, isSpinning, displayNumber]);
  
  // Generate random numbers for display during spinning
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isSpinning) {
      // Play tick sound
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      }
      
      intervalId = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * ticketNumbers.length);
        const number = ticketNumbers[randomIndex] || Math.floor(Math.random() * 1000);
        setDisplayNumber(number);
        
        // Play tick sound
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(e => console.error("Error playing audio:", e));
        }
      }, 100);
    } else if (selectedNumber !== null) {
      setDisplayNumber(selectedNumber);
    }
    
    return () => {
      clearInterval(intervalId);
    };
  }, [isSpinning, ticketNumbers, selectedNumber]);
  
  // Function to handle the start of spinning
  const handleSpin = () => {
    setIsSpinning(true);
    setSelectedNumber(null);
    
    // Add spinning animation to the wheel
    if (wheelRef.current) {
      wheelRef.current.classList.add('animate-spin-slow');
    }
    
    // Automatically stop after a random time (3-8 seconds)
    const randomDuration = 3000 + Math.random() * 5000;
    setTimeout(() => {
      handleStopSpin();
    }, randomDuration);
  };
  
  // Function to handle stopping the spinner
  const handleStopSpin = () => {
    // Stop the wheel animation
    if (wheelRef.current) {
      wheelRef.current.classList.remove('animate-spin-slow');
    }
    
    // Get the winning number (either the provided one or a random one)
    const winner = winningNumber || 
      ticketNumbers[Math.floor(Math.random() * ticketNumbers.length)] || 
      Math.floor(Math.random() * 1000) + 1;
      
    setSelectedNumber(winner);
    setIsSpinning(false);
    
    // Call onDraw if it exists
    if (onDraw) {
      onDraw(winner);
    }
  };
  
  // Function for winning animation
  const triggerWinningAnimation = () => {
    if (!spinnerRef.current) return;
    
    // Get the position of the spinner for confetti origin
    const rect = spinnerRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    // Normalize to 0-1 for confetti
    const originX = x / window.innerWidth;
    const originY = y / window.innerHeight;
    
    // Trigger confetti
    confetti({
      origin: { x: originX, y: originY },
      spread: 70,
      particleCount: 100,
      gravity: 0.8,
      scalar: 1.2,
      shapes: ['circle', 'square'],
      colors: ['#FFD700', '#FFA500', '#FF4500', '#8A2BE2', '#4B0082'],
    });
  };
  
  // Calculate rotation for each ticket in the wheel
  const getWheelElements = () => {
    // Use a max of 12 segments for better display
    const maxSegments = 12;
    const displayedTickets = ticketNumbers.slice(0, maxSegments);
    
    return displayedTickets.map((number, index) => {
      const angle = (360 / displayedTickets.length) * index;
      const isWinning = number === winningNumber;
      
      return (
        <div
          key={`segment-${index}`}
          className={`absolute w-1 h-24 origin-bottom transform transition-colors ${
            isWinning ? 'bg-yellow-400' : 'bg-primary'
          }`}
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <div 
            className={`absolute top-2 w-10 h-10 -ml-5 rounded-full flex items-center justify-center text-white text-xs font-bold transform -rotate-${angle} ${
              isWinning ? 'bg-yellow-500' : 'bg-primary/90'
            }`}
          >
            {number}
          </div>
        </div>
      );
    });
  };
  
  return (
    <div className="flex flex-col items-center justify-center" ref={spinnerRef}>
      {/* Winning display box */}
      <div className="mb-8 flex flex-col items-center">
        <div className="text-neutral-wood mb-1 text-sm font-medium">
          {isSpinning ? "Selecting winner..." : selectedNumber ? "Winning number" : "Raffle ticket spinner"}
        </div>
        <div className="bg-white border-4 border-primary rounded-lg h-24 w-56 flex items-center justify-center relative overflow-hidden">
          {displayNumber !== null ? (
            <div className="text-5xl font-bold text-primary flex items-center gap-2">
              <span>#</span>
              <span className={isSpinning ? "animate-pulse" : ""}>
                {displayNumber}
              </span>
            </div>
          ) : (
            <div className="text-2xl text-neutral-wood/50">Click spin to draw</div>
          )}
          
          {/* Colored strips on edges for decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>
        </div>
      </div>
      
      {/* Spinning wheel */}
      <div className="relative w-64 h-64 mb-6">
        {/* Center point */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full z-20 border-4 border-white"></div>
        
        {/* Rotating wheel */}
        <div 
          ref={wheelRef}
          className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-primary overflow-hidden transition-transform duration-1000 ease-in-out"
        >
          {/* Wheel segments */}
          {getWheelElements()}
          
          {/* Indicator triangle */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0 
                         border-l-[12px] border-r-[12px] border-b-[20px] 
                         border-l-transparent border-r-transparent border-b-yellow-500 z-10"></div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="lg"
          className="border-primary text-primary hover:bg-primary/5"
          onClick={() => {
            setSelectedNumber(null);
            setDisplayNumber(null);
          }}
          disabled={isSpinning}
        >
          <FiRotateCw className="mr-2" />
          Reset
        </Button>
        
        <Button
          className="bg-primary hover:bg-primary-dark"
          size="lg"
          onClick={isSpinning ? handleStopSpin : handleSpin}
          disabled={!isAdmin && (!ticketNumbers.length || winningNumber !== undefined)}
        >
          {isSpinning ? (
            <>
              <FiPause className="mr-2" />
              Stop
            </>
          ) : (
            <>
              <FiPlay className="mr-2" />
              Spin
            </>
          )}
        </Button>
      </div>
      
      {/* Admin-only controls */}
      {isAdmin && (
        <div className="mt-6 text-sm text-neutral-wood/70 text-center">
          <p>Admin mode: You can control the raffle draw</p>
        </div>
      )}
    </div>
  );
}