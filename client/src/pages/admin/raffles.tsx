import { useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format, parseISO } from "date-fns";
import RaffleForm, { RaffleFormValues } from "@/components/admin/RaffleForm";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiCalendar,
  FiGift,
  FiArrowLeft,
  FiTag,
  FiUsers,
  FiTrendingUp,
  FiCheckCircle,
  FiStar,
  FiAward,
  FiMoreVertical
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import RaffleSpinner from "@/components/raffles/RaffleSpinner";
import WinnerDisplay from "@/components/raffles/WinnerDisplay";

// Import RaffleFormValues from our RaffleForm component

type Raffle = {
  id: string;
  name: string;
  description: string;
  excerpt: string;
  itemDescription: string;
  retailPrice: string;
  ticketPrice: string;
  startDate: string;
  endDate: string;
  maxTickets: number;
  ticketsSold: number;
  status: 'active' | 'upcoming' | 'completed' | 'ended';
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  winnerId: string | null;
  winningTicketNumber: number | null;
  instantWinEnabled?: boolean;
  instantWinTitle?: string;
  instantWinPrizes?: Array<{
    type: string;
    count: number;
    amount: number;
  }>;
  isFeatured?: boolean;
};

type RaffleEntry = {
  id: string;
  raffleId: string;
  userId: string;
  userName: string;
  userEmail: string;
  ticketCount: number;
  ticketNumbers: number[];
  createdAt: string;
};

