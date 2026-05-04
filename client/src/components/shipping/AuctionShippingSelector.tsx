import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FiTruck, FiPackage, FiMapPin, FiSave } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getShippingBandPrice } from "@/../../shared/shipping-bands";

interface AuctionLot {
  lotId: string;
  lotNumber: number;
  lotTitle: string;
  lotImageUrl?: string;
  shippingBand?: string;
}

interface ShippingSelection {
  shippingMethod: 'standard_shipping' | 'local_delivery';
  shippingCost?: number;
  deliveryCost?: number;
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

export function AuctionShippingSelector({ catalogId, lots }: { catalogId: string; lots: AuctionLot[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selections, setSelections] = useState<{ [lotId: string]: ShippingSelection }>({});
  const [postcode, setPostcode] = useState("");
  const [deliveryCalculation, setDeliveryCalculation] = useState<DeliveryCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);


  // Load existing shipping selections
  const { data: savedSelections } = useQuery({
    queryKey: [`/api/auction/lot-shipping/${catalogId}`],
    enabled: !!catalogId,
  });

  // Initialize selections from saved data
  useEffect(() => {
    if (savedSelections) {
      const initialSelections: { [lotId: string]: ShippingSelection } = {};
      lots.forEach(lot => {
        const saved = savedSelections[lot.lotId];
        if (saved) {
          initialSelections[lot.lotId] = {
            shippingMethod: saved.shippingMethod,
            shippingCost: saved.shippingCost,
            deliveryCost: saved.deliveryCost,
          };
          
          // Restore delivery calculation if exists
          if (saved.deliveryPostcode && saved.deliveryCost !== null) {
            setPostcode(saved.deliveryPostcode);
            setDeliveryCalculation({
              success: true,
              distance: saved.deliveryDistance,
              cost: saved.deliveryCost,
              postcode: saved.deliveryPostcode,
            } as any);
          }
        }
      });
      setSelections(initialSelections);
    }
  }, [savedSelections, lots]);

  const handleMethodChange = (lotId: string, method: 'standard_shipping' | 'local_delivery') => {
    const lot = lots.find(l => l.lotId === lotId);
    const shippingCost = lot?.shippingBand ? getShippingBandPrice(lot.shippingBand) : null;
    
    // Validate shipping band
    if (method === 'standard_shipping' && (!lot?.shippingBand || shippingCost === null)) {
      toast({
        title: "Invalid Shipping Band",
        description: "This lot has an invalid shipping configuration. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    setSelections(prev => ({
      ...prev,
      [lotId]: {
        shippingMethod: method,
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
          Object.keys(updated).forEach(lotId => {
            if (updated[lotId].shippingMethod === 'local_delivery') {
              updated[lotId].deliveryCost = result.cost || undefined;
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

  const saveShippingSelections = async () => {
    setIsSaving(true);
    try {
      // Save each lot's selection - server will calculate costs
      const savePromises = Object.entries(selections).map(async ([lotId, selection]) => {
        const response = await apiRequest<{
          success: boolean;
          shippingCost?: number | null;
          deliveryCost?: number | null;
          deliveryDistance?: number | null;
        }>("POST", "/api/auction/lot-shipping", {
          lotId,
          catalogId,
          shippingMethod: selection.shippingMethod,
          deliveryPostcode: selection.shippingMethod === 'local_delivery' ? postcode : null,
        });

        // Update local state with server-calculated costs
        if (response.success) {
          setSelections(prev => ({
            ...prev,
            [lotId]: {
              ...prev[lotId],
              shippingCost: response.shippingCost || undefined,
              deliveryCost: response.deliveryCost || undefined,
            }
          }));
        }

        return response;
      });

      await Promise.all(savePromises);

      toast({
        title: "Saved Successfully",
        description: "Your shipping preferences have been saved",
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/auction/lot-shipping/${catalogId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/auction/my-won-lots"] });
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save shipping selections",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate total costs
  const totalShippingCost = Object.values(selections).reduce((sum, sel) => {
    return sum + (sel.shippingMethod === 'standard_shipping' ? (sel.shippingCost || 0) : 0);
  }, 0);

  const totalDeliveryCost = Object.values(selections).reduce((sum, sel) => {
    return sum + (sel.shippingMethod === 'local_delivery' ? (sel.deliveryCost || 0) : 0);
  }, 0);

  const totalCost = totalShippingCost + totalDeliveryCost;
  const hasSelections = Object.keys(selections).length > 0;

  return (
    <div className="space-y-6">
      {/* Instructions Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle>Shipping & Delivery Options</CardTitle>
          <CardDescription>Choose how to receive your won auction lots</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <FiTruck className="h-5 w-5" />
              Local Delivery (Distance-Based Pricing)
            </h3>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">
              If you require local delivery, we can bring your items directly to your door. Delivery costs are calculated based on your postcode location and distance from our Hayle auction house in miles.
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
              <li>Enter your postcode in the calculator below</li>
              <li>Click "Calculate" to see your exact delivery cost based on distance</li>
              <li>Select "Local Delivery" for items you want delivered</li>
              <li>The cost shown is per delivery address (not per item)</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200">
            <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <FiPackage className="h-5 w-5" />
              Standard Shipping (Fixed Rates)
            </h3>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-2">
              Items shipped via courier with fixed rates based on size:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
              <li><strong>Band A</strong> - Small items: £8.95</li>
              <li><strong>Band B</strong> - Medium items: £18.95</li>
              <li><strong>Band C</strong> - Large items: £28.95</li>
              <li><strong>Band D</strong> - Extra large parcels (up to 30kg): £75.00</li>
            </ul>
          </div>

          <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">
            💡 Tip: Compare both options - sometimes local delivery works out cheaper than shipping, especially for larger or multiple items!
          </p>
        </CardContent>
      </Card>

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
        {lots.map((lot) => {
          const selectedMethod = selections[lot.lotId]?.shippingMethod;
          const shippingCost = lot.shippingBand ? getShippingBandPrice(lot.shippingBand) : null;

          return (
            <Card key={lot.lotId}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  {lot.lotImageUrl && (
                    <img
                      src={lot.lotImageUrl}
                      alt={lot.lotTitle}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      Lot {lot.lotNumber}: {lot.lotTitle}
                    </CardTitle>
                    {shippingCost !== null && (
                      <CardDescription>
                        Standard Shipping: £{shippingCost.toFixed(2)}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedMethod}
                  onValueChange={(value) => handleMethodChange(lot.lotId, value as 'standard_shipping' | 'local_delivery')}
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="standard_shipping" id={`${lot.lotId}-shipping`} data-testid={`radio-shipping-${lot.lotId}`} />
                    <Label htmlFor={`${lot.lotId}-shipping`} className="flex-1 cursor-pointer">
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
                    <RadioGroupItem value="local_delivery" id={`${lot.lotId}-delivery`} data-testid={`radio-delivery-${lot.lotId}`} />
                    <Label htmlFor={`${lot.lotId}-delivery`} className="flex-1 cursor-pointer">
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

      {/* Total Cost Summary & Save Button */}
      {hasSelections && (
        <Card>
          <CardHeader>
            <CardTitle>Shipping Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
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
                <span>Total Shipping & Delivery</span>
                <span data-testid="text-grand-total">£{totalCost.toFixed(2)}</span>
              </div>
            </div>
            
            <Button 
              onClick={saveShippingSelections} 
              disabled={isSaving}
              className="w-full"
              size="lg"
              data-testid="button-save-shipping"
            >
              <FiSave className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Shipping Preferences"}
            </Button>
            
            <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
              These costs will be added to your invoice
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
