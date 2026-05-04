import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FiTruck, FiPackage, FiMapPin, FiDollarSign } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { getShippingBandPrice } from "@/../../shared/shipping-bands";

interface ShippingItem {
  id: string;
  name: string;
  shippingBand?: string;
  image?: string;
}

interface ShippingSelection {
  [itemId: string]: {
    method: 'standard_shipping' | 'local_delivery';
    shippingCost?: number;
    deliveryCost?: number;
  };
}

interface DeliveryCalculation {
  success: boolean;
  distance?: number;
  tier?: number;
  tierName?: string;
  cost?: number | null;
  county?: string;
  quoteRequired?: boolean;
  error?: string;
}

export function ShippingCalculator({ items }: { items: ShippingItem[] }) {
  const { toast } = useToast();
  const [selections, setSelections] = useState<ShippingSelection>({});
  const [postcode, setPostcode] = useState("");
  const [deliveryCalculation, setDeliveryCalculation] = useState<DeliveryCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleMethodChange = (itemId: string, method: 'standard_shipping' | 'local_delivery') => {
    const item = items.find(i => i.id === itemId);
    const shippingCost = item?.shippingBand ? getShippingBandPrice(item.shippingBand) : null;
    
    // Validate shipping band
    if (method === 'standard_shipping' && (!item?.shippingBand || shippingCost === null)) {
      toast({
        title: "Invalid Shipping Band",
        description: "This item has an invalid shipping configuration. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    setSelections(prev => ({
      ...prev,
      [itemId]: {
        method,
        shippingCost: method === 'standard_shipping' ? shippingCost : undefined,
        deliveryCost: method === 'local_delivery' ? deliveryCalculation?.cost || undefined : undefined,
      },
    }));
  };

  const calculateDelivery = async () => {
    if (!postcode.trim()) {
      toast({
        title: "Postcode Required",
        description: "Please enter your postcode to calculate delivery cost",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    try {
      const result = await apiRequest<DeliveryCalculation>("POST", "/api/calculate-delivery", {
        postcode: postcode.trim(),
      });

      setDeliveryCalculation(result);

      if (!result.success) {
        toast({
          title: "Calculation Failed",
          description: result.error || "Failed to calculate delivery cost",
          variant: "destructive",
        });
        return;
      }

      if (result.quoteRequired) {
        toast({
          title: "Custom Quote Required",
          description: `Delivery to ${result.county} requires a custom quote. Please contact us for pricing.`,
        });
      } else {
        toast({
          title: "Delivery Cost Calculated",
          description: `${result.distance} miles to ${result.county} - £${result.cost?.toFixed(2)}`,
        });

        // Update all items set to local delivery with the calculated cost
        setSelections(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(itemId => {
            if (updated[itemId].method === 'local_delivery') {
              updated[itemId].deliveryCost = result.cost || undefined;
            }
          });
          return updated;
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to calculate delivery cost",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  // Calculate total costs
  const totalShippingCost = Object.values(selections).reduce((sum, sel) => {
    return sum + (sel.method === 'standard_shipping' ? (sel.shippingCost || 0) : 0);
  }, 0);

  const totalDeliveryCost = Object.values(selections).reduce((sum, sel) => {
    return sum + (sel.method === 'local_delivery' ? (sel.deliveryCost || 0) : 0);
  }, 0);

  const totalCost = totalShippingCost + totalDeliveryCost;

  return (
    <div className="space-y-6">
      {/* Delivery Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiMapPin className="h-5 w-5" />
            Calculate Local Delivery Cost
          </CardTitle>
          <CardDescription>
            Local delivery is calculated based on your location and distance in miles from our Hayle auction house. Enter your postcode to get an instant quote.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="postcode">UK Postcode</Label>
              <Input
                id="postcode"
                placeholder="TR27 4AB"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                data-testid="input-postcode"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={calculateDelivery}
                disabled={isCalculating || !postcode.trim()}
                data-testid="button-calculate-delivery"
              >
                {isCalculating ? "Calculating..." : "Calculate"}
              </Button>
            </div>
          </div>

          {deliveryCalculation?.success && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-100">
                    {deliveryCalculation.tierName} Delivery - {deliveryCalculation.county}
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                    Distance: {deliveryCalculation.distance} miles
                  </p>
                </div>
                {!deliveryCalculation.quoteRequired && deliveryCalculation.cost !== null && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    £{deliveryCalculation.cost.toFixed(2)}
                  </Badge>
                )}
                {deliveryCalculation.quoteRequired && (
                  <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                    Quote Required
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Items List */}
      <div className="space-y-4">
        {items.map((item) => {
          const selectedMethod = selections[item.id]?.method;
          const shippingCost = item.shippingBand ? getShippingBandPrice(item.shippingBand) : null;

          return (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-lg">{item.name}</CardTitle>
                {shippingCost !== null && (
                  <CardDescription>
                    Standard Shipping: £{shippingCost.toFixed(2)}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedMethod}
                  onValueChange={(value) => handleMethodChange(item.id, value as 'standard_shipping' | 'local_delivery')}
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="standard_shipping" id={`${item.id}-shipping`} data-testid={`radio-shipping-${item.id}`} />
                    <Label htmlFor={`${item.id}-shipping`} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FiPackage className="h-4 w-4" />
                          <span>Standard Shipping</span>
                        </div>
                        {shippingCost !== null && (
                          <span className="font-semibold">£{shippingCost.toFixed(2)}</span>
                        )}
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="local_delivery" id={`${item.id}-delivery`} data-testid={`radio-delivery-${item.id}`} />
                    <Label htmlFor={`${item.id}-delivery`} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FiTruck className="h-4 w-4" />
                          <span>Local Delivery</span>
                        </div>
                        {selectedMethod === 'local_delivery' && deliveryCalculation?.cost && (
                          <span className="font-semibold">£{deliveryCalculation.cost.toFixed(2)}</span>
                        )}
                        {selectedMethod === 'local_delivery' && !deliveryCalculation && (
                          <span className="text-sm text-neutral-500">Calculate above</span>
                        )}
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Total Cost Summary */}
      {Object.keys(selections).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiDollarSign className="h-5 w-5" />
              Shipping & Delivery Total
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {totalShippingCost > 0 && (
              <div className="flex justify-between items-center">
                <span>Standard Shipping</span>
                <span className="font-semibold" data-testid="text-total-shipping">£{totalShippingCost.toFixed(2)}</span>
              </div>
            )}
            {totalDeliveryCost > 0 && (
              <div className="flex justify-between items-center">
                <span>Local Delivery</span>
                <span className="font-semibold" data-testid="text-total-delivery">£{totalDeliveryCost.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span data-testid="text-grand-total">£{totalCost.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
