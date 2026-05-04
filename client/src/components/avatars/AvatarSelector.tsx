import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface AvatarOption {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: string;
}

// Character avatar mapping with high-quality maritime portraits
const characterAvatars: Record<string, string> = {
  "captain": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=faces",
  "first-mate": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces",
  "quartermaster": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=faces",
  "bosun": "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=300&h=300&fit=crop&crop=faces",
  "sailor": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=faces",
  "lookout": "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=300&h=300&fit=crop&crop=faces",
  "navigator": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces",
  "cook": "https://images.unsplash.com/photo-1595475038665-86241e0af3fc?w=300&h=300&fit=crop&crop=faces",
  "carpenter": "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=300&h=300&fit=crop&crop=faces",
  "engineer": "https://images.unsplash.com/photo-1559548331-f9cb98001426?w=300&h=300&fit=crop&crop=faces",
  "privateer": "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=300&h=300&fit=crop&crop=faces",
  "merchant": "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=300&h=300&fit=crop&crop=faces",
  "explorer": "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=300&h=300&fit=crop&crop=faces",
  "harbormaster": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop&crop=faces",
  "pilot": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=300&h=300&fit=crop&crop=faces",
  "customs": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop&crop=faces",
  "fisherman": "https://images.unsplash.com/photo-1542596768-5d1d21f1cf98?w=300&h=300&fit=crop&crop=faces",
  "lighthouse": "https://images.unsplash.com/photo-1609010697446-11f2155278f0?w=300&h=300&fit=crop&crop=faces",
  "dockworker": "https://images.unsplash.com/photo-1607814076667-a9fdc8b4dbe7?w=300&h=300&fit=crop&crop=faces",
  "treasure-hunter": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=faces",
  "salvage": "https://images.unsplash.com/photo-1566837945700-30057527ade0?w=300&h=300&fit=crop&crop=faces",
  "yacht-captain": "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=300&h=300&fit=crop&crop=faces",
  "beachcomber": "https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=300&h=300&fit=crop&crop=faces",
  "surfer": "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=300&fit=crop&crop=faces",
  "marine-biologist": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=faces",
  "coast-guard": "https://images.unsplash.com/photo-1614807536271-5c682d90f47b?w=300&h=300&fit=crop&crop=faces"
};

// Character icon mapping for overlay
const characterIcons: Record<string, string> = {
  "captain": "🧑‍✈️",
  "first-mate": "👨‍💼", 
  "quartermaster": "📦",
  "bosun": "🪢",
  "sailor": "⚓",
  "lookout": "🔭",
  "navigator": "🧭",
  "cook": "👨‍🍳",
  "carpenter": "🔨",
  "engineer": "⚙️",
  "privateer": "🏴‍☠️",
  "merchant": "💰",
  "explorer": "🗺️",
  "harbormaster": "🏢",
  "pilot": "🚢",
  "customs": "🛂",
  "fisherman": "🎣",
  "lighthouse": "🗼",
  "dockworker": "📦",
  "treasure-hunter": "💎",
  "salvage": "🤿",
  "yacht-captain": "🛥️",
  "beachcomber": "🐚",
  "surfer": "🏄‍♂️",
  "marine-biologist": "🔬",
  "coast-guard": "🛟"
};

