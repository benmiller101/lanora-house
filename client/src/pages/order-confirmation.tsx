import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Helmet } from 'react-helmet';
import { 
  CheckCircle, 
  Package, 
  MapPin, 
  Calendar, 
  CreditCard,
  Mail,
  Truck,
  ArrowRight,
  Store,
  Clock
} from 'lucide-react';
import { Link } from 'wouter';

interface OrderItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  type: string;
}

interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  address1?: string;
  address2?: string;
  city?: string;
  region?: string;
  state?: string;
  postcode?: string;
  country?: string;
  phone?: string;
}

interface Order {
  id: string;
  total: string;
  subtotal: string;
  shipping: string;
  tax: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingMethod?: string;
  shippingAddress: ShippingAddress;
  createdAt: string;
  items: OrderItem[];
  fulfillmentMethod?: string;
  collectionDate?: string;
  collectionTimeSlot?: string;
}

// Helper to get shipping method display name
function getShippingMethodName(method: string | undefined): string {
  switch (method) {
    case 'tracked_48': return 'Royal Mail Tracked 48';
    case 'tracked_24': return 'Royal Mail Tracked 24';
    case 'special_delivery': return 'Special Delivery Guaranteed';
    default: return 'Standard Shipping';
  }
}

// Helper to get collection time slot display
function getCollectionTimeDisplay(slot: string | undefined): string {
  const slots: Record<string, string> = {
    '12:00-13:00': '12:00 PM - 1:00 PM',
    '13:00-14:00': '1:00 PM - 2:00 PM',
    '14:00-15:00': '2:00 PM - 3:00 PM',
    '15:00-16:00': '3:00 PM - 4:00 PM',
    '16:00-17:00': '4:00 PM - 5:00 PM',
  };
  return slots[slot || ''] || slot || 'Not specified';
}

