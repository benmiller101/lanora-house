import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import SEOHead from "@/components/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useModals } from "@/contexts/ModalContext";
import { useBasket } from "@/contexts/BasketContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FiArrowLeft, FiLock, FiUser, FiMail, FiPhone, FiMapPin, FiPackage, FiCreditCard } from "react-icons/fi";
import { Truck, Store, Calendar } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

type ShippingOption = {
  serviceId: string;
  serviceName: string;
  description: string;
  deliveryTime: string;
  shippingCost: number;
  packingHandling: number;
  totalShipping: number;
  isDefault: boolean;
  upgradeAmount: number;
};

type ShippingResult = {
  success: boolean;
  totalWeight: number;
  requiredParcelType: string;
  requiredParcelTypeName: string;
  zone: string;
  zoneName: string;
  shippingCost: number;
  packingHandling: number;
  totalShipping: number;
  breakdown: {
    baseShipping: number;
    packingBase: number;
    packingAdditional: number;
  };
  shippingOptions: ShippingOption[];
  selectedService: string;
};

type Product = {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl?: string;
};

type CountryConfig = {
  name: string;
  code: string;
  postalLabel: string;
  postalPlaceholder: string;
  regionLabel: string;
  regionPlaceholder: string;
  regions?: string[];
};

const countries: CountryConfig[] = [
  { name: "United Kingdom", code: "GB", postalLabel: "Postcode", postalPlaceholder: "SW1A 1AA", regionLabel: "County", regionPlaceholder: "London" },
  { name: "United States", code: "US", postalLabel: "ZIP Code", postalPlaceholder: "10001", regionLabel: "State", regionPlaceholder: "New York", regions: ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"] },
  { name: "Canada", code: "CA", postalLabel: "Postal Code", postalPlaceholder: "M5V 1J1", regionLabel: "Province", regionPlaceholder: "Ontario", regions: ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Nova Scotia", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan"] },
  { name: "Australia", code: "AU", postalLabel: "Postcode", postalPlaceholder: "2000", regionLabel: "State", regionPlaceholder: "NSW", regions: ["Australian Capital Territory", "New South Wales", "Northern Territory", "Queensland", "South Australia", "Tasmania", "Victoria", "Western Australia"] },
  { name: "Germany", code: "DE", postalLabel: "PLZ", postalPlaceholder: "10115", regionLabel: "State", regionPlaceholder: "Berlin" },
  { name: "France", code: "FR", postalLabel: "Code Postal", postalPlaceholder: "75001", regionLabel: "Region", regionPlaceholder: "Île-de-France" },
  { name: "Ireland", code: "IE", postalLabel: "Eircode", postalPlaceholder: "D02 XY00", regionLabel: "County", regionPlaceholder: "Dublin" },
  { name: "Netherlands", code: "NL", postalLabel: "Postcode", postalPlaceholder: "1012 AB", regionLabel: "Province", regionPlaceholder: "North Holland" },
  { name: "Spain", code: "ES", postalLabel: "Código Postal", postalPlaceholder: "28001", regionLabel: "Province", regionPlaceholder: "Madrid" },
  { name: "Italy", code: "IT", postalLabel: "CAP", postalPlaceholder: "00100", regionLabel: "Province", regionPlaceholder: "Roma" },
  { name: "Belgium", code: "BE", postalLabel: "Postcode", postalPlaceholder: "1000", regionLabel: "Province", regionPlaceholder: "Brussels" },
  { name: "Austria", code: "AT", postalLabel: "PLZ", postalPlaceholder: "1010", regionLabel: "State", regionPlaceholder: "Vienna" },
  { name: "Switzerland", code: "CH", postalLabel: "PLZ", postalPlaceholder: "8001", regionLabel: "Canton", regionPlaceholder: "Zürich" },
  { name: "Sweden", code: "SE", postalLabel: "Postnummer", postalPlaceholder: "111 22", regionLabel: "County", regionPlaceholder: "Stockholm" },
  { name: "Norway", code: "NO", postalLabel: "Postnummer", postalPlaceholder: "0001", regionLabel: "County", regionPlaceholder: "Oslo" },
  { name: "Denmark", code: "DK", postalLabel: "Postnummer", postalPlaceholder: "1000", regionLabel: "Region", regionPlaceholder: "Copenhagen" },
  { name: "Finland", code: "FI", postalLabel: "Postinumero", postalPlaceholder: "00100", regionLabel: "Region", regionPlaceholder: "Helsinki" },
  { name: "Portugal", code: "PT", postalLabel: "Código Postal", postalPlaceholder: "1000-001", regionLabel: "District", regionPlaceholder: "Lisboa" },
  { name: "Poland", code: "PL", postalLabel: "Kod Pocztowy", postalPlaceholder: "00-001", regionLabel: "Voivodeship", regionPlaceholder: "Mazowieckie" },
  { name: "Greece", code: "GR", postalLabel: "Postal Code", postalPlaceholder: "10431", regionLabel: "Region", regionPlaceholder: "Attica" },
  { name: "New Zealand", code: "NZ", postalLabel: "Postcode", postalPlaceholder: "1010", regionLabel: "Region", regionPlaceholder: "Auckland" },
  { name: "Japan", code: "JP", postalLabel: "Postal Code", postalPlaceholder: "100-0001", regionLabel: "Prefecture", regionPlaceholder: "Tokyo" },
  { name: "Singapore", code: "SG", postalLabel: "Postal Code", postalPlaceholder: "018956", regionLabel: "District", regionPlaceholder: "Central" },
  { name: "Hong Kong", code: "HK", postalLabel: "Postal Code", postalPlaceholder: "", regionLabel: "District", regionPlaceholder: "Central" },
  { name: "United Arab Emirates", code: "AE", postalLabel: "Postal Code", postalPlaceholder: "", regionLabel: "Emirate", regionPlaceholder: "Dubai" },
  { name: "South Africa", code: "ZA", postalLabel: "Postal Code", postalPlaceholder: "0001", regionLabel: "Province", regionPlaceholder: "Gauteng" },
  { name: "Brazil", code: "BR", postalLabel: "CEP", postalPlaceholder: "01310-100", regionLabel: "State", regionPlaceholder: "São Paulo" },
  { name: "Mexico", code: "MX", postalLabel: "Código Postal", postalPlaceholder: "06600", regionLabel: "State", regionPlaceholder: "Ciudad de México" },
  { name: "India", code: "IN", postalLabel: "PIN Code", postalPlaceholder: "110001", regionLabel: "State", regionPlaceholder: "Delhi" },
  { name: "China", code: "CN", postalLabel: "Postal Code", postalPlaceholder: "100000", regionLabel: "Province", regionPlaceholder: "Beijing" },
  { name: "South Korea", code: "KR", postalLabel: "Postal Code", postalPlaceholder: "03051", regionLabel: "Province", regionPlaceholder: "Seoul" },
];

