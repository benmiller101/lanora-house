import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Download, CreditCard } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PaymentDialog } from "./PaymentDialog";

interface AuctionInvoiceProps {
  catalogId: string;
  onClose?: () => void;
}

export function AuctionInvoice({ catalogId, onClose }: AuctionInvoiceProps) {
  const { toast } = useToast();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // Generate invoice if it doesn't exist, or fetch existing one
  const generateInvoiceMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/auction/invoices/generate/${catalogId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/auction/invoices/${catalogId}`] });
    },
  });

  const { data: invoiceData, isLoading, error } = useQuery({
    queryKey: [`/api/auction/invoices/${catalogId}`],
    enabled: !generateInvoiceMutation.isPending,
    retry: false,
    queryFn: async () => {
      try {
        const response = await fetch(`/api/auction/invoices/${catalogId}`, {
          credentials: "include",
        });
        if (response.status === 404) {
          generateInvoiceMutation.mutate();
          return null;
        }
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch invoice");
        }
        return response.json();
      } catch (error) {
        console.error("Invoice fetch error:", error);
        throw error;
      }
    },
  });

  // Fetch shipping selections for this catalog
  const { data: shippingSelections } = useQuery({
    queryKey: [`/api/auction/lot-shipping/${catalogId}`],
    enabled: !!catalogId,
  });

  const handlePrint = () => {
    window.print();
  };

  if (generateInvoiceMutation.isError || error) {
    const errorMessage = (generateInvoiceMutation.error as any)?.message || (error as any)?.message || "Failed to load invoice";
    return (
      <div className="flex flex-col justify-center items-center p-8 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Unable to Load Invoice</h3>
        <p className="text-muted-foreground mb-4">{errorMessage}</p>
        <Button onClick={() => { 
          generateInvoiceMutation.reset();
          queryClient.invalidateQueries({ queryKey: [`/api/auction/invoices/${catalogId}`] });
        }}>
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading || generateInvoiceMutation.isPending || !invoiceData) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        <p className="ml-3">Loading invoice...</p>
      </div>
    );
  }

  const subtotal = parseFloat(invoiceData.subtotal || "0");
  const buyersPremium = parseFloat(invoiceData.buyersPremium || "0");
  const invoiceBaseTotal = parseFloat(invoiceData.total || "0");

  // Calculate shipping/delivery costs from selections
  let totalShippingCost = 0;
  let totalDeliveryCost = 0;
  if (shippingSelections) {
    Object.values(shippingSelections).forEach((selection: any) => {
      if (selection.shippingCost) {
        totalShippingCost += parseFloat(selection.shippingCost);
      }
      if (selection.deliveryCost) {
        totalDeliveryCost += parseFloat(selection.deliveryCost);
      }
    });
  }

  const totalShippingAndDelivery = totalShippingCost + totalDeliveryCost;
  const total = invoiceBaseTotal + totalShippingAndDelivery;

  const isPaid = invoiceData.status === "paid";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Action buttons - hidden when printing */}
      <div className="flex justify-end gap-2 mb-4 print:hidden">
        {!isPaid && (
          <Button onClick={() => setShowPaymentDialog(true)} className="bg-green-600 hover:bg-green-700" data-testid="button-pay-now">
            <CreditCard className="w-4 h-4 mr-2" />
            Pay Now
          </Button>
        )}
        <Button onClick={handlePrint} variant="outline">
          <Printer className="w-4 h-4 mr-2" />
          Print Invoice
        </Button>
        {onClose && (
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        )}
      </div>

      {/* Payment Dialog */}
      <PaymentDialog
        open={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        catalogId={catalogId}
        total={total}
        invoiceNumber={invoiceData.invoiceNumber}
      />

      {/* Invoice - this will be printed */}
      <Card className="print:shadow-none print:border-0">
        <CardContent className="p-8">
          {/* Header with logo area */}
          <div className="border-b-2 border-primary pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2">INVOICE</h1>
                <p className="text-sm text-muted-foreground">Invoice #: {invoiceData.invoiceNumber}</p>
                <p className="text-sm text-muted-foreground">
                  Date: {new Date(invoiceData.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-primary">Lanora House Auctions Limited</h2>
                <p className="text-sm mt-1">Unit 12b, The Old Foundry Chapel</p>
                <p className="text-sm">Chapel Terrace</p>
                <p className="text-sm">Hayle, Cornwall TR27 4AB</p>
              </div>
            </div>
          </div>

          {/* Auction Details */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Auction Details</h3>
            <p className="text-sm">
              <span className="font-medium">Catalog:</span> {invoiceData.catalog?.name}
            </p>
            <p className="text-sm">
              <span className="font-medium">Auction Date:</span>{" "}
              {new Date(invoiceData.catalog?.startDate).toLocaleDateString()}
            </p>
          </div>

          {/* Lots Table */}
          <div className="mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-primary">
                  <th className="text-left py-2 font-semibold">Lot #</th>
                  <th className="text-left py-2 font-semibold">Description</th>
                  <th className="text-right py-2 font-semibold">Hammer Price</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.lots?.map((lot: any) => (
                  <tr key={lot.id} className="border-b">
                    <td className="py-3">{lot.lotNumber}</td>
                    <td className="py-3">{lot.title}</td>
                    <td className="text-right py-3">
                      £{parseFloat(lot.hammerPrice || "0").toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-80">
              <div className="flex justify-between py-2 border-b">
                <span>Subtotal (Hammer Prices):</span>
                <span className="font-medium">£{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Buyer's Premium (20%):</span>
                <span className="font-medium">£{buyersPremium.toFixed(2)}</span>
              </div>
              {totalShippingCost > 0 && (
                <div className="flex justify-between py-2 border-b">
                  <span>Standard Shipping:</span>
                  <span className="font-medium" data-testid="invoice-shipping-cost">£{totalShippingCost.toFixed(2)}</span>
                </div>
              )}
              {totalDeliveryCost > 0 && (
                <div className="flex justify-between py-2 border-b">
                  <span>Local Delivery:</span>
                  <span className="font-medium" data-testid="invoice-delivery-cost">£{totalDeliveryCost.toFixed(2)}</span>
                </div>
              )}
              {totalShippingAndDelivery === 0 && (
                <div className="flex justify-between py-2 border-b bg-yellow-50 dark:bg-yellow-900/20 px-2 rounded">
                  <span className="text-sm text-yellow-800 dark:text-yellow-200">
                    Shipping not selected
                  </span>
                  <span className="text-sm text-yellow-800 dark:text-yellow-200">Please select</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-t-2 border-primary text-lg font-bold">
                <span>Total Due:</span>
                <span className="text-primary" data-testid="invoice-total">£{total.toFixed(2)}</span>
              </div>
              {totalShippingAndDelivery === 0 && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                  Click "Manage Shipping" to select your shipping preferences
                </p>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-lg mb-3 text-primary">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-1">Bank Transfer Details:</p>
                <p>Account Name: <span className="font-semibold">Lanora House Auctions Limited</span></p>
                <p>Sort Code: <span className="font-semibold">23-11-85</span></p>
                <p>Account Number: <span className="font-semibold">41004076</span></p>
              </div>
              <div>
                <p className="font-medium mb-1">Payment Options:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Bank Transfer (preferred)</li>
                  <li>Payment on collection</li>
                  <li>Card payment (contact us)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Collection Information */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-2">Collection Information</h3>
            <p className="text-sm mb-2">
              Items must be collected from our premises at:
            </p>
            <p className="text-sm font-medium">
              Unit 12b, The Old Foundry Chapel, Chapel Terrace, Hayle, Cornwall TR27 4AB
            </p>
            <p className="text-sm mt-3 text-muted-foreground">
              Please ensure payment is received before collection. For any queries, please contact us.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center text-xs text-muted-foreground">
            <p>Thank you for your purchase at Lanora House Auctions Limited</p>
            <p className="mt-1">This invoice was generated on {new Date().toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