const sailorAvatars: AvatarOption[] = [
  // Classic Sailors
  { id: "captain", name: "Sea Captain", description: "Distinguished maritime commander", prompt: "professional portrait of a distinguished sea captain with weathered face, captain's hat, naval uniform, wise eyes, oil painting style", category: "Officers" },
  { id: "first-mate", name: "First Mate", description: "Experienced ship officer", prompt: "portrait of a seasoned first mate, naval uniform, confident expression, maritime background", category: "Officers" },
  { id: "quartermaster", name: "Quartermaster", description: "Ship's supply manager", prompt: "portrait of a naval quartermaster, practical uniform, organized demeanor, ship supplies in background", category: "Officers" },
  
  // Crew Members
  { id: "bosun", name: "Bosun", description: "Deck operations leader", prompt: "portrait of a ship's bosun, working uniform, rope and rigging tools, confident sailor", category: "Crew" },
  { id: "sailor", name: "Able Seaman", description: "Experienced crew member", prompt: "portrait of an able seaman, traditional sailor uniform, weathered hands, ocean background", category: "Crew" },
  { id: "lookout", name: "Crow's Nest Lookout", description: "Ship's watchkeeper", prompt: "portrait of a ship's lookout, telescope in hand, alert expression, high vantage point background", category: "Crew" },
  
  // Specialists
  { id: "navigator", name: "Ship Navigator", description: "Maritime pathfinder", prompt: "portrait of a ship navigator, charts and compass, intelligent expression, nautical instruments background", category: "Specialists" },
  { id: "cook", name: "Ship's Cook", description: "Galley master", prompt: "portrait of a friendly ship's cook, chef's hat, galley kitchen background, welcoming smile", category: "Specialists" },
  { id: "carpenter", name: "Ship Carpenter", description: "Vessel maintenance expert", prompt: "portrait of a ship's carpenter, woodworking tools, skilled craftsman, ship construction background", category: "Specialists" },
  { id: "engineer", name: "Marine Engineer", description: "Engine room specialist", prompt: "portrait of a marine engineer, engine room background, technical expertise, maritime machinery", category: "Specialists" },
  
  // Historical Figures
  { id: "privateer", name: "Privateer", description: "Licensed sea adventurer", prompt: "portrait of a privateer captain, elegant coat, confident stance, treasure and maps background", category: "Historical" },
  { id: "merchant", name: "Merchant Captain", description: "Trading voyage leader", prompt: "portrait of a merchant ship captain, formal maritime attire, trade goods background, prosperous appearance", category: "Historical" },
  { id: "explorer", name: "Maritime Explorer", description: "Oceanic discoverer", prompt: "portrait of a maritime explorer, expedition gear, determined expression, uncharted waters background", category: "Historical" },
  
  // Maritime Professionals
  { id: "harbormaster", name: "Harbor Master", description: "Port authority officer", prompt: "portrait of a harbormaster, official uniform, harbor background, authoritative presence", category: "Port Authority" },
  { id: "pilot", name: "Harbor Pilot", description: "Ship guidance expert", prompt: "portrait of a harbor pilot, navigation expertise, ship bridge background, professional mariner", category: "Port Authority" },
  { id: "customs", name: "Maritime Customs", description: "Port inspection officer", prompt: "portrait of a maritime customs officer, official badge, port inspection background, professional demeanor", category: "Port Authority" },
  
  // Coastal Workers
  { id: "fisherman", name: "Deep Sea Fisherman", description: "Ocean fishing expert", prompt: "portrait of a deep sea fisherman, weathered face, fishing gear, ocean vessel background", category: "Maritime Workers" },
  { id: "lighthouse", name: "Lighthouse Keeper", description: "Coastal beacon guardian", prompt: "portrait of a lighthouse keeper, traditional keeper's clothing, lighthouse background, dedicated guardian", category: "Maritime Workers" },
  { id: "dockworker", name: "Dock Worker", description: "Port loading specialist", prompt: "portrait of a dock worker, work clothes, cargo loading background, strong maritime worker", category: "Maritime Workers" },
  
  // Adventure Seekers
  { id: "treasure-hunter", name: "Treasure Hunter", description: "Maritime fortune seeker", prompt: "portrait of a treasure hunter, adventure gear, treasure map, exciting maritime background", category: "Adventurers" },
  { id: "salvage", name: "Salvage Diver", description: "Underwater recovery expert", prompt: "portrait of a salvage diver, diving equipment, underwater recovery background, skilled professional", category: "Adventurers" },
  { id: "yacht-captain", name: "Yacht Captain", description: "Luxury vessel commander", prompt: "portrait of a yacht captain, elegant uniform, luxury yacht background, refined maritime professional", category: "Adventurers" },
  
  // Coastal Residents
  { id: "beachcomber", name: "Beachcomber", description: "Shore treasure finder", prompt: "portrait of a beachcomber, casual coastal clothing, beach background, collection of found treasures", category: "Coastal" },
  { id: "surfer", name: "Maritime Surfer", description: "Ocean wave rider", prompt: "portrait of a surfer, wetsuit, surfboard, ocean waves background, adventurous spirit", category: "Coastal" },
  { id: "marine-biologist", name: "Marine Biologist", description: "Ocean life researcher", prompt: "portrait of a marine biologist, research equipment, underwater life background, scientific expertise", category: "Coastal" },
  { id: "coast-guard", name: "Coast Guard Officer", description: "Maritime safety guardian", prompt: "portrait of a coast guard officer, official uniform, rescue equipment, maritime safety background", category: "Coastal" }
];

