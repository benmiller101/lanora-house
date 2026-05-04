import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles, Mail, MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

interface RaffleWin {
  id: number;
  raffleName: string;
  winningTicketNumber: number;
  completedAt: string;
  raffleImageUrl?: string;
  prizeValue?: string;
}

export function RaffleWins() {
  const { toast } = useToast();
  
  const { data: wins, isLoading } = useQuery({
    queryKey: ['/api/user-raffle-wins'],
    queryFn: async () => {
      const response = await fetch('/api/user-raffle-wins', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch raffle wins');
      }
      
      return response.json() as Promise<RaffleWin[]>;
    }
  });

  const handleContactUs = (raffleName: string, winningTicketNumber: number) => {
    const subject = encodeURIComponent(`Missing Winner Email - ${raffleName}`);
    const body = encodeURIComponent(
      `Hello,\n\nI won the raffle "${raffleName}" with ticket #${winningTicketNumber}, but I haven't received my winner notification email.\n\nCould you please help me with this?\n\nThank you!`
    );
    
    // Open email client with pre-filled content
    window.location.href = `mailto:support@lanorahouse.com?subject=${subject}&body=${body}`;
    
    toast({
      title: "Email Client Opened",
      description: "Your email client should open with a pre-filled message to our support team.",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Your Raffle Wins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!wins || wins.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Your Raffle Wins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No wins yet</p>
            <p className="text-sm">Keep entering raffles for your chance to win amazing prizes!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Your Raffle Wins
          <Badge variant="secondary" className="ml-2">
            {wins.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {wins.map((win) => (
            <div
              key={win.id}
              className="border rounded-lg p-4 bg-yellow-50 border-yellow-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-gray-900">{win.raffleName}</h4>
                    <p className="text-sm text-gray-600">
                      Won with ticket #{win.winningTicketNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(win.completedAt), 'PPP')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleContactUs(win.raffleName, win.winningTicketNumber)}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Mail className="h-3 w-3" />
                    Contact Us
                  </Button>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    Winner!
                  </Badge>
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-700">
                    <p className="font-medium">Haven't received your winner email?</p>
                    <p>Click "Contact Us" above to reach our support team for assistance.</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}