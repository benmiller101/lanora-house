import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import SocialShareButton from "./SocialShareButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2, Gift, Users } from "lucide-react";

interface SocialSharePanelProps {
  raffleId: number;
  raffleName: string;
  raffleDescription: string;
  currentUrl?: string;
}

interface SocialShareReward {
  id: number;
  platform: string;
  rewardType: string;
  rewardAmount: number;
  isActive: boolean;
  maxRewardsPerUser: number;
  maxRewardsPerRaffle: number;
  description: string;
}

interface UserShare {
  id: number;
  platform: string;
  verified: boolean;
  rewardGranted: boolean;
  rewardTickets: number;
  createdAt: string;
}

const SocialSharePanel: React.FC<SocialSharePanelProps> = ({
  raffleId,
  raffleName,
  raffleDescription,
  currentUrl
}) => {
  // Get raffle details including social sharing configuration
  const { data: raffle, isLoading: raffleLoading } = useQuery({
    queryKey: ["/api/raffles", raffleId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/raffles/${raffleId}`);
      return response.json();
    },
  });

  // Get user's shares for this raffle
  const { data: userShares, isLoading: sharesLoading } = useQuery({
    queryKey: ["/api/social-shares", raffleId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/social-shares?raffleId=${raffleId}`);
      return response.json();
    },
  });

  if (raffleLoading || sharesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share & Earn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if this raffle has social sharing enabled
  if (!raffle?.socialSharingEnabled) {
    return null; // Don't show the panel if social sharing is disabled for this raffle
  }

  const activeRewards = raffle?.socialSharingRewards || [];
  const userSharesMap = new Map(
    userShares?.map((share: UserShare) => [share.platform, share]) || []
  );

  const totalPossibleTickets = activeRewards.reduce(
    (sum: number, reward: any) => sum + reward.rewardAmount, 
    0
  );

  const earnedTickets = userShares?.reduce(
    (sum: number, share: UserShare) => sum + (share.rewardTickets || 0), 
    0
  ) || 0;

  const getPlatformLabel = (platform: string) => {
    const labels: { [key: string]: string } = {
      facebook_post: "Facebook Post",
      facebook_story: "Facebook Story",
      instagram_story: "IG Story",
      instagram_post: "IG Post",
      twitter_post: "Twitter Post",
      tiktok_post: "TikTok Post"
    };
    return labels[platform] || platform;
  };

  if (activeRewards.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Share2 className="w-5 h-5" />
            Share & Earn Free Tickets
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Gift className="w-3 h-3 mr-1" />
              {earnedTickets}/{totalPossibleTickets} earned
            </Badge>
          </div>
        </div>
        <p className="text-sm text-primary/80">
          Share this raffle on social media and earn free tickets! Each platform can only be used once.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {activeRewards.map((reward: any) => {
            const userShare = userSharesMap.get(reward.platform);
            const alreadyShared = !!userShare && userShare.rewardGranted;
            
            return (
              <SocialShareButton
                key={reward.platform}
                raffleId={raffleId}
                raffleName={raffleName}
                raffleDescription={raffleDescription}
                platform={reward.platform}
                rewardTickets={reward.rewardAmount}
                label={getPlatformLabel(reward.platform)}
                shareUrl={currentUrl}
                alreadyShared={alreadyShared}
                disabled={false}
              />
            );
          })}
        </div>

        {earnedTickets > 0 && (
          <div className="flex items-center gap-2 p-3 bg-secondary/20 border border-secondary/40 rounded-lg">
            <Users className="w-4 h-4 text-secondary-foreground" />
            <span className="text-sm text-secondary-foreground font-medium">
              You've earned {earnedTickets} free ticket{earnedTickets !== 1 ? 's' : ''} by sharing!
            </span>
          </div>
        )}

        {userShares && userShares.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-primary mb-2">Your shares:</h4>
            <div className="space-y-1">
              {userShares.map((share: UserShare) => (
                <div key={share.id} className="flex items-center justify-between text-xs">
                  <span className="text-primary/70">
                    {getPlatformLabel(share.platform)} • {new Date(share.createdAt).toLocaleDateString()}
                  </span>
                  <Badge 
                    variant={share.rewardGranted ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {share.rewardGranted ? `+${share.rewardTickets} tickets` : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialSharePanel;