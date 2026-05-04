import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// Stripe removed - using Paytriot for raffle support
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Helmet } from 'react-helmet';
import { apiRequest } from '@/lib/queryClient';
import { 
  CreditCard, 
  Shield, 
  Package, 
  MapPin, 
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
// Stripe PaymentRequest removed
import GooglePayPaymentForm from '@/components/payment/GooglePayPaymentForm';
import KlarnaPaymentForm from '@/components/payment/KlarnaPaymentForm';
import PayPalButton from '@/components/PayPalButton';

// Initialize Stripe
// Paytriot integration will be added here

// Form schemas
const shippingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'County/State is required'),
  postcode: z.string().min(1, 'Postcode is required'),
  country: z.string().min(1, 'Country is required'),
});

const paymentSchema = z.object({
  shipping: shippingSchema,
  billing: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postcode: z.string().optional(),
    country: z.string().optional(),
  }),
  sameAsBilling: z.boolean(),
  shippingMethod: z.string().min(1, 'Please select a shipping method'),
}).superRefine((data, ctx) => {
  // Only validate billing if not same as shipping
  if (!data.sameAsBilling) {
    const billingValidation = shippingSchema.safeParse(data.billing);
    if (!billingValidation.success) {
      billingValidation.error.issues.forEach((issue) => {
        ctx.addIssue({
          ...issue,
          path: ['billing', ...issue.path],
        });
      });
    }
  }
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface OrderItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  type: string;
  productId?: number;
}

interface Order {
  id: number;
  subtotal: string;
  shipping?: string;
  tax?: string;
  total?: string;
  status: string;
  paymentStatus: string;
  items: OrderItem[];
}

// Payment form component
function OrderPaymentForm({ 
  clientSecret, 
  orderId,
  onSuccess 
}: { 
  clientSecret: string; 
  orderId: number;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation?orderId=${orderId}`,
        },
        redirect: 'if_required'
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message || "An error occurred during payment",
          variant: "destructive",
        });
      } else {
        // Confirm the payment on our backend
        await fetch('/api/order-payment/confirm-order-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            paymentIntentId: clientSecret.split('_secret_')[0],
            orderId
          }),
        });

        toast({
          title: "Payment Successful!",
          description: "Your order payment has been processed successfully",
        });
        onSuccess();
      }
    } catch (err) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            Processing Payment...
          </>
        ) : (
          <>
            <Shield className="w-4 h-4 mr-2" />
            Complete Order Payment
          </>
        )}
      </Button>
    </form>
  );
}

// PayPal payment component using new SDK
function PayPalPaymentFormNew({ orderId, paymentData, onSuccess }: {
  orderId: number;
  paymentData: PaymentFormData;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const order = paymentData; // Get order details from payment data

  // Calculate total amount
  const total = 100; // This should be calculated from order total

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium">
            PayPal
          </div>
          <div className="text-sm text-gray-600">
            Pay safely with your PayPal account
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6 flex justify-center">
        <PayPalButton 
          amount={total.toString()}
          currency="GBP"
          intent="CAPTURE"
        />
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        Click the PayPal button above to complete your payment securely
      </div>
    </div>
  );
}

// Apple Pay Payment Form Component
function ApplePayPaymentForm({ orderId, paymentData, onSuccess }: {
  orderId: number;
  paymentData: PaymentFormData;
  onSuccess: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [canMakePayment, setCanMakePayment] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkApplePayAvailability = async () => {
      const stripe = await stripePromise;
      if (!stripe) return;

      const paymentRequest = stripe.paymentRequest({
        country: 'GB',
        currency: 'gbp',
        total: {
          label: 'Lanora House',
          amount: Math.round(100 * 100), // £100 in pence
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      const result = await paymentRequest.canMakePayment();
      setCanMakePayment(!!result);
    };

    checkApplePayAvailability();
  }, []);

  const handleApplePayPayment = async () => {
    setIsLoading(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      // Create payment intent on server
      const response = await fetch('/api/order-payment/create-order-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          orderId,
          paymentMethod: 'stripe',
          paymentData
        }),
      });

      const { clientSecret } = await response.json();

      const paymentRequest = stripe.paymentRequest({
        country: 'GB',
        currency: 'gbp',
        total: {
          label: 'Lanora House',
          amount: Math.round(100 * 100), // Amount in pence
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: paymentRequest,
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Confirm payment on server
      await fetch('/api/order-payment/confirm-order-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          orderId,
          paymentIntentId: clientSecret.split('_secret_')[0],
          paymentData
        }),
      });

      toast({
        title: "Payment Successful",
        description: "Your payment has been processed with Apple Pay.",
      });

      onSuccess();
    } catch (error: any) {
      console.error('Apple Pay payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your Apple Pay payment.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!canMakePayment) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border text-center">
        <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-400">
            <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Apple Pay Not Available</h3>
        <p className="text-gray-600">
          Apple Pay is not available on this device or browser. Please use a different payment method.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white">
              <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Pay with Apple Pay</h3>
            <p className="text-sm text-gray-600">Fast, secure, and private.</p>
          </div>
        </div>
      </div>

      <Button
        onClick={handleApplePayPayment}
        disabled={isLoading}
        className="w-full bg-black hover:bg-gray-800 text-white py-3 h-auto"
        size="lg"
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            <span>Processing...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <span>Pay</span>
          </div>
        )}
      </Button>

      <div className="text-xs text-gray-500 text-center">
        Secured by Apple Pay and Stripe
      </div>
    </div>
  );
}

function PayPalPaymentForm({ 
  orderId,
  paymentData,
  onSuccess 
}: { 
  orderId: number;
  paymentData: PaymentFormData;
  onSuccess: () => void;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const createPayPalOrderMutation = useMutation({
    mutationFn: async () => {
      const billingAddress = paymentData.sameAsBilling ? paymentData.shipping : paymentData.billing;
      
      return apiRequest('POST', '/api/order-payment/create-paypal-order', {
        orderId,
        shippingAddress: paymentData.shipping,
        billingAddress,
        shippingMethod: paymentData.shippingMethod,
      });
    },
    onSuccess: (data) => {
      // Redirect to PayPal approval URL
      window.location.href = data.approvalUrl;
    },
    onError: (error: any) => {
      toast({
        title: "PayPal Error",
        description: error.message || "Failed to create PayPal order",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  });

  const handlePayPalPayment = () => {
    setIsProcessing(true);
    createPayPalOrderMutation.mutate();
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium">
            PayPal
          </div>
          <div className="text-sm text-gray-600">
            Pay safely with your PayPal account
          </div>
        </div>
      </div>
      
      <Button 
        onClick={handlePayPalPayment}
        disabled={isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-700"
        size="lg"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            Creating PayPal Order...
          </>
        ) : (
          <>
            <Shield className="mr-2 h-4 w-4" />
            Pay with PayPal
          </>
        )}
      </Button>
      
      <div className="text-xs text-gray-500 text-center">
        You'll be redirected to PayPal to complete your payment securely
      </div>
    </div>
  );
}

export default function OrderPayment() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [clientSecret, setClientSecret] = useState<string>('');

  // Get order ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');
  
  // Check for PayPal return parameters
  const paypalToken = urlParams.get('token');
  const paypalPayerId = urlParams.get('PayerID');
  
  // Handle PayPal return
  useEffect(() => {
    if (paypalToken && paypalPayerId && orderId) {
      handlePayPalReturn(paypalToken, orderId);
    }
  }, [paypalToken, paypalPayerId, orderId]);

  const handlePayPalReturn = async (token: string, orderIdStr: string) => {
    try {
      const response = await fetch('/api/order-payment/capture-paypal-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          paypalOrderId: token,
          dbOrderId: orderIdStr,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Payment Successful!",
          description: "Your PayPal payment has been processed successfully",
        });
        // Redirect to order confirmation
        window.location.href = `/order-confirmation?orderId=${orderIdStr}`;
      } else {
        toast({
          title: "Payment Failed",
          description: result.error || "PayPal payment could not be processed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An error occurred while processing your PayPal payment",
        variant: "destructive",
      });
    }
  };
  
  // Debug logging
  console.log('Current location:', location);
  console.log('Window location:', window.location.href);
  console.log('URL params:', urlParams.toString());
  console.log('Order ID:', orderId);

  // Get order details
  const { data: order, isLoading: orderLoading, error: orderError } = useQuery<Order>({
    queryKey: [`/api/order-payment/order/${orderId}`],
    enabled: !!orderId && isAuthenticated,
  });

  // Form setup
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      shipping: {
        name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
        email: user?.email || '',
        phone: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        postcode: '',
        country: 'United Kingdom',
      },
      billing: {
        name: '',
        email: '',
        phone: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        postcode: '',
        country: 'United Kingdom',
      },
      sameAsBilling: true,
      shippingMethod: 'DPD 2-3 Day Service',
    },
  });

  const watchShipping = form.watch('shipping');
  const watchSameAsBilling = form.watch('sameAsBilling');

  // Create payment intent for order
  const createOrderPaymentMutation = useMutation({
    mutationFn: async (paymentData: PaymentFormData) => {
      const response = await fetch('/api/order-payment/create-order-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          orderId: parseInt(orderId!),
          shippingAddress: paymentData.shipping,
          billingAddress: paymentData.sameAsBilling ? paymentData.shipping : paymentData.billing,
          shippingMethod: paymentData.shippingMethod,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Payment mutation success:', data);
      setClientSecret(data.clientSecret);
      setCurrentStep(2);
      toast({
        title: "Payment Setup Complete",
        description: "Please complete your payment below.",
      });
    },
    onError: (error) => {
      console.log('Payment mutation error:', error);
      toast({
        title: "Payment Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Copy shipping to billing when checkbox is checked
  useEffect(() => {
    if (watchSameAsBilling) {
      console.log('Copying shipping to billing:', watchShipping);
      form.setValue('billing', {
        name: watchShipping.name,
        email: watchShipping.email,
        phone: watchShipping.phone,
        address1: watchShipping.address1,
        address2: watchShipping.address2,
        city: watchShipping.city,
        state: watchShipping.state,
        postcode: watchShipping.postcode,
        country: watchShipping.country,
      });
    }
  }, [watchSameAsBilling, watchShipping, form]);

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Invalid Order</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">No order ID provided. Please select an order to pay for.</p>
            <Link href="/members">
              <Button className="w-full">View My Orders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Please sign in to pay for your order.</p>
            <Link href="/login">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (orderLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (orderError || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Order Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Unable to load order details. Please try again.</p>
            <Link href="/members">
              <Button className="w-full">View My Orders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subtotal = parseFloat(order.subtotal);

  const onSubmit = (data: PaymentFormData) => {
    console.log('Form submitted with data:', data);
    console.log('Current step:', currentStep);
    console.log('Form errors:', form.formState.errors);
    
    // If "same as billing" is checked, copy shipping to billing
    if (data.sameAsBilling) {
      data.billing = { ...data.shipping };
    }
    
    if (currentStep === 1) {
      console.log('Triggering payment mutation...');
      createOrderPaymentMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{`Pay for Order #${order.id} | Lanora House`}</title>
        <meta name="description" content="Complete payment for your accepted order securely." />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/members">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Orders
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">Pay for Order #{order.id}</h1>
          
          {/* Progress indicator */}
          <div className="flex items-center mt-4 space-x-4">
            {[1, 2].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {step === 1 && 'Shipping Details'}
                  {step === 2 && 'Payment'}
                </span>
                {step < 2 && <div className="w-12 h-px bg-gray-300 ml-4" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main payment form */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Shipping Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          {...form.register('shipping.name')}
                          className={form.formState.errors.shipping?.name ? 'border-red-500' : ''}
                        />
                        {form.formState.errors.shipping?.name && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.shipping.name.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...form.register('shipping.email')}
                          className={form.formState.errors.shipping?.email ? 'border-red-500' : ''}
                        />
                        {form.formState.errors.shipping?.email && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.shipping.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address1">Address Line 1 *</Label>
                      <Input
                        id="address1"
                        {...form.register('shipping.address1')}
                        className={form.formState.errors.shipping?.address1 ? 'border-red-500' : ''}
                      />
                    </div>

                    <div>
                      <Label htmlFor="address2">Address Line 2</Label>
                      <Input
                        id="address2"
                        {...form.register('shipping.address2')}
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          {...form.register('shipping.city')}
                          className={form.formState.errors.shipping?.city ? 'border-red-500' : ''}
                        />
                      </div>

                      <div>
                        <Label htmlFor="state">County/State *</Label>
                        <Input
                          id="state"
                          {...form.register('shipping.state')}
                          className={form.formState.errors.shipping?.state ? 'border-red-500' : ''}
                        />
                      </div>

                      <div>
                        <Label htmlFor="postcode">Postcode *</Label>
                        <Input
                          id="postcode"
                          {...form.register('shipping.postcode')}
                          className={form.formState.errors.shipping?.postcode ? 'border-red-500' : ''}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Select
                        value={form.watch('shipping.country')}
                        onValueChange={(value) => form.setValue('shipping.country', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          <SelectItem value="Ireland">Ireland</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                          <SelectItem value="Germany">Germany</SelectItem>
                          <SelectItem value="Netherlands">Netherlands</SelectItem>
                          <SelectItem value="United States">United States</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="Australia">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Billing Address Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Billing Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="sameAsBilling"
                        {...form.register('sameAsBilling')}
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <Label htmlFor="sameAsBilling" className="text-sm font-medium">
                        Same as shipping address
                      </Label>
                    </div>

                    {!watchSameAsBilling && (
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="billing-name">Full Name *</Label>
                            <Input
                              id="billing-name"
                              {...form.register('billing.name')}
                              className={form.formState.errors.billing?.name ? 'border-red-500' : ''}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="billing-email">Email Address *</Label>
                            <Input
                              id="billing-email"
                              type="email"
                              {...form.register('billing.email')}
                              className={form.formState.errors.billing?.email ? 'border-red-500' : ''}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="billing-address1">Address Line 1 *</Label>
                          <Input
                            id="billing-address1"
                            {...form.register('billing.address1')}
                            className={form.formState.errors.billing?.address1 ? 'border-red-500' : ''}
                          />
                        </div>

                        <div>
                          <Label htmlFor="billing-address2">Address Line 2</Label>
                          <Input
                            id="billing-address2"
                            {...form.register('billing.address2')}
                          />
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="billing-city">City *</Label>
                            <Input
                              id="billing-city"
                              {...form.register('billing.city')}
                              className={form.formState.errors.billing?.city ? 'border-red-500' : ''}
                            />
                          </div>

                          <div>
                            <Label htmlFor="billing-state">County/State *</Label>
                            <Input
                              id="billing-state"
                              {...form.register('billing.state')}
                              className={form.formState.errors.billing?.state ? 'border-red-500' : ''}
                            />
                          </div>

                          <div>
                            <Label htmlFor="billing-postcode">Postcode *</Label>
                            <Input
                              id="billing-postcode"
                              {...form.register('billing.postcode')}
                              className={form.formState.errors.billing?.postcode ? 'border-red-500' : ''}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="billing-country">Country *</Label>
                          <Select
                            value={form.watch('billing.country')}
                            onValueChange={(value) => form.setValue('billing.country', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                              <SelectItem value="Ireland">Ireland</SelectItem>
                              <SelectItem value="France">France</SelectItem>
                              <SelectItem value="Germany">Germany</SelectItem>
                              <SelectItem value="Netherlands">Netherlands</SelectItem>
                              <SelectItem value="United States">United States</SelectItem>
                              <SelectItem value="Canada">Canada</SelectItem>
                              <SelectItem value="Australia">Australia</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={createOrderPaymentMutation.isPending}
                      onClick={(e) => {
                        console.log('Button clicked!');
                        console.log('Form state:', form.formState);
                        console.log('Form values:', form.getValues());
                        console.log('Form errors:', form.formState.errors);
                        
                        // Let the form handle submission naturally
                      }}
                    >
                      {createOrderPaymentMutation.isPending ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Setting up payment...
                        </>
                      ) : (
                        'Proceed to Payment'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </form>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Choose Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="stripe" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="stripe" className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4" />
                        <span>Credit/Debit Card</span>
                      </TabsTrigger>
                      <TabsTrigger value="paypal" className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">P</div>
                        <span>PayPal</span>
                      </TabsTrigger>
                      <TabsTrigger value="klarna" className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-pink-500 rounded text-white text-xs flex items-center justify-center font-bold">K</div>
                        <span>Klarna</span>
                      </TabsTrigger>
                      <TabsTrigger value="applepay" className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-black rounded text-white text-xs flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="w-3 h-3">
                            <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                          </svg>
                        </div>
                        <span>Apple Pay</span>
                      </TabsTrigger>
                      <TabsTrigger value="googlepay" className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-600 rounded text-white text-xs flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="w-3 h-3">
                            <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                          </svg>
                        </div>
                        <span>Google Pay</span>
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="stripe" className="mt-6">
                      {clientSecret ? (
                        <Elements 
                          stripe={stripePromise} 
                          options={{ 
                            clientSecret,
                            appearance: { theme: 'stripe' }
                          }}
                        >
                          <OrderPaymentForm 
                            clientSecret={clientSecret} 
                            orderId={parseInt(orderId)}
                            onSuccess={() => {
                              window.location.href = `/order-confirmation?orderId=${orderId}`;
                            }}
                          />
                        </Elements>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-600">Setting up secure payment...</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="paypal" className="mt-6">
                      <PayPalPaymentFormNew
                        orderId={parseInt(orderId)}
                        paymentData={form.getValues()}
                        onSuccess={() => {
                          window.location.href = `/order-confirmation?orderId=${orderId}`;
                        }}
                      />
                    </TabsContent>
                    
                    <TabsContent value="klarna" className="mt-6">
                      <KlarnaPaymentForm
                        orderId={parseInt(orderId)}
                        paymentData={form.getValues()}
                        onSuccess={() => {
                          window.location.href = `/order-confirmation?orderId=${orderId}`;
                        }}
                      />
                    </TabsContent>
                    
                    <TabsContent value="applepay" className="mt-6">
                      <ApplePayPaymentForm
                        orderId={parseInt(orderId)}
                        paymentData={form.getValues()}
                        onSuccess={() => {
                          window.location.href = `/order-confirmation?orderId=${orderId}`;
                        }}
                      />
                    </TabsContent>
                    
                    <TabsContent value="googlepay" className="mt-6">
                      <GooglePayPaymentForm
                        orderId={parseInt(orderId)}
                        paymentData={form.getValues()}
                        onSuccess={() => {
                          window.location.href = `/order-confirmation?orderId=${orderId}`;
                        }}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Status */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge className={
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>

                <Separator />

                {/* Order Items */}
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold">
                        £{(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>£{subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Shipping (estimated)</span>
                    <span>£7.95</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Tax (VAT 20%)</span>
                    <span>£{(subtotal * 0.20).toFixed(2)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total (estimated)</span>
                    <span>£{(subtotal + 7.95 + (subtotal * 0.20)).toFixed(2)}</span>
                  </div>
                </div>

                {/* Security info */}
                <div className="pt-4 space-y-2">
                  <div className="flex items-center text-xs text-gray-600">
                    <Shield className="w-3 h-3 mr-1" />
                    SSL encrypted checkout
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <Package className="w-3 h-3 mr-1" />
                    Secure processing
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}