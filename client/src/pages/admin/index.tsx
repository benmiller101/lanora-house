import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { 
  FiGrid, 
  FiPackage, 
  FiTag, 
  FiVideo, 
  FiUsers, 
  FiTruck,
  FiSettings,
  FiGift,
  FiFolder,
  FiList,
  FiMonitor,
  FiClipboard,
  FiDollarSign,
  FiTrendingUp,
  FiActivity,
  FiAward
} from "react-icons/fi";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AdminNavigation } from "@/components/admin/AdminNavigation";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  // Fetch live data
  const { data: raffles = [] } = useQuery({
    queryKey: ['/api/raffles/admin'],
    staleTime: 30000,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['/api/admin/orders'],
    staleTime: 30000,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
    staleTime: 30000,
  });

  const { data: pendingOffers = [] } = useQuery({
    queryKey: ['/api/admin/offers/pending'],
    staleTime: 30000,
  });

  // Calculate real metrics with safe data handling
  const raffleArray = Array.isArray(raffles) ? raffles : [];
  const orderArray = Array.isArray(orders) ? orders : [];
  const productArray = Array.isArray(products) ? products : [];
  const pendingOffersArray = Array.isArray(pendingOffers) ? pendingOffers : [];

  const activeRaffles = raffleArray.filter((raffle: any) => raffle.status === 'active').length;
  const completedRaffles = raffleArray.filter((raffle: any) => raffle.status === 'completed').length;
  const totalRaffleRevenue = raffleArray.reduce((sum: number, raffle: any) => 
    sum + (parseFloat(raffle.ticketPrice || 0) * (raffle.ticketsSold || 0)), 0
  );

  const todaysOrders = orderArray.filter((order: any) => {
    if (!order.createdAt) return false;
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }).length;

  const totalOrderRevenue = orderArray.reduce((sum: number, order: any) => 
    sum + parseFloat(order.total || 0), 0
  );

  const totalRevenue = totalRaffleRevenue + totalOrderRevenue;
  const productsInStock = productArray.filter((product: any) => product.inStock).length;

  // Admin sections
  const adminSections = [
    {
      title: "Item Submissions",
      description: "Manage member item submissions for sale or raffle prizes",
      icon: <FiClipboard className="w-10 h-10 text-primary" />,
      links: [
        { name: "View All Submissions", path: "/admin/submissions", icon: <FiClipboard /> },
      ],
    },
    {
      title: "Live Stream Management",
      description: "Manage live streams for raffles and events",
      icon: <FiVideo className="w-10 h-10 text-primary" />,
      links: [
        { name: "Live Streams", path: "/admin/streams", icon: <FiMonitor /> },
      ],
    },
    {
      title: "Auction Management",
      description: "Manage auction catalogs, lots, and live auctions",
      icon: <FiActivity className="w-10 h-10 text-primary" />,
      links: [
        { name: "Auction Catalogs", path: "/admin/auction-catalogs", icon: <FiFolder /> },
        { name: "Auction Lots", path: "/admin/auction-lots", icon: <FiPackage /> },
      ],
    },
    {
      title: "Product Management",
      description: "Manage products, categories, and inventory",
      icon: <FiPackage className="w-10 h-10 text-primary" />,
      links: [
        { name: "Products", path: "/admin/products", icon: <FiPackage /> },
        { name: "Categories", path: "/admin/categories", icon: <FiGrid /> },
        { name: "Inventory", path: "/admin/inventory", icon: <FiTag /> },
      ],
    },
    {
      title: "Raffle Management",
      description: "Manage raffles, tickets, and winners",
      icon: <FiGift className="w-10 h-10 text-primary" />,
      links: [
        { name: "Raffles", path: "/admin/raffles", icon: <FiGift /> },
        { name: "Raffle Entries", path: "/admin/raffle-entries", icon: <FiList /> },
      ],
    },
    {
      title: "Withdrawal Management", 
      description: "Process instant win prize payouts",
      icon: <FiDollarSign className="w-10 h-10 text-primary" />,
      links: [
        { name: "Bank Transfer Payouts", path: "/admin/withdrawals", icon: <FiDollarSign /> },
      ],
    },
    {
      title: "Order Management",
      description: "View and manage customer orders",
      icon: <FiTruck className="w-10 h-10 text-primary" />,
      links: [
        { name: "Orders", path: "/admin/orders", icon: <FiTruck /> },
      ],
    },
    {
      title: "User Management",
      description: "Manage customer accounts and permissions",
      icon: <FiUsers className="w-10 h-10 text-primary" />,
      links: [
        { name: "Customers", path: "/admin/users", icon: <FiUsers /> },
        { name: "Admins", path: "/admin/admins", icon: <FiUsers /> },
      ],
    },
    {
      title: "System Settings",
      description: "Configure system preferences and settings",
      icon: <FiSettings className="w-10 h-10 text-primary" />,
      links: [
        { name: "Settings", path: "/admin/settings", icon: <FiSettings /> },
      ],
    },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | LANORA HOUSE</title>
        <meta name="description" content="Admin dashboard for LANORA HOUSE." />
      </Helmet>
      
      <div className="min-h-screen bg-neutral-50">
        <AdminNavigation />
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">Admin Dashboard</h1>
                <p className="text-neutral-600">Manage your antique store and raffles</p>
              </div>
            </div>
          
            {/* Live Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-orange-50 border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Offers</CardTitle>
                <FiAward className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700">{pendingOffersArray.length}</div>
                <p className="text-xs text-orange-600">Awaiting review</p>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Raffles</CardTitle>
                <FiGift className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">{activeRaffles}</div>
                <p className="text-xs text-green-600">{completedRaffles} completed</p>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products In Stock</CardTitle>
                <FiPackage className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">{productsInStock}</div>
                <p className="text-xs text-purple-600">Available items</p>
              </CardContent>
            </Card>
            
            <Card className="bg-emerald-50 border-emerald-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <FiDollarSign className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-700">£{totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-emerald-600">Orders + Raffles</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FiTrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                  Raffle Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Raffle Revenue:</span>
                    <span className="font-semibold text-green-600">£{totalRaffleRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Active Raffles:</span>
                    <span className="font-semibold">{activeRaffles}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Completed:</span>
                    <span className="font-semibold">{completedRaffles}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FiAward className="mr-2 h-5 w-5 text-orange-600" />
                  Pending Offers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Total Pending:</span>
                    <span className="font-semibold text-orange-600">{pendingOffersArray.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Requires Review:</span>
                    <span className="font-semibold">{pendingOffersArray.length}</span>
                  </div>
                  <div className="mt-4">
                    <Button 
                      size="sm" 
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      onClick={() => setLocation('/admin/offers')}
                    >
                      Review Offers
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Admin Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {adminSections.map((section, index) => (
              <Card key={index} className="overflow-hidden shadow-sm">
                <CardHeader className="bg-white border-b border-neutral-paper">
                  <div className="flex items-center space-x-4">
                    {section.icon}
                    <div>
                      <CardTitle>{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-left"
                          onClick={() => setLocation(link.path)}
                        >
                          <span className="mr-2">{link.icon}</span>
                          {link.name}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          </div>
        </div>
      </div>
    </>
  );
}