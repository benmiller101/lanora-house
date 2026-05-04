import React, { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface DeviceSpecificWrapperProps {
  children: ReactNode;
  mobileClassName?: string;
  desktopClassName?: string;
  className?: string;
}

/**
 * Wrapper component that applies different classes based on device type
 * Allows for device-specific styling beyond regular responsive design
 */
export function DeviceSpecificWrapper({ 
  children, 
  mobileClassName = '', 
  desktopClassName = '', 
  className = '' 
}: DeviceSpecificWrapperProps) {
  const isMobile = useIsMobile();
  
  const combinedClassName = cn(
    className,
    isMobile ? mobileClassName : desktopClassName
  );

  return (
    <div className={combinedClassName}>
      {children}
    </div>
  );
}

interface ConditionalRenderProps {
  children: ReactNode;
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
}

/**
 * Component that conditionally renders content based on device type
 */
export function ConditionalRender({ 
  children, 
  showOnMobile = true, 
  showOnDesktop = true 
}: ConditionalRenderProps) {
  const isMobile = useIsMobile();
  
  if (isMobile && !showOnMobile) return null;
  if (!isMobile && !showOnDesktop) return null;
  
  return <>{children}</>;
}

interface MobileDesktopLayoutProps {
  mobileComponent: ReactNode;
  desktopComponent: ReactNode;
}

/**
 * Component that renders completely different components for mobile vs desktop
 */
export function MobileDesktopLayout({ 
  mobileComponent, 
  desktopComponent 
}: MobileDesktopLayoutProps) {
  const isMobile = useIsMobile();
  
  return <>{isMobile ? mobileComponent : desktopComponent}</>;
}