import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { LoaderCircle, Copy, Check, Bitcoin, Truck, Store, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import InstantWinPopup from "@/components/InstantWinPopup";
import { SiEthereum } from "react-icons/si";

const CRYPTO_WALLETS = {
  btc: "bc1qda559v6e7d9hwptpyq85m6ahsclmhku55g8728",
  eth: "0x65b2792d9D003D2b29C3E5D10a038fb8F5bef029",
};
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormData = {
  name: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  sameAsBilling: boolean;
};

const countries = [
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" },
  { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" },
  { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BR", name: "Brazil" },
  { code: "BG", name: "Bulgaria" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CI", name: "Côte d'Ivoire" },
  { code: "CO", name: "Colombia" },
  { code: "CR", name: "Costa Rica" },
  { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "DO", name: "Dominican Republic" },
  { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" },
  { code: "EE", name: "Estonia" },
  { code: "ET", name: "Ethiopia" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GI", name: "Gibraltar" },
  { code: "GR", name: "Greece" },
  { code: "GT", name: "Guatemala" },
  { code: "HN", name: "Honduras" },
  { code: "HK", name: "Hong Kong" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KW", name: "Kuwait" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MY", name: "Malaysia" },
  { code: "MT", name: "Malta" },
  { code: "MX", name: "Mexico" },
  { code: "MA", name: "Morocco" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" },
  { code: "NG", name: "Nigeria" },
  { code: "NO", name: "Norway" },
  { code: "PK", name: "Pakistan" },
  { code: "PA", name: "Panama" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "QA", name: "Qatar" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "RS", name: "Serbia" },
  { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "ZA", name: "South Africa" },
  { code: "KR", name: "South Korea" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "TW", name: "Taiwan" },
  { code: "TH", name: "Thailand" },
  { code: "TR", name: "Turkey" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "UY", name: "Uruguay" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
];

interface CheckoutFormProps {
  amount: number;
  cartItems: any[];
  guestInfo?: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  testMode?: boolean;
  testData?: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export default function CheckoutForm({
  amount,
  cartItems,
  guestInfo,
  testMode,
  testData,
}: CheckoutFormProps) {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [instantWins, setInstantWins] = useState<any[]>([]);
  const [showInstantWinPopup, setShowInstantWinPopup] = useState(false);
  const [savedOrderData, setSavedOrderData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "crypto">("card");
  const [selectedCrypto, setSelectedCrypto] = useState<"btc" | "eth">("btc");
  const [transactionHash, setTransactionHash] = useState("");
  const [copiedAddress, setCopiedAddress] = useState(false);
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

  const form = useForm<FormData>({
    defaultValues:
      testMode && testData
        ? {
            name: `${testData.firstName} ${testData.lastName}`,
            email: testData.email,
            phone: testData.phone,
            address1: testData.address,
            address2: "",
            city: testData.city,
            state: "",
            postcode: testData.postalCode,
            country: testData.country,
            sameAsBilling: true,
          }
        : {
            name: guestInfo
              ? `${guestInfo.firstName} ${guestInfo.lastName}`
              : "",
            email: guestInfo?.email || "",
            phone: guestInfo?.phone || "",
            address1: "",
            address2: "",
            city: "",
            state: "",
            postcode: "",
            country: "United Kingdom",
            sameAsBilling: true,
          },
  });

  // Update form values when test mode changes
  useEffect(() => {
    if (testMode && testData) {
      form.reset({
        name: `${testData.firstName} ${testData.lastName}`,
        email: testData.email,
        phone: testData.phone,
        address1: testData.address,
        address2: "",
        city: testData.city,
        state: "",
        postcode: testData.postalCode,
        country: testData.country,
        sameAsBilling: true,
      });
    } else {
      form.reset({
        name: guestInfo ? `${guestInfo.firstName} ${guestInfo.lastName}` : "",
        email: guestInfo?.email || "",
        phone: guestInfo?.phone || "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        postcode: "",
        country: "United Kingdom",
        sameAsBilling: true,
      });
    }
  }, [testMode, testData, guestInfo, form]);

  const handleInstantWinPopupClose = () => {
    setShowInstantWinPopup(false);
    setInstantWins([]);
    
    // Now redirect to order confirmation
    if (savedOrderData) {
      const confirmationUrl = savedOrderData.orderId
        ? `/order-confirmation?payment_intent=${savedOrderData.paymentIntentId}&order_id=${savedOrderData.orderId}`
        : `/order-confirmation?payment_intent=${savedOrderData.paymentIntentId}`;
      setLocation(confirmationUrl);
    }
  };

  const handleCopyAddress = async () => {
    const address = CRYPTO_WALLETS[selectedCrypto];
    await navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
    toast({
      title: "Address Copied",
      description: "Wallet address has been copied to clipboard",
    });
  };

  const handleCryptoSubmit = async (data: FormData) => {
    // Validate click & collect fields
    if (fulfillmentMethod === "click_collect") {
      if (!collectionDate) {
        toast({
          title: "Collection Date Required",
          description: "Please select a collection date",
          variant: "destructive",
        });
        return;
      }
      if (!collectionTimeSlot) {
        toast({
          title: "Collection Time Required",
          description: "Please select a collection time slot",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const shippingDetails = fulfillmentMethod === "click_collect" 
        ? { name: data.name, email: data.email, phone: data.phone }
        : {
            name: data.name,
            email: data.email,
            phone: data.phone,
            address1: data.address1,
            address2: data.address2,
            city: data.city,
            state: data.state,
            postcode: data.postcode,
            country: data.country,
          };

      const billingDetails = shippingDetails;
      const shippingCost = fulfillmentMethod === "click_collect" ? 0 : 6;
      const effectiveTotal = fulfillmentMethod === "click_collect" ? amount - 6 : amount;

      const response = await fetch("/api/orders/crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingDetails,
          billingDetails,
          cartData: {
            items: cartItems || [],
            subtotal: amount - shippingCost - amount * 0.2,
            shipping: shippingCost,
            tax: amount * 0.2,
            total: effectiveTotal,
            discount: 0,
          },
          cryptoCurrency: selectedCrypto,
          transactionHash: transactionHash || null,
          fulfillmentMethod,
          collectionDate: fulfillmentMethod === "click_collect" ? collectionDate : null,
          collectionTimeSlot: fulfillmentMethod === "click_collect" ? collectionTimeSlot : null,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      const result = await response.json();
      
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });

      toast({
        title: "Order Submitted",
        description: "Your order has been created. We will confirm your payment within 12 hours.",
      });

      setLocation(`/order-confirmation?order_id=${result.orderId}&crypto=true`);
    } catch (error: any) {
      console.error("Crypto payment failed:", error);
      toast({
        title: "Order Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: FormData) => {
    // Validate click & collect fields
    if (fulfillmentMethod === "click_collect") {
      if (!collectionDate) {
        toast({
          title: "Collection Date Required",
          description: "Please select a collection date",
          variant: "destructive",
        });
        return;
      }
      if (!collectionTimeSlot) {
        toast({
          title: "Collection Time Required",
          description: "Please select a collection time slot",
          variant: "destructive",
        });
        return;
      }
    }

    if (!stripe || !elements) {
      toast({
        title: "Error",
        description: "Stripe is not loaded yet. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast({
        title: "Error",
        description: "Card element not found. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setCardError(null);

    try {
      // 1. Create payment intent with auth headers
      console.log("Creating payment intent with amount:", amount);

      // Include credentials to ensure cookies are sent
      // 1) Call the API
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
        credentials: "include",
      });

      // 2) If it's not 2xx, read out the body text
      if (!response.ok) {
        const text = await response.text();
        console.error("[Checkout] non-JSON response:", text);
        throw new Error(`Payment setup failed (${response.status})`);
      }

      // 3) Try parsing JSON, otherwise log the raw
      let paymentIntent: { clientSecret: string };
      try {
        paymentIntent = await response.json();
      } catch (err) {
        const text = await response.text();
        console.error("[Checkout] invalid JSON response:", text);
        throw new Error("Invalid response from payment setup");
      }

      if (!paymentIntent || !paymentIntent.clientSecret) {
        throw new Error(
          "Failed to create payment intent - no client secret returned",
        );
      }

      // 2. Confirm card payment
      const { error, paymentIntent: confirmedIntent } =
        await stripe.confirmCardPayment(paymentIntent.clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: data.name,
              email: data.email,
              phone: data.phone,
              address: {
                line1: data.address1,
                line2: data.address2 || undefined,
                city: data.city,
                state: data.state,
                postal_code: data.postcode,
                country: data.country,
              },
            },
          },
        });

      if (error) {
        throw new Error(error.message);
      }

      if (confirmedIntent.status === "succeeded") {
        // 3. Save order to database
        const shippingDetails = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address1: data.address1,
          address2: data.address2,
          city: data.city,
          state: data.state,
          postcode: data.postcode,
          country: data.country,
        };

        const billingDetails = data.sameAsBilling
          ? shippingDetails
          : {
              name: data.name,
              email: data.email,
              phone: data.phone,
              address1: data.address1,
              address2: data.address2,
              city: data.city,
              state: data.state,
              postcode: data.postcode,
              country: data.country,
            };

        // Calculate shipping based on fulfillment method
        const shippingCost = fulfillmentMethod === "click_collect" ? 0 : 6;
        const effectiveTotal = fulfillmentMethod === "click_collect" ? amount - 6 : amount;

        // Save order with cart data to bypass authentication issues
        const saveOrderResponse = await fetch("/api/save-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentIntentId: confirmedIntent.id,
            paymentMethodId: confirmedIntent.payment_method,
            shippingDetails: fulfillmentMethod === "click_collect" ? { name: data.name, email: data.email, phone: data.phone } : shippingDetails,
            billingDetails,
            cartData: {
              items: cartItems || [],
              subtotal: amount - shippingCost - amount * 0.2,
              shipping: shippingCost,
              tax: amount * 0.2,
              total: effectiveTotal,
              discount: 0,
            },
            fulfillmentMethod,
            collectionDate: fulfillmentMethod === "click_collect" ? collectionDate : null,
            collectionTimeSlot: fulfillmentMethod === "click_collect" ? collectionTimeSlot : null,
          }),
          credentials: "include",
        });

        let orderId = null;
        let orderResult = null;
        if (saveOrderResponse.ok) {
          orderResult = await saveOrderResponse.json();
          orderId = orderResult.orderId;
          console.log("Order saved with ID:", orderId);
          console.log("Full order result:", orderResult);
          
          queryClient.invalidateQueries({ queryKey: ["raffleEntries"] });
          queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
        } else {
          console.error("Error saving order:", await saveOrderResponse.json());
        }

        // 4. Clear cart
        const clearCartResponse = await fetch("/api/clear-cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
          credentials: "include",
        });

        if (!clearCartResponse.ok) {
          console.error("Error clearing cart:", await clearCartResponse.json());
        } else {
          // Force cart refresh after successful clear
          queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
        }

        // 5. Save address to user profile
        const saveAddressResponse = await fetch("/api/save-address", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shipping: shippingDetails,
            billing: billingDetails,
          }),
          credentials: "include",
        });

        if (!saveAddressResponse.ok) {
          console.error(
            "Error saving address:",
            await saveAddressResponse.json(),
          );
        }

        // Show success message
        toast({
          title: "Payment Successful",
          description: "Your order has been placed successfully!",
        });

        // Redirect to order confirmation page with instant win data if any
        const instantWins = orderResult?.instantWins || [];
        let confirmationUrl = orderId
          ? `/order-confirmation?payment_intent=${confirmedIntent.id}&order_id=${orderId}`
          : `/order-confirmation?payment_intent=${confirmedIntent.id}`;
        
        // Add instant wins to URL if they exist
        if (instantWins.length > 0) {
          const instantWinData = encodeURIComponent(JSON.stringify(instantWins));
          confirmationUrl += `&instant_wins=${instantWinData}`;
        }
        
        setLocation(confirmationUrl);
      } else {
        throw new Error("Payment did not complete. Please try again.");
      }
    } catch (error: any) {
      console.error("Payment failed:", error);
      setCardError(error.message || "Payment failed. Please try again.");
      toast({
        title: "Payment Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Fulfillment Method Selector */}
      <div>
        <h3 className="text-lg font-medium mb-4">Delivery Method</h3>
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
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              {...form.register("name", { required: true })}
              placeholder="Your full name"
              className={`mt-1 ${form.formState.errors.name ? "border-red-500 focus:border-red-500" : ""}`}
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email", { required: true })}
              placeholder="Your email address"
              className={`mt-1 ${form.formState.errors.email ? "border-red-500 focus:border-red-500" : ""}`}
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              {...form.register("phone", { required: true })}
              placeholder="Your phone number"
              className={`mt-1 ${form.formState.errors.phone ? "border-red-500 focus:border-red-500" : ""}`}
            />
          </div>
        </div>
      </div>

      <Separator />

      {fulfillmentMethod === "delivery" ? (
        <>
          <div>
            <h3 className="text-lg font-medium mb-4">Shipping Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="address1">Address Line 1</Label>
                <Input
                  id="address1"
                  {...form.register("address1", { required: fulfillmentMethod === "delivery" })}
                  placeholder="Street address"
                  className={`mt-1 ${form.formState.errors.address1 ? "border-red-500 focus:border-red-500" : ""}`}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                <Input
                  id="address2"
                  {...form.register("address2")}
                  placeholder="Apartment, suite, etc."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="city">City / Town</Label>
                <Input
                  id="city"
                  {...form.register("city", { required: fulfillmentMethod === "delivery" })}
                  placeholder="City"
                  className={`mt-1 ${form.formState.errors.city ? "border-red-500 focus:border-red-500" : ""}`}
                />
              </div>
              <div>
                <Label htmlFor="state">County / State (Optional)</Label>
                <Input
                  id="state"
                  {...form.register("state")}
                  placeholder="County"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="postcode">Postcode / ZIP</Label>
                <Input
                  id="postcode"
                  {...form.register("postcode", { required: fulfillmentMethod === "delivery" })}
                  placeholder="Postcode"
                  className={`mt-1 ${form.formState.errors.postcode ? "border-red-500 focus:border-red-500" : ""}`}
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Select
                  value={form.watch("country") || "GB"}
                  onValueChange={(value) => form.setValue("country", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sameAsBilling"
              className="rounded border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              {...form.register("sameAsBilling")}
            />
            <Label htmlFor="sameAsBilling" className="cursor-pointer">
              Billing address same as shipping
            </Label>
          </div>
        </>
      ) : (
        <div>
          <h3 className="text-lg font-medium mb-4">Collection Details</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <Store className="h-5 w-5" />
              <span className="font-medium">Free Collection - Save on shipping!</span>
            </div>
            <p className="text-sm text-green-600">
              Pick up your items from our store. Available Monday to Friday, 12:00 PM - 5:00 PM.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="collectionDate">Collection Date</Label>
              <div className="relative mt-1">
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
              <p className="text-xs text-gray-500 mt-1">Monday to Friday only</p>
            </div>
            <div>
              <Label htmlFor="collectionTime">Collection Time</Label>
              <Select
                value={collectionTimeSlot}
                onValueChange={setCollectionTimeSlot}
              >
                <SelectTrigger className="mt-1" data-testid="select-collection-time">
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
        </div>
      )}

      <Separator />

      <div>
        <h3 className="text-lg font-medium mb-4">Payment Method</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
            <span className="font-medium">Card</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("crypto")}
            className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
              paymentMethod === "crypto"
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
            data-testid="btn-payment-crypto"
          >
            <Bitcoin className="h-6 w-6" />
            <span className="font-medium">Crypto</span>
          </button>
        </div>

        {paymentMethod === "card" && (
          <>
            {testMode && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-medium text-blue-800 mb-2">
                  Test Mode - Use These Card Details:
                </h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Card Number:</strong> 4242 4242 4242 4242</p>
                  <p><strong>Expiry:</strong> Any future date (e.g., 12/34)</p>
                  <p><strong>CVC:</strong> Any 3 digits (e.g., 123)</p>
                </div>
              </div>
            )}
            <div className="border rounded-md p-4 bg-neutral-50">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#424770",
                      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSmoothing: "antialiased",
                      "::placeholder": { color: "#aab7c4" },
                    },
                    invalid: { color: "#9e2146" },
                  },
                  hidePostalCode: true,
                }}
              />
              {cardError && <p className="text-red-500 text-sm mt-2">{cardError}</p>}
            </div>
          </>
        )}

        {paymentMethod === "crypto" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedCrypto("btc")}
                className={`p-3 border-2 rounded-lg flex items-center gap-3 transition-all ${
                  selectedCrypto === "btc"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                data-testid="btn-crypto-btc"
              >
                <Bitcoin className="h-8 w-8 text-orange-500" />
                <div className="text-left">
                  <p className="font-medium">Bitcoin</p>
                  <p className="text-xs text-gray-500">BTC</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCrypto("eth")}
                className={`p-3 border-2 rounded-lg flex items-center gap-3 transition-all ${
                  selectedCrypto === "eth"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                data-testid="btn-crypto-eth"
              >
                <SiEthereum className="h-8 w-8 text-purple-500" />
                <div className="text-left">
                  <p className="font-medium">Ethereum</p>
                  <p className="text-xs text-gray-500">ETH</p>
                </div>
              </button>
            </div>

            <div className="bg-gray-50 border rounded-lg p-4">
              <p className="text-sm font-medium mb-2">
                Send exactly £{amount.toFixed(2)} worth of {selectedCrypto === "btc" ? "Bitcoin" : "Ethereum"} to:
              </p>
              <div className="flex items-center gap-2 bg-white border rounded p-3">
                <code className="flex-1 text-sm break-all font-mono">
                  {CRYPTO_WALLETS[selectedCrypto]}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAddress}
                  data-testid="btn-copy-address"
                >
                  {copiedAddress ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="transactionHash">Transaction Hash (Optional)</Label>
              <Input
                id="transactionHash"
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
                placeholder="Enter your transaction hash for faster verification"
                className="mt-1"
                data-testid="input-transaction-hash"
              />
              <p className="text-xs text-gray-500 mt-1">
                Providing your transaction hash helps us verify your payment faster.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> After sending your payment, click "I've Sent Payment" below. 
                Your order will be created and we will verify your payment within 12 hours.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4">
        {paymentMethod === "card" ? (
          <>
            <Button type="submit" className="w-full" disabled={!stripe || loading} data-testid="btn-pay-card">
              {loading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay £${amount.toFixed(2)}`
              )}
            </Button>
            <p className="text-xs text-center mt-4 text-neutral-500">
              Your payment is processed securely by Stripe. Your card details never touch our servers.
            </p>
          </>
        ) : (
          <>
            <Button 
              type="button" 
              className="w-full bg-green-600 hover:bg-green-700" 
              disabled={loading}
              onClick={form.handleSubmit(handleCryptoSubmit)}
              data-testid="btn-confirm-crypto"
            >
              {loading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Order...
                </>
              ) : (
                `I've Sent Payment - £${amount.toFixed(2)}`
              )}
            </Button>
            <p className="text-xs text-center mt-4 text-neutral-500">
              Your payment will be manually verified. Allow up to 12 hours for confirmation.
            </p>
          </>
        )}
      </div>
    </form>
    
    {/* Instant Win Popup */}
    <InstantWinPopup
      isOpen={showInstantWinPopup}
      onClose={handleInstantWinPopupClose}
      instantWins={instantWins}
    />
    </>
  );
}
