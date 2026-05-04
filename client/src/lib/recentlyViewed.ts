import { Product } from "@/lib/types";

const RECENTLY_VIEWED_KEY = 'lanora_recently_viewed';
const MAX_RECENTLY_VIEWED = 6;

export interface RecentlyViewedProduct {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  viewedAt: number;
}

export function addToRecentlyViewed(product: Product) {
  try {
    const recentProduct: RecentlyViewedProduct = {
      id: product.id.toString(),
      name: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      viewedAt: Date.now()
    };

    const existing = getRecentlyViewed();
    
    // Remove if already exists
    const filtered = existing.filter(p => p.id !== product.id);
    
    // Add to beginning
    const updated = [recentProduct, ...filtered].slice(0, MAX_RECENTLY_VIEWED);
    
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save recently viewed product:', error);
  }
}

export function getRecentlyViewed(): RecentlyViewedProduct[] {
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!stored) return [];
    
    const items = JSON.parse(stored) as RecentlyViewedProduct[];
    
    // Filter out items older than 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const filtered = items.filter(item => item.viewedAt > thirtyDaysAgo);
    
    // Save back if we filtered anything out
    if (filtered.length !== items.length) {
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(filtered));
    }
    
    return filtered;
  } catch (error) {
    console.error('Failed to retrieve recently viewed products:', error);
    return [];
  }
}

export function clearRecentlyViewed() {
  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  } catch (error) {
    console.error('Failed to clear recently viewed products:', error);
  }
}