// Blog Types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  sections?: any[];
  coverImage: string;
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
  category: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  authorName?: string;
  authorImage?: string;
  authorBio?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
    bio?: string;
    social?: Record<string, string>;
  };
  comments?: BlogPostComment[];
  relatedPosts?: Omit<BlogPost, 'content' | 'comments' | 'relatedPosts' | 'morePosts'>[];
  morePosts?: Omit<BlogPost, 'content' | 'comments' | 'relatedPosts' | 'morePosts'>[];
}

export interface BlogPostComment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  detailedDescription?: string;
  price: number;
  originalPrice?: number;
  category: Category;
  era: string;
  condition: string;
  materials: string[];
  dimensions?: string;
  origin?: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  imageUrl: string;
  additionalImages?: string[];
  provenance?: string;
  inStock: boolean;
  stockQuantity: number;
  createdAt: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

// Raffle Types
export interface Raffle {
  id: string;
  name: string;
  description: string;
  excerpt?: string;
  itemDescription: string;
  retailPrice: string | number;
  ticketPrice: string | number;
  startDate: string;
  startTime?: string;
  endDate: string;
  endTime?: string;
  maxTickets: number;
  ticketsSold: number;
  status: 'active' | 'upcoming' | 'completed' | 'ended';
  imageUrl: string;
  additionalImages?: string[];
  winningTicketNumber?: number;
  winnerId?: string;
  entryCount?: number;
  ticketLimit?: number;
  // Instant win configuration
  instantWinEnabled?: boolean;
  instantWinTitle?: string;
  instantWinPrizes?: Array<{
    type: string;
    count: number;
    amount: number;
  }>;
  // Legacy instant win fields for backward compatibility
  instantWinCount?: number;
  instantWinAmount?: number | string;
  instantWinNumbers?: number[];
  winner?: {
    id: string;
    name: string;
    ticketNumber?: number;
  };
}

// Cart Types
export interface CartItem {
  id: string;
  product?: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    era: string;
  };
  productId?: string;
  raffleId?: string;
  quantity: number;
  subtotal?: number;
  price?: number;
  name?: string;
  type?: 'product' | 'raffle_ticket';
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  discount: number;
}

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

// Order Types
export interface Order {
  id: string;
  userId: number;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  type: 'product' | 'raffle_ticket';
  raffleId?: string;
}

// Address Types
export interface Address {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
}

// Raffle Entry Types
export interface RaffleEntry {
  id: string;
  raffleId: string;
  userId: number;
  ticketCount: number;
  ticketNumbers: number[];
  createdAt: string;
}

// Wishlist Types
export interface WishlistItem {
  id: string;
  productId: string;
  userId: number;
  addedAt: string;
  product: Product;
}
