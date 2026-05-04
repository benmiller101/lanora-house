import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FiPlusCircle, FiTrash, FiStar, FiCreditCard } from "react-icons/fi";
import { LoaderCircle, CreditCard } from "lucide-react";
import PaymentMethodForm from "./PaymentMethodForm";

interface PaymentMethod {
  id: number;
  userId: string;
  cardBrand: string;
  cardLast4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PaymentMethods() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch payment methods
  const { data: paymentMethods, isLoading, error } = useQuery({
    queryKey: ["/api/payment-methods"],
    retry: false,
  });

  // Make default mutation
  const makeDefaultMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PUT", `/api/payment-methods/${id}/default`),
    onSuccess: () => {
      toast({
        title: "Default payment method updated",
        description: "Your default payment method has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating default payment method",
        description: error.message || "There was a problem updating your default payment method.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/payment-methods/${id}`),
    onSuccess: () => {
      toast({
        title: "Payment method deleted",
        description: "Your payment method has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      setDeletingId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting payment method",
        description: error.message || "There was a problem removing your payment method.",
        variant: "destructive",
      });
      setDeletingId(null);
    },
  });

  // Handle make default
  const handleMakeDefault = (id: number) => {
    makeDefaultMutation.mutate(id);
  };

  // Handle delete
  const handleDelete = (id: number) => {
    setDeletingId(id);
  };

  // Confirm deletion
  const confirmDelete = () => {
    if (deletingId !== null) {
      deleteMutation.mutate(deletingId);
    }
  };

  // Card logo component
  const CardLogo = ({ brand }: { brand: string }) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return (
          <div className="h-8 w-12 bg-blue-50 flex items-center justify-center rounded">
            <span className="font-bold text-blue-700 text-sm">VISA</span>
          </div>
        );
      case 'mastercard':
        return (
          <div className="h-8 w-12 bg-red-50 flex items-center justify-center rounded">
            <span className="font-bold text-red-700 text-sm">MC</span>
          </div>
        );
      case 'amex':
        return (
          <div className="h-8 w-12 bg-gray-50 flex items-center justify-center rounded">
            <span className="font-bold text-gray-700 text-sm">AMEX</span>
          </div>
        );
      default:
        return (
          <div className="h-8 w-12 bg-gray-100 flex items-center justify-center rounded">
            <FiCreditCard className="text-gray-700" />
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-16 rounded" />
                  <div>
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-16 rounded" />
                  <div>
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-9 w-28" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
          <p className="font-medium">Error loading payment methods</p>
          <p className="text-sm">Please try again or contact support.</p>
        </div>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] })}>
          Try Again
        </Button>
      </div>
    );
  }

  const hasPaymentMethods = paymentMethods && paymentMethods.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Your Payment Methods</h3>
        <Dialog open={isAddingCard} onOpenChange={setIsAddingCard}>
          <DialogTrigger asChild>
            <Button size="sm">
              <FiPlusCircle className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add a Payment Method</DialogTitle>
              <DialogDescription>
                Add a new card to use for auction auto-bids and purchases.
              </DialogDescription>
            </DialogHeader>
            <PaymentMethodForm onSuccess={() => setIsAddingCard(false)} onCancel={() => setIsAddingCard(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {hasPaymentMethods ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {paymentMethods.map((method: PaymentMethod) => (
                <div 
                  key={method.id} 
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center space-x-4">
                    <CardLogo brand={method.cardBrand} />
                    <div>
                      <p className="font-medium">{method.cardBrand} •••• {method.cardLast4}</p>
                      <p className="text-sm text-muted-foreground">
                        Expires {method.expiryMonth < 10 ? `0${method.expiryMonth}` : method.expiryMonth}/{method.expiryYear}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {method.isDefault ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center">
                        <FiStar className="mr-1 h-3 w-3" />
                        Default
                      </Badge>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleMakeDefault(method.id)}
                        disabled={makeDefaultMutation.isPending}
                      >
                        {makeDefaultMutation.isPending ? 
                          <LoaderCircle className="mr-2 h-3 w-3 animate-spin" /> : 
                          <FiStar className="mr-2 h-3 w-3" />
                        }
                        Make Default
                      </Button>
                    )}
                    <AlertDialog open={deletingId === method.id} onOpenChange={(open) => !open && setDeletingId(null)}>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          disabled={method.isDefault || deleteMutation.isPending}
                          onClick={() => handleDelete(method.id)}
                        >
                          <FiTrash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove this payment method? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-red-500 hover:bg-red-600"
                            onClick={confirmDelete}
                          >
                            {deleteMutation.isPending ? (
                              <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              "Delete"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4 text-sm text-muted-foreground">
            Your payment information is securely stored and processed according to industry standards.
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 pb-4 text-center">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="rounded-full bg-muted p-3 mb-4">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium mb-1">No Payment Methods</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                You haven't added any payment methods yet. Add a payment method to place auto-bids and make purchases.
              </p>
              <Button 
                onClick={() => setIsAddingCard(true)}
                className="mt-2"
              >
                <FiPlusCircle className="mr-2 h-4 w-4" />
                Add Your First Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}