type CheckoutItem = {
  productId: number;
  name: string;
  price: string;
  imageUrl?: string;
  offerId?: number;
};

// Stripe Payment Form Component
function StripePaymentForm({ 
  onSuccess, 
  onError, 
  total,
  orderId 
}: { 
  onSuccess: (paymentIntentId: string) => void; 
  onError: (message: string) => void;
  total: number;
  orderId: number | null;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const returnUrl = orderId 
        ? `${window.location.origin}/order-confirmation?orderId=${orderId}`
        : `${window.location.origin}/order-confirmation`;
      
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'Payment failed. Please try again.');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else {
        onError('Payment was not completed. Please try again.');
      }
    } catch (err: any) {
      onError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FiCreditCard className="w-4 h-4" />
          Payment Details
        </Label>
        <PaymentElement />
      </div>
      
      <Button 
        type="submit" 
        size="lg" 
        className="w-full bg-primary hover:bg-primary/90"
        disabled={!stripe || isProcessing}
        data-testid="button-pay-now"
      >
        <FiLock className="mr-2" />
        {isProcessing ? 'Processing payment...' : `Pay £${total.toFixed(2)}`}
      </Button>
      
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <img src="https://js.stripe.com/v3/fingerprinted/img/visa-729c05c240c4bdb47b03ac81d9945bfe.svg" alt="Visa" className="h-6" />
        </span>
        <span className="flex items-center gap-1">
          <img src="https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg" alt="Mastercard" className="h-6" />
        </span>
        <span className="flex items-center gap-1">
          <img src="https://js.stripe.com/v3/fingerprinted/img/amex-a49b82f46c5cd6a96a6e418a6ca1717c.svg" alt="Amex" className="h-6" />
        </span>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { openLoginModal } = useModals();
  const { items: basketItems, subtotal: basketSubtotal, clearBasket } = useBasket();
  const { toast } = useToast();

  const urlParams = new URLSearchParams(window.location.search);
  const singleProductId = urlParams.get("productId");
  const offerId = urlParams.get("offerId");

  const [formData, setFormData] = useState({
    email: user?.email || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    city: "",
    region: "",
    postcode: "",
    country: "United Kingdom",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);
  const [shippingData, setShippingData] = useState<ShippingResult | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [selectedShippingService, setSelectedShippingService] = useState<string>('tracked_48');
  
  // Click & Collect state
  const [fulfillmentMethod, setFulfillmentMethod] = useState<"delivery" | "click_collect">("delivery");
  const [collectionDate, setCollectionDate] = useState("");
  const [collectionTimeSlot, setCollectionTimeSlot] = useState("");
  
  const COLLECTION_TIME_SLOTS = [
    { value: "12:00-13:00", label: "12:00 PM - 1:00 PM" },
    { value: "13:00-14:00", label: "1:00 PM - 2:00 PM" },
    { value: "14:00-15:00", label: "2:00 PM - 3:00 PM" },
    { value: "15:00-16:00", label: "3:00 PM - 4:00 PM" },
    { value: "16:00-17:00", label: "4:00 PM - 5:00 PM" },
  ];

  const isWeekday = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split("T")[0];
  };
  
  // Stripe payment state
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  // Payment method selection (card, bitcoin, ethereum)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bitcoin" | "ethereum">("card");
  const [cryptoOrderCreated, setCryptoOrderCreated] = useState(false);
  const [cryptoOrderDetails, setCryptoOrderDetails] = useState<{
    orderId: number;
    orderNumber: string;
    cryptoAmount: string;
    walletAddress: string;
    expiresAt: string;
  } | null>(null);
  
  // Crypto price preview (shown before placing order)
  const [cryptoPreview, setCryptoPreview] = useState<{
    btcAmount: string;
    ethAmount: string;
    btcRate: number;
    ethRate: number;
    isLoading: boolean;
    lastUpdated: Date | null;
  }>({
    btcAmount: "",
    ethAmount: "",
    btcRate: 0,
    ethRate: 0,
    isLoading: false,
    lastUpdated: null,
  });
  
  // Billing address state
  const [billingData, setBillingData] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    region: "",
    postcode: "",
    country: "United Kingdom",
  });
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

  // Load Stripe publishable key
  useEffect(() => {
    const loadStripeKey = async () => {
      try {
        const response = await fetch('/api/stripe/publishable-key');
        const data = await response.json();
        if (data.publishableKey) {
          setStripePromise(loadStripe(data.publishableKey));
        }
      } catch (err) {
        console.error('Failed to load Stripe:', err);
      }
    };
    loadStripeKey();
  }, []);
  
  const selectedCountry = countries.find(c => c.name === formData.country) || countries[0];

  const { data: singleProduct } = useQuery<Product>({
    queryKey: [`/api/products/${singleProductId}`],
    enabled: !!singleProductId,
  });

  // Use secure server-side validation endpoint for offer checkout
  const { data: offerData, isLoading: offerLoading, error: offerQueryError } = useQuery<any>({
    queryKey: [`/api/offers/${offerId}/checkout`],
    enabled: !!offerId,
    retry: false,
  });

  useEffect(() => {
    if (offerId && offerData) {
      // Server has validated ownership, status, and 48-hour window
      if (offerData.valid) {
        setOfferError(null);
        setCheckoutItems([{
          productId: offerData.productId,
          name: offerData.name,
          price: offerData.price,
          imageUrl: offerData.imageUrl,
          offerId: offerData.offerId,
        }]);
      }
    } else if (offerId && offerQueryError) {
      // Handle server-side validation errors
      const errorMessage = (offerQueryError as any)?.message || "Error loading offer details. Please try again.";
      setOfferError(errorMessage);
    } else if (singleProductId && singleProduct) {
      setCheckoutItems([{
        productId: singleProduct.id,
        name: singleProduct.name,
        price: singleProduct.price,
        imageUrl: singleProduct.imageUrl,
      }]);
    } else if (!singleProductId && !offerId && basketItems.length > 0) {
      setCheckoutItems(basketItems);
    }
  }, [singleProductId, singleProduct, basketItems, offerId, offerData, offerQueryError]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, region: "" }));
  }, [formData.country]);

  // Calculate shipping when items, country, or selected service change (only for delivery)
  useEffect(() => {
    const calculateShipping = async () => {
      // Skip shipping calculation for Click & Collect
      if (fulfillmentMethod === "click_collect") {
        setShippingData(null);
        setShippingError(null);
        setIsCalculatingShipping(false);
        return;
      }

      if (checkoutItems.length === 0 || !formData.country) {
        setShippingData(null);
        setShippingError(null);
        return;
      }

      setIsCalculatingShipping(true);
      setShippingError(null);
      try {
        const items = checkoutItems.map(item => ({ productId: item.productId }));
        const response = await apiRequest("POST", "/api/calculate-shop-shipping", {
          items,
          country: formData.country,
          selectedService: selectedShippingService,
        });
        const data = await response.json() as ShippingResult & { error?: string };

        if (data.success) {
          setShippingData(data);
          setShippingError(null);
        } else {
          console.error("Shipping calculation failed:", data);
          setShippingData(null);
          setShippingError(data.error || "Unable to calculate shipping");
        }
      } catch (error: any) {
        console.error("Shipping calculation error:", error);
        setShippingData(null);
        setShippingError(error.message || "Unable to calculate shipping. Please try again.");
      } finally {
        setIsCalculatingShipping(false);
      }
    };

    calculateShipping();
  }, [checkoutItems, formData.country, selectedShippingService, fulfillmentMethod]);

  const formatPrice = (price: string | number | undefined) => {
    if (price === undefined || price === null) return "£0.00";
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numPrice)) return "£0.00";
    return `£${numPrice.toFixed(2)}`;
  };

  const subtotal = checkoutItems.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    return sum + price;
  }, 0);
  
  // Fetch crypto rates when crypto payment is selected or total changes
  useEffect(() => {
    const fetchCryptoRates = async () => {
      if (paymentMethod !== "bitcoin" && paymentMethod !== "ethereum") {
        return;
      }
      
      const total = subtotal + (fulfillmentMethod === "click_collect" ? 0 : (shippingData?.totalShipping || 0));
      if (total <= 0) return;
      
      setCryptoPreview(prev => ({ ...prev, isLoading: true }));
      
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=gbp');
        const data = await response.json();
        
        if (data.bitcoin?.gbp && data.ethereum?.gbp) {
          const btcAmount = (total / data.bitcoin.gbp).toFixed(8);
          const ethAmount = (total / data.ethereum.gbp).toFixed(8);
          
          setCryptoPreview({
            btcAmount: `${btcAmount} BTC`,
            ethAmount: `${ethAmount} ETH`,
            btcRate: data.bitcoin.gbp,
            ethRate: data.ethereum.gbp,
            isLoading: false,
            lastUpdated: new Date(),
          });
        }
      } catch (error) {
        console.error('Failed to fetch crypto rates:', error);
        setCryptoPreview(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    fetchCryptoRates();
    // Refresh rates every 60 seconds if crypto is selected
    const interval = setInterval(fetchCryptoRates, 60000);
    return () => clearInterval(interval);
  }, [paymentMethod, subtotal, shippingData?.totalShipping, fulfillmentMethod]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleBillingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBillingSelectChange = (name: string, value: string) => {
    setBillingData((prev) => ({ ...prev, [name]: value }));
  };
  
  const selectedBillingCountry = countries.find(c => c.name === billingData.country) || countries[0];

  const handleCheckout = async () => {
    // Validate contact info
    if (!formData.email || !formData.firstName || !formData.lastName) {
      toast({
        title: "Missing Information",
        description: "Please fill in your contact information.",
        variant: "destructive",
      });
      return;
    }

    // Validate based on fulfillment method
    if (fulfillmentMethod === "delivery") {
      if (!formData.addressLine1 || !formData.city || !formData.postcode) {
        toast({
          title: "Missing Address",
          description: "Please fill in your shipping address.",
          variant: "destructive",
        });
        return;
      }

      if (!shippingData) {
        toast({
          title: "Shipping Required",
          description: "Please wait for shipping calculation.",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Click & Collect validation
      if (!collectionDate) {
        toast({
          title: "Collection Date Required",
          description: "Please select a collection date.",
          variant: "destructive",
        });
        return;
      }
      if (!collectionTimeSlot) {
        toast({
          title: "Collection Time Required",
          description: "Please select a collection time slot.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      const response = await apiRequest("POST", "/api/shop/create-payment-intent", {
        items: checkoutItems.map(item => ({ productId: item.productId })),
        country: fulfillmentMethod === "click_collect" ? "United Kingdom" : formData.country,
        selectedService: fulfillmentMethod === "click_collect" ? null : selectedShippingService,
        fulfillmentMethod,
        collectionDate: fulfillmentMethod === "click_collect" ? collectionDate : null,
        collectionTimeSlot: fulfillmentMethod === "click_collect" ? collectionTimeSlot : null,
        customerInfo: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          addressLine1: fulfillmentMethod === "click_collect" ? "Click & Collect" : formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: fulfillmentMethod === "click_collect" ? "In-Store Pickup" : formData.city,
          region: formData.region,
          postcode: fulfillmentMethod === "click_collect" ? "N/A" : formData.postcode,
          country: fulfillmentMethod === "click_collect" ? "United Kingdom" : formData.country,
        },
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setPendingOrderId(data.orderId);
      setShowPaymentForm(true);
      
    } catch (err: any) {
      console.error('Payment setup error:', err);
      setPaymentError(err.message || 'Failed to set up payment. Please try again.');
      toast({
        title: "Payment Error",
        description: err.message || "Failed to set up payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (confirmedPaymentIntentId: string) => {
    try {
      const response = await apiRequest("POST", "/api/shop/confirm-order", {
        paymentIntentId: confirmedPaymentIntentId,
        orderId: pendingOrderId,
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Clear basket if it was a basket checkout
      if (!singleProductId && !offerId) {
        clearBasket();
      }
      
      toast({
        title: "Order Confirmed!",
        description: `Your order ${data.orderNumber} has been placed successfully.`,
      });
      
      // Redirect to confirmation page
      setLocation(`/order-confirmation?orderId=${data.orderId}`);
      
    } catch (err: any) {
      console.error('Order confirmation error:', err);
      toast({
        title: "Order Error",
        description: err.message || "Payment successful, but there was an issue confirming your order. Please contact support.",
        variant: "destructive",
      });
    }
  };
  
  const handleCryptoCheckout = async () => {
    // Validate contact info
    if (!formData.email || !formData.firstName || !formData.lastName) {
      toast({
        title: "Missing Information",
        description: "Please fill in your contact information.",
        variant: "destructive",
      });
      return;
    }

    // Validate billing address
    const effectiveBilling = billingSameAsShipping ? formData : billingData;
    if (fulfillmentMethod === "delivery" && (!effectiveBilling.addressLine1 || !effectiveBilling.city || !effectiveBilling.postcode)) {
      toast({
        title: "Missing Billing Address",
        description: "Please fill in your billing address.",
        variant: "destructive",
      });
      return;
    }

    // Validate based on fulfillment method
    if (fulfillmentMethod === "delivery") {
      if (!formData.addressLine1 || !formData.city || !formData.postcode) {
        toast({
          title: "Missing Address",
          description: "Please fill in your shipping address.",
          variant: "destructive",
        });
        return;
      }

      if (!shippingData) {
        toast({
          title: "Shipping Required",
          description: "Please wait for shipping calculation.",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!collectionDate || !collectionTimeSlot) {
        toast({
          title: "Collection Details Required",
          description: "Please select a collection date and time.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const total = subtotal + (fulfillmentMethod === "click_collect" ? 0 : (shippingData?.totalShipping || 0));
      
      const response = await apiRequest("POST", "/api/shop/crypto-order", {
        items: checkoutItems.map(item => ({ productId: item.productId, offerId: item.offerId })),
        cryptoType: paymentMethod, // 'bitcoin' or 'ethereum'
        customerInfo: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          addressLine1: fulfillmentMethod === "click_collect" ? "Click & Collect" : formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: fulfillmentMethod === "click_collect" ? "In-Store Pickup" : formData.city,
          region: formData.region,
          postcode: fulfillmentMethod === "click_collect" ? "N/A" : formData.postcode,
          country: fulfillmentMethod === "click_collect" ? "United Kingdom" : formData.country,
        },
        billingAddress: billingSameAsShipping ? null : {
          addressLine1: billingData.addressLine1,
          addressLine2: billingData.addressLine2,
          city: billingData.city,
          region: billingData.region,
          postcode: billingData.postcode,
          country: billingData.country,
        },
        fulfillmentMethod,
        collectionDate: fulfillmentMethod === "click_collect" ? collectionDate : null,
        collectionTimeSlot: fulfillmentMethod === "click_collect" ? collectionTimeSlot : null,
        country: fulfillmentMethod === "click_collect" ? "United Kingdom" : formData.country,
        selectedService: fulfillmentMethod === "click_collect" ? null : selectedShippingService,
        totalGBP: total,
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setCryptoOrderDetails({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        cryptoAmount: data.cryptoAmount,
        walletAddress: data.walletAddress,
        expiresAt: data.expiresAt,
      });
      setCryptoOrderCreated(true);

      toast({
        title: "Order Created!",
        description: `Please send ${data.cryptoAmount} to complete your order.`,
      });
    } catch (err: any) {
      console.error('Crypto order creation error:', err);
      setPaymentError(err.message || 'Failed to create order. Please try again.');
      toast({
        title: "Order Error",
        description: err.message || "Failed to create order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (checkoutItems.length === 0 && !singleProductId && !offerId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Basket is Empty</h2>
          <p className="text-gray-600 mb-4">Add some items to checkout.</p>
          <Link href="/shop">
            <Button>Browse Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (offerId && offerLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p>Loading offer details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (offerId && offerError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Offer Not Available</h2>
          <p className="text-gray-600 mb-4">{offerError}</p>
          <Link href="/members">
            <Button>Return to My Offers</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (offerId && checkoutItems.length === 0 && !offerLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Offer...</h2>
          <p className="text-gray-600 mb-4">Please wait while we fetch your offer details.</p>
        </div>
      </div>
    );
  }

  if (singleProductId && !singleProduct) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading checkout...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Checkout"
        description="Complete your purchase securely at Lanora House. Pay with confidence using Stripe, PayPal, or other supported payment methods."
        path="/checkout"
        noindex
      />

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Link href={singleProductId ? `/product/${singleProductId}` : "/cart"}>
            <Button variant="ghost" className="mb-6">
              <FiArrowLeft className="mr-2" />
              {singleProductId ? "Back to Product" : "Back to Basket"}
            </Button>
          </Link>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiUser className="w-5 h-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isAuthenticated && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-800 mb-2">
                        Already have an account?{" "}
                        <button onClick={openLoginModal} className="font-medium underline hover:no-underline">
                          Sign in
                        </button>{" "}
                        to save your information for future orders.
                      </p>
                      <p className="text-xs text-blue-600">Or continue as a guest below.</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1">
                      <FiMail className="w-4 h-4" />
                      Email *
                    </Label>
                    <Input id="email" name="email" type="email" placeholder="your@email.com" value={formData.email} onChange={handleInputChange} required data-testid="input-checkout-email" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" name="firstName" placeholder="John" value={formData.firstName} onChange={handleInputChange} required data-testid="input-checkout-firstname" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleInputChange} required data-testid="input-checkout-lastname" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-1">
                      <FiPhone className="w-4 h-4" />
                      Phone (optional)
                    </Label>
                    <Input id="phone" name="phone" type="tel" placeholder="+44 7700 900000" value={formData.phone} onChange={handleInputChange} data-testid="input-checkout-phone" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiPackage className="w-5 h-5" />
                    Delivery Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFulfillmentMethod("delivery")}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                        fulfillmentMethod === "delivery"
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      data-testid="btn-fulfillment-delivery"
                    >
                      <Truck className="h-6 w-6" />
                      <span className="font-medium">Delivery</span>
                      <span className="text-xs text-gray-500">Ship to your address</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFulfillmentMethod("click_collect")}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                        fulfillmentMethod === "click_collect"
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      data-testid="btn-fulfillment-collect"
                    >
                      <Store className="h-6 w-6" />
                      <span className="font-medium">Click & Collect</span>
                      <span className="text-xs text-gray-500">Free - Pick up in store</span>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {fulfillmentMethod === "delivery" ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FiMapPin className="w-5 h-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Select value={formData.country} onValueChange={(value) => handleSelectChange("country", value)}>
                        <SelectTrigger data-testid="select-checkout-country">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.code} value={country.name}>{country.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressLine1">Address Line 1 *</Label>
                      <Input id="addressLine1" name="addressLine1" placeholder="Street address, house number" value={formData.addressLine1} onChange={handleInputChange} required data-testid="input-checkout-address1" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressLine2">Address Line 2</Label>
                      <Input id="addressLine2" name="addressLine2" placeholder="Apartment, suite, unit, etc. (optional)" value={formData.addressLine2} onChange={handleInputChange} data-testid="input-checkout-address2" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressLine3">Address Line 3</Label>
                      <Input id="addressLine3" name="addressLine3" placeholder="Building, floor, etc. (optional)" value={formData.addressLine3} onChange={handleInputChange} data-testid="input-checkout-address3" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input id="city" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} required data-testid="input-checkout-city" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="region">{selectedCountry.regionLabel}</Label>
                        {selectedCountry.regions ? (
                          <Select value={formData.region} onValueChange={(value) => handleSelectChange("region", value)}>
                            <SelectTrigger data-testid="select-checkout-region">
                              <SelectValue placeholder={`Select ${selectedCountry.regionLabel.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedCountry.regions.map((region) => (
                                <SelectItem key={region} value={region}>{region}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input id="region" name="region" placeholder={selectedCountry.regionPlaceholder} value={formData.region} onChange={handleInputChange} data-testid="input-checkout-region" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postcode">{selectedCountry.postalLabel} *</Label>
                      <Input id="postcode" name="postcode" placeholder={selectedCountry.postalPlaceholder} value={formData.postcode} onChange={handleInputChange} required data-testid="input-checkout-postcode" />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="w-5 h-5" />
                      Collection Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-700 mb-2">
                        <Store className="h-5 w-5" />
                        <span className="font-medium">Free Collection - Save on shipping!</span>
                      </div>
                      <p className="text-sm text-green-600">
                        Pick up your items from our store. Available Monday to Friday, 12:00 PM - 5:00 PM.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="collectionDate">Collection Date *</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="collectionDate"
                            type="date"
                            value={collectionDate}
                            onChange={(e) => {
                              const selectedDate = e.target.value;
                              if (isWeekday(selectedDate)) {
                                setCollectionDate(selectedDate);
                              } else {
                                toast({
                                  title: "Invalid Date",
                                  description: "Please select a weekday (Monday to Friday)",
                                  variant: "destructive",
                                });
                              }
                            }}
                            min={getMinDate()}
                            className="pl-10"
                            data-testid="input-collection-date"
                          />
                        </div>
                        <p className="text-xs text-gray-500">Monday to Friday only</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="collectionTime">Collection Time *</Label>
                        <Select
                          value={collectionTimeSlot}
                          onValueChange={setCollectionTimeSlot}
                        >
                          <SelectTrigger data-testid="select-collection-time">
                            <SelectValue placeholder="Select a time slot" />
                          </SelectTrigger>
                          <SelectContent>
                            {COLLECTION_TIME_SLOTS.map((slot) => (
                              <SelectItem key={slot.value} value={slot.value}>
                                {slot.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Payment Method Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiCreditCard className="w-5 h-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                        paymentMethod === "card"
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      data-testid="btn-payment-card"
                    >
                      <FiCreditCard className="h-6 w-6 text-primary" />
                      <span className="font-medium text-sm">Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bitcoin")}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                        paymentMethod === "bitcoin"
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      data-testid="btn-payment-bitcoin"
                    >
                      <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546z"/>
                        <path fill="white" d="M14.305 10.42c.24-1.6-.98-2.46-2.64-3.03l.54-2.16-1.32-.33-.52 2.1c-.35-.09-.71-.17-1.07-.25l.53-2.11-1.32-.33-.54 2.16c-.29-.07-.57-.13-.84-.2l-.01-.01-1.82-.45-.35 1.4s.98.22.96.24c.54.13.63.49.62.78l-.62 2.5c.04.01.09.02.14.04l-.14-.04-.87 3.5c-.07.16-.23.4-.61.31.01.02-.96-.24-.96-.24l-.66 1.51 1.72.43c.32.08.63.16.94.24l-.55 2.19 1.32.33.54-2.16c.36.1.71.19 1.05.27l-.54 2.15 1.32.33.55-2.18c2.24.42 3.93.25 4.64-1.77.57-1.63-.03-2.57-1.2-3.18.86-.2 1.5-.76 1.67-1.93zm-2.98 4.18c-.4 1.63-3.13.75-4.01.53l.72-2.87c.89.22 3.72.66 3.29 2.34zm.41-4.2c-.37 1.48-2.64.73-3.38.54l.65-2.6c.74.18 3.12.53 2.73 2.06z"/>
                      </svg>
                      <span className="font-medium text-sm">Bitcoin</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("ethereum")}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                        paymentMethod === "ethereum"
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      data-testid="btn-payment-ethereum"
                    >
                      <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
                      </svg>
                      <span className="font-medium text-sm">Ethereum</span>
                    </button>
                  </div>
                  
                  {(paymentMethod === "bitcoin" || paymentMethod === "ethereum") && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                      <p className="text-primary font-medium mb-1">
                        Cryptocurrency Payment
                      </p>
                      <p className="text-gray-700">
                        After placing your order, you'll receive wallet details to send your payment.
                        Orders are verified manually within 12 hours. Items are reserved until verification.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Billing Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiMapPin className="w-5 h-5" />
                    Billing Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={billingSameAsShipping}
                      onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                      data-testid="checkbox-billing-same"
                    />
                    <span className="text-sm font-medium">
                      {fulfillmentMethod === "click_collect" 
                        ? "Use my contact details for billing" 
                        : "Same as shipping address"}
                    </span>
                  </label>
                  
                  {!billingSameAsShipping && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="billing-country">Country *</Label>
                        <Select value={billingData.country} onValueChange={(value) => handleBillingSelectChange("country", value)}>
                          <SelectTrigger data-testid="select-billing-country">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.name}>{country.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="billing-addressLine1">Address Line 1 *</Label>
                        <Input 
                          id="billing-addressLine1" 
                          name="addressLine1" 
                          placeholder="Street address, house number" 
                          value={billingData.addressLine1} 
                          onChange={handleBillingInputChange} 
                          required 
                          data-testid="input-billing-address1" 
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="billing-addressLine2">Address Line 2</Label>
                        <Input 
                          id="billing-addressLine2" 
                          name="addressLine2" 
                          placeholder="Apartment, suite, unit, etc. (optional)" 
                          value={billingData.addressLine2} 
                          onChange={handleBillingInputChange} 
                          data-testid="input-billing-address2" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="billing-city">City *</Label>
                          <Input 
                            id="billing-city" 
                            name="city" 
                            placeholder="City" 
                            value={billingData.city} 
                            onChange={handleBillingInputChange} 
                            required 
                            data-testid="input-billing-city" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billing-region">{selectedBillingCountry.regionLabel}</Label>
                          {selectedBillingCountry.regions ? (
                            <Select value={billingData.region} onValueChange={(value) => handleBillingSelectChange("region", value)}>
                              <SelectTrigger data-testid="select-billing-region">
                                <SelectValue placeholder={`Select ${selectedBillingCountry.regionLabel.toLowerCase()}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {selectedBillingCountry.regions.map((region) => (
                                  <SelectItem key={region} value={region}>{region}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input 
                              id="billing-region" 
                              name="region" 
                              placeholder={selectedBillingCountry.regionPlaceholder} 
                              value={billingData.region} 
                              onChange={handleBillingInputChange} 
                              data-testid="input-billing-region" 
                            />
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="billing-postcode">{selectedBillingCountry.postalLabel} *</Label>
                        <Input 
                          id="billing-postcode" 
                          name="postcode" 
                          placeholder={selectedBillingCountry.postalPlaceholder} 
                          value={billingData.postcode} 
                          onChange={handleBillingInputChange} 
                          required 
                          data-testid="input-billing-postcode" 
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary ({checkoutItems.length} {checkoutItems.length === 1 ? 'item' : 'items'})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {checkoutItems.map((item) => (
                      <div key={item.productId} className="flex gap-4">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No image</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-primary font-bold">{formatPrice(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <FiPackage className="w-4 h-4" />
                        {fulfillmentMethod === "click_collect" ? "Collection" : "Shipping"}
                      </span>
                      {fulfillmentMethod === "click_collect" ? (
                        <span className="text-green-600 font-medium" data-testid="text-shipping-cost">FREE</span>
                      ) : isCalculatingShipping ? (
                        <span className="text-gray-400">Calculating...</span>
                      ) : shippingData ? (
                        <span data-testid="text-shipping-cost">{formatPrice(shippingData.totalShipping)}</span>
                      ) : shippingError ? (
                        <span className="text-red-500" data-testid="text-shipping-error">Error</span>
                      ) : (
                        <span className="text-gray-500">Select country above</span>
                      )}
                    </div>
                    {fulfillmentMethod === "click_collect" && collectionDate && collectionTimeSlot && (
                      <div className="text-xs text-green-600 pl-5 bg-green-50 p-2 rounded border border-green-200">
                        <Store className="inline w-3 h-3 mr-1" />
                        Collection: {new Date(collectionDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} at {COLLECTION_TIME_SLOTS.find(s => s.value === collectionTimeSlot)?.label}
                      </div>
                    )}
                    {shippingError && fulfillmentMethod === "delivery" && (
                      <div className="text-xs text-red-500 pl-5 bg-red-50 p-2 rounded border border-red-200">
                        {shippingError}
                      </div>
                    )}
                    {fulfillmentMethod === "delivery" && shippingData && shippingData.shippingOptions && shippingData.shippingOptions.length > 0 && (
                      <div className={`space-y-2 mt-3 ${isCalculatingShipping ? 'opacity-60' : ''}`}>
                        <p className="text-xs text-gray-600 font-medium flex items-center gap-2">
                          Choose delivery speed:
                          {isCalculatingShipping && (
                            <span className="animate-spin w-3 h-3 border-2 border-primary border-t-transparent rounded-full" />
                          )}
                        </p>
                        <div className="space-y-2">
                          {shippingData.shippingOptions.map((option) => (
                            <label 
                              key={option.serviceId}
                              className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                                isCalculatingShipping ? 'cursor-wait' : 'cursor-pointer'
                              } ${
                                selectedShippingService === option.serviceId 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              data-testid={`shipping-option-${option.serviceId}`}
                            >
                              <input
                                type="radio"
                                name="shippingService"
                                value={option.serviceId}
                                checked={selectedShippingService === option.serviceId}
                                onChange={() => setSelectedShippingService(option.serviceId)}
                                className="mt-1"
                                disabled={isCalculatingShipping}
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm">{option.serviceName}</span>
                                  <span className="font-bold text-sm">
                                    {formatPrice(option.totalShipping)}
                                    {option.upgradeAmount > 0 && (
                                      <span className="text-xs text-gray-500 ml-1">
                                        (+{formatPrice(option.upgradeAmount)})
                                      </span>
                                    )}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500">{option.deliveryTime}</p>
                                <p className="text-xs text-gray-400">{option.description}</p>
                              </div>
                              {option.isDefault && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Selected for you</span>
                              )}
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          Shipping to: {shippingData.zoneName} | Package: {shippingData.requiredParcelTypeName} ({(shippingData.totalWeight / 1000).toFixed(2)}kg)
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span data-testid="text-checkout-total">{formatPrice(subtotal + (fulfillmentMethod === "click_collect" ? 0 : (shippingData?.totalShipping || 0)))}</span>
                  </div>
                  
                  {/* Show crypto equivalent when crypto payment is selected */}
                  {(paymentMethod === "bitcoin" || paymentMethod === "ethereum") && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {paymentMethod === "bitcoin" ? "Bitcoin" : "Ethereum"} Equivalent
                        </span>
                        {cryptoPreview.isLoading ? (
                          <span className="text-sm text-gray-400">Loading rate...</span>
                        ) : (
                          <span className="text-lg font-bold text-primary" data-testid="text-crypto-amount">
                            {paymentMethod === "bitcoin" ? cryptoPreview.btcAmount : cryptoPreview.ethAmount}
                          </span>
                        )}
                      </div>
                      {cryptoPreview.lastUpdated && !cryptoPreview.isLoading && (
                        <p className="text-xs text-gray-500 mt-1">
                          Rate: £{(paymentMethod === "bitcoin" ? cryptoPreview.btcRate : cryptoPreview.ethRate).toLocaleString()} per {paymentMethod === "bitcoin" ? "BTC" : "ETH"}
                          {" "}&bull;{" "}Updated just now
                        </p>
                      )}
                    </div>
                  )}

                  {paymentError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                      {paymentError}
                    </div>
                  )}

                  {/* Crypto order success display */}
                  {cryptoOrderCreated && cryptoOrderDetails && (
                    <div className="space-y-4">
                      <div className="border-2 rounded-lg p-4 bg-primary/5 border-primary">
                        <h3 className="font-bold text-lg mb-3 text-primary">
                          Order #{cryptoOrderDetails.orderNumber} Created
                        </h3>
                        <p className="text-sm text-gray-700 mb-4">
                          Please send the exact amount below to complete your order:
                        </p>
                        
                        <div className="bg-white rounded-lg p-4 space-y-3">
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-medium">Amount to Send</p>
                            <p className="text-xl font-mono font-bold break-all">
                              {cryptoOrderDetails.cryptoAmount}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-medium">
                              {paymentMethod === "bitcoin" ? "Bitcoin" : "Ethereum"} Wallet Address
                            </p>
                            <p className="text-sm font-mono break-all bg-gray-100 p-2 rounded select-all">
                              {cryptoOrderDetails.walletAddress}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                navigator.clipboard.writeText(cryptoOrderDetails.walletAddress);
                                toast({ title: "Copied!", description: "Wallet address copied to clipboard" });
                              }}
                            >
                              Copy Address
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Important:</strong> Your order will be verified within 12 hours after payment.
                            You'll receive an email confirmation once verified.
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setLocation(`/order-confirmation?orderId=${cryptoOrderDetails.orderId}`)}
                      >
                        View Order Details
                      </Button>
                    </div>
                  )}

                  {/* Card payment flow */}
                  {!cryptoOrderCreated && paymentMethod === "card" && (
                    <>
                      {!showPaymentForm ? (
                        <Button 
                          onClick={handleCheckout} 
                          size="lg" 
                          className="w-full bg-primary hover:bg-primary/90" 
                          disabled={
                            isProcessing || 
                            (fulfillmentMethod === "delivery" && (isCalculatingShipping || !!shippingError || !shippingData)) ||
                            (fulfillmentMethod === "click_collect" && (!collectionDate || !collectionTimeSlot))
                          } 
                          data-testid="button-complete-checkout"
                        >
                          <FiLock className="mr-2" />
                          {isProcessing ? "Setting up payment..." : 
                           fulfillmentMethod === "delivery" && isCalculatingShipping ? "Calculating shipping..." : 
                           fulfillmentMethod === "delivery" && shippingError ? "Cannot proceed - shipping error" : 
                           fulfillmentMethod === "delivery" && !shippingData ? "Select shipping country" : 
                           fulfillmentMethod === "click_collect" && (!collectionDate || !collectionTimeSlot) ? "Select collection date & time" :
                           "Proceed to Card Payment"}
                        </Button>
                      ) : (
                        stripePromise && clientSecret && (
                          <Elements stripe={stripePromise} options={{ clientSecret }}>
                            <StripePaymentForm 
                              onSuccess={handlePaymentSuccess}
                              onError={(msg) => setPaymentError(msg)}
                              total={subtotal + (fulfillmentMethod === "click_collect" ? 0 : (shippingData?.totalShipping || 0))}
                              orderId={pendingOrderId}
                            />
                          </Elements>
                        )
                      )}
                    </>
                  )}

                  {/* Crypto payment flow */}
                  {!cryptoOrderCreated && (paymentMethod === "bitcoin" || paymentMethod === "ethereum") && (
                    <Button 
                      onClick={handleCryptoCheckout} 
                      size="lg" 
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={
                        isProcessing || 
                        (fulfillmentMethod === "delivery" && (isCalculatingShipping || !!shippingError || !shippingData)) ||
                        (fulfillmentMethod === "click_collect" && (!collectionDate || !collectionTimeSlot))
                      } 
                      data-testid="button-crypto-checkout"
                    >
                      <FiLock className="mr-2" />
                      {isProcessing ? "Creating order..." : 
                       fulfillmentMethod === "delivery" && isCalculatingShipping ? "Calculating shipping..." : 
                       fulfillmentMethod === "delivery" && shippingError ? "Cannot proceed - shipping error" : 
                       fulfillmentMethod === "delivery" && !shippingData ? "Select shipping country" : 
                       fulfillmentMethod === "click_collect" && (!collectionDate || !collectionTimeSlot) ? "Select collection date & time" :
                       `Pay with ${paymentMethod === "bitcoin" ? "Bitcoin" : "Ethereum"}`}
                    </Button>
                  )}

                  <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-2">
                    <FiLock className="w-3 h-3" />
                    Your payment is secured with industry-standard encryption.
                  </p>
                </CardContent>
              </Card>

              <div className="text-center text-sm text-gray-500">
                <p>Questions? Contact us at support@lanorahouse.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
