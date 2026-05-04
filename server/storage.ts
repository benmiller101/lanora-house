import {
  users,
  User,
  InsertUser,
  UpsertUser,
  categories,
  Category,
  InsertCategory,
  productCategories,
  ProductCategory,
  InsertProductCategory,
  products,
  Product,
  InsertProduct,
  raffles,
  Raffle,
  InsertRaffle,
  raffleEntries,
  RaffleEntry,
  InsertRaffleEntry,
  cartItems,
  CartItem,
  InsertCartItem,
  orders,
  Order,
  InsertOrder,
  orderItems,
  OrderItem,
  InsertOrderItem,
  wishlistItems,
  WishlistItem,
  InsertWishlistItem,
  itemSubmissions,
  ItemSubmission,
  InsertItemSubmission,
  productOffers,
  ProductOffer,
  InsertProductOffer,
  teamMembers,
  TeamMember,
  InsertTeamMember,
  customerReviews,
  CustomerReview,
  InsertCustomerReview,
  galleryImages,
  GalleryImage,
  InsertGalleryImage,
  liveStreams,
  LiveStream,
  InsertLiveStream,
  streamRecordings,
  StreamRecording,
  InsertStreamRecording,
  calendarEvents,
  CalendarEvent,
  InsertCalendarEvent,
  auctionHighlights,
  AuctionHighlight,
  InsertAuctionHighlight,
} from "@shared/schema";

