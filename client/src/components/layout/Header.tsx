import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useBasket } from "@/contexts/BasketContext";
import { FiMenu, FiUser, FiChevronDown, FiLogOut, FiTag, FiSettings } from "react-icons/fi";
import { Home, Wrench, Heart, Building, MapPin, Shield, Skull, Trash2, Brain, Truck, ShoppingCart, User, FileText, Camera, Leaf, Sparkles, HelpCircle, Droplets } from "lucide-react";
import { WalletHeaderBalance } from "@/components/wallet/WalletHeaderBalance";
import Logo from "@/components/brand/Logo";
import { openLoginModal } from "@/lib/loginRedirect";
import logomarkPath from "@assets/Lanora_house_Horizontal_Purple_1771706684206.png";

function BasketLink() {
  const { itemCount } = useBasket();
  return (
    <Link href="/cart" className="font-medium text-base text-neutral-700 hover:text-primary transition-all duration-200 tracking-wide flex items-center justify-center min-h-[48px] relative">
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MobileNavigationDrawer } from "@/components/responsive/MobileNavigationDrawer";

interface HeaderProps {
  onLoginClick?: () => void;
  bannerOffset?: boolean;
}

export default function Header({ onLoginClick, bannerOffset }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const isHomePage = location === '/';
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch cart data for item count
  const { data: cartData } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated, // Only fetch when user is authenticated
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  




  // Force a complete logout that clears all session data
  const handleLogout = () => {
    // Show toast notification
    toast({
      title: "Logging out...",
      description: "Clearing all session data"
    });
    
    // Clear all cookies
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Make server-side logout request with forced browser cache bypass
    fetch("/api/logout?t=" + new Date().getTime(), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    }).finally(() => {
      // Force a complete page reload to clear any in-memory state
      console.log("Force reloading page to clear all session data");
      window.location.href = "/?logout=true&t=" + new Date().getTime();
    });
  };

  return (
    <header 
      className={`fixed left-0 right-0 z-30 bg-white transition-all duration-300 translate-y-0 ${
        isScrolled ? 'shadow-md py-2' : 'shadow-sm py-0'
      } ${
        bannerOffset ? 'top-[36px]' : 'top-0'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center" style={{paddingTop: '20px', paddingBottom: '20px'}}>
          {/* Logo - Always leftmost */}
          <div className="flex items-center lg:w-48 flex-shrink-0">
            <Link href="/" className="flex items-center">
              <img 
                src={logomarkPath} 
                alt="Lanora House" 
                className="h-14 w-auto object-contain transition-transform duration-200 hover:scale-105"
              />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button 
            className="lg:hidden p-3 text-neutral-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-200 ml-auto"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <FiMenu size={24} />
          </button>

          {/* Navigation Items - Desktop (centred) */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center gap-12">
              <Link href="/clearance" className="font-medium text-base text-neutral-700 hover:text-primary transition-all duration-200 tracking-wide flex items-center justify-center min-h-[48px] text-center">
                <span className="leading-tight">Clearances</span>
              </Link>
              
              <Link href="/auctions" className="font-medium text-base text-neutral-700 hover:text-primary transition-all duration-200 tracking-wide flex items-center justify-center min-h-[48px]">
                <span className="text-center leading-tight">Auctions</span>
              </Link>
              
              <Link href="/contact" className="font-medium text-base text-neutral-700 hover:text-primary transition-all duration-200 tracking-wide flex items-center justify-center min-h-[48px]">
                <span className="text-center leading-tight">Contact</span>
              </Link>
            </div>
          </div>

          {/* Right side - matches logo width to keep nav centred */}
          <div className="hidden lg:flex items-center justify-end lg:w-48 flex-shrink-0">
            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              {/* User Account - Show different content based on auth state */}
              {isLoading ? (
                <div className="p-3">
                  <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-3 h-auto hover:bg-gray-50 rounded-lg transition-all duration-200">
                      <div className="flex items-center space-x-2">
                        <FiUser size={20} className="text-neutral-700" />
                        <FiChevronDown size={16} className="text-neutral-700" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/members">
                      <DropdownMenuItem className="cursor-pointer">
                        <FiUser className="mr-2 h-4 w-4" />
                        Members Portal
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/members?tab=my-offers">
                      <DropdownMenuItem className="cursor-pointer">
                        <FiTag className="mr-2 h-4 w-4" />
                        My Offers
                      </DropdownMenuItem>
                    </Link>
                    {user?.role === 'admin' && (
                      <Link href="/admin">
                        <DropdownMenuItem className="cursor-pointer">
                          <FiSettings className="mr-2 h-4 w-4" />
                          Admin Panel
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                      <FiLogOut className="mr-2 h-4 w-4" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Drawer */}
      <MobileNavigationDrawer 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
      />
    </header>
  );
}