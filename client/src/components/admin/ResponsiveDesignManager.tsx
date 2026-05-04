import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Smartphone, Monitor, Tablet, Eye } from 'lucide-react';

interface ResponsiveSettings {
  // Layout Settings
  mobileGridColumns: number;
  desktopGridColumns: number;
  mobileCardPadding: string;
  desktopCardPadding: string;
  
  // Typography Settings
  mobileFontSizes: {
    heading: string;
    body: string;
    caption: string;
  };
  desktopFontSizes: {
    heading: string;
    body: string;
    caption: string;
  };
  
  // Spacing Settings
  mobileSpacing: {
    section: string;
    element: string;
  };
  desktopSpacing: {
    section: string;
    element: string;
  };
  
  // Mobile-specific Features
  enableSwipeGestures: boolean;
  showMobileNavigation: boolean;
  optimizeForTouch: boolean;
  enablePullToRefresh: boolean;
  
  // Performance Settings
  lazyLoadImages: boolean;
  compressImagesOnMobile: boolean;
  enableOfflineMode: boolean;
}

const defaultSettings: ResponsiveSettings = {
  mobileGridColumns: 1,
  desktopGridColumns: 3,
  mobileCardPadding: 'p-4',
  desktopCardPadding: 'p-6',
  mobileFontSizes: {
    heading: 'text-2xl',
    body: 'text-sm', 
    caption: 'text-xs'
  },
  desktopFontSizes: {
    heading: 'text-4xl',
    body: 'text-base',
    caption: 'text-sm'
  },
  mobileSpacing: {
    section: 'py-8',
    element: 'mb-4'
  },
  desktopSpacing: {
    section: 'py-16', 
    element: 'mb-6'
  },
  enableSwipeGestures: true,
  showMobileNavigation: true,
  optimizeForTouch: true,
  enablePullToRefresh: false,
  lazyLoadImages: true,
  compressImagesOnMobile: true,
  enableOfflineMode: false
};