export default function OrderConfirmation() {
  const [location] = useLocation();
  const [isConfirmingOrder, setIsConfirmingOrder] = React.useState(false);
  const [orderConfirmed, setOrderConfirmed] = React.useState(false);
  
  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');
  const paymentIntentFromStripe = urlParams.get('payment_intent'); // Stripe adds this after redirect
  const paymentIntentFromUs = urlParams.get('paymentIntent'); // Our custom param
  const paymentIntentId = paymentIntentFromStripe || paymentIntentFromUs;

  // Confirm order if coming from Stripe redirect (3DS/SCA flow)
  useEffect(() => {
    const confirmOrderFromRedirect = async () => {
      if (paymentIntentFromStripe && orderId && !orderConfirmed && !isConfirmingOrder) {
        setIsConfirmingOrder(true);
        try {
          const response = await fetch('/api/shop/confirm-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentIntentId: paymentIntentFromStripe,
              orderId: orderId,
            }),
          });
          
          const data = await response.json();
          if (data.success) {
            setOrderConfirmed(true);
          }
        } catch (err) {
          console.error('Failed to confirm order:', err);
        } finally {
          setIsConfirmingOrder(false);
        }
      }
    };
    
    confirmOrderFromRedirect();
  }, [paymentIntentFromStripe, orderId, orderConfirmed, isConfirmingOrder]);

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: [`/api/orders/${orderId}`, paymentIntentId, orderConfirmed],
    queryFn: async () => {
      const url = `/api/orders/${orderId}${paymentIntentId ? `?paymentIntent=${paymentIntentId}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch order: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!orderId && !isConfirmingOrder,
    retry: 3,
    retryDelay: 1000,
  });

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Order Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">We couldn't find your order. Please check your email for order details.</p>
            <Link href="/shop">
              <Button className="w-full">Continue Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || isConfirmingOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">{isConfirmingOrder ? 'Confirming your order...' : 'Loading order details...'}</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Error Loading Order</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">There was an error loading your order details.</p>
            <Link href="/members">
              <Button className="w-full">View My Orders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt);
  const estimatedDelivery = new Date(orderDate);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5); // 5 business days

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Order Confirmation | Lanora House</title>
        <meta name="description" content="Your order has been confirmed. Check your order details and tracking information." />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your order #{order.id} has been successfully placed.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold">Order #{order.id}</p>
                    <p className="text-sm text-gray-600">
                      Placed on {orderDate.toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      className={
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <p className="text-xs text-gray-600 mt-1">
                      Payment: {order.paymentStatus}
                    </p>
                  </div>
                </div>

                {/* Next Steps */}
                <div className={`${order.fulfillmentMethod === 'click_collect' ? 'bg-green-50' : 'bg-blue-50'} p-4 rounded-lg`}>
                  <h3 className={`font-semibold ${order.fulfillmentMethod === 'click_collect' ? 'text-green-900' : 'text-blue-900'} mb-2`}>What happens next?</h3>
                  <div className={`space-y-2 text-sm ${order.fulfillmentMethod === 'click_collect' ? 'text-green-800' : 'text-blue-800'}`}>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>You'll receive an email confirmation shortly</span>
                    </div>
                    <div className="flex items-center">
                      <Package className="w-4 h-4 mr-2" />
                      <span>We'll carefully pack your item(s){order.fulfillmentMethod === 'click_collect' ? ' for collection' : ' for safe delivery'}</span>
                    </div>
                    {order.fulfillmentMethod === 'click_collect' ? (
                      <div className="flex items-center">
                        <Store className="w-4 h-4 mr-2" />
                        <span>Collect your order on your scheduled date - bring your order confirmation</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Truck className="w-4 h-4 mr-2" />
                        <span>When your order ships, you'll receive an email with tracking information</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} • Type: {item.type}
                        </p>
                      </div>
                      <span className="font-semibold">
                        £{(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address or Collection Details */}
            {order.fulfillmentMethod === 'click_collect' ? (
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-800">
                    <Store className="w-5 h-5 mr-2" />
                    Collection Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-800">Collection Date & Time</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {order.collectionDate 
                          ? new Date(order.collectionDate).toLocaleDateString('en-GB', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })
                          : 'Date to be confirmed'}
                      </p>
                      <p className="text-gray-600 flex items-center gap-1 mt-1">
                        <Clock className="w-4 h-4" />
                        {getCollectionTimeDisplay(order.collectionTimeSlot)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Collection Address:</p>
                      <p className="text-sm text-gray-600">Lanora House</p>
                      <p className="text-sm text-gray-600">Please bring this order confirmation or photo ID</p>
                    </div>
                    
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <strong>Important:</strong> Collections available Monday to Friday, 12:00 PM - 5:00 PM only.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium text-gray-900">
                      {order.shippingAddress.firstName && order.shippingAddress.lastName 
                        ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
                        : order.shippingAddress.name || 'Customer'}
                    </p>
                    <p>{order.shippingAddress.addressLine1 || order.shippingAddress.address1}</p>
                    {(order.shippingAddress.addressLine2 || order.shippingAddress.address2) && (
                      <p>{order.shippingAddress.addressLine2 || order.shippingAddress.address2}</p>
                    )}
                    <p>
                      {order.shippingAddress.city}
                      {(order.shippingAddress.region || order.shippingAddress.state) && `, ${order.shippingAddress.region || order.shippingAddress.state}`}
                    </p>
                    <p>{order.shippingAddress.postcode}</p>
                    <p>{order.shippingAddress.country}</p>
                    {order.shippingAddress.phone && (
                      <p className="mt-2">Tel: {order.shippingAddress.phone}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>£{parseFloat(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{order.fulfillmentMethod === 'click_collect' ? 'Collection' : 'Shipping'}</span>
                  <span className={order.fulfillmentMethod === 'click_collect' ? 'text-green-600 font-medium' : ''}>
                    {order.fulfillmentMethod === 'click_collect' ? 'FREE' : `£${parseFloat(order.shipping).toFixed(2)}`}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>£{parseFloat(order.total).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery/Collection Information */}
            <Card className={order.fulfillmentMethod === 'click_collect' ? 'border-green-200' : ''}>
              <CardHeader>
                <CardTitle className={`flex items-center ${order.fulfillmentMethod === 'click_collect' ? 'text-green-800' : ''}`}>
                  {order.fulfillmentMethod === 'click_collect' ? (
                    <Store className="w-5 h-5 mr-2" />
                  ) : (
                    <Calendar className="w-5 h-5 mr-2" />
                  )}
                  {order.fulfillmentMethod === 'click_collect' ? 'Collection Information' : 'Delivery Information'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.fulfillmentMethod === 'click_collect' ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Fulfillment Method</p>
                      <p className="text-sm text-green-600 font-medium">Click & Collect (Free)</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Collection Date</p>
                      <p className="text-sm text-gray-600">
                        {order.collectionDate 
                          ? new Date(order.collectionDate).toLocaleDateString('en-GB', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })
                          : 'To be confirmed'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Collection Time</p>
                      <p className="text-sm text-gray-600">{getCollectionTimeDisplay(order.collectionTimeSlot)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Shipping Method</p>
                      <p className="text-sm text-gray-600">{getShippingMethodName(order.shippingMethod)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Estimated Delivery</p>
                      <p className="text-sm text-gray-600">
                        {estimatedDelivery.toLocaleDateString('en-GB', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-500">3-5 business days</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Payment Status</span>
                    <Badge className="bg-green-100 text-green-800">
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">
                    Your payment has been processed securely via Stripe.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Link href="/members">
                <Button className="w-full" variant="outline">
                  View All Orders
                </Button>
              </Link>
              <Link href="/shop">
                <Button className="w-full">
                  Continue Shopping
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you have any questions about your order, please don't hesitate to contact us.
              </p>
              <div className="flex justify-center space-x-4">
                <a 
                  href="mailto:info@lanorahouse.com" 
                  className="text-primary hover:underline text-sm"
                >
                  info@lanorahouse.com
                </a>
                <span className="text-gray-300">|</span>
                <a 
                  href="tel:+44 7843 930 927" 
                  className="text-primary hover:underline text-sm"
                >
                  +44 7843 930 927
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}