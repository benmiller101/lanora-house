import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Share2,
  Facebook, 
  Instagram, 
  Twitter, 
  MessageCircle,
  Linkedin,
  Camera,
  Gift,
  Check
} from "lucide-react";
import { FaTiktok, FaSnapchatGhost, FaWhatsapp } from "react-icons/fa";

interface SocialShareButtonProps {
  raffleId: number;
  raffleName: string;
  raffleDescription: string;
  platform: string;
  rewardTickets: number;
  icon?: React.ComponentType<any>;
  label: string;
  shareUrl?: string;
  disabled?: boolean;
  alreadyShared?: boolean;
}

interface SocialShareData {
  raffleId: number;
  platform: string;
  shareUrl: string;
  shareData?: any;
}

const SocialShareButton: React.FC<SocialShareButtonProps> = ({
  raffleId,
  raffleName,
  raffleDescription,
  platform,
  rewardTickets,
  icon: Icon,
  label,
  shareUrl,
  disabled = false,
  alreadyShared = false
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSharing, setIsSharing] = useState(false);

  const recordShareMutation = useMutation({
    mutationFn: async (shareData: SocialShareData) => {
      const response = await apiRequest("POST", "/api/social-shares", shareData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Share Recorded!",
        description: `You earned ${data.rewardTickets} free ticket${data.rewardTickets !== 1 ? 's' : ''} for sharing!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/social-shares"] });
      queryClient.invalidateQueries({ queryKey: ["/api/raffle-entries"] });
    },
    onError: (error) => {
      toast({
        title: "Share Recording Failed",
        description: error instanceof Error ? error.message : "Failed to record your share",
        variant: "destructive",
      });
    },
  });

  const generateShareContent = () => {
    const currentUrl = shareUrl || window.location.href;
    const shareText = `🎉 Check out this amazing raffle: ${raffleName}! ${raffleDescription.substring(0, 100)}... Win big with Lanora House! 🏆`;
    
    return {
      url: currentUrl,
      title: raffleName,
      text: shareText,
      hashtags: ["LanoraHouse", "Raffle", "WinBig", "Antiques"]
    };
  };

  const handleShare = async () => {
    if (disabled || alreadyShared || isSharing) return;
    
    setIsSharing(true);
    const shareContent = generateShareContent();

    try {
      let shareUrl = "";
      
      switch (platform) {
        case "facebook":
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareContent.url)}&quote=${encodeURIComponent(shareContent.text)}`;
          break;
        
        case "twitter":
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareContent.text)}&url=${encodeURIComponent(shareContent.url)}&hashtags=${shareContent.hashtags.join(",")}`;
          break;
        
        case "linkedin":
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareContent.url)}`;
          break;
        
        case "whatsapp":
          shareUrl = `https://wa.me/?text=${encodeURIComponent(shareContent.text + " " + shareContent.url)}`;
          break;
        
        case "instagram_story":
          // Instagram Story sharing through web isn't directly supported
          // We'll copy the content and provide instructions
          await navigator.clipboard.writeText(shareContent.text + " " + shareContent.url);
          toast({
            title: "Content Copied!",
            description: "Content copied to clipboard. Open Instagram and paste in your story!",
          });
          recordShareMutation.mutate({
            raffleId,
            platform,
            shareUrl: shareContent.url,
            shareData: { type: "story", content: shareContent }
          });
          setIsSharing(false);
          return;
        
        case "instagram_post":
          await navigator.clipboard.writeText(shareContent.text + " " + shareContent.url);
          toast({
            title: "Content Copied!",
            description: "Content copied to clipboard. Open Instagram and paste in your post!",
          });
          recordShareMutation.mutate({
            raffleId,
            platform,
            shareUrl: shareContent.url,
            shareData: { type: "post", content: shareContent }
          });
          setIsSharing(false);
          return;
        
        case "tiktok":
          await navigator.clipboard.writeText(shareContent.text + " " + shareContent.url);
          toast({
            title: "Content Copied!",
            description: "Content copied to clipboard. Open TikTok and create your video!",
          });
          recordShareMutation.mutate({
            raffleId,
            platform,
            shareUrl: shareContent.url,
            shareData: { type: "video", content: shareContent }
          });
          setIsSharing(false);
          return;
        
        case "snapchat":
          await navigator.clipboard.writeText(shareContent.text + " " + shareContent.url);
          toast({
            title: "Content Copied!",
            description: "Content copied to clipboard. Open Snapchat and share in your story!",
          });
          recordShareMutation.mutate({
            raffleId,
            platform,
            shareUrl: shareContent.url,
            shareData: { type: "story", content: shareContent }
          });
          setIsSharing(false);
          return;
        
        default:
          // Generic Web Share API
          if (navigator.share) {
            await navigator.share({
              title: shareContent.title,
              text: shareContent.text,
              url: shareContent.url,
            });
            recordShareMutation.mutate({
              raffleId,
              platform,
              shareUrl: shareContent.url,
              shareData: { type: "native", content: shareContent }
            });
            setIsSharing(false);
            return;
          }
      }

      if (shareUrl) {
        // Open share URL in new window
        const popup = window.open(shareUrl, "share", "width=600,height=400,scrollbars=yes,resizable=yes");
        
        if (popup) {
          // Wait a moment for user to complete the share
          setTimeout(() => {
            recordShareMutation.mutate({
              raffleId,
              platform,
              shareUrl: shareContent.url,
              shareData: { type: "popup", content: shareContent }
            });
          }, 3000);
        }
      }
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Could not open sharing interface. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const getIcon = () => {
    if (Icon) return <Icon className="w-4 h-4" />;
    
    switch (platform) {
      case "facebook_post":
      case "facebook_story": return <Facebook className="w-4 h-4" />;
      case "instagram_story":
      case "instagram_post": return <Instagram className="w-4 h-4" />;
      case "twitter_post": return <Twitter className="w-4 h-4" />;
      case "tiktok_post": return <FaTiktok className="w-4 h-4" />;
      default: return <Share2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        disabled={disabled || alreadyShared || isSharing || recordShareMutation.isPending}
        className={`flex items-center gap-2 min-w-[120px] ${
          alreadyShared 
            ? "bg-secondary/20 border-secondary/40 text-secondary-foreground" 
            : "hover:bg-primary/5 border-primary/20"
        }`}
      >
        {alreadyShared ? (
          <Check className="w-4 h-4" />
        ) : (
          getIcon()
        )}
        <span className="text-xs">{alreadyShared ? "Shared" : label}</span>
        {rewardTickets > 0 && !alreadyShared && (
          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary ml-1">
            <Gift className="w-3 h-3 mr-1" />
            +{rewardTickets}
          </Badge>
        )}
      </Button>
    </div>
  );
};

export default SocialShareButton;