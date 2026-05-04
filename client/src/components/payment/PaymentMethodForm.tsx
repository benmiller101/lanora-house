import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { FiCreditCard, FiUser, FiCalendar, FiLock } from "react-icons/fi";
import { LoaderCircle } from "lucide-react";

const formSchema = z.object({
  cardNumber: z
    .string()
    .min(16, "Card number must be at least 16 digits")
    .max(19, "Card number must be at most 19 digits")
    .regex(/^[0-9]+$/, "Card number must contain only digits"),
  cardHolder: z.string().min(3, "Cardholder name is required"),
  expiryMonth: z
    .string()
    .min(1, "Expiry month is required")
    .max(2, "Invalid month")
    .regex(/^(0?[1-9]|1[0-2])$/, "Month must be between 1-12"),
  expiryYear: z
    .string()
    .min(4, "Expiry year must be 4 digits")
    .max(4, "Expiry year must be 4 digits")
    .regex(/^20[2-9][0-9]$/, "Year must be valid and in the future"),
  cvv: z
    .string()
    .min(3, "CVV must be 3 or 4 digits")
    .max(4, "CVV must be 3 or 4 digits")
    .regex(/^[0-9]+$/, "CVV must contain only digits"),
  isDefault: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

type PaymentMethodFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function PaymentMethodForm({
  onSuccess,
  onCancel,
}: PaymentMethodFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [cardType, setCardType] = useState<string>("");

  // Get current year to validate expiry date
  const currentYear = new Date().getFullYear();

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardNumber: "",
      cardHolder: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      isDefault: false,
    },
  });

  // Mutation for adding payment method
  const mutation = useMutation({
    mutationFn: (data: FormValues) => apiRequest("POST", "/api/payment-methods", data),
    onSuccess: () => {
      toast({
        title: "Payment method added",
        description: "Your card has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error adding payment method",
        description: error.message || "There was a problem adding your card.",
        variant: "destructive",
      });
    },
  });

  // Detect card type based on first digits
  const detectCardType = (number: string) => {
    const firstDigit = number.charAt(0);
    const firstTwoDigits = number.slice(0, 2);
    const firstFourDigits = number.slice(0, 4);
    const firstSixDigits = number.slice(0, 6);

    if (firstDigit === "4") {
      return "Visa";
    } else if (firstTwoDigits >= "51" && firstTwoDigits <= "55") {
      return "Mastercard";
    } else if (
      firstTwoDigits === "34" ||
      firstTwoDigits === "37"
    ) {
      return "Amex";
    } else if (
      firstFourDigits === "6011" ||
      (firstSixDigits >= "622126" && firstSixDigits <= "622925") ||
      (firstTwoDigits === "64" || firstTwoDigits === "65")
    ) {
      return "Discover";
    }
    return "";
  };

  // Format card number for display
  const formatCardNumber = (value: string) => {
    if (!value) return value;
    // Clean non-digits
    const v = value.replace(/\D/g, "");
    
    const cardBrand = detectCardType(v);
    setCardType(cardBrand);
    
    // Format based on card type
    if (cardBrand === "Amex") {
      // XXXX XXXXXX XXXXX
      return v.slice(0, 4) + (v.length > 4 ? " " + v.slice(4, 10) + (v.length > 10 ? " " + v.slice(10, 15) : "") : "");
    } else {
      // XXXX XXXX XXXX XXXX
      return v.slice(0, 4) + (v.length > 4 ? " " + v.slice(4, 8) + (v.length > 8 ? " " + v.slice(8, 12) + (v.length > 12 ? " " + v.slice(12, 16) : "") : "") : "");
    }
  };

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    // Clean formatted card number
    const cleanedData = {
      ...data,
      cardNumber: data.cardNumber.replace(/\D/g, ""),
    };
    
    mutation.mutate(cleanedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Add Payment Method</h3>
          <p className="text-sm text-muted-foreground">
            Enter your card details to set up a payment method for auto-bids and purchases.
          </p>
        </div>

        <Separator />
        
        {/* Card Number */}
        <FormField
          control={form.control}
          name="cardNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Number</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    {...field}
                    value={formatCardNumber(field.value)}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value);
                      field.onChange(formatted);
                    }}
                    className="pl-10"
                    maxLength={cardType === "Amex" ? 17 : 19}
                  />
                </FormControl>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <FiCreditCard className="h-4 w-4" />
                </div>
                {cardType && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 font-medium text-sm">
                    {cardType}
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cardholder Name */}
        <FormField
          control={form.control}
          name="cardHolder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cardholder Name</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    placeholder="John Smith"
                    {...field}
                    className="pl-10"
                  />
                </FormControl>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <FiUser className="h-4 w-4" />
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Expiry Date and CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <FormLabel>Expiry Date</FormLabel>
            <div className="flex space-x-2">
              <div className="relative w-1/2">
                <FormField
                  control={form.control}
                  name="expiryMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="MM"
                          {...field}
                          className="pl-9"
                          maxLength={2}
                        />
                      </FormControl>
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <FiCalendar className="h-4 w-4" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="relative w-1/2">
                <FormField
                  control={form.control}
                  name="expiryYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="YYYY"
                          {...field}
                          maxLength={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="cvv"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CVV</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder={cardType === "Amex" ? "4 digits" : "3 digits"}
                      {...field}
                      type="password"
                      className="pl-10"
                      maxLength={cardType === "Amex" ? 4 : 3}
                    />
                  </FormControl>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <FiLock className="h-4 w-4" />
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Default Payment Method */}
        <FormField
          control={form.control}
          name="isDefault"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Set as default payment method</FormLabel>
                <FormDescription>
                  This card will be used as your default payment method for all transactions.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Payment Method"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}