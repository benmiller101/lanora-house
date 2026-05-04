import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ResponsiveSpacerProps {
  mobileHeight?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  desktopHeight?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const spacingClasses = {
  sm: 'h-4',
  md: 'h-8',
  lg: 'h-12',
  xl: 'h-16',
  '2xl': 'h-24'
};

/**
 * Responsive spacer component for different vertical spacing on mobile vs desktop
 */
export function ResponsiveSpacer({ 
  mobileHeight = 'md', 
  desktopHeight = 'lg', 
  className 
}: ResponsiveSpacerProps) {
  const isMobile = useIsMobile();
  
  const spacerClassName = cn(
    'w-full',
    isMobile ? spacingClasses[mobileHeight] : spacingClasses[desktopHeight],
    className
  );

  return <div className={spacerClassName} />;
}