import React, { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: ReactNode;
  mobileColumns?: 1 | 2;
  desktopColumns?: 2 | 3 | 4 | 5 | 6;
  mobileGap?: 'sm' | 'md' | 'lg' | 'xl';
  desktopGap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4', 
  lg: 'gap-6',
  xl: 'gap-8'
};

const mobileColumnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-2'
};

const desktopColumnClasses = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3', 
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6'
};

/**
 * Smart responsive grid that adapts layout based on device type
 * Provides more control than standard Tailwind responsive classes
 */
export function ResponsiveGrid({
  children,
  mobileColumns = 1,
  desktopColumns = 3,
  mobileGap = 'md',
  desktopGap = 'lg',
  className
}: ResponsiveGridProps) {
  const isMobile = useIsMobile();
  
  const gridClassName = cn(
    'grid',
    isMobile ? mobileColumnClasses[mobileColumns] : mobileColumnClasses[mobileColumns],
    isMobile ? gapClasses[mobileGap] : gapClasses[desktopGap],
    !isMobile && desktopColumnClasses[desktopColumns],
    className
  );

  return (
    <div className={gridClassName}>
      {children}
    </div>
  );
}