import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Users, Mail, Calendar, Shield, Wallet, Gift, Megaphone, MailX } from "lucide-react";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: string;
  emailVerified: boolean;
  emailMarketingConsent?: boolean;
  emailMarketingConsentDate?: string;
  createdAt: string;
}

interface UserWithWallet extends User {
  walletBalance?: number;
}

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithWallet | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery<UserWithWallet[]>({
    queryKey: ["/api/admin/users-with-wallets"],
  });

  const giftCreditMutation = useMutation({
    mutationFn: async ({ userId, amount, reason }: { userId: string; amount: number; reason: string }) => {
      return await apiRequest("POST", "/api/admin/gift-credit", {
        userId,
        amount,
        reason
      });
    },
    onSuccess: () => {
      toast({
        title: "Credit Gifted Successfully",
        description: `£${creditAmount} has been added to ${selectedUser?.firstName || selectedUser?.email}'s wallet`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users-with-wallets"] });
      setSelectedUser(null);
      setCreditAmount("");
      setCreditReason("");
    },
    onError: (error) => {
      toast({
        title: "Error Gifting Credit",
        description: "Failed to add credit to user's wallet. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleGiftCredit = () => {
    if (!selectedUser || !creditAmount) return;
    
    const amount = parseFloat(creditAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid credit amount",
        variant: "destructive",
      });
      return;
    }

    giftCreditMutation.mutate({
      userId: selectedUser.id,
      amount,
      reason: creditReason || "Admin credit gift"
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <AdminNavigation />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage all registered users and their accounts</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {users.length} Total Users
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users
          </CardTitle>
          <CardDescription>
            Complete list of registered users with login credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Details</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Marketing</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Wallet Balance</TableHead>
                  <TableHead>Add Credit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}`
                            : user.username
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {user.id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.emailMarketingConsent ? (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                          <Megaphone className="h-3 w-3 mr-1" />
                          Subscribed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          <MailX className="h-3 w-3 mr-1" />
                          Not subscribed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                        {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-primary" />
                        <span className="font-medium text-primary">
                          £{(parseFloat(user.walletBalance) || 0).toFixed(2)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Gift className="h-4 w-4 mr-1" />
                            Gift Credit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Gift Credit to {user.firstName || user.email}</DialogTitle>
                            <DialogDescription>
                              Add credit to this user's wallet for social competitions or special rewards.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="amount">Credit Amount (£)</Label>
                              <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={creditAmount}
                                onChange={(e) => setCreditAmount(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="reason">Reason (Optional)</Label>
                              <Input
                                id="reason"
                                placeholder="e.g., Social media competition winner"
                                value={creditReason}
                                onChange={(e) => setCreditReason(e.target.value)}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                onClick={handleGiftCredit}
                                disabled={giftCreditMutation.isPending || !creditAmount}
                                className="flex-1"
                              >
                                {giftCreditMutation.isPending ? "Adding..." : "Add Credit"}
                              </Button>
                              <DialogTrigger asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogTrigger>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.emailVerified ? 'default' : 'outline'}>
                        {user.emailVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(user.createdAt)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No users found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search terms" : "No users have been registered yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Login Information</CardTitle>
          <CardDescription className="text-blue-700">
            For testing purposes, all user accounts use the same password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Test Account Credentials:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-blue-800">Email:</label>
                  <div className="font-mono text-sm bg-blue-100 px-2 py-1 rounded mt-1">
                    test@example.com
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-800">Password:</label>
                  <div className="font-mono text-sm bg-blue-100 px-2 py-1 rounded mt-1">
                    password123
                  </div>
                </div>
              </div>
            </div>
            <div className="text-sm text-blue-700">
              <strong>Note:</strong> All existing users have been updated with the password "password123" for testing purposes.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}