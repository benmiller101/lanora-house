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

// Password Reset Tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
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
  platform: varchar("platform", { length: 100 }).notNull(), // "Google", "Facebook", "Instagram", "TrustPilot", etc.
  rating: integer("rating").notNull(), // 1-5 stars
  reviewText: text("review_text").notNull(),
  reviewDate: timestamp("review_date").notNull(), // Date the review was originally posted
  location: varchar("location", { length: 255 }), // Customer location if available
  serviceType: varchar("service_type", { length: 255 }), // What service they reviewed
  platformUrl: varchar("platform_url", { length: 500 }), // Link to original review
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0), // For custom ordering
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
  estimate: varchar("estimate", { length: 100 }), // e.g. "£200 - £400"
  soldPrice: varchar("sold_price", { length: 100 }), // e.g. "£350" - shown on hover
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

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).pick({
  userId: true,
  token: true,
  expiresAt: true,
});

export type User = typeof users.$inferSelect;

// Character avatars table for admin-managed characters
export const characterAvatars = pgTable("character_avatars", {
  id: varchar("id").primaryKey().notNull(),
  name: varchar("name").notNull(),
  imageUrl: varchar("image_url").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type CharacterAvatar = typeof characterAvatars.$inferSelect;
export type InsertCharacterAvatar = typeof characterAvatars.$inferInsert;

// Member Wallet System
export const memberWallets = pgTable("member_wallets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  walletId: integer("wallet_id").notNull().references(() => memberWallets.id),
  type: varchar("type").notNull(), // 'credit', 'debit', 'topup', 'withdrawal', 'purchase', 'instant_win', 'raffle_win'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  referenceId: varchar("reference_id"), // Order ID, instant win ID, raffle ID, etc.
  referenceType: varchar("reference_type"), // 'order', 'instant_win', 'raffle_win', 'topup', 'withdrawal'
  status: varchar("status").default("completed").notNull(), // 'pending', 'completed', 'failed', 'cancelled'
  paymentMethod: varchar("payment_method"), // For topups/withdrawals: 'paytriot', 'paypal', 'bank_transfer'
  externalTransactionId: varchar("external_transaction_id"), // PayPal, Paytriot transaction ID
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const walletTopups = pgTable("wallet_topups", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method").notNull(), // 'paytriot', 'paypal'
  paymentStatus: varchar("payment_status").default("pending").notNull(), // 'pending', 'completed', 'failed'
  externalPaymentId: varchar("external_payment_id"), // Paytriot/PayPal transaction ID
  transactionId: integer("transaction_id").references(() => walletTransactions.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const walletWithdrawals = pgTable("wallet_withdrawals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  withdrawalMethod: varchar("withdrawal_method").notNull(), // 'paypal', 'bank_transfer', 'paytriot'
  withdrawalDetails: jsonb("withdrawal_details"), // PayPal email, bank details, etc.
  status: varchar("status").default("pending").notNull(), // 'pending', 'processing', 'completed', 'failed'
  externalTransactionId: varchar("external_transaction_id"),
  transactionId: integer("transaction_id").references(() => walletTransactions.id),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wallet Schema Types
export type MemberWallet = typeof memberWallets.$inferSelect;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type WalletTopup = typeof walletTopups.$inferSelect;
export type WalletWithdrawal = typeof walletWithdrawals.$inferSelect;

export type InsertWalletTransaction = typeof walletTransactions.$inferInsert;
export type InsertWalletTopup = typeof walletTopups.$inferInsert;
export type InsertWalletWithdrawal = typeof walletWithdrawals.$inferInsert;

// Wallet Schema Validations
export const walletTopupSchema = z.object({
  amount: z.number().min(5, "Minimum topup amount is £5").max(1000, "Maximum topup amount is £1000"),
  paymentMethod: z.enum(["paytriot", "paypal"]),
});

export const walletWithdrawalSchema = z.object({
  amount: z.number().min(5, "Minimum withdrawal amount is £5"),
  withdrawalMethod: z.enum(["paypal", "bank_transfer", "paytriot"]),
  withdrawalDetails: z.object({
    paypalEmail: z.string().email().optional(),
    bankDetails: z.object({
      accountName: z.string(),
      sortCode: z.string(),
      accountNumber: z.string(),
    }).optional(),
  }).optional(),
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;

// User Wallet for deposits/balances
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWalletSchema = createInsertSchema(wallets).pick({
  userId: true,
  balance: true,
});

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;



// Withdrawals table for instant win prize withdrawals
export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  withdrawalMethod: varchar("withdrawal_method").notNull(), // 'paypal', 'bank_transfer', 'stripe'
  withdrawalDetails: jsonb("withdrawal_details"), // account details (encrypted/hashed)
  status: varchar("status").default("pending").notNull(), // 'pending', 'processing', 'completed', 'failed'
  instantWinIds: integer("instant_win_ids").array().notNull(), // array of claimed instant win IDs
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



// Financial transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // deposit, withdrawal, payment
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").notNull().default("pending"), // pending, completed, failed
  description: text("description"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  type: true,
  amount: true,
  status: true,
  description: true,
  metadata: true,
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
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

// Product-Category junction table for many-to-many relationship
export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  // Ensure unique product-category combinations
  uniqueIndex("product_category_unique").on(table.productId, table.categoryId),
]);

export const insertProductCategorySchema = createInsertSchema(productCategories).pick({
  productId: true,
  categoryId: true,
});

export type ProductCategory = typeof productCategories.$inferSelect;
export type InsertProductCategory = z.infer<typeof insertProductCategorySchema>;

// Products (antiques)
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  detailedDescription: text("detailed_description"),
  sku: varchar("sku").unique(), // Adding SKU for inventory management
  vendorNumber: varchar("vendor_number"), // Optional vendor reference number
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
  status: varchar("status").default("published"), // draft, published
  // Shipping fields
  weightGrams: integer("weight_grams").default(0), // Weight in grams
  parcelType: varchar("parcel_type").default("small_parcel"), // letter, large_letter, small_parcel, medium_parcel, large_parcel
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create a base schema first
const baseProductSchema = createInsertSchema(products);

// Create a custom product schema that properly handles type conversions for the form data
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
  ).optional(), // Make optional for backward compatibility
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
  // Shipping fields
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
  excerpt: varchar("excerpt", { length: 200 }), // Short description for front page
  itemDescription: text("item_description").notNull(),
  retailPrice: decimal("retail_price", { precision: 10, scale: 2 }).notNull(),
  ticketPrice: decimal("ticket_price", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  maxTickets: integer("max_tickets").notNull(),
  ticketsSold: integer("tickets_sold").default(0),
  status: varchar("status").notNull().default("active"), // active, completed
  imageUrl: varchar("image_url").notNull(),
  additionalImages: varchar("additional_images").array(), // Array of additional image URLs
  winnerId: varchar("winner_id").references(() => users.id),
  winningTicketNumber: integer("winning_ticket_number"),
  // Instant win configuration
  instantWinEnabled: boolean("instant_win_enabled").default(false),
  instantWinCount: integer("instant_win_count").default(0), // How many instant win tickets to generate
  instantWinAmount: decimal("instant_win_amount", { precision: 10, scale: 2 }).default("5"), // Default reward is £5
  instantWinNumbers: integer("instant_win_numbers").array(), // Store the specific instant win ticket numbers
  instantWinTitle: varchar("instant_win_title"), // E.g., "COSMIC CASH"
  instantWinPrizeType: varchar("instant_win_prize_type").default("cash"), // cash, product, ticket, etc.
  instantWinPrizes: jsonb("instant_win_prizes"), // Store array of instant win prize configs (type, count, amount)
  isFeatured: boolean("is_featured").default(false), // Flag to indicate if this raffle should be featured on the homepage
  socialSharingEnabled: boolean("social_sharing_enabled").default(false), // Enable social sharing rewards for this raffle
  socialSharingRewards: jsonb("social_sharing_rewards").default('[]'), // Array of social platform rewards specific to this raffle
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

// Raffle Winners - stores the main raffle winners
export const raffleWinners = pgTable("raffle_winners", {
  id: serial("id").primaryKey(),
  raffleId: integer("raffle_id")
    .notNull()
    .references(() => raffles.id),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  winningTicketNumber: integer("winning_ticket_number").notNull(),
  prizeValue: decimal("prize_value", { precision: 10, scale: 2 }).notNull(),
  prizeName: varchar("prize_name").notNull(),
  claimed: boolean("claimed").default(false),
  claimedAt: timestamp("claimed_at"),
  claimType: varchar("claim_type").default("cash"), // 'cash' or 'delivery'
  deliveryAddress: jsonb("delivery_address"),
  deliveryStatus: varchar("delivery_status").default("pending"), // 'pending', 'processing', 'shipped', 'delivered'
  notificationSent: boolean("notification_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRaffleWinnerSchema = createInsertSchema(raffleWinners).pick({
  raffleId: true,
  userId: true,
  winningTicketNumber: true,
  prizeValue: true,
  prizeName: true,
  claimed: true,
});

export type RaffleWinner = typeof raffleWinners.$inferSelect;
export type InsertRaffleWinner = z.infer<typeof insertRaffleWinnerSchema>;

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

// Cart items - supports both raffle tickets and products
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
  type: varchar("type").notNull().default("raffle_ticket"), // 'raffle_ticket' or 'product'
  shippingMethod: varchar("shipping_method"), // 'standard_shipping' or 'local_delivery'
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
  id: varchar("id").primaryKey(), // Changed from serial to varchar to handle string IDs like "order_1753100252274"
  userId: varchar("user_id")
    .references(() => users.id),
  status: varchar("status").notNull().default("pending"), // pending, processing, shipped, delivered, cancelled
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  shipping: decimal("shipping", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: json("shipping_address").notNull(),
  billingAddress: json("billing_address").notNull(),
  paymentMethod: varchar("payment_method").notNull(),
  paymentStatus: varchar("payment_status").notNull().default("pending"), // pending, paid, failed
  paytriotPaymentId: varchar("paytriot_payment_id"),
  deliveryPostcode: varchar("delivery_postcode"), // For local delivery cost calculation
  deliveryDistance: decimal("delivery_distance", { precision: 10, scale: 2 }), // Distance in miles
  deliveryCost: decimal("delivery_cost", { precision: 10, scale: 2 }), // Calculated delivery cost
  trackingNumber: varchar("tracking_number"),
  carrier: varchar("carrier"), // Royal Mail, DPD, Evri, etc.
  estimatedDelivery: timestamp("estimated_delivery"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  cryptoTransactionHash: varchar("crypto_transaction_hash"), // User-provided transaction hash
  cryptoConfirmedAt: timestamp("crypto_confirmed_at"), // When admin confirmed crypto payment
  cryptoAmount: varchar("crypto_amount"), // Amount in cryptocurrency (e.g., "0.00123456 BTC")
  cryptoWalletAddress: varchar("crypto_wallet_address"), // Wallet address for crypto payment
  fulfillmentMethod: varchar("fulfillment_method").default("delivery"), // 'delivery' or 'click_collect'
  collectionDate: timestamp("collection_date"), // Date for click & collect pickup
  collectionTimeSlot: varchar("collection_time_slot"), // Time slot for pickup e.g. "12:00-13:00"
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
  type: varchar("type").notNull().default("product"), // product, raffle_ticket
  shippingMethod: varchar("shipping_method"), // 'standard_shipping' or 'local_delivery'
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




// User Item Submissions - for sales or raffle prize donations
export const itemSubmissions = pgTable("item_submissions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  type: varchar("type").notNull(), // "sale", "raffle_prize"
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
  status: varchar("status").notNull().default("pending"), // "pending", "approved", "rejected", "completed", "negotiating", "accepted", "shipping"
  adminFeedback: text("admin_feedback"),
  adminValuation: decimal("admin_valuation", { precision: 10, scale: 2 }),
  // New fields for offer negotiation
  offerAmount: decimal("offer_amount", { precision: 10, scale: 2 }),
  negotiationStatus: varchar("negotiation_status"), // "offered", "user_accepted", "user_rejected", "user_countered", "admin_accepted", "admin_rejected", "admin_countered", "finalized"
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

// Product Offers - users can send custom offers for products
export const productOffers = pgTable("product_offers", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  offerAmount: decimal("offer_amount", { precision: 10, scale: 2 }).notNull(),
  message: text("message"), // Optional message from the user
  status: varchar("status").notNull().default("pending"), // "pending", "accepted", "rejected", "expired", "counter_sent", "user_accepted", "user_declined"
  adminResponse: text("admin_response"), // Optional response from admin
  counterOfferAmount: decimal("counter_offer_amount", { precision: 10, scale: 2 }), // Admin's counter offer price
  counterOfferMessage: text("counter_offer_message"), // Admin's message with counter offer
  counterOfferAt: timestamp("counter_offer_at"), // When counter offer was sent
  userRespondedAt: timestamp("user_responded_at"), // When user responded to counter offer
  expiresAt: timestamp("expires_at"), // Optional expiration date
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"), // When the offer was accepted
  rejectedAt: timestamp("rejected_at"), // When the offer was rejected
  notificationRead: boolean("notification_read").default(false), // Whether user has seen acceptance notification
  wishlistIds: integer("wishlist_ids").array(), // Array of wishlist item IDs for wishlist offers
  isWishlistOffer: boolean("is_wishlist_offer").default(false), // Flag to indicate if this is a wishlist offer
});

export const insertProductOfferSchema = createInsertSchema(productOffers).pick({
  productId: true,
  userId: true,
  offerAmount: true,
  message: true,
  expiresAt: true,
});

export type ProductOffer = typeof productOffers.$inferSelect;
export type InsertProductOffer = z.infer<typeof insertProductOfferSchema>;

// Payment Methods (for users with stored credit cards)
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripePaymentMethodId: varchar("stripe_payment_method_id"),
  cardBrand: varchar("card_brand"), // visa, mastercard, amex, etc.
  cardLast4: varchar("card_last4"), // Last 4 digits of card
  expiryMonth: integer("expiry_month"),
  expiryYear: integer("expiry_year"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).pick({
  userId: true,
  stripeCustomerId: true,
  stripePaymentMethodId: true,
  cardBrand: true,
  cardLast4: true,
  expiryMonth: true,
  expiryYear: true,
  isDefault: true,
});

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;

// Simple Notifications for users
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  type: varchar("type").default("info").notNull(), // info, success, warning, error
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type InsertNotification = typeof notifications.$inferInsert;
export type SelectNotification = typeof notifications.$inferSelect;

// Blog Posts
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  slug: varchar("slug").unique().notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  sections: json("sections").$type<any[]>(), // Store original section structure
  coverImage: varchar("cover_image"),
  category: varchar("category").notNull(),
  tags: json("tags").$type<string[]>(),
  status: varchar("status").notNull().default("draft"), // draft, published, archived
  featured: boolean("featured").default(false),
  authorId: varchar("author_id"),
  authorName: varchar("author_name"),
  authorImage: varchar("author_image"),
  authorBio: text("author_bio"),
  metaTitle: varchar("meta_title"),
  metaDescription: text("meta_description"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).pick({
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  sections: true,
  coverImage: true,
  category: true,
  tags: true,
  status: true,
  featured: true,
  authorId: true,
  authorName: true,
  authorImage: true,
  authorBio: true,
  metaTitle: true,
  metaDescription: true,
  publishedAt: true,
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

// Blog Comments
export const blogComments: ReturnType<typeof pgTable<"blog_comments", any>> = pgTable("blog_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => blogPosts.id),
  userId: varchar("user_id").references(() => users.id),
  authorName: varchar("author_name").notNull(),
  authorEmail: varchar("author_email").notNull(),
  content: text("content").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, approved, rejected
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBlogCommentSchema = createInsertSchema(blogComments).pick({
  postId: true,
  userId: true,
  authorName: true,
  authorEmail: true,
  content: true,
  status: true,
  parentId: true,
});

export type BlogComment = typeof blogComments.$inferSelect;
export type InsertBlogComment = z.infer<typeof insertBlogCommentSchema>;

// Blog Categories
export const blogCategories = pgTable("blog_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  color: varchar("color").default("#3b82f6"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBlogCategorySchema = createInsertSchema(blogCategories).pick({
  name: true,
  slug: true,
  description: true,
  color: true,
});

export type BlogCategory = typeof blogCategories.$inferSelect;
export type InsertBlogCategory = z.infer<typeof insertBlogCategorySchema>;

// Clearance Success Stories
export const clearanceStories = pgTable("clearance_stories", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  amountSaved: varchar("amount_saved"),
  wasteDiverted: varchar("waste_diverted"), // e.g., "0.5 tonnes"
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

// Clearance Quote Requests Table
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
  imageUrls: text("image_urls").array(), // Array of image URLs
  status: varchar("status").default("pending").notNull(), // pending, responded
  requestType: varchar("request_type").default("clearance").notNull(), // clearance, contact, general
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

// Social Share Rewards Configuration
export const socialShareRewards = pgTable("social_share_rewards", {
  id: serial("id").primaryKey(),
  platform: varchar("platform").notNull(), // 'facebook', 'instagram_story', 'instagram_post', 'twitter', 'tiktok', 'whatsapp', 'linkedin', 'snapchat'
  rewardType: varchar("reward_type").default("tickets").notNull(), // 'tickets', 'credits', 'discounts'
  rewardAmount: integer("reward_amount").default(1).notNull(), // number of tickets/credits
  isActive: boolean("is_active").default(true),
  maxRewardsPerUser: integer("max_rewards_per_user").default(1), // null = unlimited
  maxRewardsPerRaffle: integer("max_rewards_per_raffle").default(1), // null = unlimited  
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSocialShareRewardSchema = createInsertSchema(socialShareRewards).pick({
  platform: true,
  rewardType: true,
  rewardAmount: true,
  isActive: true,
  maxRewardsPerUser: true,
  maxRewardsPerRaffle: true,
  description: true,
});

export type SocialShareReward = typeof socialShareRewards.$inferSelect;
export type InsertSocialShareReward = z.infer<typeof insertSocialShareRewardSchema>;

// Social Shares Tracking
export const socialShares = pgTable("social_shares", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  raffleId: integer("raffle_id").notNull().references(() => raffles.id),
  platform: varchar("platform").notNull(), // matches socialShareRewards.platform
  shareUrl: text("share_url"), // the URL that was shared
  verified: boolean("verified").default(false), // whether the share was verified
  rewardGranted: boolean("reward_granted").default(false),
  rewardTickets: integer("reward_tickets").default(0), // tickets granted for this share
  shareData: jsonb("share_data"), // store platform-specific share metadata
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
  verifiedAt: timestamp("verified_at"),
});

export const insertSocialShareSchema = createInsertSchema(socialShares).pick({
  userId: true,
  raffleId: true,
  platform: true,
  shareUrl: true,
  shareData: true,
  ipAddress: true,
  userAgent: true,
});

export type SocialShare = typeof socialShares.$inferSelect;
export type InsertSocialShare = z.infer<typeof insertSocialShareSchema>;

// Customer Requests Table - Unified table for all customer form submissions
export const customerRequests = pgTable("customer_requests", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  subject: varchar("subject"),
  message: text("message"),
  inquiryType: varchar("inquiry_type"), // 'general', 'quote', 'clearance', 'item_submission', 'prize_draw'
  location: varchar("location"), // Optional location field from contact form
  
  // Clearance-specific fields (optional)
  address: text("address"),
  propertyType: varchar("property_type"),
  clearanceType: varchar("clearance_type"),
  timeframe: varchar("timeframe"),
  additionalInfo: text("additional_info"),
  
  // General fields
  imageUrls: text("image_urls").array(), // Array of image URLs
  formType: varchar("form_type").notNull(), // 'contact', 'clearance_quote', 'item_submission'
  sourceUrl: varchar("source_url"), // Which page the form was submitted from
  
  // Admin management
  status: varchar("status").default("pending").notNull(), // pending, contacted, quoted, accepted, declined, resolved
  adminNotes: text("admin_notes"), // Internal notes for admin
  assignedTo: varchar("assigned_to"), // Admin user ID who is handling this request
  
  // Metadata
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCustomerRequestSchema = createInsertSchema(customerRequests).pick({
  name: true,
  email: true,
  phone: true,
  subject: true,
  message: true,
  inquiryType: true,
  location: true,
  address: true,
  propertyType: true,
  clearanceType: true,
  timeframe: true,
  additionalInfo: true,
  imageUrls: true,
  formType: true,
  sourceUrl: true,
  userAgent: true,
  ipAddress: true,
});

export type CustomerRequest = typeof customerRequests.$inferSelect;
export type InsertCustomerRequest = z.infer<typeof insertCustomerRequestSchema>;

// Before and After Posts for admin content management
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

// Auction Catalogues (matching existing database structure)
export const auctionCatalogues = pgTable("auction_catalogs", {
  id: varchar("id").primaryKey().notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"), // Optional - end time varies
  status: varchar("status").notNull().default("draft"), // draft, active, completed, archived
  imageUrl: varchar("image_url"),
  viewingStartDate: timestamp("viewing_start_date"),
  viewingEndDate: timestamp("viewing_end_date"),
  location: varchar("location"),
  auctionType: varchar("auction_type"), // live, timed, silent
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

// Auction Lots (matching existing database structure)
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
  status: varchar("status").notNull().default("available"), // available, sold, withdrawn
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

// Auction Bids - customers can bid on lots before auction is live
export const auctionBids = pgTable("auction_bids", {
  id: varchar("id").primaryKey(),
  lotId: varchar("lot_id")
    .notNull()
    .references(() => auctionLots.id, { onDelete: "cascade" }),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  bidAmount: decimal("bid_amount", { precision: 10, scale: 2 }).notNull(),
  maxBid: decimal("max_bid", { precision: 10, scale: 2 }), // For auto-bidding
  bidType: varchar("bid_type"),
  status: varchar("status").notNull().default("active"), // active, outbid, winning, won, lost
  isWinning: boolean("is_winning").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAuctionBidSchema = createInsertSchema(auctionBids).omit({
  id: true,
  createdAt: true,
});

export type AuctionBid = typeof auctionBids.$inferSelect;
export type InsertAuctionBid = z.infer<typeof insertAuctionBidSchema>;

// Auction Wishlist - customers can watch lots they're interested in
export const auctionWishlist = pgTable("auction_wishlist", {
  id: serial("id").primaryKey(),
  lotId: varchar("lot_id")
    .notNull()
    .references(() => auctionLots.id, { onDelete: "cascade" }),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  notes: text("notes"), // Personal notes about the lot
  addedAt: timestamp("added_at").defaultNow(),
}, (table) => [
  // Ensure a user can't add the same lot to wishlist multiple times
  uniqueIndex("auction_wishlist_user_lot_unique").on(table.userId, table.lotId),
]);

export const insertAuctionWishlistSchema = createInsertSchema(auctionWishlist).omit({
  id: true,
  addedAt: true,
});

export type AuctionWishlistItem = typeof auctionWishlist.$inferSelect;
export type InsertAuctionWishlistItem = z.infer<typeof insertAuctionWishlistSchema>;

// Live Auction Sessions - Tracks the current state of a live auction
export const liveAuctionSessions = pgTable("live_auction_sessions", {
  id: serial("id").primaryKey(),
  catalogId: varchar("catalog_id")
    .notNull()
    .references(() => auctionCatalogues.id, { onDelete: "cascade" }),
  currentLotId: varchar("current_lot_id")
    .references(() => auctionLots.id, { onDelete: "set null" }),
  status: varchar("status").notNull().default("pending"), // pending, active, paused, completed
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLiveAuctionSessionSchema = createInsertSchema(liveAuctionSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type LiveAuctionSession = typeof liveAuctionSessions.$inferSelect;
export type InsertLiveAuctionSession = z.infer<typeof insertLiveAuctionSessionSchema>;

// Skip Bag Bookings
export const skipBagBookings = pgTable("skip_bag_bookings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  customerName: varchar("customer_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  address: text("address").notNull(),
  postcode: varchar("postcode").notNull(),
  wasteType: varchar("waste_type").notNull(), // rubble, soil, green_waste, wood, mixed_household, plasterboard
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  dropOffDate: timestamp("drop_off_date").notNull(),
  dropOffTimeSlot: varchar("drop_off_time_slot").notNull(), // morning, afternoon, evening
  collectionDate: timestamp("collection_date").notNull(),
  collectionTimeSlot: varchar("collection_time_slot").notNull(), // morning, afternoon, evening
  specialInstructions: text("special_instructions"),
  paymentStatus: varchar("payment_status").default("pending").notNull(), // pending, paid, failed
  paymentMethod: varchar("payment_method"), // stripe, paypal
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  bookingStatus: varchar("booking_status").default("pending").notNull(), // pending, confirmed, collected, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSkipBagBookingSchema = createInsertSchema(skipBagBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SkipBagBooking = typeof skipBagBookings.$inferSelect;
export type InsertSkipBagBooking = z.infer<typeof insertSkipBagBookingSchema>;

export const skipBagBookingFormSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Please enter your full address"),
  postcode: z.string().min(3, "Please enter a valid postcode"),
  wasteType: z.enum(["rubble", "soil", "green_waste", "wood", "mixed_household", "plasterboard"]),
  dropOffDate: z.date(),
  dropOffTimeSlot: z.enum(["morning", "afternoon", "evening"]),
  collectionDate: z.date(),
  collectionTimeSlot: z.enum(["morning", "afternoon", "evening"]),
  specialInstructions: z.string().optional(),
});

export type SkipBagBookingFormData = z.infer<typeof skipBagBookingFormSchema>;

// Calendar Events for Homepage Auction Calendar
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  eventDate: timestamp("event_date").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventType: varchar("event_type", { length: 50 }).notNull(), // auction, viewing, collection, special
  eventTime: varchar("event_time", { length: 20 }), // e.g., "10:00" or "17:30"
  eventEndTime: varchar("event_end_time", { length: 20 }), // e.g., "18:00" for viewing end time
  location: varchar("location", { length: 255 }), // e.g., "The Old Foundry Chapel, Hayle"
  catalogUrl: text("catalog_url"), // link to auction catalog
  imageUrl: text("image_url"), // small image for the event
  color: varchar("color", { length: 20 }).default("#2e2d7d"), // hex color for display
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

// Auction Highlights for Browse Tab (admin-managed auction listings)
export const auctionHighlights = pgTable("auction_highlights", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  ctaUrl: text("cta_url").notNull(), // URL to redirect when clicked
  auctionDate: timestamp("auction_date").notNull(),
  auctionTime: varchar("auction_time", { length: 20 }), // e.g., "17:30"
  viewingInfo: text("viewing_info"), // e.g., "15th & 16th December, 9am - 7pm"
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

// Marketing Email Templates
export const marketingEmailTemplates = pgTable("marketing_email_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  preheader: varchar("preheader", { length: 255 }),
  heroImageUrl: varchar("hero_image_url", { length: 1000 }),
  contentHtml: text("content_html").notNull(),
  status: varchar("status", { length: 50 }).default("draft"),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMarketingEmailTemplateSchema = createInsertSchema(marketingEmailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type MarketingEmailTemplate = typeof marketingEmailTemplates.$inferSelect;
export type InsertMarketingEmailTemplate = z.infer<typeof insertMarketingEmailTemplateSchema>;

// Marketing Email Dispatches (send history)
export const marketingEmailDispatches = pgTable("marketing_email_dispatches", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull(),
  initiatedByUserId: varchar("initiated_by_user_id", { length: 255 }).notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  recipientCount: integer("recipient_count").default(0),
  successfulCount: integer("successful_count").default(0),
  failedCount: integer("failed_count").default(0),
  status: varchar("status", { length: 50 }).default("pending"),
  errorLog: jsonb("error_log"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMarketingEmailDispatchSchema = createInsertSchema(marketingEmailDispatches).omit({
  id: true,
  createdAt: true,
});

export type MarketingEmailDispatch = typeof marketingEmailDispatches.$inferSelect;
export type InsertMarketingEmailDispatch = z.infer<typeof insertMarketingEmailDispatchSchema>;

// Marketing Subscribers (Business and Customer lists)
export const marketingSubscribers = pgTable("marketing_subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  companyName: varchar("company_name", { length: 255 }),
  subscriberType: varchar("subscriber_type", { length: 50 }).notNull(), // 'business' or 'customer'
  source: varchar("source", { length: 100 }), // where they signed up from
  consentDate: timestamp("consent_date").defaultNow(),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMarketingSubscriberSchema = createInsertSchema(marketingSubscribers).omit({
  id: true,
  createdAt: true,
});

export type MarketingSubscriber = typeof marketingSubscribers.$inferSelect;
export type InsertMarketingSubscriber = z.infer<typeof insertMarketingSubscriberSchema>;

export const auctionHomepageSettings = pgTable("auction_homepage_settings", {
  id: serial("id").primaryKey(),
  nextAuctionDate: varchar("next_auction_date").notNull(),
  catalogueImageUrl: varchar("catalogue_image_url"),
  catalogueLink: varchar("catalogue_link"),
  auctionScheduleText: varchar("auction_schedule_text").default("Auctions Held Fortnightly On A Saturday at 10AM"),
  locationText: varchar("location_text").default("The Old Foundry Chapel, Hayle, Cornwall"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AuctionHomepageSettings = typeof auctionHomepageSettings.$inferSelect;
