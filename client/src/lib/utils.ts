import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string, currency: string = "£") {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return `${currency}0.00`;
  }
  
  return `${currency}${numericAmount.toFixed(2)}`;
}

// Function to get the proper image URL
export function getImageUrl(imageUrl: string): string {
  if (!imageUrl) return '/placeholder-image.jpg';
  
  // If it's already a full URL, return it
  if (imageUrl.startsWith('http') || imageUrl.startsWith('https')) {
    return imageUrl;
  }
  
  // If it's an absolute path starting with /, return it directly
  if (imageUrl.startsWith('/uploads/')) {
    return imageUrl;
  }
  
  // Handle paths that may be stored with or without public prefix
  if (imageUrl.startsWith('public/uploads/')) {
    return imageUrl.replace('public', '');
  }
  
  // Otherwise, add the uploads prefix
  return `/uploads/${imageUrl}`;
}
