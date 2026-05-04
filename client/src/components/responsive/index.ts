// Export all responsive design components from a single entry point
export { DeviceSpecificWrapper, ConditionalRender, MobileDesktopLayout } from './DeviceSpecificWrapper';
export { ResponsiveGrid } from './ResponsiveGrid';
export { ResponsiveSpacer } from './ResponsiveSpacer';
export { ResponsiveText } from './ResponsiveText';
export { MobileOptimizedCard } from './MobileOptimizedCard';
export { MobileNavigationDrawer } from './MobileNavigationDrawer';

// Export hooks
export { useIsMobile } from '@/hooks/use-mobile';

// Type definitions for responsive settings
export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
}

export interface DeviceSettings {
  mobile: {
    gridColumns: number;
    fontSize: string;
    padding: string;
    spacing: string;
  };
  desktop: {
    gridColumns: number;
    fontSize: string;
    padding: string;
    spacing: string;
  };
}

// Default responsive configuration
export const defaultResponsiveConfig: DeviceSettings = {
  mobile: {
    gridColumns: 1,
    fontSize: 'text-sm',
    padding: 'p-4',
    spacing: 'space-y-4'
  },
  desktop: {
    gridColumns: 3,
    fontSize: 'text-base',
    padding: 'p-6',
    spacing: 'space-y-6'
  }
};