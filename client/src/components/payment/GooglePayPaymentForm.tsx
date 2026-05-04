import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface PaymentFormData {
  billingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  phone?: string;
}

interface GooglePayPaymentFormProps {
  orderId: number;
  paymentData: PaymentFormData;
  onSuccess: () => void;
}

declare global {
  interface Window {
    google?: {
      payments: {
        api: {
          PaymentsClient: new (environment: { environment: 'TEST' | 'PRODUCTION' }) => any;
        };
      };
    };
  }
}

export default function GooglePayPaymentForm({ orderId, paymentData, onSuccess }: GooglePayPaymentFormProps) {
  const [isGooglePayReady, setIsGooglePayReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentsClient, setPaymentsClient] = useState<any>(null);
  const [orderTotal, setOrderTotal] = useState<string>('0.00');
  const { toast } = useToast();

  useEffect(() => {
    // Load Google Pay API
    const loadGooglePayAPI = () => {
      const script = document.createElement('script');
      script.src = 'https://pay.google.com/gp/p/js/pay.js';
      script.onload = initializeGooglePay;
      document.head.appendChild(script);
    };

    // Fetch order total
    const fetchOrderTotal = async () => {
      try {
        const response = await apiRequest('GET', `/api/orders/${orderId}`);
        const order = await response.json();
        setOrderTotal(order.total || '0.00');
      } catch (error) {
        console.error('Error fetching order total:', error);
        toast({
          title: "Error",
          description: "Failed to load order details",
          variant: "destructive",
        });
      }
    };

    fetchOrderTotal();
    loadGooglePayAPI();
  }, [orderId, toast]);

  const initializeGooglePay = () => {
    if (!window.google?.payments?.api) {
      console.error('Google Pay API not loaded');
      return;
    }

    const client = new window.google.payments.api.PaymentsClient({
      environment: 'TEST' // Change to 'PRODUCTION' for live payments
    });

    setPaymentsClient(client);

    // Check if Google Pay is available
    const isReadyToPayRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['MASTERCARD', 'VISA']
        }
      }]
    };

    client.isReadyToPay(isReadyToPayRequest)
      .then((response: any) => {
        if (response.result) {
          setIsGooglePayReady(true);
        }
      })
      .catch((error: any) => {
        console.error('Error checking Google Pay availability:', error);
      });
  };

  const createPaymentRequest = () => {
    return {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['MASTERCARD', 'VISA'],
          billingAddressRequired: true,
          billingAddressParameters: {
            format: 'FULL'
          }
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: 'stripe',
            'stripe:version': '2023-10-16',
            'stripe:publishableKey': import.meta.env.VITE_STRIPE_PUBLIC_KEY
          }
        }
      }],
      merchantInfo: {
        merchantId: '12345678901234567890', // Replace with your Google Pay merchant ID
        merchantName: 'Lanora House'
      },
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: orderTotal,
        currencyCode: 'GBP',
        countryCode: 'GB'
      },
      shippingAddressRequired: false,
      callbackIntents: ['PAYMENT_AUTHORIZATION']
    };
  };

  const handleGooglePayPayment = async () => {
    if (!paymentsClient || !isGooglePayReady) {
      toast({
        title: "Google Pay Not Available",
        description: "Google Pay is not available on this device or browser",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const paymentRequest = createPaymentRequest();
      const paymentData = await paymentsClient.loadPaymentData(paymentRequest);
      
      // Process the payment with your backend
      const response = await apiRequest('POST', `/api/orders/${orderId}/process-googlepay`, {
        paymentToken: paymentData.paymentMethodData.tokenizationData.token,
        billingAddress: paymentData.paymentMethodData.info?.billingAddress,
        orderData: {
          billingAddress: paymentData.billingAddress,
          phone: paymentData.phone
        }
      });

      if (response.ok) {
        toast({
          title: "Payment Successful",
          description: "Your Google Pay payment has been processed successfully",
        });
        onSuccess();
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (error: any) {
      console.error('Google Pay payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your Google Pay payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isGooglePayReady) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-amber-600">
          <AlertCircle className="w-5 h-5" />
          <span>Checking Google Pay availability...</span>
        </div>
        <div className="text-sm text-gray-600">
          Google Pay is available on supported devices and browsers with saved payment methods.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-blue-700 mb-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Google Pay Ready</span>
        </div>
        <p className="text-sm text-blue-600">
          Pay securely with Google Pay using your saved payment methods. Your payment information is encrypted and protected.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <span className="font-medium">Order Total:</span>
          <span className="text-xl font-bold">£{orderTotal}</span>
        </div>

        <Button
          onClick={handleGooglePayPayment}
          disabled={isLoading || !isGooglePayReady}
          className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2">
                <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
              </svg>
              <span>Pay with Google Pay</span>
            </>
          )}
        </Button>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>• Secure payment processing through Google Pay</p>
        <p>• Your payment information is never shared with merchants</p>
        <p>• Instant payment confirmation</p>
      </div>
    </div>
  );
}