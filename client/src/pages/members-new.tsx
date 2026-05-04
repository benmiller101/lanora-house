import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FiArrowLeft,
  FiEdit2,
  FiPackage,
  FiFileText,
  FiClock,
} from "react-icons/fi";
import { MdConfirmationNumber } from "react-icons/md";
import { ItemSubmissionForm } from "@/components/account/ItemSubmissionForm";
import { ItemSubmissionsList } from "@/components/account/ItemSubmissionsList";
import { OrderStatusTimeline } from "@/components/OrderStatusTimeline";
import { RaffleWins } from "@/components/account/RaffleWins";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  profileImageUrl: string;
}

export default function MembersPortal() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    profileImageUrl: "",
  });
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      // tell React-Query to refetch raffleEntries now that we're logged in
      refetchRaffles();
      queryClient.invalidateQueries(["raffleEntries"]);
    }
  }, [isAuthenticated, queryClient]);

  // 1) Fetch user orders
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

  // 2) Fetch raffle entries
  const {
    data: raffleEntries = [],
    isLoading: raffleEntriesLoading,
    error: raffleEntriesError,
    refetch: refetchRaffles,
  } = useQuery({
    queryKey: ["raffleEntries"],
    queryFn: async () => {
      const res = await fetch("/api/raffles/user-raffle-tickets", {
        credentials: "include",
        cache: "reload", // skip browser cache
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) throw new Error("Failed to load raffle entries");
      return res.json();
    },
    enabled: !isLoading && isAuthenticated, // only run once auth is fully loaded & true
    staleTime: 0, // data is immediately stale
    refetchOnMount: "always", // always refetch when the component mounts
    refetchOnWindowFocus: true, // refetch when the user focuses the tab
  });

  // 3) Fetch active raffles (to look up names/prices if you need)
  const { data: activeRaffles = [] } = useQuery({
    queryKey: ["activeRaffles"],
    queryFn: async () => {
      const res = await fetch("/api/raffles", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load raffles");
      return res.json();
    },
  });

  // … below your raffle useQuery …
  console.log("🎟️ raffleEntries:", raffleEntries);
  console.log(
    "   loading:",
    raffleEntriesLoading,
    "error:",
    raffleEntriesError,
  );

  // Group raffle entries by raffle ID
  const groupedRaffleEntries = raffleEntries.reduce((acc: any, entry: any) => {
    const raffleId = entry.raffleId;
    if (!acc[raffleId]) {
      acc[raffleId] = {
        raffleId,
        raffleName: entry.raffleName,
        raffleEndDate: entry.raffleEndDate,
        entries: [],
        totalTickets: 0,
        allTicketNumbers: [],
        firstEntry: entry.createdAt
      };
    }
    acc[raffleId].entries.push(entry);
    acc[raffleId].totalTickets += entry.ticketNumbers?.length || 1;
    acc[raffleId].allTicketNumbers.push(...(entry.ticketNumbers || []));
    // Keep the earliest entry date
    if (new Date(entry.createdAt) < new Date(acc[raffleId].firstEntry)) {
      acc[raffleId].firstEntry = entry.createdAt;
    }
    return acc;
  }, {});

  const groupedRaffleEntriesArray = Object.values(groupedRaffleEntries);

  // Initialize the profile form
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        username: user.username || "",
        profileImageUrl: user.profileImageUrl || "",
      });
    }
  }, [user]);

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "M";
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async () => {
    try {
      await apiRequest("PUT", "/api/user/profile", profileData);
      toast({ title: "Profile Updated", description: "Saved successfully." });
      setIsEditing(false);
      window.location.reload();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  // Loading / unauthenticated guards
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>Please log in to continue.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => (window.location.href = "/login")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-paper">
      <Helmet>
        <title>Member Portal | LANORA HOUSE</title>
        <meta
          name="description"
          content="Manage your LANORA HOUSE member profile, orders, and raffles."
        />
      </Helmet>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => (window.location.href = "/")}
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold">Member Portal</h1>
          <p className="text-lg text-muted-foreground mt-1">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-20 w-20">
                    {user.profileImageUrl && (
                      <AvatarImage
                        src={user.profileImageUrl}
                        alt={user.firstName || "User"}
                      />
                    )}
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.username || "Member"}
                    </h2>
                    <p className="text-muted-foreground break-all">
                      {user.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Member since{" "}
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "Recently"}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <FiEdit2 className="mr-2 h-4 w-4" />
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => (window.location.href = "/api/logout")}
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardHeader>

            {isEditing && (
              <CardContent className="border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {["firstName", "lastName", "username", "email"].map(
                    (field) => (
                      <div key={field}>
                        <label className="text-sm font-medium block mb-1">
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </label>
                        <Input
                          name={field}
                          value={profileData[field as keyof ProfileFormData]}
                          onChange={handleProfileChange}
                          placeholder={`Enter ${field}`}
                          type={field === "email" ? "email" : "text"}
                        />
                      </div>
                    ),
                  )}
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleProfileSave}>Save Changes</Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Dashboard: Orders & Raffles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FiPackage className="mr-2 h-5 w-5" />
                  Recent Orders
                </CardTitle>
                <CardDescription>Your last 3 purchases</CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : ordersError ? (
                  <p className="text-red-500">Error loading orders.</p>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order: any) => (
                      <div
                        key={order.orderId}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">
                              Order #{order.orderId}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-lg font-bold">
                            £
                            {Number(order.unitPrice * order.quantity).toFixed(
                              2,
                            )}
                          </span>
                        </div>
                        <OrderStatusTimeline
                          currentStatus={order.status}
                          orderDate={order.createdAt}
                          estimatedDelivery={order.estimatedDelivery}
                          compact
                        />
                      </div>
                    ))}
                    {orders.length > 3 && (
                      <Button variant="outline" className="w-full">
                        View All Orders ({orders.length})
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FiPackage className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Orders Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't placed any orders yet.
                    </p>
                    <Button onClick={() => (window.location.href = "/shop")}>
                      Start Shopping
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Raffles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MdConfirmationNumber className="mr-2 h-5 w-5" />
                  Your Raffle Entries
                </CardTitle>
                <CardDescription>Raffles you’ve joined</CardDescription>
              </CardHeader>
              <CardContent>
                {raffleEntriesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : raffleEntriesError ? (
                  <p className="text-red-500">Error loading raffles.</p>
                ) : groupedRaffleEntriesArray.length > 0 ? (
                  <div className="space-y-4">
                    {groupedRaffleEntriesArray.map((group: any) => (
                      <div key={group.raffleId} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{group.raffleName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {group.totalTickets} ticket{group.totalTickets > 1 ? 's' : ''} • Numbers: {group.allTicketNumbers.sort((a, b) => a - b).join(', ')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              First entry: {new Date(group.firstEntry).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-lg font-bold">
                            £
                            {(
                              Number(
                                activeRaffles.find(
                                  (r: any) => r.id === group.raffleId,
                                )?.ticketPrice || 0,
                              ) * group.totalTickets
                            ).toFixed(2)}
                          </p>
                        </div>
                        {group.raffleEndDate && (
                          <div className="mt-2 flex items-center text-sm text-muted-foreground">
                            <FiClock className="mr-1 h-4 w-4" />
                            Ends{" "}
                            {new Date(group.raffleEndDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => (window.location.href = "/raffles")}
                    >
                      View All Raffles
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MdConfirmationNumber className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No Raffle Entries
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't entered any raffles yet.
                    </p>
                    <Button onClick={() => (window.location.href = "/raffles")}>
                      Browse Raffles
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Raffle Wins */}
          <RaffleWins />

          {/* Item Submissions */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <FiFileText className="mr-2 h-5 w-5" />
                    Item Submissions
                  </CardTitle>
                  <CardDescription>
                    Submit items or view past submissions
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowSubmissionForm(!showSubmissionForm)}
                >
                  {showSubmissionForm ? "View Submissions" : "Submit New Item"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showSubmissionForm ? (
                <ItemSubmissionForm
                  onSubmitSuccess={() => setShowSubmissionForm(false)}
                />
              ) : (
                <ItemSubmissionsList />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
