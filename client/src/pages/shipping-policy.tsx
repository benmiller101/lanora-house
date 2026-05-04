import React from "react";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock,
  Truck,
  Package,
  MapPin,
  Mail,
  Phone,
  AlertTriangle,
  Shield,
  Recycle,
  Calendar,
  Home
} from "lucide-react";

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Shipping Policy - Delivery & Collection Info"
        description="Complete shipping policy for Lanora House. Processing times, delivery methods, costs, and collection options for antique and clearance items."
        path="/shipping"
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Shipping Policy
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about our shipping and delivery services for antiques, collectibles, and clearance items.
          </p>
        </div>

        {/* Quick Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Clock className="w-5 h-5 mr-2 text-primary" />
                Processing Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                3-5 business days processing time for most orders (Monday to Friday).
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Truck className="w-5 h-5 mr-2 text-primary" />
                UK Delivery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Standard: 3-7 working days | Express: 1-3 working days (when available).
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Home className="w-5 h-5 mr-2 text-primary" />
                Collection Option
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Free collection available from our Hayle location by arrangement.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-6 h-6 mr-2 text-primary" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <a href="mailto:info@lanorahouse.com" className="text-primary hover:underline">
                      info@lanorahouse.com
                    </a>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-semibold">Address</p>
                    <p className="text-gray-600">Lanarth House, Penpol Avenue, Hayle</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <Calendar className="w-4 h-4 inline mr-2" />
              Effective Date: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </CardContent>
        </Card>

        {/* Processing Time */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-6 h-6 mr-2 text-primary" />
              1. Processing Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Orders are typically processed within <strong>3-5 business days</strong> (Monday to Friday, excluding bank holidays).
            </p>
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-amber-800">
                    Processing time may vary during busy periods, clearance events, or promotional sales. We will notify you promptly if there is any unexpected delay.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Methods */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="w-6 h-6 mr-2 text-primary" />
              2. Shipping Methods & Delivery Times
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p>
              We use reputable couriers (Royal Mail, DPD, Evri, or other suitable services) depending on the size, weight, and destination of the items.
            </p>

            <div>
              <h4 className="font-semibold mb-3">Estimated delivery times from dispatch:</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">UK Standard Shipping</span>
                  </div>
                  <Badge variant="outline">3-7 working days</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-green-600" />
                    <span className="font-medium">UK Express Shipping</span>
                    <span className="text-sm text-gray-500">(when offered)</span>
                  </div>
                  <Badge variant="outline">1-3 working days</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">International Shipping</span>
                  </div>
                  <Badge variant="secondary">By prior agreement only</Badge>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-900 mb-1">Please Note:</p>
                  <p className="text-yellow-800">
                    Delivery times are estimates and not guaranteed. Lanora House is not responsible for delays caused by couriers, strikes, or adverse weather.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Costs */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-6 h-6 mr-2 text-primary" />
              3. Shipping Costs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Shipping costs are calculated based on the size, weight, and delivery address of your order. These will be clearly shown at checkout before you confirm your purchase.
            </p>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Truck className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900 mb-1">Free Local Delivery</p>
                  <p className="text-green-800">
                    Occasionally, we may offer free local delivery within Cornwall for certain large reclaimed goods or clearances — this will be arranged on a case-by-case basis.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collection Option */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Home className="w-6 h-6 mr-2 text-primary" />
              4. Collection Option
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>You are welcome to collect orders in person from:</p>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900">Collection Address</p>
                  <p className="text-blue-800">Lanarth House, Penpol Avenue, Hayle, TR27</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-amber-800">
                    <strong>Collection is strictly by prior arrangement.</strong> We will notify you when your order is ready.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Issues */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-primary" />
              5. Delivery Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Please ensure all delivery information is accurate at checkout. We cannot be held responsible for parcels delayed or lost due to incorrect addresses.
            </p>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 mb-1">Missing Parcels</p>
                  <p className="text-red-800">
                    If your parcel has not arrived within <strong>10 working days</strong> of dispatch (UK orders), please contact us at <a href="mailto:info@lanorahouse.com" className="underline">info@lanorahouse.com</a> quoting your order number.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Damaged or Lost Goods */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-6 h-6 mr-2 text-primary" />
              6. Damaged or Lost Goods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We take great care in packaging items securely. However, if your item arrives damaged or appears lost in transit:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <Package className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-900 mb-1">Damaged Items</p>
                    <p className="text-orange-800 text-sm">
                      Notify us within <strong>48 hours of delivery</strong> for damages, with photographic evidence where possible.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-purple-900 mb-1">Lost Parcels</p>
                    <p className="text-purple-800 text-sm">
                      We will investigate with the courier and either replace or refund the item where appropriate.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* International Shipping */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-6 h-6 mr-2 text-primary" />
              7. International Shipping
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              At present, we do not routinely offer international shipping. For special requests, please contact <a href="mailto:info@lanorahouse.com" className="text-primary hover:underline">info@lanorahouse.com</a> before placing an order.
            </p>
          </CardContent>
        </Card>

        {/* Sustainability Commitment */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Recycle className="w-6 h-6 mr-2 text-primary" />
              8. Sustainability Commitment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Recycle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-green-800">
                    Where possible, Lanora House uses recycled or reclaimed packaging materials in line with our environmental commitments.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-6 h-6 mr-2 text-primary" />
              9. Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">For any shipping queries, please contact:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <a href="mailto:info@lanorahouse.com" className="text-primary hover:underline">
                  info@lanorahouse.com
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                <span className="text-gray-600">Lanarth House, Penpol Avenue, Hayle, TR27</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center text-sm text-gray-500 bg-gray-100 p-4 rounded-lg">
          <p>Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="mt-2">This shipping policy applies to all orders placed through our website and may be updated from time to time.</p>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;