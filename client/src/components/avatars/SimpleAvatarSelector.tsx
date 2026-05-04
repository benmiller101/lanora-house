import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AvatarSelectorProps {
  currentAvatar?: string;
  onAvatarSelect: (avatarUrl: string) => void;
}

interface CharacterAvatar {
  id: string;
  name: string;
  imageUrl: string;
  isActive: boolean;
}

export default function SimpleAvatarSelector({ currentAvatar, onAvatarSelect }: AvatarSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available characters from admin-managed list
  const { data: characters, isLoading } = useQuery<CharacterAvatar[]>({
    queryKey: ["/api/character-avatars"],
  });

  // Update user avatar mutation
  const selectMutation = useMutation({
    mutationFn: async (characterId: string) => {
      const response = await fetch('/api/update-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ characterId })
      });
      if (!response.ok) throw new Error('Failed to update avatar');
      return response.json();
    },
    onSuccess: (data) => {
      onAvatarSelect(data.avatarUrl);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsOpen(false);
      toast({
        title: "Avatar Updated",
        description: `You are now ${data.characterName} from Lanora's Crew!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update avatar",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSelecting(null);
    }
  });

  const handleSelectCharacter = (character: CharacterAvatar) => {
    setIsSelecting(character.id);
    selectMutation.mutate(character.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <User className="w-4 h-4 mr-2" />
          Select from Lanora's Crew
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary">Select from Lanora's Crew</DialogTitle>
          <p className="text-muted-foreground">
            Choose a character avatar to represent you in the Lanora House community
          </p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading characters...
            </div>
          </div>
        ) : characters?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No characters available yet.</p>
            <p className="text-sm">Check back soon for new crew members!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {characters?.map((character) => (
              <Card 
                key={character.id} 
                className={`cursor-pointer transition-all hover:ring-2 hover:ring-primary hover:shadow-lg ${
                  currentAvatar === character.imageUrl ? 'ring-2 ring-primary bg-primary/5' : ''
                } ${
                  isSelecting === character.id ? 'opacity-50' : ''
                }`}
                onClick={() => handleSelectCharacter(character)}
              >
                <CardContent className="p-3">
                  <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={character.imageUrl}
                      alt={character.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = "/placeholder-avatar.png"; // Fallback image
                      }}
                    />
                  </div>
                  
                  <div className="text-center">
                    <h3 className="font-semibold text-sm mb-1">{character.name}</h3>
                    {isSelecting === character.id && (
                      <div className="flex items-center justify-center gap-1 text-primary">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-xs">Selecting...</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}