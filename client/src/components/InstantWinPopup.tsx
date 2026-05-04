import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// @ts-ignore
import confetti from 'canvas-confetti';

interface InstantWin {
  id: number;
  raffleId: number;
  prize: string;
  prizeType: string;
  amount: number;
}

interface InstantWinPopupProps {
  isOpen: boolean;
  onClose: () => void;
  instantWins: InstantWin[];
}

const InstantWinPopup = ({ isOpen, onClose, instantWins }: InstantWinPopupProps) => {
  const [email, setEmail] = useState('');
  const [currentWinIndex, setCurrentWinIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSkipConfirmation, setShowSkipConfirmation] = useState(false);
  const { toast } = useToast();

  // Trigger confetti animation when popup opens
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2D317C', '#A6C1E4', '#ffffff']
    });
  };

  // Trigger confetti when popup opens
  if (isOpen && instantWins.length > 0) {
    setTimeout(triggerConfetti, 300);
  }

  const claimMutation = useMutation({
    mutationFn: async (data: { instantWinId: number; email: string }) => {
      const response = await fetch('/api/instant-win/claim', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' as RequestCredentials
      });
      
      if (!response.ok) {
        throw new Error('Failed to claim instant win');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Prize Claimed!",
        description: "Your instant win has been claimed successfully. We'll contact you soon!",
      });
      
      // Show next instant win or close popup
      if (currentWinIndex < instantWins.length - 1) {
        setCurrentWinIndex(currentWinIndex + 1);
        setEmail('');
        triggerConfetti();
      } else {
        handleClose();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Claim Failed",
        description: error.message || "Failed to claim your prize. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to claim your prize.",
        variant: "destructive"
      });
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await claimMutation.mutateAsync({
        instantWinId: currentWin.id,
        email: email.trim()
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setCurrentWinIndex(0);
    setShowSkipConfirmation(false);
    onClose();
  };

  const handleSkipClick = () => {
    setShowSkipConfirmation(true);
  };

  const handleConfirmSkip = () => {
    setShowSkipConfirmation(false);
    handleClose();
  };

  if (!instantWins || instantWins.length === 0) {
    return null;
  }

  const currentWin = instantWins[currentWinIndex];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md mx-auto bg-primary/5 border-2 border-primary/20">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🎉</span>
          </div>
          <DialogTitle className="text-3xl font-bold text-primary">
            INSTANT WIN!
          </DialogTitle>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-neutral-wood">
              Congratulations!
            </p>
            <p className="text-lg text-neutral-wood">
              You've won: <span className="font-bold text-primary">{currentWin.prize}</span>
            </p>
            {instantWins.length > 1 && (
              <p className="text-sm text-neutral-wood/70">
                Prize {currentWinIndex + 1} of {instantWins.length}
              </p>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-neutral-wood font-medium">
              Enter your email to claim your prize:
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="border-primary/30 focus:border-primary"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkipClick}
              className="flex-1"
            >
              Skip
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? "Claiming..." : "Claim Prize"}
            </Button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-xs text-neutral-wood/60">
            We'll contact you within 24 hours to arrange your prize delivery.
          </p>
        </div>
      </DialogContent>

      {/* Skip Confirmation Dialog */}
      <AlertDialog open={showSkipConfirmation} onOpenChange={setShowSkipConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Skip Prize Claiming?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to skip claiming your instant win prize? 
              You won't be able to claim it later once you close this window.
              {instantWins.length > 1 && (
                <div className="mt-2 font-medium">
                  You have {instantWins.length} prizes total worth £{instantWins.reduce((sum, win) => sum + win.amount, 0)}.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Keep Claiming
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSkip}
              className="bg-destructive hover:bg-destructive/90"
            >
              Yes, Skip All Prizes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default InstantWinPopup;