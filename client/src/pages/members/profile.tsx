import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Package, Clock, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { OrderStatusTimeline } from "@/components/OrderStatusTimeline";

export default function Profile() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  //
  // === Fetch orders via React-Query ===
  //
  const {
    data: orders = [],
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load orders");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  //
  // === Auth/loading guards ===
  //
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* … your existing loading skeleton … */}
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* … your existing “please log in” UI … */}
      </div>
    );
  }

  //
  // === Helpers for status badges/icons ===
  //
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "shipped":
      case "processing":
        return <Package className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "cancelled":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Pending";
      case "processing":
        return "Processing";
      case "shipped":
        return "Item Shipped";
      case "delivered":
        return "Delivered";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile header */}
        <div className="flex items-center gap-3 mb-8">
          <User className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">My Profile</h1>
        </div>

        {/* … your two-card grid (Profile Info + Quick Actions) … */}

        <Separator className="my-8" />

        {/* === Order History === */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              // loading skeleton
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : ordersError ? (
              <p className="text-red-500">Error loading orders.</p>
            ) : orders.length === 0 ? (
              // no orders UI
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No orders yet</p>
                <p className="text-sm">
                  When you make your first purchase, it will appear here
                </p>
                <Link href="/products">
                  <button className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                    Start Shopping
                  </button>
                </Link>
              </div>
            ) : (
              // orders list
              <div className="space-y-8">
                {orders.map((order: any) => (
                  <div
                    key={order.id}
                    className="border rounded-lg overflow-hidden"
                  >
                    {/* Order header */}
                    <div className="bg-gray-50 px-6 py-4 border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            Order #{order.id}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Placed on{" "}
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString()
                              : "Unknown date"}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">
                                {getStatusLabel(order.status)}
                              </span>
                            </Badge>
                          </div>
                          <span className="font-bold text-lg">
                            £{parseFloat(order.total || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status timeline */}
                    <div className="p-6">
                      <OrderStatusTimeline
                        currentStatus={order.status || "placed"}
                        orderDate={order.createdAt || new Date().toISOString()}
                        estimatedDelivery={order.estimatedDelivery}
                      />
                    </div>

                    {/* Item preview */}
                    {order.items && order.items.length > 0 && (
                      <div className="px-6 pb-6 text-sm text-gray-600">
                        <span className="font-medium">
                          {order.items.length}
                        </span>{" "}
                        item(s):
                        {order.items.slice(0, 2).map((item: any, i: number) => (
                          <span key={i}>
                            {i === 0 ? " " : ", "}
                            {item.product?.name ||
                              item.raffle?.name ||
                              "Unknown"}
                          </span>
                        ))}
                        {order.items.length > 2 && (
                          <span> and {order.items.length - 2} more</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