export default function ResponsiveDesignManager() {
  const [settings, setSettings] = useState<ResponsiveSettings>(defaultSettings);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const { toast } = useToast();

  const handleSaveSettings = () => {
    // Save settings to localStorage or API
    localStorage.setItem('responsiveSettings', JSON.stringify(settings));
    toast({
      title: 'Settings Saved',
      description: 'Responsive design settings have been updated successfully.'
    });
  };

  const handleResetSettings = () => {
    setSettings(defaultSettings);
    toast({
      title: 'Settings Reset',
      description: 'All responsive design settings have been reset to defaults.'
    });
  };

  const updateSettings = (key: keyof ResponsiveSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateNestedSettings = (parentKey: keyof ResponsiveSettings, childKey: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey] as any),
        [childKey]: value
      }
    }));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Responsive Design Manager</h1>
        <p className="text-gray-600">
          Customize how your website appears and behaves on different devices
        </p>
      </div>

      {/* Device Preview Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye size={20} />
            Preview Device
          </CardTitle>
          <CardDescription>
            Select a device type to preview your responsive settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={previewDevice === 'mobile' ? 'default' : 'outline'}
              onClick={() => setPreviewDevice('mobile')}
              className="flex items-center gap-2"
            >
              <Smartphone size={16} />
              Mobile
            </Button>
            <Button
              variant={previewDevice === 'tablet' ? 'default' : 'outline'}
              onClick={() => setPreviewDevice('tablet')}
              className="flex items-center gap-2"
            >
              <Tablet size={16} />
              Tablet
            </Button>
            <Button
              variant={previewDevice === 'desktop' ? 'default' : 'outline'}
              onClick={() => setPreviewDevice('desktop')}
              className="flex items-center gap-2"
            >
              <Monitor size={16} />
              Desktop
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="layout" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="mobile">Mobile Features</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Layout Settings */}
        <TabsContent value="layout" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Grid Columns</CardTitle>
                <CardDescription>Configure grid layout for different devices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Mobile Columns: {settings.mobileGridColumns}</Label>
                  <Slider
                    value={[settings.mobileGridColumns]}
                    onValueChange={([value]) => updateSettings('mobileGridColumns', value)}
                    min={1}
                    max={2}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Desktop Columns: {settings.desktopGridColumns}</Label>
                  <Slider
                    value={[settings.desktopGridColumns]}
                    onValueChange={([value]) => updateSettings('desktopGridColumns', value)}
                    min={2}
                    max={6}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Card Padding</CardTitle>
                <CardDescription>Set padding for cards on different devices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="mobile-padding">Mobile Padding</Label>
                  <Select
                    value={settings.mobileCardPadding}
                    onValueChange={(value) => updateSettings('mobileCardPadding', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="p-2">Small (p-2)</SelectItem>
                      <SelectItem value="p-4">Medium (p-4)</SelectItem>
                      <SelectItem value="p-6">Large (p-6)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="desktop-padding">Desktop Padding</Label>
                  <Select
                    value={settings.desktopCardPadding}
                    onValueChange={(value) => updateSettings('desktopCardPadding', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="p-4">Small (p-4)</SelectItem>
                      <SelectItem value="p-6">Medium (p-6)</SelectItem>
                      <SelectItem value="p-8">Large (p-8)</SelectItem>
                      <SelectItem value="p-12">Extra Large (p-12)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Typography Settings */}
        <TabsContent value="typography" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mobile Typography</CardTitle>
                <CardDescription>Font sizes for mobile devices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Heading Size</Label>
                  <Select
                    value={settings.mobileFontSizes.heading}
                    onValueChange={(value) => updateNestedSettings('mobileFontSizes', 'heading', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-xl">XL</SelectItem>
                      <SelectItem value="text-2xl">2XL</SelectItem>
                      <SelectItem value="text-3xl">3XL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Body Size</Label>
                  <Select
                    value={settings.mobileFontSizes.body}
                    onValueChange={(value) => updateNestedSettings('mobileFontSizes', 'body', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-xs">XS</SelectItem>
                      <SelectItem value="text-sm">Small</SelectItem>
                      <SelectItem value="text-base">Base</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Desktop Typography</CardTitle>
                <CardDescription>Font sizes for desktop devices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Heading Size</Label>
                  <Select
                    value={settings.desktopFontSizes.heading}
                    onValueChange={(value) => updateNestedSettings('desktopFontSizes', 'heading', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-3xl">3XL</SelectItem>
                      <SelectItem value="text-4xl">4XL</SelectItem>
                      <SelectItem value="text-5xl">5XL</SelectItem>
                      <SelectItem value="text-6xl">6XL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Body Size</Label>
                  <Select
                    value={settings.desktopFontSizes.body}
                    onValueChange={(value) => updateNestedSettings('desktopFontSizes', 'body', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-sm">Small</SelectItem>
                      <SelectItem value="text-base">Base</SelectItem>
                      <SelectItem value="text-lg">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Mobile Features */}
        <TabsContent value="mobile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mobile-Specific Features</CardTitle>
              <CardDescription>Enable or disable mobile-only functionality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Swipe Gestures</Label>
                  <p className="text-sm text-gray-600">Enable swipe navigation for mobile users</p>
                </div>
                <Switch
                  checked={settings.enableSwipeGestures}
                  onCheckedChange={(checked) => updateSettings('enableSwipeGestures', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Mobile Navigation</Label>
                  <p className="text-sm text-gray-600">Show mobile-optimized navigation drawer</p>
                </div>
                <Switch
                  checked={settings.showMobileNavigation}
                  onCheckedChange={(checked) => updateSettings('showMobileNavigation', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Touch Optimization</Label>
                  <p className="text-sm text-gray-600">Optimize interface for touch interactions</p>
                </div>
                <Switch
                  checked={settings.optimizeForTouch}
                  onCheckedChange={(checked) => updateSettings('optimizeForTouch', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Pull to Refresh</Label>
                  <p className="text-sm text-gray-600">Enable pull-to-refresh gesture</p>
                </div>
                <Switch
                  checked={settings.enablePullToRefresh}
                  onCheckedChange={(checked) => updateSettings('enablePullToRefresh', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Settings */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Optimization</CardTitle>
              <CardDescription>Settings to improve performance on different devices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Lazy Load Images</Label>
                  <p className="text-sm text-gray-600">Load images only when they enter the viewport</p>
                </div>
                <Switch
                  checked={settings.lazyLoadImages}
                  onCheckedChange={(checked) => updateSettings('lazyLoadImages', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Compress Images on Mobile</Label>
                  <p className="text-sm text-gray-600">Serve compressed images to mobile devices</p>
                </div>
                <Switch
                  checked={settings.compressImagesOnMobile}
                  onCheckedChange={(checked) => updateSettings('compressImagesOnMobile', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Offline Mode</Label>
                  <p className="text-sm text-gray-600">Enable basic offline functionality</p>
                </div>
                <Switch
                  checked={settings.enableOfflineMode}
                  onCheckedChange={(checked) => updateSettings('enableOfflineMode', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6 border-t">
        <Button onClick={handleSaveSettings} className="flex-1 md:flex-none">
          Save Settings
        </Button>
        <Button variant="outline" onClick={handleResetSettings}>
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}