export default function PrizeDrawsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEntriesDialogOpen, setIsEntriesDialogOpen] = useState(false);
  const [isDrawWinnerDialogOpen, setIsDrawWinnerDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedWinner, setSelectedWinner] = useState<RaffleEntry | null>(null);
  const [showSpinner, setShowSpinner] = useState(false);
  const [spinnerWinner, setSpinnerWinner] = useState<{id: string, name: string, ticketNumber: number} | null>(null);

  // Fetch prize draws
  const { data: raffles = [], isLoading } = useQuery({
    queryKey: ['/api/raffles/admin'],
    staleTime: 10000,
    placeholderData: []
  });

  // Fetch entries for a specific raffle
  const { data: raffleEntries = [], isLoading: isLoadingEntries } = useQuery({
    queryKey: ['/api/raffles/entries', selectedRaffle?.id],
    queryFn: async () => {
      const response = await fetch(`/api/raffles/entries?raffleId=${selectedRaffle?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch raffle entries');
      }
      return response.json();
    },
    enabled: !!selectedRaffle?.id && isEntriesDialogOpen,
    staleTime: 10000,
    placeholderData: []
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: RaffleFormValues) => {
      console.log("Creating raffle with data:", data);
      console.log("Instant win enabled:", data.instantWinEnabled);
      console.log("Instant win title:", data.instantWinTitle);
      console.log("Instant win prizes:", data.instantWinPrizes);
      return apiRequest("POST", "/api/raffles", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['/api/raffles/admin']});
      toast({ 
        title: "Success",
        description: "Prize Draw created successfully",
      });
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error",
        description: error.message || "Failed to create prize draw",
        variant: "destructive"
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: RaffleFormValues) => {
      if (!selectedRaffle) return Promise.reject("No raffle selected");
      // Pass the ID in the URL and submit the form data
      return apiRequest("PATCH", `/api/raffles/${selectedRaffle.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['/api/raffles/admin']});
      toast({ 
        title: "Success",
        description: "Raffle updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedRaffle(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error",
        description: error.message || "Failed to update prize draw",
        variant: "destructive"
      });
    }
  });

  // Toggle Featured mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, isFeatured }: { id: string, isFeatured: boolean }) => {
      return apiRequest("PATCH", `/api/raffles/${id}`, { isFeatured });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['/api/raffles/admin']});
      queryClient.invalidateQueries({queryKey: ['/api/raffles/featured']});
      toast({ 
        title: "Success",
        description: "Featured prize draw updated successfully",
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error",
        description: error.message || "Failed to update featured status",
        variant: "destructive"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return apiRequest("DELETE", `/api/raffles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['/api/raffles/admin']});
      toast({ 
        title: "Success",
        description: "Prize Draw deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error",
        description: error.message || "Failed to delete prize draw",
        variant: "destructive"
      });
    }
  });

  // Draw winner mutation
  const drawWinnerMutation = useMutation({
    mutationFn: (data: { raffleId: string, winnerEntryId?: string }) => {
      return apiRequest("POST", `/api/raffles/${data.raffleId}/draw-winner`, 
        data.winnerEntryId ? { entryId: data.winnerEntryId } : {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['/api/raffles/admin']});
      queryClient.invalidateQueries({queryKey: ['/api/raffles/entries', selectedRaffle?.id]});
      toast({ 
        title: "Success",
        description: "Winner drawn successfully",
      });
      setIsDrawWinnerDialogOpen(false);
      setSelectedWinner(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error",
        description: error.message || "Failed to draw winner",
        variant: "destructive"
      });
    }
  });

  // Force end raffle mutation
  const forceEndRaffleMutation = useMutation({
    mutationFn: (raffleId: string) => {
      return apiRequest("PATCH", `/api/raffles/${raffleId}`, { status: 'ended' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['/api/raffles/admin']});
      toast({ 
        title: "Success",
        description: "Prize Draw has been ended",
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error",
        description: error.message || "Failed to end prize draw",
        variant: "destructive"
      });
    }
  });

  // Restart raffle mutation
  const restartRaffleMutation = useMutation({
    mutationFn: (raffleId: string) => {
      return apiRequest("POST", `/api/raffles/${raffleId}/restart`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['/api/raffles/admin']});
      toast({ 
        title: "Success",
        description: "Raffle has been completely reset and restarted",
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error",
        description: error.message || "Failed to restart raffle",
        variant: "destructive"
      });
    }
  });

  // Force complete raffle mutation
  const forceCompleteRaffleMutation = useMutation({
    mutationFn: (raffleId: string) => {
      return apiRequest("POST", `/api/raffles/${raffleId}/force-complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['/api/raffles/admin']});
      toast({ 
        title: "Success",
        description: "Raffle has been completed with a winner selected",
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error",
        description: error.message || "Failed to complete raffle",
        variant: "destructive"
      });
    }
  });

  // Handle form submission for creating a raffle
  const onCreateSubmit = (data: RaffleFormValues) => {
    createMutation.mutate(data);
  };

  // Handle form submission for updating a raffle
  const onUpdateSubmit = (data: RaffleFormValues) => {
    if (selectedRaffle) {
      // Send the ID separately since it's not part of RaffleFormValues
      updateMutation.mutate(data);
    }
  };

  // Handle edit button click
  const handleEdit = (raffle: Raffle) => {
    // Just select the raffle and open the dialog
    // The RaffleForm component will handle populating the fields
    setSelectedRaffle(raffle);
    setIsEditDialogOpen(true);
  };

  // Handle view entries click
  const handleViewEntries = (raffle: Raffle) => {
    setSelectedRaffle(raffle);
    setIsEntriesDialogOpen(true);
  };

  // Handle draw winner click
  const handleDrawWinner = (raffle: Raffle) => {
    setSelectedRaffle(raffle);
    setIsDrawWinnerDialogOpen(true);
  };

  // Handle delete button click
  const handleDelete = (raffle: Raffle) => {
    setSelectedRaffle(raffle);
    setIsConfirmDeleteOpen(true);
  };
  
  // Confirm delete
  const confirmDelete = async () => {
    if (selectedRaffle) {
      try {
        // Use direct fetch to ensure we handle the response properly
        const response = await fetch(`/api/raffles/${selectedRaffle.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            // Add admin auth headers here - get from your auth utility
            'X-Admin-Email': 'Mattapinch@gmail.com',
            'X-Admin-Password': '@Kawasak167'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        
        // Close dialog and refetch data
        setIsConfirmDeleteOpen(false);
        setTimeout(() => {
          queryClient.invalidateQueries({queryKey: ['/api/raffles/admin']});
        }, 300);
        
        toast({
          title: "Success",
          description: "Prize Draw has been permanently deleted from the system",
        });
      } catch (error) {
        console.error("Error deleting raffle:", error);
        toast({
          title: "Error",
          description: "Failed to delete the prize draw. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  // Handle draw random winner with spinner animation
  const handleDrawRandomWinner = () => {
    if (selectedRaffle && raffleEntries.length > 0) {
      setShowSpinner(true);
      // Don't close the dialog, let the spinner show
    }
  };

  // Handle spinner draw completion
  const handleSpinnerDraw = (winningTicketNumber: number) => {
    if (selectedRaffle && raffleEntries.length > 0) {
      // Find the winner based on the ticket number
      const winnerEntry = raffleEntries.find(entry => 
        entry.ticketNumbers.includes(winningTicketNumber)
      );
      
      if (winnerEntry) {
        setSpinnerWinner({
          id: winnerEntry.userId,
          name: winnerEntry.userName || "Anonymous",
          ticketNumber: winningTicketNumber
        });
        
        // Now actually draw the winner via API
        drawWinnerMutation.mutate({ 
          raffleId: selectedRaffle.id,
          winnerEntryId: winnerEntry.id 
        });
      }
    }
  };

  // Handle select winner
  const handleSelectWinner = (entry: RaffleEntry) => {
    setSelectedWinner(entry);
  };

  // Handle confirm selected winner
  const handleConfirmSelectedWinner = () => {
    if (selectedRaffle && selectedWinner) {
      drawWinnerMutation.mutate({ 
        raffleId: selectedRaffle.id,
        winnerEntryId: selectedWinner.id 
      });
    }
  };

  // Format date function
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Calculate ticket sales percentage
  const calculateTicketSalesPercentage = (raffle: Raffle) => {
    return (raffle.ticketsSold / raffle.maxTickets) * 100;
  };

  // Filter raffles based on tab
  const filteredRaffles = raffles.filter((raffle: Raffle) => {
    if (selectedTab === "all") return true;
    return raffle.status === selectedTab;
  });

  // Calculate dashboard metrics
  const totalRaffleRevenue = filteredRaffles.reduce((sum: number, raffle: Raffle) => 
    sum + (parseFloat(raffle.ticketPrice) * raffle.ticketsSold), 0
  );

  const totalActiveRaffles = filteredRaffles.filter((raffle: Raffle) => raffle.status === 'active').length;
  const totalCompletedRaffles = filteredRaffles.filter((raffle: Raffle) => raffle.status === 'completed').length;
  const averageTicketsSold = filteredRaffles.length > 0 ? 
    filteredRaffles.reduce((sum: number, raffle: Raffle) => sum + raffle.ticketsSold, 0) / filteredRaffles.length : 0;

  return (
    <>
      <Helmet>
        <title>Raffles | Admin | LANORA HOUSE</title>
        <meta name="description" content="Manage raffles for LANORA HOUSE." />
      </Helmet>
      
      <div className="min-h-screen bg-neutral-50">
        <AdminNavigation />
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">Raffles</h1>
                <p className="text-neutral-600">Manage your raffles and draw winners</p>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <FiPlus className="mr-2" /> Add Raffle
              </Button>
            </div>
          
          <Card>
            <CardHeader>
              <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="bg-neutral-paper">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="ended">Ended</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : filteredRaffles.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-neutral-wood">No raffles found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Raffle Details</TableHead>
                        <TableHead>Status & Winner</TableHead>
                        <TableHead>Sales Progress</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Instant Wins</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRaffles.map((raffle: Raffle) => (
                        <TableRow key={raffle.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-md overflow-hidden">
                                <img 
                                  src={raffle.imageUrl} 
                                  alt={raffle.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-sm">{raffle.name}</p>
                                <p className="text-xs text-neutral-wood truncate max-w-[180px]">
                                  {raffle.itemDescription}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    ID: {raffle.id}
                                  </span>
                                  <span className="text-xs text-neutral-500">
                                    £{raffle.retailPrice} retail
                                  </span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <Badge variant={
                                raffle.status === "active" ? "default" :
                                raffle.status === "upcoming" ? "secondary" :
                                raffle.status === "completed" ? "outline" :
                                "outline"
                              }>
                                {raffle.status.toUpperCase()}
                              </Badge>
                              
                              {raffle.status === "completed" && raffle.winnerId && (
                                <div className="bg-green-50 p-2 rounded border-l-2 border-green-500">
                                  <div className="flex items-center text-xs text-green-700">
                                    <FiCheckCircle className="mr-1" size={12} />
                                    <span className="font-semibold">Winner Selected</span>
                                  </div>
                                  <div className="text-xs text-green-600 mt-1">
                                    Ticket #{raffle.winningTicketNumber}
                                  </div>
                                  <div className="text-xs text-neutral-600 mt-1">
                                    User ID: {raffle.winnerId}
                                  </div>
                                </div>
                              )}
                              
                              {raffle.status === "ended" && !raffle.winnerId && (
                                <div className="bg-orange-50 p-2 rounded border-l-2 border-orange-500">
                                  <div className="text-xs text-orange-700 font-semibold">
                                    Ended - No Winner
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>{raffle.ticketsSold} sold</span>
                                <span>{raffle.maxTickets} max</span>
                              </div>
                              <Progress 
                                value={calculateTicketSalesPercentage(raffle)} 
                                className="h-2" 
                              />
                              <div className="text-xs text-right text-neutral-wood">
                                {Math.round(calculateTicketSalesPercentage(raffle))}%
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-semibold text-green-600">
                                £{(parseFloat(raffle.ticketPrice) * raffle.ticketsSold).toFixed(2)}
                              </div>
                              <div className="text-xs text-neutral-500">
                                Revenue Generated
                              </div>
                              <div className="text-xs space-y-0.5">
                                <div>£{raffle.ticketPrice} per ticket</div>
                                <div className="text-neutral-400">
                                  Max: £{(parseFloat(raffle.ticketPrice) * raffle.maxTickets).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {raffle.instantWinEnabled ? (
                              <div className="space-y-1">
                                <div className="font-medium text-purple-600 text-xs">
                                  {raffle.instantWinTitle || "COSMIC CASH"}
                                </div>
                                <div className="text-xs space-y-1">
                                  {Array.isArray(raffle.instantWinPrizes) ? (
                                    raffle.instantWinPrizes.map((prize, index) => (
                                      <div key={index} className="flex items-center gap-1">
                                        <span className="text-emerald-600 font-semibold">
                                          {prize.count}×
                                        </span>
                                        <span className="text-neutral-wood">
                                          £{prize.amount} {prize.type}
                                        </span>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-neutral-wood">
                                      No prize details
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-neutral-wood text-xs">No instant prizes</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-xs">
                                <div className="text-neutral-500">Start:</div>
                                <div className="font-medium">{formatDate(raffle.startDate)}</div>
                              </div>
                              <div className="text-xs">
                                <div className="text-neutral-500">End:</div>
                                <div className="font-medium">{formatDate(raffle.endDate)}</div>
                              </div>
                              <div className="text-xs">
                                {new Date(raffle.endDate) > new Date() ? (
                                  <span className="text-green-600">Active Period</span>
                                ) : (
                                  <span className="text-red-600">Expired</span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <FiMoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem 
                                  onClick={() => handleViewEntries(raffle)}
                                  className="hover:bg-neutral-paper"
                                >
                                  <FiUsers className="mr-2 h-4 w-4" />
                                  View Entries
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem 
                                  onClick={() => toggleFeaturedMutation.mutate({ id: raffle.id, isFeatured: !raffle.isFeatured })}
                                  className={raffle.isFeatured ? "text-amber-600 hover:bg-amber-50" : "hover:bg-neutral-paper"}
                                >
                                  <FiStar className={`mr-2 h-4 w-4 ${raffle.isFeatured ? 'fill-current' : ''}`} />
                                  {raffle.isFeatured ? 'Unfeature' : 'Feature'}
                                </DropdownMenuItem>
                                
                                {raffle.status === "completed" && !raffle.winnerId && (
                                  <DropdownMenuItem 
                                    onClick={() => handleDrawWinner(raffle)}
                                    className="text-green-600 hover:bg-green-50"
                                  >
                                    <FiGift className="mr-2 h-4 w-4" />
                                    Draw Winner
                                  </DropdownMenuItem>
                                )}

                                {(raffle.status === "active" || raffle.status === "upcoming") && (
                                  <>
                                    <DropdownMenuItem 
                                      onClick={() => forceEndRaffleMutation.mutate(raffle.id)}
                                      className="text-orange-600 hover:bg-orange-50"
                                    >
                                      <FiCheckCircle className="mr-2 h-4 w-4" />
                                      Force End Raffle
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuItem 
                                      onClick={() => forceCompleteRaffleMutation.mutate(raffle.id)}
                                      className="text-purple-600 hover:bg-purple-50"
                                    >
                                      <FiAward className="mr-2 h-4 w-4" />
                                      Force Complete (Select Winner)
                                    </DropdownMenuItem>
                                  </>
                                )}

                                {(raffle.status === "ended" || raffle.status === "completed") && (
                                  <DropdownMenuItem 
                                    onClick={() => restartRaffleMutation.mutate(raffle.id)}
                                    className="text-green-600 hover:bg-green-50"
                                  >
                                    <FiArrowLeft className="mr-2 h-4 w-4" />
                                    Restart Raffle
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem 
                                  onClick={() => handleEdit(raffle)}
                                  className="hover:bg-neutral-paper"
                                >
                                  <FiEdit2 className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(raffle)}
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <FiTrash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
      
      {/* Add Raffle Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Raffle</DialogTitle>
            <DialogDescription>Create a new raffle for antique items.</DialogDescription>
          </DialogHeader>
          
          <RaffleForm
            onSubmit={onCreateSubmit}
            isSubmitting={createMutation.isPending}
            submitLabel="Create Raffle"
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Raffle Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Raffle</DialogTitle>
            <DialogDescription>Update raffle details.</DialogDescription>
          </DialogHeader>
          
          {selectedRaffle && (
            <RaffleForm
              initialValues={{
                name: selectedRaffle.name,
                description: selectedRaffle.description,
                excerpt: selectedRaffle.excerpt || '',
                itemDescription: selectedRaffle.itemDescription,
                retailPrice: selectedRaffle.retailPrice.toString(),
                ticketPrice: selectedRaffle.ticketPrice.toString(),
                startDate: selectedRaffle.startDate.split('T')[0], // Get just the date part
                startTime: selectedRaffle.startDate.includes('T') ? selectedRaffle.startDate.split('T')[1].substring(0, 5) : "12:00",
                endDate: selectedRaffle.endDate.split('T')[0], // Get just the date part
                endTime: selectedRaffle.endDate.includes('T') ? selectedRaffle.endDate.split('T')[1].substring(0, 5) : "23:59",
                maxTickets: selectedRaffle.maxTickets.toString(),
                imageUrl: selectedRaffle.imageUrl,
                status: selectedRaffle.status
              }}
              onSubmit={onUpdateSubmit}
              isSubmitting={updateMutation.isPending}
              submitLabel="Update Raffle"
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* View Entries Dialog */}
      <Dialog open={isEntriesDialogOpen} onOpenChange={setIsEntriesDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Entries for {selectedRaffle?.name}</DialogTitle>
            <DialogDescription>
              View all tickets purchased for this raffle.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <p className="text-sm text-neutral-wood">Total Entries: <span className="font-semibold text-foreground">{raffleEntries.length}</span></p>
              <p className="text-sm text-neutral-wood">Tickets Sold: <span className="font-semibold text-foreground">{selectedRaffle?.ticketsSold} / {selectedRaffle?.maxTickets}</span></p>
            </div>
            <Progress 
              value={selectedRaffle ? (selectedRaffle.ticketsSold / selectedRaffle.maxTickets) * 100 : 0} 
              className="h-2" 
            />
          </div>
          
          {isLoadingEntries ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : raffleEntries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-wood">No entries found for this raffle</p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Tickets</TableHead>
                    <TableHead>Ticket Numbers</TableHead>
                    <TableHead>Purchase Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {raffleEntries.map((entry: RaffleEntry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{entry.userName || "Anonymous"}</p>
                          <p className="text-xs text-neutral-wood">{entry.userEmail || "No email"}</p>
                        </div>
                      </TableCell>
                      <TableCell>{entry.ticketCount}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {entry.ticketNumbers.slice(0, 10).map((num, idx) => (
                            <span 
                              key={idx} 
                              className="inline-block px-2 py-1 text-xs bg-neutral-paper rounded-md"
                            >
                              #{num}
                            </span>
                          ))}
                          {entry.ticketNumbers.length > 10 && (
                            <span className="inline-block px-2 py-1 text-xs bg-neutral-paper rounded-md">
                              +{entry.ticketNumbers.length - 10} more
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(entry.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Draw Winner Dialog */}
      <Dialog open={isDrawWinnerDialogOpen} onOpenChange={setIsDrawWinnerDialogOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Draw Winner for {selectedRaffle?.name}</DialogTitle>
            <DialogDescription>
              {showSpinner ? "Watch the exciting winner selection!" : "Choose how to select the winner for this raffle."}
            </DialogDescription>
          </DialogHeader>
          
          {showSpinner ? (
            <div className="space-y-6 py-8">
              {/* Raffle Spinner Component */}
              {raffleEntries.length > 0 && (
                <RaffleSpinner
                  ticketNumbers={raffleEntries.flatMap(entry => entry.ticketNumbers)}
                  onDraw={handleSpinnerDraw}
                  isAdmin={true}
                />
              )}
              
              {/* Winner Display */}
              {spinnerWinner && (
                <div className="mt-8">
                  <WinnerDisplay
                    winner={spinnerWinner}
                    raffleName={selectedRaffle?.name || "Raffle"}
                    showConfetti={true}
                  />
                </div>
              )}
              
              {/* Back to selection */}
              <div className="flex justify-center pt-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowSpinner(false);
                    setSpinnerWinner(null);
                  }}
                  disabled={drawWinnerMutation.isPending}
                >
                  Back to Selection
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-neutral-paper p-4 rounded-md">
                <h3 className="font-semibold mb-2 flex items-center">
                  <FiGift className="mr-2 text-primary" /> Raffle Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-wood">Item:</p>
                    <p className="font-medium">{selectedRaffle?.itemDescription}</p>
                  </div>
                  <div>
                    <p className="text-neutral-wood">Retail Value:</p>
                    <p className="font-medium">£{selectedRaffle?.retailPrice}</p>
                  </div>
                  <div>
                    <p className="text-neutral-wood">Tickets Sold:</p>
                    <p className="font-medium">{selectedRaffle?.ticketsSold} / {selectedRaffle?.maxTickets}</p>
                  </div>
                  <div>
                    <p className="text-neutral-wood">End Date:</p>
                    <p className="font-medium">{selectedRaffle ? formatDate(selectedRaffle.endDate) : ''}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <FiTrendingUp className="mr-2 text-primary" /> Selection Method
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className={selectedWinner ? "" : "border-primary"}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">🎲 Animated Draw</CardTitle>
                        <CardDescription>Watch the spinning wheel select a winner</CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={handleDrawRandomWinner}
                          disabled={drawWinnerMutation.isPending || !!selectedWinner || raffleEntries.length === 0}
                        >
                          Start Spinning Wheel
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card className={selectedWinner ? "border-primary" : ""}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Manual Selection</CardTitle>
                        <CardDescription>Choose a winner from the entries</CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Button 
                          variant={selectedWinner ? "default" : "outline"}
                          className="w-full"
                          onClick={() => {
                            setIsDrawWinnerDialogOpen(false);
                            setIsEntriesDialogOpen(true);
                          }}
                        >
                          View Entries
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
                
                {selectedWinner && (
                  <div className="bg-neutral-paper p-4 rounded-md">
                    <h3 className="font-semibold mb-2">Selected Winner</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{selectedWinner.userName || "Anonymous"}</p>
                        <p className="text-sm text-neutral-wood">{selectedWinner.userEmail || "No email"}</p>
                        <p className="text-sm">{selectedWinner.ticketCount} tickets</p>
                      </div>
                      <Button 
                        onClick={handleConfirmSelectedWinner}
                        disabled={drawWinnerMutation.isPending}
                      >
                        {drawWinnerMutation.isPending ? "Confirming..." : "Confirm Winner"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setIsDrawWinnerDialogOpen(false);
                    setSelectedWinner(null);
                    setShowSpinner(false);
                    setSpinnerWinner(null);
                  }}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Raffle</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete "{selectedRaffle?.name}"?
            This raffle will be permanently removed from the system. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}