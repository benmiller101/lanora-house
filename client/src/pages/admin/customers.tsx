import { useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import {
  FiUsers,
  FiUser,
  FiMail,
  FiCalendar,
  FiDollarSign,
  FiPackage,
  FiShoppingBag,
  FiEye,
  FiEdit2,
  FiLock,
  FiUserX
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AdminNavigation } from "@/components/admin/AdminNavigation";

// Define User type
type User = {
  id: string;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  walletBalance: number;
  role: string;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
};

// Define Order type for user order history
type Order = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
};

// Define RaffleEntry type for user raffle history
type RaffleEntry = {
  id: string;
  raffleId: string;
  raffleName: string;
  ticketNumbers: number[];
  createdAt: string;
};

export default function CustomersPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/admin/users', {
          headers: {
            'X-Admin-Email': 'Mattapinch@gmail.com',
            'X-Admin-Password': '@Kawasak167'
          }
        });
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
      } catch (error) {
        console.error('Error fetching users:', error);
        return [];
      }
    },
    staleTime: 30000,
  });

  // Fetch user details including orders and raffle entries
  const { data: userDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['/api/admin/users', selectedUser?.id],
    enabled: !!selectedUser,
    queryFn: async () => {
      try {
        const res = await fetch(`/api/admin/users/${selectedUser?.id}`, {
          headers: {
            'X-Admin-Email': 'Mattapinch@gmail.com',
            'X-Admin-Password': '@Kawasak167'
          }
        });
        if (!res.ok) throw new Error('Failed to fetch user details');
        return res.json();
      } catch (error) {
        console.error('Error fetching user details:', error);
        return { orders: [], raffleEntries: [] };
      }
    }
  });

  // Mock user data for demonstration
  const mockUsers = [
    {
      id: "1747655768771",
      email: "benwmiller101@gmail.com",
      username: "benwmiller101",
      firstName: "Ben",
      lastName: "Miller",
      profileImageUrl: null,
      walletBalance: 250,
      role: "user",
      lastLogin: "2025-05-19T11:56:08.784Z",
      createdAt: "2025-05-19T11:56:08.784Z",
      updatedAt: "2025-05-19T11:56:08.784Z"
    },
    {
      id: "1747655123456",
      email: "sarah.johnson@example.com",
      username: "sarahj",
      firstName: "Sarah",
      lastName: "Johnson",
      profileImageUrl: null,
      walletBalance: 125.50,
      role: "user",
      lastLogin: "2025-05-18T09:30:22.123Z",
      createdAt: "2025-04-12T14:22:08.784Z",
      updatedAt: "2025-05-18T09:30:22.123Z"
    },
    {
      id: "1747657891234",
      email: "michael.smith@example.com",
      username: "mikesmith",
      firstName: "Michael",
      lastName: "Smith",
      profileImageUrl: null,
      walletBalance: 0,
      role: "user",
      lastLogin: "2025-05-15T16:42:01.321Z",
      createdAt: "2025-03-22T10:15:45.555Z",
      updatedAt: "2025-05-15T16:42:01.321Z"
    }
  ];

  // Mock order data
  const mockOrders = [
    {
      id: "ORD123456",
      total: 157.99,
      status: "completed",
      createdAt: "2025-05-10T14:30:00Z"
    },
    {
      id: "ORD123457",
      total: 89.50,
      status: "processing",
      createdAt: "2025-05-18T10:15:00Z"
    }
  ];

  // Mock raffle entries
  const mockRaffleEntries = [
    {
      id: "ENT123456",
      raffleId: "RAF123",
      raffleName: "Victorian Silver Tea Set",
      ticketNumbers: [123, 124, 125],
      createdAt: "2025-05-05T09:45:00Z"
    },
    {
      id: "ENT123457",
      raffleId: "RAF124",
      raffleName: "Antique Brass Clock",
      ticketNumbers: [456, 457],
      createdAt: "2025-05-15T11:30:00Z"
    }
  ];

  // View user profile
  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setIsProfileOpen(true);
  };

  // Reset user password (just a mock function for now)
  const handleResetPassword = (userId: string) => {
    if (confirm('Are you sure you want to reset this user\'s password? They will receive an email with instructions.')) {
      toast({
        title: "Password Reset Email Sent",
        description: "The user will receive instructions to reset their password.",
      });
    }
  };

  // Disable user account (just a mock function for now)
  const handleDisableAccount = (userId: string) => {
    if (confirm('Are you sure you want to disable this user\'s account? They will no longer be able to log in.')) {
      toast({
        title: "Account Disabled",
        description: "The user's account has been disabled.",
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  // Filter users based on search term
  const filteredUsers = mockUsers.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      (user.username && user.username.toLowerCase().includes(searchLower)) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchLower))
    );
  });

  return (
    <>
      <Helmet>
        <title>Customers | Admin | LANORA HOUSE</title>
        <meta name="description" content="Manage customers for LANORA HOUSE." />
      </Helmet>
      
      <div className="bg-neutral-ivory min-h-screen py-8">
        <div className="container mx-auto px-4">
          <AdminNavigation />
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="font-display text-3xl mb-2">Customers</h1>
              <p className="text-neutral-wood">Manage your customer accounts</p>
            </div>
          </div>
          
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Customer Search</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Search by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>All Customers</CardTitle>
              <CardDescription>Total: {mockUsers.length} customers</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-neutral-wood">No customers found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Wallet Balance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              {user.profileImageUrl ? (
                                <img 
                                  src={user.profileImageUrl} 
                                  alt={`${user.firstName || ''} ${user.lastName || ''}`}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <FiUser className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">
                                {user.firstName && user.lastName 
                                  ? `${user.firstName} ${user.lastName}`
                                  : user.username || 'Anonymous'}
                              </div>
                              {user.username && (
                                <div className="text-sm text-muted-foreground">@{user.username}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>{formatCurrency(user.walletBalance)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-neutral-paper"
                              onClick={() => handleViewProfile(user)}
                            >
                              <FiEye className="mr-1" /> View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-neutral-paper"
                              onClick={() => handleResetPassword(user.id)}
                            >
                              <FiLock className="mr-1" /> Reset Password
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleDisableAccount(user.id)}
                            >
                              <FiUserX className="mr-1" /> Disable
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* User Profile Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Profile</DialogTitle>
            <DialogDescription>
              View detailed information about this customer
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {selectedUser.profileImageUrl ? (
                    <img 
                      src={selectedUser.profileImageUrl} 
                      alt={`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <FiUser className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedUser.firstName && selectedUser.lastName 
                      ? `${selectedUser.firstName} ${selectedUser.lastName}`
                      : selectedUser.username || 'Anonymous'}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedUser.username && `@${selectedUser.username}`}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Email</h4>
                  <p>{selectedUser.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Member Since</h4>
                  <p>{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Last Login</h4>
                  <p>{formatDate(selectedUser.lastLogin)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Wallet Balance</h4>
                  <p className="font-semibold">{formatCurrency(selectedUser.walletBalance)}</p>
                </div>
              </div>
              
              <Separator />
              
              <Tabs defaultValue="orders">
                <TabsList>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="raffles">Raffle Entries</TabsTrigger>
                </TabsList>
                <TabsContent value="orders" className="space-y-4 pt-4">
                  <h4 className="font-medium">Recent Orders</h4>
                  {mockOrders.length === 0 ? (
                    <p className="text-muted-foreground">No orders found for this customer.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                            <TableCell>{formatCurrency(order.total)}</TableCell>
                            <TableCell>
                              <Badge variant={
                                order.status === "completed" ? "default" : 
                                order.status === "processing" ? "secondary" : 
                                "outline"
                              }>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
                <TabsContent value="raffles" className="space-y-4 pt-4">
                  <h4 className="font-medium">Raffle Entries</h4>
                  {mockRaffleEntries.length === 0 ? (
                    <p className="text-muted-foreground">No raffle entries found for this customer.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Raffle</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Tickets</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockRaffleEntries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="font-medium">{entry.raffleName}</TableCell>
                            <TableCell>{formatDate(entry.createdAt)}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {entry.ticketNumbers.map((num) => (
                                  <Badge key={num} variant="outline" className="bg-primary/5">
                                    #{num}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsProfileOpen(false)}>Close</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}