import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  decimal,
  json,
  serial,
  uniqueIndex,
  foreignKey,
  uuid,
  primaryKey,
  jsonb,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  username: varchar("username").unique(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  mobile: varchar("mobile").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user").notNull(),
  emailVerified: boolean("email_verified").default(false),
  emailMarketingConsent: boolean("email_marketing_consent").default(false),
  emailMarketingConsentDate: timestamp("email_marketing_consent_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Environmental Impact Tracking
export const environmentalImpact = pgTable("environmental_impact", {
  id: serial("id").primaryKey(),
  totalItemsCollected: integer("total_items_collected").default(0),
  totalTonnesDiverted: decimal("total_tonnes_diverted", { precision: 10, scale: 2 }).default("0"),
  treesEquivalentSaved: integer("trees_equivalent_saved").default(0),
  yearlyTarget: decimal("yearly_target", { precision: 10, scale: 2 }).default("150"),
  currentProgress: decimal("current_progress", { precision: 10, scale: 2 }).default("0"),
  progressPercentage: decimal("progress_percentage", { precision: 5, scale: 2 }).default("0"),
  wasteBreakdown: jsonb("waste_breakdown").$type<{
    fridgeCollected: number;
    tvElectronics: number;
    mixedWaste: number;
    woodMaterials: number;
    paperWaste: number;
    cardboard: number;
    ceramicRubble: number;
    textiles: number;
  }>().default({
    fridgeCollected: 0,
    tvElectronics: 0,
    mixedWaste: 0,
    woodMaterials: 0,
    paperWaste: 0,
    cardboard: 0,
    ceramicRubble: 0,
    textiles: 0
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team Members
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  about: text("about").notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  mobile: true,
  profileImageUrl: true,
  role: true,
});

export const insertEnvironmentalImpactSchema = createInsertSchema(environmentalImpact);
export type InsertEnvironmentalImpact = z.infer<typeof insertEnvironmentalImpactSchema>;
export type EnvironmentalImpact = typeof environmentalImpact.$inferSelect;

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

// Customer Reviews
export const customerReviews = pgTable("customer_reviews", {
  id: serial("id").primaryKey(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  platform: varchar("platform", { length: 100 }).notNull(),
  rating: integer("rating").notNull(),
  reviewText: text("review_text").notNull(),
  reviewDate: timestamp("review_date").notNull(),
  location: varchar("location", { length: 255 }),
  serviceType: varchar("service_type", { length: 255 }),
  platformUrl: varchar("platform_url", { length: 500 }),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCustomerReviewSchema = createInsertSchema(customerReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCustomerReview = z.infer<typeof insertCustomerReviewSchema>;
export type CustomerReview = typeof customerReviews.$inferSelect;

// Gallery Images for homepage carousel
export const galleryImages = pgTable("gallery_images", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  estimate: varchar("estimate", { length: 100 }),
  soldPrice: varchar("sold_price", { length: 100 }),
  imageUrl: text("image_url").notNull(),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGalleryImageSchema = createInsertSchema(galleryImages).omit({
  id: true,
  createdAt: true,
});
export type InsertGalleryImage = z.infer<typeof insertGalleryImageSchema>;
export type GalleryImage = typeof galleryImages.$inferSelect;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  mobile: z.string()
    .min(10, "Mobile number must be at least 10 digits")
    .max(15, "Mobile number must be no more than 15 digits")
    .regex(/^[\+]?[\d\s\-\(\)]+$/, "Please enter a valid mobile number"),
  ageVerified: z.boolean().refine((val) => val === true, {
    message: "You must confirm that you are 18 years or older to create an account",
  }),
  emailMarketingConsent: z.boolean().optional().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;

// Withdrawals table for instant win prize withdrawals
export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  withdrawalMethod: varchar("withdrawal_method").notNull(),
  withdrawalDetails: jsonb("withdrawal_details"),
  status: varchar("status").default("pending").notNull(),
  instantWinIds: integer("instant_win_ids").array().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  transactionId: varchar("transaction_id"),
  notes: text("notes"),
});

export const insertWithdrawalSchema = createInsertSchema(withdrawals).pick({
  userId: true,
  amount: true,
  withdrawalMethod: true,
  withdrawalDetails: true,
  instantWinIds: true,
  notes: true,
});

export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;

// Session storage table — required for express-session PostgreSQL store
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Product categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
  featured: true,
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

// Products (antiques)
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  detailedDescription: text("detailed_description"),
  sku: varchar("sku").unique(),
  vendorNumber: varchar("vendor_number"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  era: varchar("era").notNull(),
  condition: varchar("condition").notNull(),
  materials: text("materials").array(),
  dimensions: varchar("dimensions"),
  origin: varchar("origin"),
  isFeatured: boolean("is_featured").default(false),
  isBestSeller: boolean("is_bestseller").default(false),
  imageUrl: varchar("image_url").notNull(),
  additionalImages: text("additional_images").array(),
  provenance: text("provenance"),
  inStock: boolean("in_stock").default(true),
  stockQuantity: integer("stock_quantity").default(1),
  status: varchar("status").default("published"),
  weightGrams: integer("weight_grams").default(0),
  parcelType: varchar("parcel_type").default("small_parcel"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  detailedDescription: z.string().optional(),
  sku: z.string().optional(),
  vendorNumber: z.string().optional(),
  price: z.string().min(1),
  originalPrice: z.string().optional(),
  categoryId: z.union([z.string(), z.number()]).transform(val =>
    typeof val === 'string' ? parseInt(val) : val
  ).optional(),
  categoryIds: z.union([
    z.string().transform(s => s.split(',').map(item => parseInt(item.trim())).filter(Boolean)),
    z.array(z.union([z.string(), z.number()])).transform(arr =>
      arr.map(val => typeof val === 'string' ? parseInt(val) : val)
    ),
    z.number().transform(n => [n])
  ]).optional(),
  era: z.string().min(1),
  condition: z.string().min(1),
  materials: z.union([
    z.string().transform(s => s.split(',').map(item => item.trim())),
    z.array(z.string())
  ]).optional(),
  dimensions: z.string().optional(),
  origin: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  imageUrl: z.string().min(1),
  additionalImages: z.union([
    z.string().transform(s => s.split(',').map(item => item.trim())),
    z.array(z.string())
  ]).optional(),
  provenance: z.string().optional(),
  inStock: z.boolean().default(true),
  stockQuantity: z.union([z.string(), z.number()]).transform(val =>
    typeof val === 'string' ? parseInt(val) : val
  ),
  status: z.enum(['draft', 'published']).default('published'),
  weightGrams: z.union([z.string(), z.number()]).transform(val =>
    typeof val === 'string' ? parseInt(val) || 0 : val
  ).default(0),
  parcelType: z.enum(['letter', 'large_letter', 'small_parcel', 'medium_parcel', 'large_parcel']).default('small_parcel'),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// Raffles
export const raffles = pgTable("raffles", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  excerpt: varchar("excerpt", { length: 200 }),
  itemDescription: text("item_description").notNull(),
  retailPrice: decimal("retail_price", { precision: 10, scale: 2 }).notNull(),
  ticketPrice: decimal("ticket_price", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  maxTickets: integer("max_tickets").notNull(),
  ticketsSold: integer("tickets_sold").default(0),
  status: varchar("status").notNull().default("active"),
  imageUrl: varchar("image_url").notNull(),
  additionalImages: varchar("additional_images").array(),
  winnerId: varchar("winner_id").references(() => users.id),
  winningTicketNumber: integer("winning_ticket_number"),
  instantWinEnabled: boolean("instant_win_enabled").default(false),
  instantWinCount: integer("instant_win_count").default(0),
  instantWinAmount: decimal("instant_win_amount", { precision: 10, scale: 2 }).default("5"),
  instantWinNumbers: integer("instant_win_numbers").array(),
  instantWinTitle: varchar("instant_win_title"),
  instantWinPrizeType: varchar("instant_win_prize_type").default("cash"),
  instantWinPrizes: jsonb("instant_win_prizes"),
  isFeatured: boolean("is_featured").default(false),
  socialSharingEnabled: boolean("social_sharing_enabled").default(false),
  socialSharingRewards: jsonb("social_sharing_rewards").default('[]'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRaffleSchema = createInsertSchema(raffles).pick({
  name: true,
  description: true,
  excerpt: true,
  itemDescription: true,
  retailPrice: true,
  ticketPrice: true,
  startDate: true,
  endDate: true,
  maxTickets: true,
  status: true,
  imageUrl: true,
  additionalImages: true,
  instantWinEnabled: true,
  instantWinCount: true,
  instantWinAmount: true,
  instantWinPrizes: true,
  isFeatured: true,
  socialSharingEnabled: true,
  socialSharingRewards: true,
});

export type Raffle = typeof raffles.$inferSelect;
export type InsertRaffle = z.infer<typeof insertRaffleSchema>;

// Raffle entries
export const raffleEntries = pgTable("raffle_entries", {
  id: serial("id").primaryKey(),
  raffleId: integer("raffle_id")
    .notNull()
    .references(() => raffles.id),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  ticketCount: integer("ticket_count").notNull(),
  ticketNumbers: integer("ticket_numbers").array().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRaffleEntrySchema = createInsertSchema(raffleEntries).pick({
  raffleId: true,
  userId: true,
  ticketCount: true,
  ticketNumbers: true,
});

export type RaffleEntry = typeof raffleEntries.$inferSelect;
export type InsertRaffleEntry = z.infer<typeof insertRaffleEntrySchema>;

// Instant win table to track winners
export const instantWinners = pgTable("instant_winners", {
  id: serial("id").primaryKey(),
  raffleId: integer("raffle_id")
    .notNull()
    .references(() => raffles.id),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  ticketNumber: integer("ticket_number").notNull(),
  prizeAmount: decimal("prize_amount", { precision: 10, scale: 2 }),
  prizeType: varchar("prize_type").default("cash"),
  claimed: boolean("claimed").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInstantWinnerSchema = createInsertSchema(instantWinners).pick({
  raffleId: true,
  userId: true,
  ticketNumber: true,
  prizeAmount: true,
  prizeType: true,
  claimed: true,
});

export type InstantWinner = typeof instantWinners.$inferSelect;
export type InsertInstantWinner = z.infer<typeof insertInstantWinnerSchema>;

// Cart items
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  raffleId: integer("raffle_id")
    .references(() => raffles.id),
  productId: integer("product_id")
    .references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  type: varchar("type").notNull().default("raffle_ticket"),
  shippingMethod: varchar("shipping_method"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  userId: true,
  raffleId: true,
  productId: true,
  quantity: true,
  type: true,
  shippingMethod: true,
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

// Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id")
    .references(() => users.id),
  status: varchar("status").notNull().default("pending"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  shipping: decimal("shipping", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: json("shipping_address").notNull(),
  billingAddress: json("billing_address").notNull(),
  paymentMethod: varchar("payment_method").notNull(),
  paymentStatus: varchar("payment_status").notNull().default("pending"),
  paytriotPaymentId: varchar("paytriot_payment_id"),
  deliveryPostcode: varchar("delivery_postcode"),
  deliveryDistance: decimal("delivery_distance", { precision: 10, scale: 2 }),
  deliveryCost: decimal("delivery_cost", { precision: 10, scale: 2 }),
  trackingNumber: varchar("tracking_number"),
  carrier: varchar("carrier"),
  estimatedDelivery: timestamp("estimated_delivery"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  cryptoTransactionHash: varchar("crypto_transaction_hash"),
  cryptoConfirmedAt: timestamp("crypto_confirmed_at"),
  cryptoAmount: varchar("crypto_amount"),
  cryptoWalletAddress: varchar("crypto_wallet_address"),
  fulfillmentMethod: varchar("fulfillment_method").default("delivery"),
  collectionDate: timestamp("collection_date"),
  collectionTimeSlot: varchar("collection_time_slot"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  status: true,
  subtotal: true,
  shipping: true,
  tax: true,
  discount: true,
  total: true,
  shippingAddress: true,
  billingAddress: true,
  paymentMethod: true,
  paymentStatus: true,
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Order items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: varchar("order_id")
    .notNull()
    .references(() => orders.id),
  productId: integer("product_id").references(() => products.id),
  raffleId: integer("raffle_id").references(() => raffles.id),
  name: varchar("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  type: varchar("type").notNull().default("product"),
  shippingMethod: varchar("shipping_method"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  raffleId: true,
  name: true,
  price: true,
  quantity: true,
  type: true,
  shippingMethod: true,
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// Wishlist items
export const wishlistItems = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  addedAt: timestamp("added_at").defaultNow(),
});

export const insertWishlistItemSchema = createInsertSchema(wishlistItems).pick({
  userId: true,
  productId: true,
});

export type WishlistItem = typeof wishlistItems.$inferSelect;
export type InsertWishlistItem = z.infer<typeof insertWishlistItemSchema>;

// User Item Submissions
export const itemSubmissions = pgTable("item_submissions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  type: varchar("type").notNull(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  condition: varchar("condition"),
  era: varchar("era"),
  estimatedValue: decimal("estimated_value", { precision: 10, scale: 2 }),
  askingPrice: decimal("asking_price", { precision: 10, scale: 2 }),
  materials: text("materials").array(),
  dimensions: varchar("dimensions"),
  origin: varchar("origin"),
  provenance: text("provenance"),
  photos: text("photos").array(),
  status: varchar("status").notNull().default("pending"),
  adminFeedback: text("admin_feedback"),
  adminValuation: decimal("admin_valuation", { precision: 10, scale: 2 }),
  offerAmount: decimal("offer_amount", { precision: 10, scale: 2 }),
  negotiationStatus: varchar("negotiation_status"),
  currentOffer: decimal("current_offer", { precision: 10, scale: 2 }),
  userCounterOffer: decimal("user_counter_offer", { precision: 10, scale: 2 }),
  adminCounterOffer: decimal("admin_counter_offer", { precision: 10, scale: 2 }),
  userResponse: text("user_response"),
  shippingInstructions: text("shipping_instructions"),
  bankTransferInstructions: text("bank_transfer_instructions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertItemSubmissionSchema = createInsertSchema(itemSubmissions).pick({
  userId: true,
  type: true,
  title: true,
  description: true,
  condition: true,
  photos: true,
  era: true,
  estimatedValue: true,
  askingPrice: true,
  materials: true,
  dimensions: true,
  origin: true,
  provenance: true
});

export type ItemSubmission = typeof itemSubmissions.$inferSelect;
export type InsertItemSubmission = z.infer<typeof insertItemSubmissionSchema>;

// Clearance Success Stories
export const clearanceStories = pgTable("clearance_stories", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  amountSaved: varchar("amount_saved"),
  wasteDiverted: varchar("waste_diverted"),
  imageUrl: varchar("image_url"),
  beforeImageUrl: varchar("before_image_url"),
  afterImageUrl: varchar("after_image_url"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertClearanceStorySchema = createInsertSchema(clearanceStories).pick({
  title: true,
  description: true,
  amountSaved: true,
  wasteDiverted: true,
  imageUrl: true,
  beforeImageUrl: true,
  afterImageUrl: true,
  isActive: true,
  sortOrder: true,
});

export type ClearanceStory = typeof clearanceStories.$inferSelect;
export type InsertClearanceStory = z.infer<typeof insertClearanceStorySchema>;

// Clearance Quote Requests
export const clearanceQuotes = pgTable("clearance_quotes", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  address: text("address"),
  propertyType: varchar("property_type"),
  clearanceType: varchar("clearance_type"),
  timeframe: varchar("timeframe"),
  additionalInfo: text("additional_info"),
  imageUrls: text("image_urls").array(),
  status: varchar("status").default("pending").notNull(),
  requestType: varchar("request_type").default("clearance").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertClearanceQuoteSchema = createInsertSchema(clearanceQuotes).pick({
  name: true,
  email: true,
  phone: true,
  address: true,
  propertyType: true,
  clearanceType: true,
  timeframe: true,
  additionalInfo: true,
  imageUrls: true,
  requestType: true,
});

export type ClearanceQuote = typeof clearanceQuotes.$inferSelect;
export type InsertClearanceQuote = z.infer<typeof insertClearanceQuoteSchema>;

// Before and After Posts
export const beforeAfterPosts = pgTable("before_after_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  beforeImageUrls: text("before_image_urls").array().notNull(),
  afterImageUrls: text("after_image_urls").array().notNull(),
  category: varchar("category").default("general"),
  location: varchar("location"),
  featured: boolean("featured").default(false),
  published: boolean("published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBeforeAfterPostSchema = createInsertSchema(beforeAfterPosts).pick({
  title: true,
  description: true,
  beforeImageUrls: true,
  afterImageUrls: true,
  category: true,
  location: true,
  featured: true,
  published: true,
});

export type BeforeAfterPost = typeof beforeAfterPosts.$inferSelect;
export type InsertBeforeAfterPost = z.infer<typeof insertBeforeAfterPostSchema>;

// Auction Catalogues
export const auctionCatalogues = pgTable("auction_catalogs", {
  id: varchar("id").primaryKey().notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: varchar("status").notNull().default("draft"),
  imageUrl: varchar("image_url"),
  viewingStartDate: timestamp("viewing_start_date"),
  viewingEndDate: timestamp("viewing_end_date"),
  location: varchar("location"),
  auctionType: varchar("auction_type"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAuctionCatalogueSchema = createInsertSchema(auctionCatalogues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  startDate: z.string().or(z.date()),
  endDate: z.string().optional().or(z.date().optional()),
  viewingStartDate: z.string().optional().or(z.date().optional()),
  viewingEndDate: z.string().optional().or(z.date().optional()),
});

export const updateAuctionCatalogueSchema = insertAuctionCatalogueSchema.partial();

export type AuctionCatalogue = typeof auctionCatalogues.$inferSelect;
export type InsertAuctionCatalogue = z.infer<typeof insertAuctionCatalogueSchema>;
export type UpdateAuctionCatalogue = z.infer<typeof updateAuctionCatalogueSchema>;

// Auction Lots
export const auctionLots = pgTable("auction_lots", {
  id: varchar("id").primaryKey().notNull(),
  catalogId: varchar("catalog_id")
    .notNull()
    .references(() => auctionCatalogues.id, { onDelete: "cascade" }),
  lotNumber: integer("lot_number").notNull(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  currentBid: decimal("current_bid", { precision: 10, scale: 2 }),
  condition: varchar("condition"),
  era: varchar("era"),
  materials: text("materials").array(),
  dimensions: varchar("dimensions"),
  origin: varchar("origin"),
  provenance: text("provenance"),
  imageUrl: varchar("image_url").notNull(),
  additionalImages: text("additional_images").array(),
  status: varchar("status").notNull().default("available"),
  winnerId: varchar("winner_id"),
  hammerPrice: decimal("hammer_price", { precision: 10, scale: 2 }),
  totalBids: integer("total_bids").default(0),
  watchCount: integer("watch_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  estimatedShipping: decimal("estimated_shipping", { precision: 10, scale: 2 }),
  estimatedValueLow: decimal("estimated_value_low", { precision: 10, scale: 2 }),
  estimatedValueHigh: decimal("estimated_value_high", { precision: 10, scale: 2 }),
  shippingBand: varchar("shipping_band"),
});

export const insertAuctionLotSchema = createInsertSchema(auctionLots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  lotNumber: z.string().or(z.number()),
  estimatedValueLow: z.string().optional().or(z.number().optional()),
  estimatedValueHigh: z.string().optional().or(z.number().optional()),
});

export const updateAuctionLotSchema = insertAuctionLotSchema.partial();

export type AuctionLot = typeof auctionLots.$inferSelect;
export type InsertAuctionLot = z.infer<typeof insertAuctionLotSchema>;
export type UpdateAuctionLot = z.infer<typeof updateAuctionLotSchema>;

// Auction Bids
export const auctionBids = pgTable("auction_bids", {
  id: varchar("id").primaryKey(),
  lotId: varchar("lot_id")
    .notNull()
    .references(() => auctionLots.id, { onDelete: "cascade" }),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  bidAmount: decimal("bid_amount", { precision: 10, scale: 2 }).notNull(),
  maxBid: decimal("max_bid", { precision: 10, scale: 2 }),
  bidType: varchar("bid_type"),
  status: varchar("status").notNull().default("active"),
  isWinning: boolean("is_winning").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAuctionBidSchema = createInsertSchema(auctionBids).omit({
  id: true,
  createdAt: true,
});

export type AuctionBid = typeof auctionBids.$inferSelect;
export type InsertAuctionBid = z.infer<typeof insertAuctionBidSchema>;

// Auction Wishlist
export const auctionWishlist = pgTable("auction_wishlist", {
  id: serial("id").primaryKey(),
  lotId: varchar("lot_id")
    .notNull()
    .references(() => auctionLots.id, { onDelete: "cascade" }),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  notes: text("notes"),
  addedAt: timestamp("added_at").defaultNow(),
}, (table) => [
  uniqueIndex("auction_wishlist_user_lot_unique").on(table.userId, table.lotId),
]);

export const insertAuctionWishlistSchema = createInsertSchema(auctionWishlist).omit({
  id: true,
  addedAt: true,
});

export type AuctionWishlistItem = typeof auctionWishlist.$inferSelect;
export type InsertAuctionWishlistItem = z.infer<typeof insertAuctionWishlistSchema>;

// Calendar Events
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  eventDate: timestamp("event_date").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  eventTime: varchar("event_time", { length: 20 }),
  eventEndTime: varchar("event_end_time", { length: 20 }),
  location: varchar("location", { length: 255 }),
  catalogUrl: text("catalog_url"),
  imageUrl: text("image_url"),
  color: varchar("color", { length: 20 }).default("#2e2d7d"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;

// Auction Highlights
export const auctionHighlights = pgTable("auction_highlights", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  ctaUrl: text("cta_url").notNull(),
  auctionDate: timestamp("auction_date").notNull(),
  auctionTime: varchar("auction_time", { length: 20 }),
  viewingInfo: text("viewing_info"),
  badgeText: varchar("badge_text", { length: 50 }).default("Featured Auction"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAuctionHighlightSchema = createInsertSchema(auctionHighlights).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type AuctionHighlight = typeof auctionHighlights.$inferSelect;
export type InsertAuctionHighlight = z.infer<typeof insertAuctionHighlightSchema>;

// Image Blobs — stores uploaded images in the database so they survive deploys
// and are accessible identically on localhost and production (both use the same Neon DB).
export const imageBlobs = pgTable("image_blobs", {
  key: varchar("key").primaryKey().notNull(),
  data: text("data").notNull(), // base64-encoded image bytes
  mimeType: varchar("mime_type").notNull().default("image/jpeg"),
  createdAt: timestamp("created_at").defaultNow(),
});
