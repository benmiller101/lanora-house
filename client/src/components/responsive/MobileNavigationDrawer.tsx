import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { X, ChevronRight, ChevronDown, Home, Phone, Calendar, User, Heart, Bell, Camera, FileText, Droplets, Gavel, ShoppingBag, Tag } from 'lucide-react';
import logomarkPath from "@assets/Lanora_house_Horizontal_Purple_1771706684206.png";
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface MobileNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  requiresAuth?: boolean;
  badge?: number;
}

interface ExpandableSection {
  label: string;
  icon: React.ReactNode;
  items: NavigationItem[];
}

export function MobileNavigationDrawer({ isOpen, onClose }: MobileNavigationDrawerProps) {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  const toggleSection = (sectionLabel: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionLabel)) {
      newExpanded.delete(sectionLabel);
    } else {
      newExpanded.add(sectionLabel);
    }
    setExpandedSections(newExpanded);
  };
  
  const navigationItems: NavigationItem[] = [
    {
      label: 'Clearances',
      href: '/clearance',
      icon: <Home size={20} />
    },
    {
      label: 'Auctions',
      href: '/auctions',
      icon: <Gavel size={20} />
    },
    {
      label: 'Contact',
      href: '/contact',
      icon: <Phone size={20} />
    }
  ];
  
  const aboutSection: ExpandableSection = {
    label: 'About',
    icon: <User size={20} />,
    items: [
      { label: 'About Us', href: '/about', icon: <User size={18} /> },
      { label: 'Meet the Team', href: '/meet-the-team', icon: <User size={18} /> },
      { label: 'Blog', href: '/blog', icon: <FileText size={18} /> },
      { label: 'Before & After', href: '/before-after', icon: <Camera size={18} /> },
      { label: 'Waste Tracker', href: '/environmental-impact', icon: <Calendar size={18} /> }
    ]
  };

  const authenticatedItems: NavigationItem[] = [
    {
      label: 'My Account',
      href: '/members',
      icon: <User size={20} />,
      requiresAuth: true
    },
    {
      label: 'Wishlist',
      href: '/wishlist',
      icon: <Heart size={20} />,
      requiresAuth: true
    },
    {
      label: 'Notifications',
      href: '/my-offers',
      icon: <Bell size={20} />,
      requiresAuth: true,
      badge: 0 // This would come from notifications hook
    }
  ];

  const handleLinkClick = (href?: string) => {
    if (href) {
      if (href.startsWith('http')) {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else {
        setLocation(href);
      }
    }
    onClose();
    // Reset expanded sections when closing
    setExpandedSections(new Set());
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          'fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={cn(
          'fixed top-0 left-0 h-screen w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ backgroundColor: '#ffffff', minHeight: '100vh', height: '100%' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <img 
              src={logomarkPath} 
              alt="Lanora House" 
              className="h-10 w-auto object-contain"
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info (if authenticated) */}
        {isAuthenticated && user && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.firstName?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-2 bg-white">
          {/* Main Navigation */}
          <div className="px-2">
            {navigationItems.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => handleLinkClick(item.href)}
                className={cn(
                  'w-full flex items-center justify-between p-3 mx-2 rounded-lg transition-colors duration-200',
                  location === item.href
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                )}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight size={16} className="opacity-50" />
              </button>
            ))}
          </div>
          
          {/* About Dropdown */}
          <div className="px-2">
            <div className="mb-1">
              <button
                onClick={() => toggleSection(aboutSection.label)}
                className="w-full flex items-center justify-between p-3 mx-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 text-gray-700"
              >
                <div className="flex items-center space-x-3">
                  {aboutSection.icon}
                  <span className="font-medium">{aboutSection.label}</span>
                </div>
                {expandedSections.has(aboutSection.label) ? (
                  <ChevronDown size={16} className="opacity-50" />
                ) : (
                  <ChevronRight size={16} className="opacity-50" />
                )}
              </button>
              
              {expandedSections.has(aboutSection.label) && (
                <div className="ml-6 mt-1 space-y-1">
                  {aboutSection.items.map((subItem) => (
                    <button
                      key={subItem.href}
                      type="button"
                      onClick={() => handleLinkClick(subItem.href)}
                      className={cn(
                        'w-full flex items-center space-x-3 p-2 mx-2 rounded-lg transition-colors duration-200 text-sm',
                        location === subItem.href
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100 text-gray-600'
                      )}
                    >
                      {subItem.icon}
                      <span>{subItem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          

          {/* Authenticated Section */}
          {isAuthenticated && (
            <>
              <div className="px-4 py-2 mt-4">
                <div className="h-px bg-gray-200"></div>
              </div>
              <div className="px-2">
                {authenticatedItems.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => handleLinkClick(item.href)}
                    className={cn(
                      'w-full flex items-center justify-between p-3 mx-2 rounded-lg transition-colors duration-200',
                      location === item.href
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.badge && item.badge > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight size={16} className="opacity-50" />
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

        </nav>
      </div>
    </>
  );
}