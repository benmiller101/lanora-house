import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface Product {
  id: number;
  name: string;
  description: string;
  detailedDescription?: string;
  era: string;
  condition: string;
  materials: string[];
  categoryId: number;
  price: string;
  originalPrice?: string;
  dimensions?: string;
  origin?: string;
  imageUrl: string;
  categoryName?: string;
  inStock: boolean;
  stockQuantity: number;
}

/**
 * Hook for getting AI-powered product recommendations
 */
export function useRecommendations(limit: number = 4, currentProductId?: string) {
  return useQuery({
    queryKey: ["/api/recommendations/product", currentProductId, limit],
    queryFn: async () => {
      if (!currentProductId) {
        // Get trending recommendations if no current product
        const response = await apiRequest("GET", `/api/recommendations/trending?limit=${limit}`);
        return await response.json();
      }
      
      // Get browsing history from localStorage
      const browsingHistory = getBrowsingHistory();
      const historyParam = browsingHistory.length > 0 ? `&history=${browsingHistory.join(',')}` : '';
      
      const response = await apiRequest("GET", `/api/recommendations/product/${currentProductId}?limit=${limit}${historyParam}`);
      return await response.json();
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for getting browsing-based recommendations
 */
export function useBrowsingRecommendations(limit: number = 4) {
  return useQuery({
    queryKey: ["/api/recommendations/browsing-based", limit],
    queryFn: async () => {
      const browsingHistory = getBrowsingHistory();
      const historyParam = browsingHistory.length > 0 ? `history=${browsingHistory.join(',')}` : '';
      
      const response = await apiRequest("GET", `/api/recommendations/browsing-based?${historyParam}&limit=${limit}`);
      return await response.json();
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for getting category-based recommendations
 */
export function useCategoryRecommendations(categoryId: number, excludeId?: number, limit: number = 4) {
  return useQuery({
    queryKey: ["/api/recommendations/category", categoryId, excludeId, limit],
    queryFn: async () => {
      const excludeParam = excludeId ? `&exclude=${excludeId}` : '';
      const response = await apiRequest("GET", `/api/recommendations/category/${categoryId}?limit=${limit}${excludeParam}`);
      return await response.json();
    },
    enabled: !!categoryId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for getting trending/popular recommendations
 */
export function useTrendingRecommendations(limit: number = 8) {
  return useQuery({
    queryKey: ["/api/recommendations/trending", limit],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/recommendations/trending?limit=${limit}`);
      return await response.json();
    },
    enabled: true,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook for getting price-based recommendations
 */
export function usePriceRangeRecommendations(
  minPrice: number, 
  maxPrice: number, 
  excludeId?: number, 
  limit: number = 4
) {
  return useQuery({
    queryKey: ["/api/recommendations/price-range", minPrice, maxPrice, excludeId, limit],
    queryFn: async () => {
      const excludeParam = excludeId ? `&exclude=${excludeId}` : '';
      const response = await apiRequest("GET", `/api/recommendations/price-range?min=${minPrice}&max=${maxPrice}&limit=${limit}${excludeParam}`);
      return await response.json();
    },
    enabled: minPrice >= 0 && maxPrice > minPrice,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Utility functions for managing browsing history
 */
function getBrowsingHistory(): string[] {
  try {
    const history = localStorage.getItem('product-browsing-history');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error reading browsing history:', error);
    return [];
  }
}

export function addToBrowsingHistory(productId: string | number) {
  try {
    const history = getBrowsingHistory();
    const productIdStr = productId.toString();
    
    // Remove if already exists (to move to front)
    const filtered = history.filter(id => id !== productIdStr);
    
    // Add to front and limit to last 20 items
    const updated = [productIdStr, ...filtered].slice(0, 20);
    
    localStorage.setItem('product-browsing-history', JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating browsing history:', error);
  }
}

export function clearBrowsingHistory() {
  try {
    localStorage.removeItem('product-browsing-history');
  } catch (error) {
    console.error('Error clearing browsing history:', error);
  }
}