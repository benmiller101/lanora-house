import React from 'react';
import { Link } from 'wouter';
import { 
  DeviceSpecificWrapper, 
  ResponsiveGrid, 
  ResponsiveText,
  MobileOptimizedCard,
  ConditionalRender,
  MobileDesktopLayout,
  useIsMobile 
} from '@/components/responsive';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Mobile-optimized raffle experience component
 * Demonstrates how raffles adapt for touch interfaces vs desktop
 */
export function MobileRaffleExperience() {
  const isMobile = useIsMobile();

  // Sample raffle data
  const raffles = [
    {
      id: 1,
      title: "Victorian Tea Set Collection",
      excerpt: "Exquisite porcelain tea service from 1890s",
      description: "A complete Victorian era tea service including teapot, sugar bowl, cream pitcher, and six matching cups and saucers. Hand-painted with delicate rose motifs and gold leaf trim.",
      image: "/api/placeholder/400/300",
      ticketPrice: 5,
      totalTickets: 100,
      soldTickets: 73,
      timeLeft: "2 days 14 hours",
      status: "active",
      prizes: [
        { type: "main", name: "Victorian Tea Set", value: "£450" },
        { type: "instant", name: "£10 Cash", count: 5 },
        { type: "instant", name: "£25 Cash", count: 2 }
      ]
    },
    {
      id: 2,
      title: "Antique Pocket Watch",
      excerpt: "Gold-plated timepiece from 1920s",
      description: "Rare 1925 Elgin pocket watch with intricate engravings and Roman numerals. Fully functional with original chain and presentation box.",
      image: "/api/placeholder/400/300",
      ticketPrice: 3,
      totalTickets: 150,
      soldTickets: 89,
      timeLeft: "5 days 8 hours",
      status: "active",
      prizes: [
        { type: "main", name: "Pocket Watch", value: "£320" },
        { type: "instant", name: "£5 Cash", count: 10 },
        { type: "instant", name: "£15 Cash", count: 3 }
      ]
    }
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header Section with Device-Specific Styling */}
      <DeviceSpecificWrapper
        mobileClassName="text-center mb-6 bg-blue-50 p-6 rounded-2xl"
        desktopClassName="text-center mb-10 bg-blue-50 p-8 rounded-3xl border shadow-lg"
      >
        <ResponsiveText
          as="h1"
          mobileSize="3xl"
          desktopSize="5xl"
          mobileWeight="bold"
          desktopWeight="extrabold"
          className="text-primary mb-4"
        >
          Mobile Raffle Experience
        </ResponsiveText>
        
        <ResponsiveText
          as="p"
          mobileSize="base"
          desktopSize="xl"
          className="text-gray-600 max-w-3xl mx-auto"
        >
          Experience how raffles adapt for {isMobile ? 'mobile touch interfaces' : 'desktop interactions'} 
          with optimized layouts, buttons, and navigation patterns.
        </ResponsiveText>
      </DeviceSpecificWrapper>

      {/* Mobile vs Desktop Navigation */}
      <section className="mb-12">
        <ResponsiveText as="h2" mobileSize="xl" desktopSize="2xl" className="font-semibold mb-6">
          Device-Optimized Navigation
        </ResponsiveText>
        
        <MobileDesktopLayout
          mobileComponent={
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-4 text-center">📱 Mobile Raffle Navigation</h3>
              <div className="space-y-3">
                <Button size="lg" className="w-full justify-between text-left">
                  <span>🎯 Current Raffles</span>
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">5</span>
                </Button>
                <Button variant="outline" size="lg" className="w-full justify-between text-left">
                  <span>🏆 My Tickets</span>
                  <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">12</span>
                </Button>
                <Button variant="outline" size="lg" className="w-full justify-start text-left">
                  <span>💰 Instant Wins</span>
                </Button>
                <Button variant="outline" size="lg" className="w-full justify-start text-left">
                  <span>🎊 Past Winners</span>
                </Button>
              </div>
            </div>
          }
          desktopComponent={
            <div className="bg-purple-100 p-6 rounded-lg">
              <h3 className="font-semibold mb-4 text-center">🖥️ Desktop Raffle Navigation</h3>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button className="flex items-center gap-2">
                  🎯 Current Raffles
                  <Badge variant="destructive">5</Badge>
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  🏆 My Tickets
                  <Badge>12</Badge>
                </Button>
                <Button variant="outline">💰 Instant Wins</Button>
                <Button variant="outline">🎊 Past Winners</Button>
                <Button variant="ghost">⚙️ Settings</Button>
              </div>
            </div>
          }
        />
      </section>

      {/* Responsive Raffle Cards */}
      <section className="mb-12">
        <ResponsiveText as="h2" mobileSize="xl" desktopSize="2xl" className="font-semibold mb-6">
          Responsive Raffle Cards
        </ResponsiveText>
        
        <ResponsiveGrid
          mobileColumns={1}
          desktopColumns={2}
          mobileGap="lg"
          desktopGap="xl"
        >
          {raffles.map((raffle) => (
            <MobileOptimizedCard
              key={raffle.id}
              mobilePadding="lg"
              desktopPadding="xl"
              mobileRounded="xl"
              desktopRounded="2xl"
              mobileShadow="lg"
              desktopShadow="2xl"
              fullWidthOnMobile={true}
              className="bg-white border"
            >
              {/* Raffle Image */}
              <div className="relative mb-4">
                <img 
                  src={raffle.image} 
                  alt={raffle.title}
                  className="w-full h-48 md:h-64 object-cover rounded-lg"
                />
                <Badge className="absolute top-3 right-3" variant={raffle.status === 'active' ? 'default' : 'secondary'}>
                  {raffle.status === 'active' ? '🔴 Live' : '⏰ Ending Soon'}
                </Badge>
              </div>

              {/* Title and Description */}
              <div className="mb-4">
                <ResponsiveText
                  as="h3"
                  mobileSize="lg"
                  desktopSize="xl"
                  mobileWeight="semibold"
                  desktopWeight="bold"
                  className="mb-2"
                >
                  {raffle.title}
                </ResponsiveText>
                
                {/* Show excerpt on mobile, full description on desktop */}
                <ConditionalRender showOnDesktop={false}>
                  <ResponsiveText as="p" mobileSize="sm" className="text-gray-600 mb-3">
                    {raffle.excerpt}
                  </ResponsiveText>
                </ConditionalRender>
                
                <ConditionalRender showOnMobile={false}>
                  <ResponsiveText as="p" desktopSize="base" className="text-gray-600 mb-4">
                    {raffle.description}
                  </ResponsiveText>
                </ConditionalRender>
              </div>

              {/* Prize Information */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">🏆 {raffle.prizes[0].value}</Badge>
                  {raffle.prizes.slice(1).map((prize, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      💰 {prize.count}x {prize.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Progress and Stats */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Tickets Sold</span>
                  <span className="font-semibold">{raffle.soldTickets}/{raffle.totalTickets}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(raffle.soldTickets / raffle.totalTickets) * 100}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>⏰ {raffle.timeLeft} left</span>
                  <span>🎫 £{raffle.ticketPrice} per ticket</span>
                </div>
              </div>

              {/* Action Buttons - Different layouts for mobile vs desktop */}
              <DeviceSpecificWrapper
                mobileClassName="space-y-3"
                desktopClassName="flex gap-3"
              >
                <Button 
                  size={isMobile ? "lg" : "default"}
                  className={`${isMobile ? 'w-full' : 'flex-1'} bg-blue-600 hover:bg-blue-700`}
                >
                  {isMobile ? '🎫 Buy Tickets' : '🎫 Purchase Tickets'}
                </Button>
                
                <Button 
                  variant="outline" 
                  size={isMobile ? "lg" : "default"}
                  className={isMobile ? 'w-full' : ''}
                >
                  {isMobile ? '👁️ Details' : '👁️ View Details'}
                </Button>
              </DeviceSpecificWrapper>
            </MobileOptimizedCard>
          ))}
        </ResponsiveGrid>
      </section>

      {/* Mobile-Specific Features */}
      <ConditionalRender showOnDesktop={false}>
        <section className="mb-8">
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📱 Mobile-Only Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl">👆</span>
                  <div>
                    <div className="font-semibold">Touch-Optimized Buttons</div>
                    <div className="text-sm text-gray-600">Larger tap targets for easier interaction</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl">📱</span>
                  <div>
                    <div className="font-semibold">Swipe Navigation</div>
                    <div className="text-sm text-gray-600">Swipe between raffle images</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl">🔔</span>
                  <div>
                    <div className="font-semibold">Push Notifications</div>
                    <div className="text-sm text-gray-600">Get notified about raffle results</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </ConditionalRender>

      {/* Desktop-Specific Features */}
      <ConditionalRender showOnMobile={false}>
        <section className="mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🖥️ Desktop-Enhanced Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                  <span className="text-3xl">🖱️</span>
                  <div>
                    <div className="font-semibold">Hover Effects</div>
                    <div className="text-sm text-gray-600">Interactive card animations</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                  <span className="text-3xl">⌨️</span>
                  <div>
                    <div className="font-semibold">Keyboard Shortcuts</div>
                    <div className="text-sm text-gray-600">Quick access to features</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                  <span className="text-3xl">🔍</span>
                  <div>
                    <div className="font-semibold">Advanced Filtering</div>
                    <div className="text-sm text-gray-600">Multiple filter options</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                  <span className="text-3xl">📊</span>
                  <div>
                    <div className="font-semibold">Detailed Analytics</div>
                    <div className="text-sm text-gray-600">Comprehensive stats view</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </ConditionalRender>

      {/* Call to Action */}
      <DeviceSpecificWrapper
        mobileClassName="text-center bg-purple-500 text-white p-6 rounded-2xl"
        desktopClassName="text-center bg-purple-500 text-white p-8 rounded-3xl"
      >
        <ResponsiveText
          as="h3"
          mobileSize="xl"
          desktopSize="2xl"
          mobileWeight="bold"
          desktopWeight="bold"
          className="mb-4"
        >
          Ready to Experience Optimized Raffles?
        </ResponsiveText>
        
        <ResponsiveText
          as="p"
          mobileSize="sm"
          desktopSize="lg"
          className="mb-6 opacity-90"
        >
          Join thousands of collectors enjoying our {isMobile ? 'mobile-optimized' : 'desktop-enhanced'} raffle experience
        </ResponsiveText>
        
        <Button 
          size={isMobile ? "lg" : "xl"} 
          variant="secondary"
          className="bg-white text-purple-600 hover:bg-gray-100 font-semibold"
        >
          🎯 Browse Live Raffles
        </Button>
      </DeviceSpecificWrapper>
    </div>
  );
}

export default MobileRaffleExperience;