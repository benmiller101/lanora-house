import React from 'react';
import { 
  DeviceSpecificWrapper, 
  ResponsiveGrid, 
  ResponsiveSpacer, 
  ResponsiveText,
  MobileOptimizedCard,
  ConditionalRender,
  MobileDesktopLayout,
  useIsMobile 
} from '@/components/responsive';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Example component demonstrating responsive design patterns
 * This shows how to customize layouts for mobile vs desktop
 */
export function ResponsiveShowcase() {
  const isMobile = useIsMobile();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Device-specific wrapper with different backgrounds */}
      <DeviceSpecificWrapper
        mobileClassName="bg-blue-50 p-4 rounded-lg"
        desktopClassName="bg-green-50 p-6 rounded-xl border"
        className="mb-8"
      >
        <ResponsiveText
          as="h1"
          mobileSize="2xl"
          desktopSize="4xl"
          mobileWeight="semibold"
          desktopWeight="bold"
          className="text-center text-primary"
        >
          Responsive Design System
        </ResponsiveText>
        
        <ResponsiveText
          as="p"
          mobileSize="sm"
          desktopSize="lg"
          className="text-center text-gray-600 mt-2"
        >
          Currently viewing on: <strong>{isMobile ? 'Mobile' : 'Desktop'}</strong>
        </ResponsiveText>
      </DeviceSpecificWrapper>

      {/* Responsive Grid Example */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Responsive Grid Layout</h2>
        <ResponsiveGrid
          mobileColumns={1}
          desktopColumns={3}
          mobileGap="sm"
          desktopGap="lg"
        >
          {Array.from({ length: 6 }, (_, i) => (
            <MobileOptimizedCard
              key={i}
              mobilePadding="md"
              desktopPadding="lg"
              mobileRounded="md"
              desktopRounded="xl"
              mobileShadow="sm"
              desktopShadow="lg"
              fullWidthOnMobile={true}
            >
              <h3 className="font-semibold text-lg mb-2">Card {i + 1}</h3>
              <p className="text-gray-600 text-sm mb-4">
                This card adapts its padding, rounding, and shadow based on device type.
              </p>
              <Button size={isMobile ? "sm" : "default"} className="w-full md:w-auto">
                {isMobile ? "Tap" : "Click"} Me
              </Button>
            </MobileOptimizedCard>
          ))}
        </ResponsiveGrid>
      </section>

      {/* Conditional Rendering Example */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Conditional Content</h2>
        
        <ConditionalRender showOnMobile={false}>
          <Card className="mb-4 bg-blue-50">
            <CardHeader>
              <CardTitle>Desktop Only Content</CardTitle>
              <CardDescription>This content only appears on desktop devices</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Desktop users might want more detailed information and complex interactions.</p>
            </CardContent>
          </Card>
        </ConditionalRender>

        <ConditionalRender showOnDesktop={false}>
          <Card className="mb-4 bg-green-50">
            <CardHeader>
              <CardTitle>Mobile Only Content</CardTitle>
              <CardDescription>This content only appears on mobile devices</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Mobile users might prefer simplified, touch-friendly interfaces.</p>
            </CardContent>
          </Card>
        </ConditionalRender>
      </section>

      {/* Different Components for Different Devices */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Device-Specific Components</h2>
        
        <MobileDesktopLayout
          mobileComponent={
            <div className="bg-orange-100 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Mobile Navigation</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  📱 Touch-Optimized Menu
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  👆 Swipe Gestures
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  🔄 Pull to Refresh
                </Button>
              </div>
            </div>
          }
          desktopComponent={
            <div className="bg-purple-100 p-6 rounded-lg">
              <h3 className="font-semibold text-xl mb-4">Desktop Navigation</h3>
              <div className="flex space-x-4">
                <Button variant="outline">🖱️ Mouse Hover Effects</Button>
                <Button variant="outline">⌨️ Keyboard Shortcuts</Button>
                <Button variant="outline">🖼️ Rich Content Display</Button>
              </div>
            </div>
          }
        />
      </section>

      {/* Responsive Spacing Example */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Responsive Spacing</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p>Content above spacer</p>
          
          <ResponsiveSpacer 
            mobileHeight="sm" 
            desktopHeight="xl" 
            className="bg-red-200 opacity-50" 
          />
          
          <p>Content below spacer (note different spacing on mobile vs desktop)</p>
        </div>
      </section>

      {/* Typography Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Responsive Typography</h2>
        <div className="space-y-4">
          <ResponsiveText
            as="h3"
            mobileSize="lg"
            desktopSize="3xl"
            mobileWeight="semibold"
            desktopWeight="bold"
            className="text-primary"
          >
            Responsive Heading
          </ResponsiveText>
          
          <ResponsiveText
            as="p"
            mobileSize="sm"
            desktopSize="base"
            className="text-gray-700"
          >
            This paragraph text scales appropriately for each device. On mobile, it's smaller for better readability on small screens. On desktop, it's larger to take advantage of the available space.
          </ResponsiveText>
          
          <ResponsiveText
            as="span"
            mobileSize="xs"
            desktopSize="sm"
            mobileWeight="normal"
            desktopWeight="medium"
            className="text-gray-500"
          >
            Caption text that adapts weight and size
          </ResponsiveText>
        </div>
      </section>
    </div>
  );
}

export default ResponsiveShowcase;