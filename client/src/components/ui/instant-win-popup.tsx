import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Gift, X } from 'lucide-react';
import ConfettiCelebration from './confetti-celebration';
import { motion, AnimatePresence } from 'framer-motion';

interface InstantWinData {
  id: number;
  winner_name: string;
  prize_type: string;
  prize_amount: number;
  raffle_name: string;
}

interface InstantWinPopupProps {
  instantWin: InstantWinData | null;
  onClose: () => void;
  isCurrentUser?: boolean;
}

export default function InstantWinPopup({ 
  instantWin, 
  onClose, 
  isCurrentUser = false 
}: InstantWinPopupProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => {
    if (instantWin) {
      setShowConfetti(true);
      // Auto close after 5 seconds if not current user
      if (!isCurrentUser) {
        const timer = setTimeout(() => {
          onClose();
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [instantWin, isCurrentUser, onClose]);

  if (!instantWin) return null;

  const formatWinnerName = (name: string) => {
    if (isCurrentUser) return "You";
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
    }
    return parts[0];
  };

  return (
    <>
      <ConfettiCelebration trigger={showConfetti} duration={3000} />
      
      <AnimatePresence>
        {instantWin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotateY: 180 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25,
                duration: 0.6 
              }}
            >
              <Card className="w-full max-w-md p-6 bg-primary/5 border-2 border-primary shadow-2xl">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 h-8 w-8 p-0 hover:bg-primary/10"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  
                  <div className="text-center">
                    <motion.div
                      initial={{ rotate: -360, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                      className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4"
                    >
                      {instantWin.prize_type === 'cash' ? (
                        <Gift className="h-8 w-8 text-white" />
                      ) : (
                        <Star className="h-8 w-8 text-white" />
                      )}
                    </motion.div>
                    
                    <motion.h2 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="font-display text-2xl text-primary mb-2"
                    >
                      🎉 Instant Win! 🎉
                    </motion.h2>
                    
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="space-y-3"
                    >
                      <p className="text-lg font-semibold text-primary">
                        {formatWinnerName(instantWin.winner_name)} {isCurrentUser ? 'won' : 'just won'}
                      </p>
                      
                      <div className="flex items-center justify-center space-x-2">
                        <Badge className="bg-primary text-white text-lg px-4 py-2">
                          £{instantWin.prize_amount}
                        </Badge>
                        <span className="text-primary font-medium">
                          {instantWin.prize_type} prize
                        </span>
                      </div>
                      
                      <p className="text-sm text-primary/70">
                        from <span className="font-medium">{instantWin.raffle_name}</span>
                      </p>
                      
                      {isCurrentUser && (
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 1 }}
                          className="pt-4 border-t border-primary/20"
                        >
                          <p className="text-sm text-primary mb-3">
                            Congratulations! Check your Members Portal to claim your prize.
                          </p>
                          <Button 
                            className="w-full bg-primary hover:bg-primary/90"
                            onClick={onClose}
                          >
                            Go to Members Portal
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}