import {
  Raffle as RaffleType,
  Product as ProductType,
  Category as CategoryType,
} from "@/lib/types";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  authenticateUser(username: string, password: string): Promise<User | null>;
  upsertUser(userData: UpsertUser): Promise<User>;
  updateUserProfile(id: string, userData: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<boolean>;

  // Wallet methods
  getWallet(userId: string): Promise<any>;
  updateWalletBalance(userId: string, amount: number): Promise<any>;
  createTransaction(transaction: any): Promise<any>;
  getTransactions(userId: string): Promise<any[]>;

  // Category methods
  getAllCategories(): Promise<CategoryType[]>;
  getCategoryById(id: string): Promise<CategoryType | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Product methods
  getProducts(
    filters: any,
    page: number,
    pageSize: number,
    sort: string,
  ): Promise<{ products: ProductType[]; total: number }>;
  getProductById(id: string): Promise<ProductType | undefined>;
  getFeaturedProducts(): Promise<ProductType[]>;
  getRelatedProducts(productId: string): Promise<ProductType[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(
    productId: number,
    updateData: Partial<Product>,
  ): Promise<Product | null>;
  deleteProduct(productId: number): Promise<boolean>;

  // Raffle methods
  getFeaturedRaffle(): Promise<RaffleType | undefined>;
  getActiveRaffles(): Promise<RaffleType[]>;
  getUpcomingRaffles(): Promise<RaffleType[]>;
  getPastRaffles(): Promise<RaffleType[]>;
  getRaffleById(id: string): Promise<RaffleType | undefined>;
  createRaffle(raffle: InsertRaffle): Promise<Raffle>;
  enterRaffle(entry: InsertRaffleEntry): Promise<RaffleEntry>;
  getUserRaffleEntries(userId: string): Promise<any[]>;

  // Cart methods
  getCart(
    userId: string,
  ): Promise<{
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
  clearCart(userId: string): Promise<boolean>;
  applyPromoCode(userId: string, code: string): Promise<boolean>;

  // Wishlist methods
  getWishlist(userId: string): Promise<any[]>;
  addToWishlist(userId: string, productId: number): Promise<WishlistItem>;
  removeFromWishlist(userId: string, itemId: number): Promise<boolean>;

  // Order methods
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrdersByUserId(userId: string): Promise<any[]>;
  getOrderById(id: string): Promise<any | undefined>;

  // Payment Method methods
  getUserPaymentMethods(userId: string): Promise<any[]>;
  getPaymentMethodById(id: number): Promise<any | undefined>;
  createPaymentMethod(
    paymentMethod: any,
  ): Promise<any>;
  updatePaymentMethod(
    id: number,
    updateData: any,
  ): Promise<any | null>;
  deletePaymentMethod(id: number): Promise<boolean>;
  setDefaultPaymentMethod(
    userId: string,
    paymentMethodId: number,
  ): Promise<boolean>;

  // Product offer methods
  createProductOffer(data: InsertProductOffer): Promise<ProductOffer>;
  getProductOfferById(id: number): Promise<ProductOffer | undefined>;
  getOffersForProduct(productId: number): Promise<ProductOffer[]>;
  getUserOffers(userId: string): Promise<ProductOffer[]>;
  updateOfferStatus(
    offerId: number,
    status: string,
    adminResponse?: string,
  ): Promise<ProductOffer>;
  acceptOffer(offerId: number): Promise<ProductOffer>;
  rejectOffer(offerId: number, adminResponse?: string): Promise<ProductOffer>;

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

  // Gallery Image methods
  getAllGalleryImages(): Promise<GalleryImage[]>;
  getActiveGalleryImages(): Promise<GalleryImage[]>;
  getGalleryImageById(id: number): Promise<GalleryImage | undefined>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  updateGalleryImage(id: number, updateData: Partial<GalleryImage>): Promise<GalleryImage | null>;
  deleteGalleryImage(id: number): Promise<boolean>;

  // Calendar Event methods
  getAllCalendarEvents(): Promise<CalendarEvent[]>;
  getActiveCalendarEvents(): Promise<CalendarEvent[]>;
  getCalendarEventById(id: number): Promise<CalendarEvent | undefined>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: number, updateData: Partial<CalendarEvent>): Promise<CalendarEvent | null>;
  deleteCalendarEvent(id: number): Promise<boolean>;

  // Auction Highlight methods
  getAllAuctionHighlights(): Promise<AuctionHighlight[]>;
  getActiveAuctionHighlights(): Promise<AuctionHighlight[]>;
  getAuctionHighlightById(id: number): Promise<AuctionHighlight | undefined>;
  createAuctionHighlight(highlight: InsertAuctionHighlight): Promise<AuctionHighlight>;
  updateAuctionHighlight(id: number, updateData: Partial<AuctionHighlight>): Promise<AuctionHighlight | null>;
  deleteAuctionHighlight(id: number): Promise<boolean>;

  // Auction Catalogue methods
  getAllAuctionCatalogues(): Promise<any[]>;
  getActiveAuctionCatalogues(): Promise<any[]>;
  getAuctionCatalogueById(id: string): Promise<any | undefined>;
  createAuctionCatalogue(catalogue: any): Promise<any>;
  updateAuctionCatalogue(id: string, updateData: any): Promise<any | null>;
  deleteAuctionCatalogue(id: string): Promise<boolean>;

  // Auction Lot methods
  getAllAuctionLots(): Promise<any[]>;
  getLotsByCatalogueId(catalogueId: string): Promise<any[]>;
  getAuctionLotById(id: string): Promise<any | undefined>;
  createAuctionLot(lot: any): Promise<any>;
  updateAuctionLot(id: string, updateData: any): Promise<any | null>;
  deleteAuctionLot(id: string): Promise<boolean>;

  // Auction Bid methods
  getUserBids(userId: string): Promise<any[]>;
  getBidsByLotId(lotId: string): Promise<any[]>;
  placeBid(bid: any): Promise<any>;
  updateBidStatus(bidId: string, status: string): Promise<any | null>;

  // Auction Wishlist methods
  getUserWishlist(userId: string): Promise<any[]>;
  addToAuctionWishlist(userId: string, lotId: string, notes?: string): Promise<any>;
  removeFromAuctionWishlist(userId: string, lotId: string): Promise<boolean>;
  isLotInWishlist(userId: string, lotId: string): Promise<boolean>;

  // Live Stream methods
  getAllLiveStreams(): Promise<LiveStream[]>;
  getLiveStreamById(id: number): Promise<LiveStream | undefined>;
  getLiveStreamByRaffleId(raffleId: number): Promise<LiveStream | undefined>;
  getLiveStreamByCloudflareUid(cloudflareUid: string): Promise<LiveStream | undefined>;
  createLiveStream(stream: InsertLiveStream): Promise<LiveStream>;
  updateLiveStream(id: number, updateData: Partial<LiveStream>): Promise<LiveStream | null>;
  updateLiveStreamStatus(id: number, status: string): Promise<LiveStream | null>;
  deleteLiveStream(id: number): Promise<boolean>;
  getActiveLiveStreams(): Promise<LiveStream[]>;

  // Stream Recording methods
  getAllStreamRecordings(): Promise<StreamRecording[]>;
  getStreamRecordingById(id: number): Promise<StreamRecording | undefined>;
  getRecordingsByLiveStreamId(liveStreamId: number): Promise<StreamRecording[]>;
  createStreamRecording(recording: InsertStreamRecording): Promise<StreamRecording>;
  updateStreamRecording(id: number, updateData: Partial<StreamRecording>): Promise<StreamRecording | null>;
  deleteStreamRecording(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private raffles: Map<number, Raffle>;
  private raffleEntries: Map<number, RaffleEntry>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private wishlistItems: Map<number, WishlistItem>;
  private wallets: Map<string, any>;
  private transactions: Map<number, any>;
  private teamMembers: Map<number, TeamMember>;
  private customerReviews: Map<number, CustomerReview>;

  private currentIds: {
    user: number;
    category: number;
    product: number;
    raffle: number;
    raffleEntry: number;
    cartItem: number;
    order: number;
    orderItem: number;
    wishlistItem: number;
    transaction: number;
    teamMember: number;
    customerReview: number;
  };

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.raffles = new Map();
    this.raffleEntries = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.wishlistItems = new Map();
    this.teamMembers = new Map();
    this.customerReviews = new Map();

    this.wallets = new Map();
    this.transactions = new Map();

    // Initialize demo wallet for the test user
    this.wallets.set("1747415026121", {
      userId: "1747415026121",
      balance: 500.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Add sample transactions for the test user
    this.transactions.set(1, {
      id: 1,
      userId: "1747415026121",
      type: "deposit",
      amount: 500.0,
      status: "completed",
      description: "Initial deposit",
      createdAt: new Date().toISOString(),
    });

    this.currentIds = {
      user: 1,
      category: 1,
      product: 1,
      raffle: 1,
      raffleEntry: 1,
      cartItem: 1,
      order: 1,
      orderItem: 1,
      wishlistItem: 1,
      transaction: 1,
      teamMember: 1,
      customerReview: 1,
    };

    // Initialize with sample data
    this.initializeSampleData();
  }

  // Initialize sample data for development
  // Wallet methods
  async getWallet(userId: string): Promise<any> {
    // First check if wallet exists
    if (this.wallets.has(userId)) {
      return this.wallets.get(userId);
    }

    // If not, create a new wallet with zero balance
    const wallet = {
      userId,
      balance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.wallets.set(userId, wallet);
    return wallet;
  }

  async updateWalletBalance(userId: string, amount: number): Promise<any> {
    // Get current wallet or create if it doesn't exist
    const wallet = await this.getWallet(userId);

    // Update balance
    wallet.balance = parseFloat((wallet.balance + amount).toFixed(2));
    wallet.updatedAt = new Date().toISOString();

    // Save updated wallet
    this.wallets.set(userId, wallet);

    return wallet;
  }

  async createTransaction(transaction: any): Promise<any> {
    const id = this.currentIds.transaction++;

    const newTransaction = {
      id,
      userId: transaction.userId,
      type: transaction.type,
      amount: parseFloat(transaction.amount),
      status: transaction.status || "pending",
      description: transaction.description || "",
      createdAt: new Date().toISOString(),
    };

    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async getTransactions(userId: string): Promise<any[]> {
    const userTransactions = Array.from(this.transactions.values())
      .filter((transaction) => transaction.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    return userTransactions;
  }

  private initializeSampleData() {
    // Add sample categories
    const furnitureCategory = this.createCategory({
      name: "Furniture",
      slug: "furniture",
      description: "Antique furniture from various periods",
      imageUrl:
        "https://pixabay.com/get/g23e0e0fbf5a0798ee7f96124ac9993f261754d9c3b2984126028a7114b8533cd2a26c2bf7dac15e0d4233c378344ed6e68509ef0021296f83eacf1740db250c5_1280.jpg",
    });

    const collectiblesCategory = this.createCategory({
      name: "Collectibles",
      slug: "collectibles",
      description: "Rare collectible items",
      imageUrl:
        "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000",
    });

    const jewelryCategory = this.createCategory({
      name: "Jewelry",
      slug: "jewelry",
      description: "Antique and vintage jewelry pieces",
      imageUrl:
        "https://pixabay.com/get/geced806a25b043f716ee11a596978e1d5e27f785d79226d077f80d1f08d1a84d717953f21fa38fce4b0fbc615250f6ad10c8292975fe3f5007369f83b0b80bfb_1280.jpg",
    });

    // Add sample products
    const deskProduct = this.createProduct({
      name: "Mahogany Writing Desk with Brass Accents",
      description:
        "A beautifully crafted Victorian writing desk in excellent condition",
      detailedDescription:
        "<p>This exquisite Victorian writing desk dates back to circa 1880. Crafted from solid mahogany with ornate brass hardware and accents, this piece showcases the finest craftsmanship of its era.</p><p>The desk features three drawers with original brass handles, a leather-inlaid writing surface, and subtle marquetry details along the edges. The warm patina that has developed over time adds to its character and authenticity.</p><p>This piece has been carefully restored by our master craftsmen to preserve its original character while ensuring its functionality for everyday use.</p>",
      price: 2850,
      categoryId: furnitureCategory.id,
      era: "Victorian, c. 1880",
      condition: "Excellent",
      materials: ["Mahogany", "Brass", "Leather"],
      dimensions: "W: 120cm, D: 60cm, H: 78cm",
      origin: "England",
      isFeatured: true,
      imageUrl:
        "https://pixabay.com/get/gc9fc334b48154198b7bd5d13132a2a3aa0f67d36591819a2e00af9b70d664c4ef86e319f6f1885218f8ab089b0062ff501fe48dbb8e4b003b5576ee9e1598eba_1280.jpg",
      stockQuantity: 1,
    });

    const necklaceProduct = this.createProduct({
      name: "Gold & Emerald Pendant Necklace",
      description: "An elegant Art Deco gold necklace with emerald pendant",
      price: 3400,
      categoryId: jewelryCategory.id,
      era: "Art Deco, c. 1925",
      condition: "Excellent",
      materials: ["18k Gold", "Emerald", "Diamond"],
      provenance:
        "<p>This necklace was originally owned by Lady Elizabeth Montgomery of the British aristocracy. It was commissioned from a renowned Parisian jeweler in 1925 and remained in the Montgomery family until 2010.</p><p>The piece comes with original documentation and a certificate of authenticity.</p>",
      imageUrl:
        "https://pixabay.com/get/gb1954defc9d58744d432b021202538ff036c54cc18ce0a53e67c625db7e9c804fcdeb7ec28204d564caccc675b63ab74266849f8cd7113ca7bb7c30e51cdb65f_1280.jpg",
      stockQuantity: 1,
    });

    const teaSetProduct = this.createProduct({
      name: "Royal Worcester Porcelain Tea Set",
      description: "A complete English porcelain tea service for six people",
      price: 1250,
      categoryId: collectiblesCategory.id,
      era: "English, c. 1910",
      condition: "Good",
      materials: ["Porcelain", "Gold Leaf"],
      isBestSeller: true,
      imageUrl:
        "https://images.unsplash.com/photo-1527359443443-84a48aec73d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=500",
      stockQuantity: 1,
    });

    const chandelierProduct = this.createProduct({
      name: "Crystal & Brass Chandelier",
      description:
        "A stunning French crystal and brass chandelier with eight arms",
      price: 4750,
      categoryId: furnitureCategory.id,
      era: "French, c. 1890",
      condition: "Very Good",
      materials: ["Crystal", "Brass"],
      dimensions: "H: 90cm, Diameter: 75cm",
      imageUrl:
        "https://images.unsplash.com/photo-1615529162924-f8605388461d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=500",
      stockQuantity: 1,
    });

    // Add sample users
    this.createUser({
      username: "johndoe",
      email: "john@example.com",
      password: "password123", // In a real app, this would be hashed
      firstName: "John",
      lastName: "Doe",
    });

    // Add sample raffles
    const commode = this.createProduct({
      name: "18th Century Louis XV Commode",
      description:
        "A rare French marquetry commode with original gilt bronze mounts, attributed to master cabinetmaker Jean-François Oeben.",
      price: 24500,
      categoryId: furnitureCategory.id,
      era: "Louis XV, c. 1760",
      condition: "Very Good",
      materials: ["Kingwood", "Rosewood", "Gilt Bronze"],
      dimensions: "W: 130cm, D: 65cm, H: 85cm",
      origin: "France",
      imageUrl:
        "https://pixabay.com/get/g30f58a22b38a226e727c209c2e5c6cfda39b7a18bd63b8cd212eb0b622de40e8b156b9a9182137bbc2d60150ecdbfb80795dc1b5b089643ebf70f5ad18c6e591_1280.jpg",
      stockQuantity: 1,
    });

    this.createRaffle({
      productId: commode.id,
      ticketPrice: 75,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      maxTickets: 500,
      status: "active",
    });

    // Add more sample raffles (upcoming and past)
    const mirrorProduct = this.createProduct({
      name: "Georgian Giltwood Mirror",
      description:
        "An exceptional George II giltwood mirror featuring elaborate rococo carving.",
      price: 18700,
      categoryId: furnitureCategory.id,
      era: "Georgian, c. 1750",
      condition: "Good",
      materials: ["Giltwood", "Mirror Glass"],
      dimensions: "H: 160cm, W: 90cm",
      origin: "England",
      imageUrl:
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=500",
      stockQuantity: 1,
    });

    const clockProduct = this.createProduct({
      name: "French Boulle Mantel Clock",
      description:
        "A Napoleon III boulle and gilt bronze mantel clock with intricate inlay work.",
      price: 9800,
      categoryId: collectiblesCategory.id,
      era: "Napoleon III, c. 1860",
      condition: "Excellent",
      materials: ["Tortoiseshell", "Brass", "Gilt Bronze"],
      dimensions: "H: 45cm, W: 25cm, D: 15cm",
      origin: "France",
      imageUrl:
        "https://images.unsplash.com/photo-1547127796-06bb04e4b315?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=500",
      stockQuantity: 1,
    });

    this.createRaffle({
      productId: mirrorProduct.id,
      ticketPrice: 60,
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
      maxTickets: 400,
      status: "upcoming",
    });

    const pastRaffle = this.createRaffle({
      productId: clockProduct.id,
      ticketPrice: 40,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      endDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
      maxTickets: 300,
      status: "completed",
    });

    // Set a winner for the past raffle
    const updatedRaffle = {
      ...pastRaffle,
      winnerId: 1,
      winningTicketNumber: 42,
    };
    this.raffles.set(pastRaffle.id, updatedRaffle);

    // Add sample cart items
    this.cartItems.set(1, {
      id: 1,
      userId: 1,
      productId: deskProduct.id,
      quantity: 1,
      type: "product",
      createdAt: new Date().toISOString(),
    });

    // Add sample auctions
    this.auctions.set(1, {
      id: 1,
      title: "Victorian Mahogany Writing Desk",
      description:
        "Exquisite 19th century mahogany writing desk with original brass hardware and leather inlay. This piece has been meticulously maintained and shows the craftsmanship of the Victorian era.",
      startingBid: "500.00",
      currentBid: "750.00",
      incrementAmount: "50.00",
      startTime: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
      status: "active",
      imageUrl: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4",
      isLive: true,
      streamUrl: null,
      winnerId: null,
    });

    this.auctions.set(2, {
      id: 2,
      title: "Art Deco Cocktail Cabinet",
      description:
        "Stunning 1930s Art Deco cocktail cabinet with mirrored interior and original chrome handles. Features adjustable shelving and fold-down serving area.",
      startingBid: "400.00",
      currentBid: "525.00",
      incrementAmount: "25.00",
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
      status: "active",
      imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace",
      isLive: false,
      streamUrl: null,
      winnerId: null,
    });

    this.auctions.set(3, {
      id: 3,
      title: "Georgian Silver Tea Service",
      description:
        "Complete Georgian silver tea service, London 1820, comprising teapot, sugar bowl, cream jug and waste bowl. All pieces hallmarked and in excellent condition.",
      startingBid: "1200.00",
      currentBid: null,
      incrementAmount: "100.00",
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
      status: "upcoming",
      imageUrl: "https://images.unsplash.com/photo-1615874694520-474822394e73",
      isLive: false,
      streamUrl: null,
      winnerId: null,
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = `user_${this.currentIds.user++}`;
    const user: User = {
      ...insertUser,
      id,
      role: "user",
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async authenticateUser(
    email: string,
    password: string,
  ): Promise<User | null> {
    // Regular user authentication
    const user = Array.from(this.users.values()).find(
      (user) => user.email === email,
    );

    if (user) {
      // In a real app, this would use bcrypt.compare
      return user;
    }

    return null;
  }

  // Category methods
  async getAllCategories(): Promise<CategoryType[]> {
    return Array.from(this.categories.values()).map((category) => ({
      id: category.id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl,
    }));
  }

  async getCategoryById(id: string): Promise<CategoryType | undefined> {
    const category = this.categories.get(parseInt(id));
    if (!category) return undefined;

    return {
      id: category.id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl,
    };
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentIds.category++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Product methods
  async getProducts(
    filters: any,
    page: number,
    pageSize: number,
    sort: string,
  ): Promise<{ products: ProductType[]; total: number }> {
    let filteredProducts = Array.from(this.products.values());

    // Apply filters
    if (filters.category) {
      const category = Array.from(this.categories.values()).find(
        (c) => c.slug === filters.category,
      );
      if (category) {
        filteredProducts = filteredProducts.filter(
          (p) => p.categoryId === category.id,
        );
      }
    }

    if (filters.era) {
      filteredProducts = filteredProducts.filter((p) =>
        p.era?.toLowerCase().includes(filters.era.toLowerCase()),
      );
    }

    if (filters.condition && filters.condition.length > 0) {
      filteredProducts = filteredProducts.filter((p) =>
        filters.condition.some((c: string) =>
          p.condition?.toLowerCase().includes(c.toLowerCase()),
        ),
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower),
      );
    }

    // Sort products
    switch (sort) {
      case "newest":
        filteredProducts.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case "price_low":
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case "alphabetical":
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "featured":
      default:
        // Sort featured first, then bestsellers
        filteredProducts.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          if (a.isBestSeller && !b.isBestSeller) return -1;
          if (!a.isBestSeller && b.isBestSeller) return 1;
          return 0;
        });
        break;
    }

    // Calculate pagination
    const total = filteredProducts.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedProducts = filteredProducts.slice(start, end);

    // Map to ProductType format with category info
    const productsWithCategory = await Promise.all(
      paginatedProducts.map(async (product) => {
        const category = await this.getCategoryById(product.categoryId!);
        return this.mapProductToProductType(product, category!);
      }),
    );

    return {
      products: productsWithCategory,
      total,
    };
  }

  async getProductById(id: string): Promise<ProductType | undefined> {
    const product = this.products.get(parseInt(id));
    if (!product) return undefined;

    const category = await this.getCategoryById(product.categoryId!);
    return this.mapProductToProductType(product, category!);
  }

  async getFeaturedProducts(): Promise<ProductType[]> {
    const featuredProducts = Array.from(this.products.values())
      .filter((p) => p.isFeatured || p.isBestSeller)
      .slice(0, 4);

    return Promise.all(
      featuredProducts.map(async (product) => {
        const category = await this.getCategoryById(product.categoryId!);
        return this.mapProductToProductType(product, category!);
      }),
    );
  }

  async getRelatedProducts(productId: string): Promise<ProductType[]> {
    const product = this.products.get(parseInt(productId));
    if (!product) return [];

    // Get products from the same category, excluding the current one
    const relatedProducts = Array.from(this.products.values())
      .filter((p) => p.id !== productId && p.categoryId === product.categoryId)
      .slice(0, 4);

    return Promise.all(
      relatedProducts.map(async (product) => {
        const category = await this.getCategoryById(product.categoryId!);
        return this.mapProductToProductType(product, category!);
      }),
    );
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentIds.product++;
    const newProduct: Product = {
      ...product,
      id,
      createdAt: new Date().toISOString(),
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  // Helper to map DB Product to ProductType
  private mapProductToProductType(
    product: Product,
    category: CategoryType,
  ): ProductType {
    return {
      id: product.id.toString(),
      name: product.name,
      description: product.description,
      detailedDescription: product.detailedDescription,
      price: product.price,
      originalPrice: product.originalPrice,
      category: category,
      era: product.era || "",
      condition: product.condition || "",
      materials: product.materials || [],
      dimensions: product.dimensions,
      origin: product.origin,
      isFeatured: product.isFeatured || false,
      isBestSeller: product.isBestSeller || false,
      imageUrl: product.imageUrl,
      additionalImages: product.additionalImages,
      provenance: product.provenance,
      inStock: product.inStock,
      stockQuantity: product.stockQuantity,
      createdAt: product.createdAt,
    };
  }

  // Raffle methods
  async getFeaturedRaffle(): Promise<RaffleType | undefined> {
    const activeRaffles = Array.from(this.raffles.values())
      .filter((r) => r.status === "active")
      .sort(
        (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
      );

    if (activeRaffles.length === 0) return undefined;

    const featuredRaffle = activeRaffles[0];
    return this.mapRaffleToRaffleType(featuredRaffle);
  }

  async getActiveRaffles(): Promise<RaffleType[]> {
    const activeRaffles = Array.from(this.raffles.values()).filter(
      (r) => r.status === "active",
    );

    return Promise.all(
      activeRaffles.map((raffle) => this.mapRaffleToRaffleType(raffle)),
    );
  }

  async getUpcomingRaffles(): Promise<RaffleType[]> {
    const upcomingRaffles = Array.from(this.raffles.values()).filter(
      (r) => r.status === "upcoming",
    );

    return Promise.all(
      upcomingRaffles.map((raffle) => this.mapRaffleToRaffleType(raffle)),
    );
  }

  async getPastRaffles(): Promise<RaffleType[]> {
    const pastRaffles = Array.from(this.raffles.values()).filter(
      (r) => r.status === "completed",
    );

    return Promise.all(
      pastRaffles.map((raffle) => this.mapRaffleToRaffleType(raffle)),
    );
  }

  async createRaffle(raffle: InsertRaffle): Promise<Raffle> {
    const id = this.currentIds.raffle++;
    const newRaffle: Raffle = {
      ...raffle,
      id,
      ticketsSold: 0,
      createdAt: new Date().toISOString(),
    };
    this.raffles.set(id, newRaffle);
    return newRaffle;
  }

  async enterRaffle(entry: InsertRaffleEntry): Promise<RaffleEntry> {
    const raffle = this.raffles.get(entry.raffleId);
    if (!raffle) {
      throw new Error("Raffle not found");
    }

    // Generate sequential ticket numbers
    const startTicketNum = raffle.ticketsSold + 1;
    const ticketNumbers = Array.from(
      { length: entry.ticketCount },
      (_, i) => startTicketNum + i,
    );

    // Update raffle with new ticket count
    const updatedRaffle = {
      ...raffle,
      ticketsSold: raffle.ticketsSold + entry.ticketCount,
    };
    this.raffles.set(raffle.id, updatedRaffle);

    // Create raffle entry
    const id = this.currentIds.raffleEntry++;
    const newEntry: RaffleEntry = {
      ...entry,
      id,
      ticketNumbers,
      createdAt: new Date().toISOString(),
    };
    this.raffleEntries.set(id, newEntry);

    return newEntry;
  }

  // Helper to map DB Raffle to RaffleType
  private async mapRaffleToRaffleType(raffle: Raffle): Promise<RaffleType> {
    const product = this.products.get(raffle.productId);
    let winner = undefined;

    if (raffle.winnerId && raffle.winningTicketNumber) {
      const winnerUser = this.users.get(raffle.winnerId);
      if (winnerUser) {
        winner = {
          id: winnerUser.id.toString(),
          name:
            `${winnerUser.firstName || ""} ${winnerUser.lastName || ""}`.trim() ||
            winnerUser.username,
          ticketNumber: raffle.winningTicketNumber,
        };
      }
    }

    return {
      id: raffle.id.toString(),
      item: {
        id: product!.id.toString(),
        name: product!.name,
        description: product!.description,
        retailPrice: product!.price,
        imageUrl: product!.imageUrl,
      },
      ticketPrice: raffle.ticketPrice,
      startDate: raffle.startDate,
      endDate: raffle.endDate,
      maxTickets: raffle.maxTickets,
      ticketsSold: raffle.ticketsSold,
      status: raffle.status as "active" | "upcoming" | "completed",
      winner,
    };
  }

  // Cart methods
  async getCart(
    userId: string,
  ): Promise<{
    items: any[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    discount: number;
  }> {
    const userCartItems = Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId,
    );

    const cartItems = await Promise.all(
      userCartItems.map(async (item) => {
        if (item.type === "product" && item.productId) {
          const product = this.products.get(item.productId);
          if (!product) return null;

          return {
            id: item.id.toString(),
            product: {
              id: product.id.toString(),
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
              era: product.era || "",
            },
            quantity: item.quantity,
            subtotal: product.price * item.quantity,
            type: "product",
          };
        } else if (item.type === "raffle_ticket" && item.raffleId) {
          const raffle = this.raffles.get(item.raffleId);
          if (!raffle) return null;

          const product = this.products.get(raffle.productId);

          return {
            id: item.id.toString(),
            product: {
              id: product!.id.toString(),
              name: `Raffle Tickets: ${product!.name}`,
              price: raffle.ticketPrice,
              imageUrl: product!.imageUrl,
              era: "Raffle Ticket",
            },
            quantity: item.quantity,
            subtotal: raffle.ticketPrice * item.quantity,
            type: "raffle_ticket",
            raffleId: raffle.id.toString(),
          };
        }

        return null;
      }),
    );

    // Filter out nulls
    const validCartItems = cartItems.filter((item) => item !== null) as any[];

    // Calculate totals
    const subtotal = validCartItems.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );
    const shipping = 0; // NO SHIPPING - digital items only
    const discount = 0; // No discount by default
    const tax = 0; // NO TAX - business decision
    const total = subtotal; // Only subtotal, no additional charges

    return {
      items: validCartItems,
      subtotal,
      shipping,
      tax,
      discount,
      total,
    };
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      (cartItem) =>
        cartItem.userId === item.userId &&
        cartItem.type === item.type &&
        ((item.type === "product" && cartItem.productId === item.productId) ||
          (item.type === "raffle_ticket" &&
            cartItem.raffleId === item.raffleId)),
    );

    if (existingItem) {
      // Update quantity instead of creating new item
      const updatedItem = {
        ...existingItem,
        quantity: existingItem.quantity + item.quantity,
      };
      this.cartItems.set(existingItem.id, updatedItem);
      return updatedItem;
    }

    // Create new cart item
    const id = this.currentIds.cartItem++;
    const newCartItem: CartItem = {
      ...item,
      id,
      createdAt: new Date().toISOString(),
    };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }

  async updateCartItemQuantity(
    userId: string,
    itemId: number,
    quantity: number,
  ): Promise<boolean> {
    const cartItem = this.cartItems.get(itemId);
    if (!cartItem || cartItem.userId !== userId) return false;

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      return this.removeFromCart(userId, itemId);
    }

    const updatedItem = { ...cartItem, quantity };
    this.cartItems.set(itemId, updatedItem);
    return true;
  }

  async removeFromCart(userId: string, itemId: number): Promise<boolean> {
    const cartItem = this.cartItems.get(itemId);
    if (!cartItem || cartItem.userId !== userId) return false;

    this.cartItems.delete(itemId);
    return true;
  }

  async clearCart(userId: string): Promise<boolean> {
    const cartItemsToRemove = Array.from(this.cartItems.values())
      .filter(item => item.userId === userId)
      .map(item => item.id);
    
    cartItemsToRemove.forEach(id => this.cartItems.delete(id));
    return true;
  }

  async applyPromoCode(userId: string, code: string): Promise<boolean> {
    // In a real app, this would validate the promo code against a database
    const validPromoCodes = ["WELCOME10", "ANTIQUE25", "SUMMER15"];
    return validPromoCodes.includes(code);
  }

  // Wishlist methods
  async getWishlist(userId: string): Promise<any[]> {
    const userWishlistItems = Array.from(this.wishlistItems.values()).filter(
      (item) => item.userId === userId,
    );

    return Promise.all(
      userWishlistItems.map(async (item) => {
        const product = this.products.get(item.productId);
        if (!product) return null;

        const category = await this.getCategoryById(product.categoryId!);
        const productData = this.mapProductToProductType(product, category!);

        return {
          id: item.id.toString(),
          productId: product.id.toString(),
          userId: item.userId,
          addedAt: item.addedAt,
          product: productData,
        };
      }),
    );
  }

  async addToWishlist(
    userId: string,
    productId: number,
  ): Promise<WishlistItem> {
    // Check if already in wishlist
    const existingItem = Array.from(this.wishlistItems.values()).find(
      (item) => item.userId === userId && item.productId === productId,
    );

    if (existingItem) {
      return existingItem;
    }

    // Create new wishlist item
    const id = this.currentIds.wishlistItem++;
    const newWishlistItem: WishlistItem = {
      id,
      userId,
      productId,
      addedAt: new Date().toISOString(),
    };
    this.wishlistItems.set(id, newWishlistItem);
    return newWishlistItem;
  }

  async removeFromWishlist(userId: string, itemId: number): Promise<boolean> {
    const wishlistItem = this.wishlistItems.get(itemId);
    if (!wishlistItem || wishlistItem.userId !== userId) return false;

    this.wishlistItems.delete(itemId);
    return true;
  }

  // Order methods
  async createOrder(
    order: InsertOrder,
    items: InsertOrderItem[],
  ): Promise<Order> {
    const id = this.currentIds.order++;
    const newOrder: Order = {
      ...order,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.orders.set(id, newOrder);

    // Create order items
    items.forEach((item) => {
      const orderItemId = this.currentIds.orderItem++;
      const orderItem: OrderItem = {
        ...item,
        id: orderItemId,
        orderId: id,
      };
      this.orderItems.set(orderItemId, orderItem);
    });

    // Clear user's cart
    Array.from(this.cartItems.values())
      .filter((item) => item.userId === order.userId)
      .forEach((item) => this.cartItems.delete(item.id));

    return newOrder;
  }

  async getOrdersByUserId(userId: string): Promise<any[]> {
    const userOrders = Array.from(this.orders.values()).filter(
      (order) => order.userId === userId,
    );

    return Promise.all(
      userOrders.map(async (order) => {
        const orderItems = Array.from(this.orderItems.values()).filter(
          (item) => item.orderId === order.id,
        );

        return {
          ...order,
          items: orderItems,
        };
      }),
    );
  }

  async getOrderById(id: string): Promise<any | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const orderItems = Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === id,
    );

    return {
      ...order,
      items: orderItems,
    };
  }

  // Auction methods
  async getAuctions(status: string): Promise<any[]> {
    return Array.from(this.auctions.values()).filter(
      (auction) => auction.status === status,
    );
  }

  async getAuctionById(id: number): Promise<any | undefined> {
    return this.auctions.get(id);
  }

  // Team Member methods
  async getAllTeamMembers(): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values()).sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getActiveTeamMembers(): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values())
      .filter(member => member.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getTeamMemberById(id: number): Promise<TeamMember | undefined> {
    return this.teamMembers.get(id);
  }

  async createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember> {
    const id = this.currentIds.teamMember++;
    const newTeamMember: TeamMember = {
      id,
      ...teamMember,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.teamMembers.set(id, newTeamMember);
    return newTeamMember;
  }

  async updateTeamMember(id: number, updateData: Partial<TeamMember>): Promise<TeamMember | null> {
    const existingMember = this.teamMembers.get(id);
    if (!existingMember) return null;

    const updatedMember: TeamMember = {
      ...existingMember,
      ...updateData,
      id, // Ensure ID doesn't change
      updatedAt: new Date(),
    };
    this.teamMembers.set(id, updatedMember);
    return updatedMember;
  }

  async deleteTeamMember(id: number): Promise<boolean> {
    return this.teamMembers.delete(id);
  }

  // Customer Review methods
  async getAllCustomerReviews(): Promise<CustomerReview[]> {
    return Array.from(this.customerReviews.values()).sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getActiveCustomerReviews(): Promise<CustomerReview[]> {
    return Array.from(this.customerReviews.values())
      .filter(review => review.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getCustomerReviewById(id: number): Promise<CustomerReview | undefined> {
    return this.customerReviews.get(id);
  }

  async createCustomerReview(review: InsertCustomerReview): Promise<CustomerReview> {
    const id = this.currentIds.customerReview++;
    const newReview: CustomerReview = {
      id,
      ...review,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.customerReviews.set(id, newReview);
    return newReview;
  }

  async updateCustomerReview(id: number, updateData: Partial<CustomerReview>): Promise<CustomerReview | null> {
    const existingReview = this.customerReviews.get(id);
    if (!existingReview) return null;

    const updatedReview: CustomerReview = {
      ...existingReview,
      ...updateData,
      id, // Ensure ID doesn't change
      updatedAt: new Date(),
    };
    this.customerReviews.set(id, updatedReview);
    return updatedReview;
  }

  async deleteCustomerReview(id: number): Promise<boolean> {
    return this.customerReviews.delete(id);
  }

  // Gallery Image methods (stub implementations - DB storage is used)
  async getAllGalleryImages(): Promise<GalleryImage[]> {
    return [];
  }

  async getActiveGalleryImages(): Promise<GalleryImage[]> {
    return [];
  }

  async getGalleryImageById(id: number): Promise<GalleryImage | undefined> {
    return undefined;
  }

  async createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    throw new Error("Not implemented - use DatabaseStorage");
  }

  async updateGalleryImage(id: number, updateData: Partial<GalleryImage>): Promise<GalleryImage | null> {
    return null;
  }

  async deleteGalleryImage(id: number): Promise<boolean> {
    return false;
  }

  // Calendar Event methods (stub implementations - DB storage is used)
  async getAllCalendarEvents(): Promise<CalendarEvent[]> {
    return [];
  }

  async getActiveCalendarEvents(): Promise<CalendarEvent[]> {
    return [];
  }

  async getCalendarEventById(id: number): Promise<CalendarEvent | undefined> {
    return undefined;
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    throw new Error("Not implemented - use DatabaseStorage");
  }

  async updateCalendarEvent(id: number, updateData: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    return null;
  }

  async deleteCalendarEvent(id: number): Promise<boolean> {
    return false;
  }

  // Auction Highlight methods (stub implementations - DB storage is used)
  async getAllAuctionHighlights(): Promise<AuctionHighlight[]> {
    return [];
  }

  async getActiveAuctionHighlights(): Promise<AuctionHighlight[]> {
    return [];
  }

  async getAuctionHighlightById(id: number): Promise<AuctionHighlight | undefined> {
    return undefined;
  }

  async createAuctionHighlight(highlight: InsertAuctionHighlight): Promise<AuctionHighlight> {
    throw new Error("Not implemented - use DatabaseStorage");
  }

  async updateAuctionHighlight(id: number, updateData: Partial<AuctionHighlight>): Promise<AuctionHighlight | null> {
    return null;
  }

  async deleteAuctionHighlight(id: number): Promise<boolean> {
    return false;
  }
}

// Use Database Storage instead of MemStorage for persistence
import { DatabaseStorage } from "./storage-db";
export const storage = new DatabaseStorage();
