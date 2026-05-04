import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Share2,
  Facebook, 
  Instagram, 
  Twitter,
  Gift,
  Users,
  Eye,
  EyeOff
} from "lucide-react";
import { FaTiktok, FaSnapchatGhost, FaWhatsapp } from "react-icons/fa";
import { Helmet } from "react-helmet";

interface SocialShareReward {
  id: number;
  platform: string;
  rewardType: string;
  rewardAmount: number;
  isActive: boolean;
  maxRewardsPerUser: number | null;
  maxRewardsPerRaffle: number | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SocialShareRewardForm {
  platform: string;
  rewardType: string;
  rewardAmount: number;
  isActive: boolean;
  maxRewardsPerUser: number | null;
  maxRewardsPerRaffle: number | null;
  description: string;
}

const PLATFORM_OPTIONS = [
  { value: "instagram_story", label: "Instagram Story", icon: Instagram },
  { value: "instagram_post", label: "Instagram Post", icon: Instagram },
  { value: "twitter_post", label: "Twitter Post", icon: Twitter },
  { value: "facebook_post", label: "Facebook Post", icon: Facebook },
  { value: "facebook_story", label: "Facebook Story", icon: Facebook },
  { value: "tiktok_post", label: "TikTok Post", icon: FaTiktok },
];

const REWARD_TYPE_OPTIONS = [
  { value: "tickets", label: "Free Raffle Tickets" },
  { value: "cash", label: "Cash Bonus" },
  { value: "discount", label: "Discount Code" },
  { value: "store_credit", label: "Store Credit" },
];

const SocialShareRewardsAdmin = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<SocialShareReward | null>(null);
  const [formData, setFormData] = useState<SocialShareRewardForm>({
    platform: "",
    rewardType: "tickets",
    rewardAmount: 1,
    isActive: true,
    maxRewardsPerUser: 1,
    maxRewardsPerRaffle: null,
    description: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rewards, isLoading } = useQuery({
    queryKey: ["/api/admin/social-share-rewards"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/social-share-rewards");
      return response.json();
    },
  });

  const { data: shareStats } = useQuery({
    queryKey: ["/api/admin/social-shares"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/social-shares");
      return response.json();
    },
  });

  const createOrUpdateMutation = useMutation({
    mutationFn: async (data: SocialShareRewardForm) => {
      const response = await apiRequest("POST", "/api/admin/social-share-rewards", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: editingReward ? "Reward updated successfully" : "Reward created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/social-share-rewards"] });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save reward",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/social-share-rewards/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Reward deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/social-share-rewards"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete reward",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      platform: "",
      rewardType: "tickets",
      rewardAmount: 1,
      isActive: true,
      maxRewardsPerUser: 1,
      maxRewardsPerRaffle: null,
      description: "",
    });
    setEditingReward(null);
  };

  const handleEdit = (reward: SocialShareReward) => {
    setEditingReward(reward);
    setFormData({
      platform: reward.platform,
      rewardType: reward.rewardType,
      rewardAmount: reward.rewardAmount,
      isActive: reward.isActive,
      maxRewardsPerUser: reward.maxRewardsPerUser,
      maxRewardsPerRaffle: reward.maxRewardsPerRaffle,
      description: reward.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrUpdateMutation.mutate(formData);
  };

  const getPlatformIcon = (platform: string) => {
    const platformOption = PLATFORM_OPTIONS.find(p => p.value === platform);
    if (platformOption) {
      const Icon = platformOption.icon;
      return <Icon className="w-4 h-4" />;
    }
    return <Share2 className="w-4 h-4" />;
  };

  const getPlatformLabel = (platform: string) => {
    const platformOption = PLATFORM_OPTIONS.find(p => p.value === platform);
    return platformOption?.label || platform;
  };

  // Calculate stats
  const totalRewards = rewards?.length || 0;
  const activeRewards = rewards?.filter((r: SocialShareReward) => r.isActive).length || 0;
  const totalShares = shareStats?.length || 0;
  const totalTicketsAwarded = shareStats?.reduce((sum: number, share: any) => sum + (share.rewardTickets || 0), 0) || 0;

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <AdminNavigation />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Social Share Rewards | Admin Dashboard</title>
        <meta name="description" content="Manage social media sharing rewards and incentives" />
      </Helmet>
      
      <div className="p-6 max-w-7xl mx-auto">
        <AdminNavigation />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Social Share Rewards</h1>
            <p className="text-gray-600 mt-2">Configure rewards for social media sharing</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Platform Reward
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingReward ? "Edit Platform Reward" : "Add New Platform Reward"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="platform">Social Platform</Label>
                  <Select 
                    value={formData.platform} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, platform: value }))}
                    disabled={!!editingReward}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORM_OPTIONS.map((platform) => {
                        const Icon = platform.icon;
                        return (
                          <SelectItem key={platform.value} value={platform.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {platform.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="rewardType">Reward Type</Label>
                  <Select 
                    value={formData.rewardType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, rewardType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reward type" />
                    </SelectTrigger>
                    <SelectContent>
                      {REWARD_TYPE_OPTIONS.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="rewardAmount">
                    Reward Amount {formData.rewardType === 'tickets' ? '(Free Tickets)' : 
                    formData.rewardType === 'cash' ? '(£)' : 
                    formData.rewardType === 'discount' ? '(% Off)' : 
                    '(£ Store Credit)'}
                  </Label>
                  <Input
                    id="rewardAmount"
                    type="number"
                    min="1"
                    max={formData.rewardType === 'discount' ? "50" : "100"}
                    value={formData.rewardAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, rewardAmount: parseInt(e.target.value) }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="maxRewardsPerUser">Max Rewards Per User</Label>
                  <Input
                    id="maxRewardsPerUser"
                    type="number"
                    min="1"
                    placeholder="Leave empty for unlimited"
                    value={formData.maxRewardsPerUser || ""}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      maxRewardsPerUser: e.target.value ? parseInt(e.target.value) : null 
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="maxRewardsPerRaffle">Max Rewards Per Raffle</Label>
                  <Input
                    id="maxRewardsPerRaffle"
                    type="number"
                    min="1"
                    placeholder="Leave empty for unlimited"
                    value={formData.maxRewardsPerRaffle || ""}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      maxRewardsPerRaffle: e.target.value ? parseInt(e.target.value) : null 
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Additional details about this reward..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createOrUpdateMutation.isPending || !formData.platform}
                  >
                    {editingReward ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{totalRewards}</p>
                  <p className="text-sm text-gray-600">Total Platforms</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{activeRewards}</p>
                  <p className="text-sm text-gray-600">Active Rewards</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{totalShares}</p>
                  <p className="text-sm text-gray-600">Total Shares</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{totalTicketsAwarded}</p>
                  <p className="text-sm text-gray-600">Tickets Awarded</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rewards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards?.map((reward: SocialShareReward) => (
            <Card key={reward.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPlatformIcon(reward.platform)}
                    <CardTitle className="text-lg">{getPlatformLabel(reward.platform)}</CardTitle>
                  </div>
                  <Badge variant={reward.isActive ? "default" : "secondary"}>
                    {reward.isActive ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                    {reward.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Reward:</span>
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      <Gift className="w-3 h-3 mr-1" />
                      {reward.rewardAmount} ticket{reward.rewardAmount !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Per User:</span>
                    <span>{reward.maxRewardsPerUser || "Unlimited"}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Per Raffle:</span>
                    <span>{reward.maxRewardsPerRaffle || "Unlimited"}</span>
                  </div>
                </div>

                {reward.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{reward.description}</p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(reward)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteMutation.mutate(reward.id)}
                    disabled={deleteMutation.isPending}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {rewards?.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No social share rewards configured</h3>
            <p className="text-gray-600 mb-4">Set up rewards for social media sharing to encourage user engagement.</p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Platform Reward
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default SocialShareRewardsAdmin;