import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { FiCreditCard, FiAlertCircle } from "react-icons/fi";
import { LoaderCircle } from "lucide-react";

// Form validation schema
const formSchema = z.object({
  maxAmount: z.string()
    .min(1, "Please set a maximum bid amount")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Maximum bid must be a positive number",
    }),
  paymentMethodId: z.string()
    .min(1, "Please select a payment method"),
});

type FormValues = z.infer<typeof formSchema>;

interface PaymentMethod {
  id: number;
  cardBrand: string;
  cardLast4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface AutoBidFormProps {
  auctionId?: string;
  catalogItemId?: string;
  startingBid: string;
  incrementAmount: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AutoBidForm({ 
  auctionId, 
  catalogItemId, 
  startingBid, 
  incrementAmount, 
  onSuccess, 
  onCancel 
}: AutoBidFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [displayValue, setDisplayValue] = useState<string>("");
  
  const startingBidValue = parseFloat(startingBid);
  const increment = parseFloat(incrementAmount);
  
  // Calculate suggested maximum values for the slider
  const suggestedValues = {
    min: startingBidValue,
    low: startingBidValue + (increment * 5),
    medium: startingBidValue + (increment * 10),
    high: startingBidValue + (increment * 20),
  };

  // Fetch payment methods
  const { data: paymentMethods, isLoading: loadingPaymentMethods, error: paymentMethodsError } = useQuery({
    queryKey: ["/api/payment-methods"],
    retry: false,
  });

  // Determine if user has payment methods
  const hasPaymentMethods = !loadingPaymentMethods && paymentMethods && paymentMethods.length > 0;

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      maxAmount: startingBid,
      paymentMethodId: "",
    },
  });

  // Set initial form values
  useEffect(() => {
    if (!loadingPaymentMethods && paymentMethods && paymentMethods.length > 0) {
      // Find default payment method
      const defaultMethod = paymentMethods.find((method: PaymentMethod) => method.isDefault);
      form.setValue("paymentMethodId", defaultMethod ? String(defaultMethod.id) : String(paymentMethods[0].id));
    }
    
    setSliderValue(startingBidValue);
    setDisplayValue(formatCurrency(startingBidValue));
    form.setValue("maxAmount", startingBid);
  }, [loadingPaymentMethods, paymentMethods, form, startingBid, startingBidValue]);

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    const newValue = value[0];
    setSliderValue(newValue);
    setDisplayValue(formatCurrency(newValue));
    form.setValue("maxAmount", String(newValue));
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^\d.]/g, "");
    if (inputValue === "" || isNaN(parseFloat(inputValue))) {
      setDisplayValue("");
      form.setValue("maxAmount", "");
      return;
    }

    const newValue = parseFloat(inputValue);
    if (newValue < startingBidValue) {
      setSliderValue(startingBidValue);
      setDisplayValue(formatCurrency(startingBidValue));
      form.setValue("maxAmount", String(startingBidValue));
    } else if (newValue > suggestedValues.high * 2) {
      setSliderValue(suggestedValues.high * 2);
      setDisplayValue(formatCurrency(suggestedValues.high * 2));
      form.setValue("maxAmount", String(suggestedValues.high * 2));
    } else {
      setSliderValue(newValue);
      setDisplayValue(formatCurrency(newValue));
      form.setValue("maxAmount", String(newValue));
    }
  };

  // Mutation for creating auto bid
  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/auto-bids", data),
    onSuccess: () => {
      toast({
        title: "Auto-bid created",
        description: "Your auto-bid has been set up successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auto-bids"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating auto-bid",
        description: error.message || "There was a problem setting up your auto-bid.",
        variant: "destructive",
      });
    },
  });

  // Submit handler
  const onSubmit = (data: FormValues) => {
    mutation.mutate({
      auctionId,
      catalogItemId,
      maxAmount: data.maxAmount,
      paymentMethodId: parseInt(data.paymentMethodId),
    });
  };

  if (loadingPaymentMethods) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!hasPaymentMethods) {
    return (
      <div className="p-6 text-center">
        <FiCreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Payment Method Required</h3>
        <p className="text-muted-foreground mb-4">
          You need to add a payment method before setting up auto-bids.
        </p>
        <Button 
          onClick={() => {
            toast({
              title: "Redirecting to Payment Methods",
              description: "You'll need to add a payment method first.",
            });
            window.location.href = "/auto-bids";
          }}
        >
          Add Payment Method
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Max Bid Amount */}
        <FormField
          control={form.control}
          name="maxAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Bid Amount</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <Input
                          value={displayValue}
                          onChange={handleInputChange}
                          className="pl-8 text-lg font-semibold h-12"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Starting bid: {formatCurrency(startingBidValue)} • Increment: {formatCurrency(increment)}
                    </p>
                  </div>
                  
                  <Slider
                    value={[sliderValue]}
                    min={startingBidValue}
                    max={suggestedValues.high * 2}
                    step={increment}
                    onValueChange={handleSliderChange}
                  />
                  
                  <div className="flex justify-between text-sm">
                    <span>{formatCurrency(suggestedValues.min)}</span>
                    <span className="text-muted-foreground">Recommended</span>
                    <span>{formatCurrency(suggestedValues.high)}</span>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSliderValue(suggestedValues.low);
                        setDisplayValue(formatCurrency(suggestedValues.low));
                        form.setValue("maxAmount", String(suggestedValues.low));
                      }}
                    >
                      Low: {formatCurrency(suggestedValues.low)}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSliderValue(suggestedValues.medium);
                        setDisplayValue(formatCurrency(suggestedValues.medium));
                        form.setValue("maxAmount", String(suggestedValues.medium));
                      }}
                    >
                      Medium: {formatCurrency(suggestedValues.medium)}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSliderValue(suggestedValues.high);
                        setDisplayValue(formatCurrency(suggestedValues.high));
                        form.setValue("maxAmount", String(suggestedValues.high));
                      }}
                    >
                      High: {formatCurrency(suggestedValues.high)}
                    </Button>
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                Set the maximum amount you're willing to bid. Your bid will only increase as needed to stay ahead of other bidders, up to this maximum.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Payment Method */}
        <FormField
          control={form.control}
          name="paymentMethodId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {paymentMethods.map((method: PaymentMethod) => (
                    <SelectItem key={method.id} value={String(method.id)}>
                      {method.cardBrand} •••• {method.cardLast4} {method.isDefault ? "(Default)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the payment method to use for this auto-bid.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm flex items-start space-x-2">
          <FiAlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 font-medium">Important</p>
            <p className="text-amber-700">
              By setting up an auto-bid, you authorize the auction house to place bids on your behalf, up to your maximum bid amount. You agree to pay the winning bid amount if your auto-bid is successful.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Setting Up...
              </>
            ) : (
              "Set Up Auto-Bid"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}