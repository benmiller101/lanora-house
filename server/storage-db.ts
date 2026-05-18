import {
  users,
  categories,
  products,
  orders,
  orderItems,
  cartItems,
  wishlistItems,
  raffles,
  raffleEntries,
  itemSubmissions,
  withdrawals,
  instantWinners,
  teamMembers,
  customerReviews,
  galleryImages,
  auctionLots,
  auctionBids,
  auctionWishlist,
  beforeAfterPosts,
  type User,
  type UpsertUser,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type CartItem,
  type InsertCartItem,
  type WishlistItem,
  type RaffleEntry,
  type InsertRaffleEntry,
  type ItemSubmission,
  type InsertItemSubmission,
  type TeamMember,
  type InsertTeamMember,
  type CustomerReview,
  type InsertCustomerReview,
  type GalleryImage,
  type InsertGalleryImage,
  type AuctionBid,
  type InsertAuctionBid,
  type AuctionWishlistItem,
  type InsertAuctionWishlistItem,
  calendarEvents,
  type CalendarEvent,
  type InsertCalendarEvent,
  auctionHighlights,
  type AuctionHighlight,
  type InsertAuctionHighlight,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(email: string): Promise<User | undefined>;
  createUser(data: InsertUser): Promise<User>;
  upsertUser(data: UpsertUser): Promise<User>;
  authenticateUser(email: string, password: string): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<boolean>;
  updateUserProfile(id: string, data: Partial<User>): Promise<User>;

  // Cart operations
  getCart(userId: string): Promise<{
    items: any[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    discount: number;
  }>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(
    userId: string,
    itemId: number,
    quantity: number,
  ): Promise<boolean>;
  removeFromCart(userId: string, itemId: number): Promise<boolean>;
  clearCart(userId: string): Promise<boolean>;

  // Order operations
  createOrder(order: InsertOrder, items: InsertCartItem[]): Promise<Order>;
  getOrdersByUserId(userId: string): Promise<Order[]>;
  getOrderById(orderId: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;

  // Wishlist operations
  getWishlist(userId: string): Promise<WishlistItem[]>;
  addToWishlist(userId: string, productId: number): Promise<WishlistItem>;
  removeFromWishlist(userId: string, itemId: number): Promise<boolean>;

  // Raffle operations
  getUserRaffleEntries(userId: string): Promise<RaffleEntry[]>;

  // Product operations
  getProducts(filters: any, page: number, pageSize: number, sort: string): Promise<{ products: any[]; total: number }>;
  getProductById(id: number): Promise<any | undefined>;
  createProduct(data: InsertProduct): Promise<Product>;
  updateProduct(id: number, data: Partial<Product>): Promise<Product>;
  deleteProduct(id: number): Promise<boolean>;

  // Item submission operations
  getUserItemSubmissions(userId: string): Promise<ItemSubmission[]>;
  getItemSubmissionById(id: number): Promise<ItemSubmission | undefined>;
  createItemSubmission(data: InsertItemSubmission): Promise<ItemSubmission>;
  updateItemSubmission(
    id: number,
    data: Partial<ItemSubmission>,
  ): Promise<ItemSubmission>;
  getAllItemSubmissions(status?: string): Promise<ItemSubmission[]>;
  respondToItemSubmission(
    id: number,
    response: string,
    adminNotes?: string,
  ): Promise<ItemSubmission>;

  // Withdrawal operations for admin
  getAllWithdrawalsForAdmin(): Promise<any[]>;
  getWithdrawalById(id: number): Promise<any>;
  returnInstantWinsToUser(userId: string, amount: string): Promise<void>;
  updateWithdrawalStatus(id: number, status: string, transactionId?: string, notes?: string): Promise<any>;
  getWithdrawalStats(): Promise<any>;

  // Team Member methods
  getAllTeamMembers(): Promise<TeamMember[]>;
  getActiveTeamMembers(): Promise<TeamMember[]>;
  getTeamMemberById(id: number): Promise<TeamMember | undefined>;
  createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: number, updateData: Partial<TeamMember>): Promise<TeamMember | null>;
  deleteTeamMember(id: number): Promise<boolean>;

  // Customer Review methods
  getAllCustomerReviews(): Promise<CustomerReview[]>;
  getActiveCustomerReviews(): Promise<CustomerReview[]>;
  getCustomerReviewById(id: number): Promise<CustomerReview | undefined>;
  createCustomerReview(review: InsertCustomerReview): Promise<CustomerReview>;
  updateCustomerReview(id: number, updateData: Partial<CustomerReview>): Promise<CustomerReview | null>;
  deleteCustomerReview(id: number): Promise<boolean>;

  // Gallery Image operations
  getAllGalleryImages(): Promise<GalleryImage[]>;
  getActiveGalleryImages(): Promise<GalleryImage[]>;
  getGalleryImageById(id: number): Promise<GalleryImage | undefined>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  updateGalleryImage(id: number, updateData: Partial<GalleryImage>): Promise<GalleryImage | null>;
  deleteGalleryImage(id: number): Promise<boolean>;

  // Calendar Event operations
  getAllCalendarEvents(): Promise<CalendarEvent[]>;
  getActiveCalendarEvents(): Promise<CalendarEvent[]>;
  getCalendarEventById(id: number): Promise<CalendarEvent | undefined>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: number, updateData: Partial<CalendarEvent>): Promise<CalendarEvent | null>;
  deleteCalendarEvent(id: number): Promise<boolean>;

  // Auction Highlight operations
  getAllAuctionHighlights(): Promise<AuctionHighlight[]>;
  getActiveAuctionHighlights(): Promise<AuctionHighlight[]>;
  getAuctionHighlightById(id: number): Promise<AuctionHighlight | undefined>;
  createAuctionHighlight(highlight: InsertAuctionHighlight): Promise<AuctionHighlight>;
  updateAuctionHighlight(id: number, updateData: Partial<AuctionHighlight>): Promise<AuctionHighlight | null>;
  deleteAuctionHighlight(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // ----- User methods -----
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async upsertUser(data: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(data)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          profileImageUrl: data.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async authenticateUser(
    email: string,
    _password: string,
  ): Promise<User | null> {
    const user = await this.getUserByUsername(email.toLowerCase());
    return user || null;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async updateUserProfile(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // --- Card Methods ---
  async getCart(userId: string) {
    console.log("🛒 DATABASE: Fetching cart for user:", userId);
    try {
      // Retrieve raw cart items with explicit select to avoid undefined/null issues
      const rawItems = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.userId, userId));

      // Process cart items - only raffle tickets are supported in current schema
      const items = await Promise.all(
        rawItems.map(async (item) => {
          if (item.type === "raffle_ticket" && item.raffleId != null) {
            try {
              const [raffle] = await db
                .select()
                .from(raffles)
                .where(eq(raffles.id, item.raffleId));
              
              if (!raffle) {
                console.warn("🛒 DATABASE: Raffle not found for cart item:", item.raffleId);
                return null;
              }
              
              const price = Number(raffle.ticketPrice);
              return {
                id: item.id.toString(),
                name: raffle.name, // Show raffle title directly
                price,
                quantity: item.quantity,
                subtotal: price * item.quantity,
                raffleId: item.raffleId.toString(),
                imageUrl: raffle.imageUrl,
              };
            } catch (error) {
              console.error("🛒 DATABASE: Error processing cart item:", error);
              return null;
            }
          }
          // Only raffle tickets are supported in current schema
          console.warn("🛒 DATABASE: Unsupported cart item type:", item.type);
          return null;
        }),
      );

    const validItems = items.filter((i) => i !== null) as any[];
    const subtotal = validItems.reduce((sum, i) => sum + i.subtotal, 0);
    
    // Check if cart contains only digital items (raffle tickets)
    const hasOnlyDigitalItems = validItems.every(item => item.type === 'raffle_ticket');
    const shipping = hasOnlyDigitalItems ? 0 : (subtotal > 0 ? (subtotal >= 5000 ? 0 : 75) : 0);
    
    const tax = 0; // NO TAX - business decision
    const total = subtotal; // Only subtotal, no additional charges

    console.log("🛒 DATABASE: Cart items:", validItems);
    console.log("🛒 DATABASE: Cart totals:", {
      subtotal,
      shipping,
      tax,
      total,
    });

    return { items: validItems, subtotal, shipping, tax, total, discount: 0 };
    } catch (error) {
      console.error("🛒 DATABASE: Error in getCart:", error);
      // Return empty cart on error to avoid breaking the frontend
      return { 
        items: [], 
        subtotal: 0, 
        shipping: 0, 
        tax: 0, 
        total: 0, 
        discount: 0 
      };
    }
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const [ci] = await db.insert(cartItems).values(item).returning();
    return ci;
  }

  async updateCartItemQuantity(
    userId: string,
    itemId: number,
    quantity: number,
  ): Promise<boolean> {
    const result = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.userId, userId), eq(cartItems.id, itemId));
    return result.rowCount > 0;
  }

  async removeFromCart(userId: string, itemId: number): Promise<boolean> {
    console.log("🛒 DATABASE: Removing cart item - userId:", userId, "itemId:", itemId, "type:", typeof itemId);
    
    // First, let's check what items exist for this user
    const existingItems = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.userId, userId));
    console.log("🛒 DATABASE: Existing cart items for user:", existingItems);
    
    const result = await db
      .delete(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.id, itemId)));
    
    console.log("🛒 DATABASE: Delete result rowCount:", result.rowCount);
    return result.rowCount > 0;
  }

  async clearCart(userId: string): Promise<boolean> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
    return true;
  }

  // ----- Order methods -----
  async createOrder(
    orderData: {
      userId: string;
      paymentIntentId: string;
      paymentMethod: string;
      shippingAddress: string; // JSON-stringified
      billingAddress: string; // JSON-stringified
      subtotal: number;
      shipping: number;
      tax: number;
      total: number;
      discount: number;
    },
    items: {
      productId: number | null;
      raffleId: number | null;
      quantity: number;
      price: number;
      name: string;
      type: string;
    }[],
  ): Promise<Order> {
    // 1) insert the order row with every required column
    const [o] = await db
      .insert(orders)
      .values({
        userId: orderData.userId,
        paymentIntentId: orderData.paymentIntentId,
        paymentMethod: orderData.paymentMethod, // ← now required
        shippingAddress: orderData.shippingAddress, // ← JSON string
        billingAddress: orderData.billingAddress, // ← JSON string
        subtotal: orderData.subtotal,
        shipping: orderData.shipping,
        tax: orderData.tax,
        total: orderData.total,
        discount: orderData.discount,
      })
      .returning();

    // 2) insert each line-item
    await Promise.all(
      items.map((i) =>
        db
          .insert(orderItems)
          .values({
            orderId: o.id,
            productId: i.productId,
            raffleId: i.raffleId,
            quantity: i.quantity,
            price: i.price.toString(), // or string, depending on your schema
            name: i.name,
            type: i.type,
          })
          .returning(),
      ),
    );

    return o;
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async getOrderById(orderId: string): Promise<any | undefined> {
    console.log("Looking up order:", orderId);
    
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) {
      console.log("Order not found in database:", orderId);
      return undefined;
    }

    // Get order items for this order (using the string ID)
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    
    return {
      ...order,
      items: items
    };
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  // ----- Wishlist methods -----
  async getWishlist(userId: string): Promise<WishlistItem[]> {
    return await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.userId, userId));
  }

  async addToWishlist(
    userId: string,
    productId: number,
  ): Promise<WishlistItem> {
    const [wi] = await db
      .insert(wishlistItems)
      .values({ userId, productId })
      .returning();
    return wi;
  }

  async removeFromWishlist(userId: string, itemId: number): Promise<boolean> {
    const result = await db
      .delete(wishlistItems)
      .where(eq(wishlistItems.userId, userId), eq(wishlistItems.id, itemId));
    return result.rowCount > 0;
  }

  // ----- Product methods -----
  async getProducts(filters: any, page: number, pageSize: number, sort: string): Promise<{ products: any[]; total: number }> {
    // Simple query to get all products
    const allProducts = await db.select().from(products);
    
    let filteredProducts = allProducts.filter(p => p.inStock);
    
    // Apply search filtering
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filtering - convert category slug to ID
    if (filters.category && filters.category !== 'all') {
      const allCategories = await db.select().from(categories);
      const targetCategory = allCategories.find(c => c.slug === filters.category);
      if (targetCategory) {
        filteredProducts = filteredProducts.filter(p => p.categoryId === targetCategory.id);
      }
    }

    // Apply era filtering - match by partial string since our data has full descriptions
    if (filters.era && filters.era !== 'all') {
      let eraSearchTerm = '';
      switch (filters.era) {
        case 'victorian':
          eraSearchTerm = 'Victorian';
          break;
        case 'art_deco':
          eraSearchTerm = 'Art Deco';
          break;
        case 'mid_century':
          eraSearchTerm = 'Mid-Century';
          break;
        case 'georgian':
          eraSearchTerm = 'Georgian';
          break;
        case 'art_nouveau':
          eraSearchTerm = 'Art Nouveau';
          break;
        case 'edwardian':
          eraSearchTerm = 'Edwardian';
          break;
        case 'medieval':
          eraSearchTerm = 'Medieval';
          break;
        default:
          eraSearchTerm = filters.era;
      }
      if (eraSearchTerm) {
        filteredProducts = filteredProducts.filter(p => 
          p.era && p.era.toLowerCase().includes(eraSearchTerm.toLowerCase())
        );
      }
    }

    // Apply condition filtering - case insensitive matching
    if (filters.condition && filters.condition.length > 0) {
      filteredProducts = filteredProducts.filter(p => 
        p.condition && filters.condition.some(c => 
          p.condition.toLowerCase().includes(c.toLowerCase())
        )
      );
    }

    // Apply price range filtering
    if (filters.priceMin !== undefined && filters.priceMin !== '') {
      const minPrice = parseFloat(filters.priceMin);
      filteredProducts = filteredProducts.filter(p => Number(p.price) >= minPrice);
    }
    if (filters.priceMax !== undefined && filters.priceMax !== '') {
      const maxPrice = parseFloat(filters.priceMax);
      filteredProducts = filteredProducts.filter(p => Number(p.price) <= maxPrice);
    }

    // Apply materials filtering
    if (filters.materials) {
      const materialsLower = filters.materials.toLowerCase();
      filteredProducts = filteredProducts.filter(p => {
        if (Array.isArray(p.materials)) {
          return p.materials.some(material => 
            material.toLowerCase().includes(materialsLower)
          );
        }
        return false;
      });
    }

    // Apply sorting
    switch (sort) {
      case "newest":
        filteredProducts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case "price_low":
        filteredProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price_high":
        filteredProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "alphabetical":
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "featured":
      default:
        filteredProducts.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          if (a.isBestSeller && !b.isBestSeller) return -1;
          if (!a.isBestSeller && b.isBestSeller) return 1;
          return 0;
        });
        break;
    }

    const total = filteredProducts.length;
    const start = (page - 1) * pageSize;
    const paginatedProducts = filteredProducts.slice(start, start + pageSize);

    // Add category information
    const productsWithCategory = await Promise.all(
      paginatedProducts.map(async (product) => {
        const category = await db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1);
        return {
          ...product,
          categoryName: category[0]?.name || 'Unknown',
          categorySlug: category[0]?.slug || 'unknown'
        };
      })
    );

    return { products: productsWithCategory, total };
  }

  async getFeaturedProducts(): Promise<any[]> {
    const featuredProducts = await db
      .select()
      .from(products)
      .where(eq(products.isFeatured, true))
      .limit(4);

    // Add category information
    const productsWithCategory = await Promise.all(
      featuredProducts.map(async (product) => {
        const category = await db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1);
        return {
          ...product,
          isFeatured: product.isFeatured,
          isBestSeller: product.isBestseller,
          inStock: product.inStock,
          categoryName: category[0]?.name || 'Unknown',
          categorySlug: category[0]?.slug || 'unknown'
        };
      })
    );

    return productsWithCategory;
  }

  async getProductById(id: number): Promise<any | undefined> {
    const product = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (product.length === 0) return undefined;

    const category = await db.select().from(categories).where(eq(categories.id, product[0].categoryId)).limit(1);
    
    return {
      ...product[0],
      categoryName: category[0]?.name || 'Unknown',
      categorySlug: category[0]?.slug || 'unknown'
    };
  }

  async createProduct(data: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(data).returning();
    return product;
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    console.log(`Updating product ${id} with data:`, JSON.stringify(data, null, 2));
    
    try {
      // Clean the data to match database schema
      const cleanData: any = {};
      
      // Map frontend fields to database fields with proper types
      if (data.name !== undefined) cleanData.name = data.name;
      if (data.description !== undefined) cleanData.description = data.description;
      if (data.detailedDescription !== undefined) cleanData.detailedDescription = data.detailedDescription;
      if (data.sku !== undefined) cleanData.sku = data.sku || null;
      if (data.price !== undefined) cleanData.price = String(data.price);
      if (data.originalPrice !== undefined) cleanData.originalPrice = data.originalPrice ? String(data.originalPrice) : null;
      if (data.categoryId !== undefined) cleanData.categoryId = Number(data.categoryId);
      if (data.era !== undefined) cleanData.era = data.era;
      if (data.condition !== undefined) cleanData.condition = data.condition;
      if (data.materials !== undefined) cleanData.materials = Array.isArray(data.materials) ? data.materials : [];
      if (data.dimensions !== undefined) cleanData.dimensions = data.dimensions;
      if (data.origin !== undefined) cleanData.origin = data.origin;
      if (data.isFeatured !== undefined) cleanData.isFeatured = Boolean(data.isFeatured);
      if (data.isBestSeller !== undefined) cleanData.isBestSeller = Boolean(data.isBestSeller);
      if (data.imageUrl !== undefined) cleanData.imageUrl = data.imageUrl;
      if (data.additionalImages !== undefined) cleanData.additionalImages = Array.isArray(data.additionalImages) ? data.additionalImages : [];
      if (data.provenance !== undefined) cleanData.provenance = data.provenance;
      if (data.inStock !== undefined) cleanData.inStock = Boolean(data.inStock);
      if (data.stockQuantity !== undefined) cleanData.stockQuantity = Number(data.stockQuantity);
      
      cleanData.updatedAt = new Date();
      
      console.log(`Cleaned data for product ${id}:`, JSON.stringify(cleanData, null, 2));
      
      const [product] = await db
        .update(products)
        .set(cleanData)
        .where(eq(products.id, id))
        .returning();
      
      console.log(`Product ${id} updated successfully:`, product);
      return product;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  async deleteProduct(id: number): Promise<boolean> {
    try {
      const result = await db.delete(products).where(eq(products.id, id));
      return result.rowCount > 0;
    } catch (error: any) {
      if (error.code === '23503') {
        const [product] = await db
          .update(products)
          .set({ inStock: false, stockQuantity: 0 })
          .where(eq(products.id, id))
          .returning();
        return !!product;
      }
      throw error;
    }
  }

  // ----- Raffle entries -----
  async getUserRaffleEntries(userId: string): Promise<RaffleEntry[]> {
    return await db
      .select()
      .from(raffleEntries)
      .where(eq(raffleEntries.userId, userId));
  }

  // ----- Item submissions -----
  async getUserItemSubmissions(userId: string): Promise<ItemSubmission[]> {
    return await db
      .select()
      .from(itemSubmissions)
      .where(eq(itemSubmissions.userId, userId));
  }

  async getItemSubmissionById(id: number): Promise<ItemSubmission | undefined> {
    const [sub] = await db
      .select()
      .from(itemSubmissions)
      .where(eq(itemSubmissions.id, id));
    return sub;
  }

  async createItemSubmission(
    data: InsertItemSubmission,
  ): Promise<ItemSubmission> {
    const [isub] = await db.insert(itemSubmissions).values(data).returning();
    return isub;
  }

  async updateItemSubmission(
    id: number,
    data: Partial<ItemSubmission>,
  ): Promise<ItemSubmission> {
    const [sub] = await db
      .update(itemSubmissions)
      .set(data)
      .where(eq(itemSubmissions.id, id))
      .returning();
    return sub;
  }

  async getAllItemSubmissions(status?: string): Promise<ItemSubmission[]> {
    const q = db.select().from(itemSubmissions);
    if (status) q.where(eq(itemSubmissions.status, status));
    return await q;
  }

  async respondToItemSubmission(
    id: number,
    response: string,
    adminNotes?: string,
  ): Promise<ItemSubmission> {
    const [sub] = await db
      .update(itemSubmissions)
      .set({ status: response, adminNotes, updatedAt: new Date() })

      .where(eq(itemSubmissions.id, id))
      .returning();
    return sub;
  }


  // ----- Withdrawal methods for admin -----
  async getAllWithdrawalsForAdmin(): Promise<any[]> {
    const withdrawalsList = await db.select({
      id: withdrawals.id,
      user_id: withdrawals.userId,
      user_email: users.email,
      user_name: sql<string>`COALESCE(${users.firstName} || ' ' || ${users.lastName}, ${users.username}, ${users.email})`,
      amount: withdrawals.amount,
      withdrawal_method: withdrawals.withdrawalMethod,
      withdrawal_details: withdrawals.withdrawalDetails,
      status: withdrawals.status,
      created_at: withdrawals.createdAt,
      processed_at: withdrawals.processedAt,
      transaction_id: withdrawals.transactionId,
      notes: withdrawals.notes,
      prizes_count: sql<number>`array_length(${withdrawals.instantWinIds}, 1)`
    })
    .from(withdrawals)
    .leftJoin(users, eq(withdrawals.userId, users.id))
    .orderBy(desc(withdrawals.createdAt));

    return withdrawalsList;
  }

  async getWithdrawalById(id: number): Promise<any> {
    const [withdrawal] = await db.select({
      id: withdrawals.id,
      user_id: withdrawals.userId,
      user_email: users.email,
      user_name: sql<string>`COALESCE(${users.firstName} || ' ' || ${users.lastName}, ${users.username}, ${users.email})`,
      amount: withdrawals.amount,
      withdrawal_method: withdrawals.withdrawalMethod,
      withdrawal_details: withdrawals.withdrawalDetails,
      status: withdrawals.status,
      created_at: withdrawals.createdAt,
      processed_at: withdrawals.processedAt,
      transaction_id: withdrawals.transactionId,
      notes: withdrawals.notes,
      instant_win_ids: withdrawals.instantWinIds
    })
    .from(withdrawals)
    .leftJoin(users, eq(withdrawals.userId, users.id))
    .where(eq(withdrawals.id, id));

    return withdrawal;
  }

  async returnInstantWinsToUser(userId: string, amount: string): Promise<void> {
    // Find the withdrawal that was rejected to get the instant win IDs
    const [withdrawal] = await db.select()
      .from(withdrawals)
      .where(and(
        eq(withdrawals.userId, userId),
        eq(withdrawals.amount, amount),
        eq(withdrawals.status, 'pending')
      ))
      .orderBy(desc(withdrawals.createdAt))
      .limit(1);

    if (withdrawal && withdrawal.instantWinIds) {
      // Return instant wins to unclaimed status
      await db.update(instantWinners)
        .set({ claimed: false, claimedAt: null })
        .where(inArray(instantWinners.id, withdrawal.instantWinIds));
    }
  }

  async updateWithdrawalStatus(id: number, status: string, transactionId?: string, notes?: string): Promise<any> {
    const [updatedWithdrawal] = await db.update(withdrawals)
      .set({
        status,
        processedAt: new Date(),
        transactionId: transactionId || null,
        notes: notes || null
      })
      .where(eq(withdrawals.id, id))
      .returning();

    return updatedWithdrawal;
  }

  async getWithdrawalStats(): Promise<any> {
    const stats = await db.select({
      pending_count: sql<number>`COUNT(CASE WHEN status = 'pending' THEN 1 END)`,
      completed_count: sql<number>`COUNT(CASE WHEN status = 'completed' THEN 1 END)`,
      failed_count: sql<number>`COUNT(CASE WHEN status = 'failed' THEN 1 END)`,
      pending_amount: sql<number>`SUM(CASE WHEN status = 'pending' THEN CAST(amount AS DECIMAL) ELSE 0 END)`,
      completed_amount: sql<number>`SUM(CASE WHEN status = 'completed' THEN CAST(amount AS DECIMAL) ELSE 0 END)`,
      total_amount: sql<number>`SUM(CAST(amount AS DECIMAL))`
    })
    .from(withdrawals);

    return stats[0];
  }

  // ----- Team Member methods -----
  async getAllTeamMembers(): Promise<TeamMember[]> {
    const allMembers = await db.select()
      .from(teamMembers)
      .orderBy(teamMembers.displayOrder);
    return allMembers;
  }

  async getActiveTeamMembers(): Promise<TeamMember[]> {
    const activeMembers = await db.select()
      .from(teamMembers)
      .where(eq(teamMembers.isActive, true))
      .orderBy(teamMembers.displayOrder);
    return activeMembers;
  }

  async getTeamMemberById(id: number): Promise<TeamMember | undefined> {
    const [member] = await db.select()
      .from(teamMembers)
      .where(eq(teamMembers.id, id));
    return member;
  }

  async createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember> {
    const [newMember] = await db.insert(teamMembers)
      .values(teamMember)
      .returning();
    return newMember;
  }

  async updateTeamMember(id: number, updateData: Partial<TeamMember>): Promise<TeamMember | null> {
    const [updatedMember] = await db.update(teamMembers)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(teamMembers.id, id))
      .returning();
    return updatedMember || null;
  }

  async deleteTeamMember(id: number): Promise<boolean> {
    const result = await db.delete(teamMembers)
      .where(eq(teamMembers.id, id))
      .returning();
    return result.length > 0;
  }

  // ----- Customer Review methods -----
  async getAllCustomerReviews(): Promise<CustomerReview[]> {
    const allReviews = await db.select()
      .from(customerReviews)
      .orderBy(customerReviews.displayOrder);
    return allReviews;
  }

  async getActiveCustomerReviews(): Promise<CustomerReview[]> {
    const activeReviews = await db.select()
      .from(customerReviews)
      .where(eq(customerReviews.isActive, true))
      .orderBy(customerReviews.displayOrder);
    return activeReviews;
  }

  async getCustomerReviewById(id: number): Promise<CustomerReview | undefined> {
    const [review] = await db.select()
      .from(customerReviews)
      .where(eq(customerReviews.id, id));
    return review;
  }

  async createCustomerReview(review: InsertCustomerReview): Promise<CustomerReview> {
    const [newReview] = await db.insert(customerReviews)
      .values(review)
      .returning();
    return newReview;
  }

  async updateCustomerReview(id: number, updateData: Partial<CustomerReview>): Promise<CustomerReview | null> {
    const [updatedReview] = await db.update(customerReviews)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(customerReviews.id, id))
      .returning();
    return updatedReview || null;
  }

  async deleteCustomerReview(id: number): Promise<boolean> {
    const result = await db.delete(customerReviews)
      .where(eq(customerReviews.id, id))
      .returning();
    return result.length > 0;
  }

  // ----- Gallery Image methods -----
  async getAllGalleryImages(): Promise<GalleryImage[]> {
    const images = await db.select()
      .from(galleryImages)
      .orderBy(galleryImages.displayOrder);
    return images;
  }

  async getActiveGalleryImages(): Promise<GalleryImage[]> {
    const images = await db.select()
      .from(galleryImages)
      .where(eq(galleryImages.isActive, true))
      .orderBy(galleryImages.displayOrder);
    return images;
  }

  async getGalleryImageById(id: number): Promise<GalleryImage | undefined> {
    const [image] = await db.select()
      .from(galleryImages)
      .where(eq(galleryImages.id, id));
    return image;
  }

  async createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    const [newImage] = await db.insert(galleryImages)
      .values(image)
      .returning();
    return newImage;
  }

  async updateGalleryImage(id: number, updateData: Partial<GalleryImage>): Promise<GalleryImage | null> {
    const [updatedImage] = await db.update(galleryImages)
      .set(updateData)
      .where(eq(galleryImages.id, id))
      .returning();
    return updatedImage || null;
  }

  async deleteGalleryImage(id: number): Promise<boolean> {
    const result = await db.delete(galleryImages)
      .where(eq(galleryImages.id, id))
      .returning();
    return result.length > 0;
  }

  // ----- Calendar Event methods -----
  async getAllCalendarEvents(): Promise<CalendarEvent[]> {
    const events = await db.select()
      .from(calendarEvents)
      .orderBy(calendarEvents.eventDate);
    return events;
  }

  async getActiveCalendarEvents(): Promise<CalendarEvent[]> {
    const events = await db.select()
      .from(calendarEvents)
      .where(eq(calendarEvents.isActive, true))
      .orderBy(calendarEvents.eventDate);
    return events;
  }

  async getCalendarEventById(id: number): Promise<CalendarEvent | undefined> {
    const [event] = await db.select()
      .from(calendarEvents)
      .where(eq(calendarEvents.id, id));
    return event;
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const [newEvent] = await db.insert(calendarEvents)
      .values({
        ...event,
        eventDate: new Date(event.eventDate)
      })
      .returning();
    return newEvent;
  }

  async updateCalendarEvent(id: number, updateData: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    const processedData = { ...updateData };
    if (processedData.eventDate && typeof processedData.eventDate === 'string') {
      processedData.eventDate = new Date(processedData.eventDate);
    }
    const [updatedEvent] = await db.update(calendarEvents)
      .set(processedData)
      .where(eq(calendarEvents.id, id))
      .returning();
    return updatedEvent || null;
  }

  async deleteCalendarEvent(id: number): Promise<boolean> {
    const result = await db.delete(calendarEvents)
      .where(eq(calendarEvents.id, id))
      .returning();
    return result.length > 0;
  }

  // ----- Auction Highlight methods -----
  async getAllAuctionHighlights(): Promise<AuctionHighlight[]> {
    const highlights = await db.select()
      .from(auctionHighlights)
      .orderBy(auctionHighlights.displayOrder, auctionHighlights.auctionDate);
    return highlights;
  }

  async getActiveAuctionHighlights(): Promise<AuctionHighlight[]> {
    const highlights = await db.select()
      .from(auctionHighlights)
      .where(eq(auctionHighlights.isActive, true))
      .orderBy(auctionHighlights.displayOrder, auctionHighlights.auctionDate);
    return highlights;
  }

  async getAuctionHighlightById(id: number): Promise<AuctionHighlight | undefined> {
    const [highlight] = await db.select()
      .from(auctionHighlights)
      .where(eq(auctionHighlights.id, id));
    return highlight;
  }

  async createAuctionHighlight(highlight: InsertAuctionHighlight): Promise<AuctionHighlight> {
    const [newHighlight] = await db.insert(auctionHighlights)
      .values({
        ...highlight,
        auctionDate: new Date(highlight.auctionDate)
      })
      .returning();
    return newHighlight;
  }

  async updateAuctionHighlight(id: number, updateData: Partial<AuctionHighlight>): Promise<AuctionHighlight | null> {
    const processedData = { ...updateData };
    if (processedData.auctionDate && typeof processedData.auctionDate === 'string') {
      processedData.auctionDate = new Date(processedData.auctionDate);
    }
    const [updatedHighlight] = await db.update(auctionHighlights)
      .set(processedData)
      .where(eq(auctionHighlights.id, id))
      .returning();
    return updatedHighlight || null;
  }

  async deleteAuctionHighlight(id: number): Promise<boolean> {
    const result = await db.delete(auctionHighlights)
      .where(eq(auctionHighlights.id, id))
      .returning();
    return result.length > 0;
  }

  // ----- Auction Bid methods -----
  async getUserBids(userId: string): Promise<any[]> {
    const userBids = await db.select({
      id: auctionBids.id,
      userId: auctionBids.userId,
      lotId: auctionBids.lotId,
      bidAmount: auctionBids.bidAmount,
      maxBid: auctionBids.maxBid,
      bidType: auctionBids.bidType,
      status: auctionBids.status,
      isWinning: auctionBids.isWinning,
      createdAt: auctionBids.createdAt,
      lotTitle: auctionLots.title,
      lotNumber: auctionLots.lotNumber,
      lotImageUrl: auctionLots.imageUrl,
      lotStatus: auctionLots.status,
      currentBid: auctionLots.currentBid,
    })
    .from(auctionBids)
    .leftJoin(auctionLots, eq(auctionBids.lotId, auctionLots.id))
    .where(eq(auctionBids.userId, userId))
    .orderBy(desc(auctionBids.createdAt));
    
    return userBids;
  }

  async getBidsByLotId(lotId: string): Promise<any[]> {
    const lotBids = await db.select()
      .from(auctionBids)
      .where(eq(auctionBids.lotId, lotId))
      .orderBy(desc(auctionBids.bidAmount));
    
    return lotBids;
  }

  async placeBid(bid: InsertAuctionBid): Promise<AuctionBid> {
    // Generate UUID for the bid
    const bidId = `bid_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Create the bid
    const [newBid] = await db.insert(auctionBids)
      .values({
        ...bid,
        id: bidId,
      })
      .returning();

    // Update the lot's current bid if this bid is higher
    const [lot] = await db.select()
      .from(auctionLots)
      .where(eq(auctionLots.id, bid.lotId));

    if (lot) {
      const currentBid = parseFloat(lot.currentBid || "0");
      const newBidAmount = parseFloat(bid.bidAmount as any);
      
      if (newBidAmount > currentBid) {
        await db.update(auctionLots)
          .set({ 
            currentBid: bid.bidAmount as any,
            totalBids: sql`${auctionLots.totalBids} + 1`,
            updatedAt: new Date()
          })
          .where(eq(auctionLots.id, bid.lotId));

        // Mark other bids as not winning
        await db.update(auctionBids)
          .set({ status: 'outbid', isWinning: false })
          .where(
            and(
              eq(auctionBids.lotId, bid.lotId),
              eq(auctionBids.isWinning, true)
            )
          );

        // Mark new bid as winning
        await db.update(auctionBids)
          .set({ status: 'winning', isWinning: true })
          .where(eq(auctionBids.id, newBid.id));
      }
    }

    return newBid;
  }

  async updateBidStatus(bidId: string, status: string): Promise<AuctionBid | null> {
    const [updatedBid] = await db.update(auctionBids)
      .set({ status })
      .where(eq(auctionBids.id, bidId))
      .returning();
    
    return updatedBid || null;
  }

  // ----- Auction Wishlist methods -----
  async getUserWishlist(userId: string): Promise<any[]> {
    const userWishlist = await db.select({
      id: auctionWishlist.id,
      lotId: auctionWishlist.lotId,
      notes: auctionWishlist.notes,
      addedAt: auctionWishlist.addedAt,
      lotTitle: auctionLots.title,
      lotNumber: auctionLots.lotNumber,
      lotImageUrl: auctionLots.imageUrl,
      lotStatus: auctionLots.status,
      currentBid: auctionLots.currentBid,
      estimatedValueLow: auctionLots.estimatedValueLow,
      estimatedValueHigh: auctionLots.estimatedValueHigh,
    })
    .from(auctionWishlist)
    .leftJoin(auctionLots, eq(auctionWishlist.lotId, auctionLots.id))
    .where(eq(auctionWishlist.userId, userId))
    .orderBy(desc(auctionWishlist.addedAt));
    
    return userWishlist;
  }

  async addToAuctionWishlist(userId: string, lotId: string, notes?: string): Promise<AuctionWishlistItem> {
    const [wishlistItem] = await db.insert(auctionWishlist)
      .values({ userId, lotId, notes })
      .returning();

    // Increment watch count
    await db.update(auctionLots)
      .set({ 
        watchCount: sql`${auctionLots.watchCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(auctionLots.id, lotId));
    
    return wishlistItem;
  }

  async removeFromAuctionWishlist(userId: string, lotId: string): Promise<boolean> {
    const result = await db.delete(auctionWishlist)
      .where(
        and(
          eq(auctionWishlist.userId, userId),
          eq(auctionWishlist.lotId, lotId)
        )
      )
      .returning();

    // Decrement watch count if item was found
    if (result.length > 0) {
      await db.update(auctionLots)
        .set({ 
          watchCount: sql`${auctionLots.watchCount} - 1`,
          updatedAt: new Date()
        })
        .where(eq(auctionLots.id, lotId));
    }
    
    return result.length > 0;
  }

  async isLotInWishlist(userId: string, lotId: string): Promise<boolean> {
    const [result] = await db.select()
      .from(auctionWishlist)
      .where(
        and(
          eq(auctionWishlist.userId, userId),
          eq(auctionWishlist.lotId, lotId)
        )
      );
    
    return !!result;
  }

  // Before/After Posts methods
  async getAllBeforeAfterPosts(): Promise<any[]> {
    return await db.query.beforeAfterPosts.findMany({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });
  }

  async getPublishedBeforeAfterPosts(): Promise<any[]> {
    return await db.query.beforeAfterPosts.findMany({
      where: (posts, { eq }) => eq(posts.published, true),
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });
  }

  async getBeforeAfterPostById(id: number): Promise<any | undefined> {
    return await db.query.beforeAfterPosts.findFirst({
      where: (posts, { eq }) => eq(posts.id, id),
    });
  }

  async createBeforeAfterPost(data: any): Promise<any> {
    const [post] = await db
      .insert(beforeAfterPosts)
      .values(data)
      .returning();
    return post;
  }

  async updateBeforeAfterPost(id: number, data: any): Promise<any> {
    const [updated] = await db
      .update(beforeAfterPosts)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(beforeAfterPosts.id, id))
      .returning();
    return updated;
  }

  async deleteBeforeAfterPost(id: number): Promise<boolean> {
    const result = await db
      .delete(beforeAfterPosts)
      .where(eq(beforeAfterPosts.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
