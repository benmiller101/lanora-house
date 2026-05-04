import React, { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileOptimizedCardProps {
  children: ReactNode;
  className?: string;
  
  // Mobile-specific props
  mobilePadding?: 'sm' | 'md' | 'lg';
  mobileRounded?: 'sm' | 'md' | 'lg' | 'xl';
  mobileShadow?: 'sm' | 'md' | 'lg' | 'none';
  
  // Desktop-specific props  
  desktopPadding?: 'sm' | 'md' | 'lg' | 'xl';
  desktopRounded?: 'sm' | 'md' | 'lg' | 'xl';
  desktopShadow?: 'sm' | 'md' | 'lg' | 'xl';
  
  // Mobile-specific behavior
  fullWidthOnMobile?: boolean;
  removeMarginOnMobile?: boolean;
}

const paddingClasses = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8'
};

const roundedClasses = {
  sm: 'rounded-sm',
  md: 'rounded-md', 
  lg: 'rounded-lg',
  xl: 'rounded-xl'
};

const shadowClasses = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl'
};

/**
 * Card component optimized for mobile touch interfaces
 * with device-specific styling options
 */
export function MobileOptimizedCard({
  children,
  className,
  mobilePadding = 'md',
  mobileRounded = 'lg',
  mobileShadow = 'md',
  desktopPadding = 'lg',
  desktopRounded = 'xl',
  desktopShadow = 'lg',
  fullWidthOnMobile = false,
  removeMarginOnMobile = false
}: MobileOptimizedCardProps) {
  const isMobile = useIsMobile();
  
  const cardClassName = cn(
    'bg-white border border-gray-200 transition-all duration-200',
    
    // Apply mobile-specific styles
    isMobile ? paddingClasses[mobilePadding] : paddingClasses[desktopPadding],
    isMobile ? roundedClasses[mobileRounded] : roundedClasses[desktopRounded],
    isMobile ? shadowClasses[mobileShadow] : shadowClasses[desktopShadow],
    
    // Mobile-specific behaviors
    isMobile && fullWidthOnMobile && 'w-full',
    isMobile && removeMarginOnMobile && 'm-0',
    
    // Enhanced mobile touch targets
    isMobile && 'min-h-[44px]', // Apple's minimum touch target
    
    className
  );

  return (
    <div className={cardClassName}>
      {children}
    </div>
  );
}