import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Shield, Lock } from 'lucide-react';

interface PaytriotPaymentFormProps {
  amount: number;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
  isLoading?: boolean;
}

export default function PaytriotPaymentForm({ 
  amount, 
  onPaymentSuccess, 
  onPaymentError, 
  isLoading = false 
}: PaytriotPaymentFormProps) {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (processing || isLoading) return;
    
    setProcessing(true);

    try {
      // Basic validation
      if (!cardData.cardNumber || !cardData.expiryMonth || !cardData.expiryYear || !cardData.cvv || !cardData.cardholderName) {
        throw new Error('Please fill in all card details');
      }

      // Format card number (remove spaces)
      const formattedCardNumber = cardData.cardNumber.replace(/\s/g, '');
      
      if (formattedCardNumber.length < 13 || formattedCardNumber.length > 19) {
        throw new Error('Please enter a valid card number');
      }

      if (cardData.cvv.length < 3 || cardData.cvv.length > 4) {
        throw new Error('Please enter a valid CVV');
      }

      console.log('💳 PAYTRIOT: Processing payment for £', amount);
      
      // TODO: Replace with actual Paytriot API integration
      // For now, simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      const mockPaymentId = `paytriot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      toast({
        title: "Payment Successful",
        description: `Payment of £${amount.toFixed(2)} processed successfully`,
      });
      
      onPaymentSuccess(mockPaymentId);
      
    } catch (error: any) {
      console.error('💳 PAYTRIOT ERROR:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Payment processing failed",
        variant: "destructive",
      });
      onPaymentError(error.message || "Payment processing failed");
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardData(prev => ({ ...prev, cardNumber: formatted }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Secure Payment with Paytriot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              placeholder="Enter cardholder name"
              value={cardData.cardholderName}
              onChange={(e) => setCardData(prev => ({ ...prev, cardholderName: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardData.cardNumber}
              onChange={handleCardNumberChange}
              maxLength={19}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="expiryMonth">Month</Label>
              <Select 
                value={cardData.expiryMonth} 
                onValueChange={(value) => setCardData(prev => ({ ...prev, expiryMonth: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                      {month.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="expiryYear">Year</Label>
              <Select 
                value={cardData.expiryYear} 
                onValueChange={(value) => setCardData(prev => ({ ...prev, expiryYear: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="YY" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                    <SelectItem key={year} value={year.toString().slice(-2)}>
                      {year.toString().slice(-2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                value={cardData.cvv}
                onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                maxLength={4}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Your payment is secured with 256-bit SSL encryption</span>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={processing || isLoading}
            size="lg"
          >
            {processing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing Payment...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Pay £{amount.toFixed(2)}
              </div>
            )}
          </Button>
        </form>

        <div className="mt-4 text-xs text-center text-muted-foreground">
          Payments processed securely by Paytriot • Supporting Prize Draws
        </div>
      </CardContent>
    </Card>
  );
}