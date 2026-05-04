import React, { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ResponsiveTextProps {
  children: ReactNode;
  mobileSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  desktopSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  mobileWeight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  desktopWeight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

const sizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm', 
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
  '6xl': 'text-6xl'
};

const weightClasses = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold'
};

/**
 * Responsive text component with different sizes and weights for mobile/desktop
 */
export function ResponsiveText({
  children,
  mobileSize = 'base',
  desktopSize = 'lg',
  mobileWeight = 'normal',
  desktopWeight = 'normal',
  className,
  as: Component = 'div'
}: ResponsiveTextProps) {
  const isMobile = useIsMobile();
  
  const textClassName = cn(
    isMobile ? sizeClasses[mobileSize] : sizeClasses[desktopSize],
    isMobile ? weightClasses[mobileWeight] : weightClasses[desktopWeight],
    className
  );

  return (
    <Component className={textClassName}>
      {children}
    </Component>
  );
}