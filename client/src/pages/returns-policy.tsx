import React from "react";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  RotateCw,
  Shield,
  AlertTriangle,
  XCircle,
  Mail,
  Package,
  CreditCard,
  RefreshCw,
  Camera,
  Calendar,
  MapPin,
  Heart
} from "lucide-react";

const ReturnsPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Returns & Refunds Policy"
        description="Complete returns and refunds policy for Lanora House. Eligibility, procedures, and conditions for returning antique and clearance items purchased at auction."
        path="/returns"
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Returns & Refunds Policy
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Fair and straightforward returns policy for all Lanora House items, with special considerations for reclaimed and vintage pieces.
          </p>
        </div>

        {/* Quick Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Calendar className="w-5 h-5 mr-2 text-primary" />
                Return Window
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                14 days from receipt to notify us of issues with faulty or misdescribed items.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Shield className="w-5 h-5 mr-2 text-primary" />
                Eligible Returns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Faulty, damaged in transit, or not as described items qualify for returns.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <CreditCard className="w-5 h-5 mr-2 text-primary" />
                Refund Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Approved refunds processed within 5-10 business days to original payment method.
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

        {/* Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="w-6 h-6 mr-2 text-primary" />
              1. Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              At Lanora House, we strive to ensure every customer is happy with their purchase. However, we recognise there may be occasions where you need to return an item.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-blue-800">
                    Our returns policy is fair and straightforward, but please note that many of our items are reclaimed, preloved, or sold as seen, and may not qualify for return unless faulty.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eligibility for Returns */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <RotateCw className="w-6 h-6 mr-2 text-primary" />
              2. Eligibility for Returns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>We accept returns in the following circumstances:</p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                <span className="text-green-800">You receive an item that is faulty, damaged (in transit), or not as described</span>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <span className="text-blue-800">You notify us of the issue within <strong>14 days</strong> of receiving your order</span>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <Package className="w-5 h-5 text-purple-600 mt-0.5" />
                <span className="text-purple-800">The item is returned to us in the same condition it was received, unused and with any original packaging where applicable</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Non-Returnable Items */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <XCircle className="w-6 h-6 mr-2 text-primary" />
              3. Non-Returnable Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Unless faulty, the following items are typically non-returnable:</p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 mb-1">Preloved & Reclaimed Items</p>
                  <p className="text-red-800 text-sm">Preloved, reclaimed, or clearance items sold as seen and clearly described as such at the point of sale</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <Package className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-900 mb-1">Custom Orders</p>
                  <p className="text-orange-800 text-sm">Custom orders or items made to your specifications</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <XCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-900 mb-1">Perishable Items</p>
                  <p className="text-yellow-800 text-sm">Perishable items, opened consumables, or hygiene-related goods (where applicable)</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <p className="text-blue-800">
                  We are always happy to clarify if you're unsure prior to purchasing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Request a Return */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-6 h-6 mr-2 text-primary" />
              4. How to Request a Return
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>To request a return, please contact us via email at <a href="mailto:info@lanorahouse.com" className="text-primary hover:underline">info@lanorahouse.com</a> with:</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Package className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Your order number</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">A description of the issue</span>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Camera className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <span className="font-medium">Clear photos (if applicable)</span>
                  <p className="text-sm text-gray-600 mt-1">Especially for damage claims</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800">
                We will review your request and provide instructions on how to proceed.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Return Shipping */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-6 h-6 mr-2 text-primary" />
              5. Return Shipping
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Unless your item is faulty or damaged upon receipt, you are responsible for return postage costs. We recommend using a tracked, insured service as we cannot accept responsibility for returns lost in transit.
            </p>
            
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Package className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 mb-1">Large Reclaimed Items</p>
                  <p className="text-amber-800">For larger reclaimed items, returns must be arranged by prior agreement.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refunds */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-6 h-6 mr-2 text-primary" />
              6. Refunds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Once your return is received and inspected, we will notify you of approval or rejection. Approved refunds will be issued to your original payment method within <strong>5-10 business days</strong>.
            </p>
            
            <div>
              <h4 className="font-semibold mb-3">Refunds will not include:</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <span className="text-red-800">Original shipping costs (unless the return is due to our error)</span>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <span className="text-red-800">Any costs incurred by you for arranging the return</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exchanges */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <RefreshCw className="w-6 h-6 mr-2 text-primary" />
              7. Exchanges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <RefreshCw className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-blue-800">
                    We do not offer direct exchanges. If you wish to purchase an alternative item, please place a new order.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Faulty or Damaged Goods */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-primary" />
              8. Faulty or Damaged Goods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-red-800">
                    If your order arrives damaged in transit or faulty, notify us within <strong>48 hours</strong> with photographic evidence so we can resolve it promptly through refund, replacement, or repair where appropriate.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Our Commitment */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="w-6 h-6 mr-2 text-primary" />
              9. Our Commitment to Fairness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Heart className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-green-800">
                    We handle all returns with fairness and common sense. If there are unique circumstances not covered by this policy, we encourage you to reach out and we will do our best to help.
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
              10. Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">For all returns or questions, please contact:</p>
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
          <p className="mt-2">This returns policy applies to all orders and reflects our commitment to fair and transparent customer service.</p>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPolicy;