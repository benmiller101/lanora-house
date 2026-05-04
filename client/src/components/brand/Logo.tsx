import React from 'react';
import logoImage from "@assets/lanora-house-logo.png";
import horizontalWhiteLogo from "@assets/Lanora_house-Horizontal-Logo-White@5x.png";

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon' | 'horizontal' | 'horizontal-white';
}

export default function Logo({ 
  className = '', 
  size = 'md', 
  variant = 'full' 
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 min-h-[24px]',
    md: 'h-8 min-h-[32px]',
    lg: 'h-10 min-h-[40px]',
  };
  
  if (variant === 'icon') {
    // For small icon display, show just the icon part from the logo
    return (
      <div className={`${className} flex-shrink-0`}>
        <img 
          src="/logos/lanora-house-logo.png" 
          alt="Lanora House" 
          className={`${sizeClasses[size]} w-auto object-contain max-w-none`} 
          style={{ minWidth: '40px' }}
        />
      </div>
    );
  }
  
  if (variant === 'horizontal-white') {
    return (
      <div className={`${className} flex-shrink-0`}>
        <img 
          src={horizontalWhiteLogo} 
          alt="Lanora House Est. 2023" 
          className={`${sizeClasses[size]} w-auto object-contain max-w-none`}
          style={{ minWidth: '160px' }}
        />
      </div>
    );
  }
  
  return (
    <div className={`${className} flex-shrink-0`}>
      <img 
        src={logoImage} 
        alt="Lanora House Est. 2023" 
        className={`${sizeClasses[size]} w-auto object-contain max-w-none`}
        style={{ minWidth: '120px' }}
      />
    </div>
  );
}