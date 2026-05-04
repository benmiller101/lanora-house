import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface KlarnaPaymentFormProps {
  cartItems: any[];
  shippingAddress: any;
  billingAddress: any;
  orderTotal: number;
  onSuccess: (result: any) => void;
  onError?: (error: any) => void;
}

declare global {
  interface Window {
    Klarna?: {
      Payments: {
        init: (config: { client_token: string }) => void;
        load: (config: { 
          container: string; 
          payment_method_category: string; 
        }, callback: (result: any) => void) => void;
        authorize: (
          config: { payment_method_category: string },
          data: any,
          callback: (result: any) => void
        ) => void;
      };
    };
    klarnaAsyncCallback?: () => void;
  }
}

const KlarnaPaymentForm: React.FC<KlarnaPaymentFormProps> = ({
  cartItems,
  shippingAddress,
  billingAddress,
  orderTotal,
  onSuccess,
  onError
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [clientToken, setClientToken] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Load Klarna SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://x.klarnacdn.net/kp/lib/v1/api.js';
    script.async = true;
    script.onload = () => {
      console.log('Klarna SDK loaded');
      initializeKlarnaSession();
    };
    script.onerror = () => {
      setError('Failed to load Klarna SDK');
      setIsLoading(false);
    };
    
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const initializeKlarnaSession = async () => {
    try {
      setIsLoading(true);
      
      // Create Klarna session
      const response = await fetch('/api/klarna/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          cartItems,
          shippingAddress,
          billingAddress
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle credentials error specifically
        if (errorData.needsCredentials) {
          throw new Error('Klarna setup required: Please configure your Klarna API credentials to enable payments');
        }
        
        throw new Error(errorData.error || 'Failed to create Klarna session');
      }

      const sessionData = await response.json();
      setClientToken(sessionData.client_token);
      setSessionId(sessionData.session_id);

      // Initialize Klarna SDK
      window.klarnaAsyncCallback = () => {
        try {
          if (window.Klarna?.Payments) {
            window.Klarna.Payments.init({
              client_token: sessionData.client_token
            });

            // Load payment widget
            window.Klarna.Payments.load({
              container: '#klarna-payments-container',
              payment_method_category: 'pay_later'
            }, (result) => {
              console.log('Klarna widget loaded:', result);
              if (result.show_form !== false) {
                setIsInitialized(true);
              } else {
                setError('Klarna payment not available');
              }
              setIsLoading(false);
            });
          }
        } catch (err) {
          console.error('Klarna initialization error:', err);
          setError('Failed to initialize Klarna');
          setIsLoading(false);
        }
      };

      // Trigger the callback if Klarna is already loaded
      if (window.Klarna?.Payments) {
        window.klarnaAsyncCallback();
      }

    } catch (err: any) {
      console.error('Klarna session creation error:', err);
      setError(err.message || 'Failed to initialize Klarna payment');
      setIsLoading(false);
      
      if (onError) {
        onError(err);
      }
    }
  };

  const handleAuthorize = async () => {
    if (!window.Klarna?.Payments || !clientToken) {
      setError('Klarna not initialized');
      return;
    }

    setIsProcessing(true);
    
    try {
      window.Klarna.Payments.authorize({
        payment_method_category: 'pay_later'
      }, {
        billing_address: {
          given_name: billingAddress.name?.split(' ')[0] || '',
          family_name: billingAddress.name?.split(' ').slice(1).join(' ') || '',
          email: billingAddress.email || '',
          street_address: `${billingAddress.address1} ${billingAddress.address2 || ''}`.trim(),
          postal_code: billingAddress.postcode || '',
          city: billingAddress.city || '',
          country: 'GB',
          phone: billingAddress.phone || ''
        }
      }, async (result) => {
        setIsProcessing(false);
        
        if (result.approved) {
          console.log('Klarna payment authorized:', result);
          
          toast({
            title: "Payment Authorized",
            description: "Your Klarna payment has been approved successfully!",
          });

          // Create the order
          try {
            const orderResponse = await fetch('/api/klarna/order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                authorization_token: result.authorization_token,
                order_data: {
                  purchase_country: 'GB',
                  purchase_currency: 'GBP',
                  locale: 'en-GB',
                  order_amount: Math.round(orderTotal * 100), // Convert to pence
                  order_lines: cartItems.map(item => ({
                    type: item.type === 'raffle_ticket' ? 'digital' : 'physical',
                    reference: item.productId?.toString() || item.raffleId?.toString() || item.id,
                    name: item.name,
                    quantity: item.quantity,
                    unit_price: Math.round(item.price * 100),
                    total_amount: Math.round(item.price * item.quantity * 100)
                  }))
                }
              })
            });

            if (orderResponse.ok) {
              const orderData = await orderResponse.json();
              onSuccess({
                authorization_token: result.authorization_token,
                order_id: orderData.order_id,
                payment_method: 'klarna'
              });
            } else {
              throw new Error('Failed to create Klarna order');
            }
          } catch (orderError) {
            console.error('Order creation error:', orderError);
            setError('Payment authorized but order creation failed');
          }
          
        } else if (result.error) {
          console.error('Klarna authorization error:', result.error);
          setError(result.error.invalid_fields ? 
            'Please check your information and try again' : 
            'Payment authorization failed'
          );
        } else {
          setError('Payment was not approved');
        }
      });
    } catch (err: any) {
      console.error('Authorization error:', err);
      setError('Failed to process payment');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-pink-600">
          <div className="animate-spin w-5 h-5 border-2 border-pink-600 border-t-transparent rounded-full"></div>
          <span>Loading Klarna payment options...</span>
        </div>
        <div className="text-sm text-gray-600">
          Please wait while we set up your payment options with Klarna.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>Klarna Payment Error</span>
        </div>
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
        <Button 
          onClick={initializeKlarnaSession}
          variant="outline"
          className="w-full"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isInitialized && (
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-pink-700 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Klarna Payment Ready</span>
          </div>
          <p className="text-sm text-pink-600">
            Pay in 3 installments or 30 days later with Klarna. No interest when you pay on time.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <span className="font-medium">Order Total:</span>
          <span className="text-xl font-bold">£{orderTotal.toFixed(2)}</span>
        </div>

        {/* Klarna Payment Widget Container */}
        <div 
          id="klarna-payments-container" 
          ref={containerRef}
          className="min-h-[200px] border border-gray-200 rounded-lg p-4"
        />

        {isInitialized && (
          <Button 
            onClick={handleAuthorize}
            disabled={isProcessing}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white"
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Processing Payment...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Complete Payment with Klarna
              </>
            )}
          </Button>
        )}

        <div className="text-xs text-gray-500 text-center">
          By continuing, you agree to Klarna's terms and conditions. 
          Your payment information is securely processed by Klarna.
        </div>
      </div>
    </div>
  );
};

export default KlarnaPaymentForm;