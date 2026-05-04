import { useState, useEffect } from "react";
import { useStripe, useElements, PaymentElement, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Load Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  catalogId: string;
  total: number;
  invoiceNumber: string;
}

function CheckoutForm({ catalogId, total, invoiceNumber, onSuccess }: { catalogId: string; total: number; invoiceNumber: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/members?payment=success`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Your invoice has been paid successfully!",
        });
        // Invalidate invoice query to refresh status
        queryClient.invalidateQueries({ queryKey: [`/api/auction/invoices/${catalogId}`] });
        queryClient.invalidateQueries({ queryKey: ['/api/auction/my-won-lots'] });
        onSuccess();
      }
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-primary/5 rounded-lg p-4 mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Invoice Number:</span>
          <span className="font-medium">{invoiceNumber}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
          <span>Total Amount:</span>
          <span className="text-primary">£{total.toFixed(2)}</span>
        </div>
      </div>

      <PaymentElement />

      <Button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full"
        data-testid="button-submit-payment"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay £{total.toFixed(2)}
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Payment securely processed by Stripe
      </p>
    </form>
  );
}

export function PaymentDialog({ open, onClose, catalogId, total, invoiceNumber }: PaymentDialogProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Create payment intent when dialog opens
  useEffect(() => {
    if (open && !clientSecret) {
      setIsLoadingIntent(true);
      setError(null);
      
      apiRequest("POST", `/api/auction/invoices/${catalogId}/payment-intent`)
        .then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Payment setup failed (${response.status})`);
          }
          return response.json();
        })
        .then(data => {
          if (!data.clientSecret) {
            throw new Error("Invalid payment response - missing client secret");
          }
          setClientSecret(data.clientSecret);
        })
        .catch((error: any) => {
          const errorMessage = error.message || "Could not initialize payment";
          setError(errorMessage);
          toast({
            title: "Payment Setup Failed",
            description: errorMessage,
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsLoadingIntent(false);
        });
    }

    // Reset state when dialog closes
    if (!open) {
      setClientSecret(null);
      setError(null);
    }
  }, [open, catalogId, clientSecret, toast]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-payment">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Pay Invoice
          </DialogTitle>
        </DialogHeader>

        {isLoadingIntent ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Setting up payment...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        ) : clientSecret ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#2D317C',
                },
              },
            }}
          >
            <CheckoutForm
              catalogId={catalogId}
              total={total}
              invoiceNumber={invoiceNumber}
              onSuccess={onClose}
            />
          </Elements>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
