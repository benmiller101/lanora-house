import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  FiPackage, 
  FiDollarSign, 
  FiUsers, 
  FiTrendingUp,
  FiEye,
  FiEdit,
  FiMoreVertical,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiX
} from "react-icons/fi";
import { AdminNavigation } from "@/components/admin/AdminNavigation";

interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  total: string;
  subtotal: string;
  shipping: string;
  tax: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: any;
  billingAddress: any;
  createdAt: string;
  items: OrderItem[];
  fulfillmentMethod?: string;
  collectionDate?: string;
  collectionTimeSlot?: string;
}

interface OrderItem {
  id: string;
  orderId: string;
  productId?: string;
  raffleId?: string;
  name: string;
  type: 'product' | 'raffle';
  price: string;
  quantity: number;
  imageUrl?: string;
}

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [hideProducts, setHideProducts] = useState(false);
  const [hideRaffles, setHideRaffles] = useState(false);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");

  // Fetch orders with admin authentication
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['/api/admin/orders'],
    queryFn: async () => {
      const response = await fetch('/api/admin/orders', {
        headers: {
          'x-admin-email': 'Mattapinch@gmail.com',
          'x-admin-password': '@Kawasak16724020000'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      return response.json();
    }
  });

  const queryClient = useQueryClient();

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': 'Mattapinch@gmail.com',
          'x-admin-password': '@Kawasak16724020000'
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      setUpdatingOrderId(null);
    },
    onError: (error) => {
      console.error('Error updating order status:', error);
      setUpdatingOrderId(null);
    },
  });

  const handleUpdateStatus = (orderId: string, status: string) => {
    setUpdatingOrderId(orderId);
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  // Mark order as shipped mutation
  const markShippedMutation = useMutation({
    mutationFn: async ({ orderId, trackingNumber, carrier, estimatedDelivery }: { 
      orderId: string; 
      trackingNumber: string; 
      carrier: string; 
      estimatedDelivery?: string;
    }) => {
      const response = await fetch(`/api/admin/orders/${orderId}/ship`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': 'Mattapinch@gmail.com',
          'x-admin-password': '@Kawasak16724020000'
        },
        body: JSON.stringify({ trackingNumber, carrier, estimatedDelivery }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to mark as shipped');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      setIsShippingModalOpen(false);
      setShippingOrderId(null);
      setTrackingNumber("");
      setCarrier("");
      setEstimatedDelivery("");
    },
    onError: (error) => {
      console.error('Error marking order as shipped:', error);
    },
  });

  // Confirm crypto payment mutation
  const confirmCryptoMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await fetch(`/api/admin/orders/${orderId}/confirm-crypto`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': 'Mattapinch@gmail.com',
          'x-admin-password': '@Kawasak16724020000'
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to confirm crypto payment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
    },
    onError: (error) => {
      console.error('Error confirming crypto payment:', error);
    },
  });

  const handleConfirmCrypto = (orderId: string) => {
    if (confirm('Are you sure you want to confirm this payment has been received? This will mark the order as paid and notify the customer via email.')) {
      confirmCryptoMutation.mutate(orderId);
    }
  };

  const handleMarkShipped = () => {
    if (shippingOrderId && trackingNumber && carrier) {
      markShippedMutation.mutate({
        orderId: shippingOrderId,
        trackingNumber,
        carrier,
        estimatedDelivery: estimatedDelivery || undefined,
      });
    }
  };

  const openShippingModal = (orderId: string) => {
    setShippingOrderId(orderId);
    setTrackingNumber("");
    setCarrier("");
    setEstimatedDelivery("");
    setIsShippingModalOpen(true);
  };

  const statusOptions = [
    { value: 'awaiting_crypto_payment', label: 'Awaiting Crypto', color: 'bg-amber-100 text-amber-800' },
    { value: 'awaiting_bank_transfer', label: 'Awaiting Bank Transfer', color: 'bg-blue-100 text-blue-800' },
    { value: 'pending', label: 'Pending', color: 'bg-orange-100 text-orange-800' },
    { value: 'processing', label: 'Processing', color: 'bg-cyan-100 text-cyan-800' },
    { value: 'shipped', label: 'Item Shipped', color: 'bg-purple-100 text-purple-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancel Order', color: 'bg-red-100 text-red-800' },
  ];

  // Filter orders
  const filteredOrders = (orders as Order[]).filter((order: Order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    
    // Check if order contains products or raffles
    const hasProducts = order.items?.some(item => item.type === 'product');
    const hasRaffles = order.items?.some(item => item.type === 'raffle');
    
    // Apply type filters
    const typeMatch = !(
      (hideProducts && hasProducts && !hasRaffles) ||
      (hideRaffles && hasRaffles && !hasProducts) ||
      (hideProducts && hideRaffles)
    );
    
    return matchesSearch && matchesStatus && typeMatch;
  });

  // Calculate stats
  const totalRevenue = (orders as Order[]).reduce((sum: number, order: Order) => 
    sum + parseFloat(order.total), 0
  );

  // Calculate product and raffle revenue breakdown
  const revenueBreakdown = (orders as Order[]).reduce((acc, order: Order) => {
    const orderTotal = parseFloat(order.total);
    const hasProducts = order.items?.some(item => item.type === 'product');
    const hasRaffles = order.items?.some(item => item.type === 'raffle');
    
    if (hasProducts && hasRaffles) {
      // Mixed order - calculate proportionally
      const productValue = order.items
        ?.filter(item => item.type === 'product')
        .reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0) || 0;
      const raffleValue = order.items
        ?.filter(item => item.type === 'raffle')
        .reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0) || 0;
      
      const itemsTotal = productValue + raffleValue;
      if (itemsTotal > 0) {
        const productRatio = productValue / itemsTotal;
        const raffleRatio = raffleValue / itemsTotal;
        acc.productRevenue += orderTotal * productRatio;
        acc.raffleRevenue += orderTotal * raffleRatio;
      }
    } else if (hasProducts) {
      acc.productRevenue += orderTotal;
    } else if (hasRaffles) {
      acc.raffleRevenue += orderTotal;
    }
    
    return acc;
  }, { productRevenue: 0, raffleRevenue: 0 });
  
  const totalOrders = (orders as Order[]).length;
  const pendingOrders = (orders as Order[]).filter((order: Order) => order.status === 'pending').length;
  const completedOrders = (orders as Order[]).filter((order: Order) => ['completed', 'delivered'].includes(order.status)).length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address: any) => {
    if (!address || typeof address === 'string') {
      try {
        address = JSON.parse(address || '{}');
      } catch {
        return 'No address';
      }
    }
    return `${address.city || ''}, ${address.postcode || ''}`.replace(/^, |, $/, '') || 'No address';
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNavigation />
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Orders Management</h1>
              <p className="text-neutral-600">View and manage all customer orders</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-neutral-700">Total Revenue</CardTitle>
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiDollarSign className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">£{totalRevenue.toFixed(2)}</div>
                
                {/* Revenue Breakdown Chart */}
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-600">Revenue Breakdown</span>
                  </div>
                  
                  {/* Horizontal Progress Bar */}
                  <div className="w-full bg-neutral-200 rounded-full h-2.5 overflow-hidden">
                    <div className="flex h-full">
                      <div 
                        className="bg-green-600 transition-all duration-300"
                        style={{ 
                          width: `${totalRevenue > 0 ? (revenueBreakdown.productRevenue / totalRevenue) * 100 : 0}%` 
                        }}
                      ></div>
                      <div 
                        className="bg-emerald-400 transition-all duration-300"
                        style={{ 
                          width: `${totalRevenue > 0 ? (revenueBreakdown.raffleRevenue / totalRevenue) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-neutral-600">Products</span>
                      <span className="font-medium text-green-700">
                        {totalRevenue > 0 ? ((revenueBreakdown.productRevenue / totalRevenue) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span className="text-neutral-600">Raffles</span>
                      <span className="font-medium text-green-700">
                        {totalRevenue > 0 ? ((revenueBreakdown.raffleRevenue / totalRevenue) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Revenue Amounts */}
                  <div className="flex justify-between text-xs border-t border-neutral-200 pt-2">
                    <span className="text-neutral-600">£{revenueBreakdown.productRevenue.toFixed(2)}</span>
                    <span className="text-neutral-600">£{revenueBreakdown.raffleRevenue.toFixed(2)}</span>
                  </div>
                </div>
                
                <p className="text-xs text-neutral-500 mt-2">All time earnings</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-neutral-700">Total Orders</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiPackage className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{totalOrders}</div>
                <p className="text-xs text-neutral-500 mt-1">All orders placed</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-neutral-700">Pending Orders</CardTitle>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FiTrendingUp className="h-5 w-5 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{pendingOrders}</div>
                <p className="text-xs text-neutral-500 mt-1">Need attention</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-neutral-700">Completed Orders</CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiUsers className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{completedOrders}</div>
                <p className="text-xs text-neutral-500 mt-1">Successfully fulfilled</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-neutral-800 mb-4">Filter Orders</CardTitle>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 max-w-md">
                  <label className="text-sm font-medium text-neutral-700 mb-2 block">Search Orders</label>
                  <Input
                    placeholder="Search by order ID, email, or customer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="min-w-[200px]">
                  <label className="text-sm font-medium text-neutral-700 mb-2 block">Order Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="min-w-[200px]">
                  <label className="text-sm font-medium text-neutral-700 mb-2 block">Order Type</label>
                  <div className="flex gap-2">
                    <Button
                      variant={hideProducts ? "default" : "outline"}
                      size="sm"
                      onClick={() => setHideProducts(!hideProducts)}
                      className="flex items-center gap-1"
                    >
                      <FiPackage className="h-3 w-3" />
                      {hideProducts ? "Show Products" : "Hide Products"}
                    </Button>
                    <Button
                      variant={hideRaffles ? "default" : "outline"}
                      size="sm"
                      onClick={() => setHideRaffles(!hideRaffles)}
                      className="flex items-center gap-1"
                    >
                      <FiTrendingUp className="h-3 w-3" />
                      {hideRaffles ? "Show Raffles" : "Hide Raffles"}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-neutral-600">
                <span>Showing {filteredOrders.length} of {totalOrders} orders</span>
                {(searchTerm || selectedStatus !== "all" || hideProducts || hideRaffles) && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedStatus("all");
                      setHideProducts(false);
                      setHideRaffles(false);
                    }}
                    className="flex items-center gap-1"
                  >
                    <FiX className="h-3 w-3" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Orders Table */}
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">Error loading orders: {error.message}</p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="mt-4"
                  >
                    Retry
                  </Button>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <FiPackage className="h-12 w-12 text-neutral-400 mb-4" />
                    <p className="text-lg font-medium text-neutral-600 mb-2">No orders found</p>
                    <p className="text-sm text-neutral-500">
                      {searchTerm || selectedStatus !== "all" 
                        ? "Try adjusting your filters to see more results" 
                        : "Orders will appear here once customers make purchases"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-neutral-50 border-b">
                        <TableHead className="font-semibold text-neutral-700 py-4">Order ID</TableHead>
                        <TableHead className="font-semibold text-neutral-700 py-4">Customer</TableHead>
                        <TableHead className="font-semibold text-neutral-700 py-4">Items</TableHead>
                        <TableHead className="font-semibold text-neutral-700 py-4">Total</TableHead>
                        <TableHead className="font-semibold text-neutral-700 py-4">Payment</TableHead>
                        <TableHead className="font-semibold text-neutral-700 py-4">Status</TableHead>
                        <TableHead className="font-semibold text-neutral-700 py-4 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order: Order) => (
                        <TableRow key={order.id} className="hover:bg-neutral-50 transition-all duration-200 border-b border-neutral-200">
                          <TableCell className="py-4">
                            <div className="font-semibold text-sm text-neutral-900">#{order.id.slice(0, 8)}</div>
                            <div className="text-xs text-neutral-500">
                              {formatDate(order.createdAt)}
                            </div>
                          </TableCell>

                          <TableCell className="py-4">
                            <div className="font-medium text-sm text-neutral-900">{order.userName || 'Guest User'}</div>
                            <div className="text-xs text-neutral-600">{order.userEmail}</div>
                          </TableCell>

                          <TableCell className="py-4">
                            <div className="text-sm text-neutral-900">
                              {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {order.items?.slice(0, 1).map(item => item.name).join(', ')}
                              {order.items && order.items.length > 1 && ` +${order.items.length - 1} more`}
                            </div>
                          </TableCell>

                          <TableCell className="py-4">
                            <div className="text-lg font-bold text-green-600">£{parseFloat(order.total).toFixed(2)}</div>
                          </TableCell>

                          <TableCell className="py-4">
                            <Badge 
                              className={`text-xs ${
                                order.paymentMethod === 'crypto_btc' ? 'bg-orange-100 text-orange-800' :
                                order.paymentMethod === 'crypto_eth' ? 'bg-purple-100 text-purple-800' :
                                order.paymentMethod === 'bank_transfer' ? 'bg-blue-100 text-blue-800' :
                                order.paymentMethod === 'stripe' ? 'bg-indigo-100 text-indigo-800' :
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {order.paymentMethod === 'crypto_btc' ? 'Bitcoin' :
                               order.paymentMethod === 'crypto_eth' ? 'Ethereum' :
                               order.paymentMethod === 'bank_transfer' ? 'Bank Transfer' :
                               order.paymentMethod === 'stripe' ? 'Card' :
                               order.paymentMethod || 'Card'}
                            </Badge>
                          </TableCell>

                          <TableCell className="py-4">
                            <div className="flex flex-col gap-1">
                              <Badge 
                                className={`font-medium ${
                                  statusOptions.find(s => s.value === order.status)?.color || "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {statusOptions.find(s => s.value === order.status)?.label || order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                              {order.fulfillmentMethod === 'click_collect' && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  Click & Collect
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="text-right py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsOrderModalOpen(true);
                                }}
                              >
                                View Details
                              </Button>
                              {(order.status === 'awaiting_crypto_payment' || order.status === 'awaiting_bank_transfer') && (
                                <Button 
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleConfirmCrypto(order.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                  disabled={confirmCryptoMutation.isPending}
                                  data-testid={`button-confirm-payment-${order.id}`}
                                >
                                  {confirmCryptoMutation.isPending ? 'Processing...' : 'Mark as Paid & Send Email'}
                                </Button>
                              )}
                              {order.status !== 'shipped' && order.status !== 'delivered' && order.status !== 'completed' && order.status !== 'awaiting_crypto_payment' && order.status !== 'awaiting_bank_transfer' && (
                                <Button 
                                  variant="default"
                                  size="sm"
                                  onClick={() => openShippingModal(order.id)}
                                  className="bg-purple-600 hover:bg-purple-700"
                                  data-testid={`button-ship-${order.id}`}
                                >
                                  Mark Shipped
                                </Button>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    disabled={updatingOrderId === order.id}
                                    className="flex items-center gap-1"
                                  >
                                    <FiEdit className="h-3 w-3" />
                                    {updatingOrderId === order.id ? 'Updating...' : 'Update Status'}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  {statusOptions.map((statusOption) => (
                                    <DropdownMenuItem 
                                      key={statusOption.value}
                                      onClick={() => handleUpdateStatus(order.id, statusOption.value)}
                                      disabled={order.status === statusOption.value}
                                      className="flex items-center gap-2"
                                    >
                                      <div className={`w-3 h-3 rounded-full ${statusOption.color.replace('text-', 'bg-').replace('bg-', 'bg-').split(' ')[0]}`}></div>
                                      {statusOption.label}
                                      {order.status === statusOption.value && (
                                        <span className="ml-auto text-xs text-neutral-500">(Current)</span>
                                      )}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Details Modal */}
          <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Order Details - #{selectedOrder?.id.slice(0, 8)}</DialogTitle>
              </DialogHeader>
              
              {selectedOrder && (
                <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Order Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className={`${
                      selectedOrder.status === "completed" ? "bg-green-100 text-green-800" :
                      selectedOrder.status === "pending" ? "bg-orange-100 text-orange-800" :
                      selectedOrder.status === "shipped" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Badge>
                    <div className="text-sm text-neutral-500 mt-2">
                      Payment: {selectedOrder.paymentStatus || 'N/A'}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Order Date</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium">{formatDate(selectedOrder.createdAt)}</div>
                    <div className="text-xs text-neutral-500">
                      {new Date(selectedOrder.createdAt).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium capitalize">
                      {selectedOrder.paymentMethod || 'Card Payment'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiUser className="h-4 w-4" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-neutral-700 mb-1">Name</div>
                      <div className="text-sm">{selectedOrder.userName || 'Guest User'}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-neutral-700 mb-1">Email</div>
                      <div className="text-sm">{selectedOrder.userEmail}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-neutral-700 mb-1">Customer ID</div>
                      <div className="text-sm font-mono bg-neutral-100 px-2 py-1 rounded">
                        {selectedOrder.userId || 'Guest'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiPackage className="h-4 w-4" />
                    Order Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item: OrderItem, index: number) => (
                      <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center">
                          {item.type === 'raffle' ? (
                            <FiPackage size={16} className="text-purple-600" />
                          ) : (
                            <FiPackage size={16} className="text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-neutral-500 capitalize">
                            Type: {item.type}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">£{parseFloat(item.price).toFixed(2)}</div>
                          <div className="text-xs text-neutral-500">Qty: {item.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiDollarSign className="h-4 w-4" />
                    Pricing Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Subtotal:</span>
                      <span className="font-medium">£{parseFloat(selectedOrder.subtotal || '0').toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Shipping:</span>
                      <span className="font-medium">£{parseFloat(selectedOrder.shipping || '0').toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Tax:</span>
                      <span className="font-medium">£{parseFloat(selectedOrder.tax || '0').toFixed(2)}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-green-600">£{parseFloat(selectedOrder.total).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fulfillment Method */}
              <Card className={selectedOrder.fulfillmentMethod === 'click_collect' ? 'border-2 border-green-500 bg-green-50' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiPackage className="h-4 w-4" />
                    Fulfillment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedOrder.fulfillmentMethod === 'click_collect' ? (
                    <div className="space-y-3">
                      <Badge className="bg-green-600 text-white text-sm px-4 py-2">
                        Click & Collect (Free Pickup)
                      </Badge>
                      <div className="mt-3 p-4 bg-white rounded-lg border border-green-200">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium text-neutral-700 mb-1">Collection Date</div>
                            <div className="text-sm font-semibold">
                              {selectedOrder.collectionDate 
                                ? new Date(selectedOrder.collectionDate).toLocaleDateString('en-GB', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })
                                : 'Not specified'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-neutral-700 mb-1">Time Slot</div>
                            <div className="text-sm font-semibold">{selectedOrder.collectionTimeSlot || 'Not specified'}</div>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-neutral-600">
                          Collection available: Monday - Friday, 12:00 PM - 5:00 PM
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-600 text-white">
                        Standard Delivery
                      </Badge>
                      <span className="text-sm text-neutral-600">Order will be shipped to the address below</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FiMapPin className="h-4 w-4" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      {selectedOrder.shippingAddress ? (
                        <div className="space-y-1">
                          {selectedOrder.shippingAddress.name && (
                            <div className="font-semibold">{selectedOrder.shippingAddress.name}</div>
                          )}
                          <div>{selectedOrder.shippingAddress.line1}</div>
                          {selectedOrder.shippingAddress.line2 && (
                            <div>{selectedOrder.shippingAddress.line2}</div>
                          )}
                          <div>{selectedOrder.shippingAddress.city}{selectedOrder.shippingAddress.state && `, ${selectedOrder.shippingAddress.state}`}</div>
                          <div>{selectedOrder.shippingAddress.postcode}</div>
                          <div>{selectedOrder.shippingAddress.country}</div>
                          {selectedOrder.shippingAddress.phone && (
                            <div className="text-neutral-500 mt-2">Tel: {selectedOrder.shippingAddress.phone}</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-neutral-500">No shipping address provided</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FiMapPin className="h-4 w-4" />
                      Billing Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      {selectedOrder.billingAddress ? (
                        <div className="space-y-1">
                          {selectedOrder.billingAddress.name && (
                            <div className="font-semibold">{selectedOrder.billingAddress.name}</div>
                          )}
                          <div>{selectedOrder.billingAddress.line1}</div>
                          {selectedOrder.billingAddress.line2 && (
                            <div>{selectedOrder.billingAddress.line2}</div>
                          )}
                          <div>{selectedOrder.billingAddress.city}{selectedOrder.billingAddress.state && `, ${selectedOrder.billingAddress.state}`}</div>
                          <div>{selectedOrder.billingAddress.postcode}</div>
                          <div>{selectedOrder.billingAddress.country}</div>
                          {selectedOrder.billingAddress.phone && (
                            <div className="text-neutral-500 mt-2">Tel: {selectedOrder.billingAddress.phone}</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-neutral-500">Same as shipping address</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Shipping Modal */}
          <Dialog open={isShippingModalOpen} onOpenChange={setIsShippingModalOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Mark Order as Shipped</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <p className="text-sm text-neutral-600">
                  Enter the tracking information for order #{shippingOrderId?.slice(0, 8)}. 
                  A shipping notification email will be sent to the customer.
                </p>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Carrier *</label>
                  <select
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    data-testid="select-carrier"
                  >
                    <option value="">Select carrier...</option>
                    <option value="Royal Mail">Royal Mail</option>
                    <option value="DPD">DPD</option>
                    <option value="DHL">DHL</option>
                    <option value="Hermes">Hermes/Evri</option>
                    <option value="UPS">UPS</option>
                    <option value="FedEx">FedEx</option>
                    <option value="Parcelforce">Parcelforce</option>
                    <option value="Yodel">Yodel</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tracking Number *</label>
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    data-testid="input-tracking-number"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estimated Delivery (optional)</label>
                  <Input
                    type="date"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    data-testid="input-estimated-delivery"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsShippingModalOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleMarkShipped}
                    disabled={!trackingNumber || !carrier || markShippedMutation.isPending}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    data-testid="button-confirm-shipped"
                  >
                    {markShippedMutation.isPending ? 'Sending...' : 'Mark Shipped & Send Email'}
                  </Button>
                </div>
                
                {markShippedMutation.isError && (
                  <p className="text-sm text-red-600 text-center">
                    Failed to mark as shipped. Please try again.
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}