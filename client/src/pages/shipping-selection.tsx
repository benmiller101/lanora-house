import { Helmet } from "react-helmet";
import { ShippingCalculator } from "@/components/shipping/ShippingCalculator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FiTruck, FiPackage } from "react-icons/fi";

// Demo data - in a real app, this would come from the user's won auctions/purchases
const demoItems = [
  {
    id: "lot-5",
    name: "Lot 5: Victorian Silver Tea Set",
    shippingBand: "band-c",
    image: "/uploads/lot5.jpg",
  },
  {
    id: "lot-6",
    name: "Lot 6: Collection of Antique Books",
    shippingBand: "band-b",
    image: "/uploads/lot6.jpg",
  },
  {
    id: "lot-7",
    name: "Lot 7: Large Oak Dining Table",
    shippingBand: "band-d",
    image: "/uploads/lot7.jpg",
  },
];

export default function ShippingSelectionPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Helmet>
        <title>Shipping & Delivery Selection | LANORA HOUSE</title>
        <meta
          name="description"
          content="Choose your shipping method and calculate delivery costs for your auction wins"
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FiTruck className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Shipping & Delivery</h1>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Select your preferred shipping method for each item and calculate delivery costs
          </p>
        </div>

        {/* Instructions Card */}
        <Card className="mb-6 border-2 border-primary/20">
          <CardHeader>
            <CardTitle>Shipping & Delivery Options</CardTitle>
            <CardDescription>We offer two ways to receive your won auction lots</CardDescription>
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
              <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
                <li>Enter your postcode in the calculator above</li>
                <li>Click "Calculate" to see your exact delivery cost based on distance</li>
                <li>Select "Local Delivery" for items you want delivered</li>
                <li>The cost shown is per delivery address (not per item)</li>
              </ol>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200">
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <FiPackage className="h-5 w-5" />
                Standard Shipping (Fixed Rates)
              </h3>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-2">
                Items are shipped via courier with fixed rates based on size:
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

        {/* Shipping Calculator */}
        <ShippingCalculator items={demoItems} />
      </div>
    </div>
  );
}
