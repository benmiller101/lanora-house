import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ChevronLeftIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  FileTextIcon,
  ImageIcon,
  MessageSquareIcon,
  UserCheckIcon,
  TreePineIcon,
  CameraIcon,
  StarIcon,
  HammerIcon,
  CalendarIcon,
  MailIcon,
  ClipboardListIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

export function AdminNavigation() {
  const [location] = useLocation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const sections: NavSection[] = [
    {
      title: 'Auctions',
      items: [
        {
          href: '/admin/auction-highlights',
          label: 'Featured Listings',
          icon: <HammerIcon className="w-4 h-4 mr-2" />,
          active: location === '/admin/auction-highlights',
        },
        {
          href: '/admin/calendar-events',
          label: 'Auction Calendar',
          icon: <CalendarIcon className="w-4 h-4 mr-2" />,
          active: location === '/admin/calendar-events',
        },
        {
          href: '/admin/settings?tab=auction',
          label: 'Auction Settings',
          icon: <SettingsIcon className="w-4 h-4 mr-2" />,
          active: location === '/admin/settings' && typeof window !== 'undefined' && window.location.search.includes('tab=auction'),
        },
      ],
    },
    {
      title: 'Clearances',
      items: [
        {
          href: '/admin/customer-requests',
          label: 'Enquiries',
          icon: <MessageSquareIcon className="w-4 h-4 mr-2" />,
          active: location === '/admin/customer-requests',
        },
        {
          href: '/admin/clearance-stories',
          label: 'Success Stories',
          icon: <ClipboardListIcon className="w-4 h-4 mr-2" />,
          active: location === '/admin/clearance-stories',
        },
        {
          href: '/admin/before-after',
          label: 'Before & After',
          icon: <CameraIcon className="w-4 h-4 mr-2" />,
          active: location === '/admin/before-after',
        },
      ],
    },
    {
      title: 'Content',
      items: [
        {
          href: '/admin/blog-fixed',
          label: 'Blog',
          icon: <FileTextIcon className="w-4 h-4 mr-2" />,
          active: location === '/admin/blog-fixed',
        },
        {
          href: '/admin/gallery-images',
          label: 'Gallery Images',
          icon: <ImageIcon className="w-4 h-4 mr-2" />,
          active: location === '/admin/gallery-images',
        },
        {
          href: '/admin/customer-reviews',
          label: 'Reviews',
          icon: <StarIcon className="w-4 h-4 mr-2" />,
          active: location === '/admin/customer-reviews',
        },
        {
          href: '/admin/email-templates',
          label: 'Email Templates',
          icon: <MailIcon className="w-4 h-4 mr-2" />,
          active: location === '/admin/email-templates',
        },
      ],
    },
    {
      title: 'Team & Settings',
      items: [
        {
          href: '/admin/team-members',
          label: 'Team Members',
          icon: <UserCheckIcon className="w-4 h-4 mr-2" />,
          active: location === '/admin/team-members',
        },
        {
          href: '/admin/environmental-impact',
          label: 'Environmental Impact',
          icon: <TreePineIcon className="w-4 h-4 mr-2" />,
          active: location === '/admin/environmental-impact',
        },
        {
          href: '/admin/settings',
          label: 'Settings',
          icon: <SettingsIcon className="w-4 h-4 mr-2" />,
          active: location === '/admin/settings' && (typeof window === 'undefined' || !window.location.search.includes('tab=auction')),
        },
      ],
    },
  ];

  const hasActiveItem = (section: NavSection) =>
    section.items.some((item) => item.active);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isSectionExpanded = (section: NavSection) => {
    if (expandedSections[section.title] !== undefined) return expandedSections[section.title];
    return hasActiveItem(section);
  };

  return (
    <div className="bg-white border-b border-neutral-200 shadow-sm mb-6">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="default" size="sm" className="flex items-center bg-primary hover:bg-primary/90">
                <LayoutDashboardIcon className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center">
              <ChevronLeftIcon className="w-4 h-4 mr-2" />
              Back to Site
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {sections.map((section) => {
            const expanded = isSectionExpanded(section);
            const active = hasActiveItem(section);
            return (
              <div key={section.title} className="relative">
                <button
                  onClick={() => toggleSection(section.title)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
                    active
                      ? "bg-primary text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  )}
                >
                  <span>{section.title}</span>
                  {expanded ? (
                    <ChevronDownIcon className="w-4 h-4 ml-1 flex-shrink-0" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 ml-1 flex-shrink-0" />
                  )}
                </button>
                {expanded && (
                  <div className="absolute z-50 top-full left-0 mt-1 w-52 bg-white rounded-lg shadow-lg border border-neutral-200 py-1">
                    {section.items.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <button
                          className={cn(
                            "w-full flex items-center px-3 py-2 text-sm transition-colors text-left",
                            item.active
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-neutral-700 hover:bg-neutral-50"
                          )}
                        >
                          {item.icon}
                          {item.label}
                        </button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AdminNavigation;
