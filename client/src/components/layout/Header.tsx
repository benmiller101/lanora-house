import { Link } from "wouter";
import { useState, useEffect } from "react";
import { FiMenu } from "react-icons/fi";
import logomarkPath from "@assets/Lanora_house_Horizontal_Purple_1771706684206.png";
import { MobileNavigationDrawer } from "@/components/responsive/MobileNavigationDrawer";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-30 bg-white transition-all duration-300 translate-y-0 ${
        isScrolled ? 'shadow-md py-2' : 'shadow-sm py-0'
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

          {/* Right side - spacer to keep nav centred */}
          <div className="hidden lg:block lg:w-48 flex-shrink-0" />
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