import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format, isPast } from 'date-fns';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import PrizeDrawForm from '@/components/admin/RaffleForm';

type Raffle = {
  id: string;
  name: string;
  description: string;
  itemDescription: string;
  retailPrice: string;
  ticketPrice: string;
  startDate: string;
  endDate: string;
  maxTickets: number;
  ticketsSold: number;
  status: 'active' | 'upcoming' | 'completed' | 'deleted';
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
};

export function ManagePrizeDraws() {
  const [prizeDraws, setPrizeDraws] = useState<Raffle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const { toast } = useToast();

  const fetchPrizeDraws = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/raffles/admin');
      
      if (!response.ok) {
        throw new Error('Failed to fetch prize draws');
      }
      
      const data = await response.json();
      setPrizeDraws(data);
    } catch (err) {
      console.error('Error fetching prize draws:', err);
      setError('Failed to load prize draws. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrizeDraws();
  }, []);

  const handleEdit = (prizeDraw: Raffle) => {
    setSelectedRaffle(prizeDraw);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (raffle: Raffle) => {
    setSelectedRaffle(raffle);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRaffle) return;
    
    try {
      const response = await apiRequest('DELETE', `/api/raffles/${selectedRaffle.id}`);
      
      if (response.ok) {
        toast({ 
          title: "Success", 
          description: "Prize draw deleted successfully" 
        });
        
        // Remove deleted prize draw from state
        setPrizeDraws(prizeDraws.filter(r => r.id !== selectedRaffle.id));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete prize draw');
      }
    } catch (err) {
      toast({ 
        title: "Error", 
        description: err instanceof Error ? err.message : 'Failed to delete prize draw',
        variant: "destructive" 
      });
    } finally {
      setIsConfirmDeleteOpen(false);
      setSelectedRaffle(null);
    }
  };

  const handleUpdateSubmit = async (data: any) => {
    if (!selectedRaffle) return;
    
    try {
      // Remove fields that don't exist in the database to prevent errors
      const updateData = {
        name: data.name,
        description: data.description || '',
        itemDescription: data.itemDescription,
        ticketPrice: data.ticketPrice,
        startDate: data.startDate,
        endDate: data.endDate,
        maxTickets: data.maxTickets,
        status: data.status,
        imageUrl: data.imageUrl,
        // Only include instant win prizes if they exist
        ...(data.instantWinPrizes ? { instantWinPrizes: data.instantWinPrizes } : {})
      };
      
      const response = await apiRequest('PATCH', `/api/raffles/${selectedRaffle.id}`, updateData);
      
      if (response.ok) {
        toast({ 
          title: "Success", 
          description: "Prize draw updated successfully" 
        });
        
        // Refresh prize draw list
        await fetchPrizeDraws();
        
        // Close edit dialog
        setIsEditDialogOpen(false);
        setSelectedRaffle(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update prize draw');
      }
    } catch (err) {
      toast({ 
        title: "Error", 
        description: err instanceof Error ? err.message : 'Failed to update prize draw',
        variant: "destructive" 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => fetchPrizeDraws()}>Try Again</Button>
      </div>
    );
  }

  if (prizeDraws.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-2xl font-semibold mb-4">No Prize Draws Found</h3>
        <p className="text-muted-foreground mb-6">You haven't created any prize draws yet.</p>
        <Button onClick={() => document.location.href = '/admin/raffles'}>
          Create a Prize Draw
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage My Prize Draws</h2>
        <Button onClick={() => document.location.href = '/admin/raffles'}>
          Create New Prize Draw
        </Button>
      </div>
      
      <div className="space-y-4">
        {prizeDraws.map((raffle) => {
          const isEnded = isPast(new Date(raffle.endDate));
          const statusColor = raffle.status === 'active' 
            ? 'bg-green-100 text-green-800'
            : raffle.status === 'upcoming'
              ? 'bg-blue-100 text-blue-800'
              : raffle.status === 'deleted'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-red-100 text-red-800';
          
          return (
            <Card key={raffle.id} className="overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3 relative">
                  <img 
                    src={raffle.imageUrl || '/images/placeholder.jpg'} 
                    alt={raffle.name}
                    className="w-full h-48 md:h-full object-cover"
                  />
                  <Badge className={`absolute top-2 right-2 ${statusColor}`}>
                    {raffle.status.charAt(0).toUpperCase() + raffle.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="md:w-2/3">
                  <CardHeader>
                    <CardTitle>{raffle.name}</CardTitle>
                    <CardDescription>
                      {isEnded 
                        ? 'Prize draw has ended' 
                        : `Ends on ${format(new Date(raffle.endDate), 'PPP')}`}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Price:</span>
                        <span className="text-sm">£{raffle.ticketPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Tickets Sold:</span>
                        <span className="text-sm">{raffle.ticketsSold} / {raffle.maxTickets}</span>
                      </div>
                      {raffle.instantWinEnabled && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Instant Win:</span>
                          <span className="text-sm">Enabled</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="justify-between">
                    <div className="text-sm text-muted-foreground">
                      Created: {format(new Date(raffle.createdAt), 'PP')}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(raffle)}
                      >
                        <FiEdit className="mr-1" /> Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDelete(raffle)}
                      >
                        <FiTrash2 className="mr-1" /> Delete
                      </Button>
                    </div>
                  </CardFooter>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Prize Draw</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete "{selectedRaffle?.name}"? 
            {selectedRaffle?.ticketsSold && selectedRaffle.ticketsSold > 0 
              ? " This prize draw has tickets sold and will be marked as deleted but not actually removed from the system."
              : " This action cannot be undone."}
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
      
      {/* Edit Prize Draw Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Prize Draw: {selectedRaffle?.name}</DialogTitle>
          </DialogHeader>
          {selectedRaffle && (
            <PrizeDrawForm 
              defaultValues={{
                ...selectedRaffle,
                id: selectedRaffle.id,
              }}
              onSubmit={handleUpdateSubmit}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ManagePrizeDraws;