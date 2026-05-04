import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, MessageSquare } from "lucide-react";

interface ProductOfferFormProps {
  productId: string;
  productName: string;
  productPrice: string;
  isAuthenticated: boolean;
}

const offerSchema = z.object({
  offerAmount: z.string().min(1, "Offer amount is required").refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    "Must be a valid positive number"
  ),
  message: z.string().optional(),
});

type OfferFormValues = z.infer<typeof offerSchema>;

export default function ProductOfferForm({ 
  productId, 
  productName, 
  productPrice,
  isAuthenticated 
}: ProductOfferFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      offerAmount: "",
      message: "",
    },
  });

  const createOfferMutation = useMutation({
    mutationFn: async (data: OfferFormValues) => {
      return apiRequest("POST", `/api/products/${productId}/offers`, data);
    },
    onSuccess: () => {
      toast({
        title: "Offer Submitted",
        description: "Your offer has been sent to the seller. You'll be notified of their response.",
      });
      form.reset();
      setIsOpen(false);
      // Invalidate user offers cache
      queryClient.invalidateQueries({ queryKey: ["/api/users/me/offers"] });
    },
    onError: (error) => {
      console.error("Error creating offer:", error);
      toast({
        title: "Error",
        description: "Failed to submit offer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OfferFormValues) => {
    createOfferMutation.mutate(data);
  };

  if (!isAuthenticated) {
    return (
      <Button onClick={() => window.location.href = "/api/login"} className="w-full">
        <DollarSign className="w-4 h-4 mr-2" />
        Login to Make an Offer
      </Button>
    );
  }

  const suggestedOffers = [
    Math.max(parseFloat(productPrice) * 0.8, 1),
    Math.max(parseFloat(productPrice) * 0.9, 1),
    Math.max(parseFloat(productPrice) * 0.95, 1),
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <DollarSign className="w-4 h-4 mr-2" />
          Make an Offer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Make an Offer</DialogTitle>
          <DialogDescription>
            Send a custom offer for "{productName}". The seller will review and respond to your offer.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Current Price: £{parseFloat(productPrice).toFixed(2)}</p>
          <div className="flex gap-2">
            <span className="text-sm font-medium">Quick offers:</span>
            {suggestedOffers.map((amount, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => form.setValue("offerAmount", amount.toFixed(2))}
              >
                £{amount.toFixed(2)}
              </Badge>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="offerAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Offer (£)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Enter your offer amount"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the amount you're willing to pay for this item.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add a personal message to the seller..."
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Include any additional details about your offer.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createOfferMutation.isPending}>
                {createOfferMutation.isPending ? "Sending..." : "Send Offer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}