interface AvatarSelectorProps {
  currentAvatar?: string;
  onAvatarSelect: (avatarId: string) => void;
}

export function AvatarSelector({ currentAvatar, onAvatarSelect }: AvatarSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const categories = ["All", ...Array.from(new Set(sailorAvatars.map(a => a.category)))];
  const filteredAvatars = selectedCategory === "All" 
    ? sailorAvatars 
    : sailorAvatars.filter(a => a.category === selectedCategory);

  const handleAvatarSelect = async (avatar: AvatarOption) => {
    setIsGenerating(avatar.id);
    
    try {
      // Use pre-selected avatar image instead of generating
      const avatarUrl = characterAvatars[avatar.id];
      
      // Update user profile with selected avatar
      const response = await fetch('/api/update-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          avatarId: avatar.id,
          avatarUrl: avatarUrl,
          name: avatar.name 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update avatar');
      }

      onAvatarSelect(avatarUrl);
      setIsOpen(false);
    } catch (error) {
      console.error('Avatar selection failed:', error);
      alert(`Failed to select ${avatar.name} avatar. Please try again.`);
    } finally {
      setIsGenerating(null);
    }
  };

  const currentAvatarInfo = sailorAvatars.find(a => currentAvatar?.includes(a.id));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          {currentAvatarInfo ? `Change Avatar (${currentAvatarInfo.name})` : 'Select from Lanora\'s Crew'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-primary">Select from Lanora's Crew</DialogTitle>
        </DialogHeader>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? "bg-primary text-white" : ""}
            >
              {category}
            </Button>
          ))}
        </div>

        <ScrollArea className="h-96">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAvatars.map((avatar) => (
              <div
                key={avatar.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                  currentAvatar?.includes(avatar.id) ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => handleAvatarSelect(avatar)}
              >
                {/* Character Preview Image */}
                <div className="w-full h-40 relative rounded-lg mb-3 overflow-hidden border-2 border-blue-200 hover:border-primary transition-colors">
                  <img 
                    src={characterAvatars[avatar.id]} 
                    alt={avatar.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to icon if image fails to load
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLDivElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full bg-blue-50 flex items-center justify-center" style={{display: 'none'}}>
                    <div className="text-center">
                      <div className="text-4xl mb-2">{characterIcons[avatar.id] || "⚓"}</div>
                      <div className="text-xs text-blue-700 font-semibold">{avatar.name}</div>
                    </div>
                  </div>
                  {/* Character info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold">{avatar.name}</div>
                        <div className="text-xs opacity-80">{avatar.category}</div>
                      </div>
                      <div className="text-lg">{characterIcons[avatar.id] || "⚓"}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-primary">{avatar.name}</h3>
                    <Badge variant="outline" className="text-xs mt-1">
                      {avatar.category}
                    </Badge>
                  </div>
                  {currentAvatar?.includes(avatar.id) && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{avatar.description}</p>
                
                {isGenerating === avatar.id ? (
                  <div className="flex items-center justify-center py-2">
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    <span className="ml-2 text-sm text-primary">Generating...</span>
                  </div>
                ) : (
                  <Button 
                    size="sm" 
                    className="w-full"
                    disabled={!!isGenerating}
                  >
                    Select This Avatar
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}