import sharp from "sharp";
import { pool, db } from "./db";
import { generateRandomTicketNumbers } from "./new-order-system";
import {
  buildAuthUrl,
  exchangeCodeForTokens,
  discoverAccountAndLocation,
  readTokenStore,
  writeTokenStore,
  isConfigured,
  getGoogleBusinessReviews,
  clearReviewCache,
} from "./google-business-reviews";
import { sendOrderConfirmationEmail, sendShippingNotificationEmail, sendCryptoPaymentConfirmedEmail } from "./email-service";
import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import { storage } from "./storage-db";
import { isAdminUser, ADMIN_EMAIL } from "./adminAuth";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupSocialAuth } from "./socialAuth";
import { getAdminOrders } from "./admin-orders";
import { getAllSubmissions, respondToSubmission, handleAdminCounterResponse } from "./admin-submissions";
import socialShareRoutes from "./social-share-routes";
import socialAuthRoutes from "./social-auth-routes";
import environmentalImpactRoutes from "./environmental-impact-routes";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { calculateDeliveryCost } from "./delivery-calculator";
import { calculateCombinedShipping, getShippingZone, getParcelTypeName, getZoneName, type CartItem, type ParcelType, type ShippingService } from "./shipping";
import { eq, and, desc, count, inArray, sql, gte } from "drizzle-orm";
import { scrapeEasyLiveCatalogues, needsSync, getLastSyncAt } from "./easylive-scraper";
import { 
  users, 
  products, 
  orders, 
  orderItems, 
  categories, 
  cartItems,
  raffles,
  raffleEntries,
  instantWinners,
  blogPosts,
  submissions,
  offers,
  clearanceStories,

  notifications,
  characterAvatars,
  beforeAfterPosts,
  insertUserSchema,
  teamMembers,
  insertTeamMemberSchema,
  customerReviews,
  insertCustomerReviewSchema,
  auctionCatalogues,
  insertAuctionCatalogueSchema,
  updateAuctionCatalogueSchema,
  auctionLots,
  insertAuctionLotSchema,
  updateAuctionLotSchema,
  auctionBids,
  insertAuctionBidSchema,
  auctionWishlist,
  insertAuctionWishlistSchema,
  skipBagBookings,
  insertSkipBagBookingSchema,
  galleryImages,
  type GalleryImage,
} from "../shared/schema";
import { 
  loginRateLimit, 
  apiRateLimit, 
  uploadRateLimit, 
  sanitizeInput, 
  validateFileUpload, 
  securityHeaders, 
  requireAuth,
  requireAdmin,
  csrfProtection 
} from "./middleware/security";
import "express-session";
import Stripe from "stripe";
import multer from "multer";
import path from "path";
import fs from "fs";

// Paytriot payment integration for raffle support

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-09-30.clover",
    })
  : null;

declare module "express-session" {
  interface SessionData {
    user: {
      id: string;
      email: string | null;
      firstName: string | null;
      lastName: string | null;
      role: string;
    };
  }
}

// Configure multer for team member image uploads
const teamMemberImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/team-members';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'team-member-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const teamMemberImageUpload = multer({
  storage: teamMemberImageStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG and WebP images are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Configure multer for auction catalog images
const auctionCatalogImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/auction-catalogs';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'catalog-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const auctionCatalogImageUpload = multer({
  storage: auctionCatalogImageStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG and WebP images are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Configure multer for auction lot images (multiple images per lot)
const auctionLotImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/auction-lots';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'lot-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const auctionLotImageUpload = multer({
  storage: auctionLotImageStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG and WebP images are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per file
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // eBay Marketplace Account Deletion webhook
  // Registered before all middleware (CSRF, security headers, etc.) to avoid interference
  const ebayGetHandler = (req: Request, res: Response) => {
    const challengeCode = (req.query.challenge_code || req.query.challengeCode) as string;

    console.log("[eBay Webhook] GET request received");
    console.log("[eBay Webhook] Query params:", JSON.stringify(req.query));
    console.log("[eBay Webhook] Challenge code received:", challengeCode ? `"${challengeCode}"` : "MISSING");

    if (!challengeCode) {
      return res.status(400).json({ error: "Missing challenge_code parameter" });
    }

    const verificationToken = process.env.EBAY_VERIFICATION_TOKEN || "";
    const endpointUrl = process.env.EBAY_ENDPOINT_URL || "";

    console.log("[eBay Webhook] Endpoint URL used for hash:", endpointUrl);
    console.log("[eBay Webhook] Token length:", verificationToken.length);

    if (!verificationToken || !endpointUrl) {
      console.error("[eBay Webhook] Missing EBAY_VERIFICATION_TOKEN or EBAY_ENDPOINT_URL");
      return res.status(500).json({ error: "Server misconfigured" });
    }

    const hashInput = challengeCode + verificationToken + endpointUrl;
    const challengeResponse = crypto.createHash("sha256").update(hashInput, "utf8").digest("hex");

    console.log("[eBay Webhook] Hash output:", challengeResponse);
    console.log("[eBay Webhook] Challenge verification successful");

    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ challengeResponse });
  };

  const ebayPostHandler = (req: Request, res: Response) => {
    console.log("[eBay Webhook] POST deletion notification received:", JSON.stringify(req.body));
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ status: "ok" });
  };

  app.get("/ebay/deletion", ebayGetHandler);
  app.post("/ebay/deletion", ebayPostHandler);
  app.get("/api/ebay/deletion", ebayGetHandler);
  app.post("/api/ebay/deletion", ebayPostHandler);

  // robots.txt
  app.get("/robots.txt", (_req: Request, res: Response) => {
    res.type("text/plain").send(
      `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin-login\nDisallow: /logout\nDisallow: /reset-password\nDisallow: /cart\nDisallow: /checkout\nDisallow: /order-payment\nDisallow: /order-confirmation\nDisallow: /shipping-selection\nDisallow: /members\nDisallow: /paypal-test\n\nSitemap: https://www.lanorahouse.com/sitemap.xml`
    );
  });

  // sitemap.xml
  app.get("/sitemap.xml", async (_req: Request, res: Response) => {
    const BASE = "https://www.lanorahouse.com";
    const staticPages = [
      { path: "/", priority: "1.0", changefreq: "weekly" },
      { path: "/shop", priority: "0.9", changefreq: "daily" },
      { path: "/auctions", priority: "0.9", changefreq: "weekly" },
      { path: "/clearance", priority: "0.8", changefreq: "monthly" },
      { path: "/about", priority: "0.7", changefreq: "monthly" },
      { path: "/contact", priority: "0.7", changefreq: "monthly" },
      { path: "/blog", priority: "0.8", changefreq: "weekly" },
      { path: "/raffles", priority: "0.8", changefreq: "weekly" },
      { path: "/sell-goods", priority: "0.7", changefreq: "monthly" },
      { path: "/skip-bags", priority: "0.7", changefreq: "monthly" },
      { path: "/meet-the-team", priority: "0.5", changefreq: "monthly" },
      { path: "/pricing", priority: "0.6", changefreq: "monthly" },
      { path: "/environmental-impact", priority: "0.5", changefreq: "monthly" },
      { path: "/success-stories", priority: "0.6", changefreq: "monthly" },
      { path: "/before-after", priority: "0.6", changefreq: "monthly" },
      { path: "/clearance-faq", priority: "0.5", changefreq: "monthly" },
      { path: "/clearance-rewards-guide", priority: "0.5", changefreq: "monthly" },
      { path: "/auction-locations", priority: "0.7", changefreq: "monthly" },
      { path: "/instant-wins", priority: "0.6", changefreq: "weekly" },
      { path: "/spin-wheel", priority: "0.5", changefreq: "monthly" },
      { path: "/shipping", priority: "0.4", changefreq: "yearly" },
      { path: "/returns", priority: "0.4", changefreq: "yearly" },
      { path: "/terms-of-service", priority: "0.3", changefreq: "yearly" },
      { path: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
      { path: "/cookie-policy", priority: "0.3", changefreq: "yearly" },
      { path: "/raffle-terms", priority: "0.3", changefreq: "yearly" },
      { path: "/buyers-terms", priority: "0.3", changefreq: "yearly" },
      { path: "/authenticity-guarantee", priority: "0.3", changefreq: "yearly" },
      { path: "/shed-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/probate-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/hotel-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/hoarding-house-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/drug-paraphernalia-clearance", priority: "0.5", changefreq: "monthly" },
      { path: "/dead-animal-removal", priority: "0.5", changefreq: "monthly" },
      { path: "/fly-tipping-removal", priority: "0.5", changefreq: "monthly" },
      { path: "/wait-and-load-service", priority: "0.5", changefreq: "monthly" },
      { path: "/end-of-tenancy-clean", priority: "0.6", changefreq: "monthly" },
      { path: "/extreme-cleaning", priority: "0.5", changefreq: "monthly" },
      { path: "/property-cleaning", priority: "0.6", changefreq: "monthly" },
      { path: "/business-cleaning", priority: "0.6", changefreq: "monthly" },
      { path: "/sale-ready-package", priority: "0.6", changefreq: "monthly" },
      { path: "/hayle-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/truro-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/falmouth-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/penzance-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/newquay-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/redruth-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/camborne-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/bodmin-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/helston-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/st-austell-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/bude-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/liskeard-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/wadebridge-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/plymouth-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/exeter-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/torquay-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/barnstaple-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/tiverton-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/okehampton-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/tavistock-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/paignton-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/newton-abbot-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/exmouth-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/ilfracombe-clearance", priority: "0.6", changefreq: "monthly" },
      { path: "/brixham-clearance", priority: "0.6", changefreq: "monthly" },
    ];

    try {
      const productRows = await pool.query(`SELECT id FROM products WHERE in_stock = true ORDER BY id`);
      const blogRows = await pool.query(`SELECT slug FROM blog_posts WHERE published = true ORDER BY created_at DESC`);
      const catalogRows = await pool.query(`SELECT id FROM auction_catalogs WHERE status = 'active' OR status = 'upcoming' ORDER BY id`);

      let urls = staticPages.map(p =>
        `  <url>\n    <loc>${BASE}${p.path}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
      );

      for (const row of productRows.rows) {
        urls.push(`  <url>\n    <loc>${BASE}/product/${row.id}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`);
      }
      for (const row of blogRows.rows) {
        urls.push(`  <url>\n    <loc>${BASE}/blog/${row.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`);
      }
      for (const row of catalogRows.rows) {
        urls.push(`  <url>\n    <loc>${BASE}/auctions/${row.id}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`);
      }

      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;
      res.type("application/xml").send(xml);
    } catch (error) {
      console.error("Sitemap generation error:", error);
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticPages.map(p => `  <url>\n    <loc>${BASE}${p.path}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`).join("\n")}\n</urlset>`;
      res.type("application/xml").send(xml);
    }
  });

  // Apply security middleware
  app.use(securityHeaders);
  app.use(sanitizeInput);
  app.use(csrfProtection);
  
  // Serve uploaded files statically
  app.use('/uploads', express.static('uploads'));
  
  await setupAuth(app);
  setupSocialAuth(app);

  // PayPal routes
  app.get("/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/paypal/order", async (req, res) => {
    // Request body should contain: { intent, amount, currency }
    await createPaypalOrder(req, res);
  });

  app.post("/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // Test email endpoint (admin only)
  app.post("/api/admin/test-email", async (req: Request, res: Response) => {
    const email = req.headers['x-admin-email'];
    const password = req.headers['x-admin-password'];
    
    if (email !== 'Mattapinch@gmail.com' || password !== '@Kawasak16724020000') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { testEmail } = req.body;
    if (!testEmail) {
      return res.status(400).json({ error: 'testEmail is required' });
    }
    
    try {
      const result = await sendOrderConfirmationEmail({
        customerEmail: testEmail,
        customerName: 'Test Customer',
        orderId: 'TEST-' + Date.now(),
        items: [{ name: 'Test Product', quantity: 1, price: 99.99 }],
        subtotal: 99.99,
        shipping: 5.99,
        total: 105.98,
        shippingAddress: {
          line1: '123 Test Street',
          city: 'London',
          postcode: 'SW1A 1AA',
          country: 'United Kingdom',
        },
      });
      
      if (result) {
        res.json({ success: true, message: `Test email sent to ${testEmail}` });
      } else {
        res.status(500).json({ success: false, error: 'Failed to send test email' });
      }
    } catch (error: any) {
      console.error('Test email error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  // Temporary direct instant wins endpoints with proper authentication
  app.get("/api/instant-wins", isAuthenticated, async (req: any, res: Response) => {
    try {
      console.log("🎁 Direct instant wins - User:", req.user?.id);
      const userId = req.user.id;
      
      const instantWinsQuery = `
        SELECT 
          iw.id,
          iw.raffle_id as "raffleId",
          r.name as "raffleName",
          iw.prize_type as "prizeType",
          iw.prize_amount as "prizeAmount",
          iw.ticket_number as "ticketNumber",
          iw.claimed,
          iw.created_at as "createdAt"
        FROM instant_winners iw
        JOIN raffles r ON iw.raffle_id = r.id
        WHERE iw.user_id = $1
        ORDER BY iw.prize_amount DESC, iw.created_at DESC
      `;
      
      const result = await pool.query(instantWinsQuery, [userId]);
      console.log(`🎁 Found ${result.rows.length} instant wins for user ${userId}`);
      
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching instant wins:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/instant-wins/:id/claim", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const instantWinId = req.params.id;
      
      // Verify the instant win belongs to the user and is not already claimed
      const checkQuery = `
        SELECT id, claimed, prize_amount, prize_type
        FROM instant_winners 
        WHERE id = $1 AND user_id = $2
      `;
      
      const checkResult = await pool.query(checkQuery, [instantWinId, userId]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: "Instant win not found" });
      }
      
      const instantWin = checkResult.rows[0];
      
      if (instantWin.claimed) {
        return res.status(400).json({ message: "Prize already claimed" });
      }
      
      // Use transaction to claim prize and credit wallet automatically
      try {
        await pool.query('BEGIN');

        // Mark instant win as claimed
        const claimQuery = `
          UPDATE instant_winners 
          SET claimed = true
          WHERE id = $1
          RETURNING *
        `;
        await pool.query(claimQuery, [instantWinId]);

        // Only credit wallet for cash prizes
        if (instantWin.prize_type === 'cash') {
          // Ensure user has a wallet
          await pool.query(`
            INSERT INTO member_wallets (user_id, balance, created_at, updated_at)
            VALUES ($1, 0, NOW(), NOW())
            ON CONFLICT (user_id) DO NOTHING
          `, [userId]);

          // Credit the wallet automatically
          await pool.query(`
            UPDATE member_wallets 
            SET balance = balance + $1, updated_at = NOW()
            WHERE user_id = $2
          `, [parseFloat(instantWin.prize_amount), userId]);

          // Record the transaction
          await pool.query(`
            INSERT INTO wallet_transactions (
              user_id, type, amount, is_credit, description, status, reference_id, created_at
            ) VALUES ($1, 'instant_win_credit', $2, $3, $4, 'completed', $5, NOW())
          `, [
            userId, 
            parseFloat(instantWin.prize_amount), 
            true, 
            `Instant win prize automatically credited`, 
            `instant_win_${instantWinId}`
          ]);

          console.log(`💰 Auto-credited £${instantWin.prize_amount} to wallet for user ${userId}`);
        }

        // Create notification for the instant win
        const notificationMessage = instantWin.prize_type === 'cash' 
          ? `🎉 £${instantWin.prize_amount} added to your wallet! You can withdraw it anytime from Members Portal.`
          : `🎉 You won an instant prize! Check your Members Portal for details.`;
          
        const notificationQuery = `
          INSERT INTO notifications (user_id, message, type, is_read, created_at)
          VALUES ($1, $2, $3, false, NOW())
        `;
        await pool.query(notificationQuery, [
          userId,
          notificationMessage,
          'instant_win'
        ]);

        await pool.query('COMMIT');
        
      } catch (transactionError) {
        await pool.query('ROLLBACK');
        throw transactionError;
      }
      
      console.log(`🎉 User ${userId} claimed instant win ${instantWinId}: £${instantWin.prize_amount}`);
      
      const successMessage = instantWin.prize_type === 'cash' 
        ? `£${instantWin.prize_amount} added to your wallet! You can withdraw it anytime.`
        : `Successfully claimed your instant win prize!`;
      
      res.json({ 
        success: true, 
        message: successMessage
      });
      
    } catch (error) {
      console.error("Error claiming instant win:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Import and mount withdrawal routes
  const { default: withdrawalRoutes } = await import("./withdrawal-routes");
  app.use("/api/withdrawals", withdrawalRoutes);

  // Admin raffle winners management
  app.get("/api/admin/raffle-winners", async (req, res) => {
    try {
      const query = `
        SELECT 
          r.id as raffle_id,
          r.name as raffle_name,
          r.winning_ticket_number,
          r.updated_at as won_at,
          u.id as user_id,
          u.email as winner_email,
          u.first_name as winner_first_name,
          u.last_name as winner_last_name,
          rd.id as delivery_id,
          rd.delivery_type,
          rd.delivery_email,
          rd.delivery_address,
          rd.delivery_status,
          rd.created_at as delivery_requested_at
        FROM raffles r
        JOIN users u ON r.winner_id = u.id
        LEFT JOIN raffle_deliveries rd ON r.id = rd.raffle_id
        WHERE r.status = 'completed' AND r.winner_id IS NOT NULL
        ORDER BY r.updated_at DESC
      `;
      
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching raffle winners:", error);
      res.status(500).json({ message: "Failed to fetch raffle winners" });
    }
  });

  // Update delivery status
  app.put("/api/admin/raffle-winners/:raffleId/delivery-status", async (req, res) => {
    try {
      const { raffleId } = req.params;
      const { status, notes } = req.body;
      
      const query = `
        UPDATE raffle_deliveries 
        SET delivery_status = $1, admin_notes = $2, updated_at = NOW()
        WHERE raffle_id = $3
        RETURNING *
      `;
      
      const result = await pool.query(query, [status, notes || null, raffleId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Delivery record not found" });
      }
      
      res.json({ success: true, delivery: result.rows[0] });
    } catch (error) {
      console.error("Error updating delivery status:", error);
      res.status(500).json({ message: "Failed to update delivery status" });
    }
  });

  // Create uploads directories if they don't exist
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const productsDir = path.join(uploadsDir, 'products');
  const rafflesDir = path.join(uploadsDir, 'raffles');
  const submissionsDir = path.join(uploadsDir, 'submissions');
  const blogDir = path.join(uploadsDir, 'blog');
  const beforeAfterDir = path.join(uploadsDir, 'before-after');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(productsDir)) {
    fs.mkdirSync(productsDir, { recursive: true });
  }
  if (!fs.existsSync(rafflesDir)) {
    fs.mkdirSync(rafflesDir, { recursive: true });
  }
  if (!fs.existsSync(submissionsDir)) {
    fs.mkdirSync(submissionsDir, { recursive: true });
  }
  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir, { recursive: true });
  }
  if (!fs.existsSync(beforeAfterDir)) {
    fs.mkdirSync(beforeAfterDir, { recursive: true });
  }

  // Configure multer for file uploads
  const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Determine upload directory based on the endpoint
      if (req.originalUrl.includes('/upload/raffle-image')) {
        cb(null, rafflesDir);
      } else if (req.originalUrl.includes('/upload/blog-image')) {
        cb(null, blogDir);
      } else if (req.originalUrl.includes('/upload/submissions')) {
        cb(null, submissionsDir);
      } else if (req.originalUrl.includes('/upload/before-after')) {
        cb(null, beforeAfterDir);
      } else {
        cb(null, productsDir);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ 
    storage: multerStorage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      // Check if file is an image
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'));
      }
    }
  });

  // --- AUTH ---
  // await setupAuth(app); // Temporarily disabled for local development
  setupSocialAuth(app);
  
  // New secure authentication routes
  const newAuthRoutes = (await import("./auth-routes")).default;
  app.use("/api/auth", newAuthRoutes);

  // Payment and shipping routes
  const paymentRoutes = (await import("./payment-routes")).default;
  app.use("/api/payment", paymentRoutes);

  // Order payment routes (for paying accepted offers)
  const orderPaymentRoutes = (await import("./order-payment-routes")).default;
  app.use("/api/order-payment", orderPaymentRoutes);

  // Wallet routes for member credit system
  const { registerWalletRoutes } = await import("./wallet-routes");
  registerWalletRoutes(app);
  
  // Check authentication status - works with both Replit Auth and session auth
  app.get('/api/auth/user', async (req: any, res) => {
    console.log("🚀 AUTH ENDPOINT HIT - /api/auth/user");
    try {
      console.log("🔍 Auth check - Session exists:", !!req.session);
      console.log("🔍 Auth check - Session user:", !!req.session?.user, "User ID:", req.session?.user?.id);
      console.log("🔍 Auth check - Session data:", req.session?.user);
      console.log("🔍 Auth check - Replit user:", !!req.user?.claims?.sub);
      console.log("🔍 Auth check - Headers:", req.headers.cookie ? "Cookies present" : "No cookies");
      
      // Check session-based authentication first
      if (req.session?.user) {
        console.log("✅ Session auth found:", req.session.user.email);
        return res.json(req.session.user);
      }

      // Check Replit Auth if available
      if (req.user?.claims?.sub) {
        console.log("✅ Replit auth found:", req.user.claims.sub);
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        if (user) {
          return res.json(user);
        }
      }

      // No authentication found
      console.log("❌ No authentication found - returning 401");
      res.status(401).json({ message: "Not authenticated" });
    } catch (error) {
      console.error("❌ Error in auth endpoint:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (isAdminUser(email, password)) {
      req.session.user = {
        id: "admin",
        email: ADMIN_EMAIL,
        firstName: "Admin",
        lastName: "User",
        role: "admin",
      };
      return res.json({
        success: true,
        user: req.session.user,
        redirectUrl: "/admin",
      });
    }
    // Check if user already exists in database
    let existingUser;
    try {
      existingUser = await storage.getUserByUsername(email);
    } catch (err) {
      console.log("Error checking for existing user:", err);
    }
    
    let userId;
    if (existingUser) {
      // Use existing user ID
      userId = existingUser.id;
      console.log("Using existing user ID:", userId);
    } else {
      // Create new user ID
      userId = `user_${email.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`;
      console.log("Creating new user ID:", userId);
    }
    
    const userData = {
      id: userId,
      email,
      firstName: email.split("@")[0],
      lastName: null,
      role: "user",
    };
    
    req.session.user = userData;
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Session save failed" });
      }
      console.log("User session saved successfully:", userId);
      res.json({
        success: true,
        user: userData,
        redirectUrl: "/members",
      });
    });
  });

  // Guest login endpoint
  app.post("/api/auth/guest-login", async (req: Request, res: Response) => {
    try {
      const { email, name } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email required" });
      }

      console.log("Guest login attempt for:", email);

      let user;
      try {
        user = await storage.getUserByUsername(email);
      } catch (err) {
        console.log("User not found, creating new one");
      }

      if (!user) {
        const [firstName, lastName] = (name || email.split('@')[0]).split(' ');
        const userId = `user_${email.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`;
        
        user = {
          id: userId,
          email,
          username: email,
          firstName: firstName || email.split('@')[0],
          lastName: lastName || '',
          profileImageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Save the user to database to avoid foreign key constraints
        try {
          await storage.upsertUser({
            id: userId,
            email,
            firstName: user.firstName,
            lastName: user.lastName
          });
          console.log("Guest user saved to database:", userId);
        } catch (dbError) {
          console.error("Failed to save guest user to database:", dbError);
          throw new Error("Failed to create user account");
        }
      }

      req.session.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: 'user'
      };

      req.session.save((err) => {
        if (err) {
          console.error("Guest session save error:", err);
          return res.status(500).json({ message: "Session save failed" });
        }
        console.log("Guest login successful for:", email);
        res.json({
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: 'user',
            profileImageUrl: user.profileImageUrl
          }
        });
      });
    } catch (error: any) {
      console.error("Guest login error:", error);
      res.status(500).json({ message: error.message || "Login failed" });
    }
  });

  // Get current user endpoint
  app.get("/api/auth/user", async (req: Request, res: Response) => {
    try {
      // First check session-based authentication
      if (req.session?.user) {
        console.log("Session-based user found:", req.session.user);
        return res.json(req.session.user);
      }
      
      // Check for user data from Replit authentication
      if (req.user) {
        console.log("Replit auth user found:", req.user);
        return res.json(req.user);
      }
      
      console.log("No authenticated user found");
      res.status(401).json({ message: "Not authenticated" });
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true, message: "Logged out successfully" });
    });
  });

  // Admin login route with rate limiting
  app.post("/api/admin/login", loginRateLimit, async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      if (isAdminUser(email, password)) {
        console.log("Admin login successful");
        
        const adminUser = {
          id: "admin",
          email: ADMIN_EMAIL,
          firstName: "Admin",
          lastName: "User",
          role: "admin"
        };
        
        // Set session user (best-effort — primary auth uses localStorage headers)
        req.session.user = adminUser;

        // Return success immediately — no session.save() needed
        res.json({ ...adminUser, redirectTo: "/admin" });
      } else {
        console.log("Invalid admin credentials");
        res.status(401).json({ message: "Invalid admin credentials" });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Admin login failed" });
    }
  });

  // Admin authentication check endpoint
  app.get("/api/admin/check-auth", async (req: Request, res: Response) => {
    try {
      const session = req.session as any;

      // Primary: session-based auth (cookie)
      if (session && session.user && session.user.role === "admin") {
        return res.json({ authenticated: true, email: session.user.email, user: session.user });
      }

      // Fallback: localStorage credentials via headers (works in iframe/cookie-blocked contexts)
      const headerEmail = req.headers['x-admin-email'] as string | undefined;
      const headerPassword = req.headers['x-admin-password'] as string | undefined;
      if (headerEmail && headerPassword && isAdminUser(headerEmail, headerPassword)) {
        return res.json({ authenticated: true, email: headerEmail, user: { id: 'admin', email: headerEmail, role: 'admin' } });
      }

      res.status(401).json({ authenticated: false, message: "Not authenticated as admin" });
    } catch (error) {
      console.error('Admin auth check error:', error);
      res.status(500).json({ authenticated: false, message: "Server error during auth check" });
    }
  });

  // Admin logout endpoint
  app.post("/api/admin/logout", async (req: Request, res: Response) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
          res.status(500).json({ 
            success: false, 
            message: "Error logging out" 
          });
        } else {
          res.json({ 
            success: true, 
            message: "Admin logout successful" 
          });
        }
      });
    } catch (error) {
      console.error('Admin logout error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Server error during logout" 
      });
    }
  });

  // Admin orders endpoint  
  app.get("/api/admin/orders", requireAdmin, getAdminOrders);

  // Admin submissions endpoint
  app.get("/api/admin/submissions", requireAdmin, getAllSubmissions);
  
  // Admin respond to submission endpoint
  app.post("/api/admin/submissions/:id", requireAdmin, respondToSubmission);
  
  // Admin counter offer response endpoint
  app.post("/api/admin/submissions/:id/negotiate", requireAdmin, handleAdminCounterResponse);
  
  // User respond to offer endpoint
  app.post("/api/submissions/:id/respond", async (req: Request, res: Response) => {
    try {
      // Check user authentication
      const session = req.session as any;
      
      if (!session?.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const submissionId = parseInt(req.params.id);
      const { action, counterOffer, response } = req.body;
      
      // Validate input
      if (!action || !['accept', 'reject', 'counter'].includes(action)) {
        return res.status(400).json({ message: 'Invalid action' });
      }
      
      if (action === 'counter' && (!counterOffer || parseFloat(counterOffer) <= 0)) {
        return res.status(400).json({ message: 'Valid counter offer amount required' });
      }
      
      // First, verify this submission belongs to the user
      // Map user ID - try both the original and _001 suffix version
      const possibleUserIds = [session.user.id, `${session.user.id}_001`];
      const verifyQuery = `
        SELECT id, user_id, title FROM item_submissions 
        WHERE id = $1 AND user_id = ANY($2)
      `;
      const verifyResult = await pool.query(verifyQuery, [submissionId, possibleUserIds]);
      
      if (verifyResult.rows.length === 0) {
        return res.status(404).json({ message: 'Submission not found or access denied' });
      }
      
      // Update submission based on action
      let updateQuery;
      let params;
      let newStatus;
      let newNegotiationStatus;
      
      switch (action) {
        case 'accept':
          newStatus = 'accepted';
          newNegotiationStatus = 'user_accepted';
          updateQuery = `
            UPDATE item_submissions 
            SET status = $1,
                negotiation_status = $2,
                user_response = $3,
                shipping_instructions = $4,
                bank_transfer_instructions = $5,
                updated_at = NOW()
            WHERE id = $6
            RETURNING *
          `;
          params = [
            newStatus,
            newNegotiationStatus,
            response || 'Offer accepted',
            'Shipping instructions and label will be sent to your email address shortly.',
            'Payment will be processed via bank transfer once your item is received and verified.',
            submissionId
          ];
          break;
          
        case 'reject':
          newStatus = 'rejected';
          newNegotiationStatus = 'user_rejected';
          updateQuery = `
            UPDATE item_submissions 
            SET status = $1,
                negotiation_status = $2,
                user_response = $3,
                updated_at = NOW()
            WHERE id = $4
            RETURNING *
          `;
          params = [newStatus, newNegotiationStatus, response || 'Offer declined', submissionId];
          break;
          
        case 'counter':
          newStatus = 'negotiating';
          newNegotiationStatus = 'user_countered';
          updateQuery = `
            UPDATE item_submissions 
            SET negotiation_status = $1,
                user_counter_offer = $2,
                user_response = $3,
                updated_at = NOW()
            WHERE id = $4
            RETURNING *
          `;
          params = [newNegotiationStatus, counterOffer, response || `Counter offer: £${counterOffer}`, submissionId];
          break;
          
        default:
          return res.status(400).json({ message: 'Invalid action' });
      }
      
      const result = await pool.query(updateQuery, params);
      
      if (result.rows.length > 0) {
        return res.json({ 
          success: true, 
          submission: result.rows[0],
          message: `Your ${action === 'counter' ? 'counter offer' : action + 'ance'} has been sent to the admin team.`
        });
      } else {
        return res.status(500).json({ message: 'Failed to update submission' });
      }
      
    } catch (error) {
      console.error('Error responding to offer:', error);
      return res.status(500).json({ message: 'Failed to respond to offer' });
    }
  });
  
  // Update order status endpoint
  app.patch("/api/admin/orders/:id/status", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Check admin authentication
      const adminEmail = req.headers['x-admin-email'];
      const adminPassword = req.headers['x-admin-password'];
      
      if (!adminEmail || !adminPassword || 
          adminEmail !== 'Mattapinch@gmail.com' || 
          adminPassword !== '@Kawasak16724020000') {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      // Validate status value
      const validStatuses = ['awaiting_crypto_payment', 'awaiting_bank_transfer', 'pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }

      // Update order status in database
      const result = await pool.query(
        `UPDATE orders 
         SET status = $1, updated_at = NOW() 
         WHERE id = $2
         RETURNING *`,
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json({ 
        message: 'Order status updated successfully',
        order: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Mark order as shipped with tracking info and send shipping notification email
  app.patch("/api/admin/orders/:id/ship", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { trackingNumber, carrier, estimatedDelivery } = req.body;
      
      // Check admin authentication
      const adminEmail = req.headers['x-admin-email'];
      const adminPassword = req.headers['x-admin-password'];
      
      if (!adminEmail || !adminPassword || 
          adminEmail !== 'Mattapinch@gmail.com' || 
          adminPassword !== '@Kawasak16724020000') {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!trackingNumber || !carrier) {
        return res.status(400).json({ error: 'Tracking number and carrier are required' });
      }

      // Update order with tracking info and status
      const result = await pool.query(
        `UPDATE orders 
         SET status = 'shipped', 
             tracking_number = $1, 
             carrier = $2, 
             estimated_delivery = $3,
             shipped_at = NOW(),
             updated_at = NOW() 
         WHERE id = $4
         RETURNING *`,
        [trackingNumber, carrier, estimatedDelivery || null, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const order = result.rows[0];

      // Get order items for email
      const itemsResult = await pool.query(
        `SELECT oi.*, p.name as product_name 
         FROM order_items oi 
         LEFT JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = $1`,
        [id]
      );

      const items = itemsResult.rows.map(row => ({
        name: row.product_name || row.name || 'Unknown Product',
        quantity: row.quantity,
        price: row.price,
      }));

      // Get customer info for email
      let customerEmail = '';
      let customerName = 'Valued Customer';
      
      // First try to get email from user account
      if (order.user_id) {
        const userResult = await pool.query(
          `SELECT email, first_name, last_name, username FROM users WHERE id = $1`,
          [order.user_id]
        );
        if (userResult.rows.length > 0) {
          const user = userResult.rows[0];
          customerEmail = user.email || '';
          customerName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || 'Valued Customer';
        }
      }
      
      // Fallback to shipping address if no user email found
      if (!customerEmail && order.shipping_address) {
        try {
          const shippingAddress = typeof order.shipping_address === 'string' 
            ? JSON.parse(order.shipping_address) 
            : order.shipping_address;
          customerEmail = shippingAddress.email || '';
          customerName = shippingAddress.name || shippingAddress.firstName 
            ? `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim() 
            : 'Valued Customer';
        } catch (e) {
          console.error('Error parsing shipping address for email:', e);
        }
      }

      // Send shipping notification email
      if (customerEmail) {
        try {
          await sendShippingNotificationEmail({
            customerEmail,
            customerName,
            orderId: id,
            trackingNumber,
            carrier,
            estimatedDelivery: estimatedDelivery || undefined,
            items,
          });
          console.log(`✅ Shipping notification email sent for order ${id}`);
        } catch (emailError) {
          console.error('Failed to send shipping notification email:', emailError);
        }
      }

      res.json({ 
        message: 'Order marked as shipped and notification sent',
        order: result.rows[0]
      });
    } catch (error) {
      console.error('Error marking order as shipped:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // --- PRODUCTS ---
  app.get("/api/products", apiRateLimit, async (req, res) => {
    try {
      const { category, era, condition, search, page = "1", pageSize = "12", sort = "featured", minPrice, maxPrice, materials } = req.query;
      
      const filters: any = {};
      if (category && category !== "all") filters.category = category as string;
      if (era && era !== "all") filters.era = era as string;
      if (condition) {
        filters.condition = (condition as string).split(',');
      }
      if (search) filters.search = search as string;
      if (minPrice) filters.priceMin = minPrice as string;
      if (maxPrice) filters.priceMax = maxPrice as string;
      if (materials) filters.materials = materials as string;
      
      const pageNum = parseInt(page as string);
      const pageSizeNum = parseInt(pageSize as string);
      const sortOption = sort as string;
      
      const result = await storage.getProducts(filters, pageNum, pageSizeNum, sortOption);
      res.json(result);
    } catch (error) {
      console.error("GET /api/products error:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const featuredProducts = await storage.getFeaturedProducts();
      res.json(featuredProducts);
    } catch (error) {
      console.error("GET /api/products/featured error:", error);
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      console.log("Creating product with data:", JSON.stringify(req.body, null, 2));
      
      const formData = { ...req.body };
      
      // Convert form data to proper types
      if (formData.categoryId) {
        formData.categoryId = Number(formData.categoryId);
      }
      
      if (formData.price) {
        formData.price = Number(formData.price);
      }
      
      if (formData.originalPrice) {
        formData.originalPrice = Number(formData.originalPrice);
      }
      
      if (formData.stockQuantity) {
        formData.stockQuantity = Number(formData.stockQuantity);
      }
      
      // Handle array fields
      if (formData.materials && typeof formData.materials === 'string') {
        formData.materials = formData.materials.split(',').map(item => item.trim()).filter(Boolean);
      }
      
      if (formData.additionalImages && typeof formData.additionalImages === 'string') {
        formData.additionalImages = formData.additionalImages.split(',').map(item => item.trim()).filter(Boolean);
      }
      
      // Ensure boolean fields
      formData.isFeatured = Boolean(formData.isFeatured);
      formData.isBestSeller = Boolean(formData.isBestSeller);
      formData.inStock = Boolean(formData.inStock);
      
      // Use storage layer for consistent data handling
      const product = await storage.createProduct(formData);
      
      console.log("Product created successfully:", product);
      res.status(201).json(product);
    } catch (error) {
      console.error("POST /api/products error:", error);
      res.status(500).json({ message: "Failed to create product", error: error.message });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    console.log("🔧 PATCH /api/products/:id - Request received");
    console.log("🔧 Product ID:", req.params.id);
    console.log("🔧 Request body:", JSON.stringify(req.body, null, 2));
    
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        console.log("❌ Invalid product ID:", req.params.id);
        return res.status(400).json({ message: "Invalid product ID" });
      }

      console.log("✅ Product ID valid:", productId);
      console.log("Updating product with data:", JSON.stringify(req.body, null, 2));
      
      const formData = { ...req.body };
      
      // Convert form data to proper types and fix field naming
      if (formData.categoryId) {
        formData.categoryId = Number(formData.categoryId);
      }
      
      if (formData.price) {
        formData.price = Number(formData.price);
      }
      
      if (formData.originalPrice) {
        formData.originalPrice = Number(formData.originalPrice);
      }
      
      if (formData.stockQuantity) {
        formData.stockQuantity = Number(formData.stockQuantity);
      }
      
      // Handle array fields
      if (formData.materials && typeof formData.materials === 'string') {
        formData.materials = formData.materials.split(',').map(item => item.trim()).filter(Boolean);
      }
      
      if (formData.additionalImages && typeof formData.additionalImages === 'string') {
        formData.additionalImages = formData.additionalImages.split(',').map(item => item.trim()).filter(Boolean);
      }
      
      // Ensure boolean fields
      formData.isFeatured = Boolean(formData.isFeatured);
      formData.isBestSeller = Boolean(formData.isBestSeller);
      formData.inStock = Boolean(formData.inStock);
      
      // Remove any undefined/null fields and categoryIds field that could cause issues
      Object.keys(formData).forEach(key => {
        if (formData[key] === undefined || formData[key] === null || formData[key] === '' || key === 'categoryIds') {
          delete formData[key];
        }
      });
      
      console.log("Formatted product data for update:", JSON.stringify(formData, null, 2));
      
      // Use storage layer for consistent data handling
      console.log("🔧 About to call storage.updateProduct");
      const product = await storage.updateProduct(productId, formData);
      console.log("✅ storage.updateProduct completed successfully");
      
      console.log("Product updated successfully:", product);
      res.json(product);
    } catch (error) {
      console.error("PATCH /api/products/:id error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        productId: req.params.id,
        formData: req.body
      });
      res.status(500).json({ message: "Failed to update product", error: error.message });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      // Use storage layer for consistent data handling
      const success = await storage.deleteProduct(productId);
      
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      console.log("Product deleted successfully:", productId);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("DELETE /api/products/:id error:", error);
      res.status(500).json({ message: "Failed to delete product", error: error.message });
    }
  });

  app.get("/api/products/admin", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string || "1");
      const pageSize = parseInt(req.query.pageSize as string || "10");
      const search = req.query.search as string || "";
      
      const filters: any = {};
      if (search) filters.search = search;
      
      const result = await storage.getProducts(filters, page, pageSize, "newest");
      res.json(result);
    } catch (error) {
      console.error("GET /api/products/admin error:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get products sold in completed orders
  app.get("/api/products/sold", async (req: any, res) => {
    try {
      const session = req.session as any;
      if (!session?.user || session.user.role !== "admin") {
        return res.status(401).json({ message: "Admin access required" });
      }

      // Get products that have been included in paid/completed orders
      const { rows } = await pool.query(`
        SELECT DISTINCT
          p.*,
          c.name as category_name,
          MAX(o.created_at) as sold_at,
          MAX(o.id) as order_id
        FROM products p
        JOIN order_items oi ON oi.product_id = p.id
        JOIN orders o ON o.id = oi.order_id
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE o.payment_status = 'paid' OR o.payment_status = 'completed'
        GROUP BY p.id, c.name
        ORDER BY MAX(o.created_at) DESC
      `);
      
      res.json({ products: rows });
    } catch (error) {
      console.error("GET /api/products/sold error:", error);
      res.status(500).json({ message: "Failed to fetch sold products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProductById(productId);
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      console.error("GET /api/products/:id error:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // --- CART ---
  app.get("/api/cart", async (req: any, res) => {
    try {
      const sessUser = req.session?.user;
      if (!sessUser?.id) {
        // Return empty cart for unauthenticated users instead of error
        return res.json({
          items: [],
          subtotal: 0,
          shipping: 0,
          tax: 0,
          total: 0,
          discount: 0,
        });
      }
      
      // Map session user ID to database user ID (handle admin mapping)
      const actualUserId = sessUser.id === 'admin' ? 'admin_001' : sessUser.id.toString();
      console.log("🛒 FRONTEND CART API: Session user:", sessUser);
      console.log("🛒 FRONTEND CART API: Using userId:", actualUserId);
      
      const cart = await storage.getCart(actualUserId);
      console.log("🛒 FRONTEND CART API: Cart result:", cart);
      
      res.json(cart);
    } catch (err) {
      console.error("GET /api/cart error:", err);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req: any, res) => {
    try {
      const sessUser = req.session?.user;
      if (!sessUser?.id) {
        return res.status(401).json({ 
          message: "Please log in to add items to your cart",
          requireAuth: true
        });
      }
      
      console.log("🛒 POST CART: Session user:", sessUser);

      const { raffleId, productId, quantity, type } = req.body;
      
      // Validate type is exactly one of the allowed values
      if (type !== "raffle_ticket" && type !== "product") {
        return res.status(400).json({ message: "Invalid item type. Must be 'raffle_ticket' or 'product'" });
      }
      
      if (typeof quantity !== "number" || quantity <= 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      // Handle raffle tickets
      if (type === "raffle_ticket") {
        if (!raffleId) {
          return res.status(400).json({ message: "Raffle ID required for tickets" });
        }

        // Check raffle ticket availability
        const raffleResult = await pool.query(
          "SELECT max_tickets, tickets_sold FROM raffles WHERE id = $1",
          [raffleId]
        );
        
        if (raffleResult.rows.length === 0) {
          return res.status(404).json({ message: "Raffle not found" });
        }
        
        const raffle = raffleResult.rows[0];
        const availableTickets = raffle.max_tickets - raffle.tickets_sold;
        
        if (availableTickets <= 0) {
          return res.status(400).json({ 
            message: "This raffle is sold out",
            availableTickets: 0
          });
        }
        
        if (quantity > availableTickets) {
          return res.status(400).json({ 
            message: `Only ${availableTickets} ticket${availableTickets === 1 ? '' : 's'} remaining`,
            availableTickets
          });
        }
      }

      // Handle products
      if (type === "product") {
        if (!productId) {
          return res.status(400).json({ message: "Product ID required" });
        }

        // Check product exists and is in stock
        const productResult = await pool.query(
          "SELECT id, name, in_stock, stock_quantity FROM products WHERE id = $1",
          [productId]
        );
        
        if (productResult.rows.length === 0) {
          return res.status(404).json({ message: "Product not found" });
        }
        
        const product = productResult.rows[0];
        if (!product.in_stock) {
          return res.status(400).json({ message: "This product is out of stock" });
        }
        
        if (product.stock_quantity !== null && quantity > product.stock_quantity) {
          return res.status(400).json({ 
            message: `Only ${product.stock_quantity} available`,
            availableQuantity: product.stock_quantity
          });
        }
      }

      // Map session user ID to database user ID (handle admin mapping)
      const actualUserId = sessUser.id === 'admin' ? 'admin_001' : sessUser.id.toString();

      const cartItem = await storage.addToCart({
        userId: actualUserId,
        productId: type === "product" ? productId : null,
        raffleId: type === "raffle_ticket" ? raffleId : null,
        quantity,
        type,
      });
      
      console.log("🛒 POST CART: Added item:", cartItem);
      res.status(201).json(cartItem);
    } catch (err) {
      console.error("POST /api/cart error:", err);
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  app.patch("/api/cart/:id", async (req: any, res) => {
    try {
      const userId = req.session?.user?.id || "anonymous";
      const itemId = Number(req.params.id);
      const updated = await storage.updateCartItemQuantity(
        userId,
        itemId,
        req.body.quantity,
      );
      if (updated) return res.json({ success: true });
      res.status(404).json({ message: "Cart item not found" });
    } catch (err) {
      console.error("PATCH /api/cart/:id error:", err);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req: any, res) => {
    try {
      const userId = req.session?.user?.id || "anonymous";
      const itemId = Number(req.params.id);
      const deleted = await storage.removeFromCart(userId, itemId);
      if (deleted) return res.json({ success: true });
      res.status(404).json({ message: "Cart item not found" });
    } catch (err) {
      console.error("DELETE /api/cart/:id error:", err);
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  // --- ORDERS ---
  // Create order after successful payment
  app.post("/api/orders", async (req: any, res) => {
    try {
      console.log("📦 ORDER CREATION: Request received:", req.body);
      const userId = req.session?.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { paymentIntentId, orderId, amount, currency, status } = req.body;
      
      // Get cart items for this user
      const cartData = await storage.getCart(userId);
      if (!cartData.items || cartData.items.length === 0) {
        return res.status(400).json({ message: "No cart items to process" });
      }

      console.log("📦 ORDER CREATION: Processing cart items:", cartData.items);

      // Create order record first
      const [createdOrder] = await db.insert(orders).values({
        id: orderId, // Use the provided orderId (e.g., "order_1753101089307")
        userId: userId,
        status: 'processing',
        paymentStatus: 'paid',
        subtotal: amount.toString(),
        shipping: '0',
        tax: '0', 
        total: amount.toString(),
        paytriotPaymentId: paymentIntentId,
        shippingAddress: {},
        billingAddress: {},
        paymentMethod: 'paytriot',
      }).returning();

      console.log("📦 ORDER CREATION: Order record created:", createdOrder);

      // Add order items
      for (const item of cartData.items) {
        await db.insert(orderItems).values({
          orderId: orderId,
          productId: item.productId || null,
          raffleId: item.raffleId || null,
          name: item.name,
          price: item.price.toString(),
          quantity: item.quantity,
          type: item.type,
        });
      }

      // Process raffle tickets
      const raffleTickets = [];
      for (const item of cartData.items) {
        if (item.type === "raffle_ticket" && item.raffleId) {
          console.log(`🎫 Processing ${item.quantity} tickets for raffle ${item.raffleId}`);
          
          // Generate random ticket numbers
          const { generateRandomTicketNumbers } = await import("./new-order-system");
          const ticketNumbers = await generateRandomTicketNumbers(
            parseInt(item.raffleId),
            item.quantity
          );

          // Create raffle entry
          await pool.query(
            `INSERT INTO raffle_entries (raffle_id, user_id, ticket_count, ticket_numbers, created_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [parseInt(item.raffleId), userId, item.quantity, ticketNumbers]
          );

          // Update raffle tickets sold count
          await pool.query(
            "UPDATE raffles SET tickets_sold = tickets_sold + $1 WHERE id = $2",
            [item.quantity, parseInt(item.raffleId)]
          );

          raffleTickets.push({
            raffleId: item.raffleId,
            quantity: item.quantity,
            ticketNumbers
          });

          console.log(`✅ Created raffle entry for ${item.quantity} tickets:`, ticketNumbers);
        }
      }

      // Clear the cart after successful order
      await storage.clearCart(userId);

      console.log("📦 ORDER CREATION: Order completed successfully");
      res.json({ 
        success: true, 
        orderId,
        raffleTickets,
        message: "Order created successfully" 
      });

    } catch (err: any) {
      console.error("📦 ORDER CREATION ERROR:", err);
      res.status(500).json({ message: "Failed to create order", error: err.message });
    }
  });

  // Create Payment Intent
  // Paytriot payment endpoint for raffle support
  app.post("/api/create-payment-intent", async (req: any, res) => {
    try {
      console.log("💳 PAYTRIOT PAYMENT: Request body:", req.body);
      
      const { amount, cartItems, checkoutType, shippingAddress } = req.body;
      
      // Calculate total from cart items if amount not provided
      let totalAmount = amount;
      if (!totalAmount && cartItems && Array.isArray(cartItems)) {
        totalAmount = cartItems.reduce((total: number, item: any) => {
          return total + (parseFloat(item.price) * parseInt(item.quantity));
        }, 0);
        
        // NO TAX, NO SHIPPING for digital items like raffle tickets
        console.log("💳 SIMPLE CALCULATION: Subtotal only:", totalAmount);
      }
      
      if (typeof totalAmount !== "number" || totalAmount <= 0) {
        console.log("💳 PAYTRIOT PAYMENT: Invalid amount:", totalAmount, typeof totalAmount);
        throw new Error("Invalid amount calculated");
      }
      
      const amountInPence = Math.round(totalAmount * 100);
      console.log("💳 PAYTRIOT PAYMENT: Creating payment for £", totalAmount, "pence:", amountInPence);
      
      // For now, simulate Paytriot payment creation
      // TODO: Replace with actual Paytriot API when credentials are provided
      const mockPaymentIntent = {
        id: `paytriot_${Date.now()}`,
        client_secret: `paytriot_secret_${Date.now()}`,
        amount: amountInPence,
        currency: "gbp",
        status: "requires_payment_method"
      };
      
      console.log("💳 PAYTRIOT PAYMENT: Created successfully:", mockPaymentIntent.id);
      res.json({ 
        clientSecret: mockPaymentIntent.client_secret,
        orderId: `order_${Date.now()}` // Temporary order ID for tracking
      });
    } catch (err: any) {
      console.error("💳 PAYTRIOT PAYMENT ERROR:", err);
      res
        .status(500)
        .json({ message: err.message || "Failed to create payment intent" });
    }
  });

  // Save order + clear cart
  app.post("/api/save-order", async (req: any, res: Response) => {
    try {
      // 1) grab the logged-in user from the session
      const sessUser = req.session?.user;
      if (!sessUser?.id) {
        return res.status(401).json({ message: "Not logged in" });
      }

      // 2) now define userId BEFORE you build the payload
      const userId = sessUser.id;

      // 3) pull everything else off the request body
      const { paymentIntentId, shippingDetails, billingDetails, cartData, fulfillmentMethod, collectionDate, collectionTimeSlot } =
        req.body;

      // Validate click & collect fields
      if (fulfillmentMethod === 'click_collect') {
        if (!collectionDate) {
          return res.status(400).json({ message: "Collection date is required for Click & Collect orders" });
        }
        if (!collectionTimeSlot) {
          return res.status(400).json({ message: "Collection time slot is required for Click & Collect orders" });
        }
        // Validate weekday
        const date = new Date(collectionDate);
        const day = date.getDay();
        if (day === 0 || day === 6) {
          return res.status(400).json({ message: "Collection is only available Monday to Friday" });
        }
      }

      // 4) assemble your order object to exactly match your storage.createOrder signature
      const orderPayload = {
        userId,
        paymentIntentId,
        paymentMethod: paymentIntentId, // or any string you choose
        shippingAddress: JSON.stringify(shippingDetails),
        billingAddress: JSON.stringify(billingDetails),
        subtotal: Number(cartData.subtotal),
        shipping: Number(cartData.shipping),
        tax: Number(cartData.tax),
        total: Number(cartData.total),
        discount: Number(cartData.discount),
        fulfillmentMethod: fulfillmentMethod || 'delivery',
        collectionDate: collectionDate ? new Date(collectionDate) : null,
        collectionTimeSlot: collectionTimeSlot || null,
      };

      // 5) transform your cart items into InsertCartItem[]
      const items = (cartData.items || []).map((i: any) => ({
        productId: i.productId ? Number(i.productId) : null,
        raffleId: i.raffleId ? Number(i.raffleId) : null,
        quantity: Number(i.quantity),
        price: Number(i.price),
        name: i.name,
        type: i.type,
      }));

      // 6) finally call your storage layer
      const order = await storage.createOrder(orderPayload, items);
      
      // 7) Validate raffle ticket availability before processing
      for (const item of items) {
        if (item.type === "raffle_ticket" && item.raffleId) {
          const raffleCheck = await pool.query(
            "SELECT max_tickets, tickets_sold FROM raffles WHERE id = $1",
            [item.raffleId]
          );
          
          if (raffleCheck.rows.length === 0) {
            throw new Error(`Raffle ${item.raffleId} not found`);
          }
          
          const raffle = raffleCheck.rows[0];
          const availableTickets = raffle.max_tickets - raffle.tickets_sold;
          
          if (availableTickets <= 0) {
            throw new Error(`Raffle is sold out`);
          }
          
          if (item.quantity > availableTickets) {
            throw new Error(`Not enough tickets available. Requested ${item.quantity}, but only ${availableTickets} left.`);
          }
        }
      }

      // 8) Handle raffle tickets and instant wins
      const instantWins: any[] = [];
      for (const item of items) {
        if (item.type === "raffle_ticket" && item.raffleId) {
          // a) bump the tickets_sold counter
          await pool.query(
            "UPDATE raffles SET tickets_sold = tickets_sold + $1 WHERE id = $2",
            [item.quantity, item.raffleId],
          );

          // b) generate random ticket numbers (reuse your function)
          const ticketNumbers = await generateRandomTicketNumbers(
            item.raffleId,
            item.quantity,
          );

          // c) insert into raffle_entries
          await pool.query(
            `INSERT INTO raffle_entries
              (raffle_id, user_id, ticket_count, ticket_numbers)
            VALUES ($1, $2, $3, $4)`,
            [item.raffleId, userId, item.quantity, ticketNumbers],
          );
          
          // d) Check for instant wins
          const { checkForInstantWin } = await import("./new-order-system");
          const instantWinResult = await checkForInstantWin(item.raffleId, item.quantity);
          if (instantWinResult.won) {
            console.log(`🎉 INSTANT WIN! User ${userId} won: ${instantWinResult.prize}`);
            
            // Handle multiple wins if they exist
            if (instantWinResult.wins && instantWinResult.wins.length > 1) {
              // Multiple wins - save each one
              for (const win of instantWinResult.wins) {
                const instantWinRecord = await pool.query(`
                  INSERT INTO instant_wins (raffle_id, user_id, prize_type, prize_amount, created_at)
                  VALUES ($1, $2, $3, $4, NOW())
                  RETURNING *
                `, [item.raffleId, userId, win.prizeType, win.amount]);
                
                instantWins.push({
                  id: instantWinRecord.rows[0].id,
                  raffleId: item.raffleId,
                  prize: win.prize,
                  prizeType: win.prizeType,
                  amount: win.amount
                });
              }
            } else {
              // Single win - save it
              const instantWinRecord = await pool.query(`
                INSERT INTO instant_wins (raffle_id, user_id, prize_type, prize_amount, created_at)
                VALUES ($1, $2, $3, $4, NOW())
                RETURNING *
              `, [item.raffleId, userId, instantWinResult.prizeType, instantWinResult.amount]);
              
              instantWins.push({
                id: instantWinRecord.rows[0].id,
                raffleId: item.raffleId,
                prize: instantWinResult.prize,
                prizeType: instantWinResult.prizeType,
                amount: instantWinResult.amount
              });
            }
          }
        }
      }
      await storage.clearCart(userId);
      
      // 8) send back the new order ID and instant wins
      res.json({ 
        orderId: order.id,
        instantWins: instantWins
      });
    } catch (err: any) {
      console.error("POST /api/save-order error:", err);
      res.status(500).json({ message: err.message || "Failed to save order" });
    }
  });

  // Create crypto payment order (Bitcoin/Ethereum)
  app.post("/api/orders/crypto", async (req: any, res: Response) => {
    try {
      const sessUser = req.session?.user;
      if (!sessUser?.id) {
        return res.status(401).json({ message: "Not logged in" });
      }

      const userId = sessUser.id;
      const { shippingDetails, billingDetails, cartData, cryptoCurrency, transactionHash, fulfillmentMethod, collectionDate, collectionTimeSlot } = req.body;

      if (!cryptoCurrency || !['btc', 'eth'].includes(cryptoCurrency)) {
        return res.status(400).json({ message: "Invalid cryptocurrency type" });
      }

      if (!cartData || !cartData.items || cartData.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Validate click & collect fields
      if (fulfillmentMethod === 'click_collect') {
        if (!collectionDate) {
          return res.status(400).json({ message: "Collection date is required for Click & Collect orders" });
        }
        if (!collectionTimeSlot) {
          return res.status(400).json({ message: "Collection time slot is required for Click & Collect orders" });
        }
        // Validate weekday
        const date = new Date(collectionDate);
        const day = date.getDay();
        if (day === 0 || day === 6) {
          return res.status(400).json({ message: "Collection is only available Monday to Friday" });
        }
      }

      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      
      await pool.query(
        `INSERT INTO orders (
          id, user_id, status, subtotal, shipping, tax, discount, total,
          shipping_address, billing_address, payment_method, payment_status,
          crypto_transaction_hash, fulfillment_method, collection_date, collection_time_slot, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
        RETURNING *`,
        [
          orderId,
          userId,
          'awaiting_crypto_payment',
          Number(cartData.subtotal),
          Number(cartData.shipping),
          Number(cartData.tax),
          Number(cartData.discount || 0),
          Number(cartData.total),
          JSON.stringify(shippingDetails),
          JSON.stringify(billingDetails),
          `crypto_${cryptoCurrency}`,
          'awaiting_confirmation',
          transactionHash || null,
          fulfillmentMethod || 'delivery',
          collectionDate ? new Date(collectionDate) : null,
          collectionTimeSlot || null
        ]
      );

      const items = (cartData.items || []).map((i: any) => ({
        productId: i.productId ? Number(i.productId) : null,
        raffleId: i.raffleId ? Number(i.raffleId) : null,
        quantity: Number(i.quantity),
        price: Number(i.price),
        name: i.name,
        type: i.type || 'product',
      }));

      for (const item of items) {
        await pool.query(
          `INSERT INTO order_items (order_id, product_id, raffle_id, name, price, quantity, type, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [orderId, item.productId, item.raffleId, item.name, item.price, item.quantity, item.type]
        );

        if (item.productId) {
          await pool.query(
            `UPDATE products SET in_stock = false, stock_quantity = 0, updated_at = NOW() WHERE id = $1`,
            [item.productId]
          );
        }
      }

      await storage.clearCart(userId);

      res.json({
        success: true,
        orderId: orderId,
        message: "Order created. Payment is being verified. Please allow up to 12 hours for confirmation."
      });
    } catch (err: any) {
      console.error("POST /api/orders/crypto error:", err);
      res.status(500).json({ message: err.message || "Failed to create crypto order" });
    }
  });

  // Admin confirm crypto or bank transfer payment
  app.patch("/api/admin/orders/:id/confirm-crypto", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const orderCheck = await pool.query(
        `SELECT * FROM orders WHERE id = $1`,
        [id]
      );

      if (orderCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const order = orderCheck.rows[0];
      
      // Accept both crypto and bank transfer payment confirmations
      if (order.status !== 'awaiting_crypto_payment' && order.status !== 'awaiting_bank_transfer') {
        return res.status(400).json({ error: 'Order is not awaiting payment confirmation' });
      }

      const isBankTransfer = order.status === 'awaiting_bank_transfer';

      const result = await pool.query(
        `UPDATE orders 
         SET status = 'processing', 
             payment_status = 'paid',
             crypto_confirmed_at = NOW(),
             updated_at = NOW() 
         WHERE id = $1
         RETURNING *`,
        [id]
      );

      const updatedOrder = result.rows[0];

      const itemsResult = await pool.query(
        `SELECT oi.*, p.name as product_name 
         FROM order_items oi 
         LEFT JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = $1`,
        [id]
      );

      const items = itemsResult.rows.map(row => ({
        name: row.product_name || row.name || 'Unknown Product',
        quantity: row.quantity,
        price: row.price,
      }));

      let customerEmail = '';
      try {
        const shippingAddress = typeof updatedOrder.shipping_address === 'string' 
          ? JSON.parse(updatedOrder.shipping_address) 
          : updatedOrder.shipping_address;
        customerEmail = shippingAddress.email || '';
      } catch (e) {
        console.error('Error parsing shipping address:', e);
      }

      if (customerEmail) {
        if (isBankTransfer) {
          // Send bank transfer confirmation email
          await sendCryptoPaymentConfirmedEmail(customerEmail, {
            orderId: id,
            cryptoType: 'Bank Transfer',
            items: items,
            total: updatedOrder.total,
          });
        } else {
          const cryptoType = updatedOrder.payment_method === 'crypto_btc' ? 'Bitcoin' : 'Ethereum';
          await sendCryptoPaymentConfirmedEmail(customerEmail, {
            orderId: id,
            cryptoType: cryptoType,
            items: items,
            total: updatedOrder.total,
          });
        }
      }

      res.json({ 
        success: true,
        message: isBankTransfer ? 'Bank transfer confirmed successfully' : 'Crypto payment confirmed successfully',
        order: updatedOrder
      });
    } catch (error) {
      console.error('Error confirming payment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


  // Fetch all of this user’s orders, with item details
  app.get("/api/orders", async (req, res) => {
    try {
      const sessUser = req.session.user;
      if (!sessUser?.id)
        return res.status(401).json({ message: "Not logged in" });

      console.log("Fetching orders for user:", sessUser.id);

      // Run a SQL query that grabs order + its line-items
      const { rows } = await pool.query(
        `SELECT
           o.id                AS "orderId",
           o.created_at        AS "createdAt",
           o.status            AS "status",
           oi.product_id       AS "productId",
           p.name              AS "productName",
           oi.quantity         AS "quantity",
           oi.price       AS "unitPrice"
         FROM orders o
         JOIN order_items oi ON oi.order_id = o.id
         JOIN products p     ON p.id = oi.product_id
         WHERE o.user_id = $1
         ORDER BY o.created_at DESC`,
        [sessUser.id],
      );

      console.log("Found orders:", rows.length);
      return res.json(rows);
    } catch (error) {
      console.error("Error fetching orders:", error);
      return res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // === Fetch a single order by ID ===
  app.get("/api/orders/:id", async (req: any, res: Response) => {
    try {
      const orderId = req.params.id;
      console.log("Fetching order:", orderId);
      
      // Check if there's a paymentIntentId in query params for order confirmation access
      const paymentIntentId = req.query.paymentIntent;
      
      const order = await storage.getOrderById(orderId);
      if (!order) {
        console.log("Order not found:", orderId);
        return res.status(404).json({ message: "Order not found" });
      }
      
      // If paymentIntentId is provided and matches, allow access without authentication
      // This allows the order confirmation page to work immediately after payment
      if (paymentIntentId && (order.stripePaymentIntentId === paymentIntentId || order.paytriotPaymentId === paymentIntentId)) {
        console.log("Order access granted via payment intent verification");
        return res.json(order);
      }
      
      // Also allow access by orderId alone for recently created orders (within last hour)
      // This supports the checkout flow where user might not be logged in
      const orderCreatedAt = new Date(order.createdAt);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (orderCreatedAt > oneHourAgo) {
        console.log("Order access granted - recently created order");
        return res.json(order);
      }
      
      // Otherwise, require authentication to access order
      const sessUser = req.session?.user;
      if (!sessUser?.id) {
        console.log("No session user for order access");
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Check if order belongs to current user
      if (order.userId !== sessUser.id) {
        console.log("Order does not belong to current user");
        return res.status(403).json({ message: "Access denied" });
      }
      
      return res.json(order);
    } catch (err: any) {
      console.error("GET /api/orders/:id error:", err);
      return res
        .status(500)
        .json({ message: err.message || "Failed to fetch order" });
    }
  });

  // Clear cart (client-side can still call if desired)
  app.post("/api/clear-cart", async (req: any, res) => {
    try {
      const sessUser = req.session?.user;
      if (!sessUser?.id)
        return res.status(401).json({ message: "Not logged in" });
      await storage.clearCart(sessUser.id);
      res.json({ success: true });
    } catch (err) {
      console.error("POST /api/clear-cart error:", err);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Calculate shop shipping cost for cart items
  app.post("/api/calculate-shop-shipping", async (req: Request, res: Response) => {
    try {
      const { items, country, selectedService } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ 
          success: false,
          error: "Please provide cart items" 
        });
      }
      
      if (!country || typeof country !== 'string') {
        return res.status(400).json({ 
          success: false,
          error: "Please provide a destination country" 
        });
      }
      
      // Fetch product shipping info from database
      const productIds = items.map((item: any) => item.productId);
      const productResults = await db
        .select({
          id: products.id,
          name: products.name,
          weightGrams: products.weightGrams,
          parcelType: products.parcelType,
        })
        .from(products)
        .where(inArray(products.id, productIds));
      
      // Validate all requested products were found
      if (productResults.length !== productIds.length) {
        const foundIds = new Set(productResults.map(p => p.id));
        const missingIds = productIds.filter((id: number) => !foundIds.has(id));
        console.log(`Shipping calculation: Some products not found: ${missingIds.join(', ')}`);
        // Continue with found products instead of failing
      }
      
      // Build cart items with shipping info, using defaults for missing data
      const cartItems: CartItem[] = productResults.map(product => ({
        productId: product.id,
        name: product.name,
        // Default to 500g (typical small antique) if not configured
        weightGrams: product.weightGrams || 500,
        // Default to small_parcel if not configured
        parcelType: (product.parcelType || 'small_parcel') as ParcelType,
      }));
      
      if (cartItems.length === 0) {
        return res.status(400).json({ 
          success: false,
          error: "No valid products found" 
        });
      }
      
      // Calculate with selected service (defaults to tracked_48 if not provided)
      const service: ShippingService = selectedService || 'tracked_48';
      const shippingResult = calculateCombinedShipping(cartItems, country, service);
      
      return res.json({
        success: true,
        ...shippingResult,
        requiredParcelTypeName: getParcelTypeName(shippingResult.requiredParcelType),
        zoneName: getZoneName(shippingResult.zone),
      });
    } catch (err) {
      console.error("POST /api/calculate-shop-shipping error:", err);
      return res.status(500).json({ 
        success: false,
        error: "Failed to calculate shipping cost" 
      });
    }
  });

  // Get Stripe publishable key for frontend
  app.get("/api/stripe/publishable-key", async (req: Request, res: Response) => {
    try {
      const { getStripePublishableKey } = await import("./stripeClient");
      const publishableKey = await getStripePublishableKey();
      return res.json({ publishableKey });
    } catch (err: any) {
      console.error("Failed to get Stripe publishable key:", err);
      return res.status(500).json({ error: "Payment system unavailable" });
    }
  });

  // Create shop checkout payment intent
  app.post("/api/shop/create-payment-intent", async (req: Request, res: Response) => {
    try {
      const { items, country, selectedService, customerInfo, fulfillmentMethod, collectionDate, collectionTimeSlot } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "No items in cart" });
      }
      
      // For delivery, require country
      if (fulfillmentMethod !== "click_collect" && !country) {
        return res.status(400).json({ error: "Please provide destination country" });
      }
      
      // For Click & Collect, require collection date and time
      if (fulfillmentMethod === "click_collect") {
        if (!collectionDate) {
          return res.status(400).json({ error: "Please select a collection date" });
        }
        if (!collectionTimeSlot) {
          return res.status(400).json({ error: "Please select a collection time" });
        }
        // Validate weekday
        const date = new Date(collectionDate);
        const day = date.getDay();
        if (day === 0 || day === 6) {
          return res.status(400).json({ error: "Collection is only available Monday to Friday" });
        }
      }
      
      if (!customerInfo?.email || !customerInfo?.firstName || !customerInfo?.lastName) {
        return res.status(400).json({ error: "Please provide customer information" });
      }
      
      // Fetch products from database to get prices and validate
      const productIds = items.map((item: any) => item.productId);
      const productResults = await db
        .select({
          id: products.id,
          name: products.name,
          price: products.price,
          inStock: products.inStock,
          weightGrams: products.weightGrams,
          parcelType: products.parcelType,
        })
        .from(products)
        .where(inArray(products.id, productIds));
      
      // Validate all products exist and are in stock
      if (productResults.length !== productIds.length) {
        return res.status(400).json({ error: "Some products are no longer available" });
      }
      
      const outOfStock = productResults.filter(p => !p.inStock);
      if (outOfStock.length > 0) {
        return res.status(400).json({ 
          error: `The following items are out of stock: ${outOfStock.map(p => p.name).join(', ')}` 
        });
      }
      
      // Calculate subtotal from database prices (not from client)
      const subtotal = productResults.reduce((sum, p) => {
        const price = typeof p.price === 'string' ? parseFloat(p.price) : p.price;
        return sum + (price || 0);
      }, 0);
      
      // Calculate shipping server-side (skip for Click & Collect)
      let shippingCost = 0;
      let shippingResult: any = { totalShipping: 0 };
      
      if (fulfillmentMethod !== "click_collect") {
        const cartItems: CartItem[] = productResults.map(product => ({
          productId: product.id,
          name: product.name,
          weightGrams: product.weightGrams || 500,
          parcelType: (product.parcelType || 'small_parcel') as ParcelType,
        }));
        
        const service: ShippingService = selectedService || 'tracked_48';
        shippingResult = calculateCombinedShipping(cartItems, country, service);
        shippingCost = shippingResult.totalShipping;
      }
      
      const totalAmount = Math.round((subtotal + shippingCost) * 100); // Convert to pence
      
      if (totalAmount < 30) { // Stripe minimum is 30p
        return res.status(400).json({ error: "Order total is too low" });
      }
      
      // Create pending order first (so we have orderId for redirect URLs)
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const shippingAddressData = {
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        addressLine1: customerInfo.addressLine1,
        addressLine2: customerInfo.addressLine2 || '',
        city: customerInfo.city,
        region: customerInfo.region || '',
        postcode: customerInfo.postcode,
        country: customerInfo.country,
        phone: customerInfo.phone || '',
        email: customerInfo.email,
      };
      
      const [pendingOrder] = await db.insert(orders).values({
        id: orderId,
        userId: req.session?.user?.id || null,
        status: 'pending_payment',
        subtotal: subtotal.toString(),
        shipping: shippingCost.toString(),
        tax: '0',
        total: (subtotal + shippingCost).toString(),
        shippingAddress: shippingAddressData,
        billingAddress: shippingAddressData,
        paymentMethod: 'stripe',
        paymentStatus: 'pending',
        fulfillmentMethod: fulfillmentMethod || 'delivery',
        collectionDate: fulfillmentMethod === 'click_collect' ? new Date(collectionDate) : null,
        collectionTimeSlot: fulfillmentMethod === 'click_collect' ? collectionTimeSlot : null,
      }).returning();
      
      // Create order items (pending)
      for (const product of productResults) {
        await db.insert(orderItems).values({
          orderId: pendingOrder.id,
          productId: product.id,
          name: product.name,
          quantity: 1,
          price: product.price,
          type: 'product',
        });
      }
      
      // Create PaymentIntent with orderId in metadata
      const { getUncachableStripeClient } = await import("./stripeClient");
      const stripeClient = await getUncachableStripeClient();
      
      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: totalAmount,
        currency: 'gbp',
        metadata: {
          orderId: pendingOrder.id.toString(),
          productIds: productIds.join(','),
          customerEmail: customerInfo.email,
          customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
          fulfillmentMethod: fulfillmentMethod || 'delivery',
          shippingCountry: country || 'United Kingdom',
          shippingService: selectedService || 'click_collect',
          subtotal: subtotal.toFixed(2),
          shippingCost: shippingCost.toFixed(2),
          collectionDate: collectionDate || '',
          collectionTimeSlot: collectionTimeSlot || '',
        },
        receipt_email: customerInfo.email,
      });
      
      // Update order with payment intent ID (using paytriotPaymentId field for now)
      await db.update(orders)
        .set({ paytriotPaymentId: paymentIntent.id })
        .where(eq(orders.id, pendingOrder.id));
      
      return res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        orderId: pendingOrder.id,
        amount: totalAmount,
        subtotal,
        shipping: shippingCost,
      });
    } catch (err: any) {
      console.error("POST /api/shop/create-payment-intent error:", err);
      return res.status(500).json({ error: err.message || "Failed to create payment" });
    }
  });

  // Confirm shop order after successful payment
  app.post("/api/shop/confirm-order", async (req: Request, res: Response) => {
    try {
      const { paymentIntentId, orderId } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({ error: "Missing payment intent ID" });
      }
      
      // Verify payment was successful
      const { getUncachableStripeClient } = await import("./stripeClient");
      const stripeClient = await getUncachableStripeClient();
      
      const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: "Payment was not successful" });
      }
      
      // Find order by ID or by paymentIntentId (for redirect flow)
      let existingOrder;
      if (orderId) {
        const [found] = await db.select().from(orders).where(eq(orders.id, orderId));
        existingOrder = found;
      }
      
      if (!existingOrder) {
        // Try to find by paymentIntentId (webhook or redirect scenario)
        const [foundByPI] = await db.select().from(orders).where(eq(orders.paytriotPaymentId, paymentIntentId));
        existingOrder = foundByPI;
      }
      
      if (!existingOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // If already paid, just return success
      if (existingOrder.status === 'paid') {
        return res.json({
          success: true,
          orderId: existingOrder.id,
          orderNumber: `LH-${existingOrder.id.toString().padStart(6, '0')}`,
        });
      }
      
      // Update order status to paid
      await db.update(orders)
        .set({ status: 'paid' })
        .where(eq(orders.id, existingOrder.id));
      
      // Get order items and mark products as out of stock
      const orderItemsList = await db.select().from(orderItems).where(eq(orderItems.orderId, existingOrder.id));
      
      for (const item of orderItemsList) {
        await db.update(products)
          .set({ inStock: false, stockQuantity: 0 })
          .where(eq(products.id, item.productId));
      }
      
      // Send order confirmation email
      try {
        // Get user info for email
        let customerEmail = '';
        let customerName = 'Valued Customer';
        
        if (existingOrder.userId) {
          const [user] = await db.select().from(users).where(eq(users.id, existingOrder.userId));
          if (user) {
            customerEmail = user.email || '';
            customerName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'Valued Customer';
          }
        }
        
        // Parse shipping address
        let shippingAddress: any = {};
        try {
          shippingAddress = typeof existingOrder.shippingAddress === 'string' 
            ? JSON.parse(existingOrder.shippingAddress) 
            : existingOrder.shippingAddress || {};
        } catch (e) {
          shippingAddress = {};
        }
        
        // Get product names for order items
        const itemsWithNames = [];
        for (const item of orderItemsList) {
          const [product] = await db.select().from(products).where(eq(products.id, item.productId));
          itemsWithNames.push({
            name: product?.name || item.name || 'Unknown Product',
            quantity: item.quantity,
            price: item.price,
          });
        }
        
        if (customerEmail) {
          await sendOrderConfirmationEmail({
            customerEmail,
            customerName,
            orderId: existingOrder.id,
            items: itemsWithNames,
            subtotal: existingOrder.subtotal || 0,
            shipping: existingOrder.shippingCost || 0,
            total: existingOrder.total || 0,
            shippingAddress: {
              line1: shippingAddress.addressLine1 || shippingAddress.line1 || '',
              line2: shippingAddress.addressLine2 || shippingAddress.line2 || '',
              city: shippingAddress.city || '',
              county: shippingAddress.county || shippingAddress.state || '',
              postcode: shippingAddress.postcode || shippingAddress.postalCode || '',
              country: shippingAddress.country || 'United Kingdom',
            },
          });
          console.log(`✅ Order confirmation email sent for order ${existingOrder.id}`);
        }
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
      }
      
      return res.json({
        success: true,
        orderId: existingOrder.id,
        orderNumber: `LH-${existingOrder.id.toString().padStart(6, '0')}`,
      });
    } catch (err: any) {
      console.error("POST /api/shop/confirm-order error:", err);
      return res.status(500).json({ error: err.message || "Failed to confirm order" });
    }
  });

  // Create crypto payment order (Bitcoin/Ethereum) for shop checkout
  app.post("/api/shop/crypto-order", async (req: Request, res: Response) => {
    try {
      const { 
        items, 
        cryptoType, 
        customerInfo, 
        billingAddress,
        fulfillmentMethod, 
        collectionDate, 
        collectionTimeSlot,
        country,
        selectedService,
        totalGBP
      } = req.body;

      // Validate crypto type
      if (!cryptoType || !['bitcoin', 'ethereum'].includes(cryptoType)) {
        return res.status(400).json({ error: "Invalid cryptocurrency type" });
      }

      // Validate items
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "No items provided" });
      }

      // Validate customer info
      if (!customerInfo || !customerInfo.email || !customerInfo.firstName || !customerInfo.lastName) {
        return res.status(400).json({ error: "Missing customer information" });
      }

      // Validate click & collect fields
      if (fulfillmentMethod === 'click_collect') {
        if (!collectionDate) {
          return res.status(400).json({ error: "Collection date is required for Click & Collect orders" });
        }
        if (!collectionTimeSlot) {
          return res.status(400).json({ error: "Collection time slot is required for Click & Collect orders" });
        }
        const date = new Date(collectionDate);
        const day = date.getDay();
        if (day === 0 || day === 6) {
          return res.status(400).json({ error: "Collection is only available Monday to Friday" });
        }
      }

      // Get product details and calculate total
      let subtotal = 0;
      const productDetails = [];
      
      for (const item of items) {
        const [product] = await db.select().from(products).where(eq(products.id, item.productId));
        if (!product) {
          return res.status(400).json({ error: `Product not found: ${item.productId}` });
        }
        if (!product.inStock) {
          return res.status(400).json({ error: `Product is out of stock: ${product.name}` });
        }
        const price = Number(product.price);
        subtotal += price;
        productDetails.push({
          productId: product.id,
          name: product.name,
          price: price,
          quantity: 1,
        });
      }

      // Calculate shipping cost
      let shippingCost = 0;
      if (fulfillmentMethod !== 'click_collect' && country) {
        try {
          const shippingResponse = await new Promise<any>((resolve) => {
            const shippingReq = {
              body: {
                items: items.map((i: any) => ({ productId: i.productId })),
                country,
                selectedService: selectedService || 'tracked_48'
              }
            };
            // Simple shipping calculation (use fixed rates for crypto)
            const ukShipping = selectedService === 'tracked_24' ? 8.95 : 6.95;
            const intlShipping = 15.95;
            resolve({ 
              success: true, 
              totalShipping: country === 'United Kingdom' ? ukShipping : intlShipping 
            });
          });
          shippingCost = shippingResponse.totalShipping || 0;
        } catch (e) {
          console.log("Shipping calculation failed, using default:", e);
          shippingCost = 10.00;
        }
      }

      const total = subtotal + shippingCost;

      // Crypto wallet addresses
      const CRYPTO_WALLETS = {
        bitcoin: 'bc1qda559v6e7d9hwptpyq85m6ahsclmhku55g8728',
        ethereum: '0x65b2792d9D003D2b29C3E5D10a038fb8F5bef029'
      };

      // Fetch current crypto prices from CoinGecko (cached for 5 minutes)
      const { getCryptoRates, convertGbpToCrypto, getRateAge } = await import('./cryptoRatesService');
      const rates = await getCryptoRates();
      
      const cryptoAmount = convertGbpToCrypto(total, cryptoType as 'bitcoin' | 'ethereum', rates);
      const cryptoSymbol = cryptoType === 'bitcoin' ? 'BTC' : 'ETH';
      const rateUsed = cryptoType === 'bitcoin' ? rates.btcGbp : rates.ethGbp;
      
      console.log(`💱 Crypto conversion: £${total} → ${cryptoAmount} (rate: £${rateUsed.toLocaleString()}, ${rates.isStale ? 'STALE' : 'fresh'} - ${getRateAge(rates)})`);

      // Get logged-in user ID if available
      const sessUser = (req as any).session?.user;
      const userId = sessUser?.id || null;

      // Create order in pending state
      const shippingAddressData = {
        addressLine1: customerInfo.addressLine1,
        addressLine2: customerInfo.addressLine2,
        city: customerInfo.city,
        region: customerInfo.region,
        postcode: customerInfo.postcode,
        country: customerInfo.country,
      };

      const billingAddressData = billingAddress || shippingAddressData;

      // Generate order ID (orders table uses varchar primary key)
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      const [newOrder] = await db.insert(orders).values({
        id: orderId,
        userId: userId,
        status: 'pending',
        subtotal: subtotal.toString(),
        shipping: shippingCost.toString(),
        tax: "0",
        total: total.toString(),
        shippingAddress: JSON.stringify(shippingAddressData),
        billingAddress: JSON.stringify(billingAddressData),
        paymentMethod: `crypto_${cryptoType}`,
        paymentStatus: 'awaiting_crypto',
        fulfillmentMethod: fulfillmentMethod || 'delivery',
        collectionDate: collectionDate ? new Date(collectionDate) : null,
        collectionTimeSlot: collectionTimeSlot || null,
        cryptoAmount: cryptoAmount,
        cryptoWalletAddress: CRYPTO_WALLETS[cryptoType as keyof typeof CRYPTO_WALLETS],
      }).returning();

      // Add order items
      for (const product of productDetails) {
        await db.insert(orderItems).values({
          orderId: orderId,
          productId: product.productId,
          name: product.name,
          price: product.price.toString(),
          quantity: product.quantity,
        });
      }

      // Mark products as reserved (not sold yet, but reserved for crypto payment)
      for (const item of items) {
        await db.update(products)
          .set({ inStock: false })
          .where(eq(products.id, item.productId));
      }

      // Generate order number from the timestamp portion of order ID
      const orderNumber = `LH-CRYPTO-${Date.now().toString().slice(-6)}`;
      const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(); // 12 hours

      console.log(`✅ Crypto order created: ${orderNumber} - ${cryptoAmount} to ${CRYPTO_WALLETS[cryptoType as keyof typeof CRYPTO_WALLETS]}`);

      return res.json({
        success: true,
        orderId: orderId,
        orderNumber,
        cryptoAmount,
        cryptoSymbol,
        walletAddress: CRYPTO_WALLETS[cryptoType as keyof typeof CRYPTO_WALLETS],
        expiresAt,
        total,
        rateInfo: {
          rateGbp: rateUsed,
          fetchedAt: rates.fetchedAt.toISOString(),
          isStale: rates.isStale,
        },
        message: "Order created. Please send payment within 12 hours."
      });
    } catch (err: any) {
      console.error("POST /api/shop/crypto-order error:", err);
      return res.status(500).json({ error: err.message || "Failed to create crypto order" });
    }
  });

  // Calculate delivery cost based on postcode
  app.post("/api/calculate-delivery", async (req: Request, res: Response) => {
    try {
      const { postcode } = req.body;
      
      if (!postcode || typeof postcode !== 'string') {
        return res.status(400).json({ 
          success: false,
          error: "Please provide a valid UK postcode" 
        });
      }
      
      const result = await calculateDeliveryCost(postcode);
      return res.json(result);
    } catch (err) {
      console.error("POST /api/calculate-delivery error:", err);
      return res.status(500).json({ 
        success: false,
        error: "Failed to calculate delivery cost" 
      });
    }
  });

  // Save shipping method selection for a won lot
  app.post("/api/auction/lot-shipping", async (req: any, res: Response) => {
    try {
      const sessUser = req.session?.user;
      if (!sessUser?.id) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { lotId, catalogId, shippingMethod, deliveryPostcode } = req.body;

      if (!lotId || !catalogId || !shippingMethod) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Verify lot belongs to user by checking won lots
      const wonLotCheck = await pool.query(
        `SELECT ab.lot_id, al.shipping_band 
         FROM auction_bids ab
         JOIN auction_lots al ON ab.lot_id = al.id
         WHERE ab.user_id = $1 AND ab.lot_id = $2 AND ab.is_winning = true`,
        [sessUser.id, lotId]
      );

      if (wonLotCheck.rows.length === 0) {
        return res.status(403).json({ message: "You don't own this lot" });
      }

      const lot = wonLotCheck.rows[0];
      const shippingBand = lot.shipping_band;

      // Server-side calculation of costs using shared shipping bands
      const { getShippingBandPrice } = await import('../shared/shipping-bands.js');

      let shippingCost: number | null = null;
      let deliveryDistance: number | null = null;
      let deliveryCost: number | null = null;

      if (shippingMethod === 'standard_shipping') {
        // Calculate shipping cost from band with strict validation
        if (!shippingBand) {
          return res.status(400).json({ 
            message: 'Shipping band is required for standard shipping. Please contact support.' 
          });
        }
        
        shippingCost = getShippingBandPrice(shippingBand);
        
        if (shippingCost === null || shippingCost === 0) {
          return res.status(400).json({ 
            message: `Invalid shipping band code: ${shippingBand}. Please contact support.` 
          });
        }
      } else if (shippingMethod === 'local_delivery') {
        // Validate and calculate delivery cost
        if (!deliveryPostcode || typeof deliveryPostcode !== 'string') {
          return res.status(400).json({ message: "Postcode required for local delivery" });
        }

        // Re-calculate delivery cost server-side (never trust client)
        const deliveryResult = await calculateDeliveryCost(deliveryPostcode.trim());
        
        if (!deliveryResult.success) {
          return res.status(400).json({ message: deliveryResult.error || "Invalid postcode" });
        }

        if (deliveryResult.quoteRequired) {
          return res.status(400).json({ message: "This location requires a custom quote. Please contact us." });
        }

        deliveryDistance = deliveryResult.distance || null;
        deliveryCost = deliveryResult.cost || null;
      } else {
        return res.status(400).json({ message: "Invalid shipping method" });
      }

      await pool.query(
        `INSERT INTO lot_shipping_selections 
         (user_id, lot_id, catalog_id, shipping_method, delivery_postcode, delivery_distance, delivery_cost, shipping_cost, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         ON CONFLICT (user_id, lot_id) 
         DO UPDATE SET 
           shipping_method = $4, 
           delivery_postcode = $5, 
           delivery_distance = $6, 
           delivery_cost = $7, 
           shipping_cost = $8, 
           updated_at = NOW()`,
        [sessUser.id, lotId, catalogId, shippingMethod, deliveryPostcode || null, deliveryDistance, deliveryCost, shippingCost]
      );

      return res.json({ 
        success: true,
        shippingCost,
        deliveryCost,
        deliveryDistance
      });
    } catch (err) {
      console.error("POST /api/auction/lot-shipping error:", err);
      return res.status(500).json({ message: "Failed to save shipping selection" });
    }
  });

  // Get shipping selections for user's won lots
  app.get("/api/auction/lot-shipping/:catalogId", async (req: any, res: Response) => {
    try {
      const sessUser = req.session?.user;
      if (!sessUser?.id) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { catalogId } = req.params;

      const result = await pool.query(
        `SELECT lot_id, shipping_method, delivery_postcode, delivery_distance, delivery_cost, shipping_cost 
         FROM lot_shipping_selections 
         WHERE user_id = $1 AND catalog_id = $2`,
        [sessUser.id, catalogId]
      );

      // Transform snake_case to camelCase
      const selections: { [lotId: string]: any } = {};
      result.rows.forEach(row => {
        selections[row.lot_id] = {
          shippingMethod: row.shipping_method,
          deliveryPostcode: row.delivery_postcode,
          deliveryDistance: row.delivery_distance ? parseFloat(row.delivery_distance) : null,
          deliveryCost: row.delivery_cost ? parseFloat(row.delivery_cost) : null,
          shippingCost: row.shipping_cost ? parseFloat(row.shipping_cost) : null,
        };
      });

      return res.json(selections);
    } catch (err) {
      console.error("GET /api/auction/lot-shipping/:catalogId error:", err);
      return res.status(500).json({ message: "Failed to fetch shipping selections" });
    }
  });

  // Get user's raffle entries
  app.get("/api/raffles/user-raffle-tickets", async (req: any, res) => {
    try {
      const sessUser = req.session?.user;
      if (!sessUser?.id) {
        return res.status(401).json({ message: "Not logged in" });
      }

      console.log("Fetching raffle entries for user:", sessUser.id);

      // Query to get user's raffle entries with raffle details
      const query = `
        SELECT 
          re.id,
          re.raffle_id as "raffleId",
          re.user_id as "userId", 
          re.ticket_count as "ticketCount",
          re.ticket_numbers as "ticketNumbers",
          re.created_at as "createdAt",
          r.name as "raffleName",
          r.end_date as "raffleEndDate",
          r.ticket_price as "ticketPrice"
        FROM raffle_entries re
        JOIN raffles r ON re.raffle_id = r.id
        WHERE re.user_id = $1
        ORDER BY re.created_at DESC
      `;

      const result = await pool.query(query, [sessUser.id]);
      
      console.log(`Found ${result.rows.length} raffle entries for user ${sessUser.id}`);
      
      // Transform the data to match frontend expectations
      const entries = result.rows.map(entry => ({
        id: entry.id,
        raffleId: entry.raffleId,
        raffleName: entry.raffleName,
        raffleEndDate: entry.raffleEndDate,
        ticketNumbers: entry.ticketNumbers || [],
        createdAt: entry.createdAt,
        totalSpent: (entry.ticketNumbers?.length || 1) * parseFloat(entry.ticketPrice || '0')
      }));

      console.log("Returning raffle entries:", entries);
      res.json(entries);
    } catch (err) {
      console.error("GET /api/raffles/user-raffle-tickets error:", err);
      res.status(500).json({ message: "Failed to fetch raffle entries" });
    }
  });

  // Get user's raffle wins
  app.get("/api/user-raffle-wins", async (req: any, res) => {
    try {
      const sessUser = req.session?.user;
      if (!sessUser?.id) {
        return res.status(401).json({ message: "Not logged in" });
      }

      const query = `
        SELECT
          r.id,
          r.name as "raffleName",
          r.winning_ticket_number as "winningTicketNumber",
          r.updated_at as "completedAt",
          r.image_url as "raffleImageUrl"
        FROM raffles r
        WHERE r.winner_id = $1 AND r.status = 'completed'
        ORDER BY r.updated_at DESC
      `;

      const result = await pool.query(query, [sessUser.id]);
      res.json(result.rows);
    } catch (err) {
      console.error("GET /api/user-raffle-wins error:", err);
      res.status(500).json({ message: "Failed to fetch raffle wins" });
    }
  });

  // Claim raffle prize delivery
  app.post("/api/raffle-winners/claim/:raffleId", async (req: any, res) => {
    try {
      const sessUser = req.session?.user;
      if (!sessUser?.id) {
        return res.status(401).json({ message: "Not logged in" });
      }
      
      const { raffleId } = req.params;
      const { claimType, deliveryAddress, paymentMethod } = req.body;
      
      console.log(`🎁 User ${sessUser.id} claiming prize ${raffleId} as ${claimType}`);
      
      // Verify the user won this raffle
      const raffleQuery = `
        SELECT id, name, winner_id 
        FROM raffles 
        WHERE id = $1 AND winner_id = $2 AND status = 'completed'
      `;
      
      const raffleResult = await pool.query(raffleQuery, [raffleId, sessUser.id]);
      
      if (raffleResult.rows.length === 0) {
        return res.status(404).json({ message: "Raffle win not found or you are not the winner" });
      }
      
      if (claimType === 'delivery') {
        // Insert delivery information
        const deliveryQuery = `
          INSERT INTO raffle_deliveries (raffle_id, user_id, delivery_type, delivery_email, delivery_address, delivery_status)
          VALUES ($1, $2, $3, $4, $5, 'pending')
          ON CONFLICT (raffle_id) DO UPDATE SET
            delivery_type = EXCLUDED.delivery_type,
            delivery_email = EXCLUDED.delivery_email,
            delivery_address = EXCLUDED.delivery_address,
            updated_at = NOW()
          RETURNING *
        `;
        
        await pool.query(deliveryQuery, [
          raffleId,
          sessUser.id,
          deliveryAddress.deliveryType,
          deliveryAddress.email || sessUser.email,
          JSON.stringify(deliveryAddress)
        ]);
        
        res.json({
          success: true,
          message: "Delivery information submitted! We'll contact you within 48 hours to arrange your prize delivery."
        });
      } else {
        res.status(400).json({ message: "Invalid claim type. Only delivery is supported for raffle prizes." });
      }
      
    } catch (error) {
      console.error("Error claiming raffle prize:", error);
      res.status(500).json({ message: "Failed to claim raffle prize" });
    }
  });

  // Get user's delivery status for raffle wins
  app.get("/api/user-delivery-status", async (req: any, res) => {
    try {
      const sessUser = req.session?.user;
      
      if (!sessUser?.id) {
        return res.status(401).json({ message: "Not logged in" });
      }

      const query = `
        SELECT 
          rd.raffle_id,
          rd.id as delivery_id,
          rd.delivery_type,
          rd.delivery_email,
          rd.delivery_address,
          rd.delivery_status,
          rd.admin_notes,
          rd.created_at,
          rd.updated_at
        FROM raffle_deliveries rd
        WHERE rd.user_id = $1
        ORDER BY rd.created_at DESC
      `;

      const result = await pool.query(query, [sessUser.id]);
      res.json(result.rows);
    } catch (err) {
      console.error("GET /api/user-delivery-status error:", err);
      res.status(500).json({ message: "Failed to fetch delivery status" });
    }
  });

  // Get past raffles with winners
  app.get("/api/raffles/past", async (req, res) => {
    try {
      // Get completed raffles with proper entry counts
      const query = `
        SELECT r.*, 
               COALESCE(SUM(re.ticket_count), 0) as entry_count,
               u.first_name || ' ' || COALESCE(u.last_name, '') as winner_name,
               u.email as winner_email
        FROM raffles r
        LEFT JOIN raffle_entries re ON r.id = re.raffle_id
        LEFT JOIN users u ON r.winner_id = u.id
        WHERE r.status = 'completed' 
           OR (r.end_date < NOW() AND r.status != 'active')
        GROUP BY r.id, u.first_name, u.last_name, u.email
        ORDER BY r.end_date DESC
      `;
      
      const result = await pool.query(query);
      
      // Transform the data to match frontend expectations
      const pastRaffles = result.rows.map(raffle => ({
        id: raffle.id.toString(),
        name: raffle.name,
        description: raffle.description,
        itemDescription: raffle.item_description,
        retailPrice: raffle.retail_price?.toString() || "0",
        ticketPrice: raffle.ticket_price?.toString() || "0",
        startDate: raffle.start_date ? new Date(raffle.start_date).toISOString() : '',
        endDate: raffle.end_date ? new Date(raffle.end_date).toISOString() : '',
        maxTickets: parseInt(raffle.max_tickets || 0),
        ticketsSold: parseInt(raffle.tickets_sold || 0),
        status: raffle.status,
        imageUrl: raffle.image_url,
        entryCount: parseInt(raffle.entry_count || 0),
        winningTicketNumber: raffle.winning_ticket_number,
        winner: {
          name: raffle.winner_name || "Anonymous Collector",
          ticketNumber: raffle.winning_ticket_number || 0,
          email: raffle.winner_email
        }
      }));
      
      console.log(`Found ${pastRaffles.length} past raffles`);
      res.json(pastRaffles);
    } catch (error) {
      console.error("Error fetching past raffles:", error);
      res.status(500).json({ message: "Failed to fetch past raffles" });
    }
  });

  // Add test products endpoint
  app.post("/api/seed-test-products", async (req, res) => {
    try {
      const testProducts = [
        {
          name: "Victorian Mahogany Writing Desk",
          description: "Elegant Victorian writing desk crafted from rich mahogany wood, featuring intricate carved details and brass hardware.",
          detailedDescription: "This stunning Victorian writing desk dates from the 1870s and showcases the finest craftsmanship of the era. The rich mahogany wood has been carefully maintained and displays beautiful grain patterns. Features include multiple drawers with original brass handles, a leather-inlaid writing surface, and delicate carved details along the edges. Perfect for any study or home office seeking authentic period character.",
          sku: "TEST-VIC-001",
          price: "850.00",
          originalPrice: "1200.00",
          categoryId: 1,
          era: "victorian",
          condition: "excellent",
          materials: ["mahogany", "brass", "leather"],
          dimensions: "120cm L x 60cm W x 75cm H",
          origin: "England",
          isFeatured: true,
          isBestSeller: false,
          imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
          additionalImages: [],
          provenance: "Originally owned by the Henderson family estate, documented in family records from 1875",
          inStock: true,
          stockQuantity: 1,
          tags: ["test-data"]
        },
        {
          name: "Art Deco Silver Cigarette Case",
          description: "Exquisite Art Deco silver cigarette case with geometric engraving and original hallmarks.",
          detailedDescription: "A beautiful example of Art Deco design from the 1920s, this sterling silver cigarette case features the characteristic geometric patterns of the era. The case bears Birmingham hallmarks and maker's marks, confirming its authenticity and dating. The interior is gold-plated and in excellent condition. A perfect collector's piece showcasing the elegance and sophistication of the Jazz Age.",
          sku: "TEST-ART-002",
          price: "245.00",
          originalPrice: "320.00",
          categoryId: 3,
          era: "art_deco",
          condition: "excellent",
          materials: ["sterling silver", "gold plating"],
          dimensions: "9cm L x 6cm W x 1cm H",
          origin: "Birmingham, England",
          isFeatured: false,
          isBestSeller: true,
          imageUrl: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&h=600&fit=crop",
          additionalImages: [],
          provenance: "Purchased from a Birmingham antique dealer, with original documentation",
          inStock: true,
          stockQuantity: 1,
          tags: ["test-data"]
        },
        {
          name: "Georgian Longcase Clock",
          description: "Magnificent Georgian longcase clock with eight-day movement and moon phase dial.",
          detailedDescription: "This exceptional Georgian longcase clock dates from approximately 1780 and represents the pinnacle of English clockmaking. The eight-day movement features a moon phase dial and strikes on the hour and half-hour. The case is crafted from solid oak with beautiful figuring and original brass fittings. The clock has been recently serviced and keeps excellent time. A centerpiece for any period home.",
          sku: "TEST-GEO-003",
          price: "3250.00",
          originalPrice: "4200.00",
          categoryId: 1,
          era: "georgian",
          condition: "good",
          materials: ["oak", "brass", "steel"],
          dimensions: "210cm H x 50cm W x 25cm D",
          origin: "London, England",
          isFeatured: true,
          isBestSeller: false,
          imageUrl: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&h=600&fit=crop",
          additionalImages: [],
          provenance: "Originally from Thornfield Manor, Yorkshire, with clockmaker's signature visible",
          inStock: true,
          stockQuantity: 1,
          tags: ["test-data"]
        },
        {
          name: "Ming Dynasty Porcelain Vase",
          description: "Rare Ming Dynasty blue and white porcelain vase with traditional dragon motifs.",
          detailedDescription: "An extraordinary Ming Dynasty porcelain vase dating from the 16th century, featuring the classic blue and white glazing technique perfected during this period. The vase depicts traditional dragon motifs surrounded by cloud patterns, executed with remarkable skill and precision. Despite its age, the piece remains in remarkable condition with only minor age-related crazing. Accompanied by a certificate of authenticity from the Oriental Ceramics Society.",
          sku: "TEST-MIN-004",
          price: "12500.00",
          originalPrice: "15000.00",
          categoryId: 4,
          era: "renaissance",
          condition: "good",
          materials: ["porcelain", "cobalt blue glaze"],
          dimensions: "35cm H x 18cm diameter",
          origin: "Jingdezhen, China",
          isFeatured: true,
          isBestSeller: true,
          imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
          additionalImages: [],
          provenance: "Acquired by European collector in the 1920s, family collection since",
          inStock: true,
          stockQuantity: 1,
          tags: ["test-data"]
        }
      ];

      for (const product of testProducts) {
        await db.insert(products).values(product);
      }

      res.json({ message: `Successfully added ${testProducts.length} test products`, count: testProducts.length });
    } catch (error) {
      console.error("POST /api/seed-test-products error:", error);
      res.status(500).json({ message: "Failed to seed test products" });
    }
  });

  // Add simple DB endpoints to bypass Vite interception
  app.get("/db/categories", async (req, res) => {
    try {
      // Return a basic categories structure for now
      const categories = [
        { id: "1", name: "Antique Furniture", slug: "antique-furniture" },
        { id: "2", name: "Art & Collectibles", slug: "art-collectibles" },
        { id: "3", name: "Jewelry & Watches", slug: "jewelry-watches" },
        { id: "4", name: "Ceramics & Glass", slug: "ceramics-glass" },
        { id: "5", name: "Silver & Metalware", slug: "silver-metalware" }
      ];
      res.json(categories);
    } catch (error) {
      console.error("GET /db/categories error:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get all products for admin management (includes status field)
  app.get("/db/products", async (req, res) => {
    console.log("📦 GET /db/products - Fetching all products with status");
    try {
      const result = await pool.query(`
        SELECT 
          p.id,
          p.name,
          p.description,
          p.detailed_description as "detailedDescription",
          p.sku,
          p.vendor_number as "vendorNumber",
          p.price,
          p.original_price as "originalPrice",
          p.category_id as "categoryId",
          c.name as "categoryName",
          p.era,
          p.condition,
          p.materials,
          p.dimensions,
          p.origin,
          p.is_featured as "isFeatured",
          p.is_bestseller as "isBestSeller",
          p.image_url as "imageUrl",
          p.additional_images as "additionalImages",
          p.provenance,
          p.in_stock as "inStock",
          p.stock_quantity as "stockQuantity",
          p.status,
          p.weight_grams as "weightGrams",
          p.parcel_type as "parcelType",
          p.created_at as "createdAt"
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
      `);
      
      res.json({ products: result.rows });
    } catch (error) {
      console.error("GET /db/products error:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  // Single image upload endpoint
  app.post("/api/upload/product-image", uploadRateLimit, validateFileUpload, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Generate the URL for the uploaded file
      const fileUrl = `/uploads/products/${req.file.filename}`;
      console.log("Image uploaded successfully:", fileUrl);
      
      res.json({ fileUrl });
    } catch (error) {
      console.error("POST /api/upload/product-image error:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Multiple images upload endpoint
  app.post("/api/upload/product-images", upload.array('images', 5), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: "No image files provided" });
      }

      // Generate URLs for all uploaded files
      const fileUrls = req.files.map(file => `/uploads/products/${file.filename}`);
      console.log("Multiple images uploaded successfully:", fileUrls);
      
      res.json({ fileUrls });
    } catch (error) {
      console.error("POST /api/upload/product-images error:", error);
      res.status(500).json({ message: "Failed to upload images" });
    }
  });

  // Raffle image upload endpoint
  app.post("/api/upload/raffle-image", uploadRateLimit, validateFileUpload, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Generate the URL for the uploaded file
      const fileUrl = `/uploads/raffles/${req.file.filename}`;
      console.log("Raffle image uploaded successfully:", fileUrl);
      
      res.json({ fileUrl });
    } catch (error) {
      console.error("POST /api/upload/raffle-image error:", error);
      res.status(500).json({ message: "Failed to upload raffle image" });
    }
  });

  // Blog image upload endpoint (admin only)
  app.post("/api/admin/upload/blog-image", uploadRateLimit, validateFileUpload, requireAdmin, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Generate the URL for the uploaded file
      const imageUrl = `/uploads/blog/${req.file.filename}`;
      console.log("Blog image uploaded successfully:", imageUrl);
      
      res.json({ imageUrl });
    } catch (error) {
      console.error("POST /api/admin/upload/blog-image error:", error);
      res.status(500).json({ message: "Failed to upload blog image" });
    }
  });

  // Auction catalog image upload
  app.post("/api/admin/upload/catalog-image", requireAdmin, uploadRateLimit, auctionCatalogImageUpload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      const imageUrl = `/uploads/auction-catalogs/${req.file.filename}`;
      console.log("Catalog image uploaded successfully:", imageUrl);
      res.json({ url: imageUrl });
    } catch (error) {
      console.error("Error uploading catalog image:", error);
      res.status(500).json({ message: "Failed to upload catalog image" });
    }
  });

  // Auction lot images upload (multiple images)
  app.post("/api/admin/upload/lot-images", requireAdmin, uploadRateLimit, auctionLotImageUpload.array('images', 10), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: "No image files provided" });
      }
      const imageUrls = req.files.map((file: Express.Multer.File) => `/uploads/auction-lots/${file.filename}`);
      console.log("Lot images uploaded successfully:", imageUrls);
      res.json({ urls: imageUrls });
    } catch (error) {
      console.error("Error uploading lot images:", error);
      res.status(500).json({ message: "Failed to upload lot images" });
    }
  });

  // Category image upload endpoint with custom multer for categories
  const categoryUpload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const categoriesDir = path.join('public', 'uploads', 'categories');
        // Ensure directory exists
        if (!fs.existsSync(categoriesDir)) {
          fs.mkdirSync(categoriesDir, { recursive: true });
        }
        cb(null, categoriesDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = `image-${uniqueSuffix}${ext}`;
        cb(null, filename);
      }
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.'));
      }
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  });

  app.post("/api/upload/category-image", uploadRateLimit, validateFileUpload, categoryUpload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Generate the URL for the uploaded file
      const fileUrl = `/uploads/categories/${req.file.filename}`;
      console.log("Category image uploaded successfully:", fileUrl);
      
      res.json({ fileUrl });
    } catch (error) {
      console.error("POST /api/upload/category-image error:", error);
      res.status(500).json({ message: "Failed to upload category image" });
    }
  });

  // Submissions photo upload endpoint
  app.post("/api/upload/submissions", uploadRateLimit, validateFileUpload, upload.array('photos', 5), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: "No photo files provided" });
      }

      // Generate URLs for all uploaded files
      const urls = req.files.map(file => `/uploads/submissions/${file.filename}`);
      console.log("Submission photos uploaded successfully:", urls);
      
      res.json({ urls });
    } catch (error) {
      console.error("POST /api/upload/submissions error:", error);
      res.status(500).json({ message: "Failed to upload submission photos" });
    }
  });

  // Before/after images upload endpoint - supports multiple files
  app.post("/api/upload/before-after", uploadRateLimit, validateFileUpload, upload.array('images', 10), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: "No image files provided" });
      }

      // Resize each uploaded image to max 1400px wide, 85% quality
      await Promise.all(req.files.map(async (file) => {
        const filePath = file.path;
        const buffer = await sharp(filePath)
          .resize({ width: 1400, withoutEnlargement: true })
          .jpeg({ quality: 85, progressive: true })
          .toBuffer();
        await fs.promises.writeFile(filePath, buffer);
      }));

      const urls = req.files.map(file => `/uploads/before-after/${file.filename}`);
      console.log("Before/after images uploaded and resized:", urls);

      res.json({ urls });
    } catch (error) {
      console.error("POST /api/upload/before-after error:", error);
      res.status(500).json({ message: "Failed to upload before/after images" });
    }
  });

  // Instant win claim endpoint
  app.post("/api/instant-win/claim", async (req, res) => {
    try {
      const { instantWinId, email } = req.body;
      
      if (!instantWinId || !email) {
        return res.status(400).json({ message: "Missing instant win ID or email" });
      }

      // Update the instant win record with the user's email
      const result = await pool.query(`
        UPDATE instant_wins 
        SET email = $1, user_id = $2
        WHERE id = $3 AND email IS NULL
        RETURNING *
      `, [email, 'claimed', instantWinId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Instant win not found or already claimed" });
      }

      res.json({ 
        success: true, 
        message: "Instant win claimed successfully",
        instantWin: result.rows[0]
      });
    } catch (error) {
      console.error("POST /api/instant-win/claim error:", error);
      res.status(500).json({ message: "Failed to claim instant win" });
    }
  });

  // Blog routes
  app.get('/api/blog/posts', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          id, 
          title, 
          slug, 
          excerpt, 
          content,
          sections,
          cover_image as "coverImage",
          category,
          tags,
          status,
          featured,
          author_name as "authorName",
          author_image as "authorImage",
          meta_title as "metaTitle",
          meta_description as "metaDescription",
          published_at as "publishedAt",
          created_at as "createdAt"
        FROM blog_posts 
        WHERE status = 'published'
        ORDER BY created_at DESC
      `);
      
      // Format the response to match the expected structure
      const posts = result.rows.map(post => ({
        ...post,
        author: { 
          name: post.authorName || "Lanora House Team",
          avatar: post.authorImage || null
        }
      }));
      
      res.json(posts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/blog/posts/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const result = await pool.query(`
        SELECT 
          id, 
          title, 
          slug, 
          excerpt, 
          content,
          sections,
          cover_image as "coverImage",
          category,
          tags,
          published_at as "publishedAt",
          author_id as "authorId",
          author_name as "authorName",
          author_image as "authorImage",
          author_bio as "authorBio"
        FROM blog_posts 
        WHERE slug = $1
      `, [slug]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
      
      // Get comments for this post
      const commentsResult = await pool.query(`
        SELECT 
          id,
          author_name as "authorName",
          author_email as "authorEmail",
          content,
          created_at as "createdAt",
          parent_id as "parentId"
        FROM blog_comments 
        WHERE post_id = $1 AND status = 'approved'
        ORDER BY created_at ASC
      `, [result.rows[0].id]);
      
      const post = {
        ...result.rows[0],
        author: { 
          name: result.rows[0].authorName || "Lanora House Team",
          avatar: result.rows[0].authorImage || null,
          bio: result.rows[0].authorBio || null
        },
        comments: commentsResult.rows.map(comment => ({
          ...comment,
          author: { name: comment.authorName }
        }))
      };
      
      res.json(post);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Create blog comment
  app.post('/api/blog/posts/:slug/comments', async (req, res) => {
    try {
      const { slug } = req.params;
      const { content, authorName, authorEmail } = req.body;
      
      if (!content || !authorName || !authorEmail) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // Get the post ID from slug
      const postResult = await pool.query('SELECT id FROM blog_posts WHERE slug = $1', [slug]);
      
      if (postResult.rows.length === 0) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
      
      const postId = postResult.rows[0].id;
      
      // Insert the comment
      const commentResult = await pool.query(`
        INSERT INTO blog_comments (post_id, author_name, author_email, content, status)
        VALUES ($1, $2, $3, $4, 'approved')
        RETURNING id, author_name as "authorName", content, created_at as "createdAt"
      `, [postId, authorName, authorEmail, content]);
      
      res.json({
        success: true,
        comment: {
          ...commentResult.rows[0],
          author: { name: commentResult.rows[0].authorName }
        }
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Admin Blog Management Routes
  app.get('/api/admin/blog/posts', async (req, res) => {
    try {
      console.log('📝 Blog admin API called - fetching posts...');
      const result = await pool.query(`
        SELECT 
          id, 
          title, 
          slug, 
          excerpt, 
          content,
          sections,
          cover_image as "coverImage",
          category,
          tags,
          status,
          featured,
          author_name as "authorName",
          author_image as "authorImage",
          author_bio as "authorBio",
          meta_title as "metaTitle",
          meta_description as "metaDescription",
          published_at as "publishedAt",
          created_at as "createdAt"
        FROM blog_posts 
        ORDER BY created_at DESC
      `);
      
      console.log(`📝 Found ${result.rows.length} blog posts:`, result.rows.map(p => ({ id: p.id, title: p.title })));
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching admin blog posts:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });



  // Delete blog post
  app.delete('/api/admin/blog/posts/:postId', async (req, res) => {
    try {
      const { postId } = req.params;

      const result = await pool.query(`
        DELETE FROM blog_posts 
        WHERE id = $1
        RETURNING id
      `, [postId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Blog post not found' });
      }

      res.json({ success: true, message: 'Blog post deleted successfully' });
    } catch (error) {
      console.error('Error deleting blog post:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // AI Content Enhancement Route
  app.post('/api/admin/enhance-content', async (req, res) => {
    try {
      const { content, title, category } = req.body;
      
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Content is required' });
      }

      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        // Fallback to basic formatting if no API key
        const basicEnhanced = content
          .replace(/^(#{1,6})\s*(.+)$/gm, '\n$1 $2\n')
          .replace(/^(\*|\d+\.)\s*(.+)$/gm, '$1 $2')
          .replace(/\n\n+/g, '\n\n')
          .trim();
        
        return res.json({ enhancedContent: basicEnhanced });
      }

      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `Transform this basic blog content into a DYNAMIC, engaging blog post for Lanora House (an antique marketplace in Cornwall & Devon). 

Title: ${title}
Category: ${category}
Original Content: ${content}

Create a compelling, professional blog post with:

**FORMATTING & STRUCTURE:**
- Eye-catching headline (# title)
- Multiple engaging subheadings (## and ###)
- Short, scannable paragraphs
- Bullet points and numbered lists
- Bold text for key points
- Quote blocks for testimonials/tips

**ENGAGING CONTENT:**
- Hook readers immediately with compelling opening
- Tell stories and use examples
- Include practical tips and advice
- Add personality and emotion
- Use "you" to speak directly to readers
- Include local Cornwall/Devon references

**CALL-TO-ACTIONS:**
- Multiple CTAs throughout the post
- "Contact us for a free valuation"
- "Browse our antique collection"
- "Book a house clearance consultation"
- "Get in touch: +44 7843 930 927"
- "Visit our showroom in Cornwall"

**SEO & MARKETING:**
- Natural keyword integration
- Location-based SEO (Cornwall, Devon, Southwest England)
- Professional but approachable tone
- Include specific services (clearances, valuations, sales)

Make it feel like a premium antique dealer's blog - professional, knowledgeable, but warm and inviting. Return ONLY the enhanced markdown content.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a professional content writer specializing in antique and heritage content for Lanora House. Create engaging, SEO-optimized blog content with proper markdown formatting."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      const enhancedContent = response.choices[0].message.content;
      
      res.json({ enhancedContent });

    } catch (error) {
      console.error('AI Enhancement Error:', error);
      
      // Fallback to basic formatting
      const basicEnhanced = req.body.content
        .replace(/^(#{1,6})\s*(.+)$/gm, '\n$1 $2\n')
        .replace(/^(\*|\d+\.)\s*(.+)$/gm, '$1 $2')
        .replace(/\n\n+/g, '\n\n')
        .trim();
      
      res.json({ enhancedContent: basicEnhanced });
    }
  });

  app.post('/api/admin/blog/posts', async (req, res) => {
    try {
      console.log('📝 Blog post creation request received');
      console.log('📝 Request body keys:', Object.keys(req.body));
      console.log('📝 Request body sections:', req.body.sections);
      console.log('📝 Request body title:', req.body.title);
      
      const {
        title, slug, excerpt, content, sections, coverImage, category, tags,
        status, featured, authorName, authorImage, authorBio, metaTitle, metaDescription, publishedAt, scheduledDate, scheduledTime
      } = req.body;

      // Validate required fields
      if (!title) {
        return res.status(400).json({ message: 'Title is required' });
      }
      if (!category) {
        return res.status(400).json({ message: 'Category is required' });
      }
      if (!excerpt) {
        return res.status(400).json({ message: 'Excerpt is required' });
      }

      // Let the database auto-generate the serial ID

      // Generate unique slug if duplicate exists
      let uniqueSlug = slug;
      let counter = 1;
      
      while (true) {
        const existing = await pool.query('SELECT id FROM blog_posts WHERE slug = $1', [uniqueSlug]);
        if (existing.rows.length === 0) {
          break;
        }
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }

      // Handle scheduled posts
      let finalPublishedAt = publishedAt;
      if (status === 'scheduled' && scheduledDate && scheduledTime) {
        finalPublishedAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      } else if (status === 'published' && !publishedAt) {
        finalPublishedAt = new Date().toISOString();
      } else if (!publishedAt) {
        finalPublishedAt = new Date().toISOString();
      }

      const result = await pool.query(`
        INSERT INTO blog_posts (
          title, slug, excerpt, content, sections, cover_image, category, tags,
          status, featured, author_id, author_name, author_image, author_bio, meta_title, meta_description, published_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id
      `, [
        title, uniqueSlug, excerpt, content, JSON.stringify(sections), 
        coverImage || '/api/placeholder/800/400', // Provide default cover image if none provided
        category, JSON.stringify(tags),
        status, featured, null, 
        authorName || 'Lanora House Team', // Provide default author name if none provided
        authorImage, authorBio, 
        metaTitle || title, // Use title as meta title if not provided
        metaDescription || excerpt, // Use excerpt as meta description if not provided
        finalPublishedAt
      ]);

      res.json({ success: true, id: result.rows[0].id });
    } catch (error) {
      console.error('Error creating blog post:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/admin/blog/posts/:id', async (req, res) => {
    try {
      console.log('📝 Blog post UPDATE request received for ID:', req.params.id);
      console.log('📝 UPDATE Request body keys:', Object.keys(req.body));
      console.log('📝 UPDATE Request body sections:', req.body.sections);
      console.log('📝 UPDATE Request body title:', req.body.title);
      
      const { id } = req.params;
      const {
        title, slug, excerpt, content, sections, coverImage, category, tags,
        status, featured, authorName, authorImage, authorBio, metaTitle, metaDescription, publishedAt,
        scheduledDate, scheduledTime
      } = req.body;

      // First, fetch the existing blog post to preserve values not being updated
      const existingPost = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [id]);
      if (existingPost.rows.length === 0) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
      const existing = existingPost.rows[0];

      // Handle published_at logic for updates
      let finalPublishedAt = publishedAt;
      if (status === 'scheduled' && scheduledDate && scheduledTime) {
        finalPublishedAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      } else if (status === 'published' && !publishedAt) {
        finalPublishedAt = new Date().toISOString();
      } else if (!publishedAt) {
        finalPublishedAt = existing.published_at || new Date().toISOString();
      }

      // Use existing values as fallbacks for required fields
      const finalCoverImage = coverImage || existing.cover_image || '/api/placeholder/800/400';
      const finalAuthorName = authorName || existing.author_name || 'Lanora House Team';
      const finalMetaTitle = metaTitle || title || existing.meta_title;
      const finalMetaDescription = metaDescription || excerpt || existing.meta_description;

      console.log('📝 UPDATE using coverImage:', finalCoverImage);
      console.log('📝 UPDATE using authorName:', finalAuthorName);

      await pool.query(`
        UPDATE blog_posts SET
          title = $1, slug = $2, excerpt = $3, content = $4, sections = $5, cover_image = $6,
          category = $7, tags = $8, status = $9, featured = $10, author_name = $11,
          author_image = $12, author_bio = $13, meta_title = $14, meta_description = $15, published_at = $16, updated_at = NOW()
        WHERE id = $17
      `, [
        title, slug, excerpt, content, JSON.stringify(sections), 
        finalCoverImage,
        category, JSON.stringify(tags),
        status, featured, 
        finalAuthorName,
        authorImage, authorBio, 
        finalMetaTitle,
        finalMetaDescription,
        finalPublishedAt, id
      ]);

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating blog post:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/admin/blog/posts/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Delete comments first
      await pool.query('DELETE FROM blog_comments WHERE post_id = $1', [id]);
      
      // Delete the post
      await pool.query('DELETE FROM blog_posts WHERE id = $1', [id]);

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting blog post:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Blog Categories Management
  app.get('/api/admin/blog/categories', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT id, name, slug, description, color, created_at as "createdAt"
        FROM blog_categories 
        ORDER BY name
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching blog categories:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/admin/blog/categories', async (req, res) => {
    try {
      const { name, description, color } = req.body;
      const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

      const result = await pool.query(`
        INSERT INTO blog_categories (name, slug, description, color)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [name, slug, description, color]);

      res.json({ success: true, id: result.rows[0].id });
    } catch (error) {
      console.error('Error creating blog category:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Admin Users API - Fetch all users for admin management
  app.get("/api/admin/users", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          u.id,
          u.email,
          u.username,
          u.first_name as "firstName",
          u.last_name as "lastName",
          u.profile_image_url as "profileImageUrl",
          u.role,
          u.email_verified as "emailVerified",
          COALESCE(w.balance, 0) as "walletBalance",
          u.created_at as "createdAt",
          u.updated_at as "updatedAt",
          CASE 
            WHEN u.updated_at > NOW() - INTERVAL '30 days' THEN 'active'
            ELSE 'inactive'
          END as status,
          u.updated_at as "lastLogin"
        FROM users u
        LEFT JOIN wallets w ON u.id = w.user_id
        ORDER BY u.created_at DESC
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get users with wallet balances for admin
  app.get("/api/admin/users-with-wallets", async (req, res) => {
    try {
      console.log("🔍 Admin users with wallets request");
      
      // Check admin authentication  
      if (!req.session?.user || req.session.user.role !== 'admin') {
        console.log("❌ Not admin - returning 401");
        return res.status(401).json({ message: "Admin access required" });
      }

      // Get all users with their wallet balances
      const result = await pool.query(`
        SELECT 
          u.id,
          u.email,
          u.username,
          u.first_name as "firstName",
          u.last_name as "lastName",
          u.profile_image_url as "profileImageUrl",
          u.role,
          u.email_verified as "emailVerified",
          u.email_marketing_consent as "emailMarketingConsent",
          u.email_marketing_consent_date as "emailMarketingConsentDate",
          COALESCE(w.balance, 0)::numeric as "walletBalance",
          u.created_at as "createdAt",
          u.updated_at as "updatedAt"
        FROM users u
        LEFT JOIN wallets w ON u.id = w.user_id
        ORDER BY u.created_at DESC
      `);

      console.log(`✅ Found ${result.rows.length} users with wallet data`);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching users with wallets:", error);
      res.status(500).json({ message: "Failed to fetch users with wallet data" });
    }
  });

  // Get wallet balance with transaction history for members
  app.get("/api/wallet/balance", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;

      // Get wallet balance
      const balanceResult = await pool.query(`
        SELECT COALESCE(balance, 0)::numeric as balance
        FROM wallets 
        WHERE user_id = $1
      `, [userId]);

      const balance = balanceResult.rows.length > 0 
        ? parseFloat(balanceResult.rows[0].balance) 
        : 0;

      // Get recent transactions
      const transactionsResult = await pool.query(`
        SELECT 
          id,
          amount::numeric as amount,
          type,
          description,
          status,
          is_credit,
          created_at
        FROM wallet_transactions 
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 20
      `, [userId]);

      res.json({
        balance: balance,
        transactions: transactionsResult.rows
      });

    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin gift credit endpoint
  app.post("/api/admin/gift-credit", async (req, res) => {
    try {
      console.log("💰 Admin gift credit request");
      
      // Check admin authentication  
      if (!req.session?.user || req.session.user.role !== 'admin') {
        console.log("❌ Not admin - returning 401");
        return res.status(401).json({ message: "Admin access required" });
      }

      const { userId, amount, reason } = req.body;

      if (!userId || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid userId or amount" });
      }

      // Use direct pool queries for transaction
      try {
        await pool.query('BEGIN');

        // Ensure user has a wallet
        await pool.query(`
          INSERT INTO member_wallets (user_id, balance, created_at, updated_at)
          VALUES ($1, 0, NOW(), NOW())
          ON CONFLICT (user_id) DO NOTHING
        `, [userId]);

        // Add credit to wallet
        await pool.query(`
          UPDATE member_wallets 
          SET balance = balance + $1, updated_at = NOW()
          WHERE user_id = $2
        `, [amount, userId]);

        // Record transaction
        await pool.query(`
          INSERT INTO wallet_transactions (
            user_id, type, amount, is_credit, description, status, created_at
          ) VALUES ($1, 'admin_credit', $2, $3, $4, 'completed', NOW())
        `, [userId, amount, true, reason || 'Admin credit gift']);

        await pool.query('COMMIT');
        
        console.log(`✅ Added £${amount} credit to user ${userId}`);
        res.json({ 
          message: "Credit added successfully",
          amount,
          userId 
        });

      } catch (transactionError) {
        await pool.query('ROLLBACK');
        throw transactionError;
      }

    } catch (error) {
      console.error("Error gifting credit:", error);
      res.status(500).json({ message: "Failed to gift credit" });
    }
  });

  // Delete user endpoint
  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if user exists
      const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
      if (userCheck.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Delete user (this will cascade delete related records)
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Categories API - Show categories that products are actually using
  app.get("/api/categories", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          c.id,
          c.name,
          c.slug,
          c.description,
          c.image_url as "imageUrl",
          c.created_at as "createdAt",
          c.updated_at as "updatedAt",
          COUNT(p.id) as "productCount"
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        GROUP BY c.id, c.name, c.slug, c.description, c.image_url, c.created_at, c.updated_at
        ORDER BY "productCount" DESC, c.name ASC
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const { name, slug, description, imageUrl } = req.body;
      
      if (!name || !slug) {
        return res.status(400).json({ message: "Name and slug are required" });
      }
      
      const result = await pool.query(`
        INSERT INTO categories (name, slug, description, image_url, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING id, name, slug, description, image_url as "imageUrl", created_at as "createdAt", updated_at as "updatedAt"
      `, [name, slug, description || null, imageUrl || null]);
      
      res.status(201).json({
        ...result.rows[0],
        productCount: 0
      });
    } catch (error) {
      console.error('Error creating category:', error);
      if (error.code === '23505') { // Unique constraint violation
        res.status(400).json({ message: "Category with this slug already exists" });
      } else {
        res.status(500).json({ message: "Failed to create category" });
      }
    }
  });

  app.patch("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, slug, description, imageUrl } = req.body;
      
      const result = await pool.query(`
        UPDATE categories 
        SET name = $1, slug = $2, description = $3, image_url = $4, updated_at = NOW()
        WHERE id = $5
        RETURNING id, name, slug, description, image_url as "imageUrl", created_at as "createdAt", updated_at as "updatedAt"
      `, [name, slug, description, imageUrl, id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      // Get product count for the updated category
      const countResult = await pool.query(
        'SELECT COUNT(*) as count FROM products WHERE category_id = $1',
        [id]
      );
      
      res.json({
        ...result.rows[0],
        productCount: parseInt(countResult.rows[0].count)
      });
    } catch (error) {
      console.error('Error updating category:', error);
      if (error.code === '23505') {
        res.status(400).json({ message: "Category with this slug already exists" });
      } else {
        res.status(500).json({ message: "Failed to update category" });
      }
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if category has products
      const productCheck = await pool.query(
        'SELECT COUNT(*) as count FROM products WHERE category_id = $1',
        [id]
      );
      
      if (parseInt(productCheck.rows[0].count) > 0) {
        return res.status(400).json({ 
          message: "Cannot delete category that has products. Please reassign or delete products first." 
        });
      }
      
      const result = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
      
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Product Offer Routes
  
  // Create a new offer for a product
  app.post("/api/products/:productId/offers", async (req: any, res: Response) => {
    try {
      const { productId } = req.params;
      const { offerAmount, message, expiresAt } = req.body;
      
      // Check for either Replit Auth or session auth
      let userId = req.user?.claims?.sub || req.session?.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Validate input
      if (!offerAmount || parseFloat(offerAmount) <= 0) {
        return res.status(400).json({ message: "Valid offer amount is required" });
      }

      const offerData = {
        productId: parseInt(productId),
        userId,
        offerAmount: offerAmount.toString(),
        message: message || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      };

      const offer = await storage.createProductOffer(offerData);
      
      res.status(201).json(offer);
    } catch (error) {
      console.error("Error creating product offer:", error);
      res.status(500).json({ message: "Failed to create offer" });
    }
  });

  // Get pending offers for admin dashboard
  app.get("/api/admin/offers/pending", async (req: Request, res: Response) => {
    try {
      const session = req.session as any;
      
      if (!session || !session.user || session.user.role !== "admin") {
        return res.status(401).json({ error: "Admin access required" });
      }

      const offers = await storage.getOffersByStatus('pending');
      
      // Enhance offers with product and user information
      const enhancedOffers = await Promise.all(
        offers.map(async (offer) => {
          const product = await storage.getProductById(offer.productId);
          const user = await storage.getUser(offer.userId);
          return {
            ...offer,
            product: product ? {
              id: product.id,
              name: product.name,
              imageUrl: product.imageUrl,
              price: product.price,
            } : null,
            user: user ? {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
            } : null,
          };
        })
      );
      
      res.json(enhancedOffers);
    } catch (error) {
      console.error("Error fetching pending offers:", error);
      res.status(500).json({ message: "Failed to fetch pending offers" });
    }
  });

  // Get all offers for a specific product (admin only)
  app.get("/api/products/:productId/offers", async (req: Request, res: Response) => {
    try {
      const session = req.session as any;
      
      if (!session || !session.user || session.user.role !== "admin") {
        return res.status(401).json({ error: "Admin access required" });
      }

      const { productId } = req.params;
      const offers = await storage.getOffersForProduct(parseInt(productId));
      
      // Enhance offers with user information
      const enhancedOffers = await Promise.all(
        offers.map(async (offer) => {
          const user = await storage.getUser(offer.userId);
          return {
            ...offer,
            user: user ? {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
            } : null,
          };
        })
      );
      
      res.json(enhancedOffers);
    } catch (error) {
      console.error("Error fetching product offers:", error);
      res.status(500).json({ message: "Failed to fetch offers" });
    }
  });

  // Get user's own offers
  app.get("/api/users/me/offers", async (req: any, res: Response) => {
    try {
      // Check for either Replit Auth or session auth
      const userId = req.user?.claims?.sub || req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const offers = await storage.getUserOffers(userId);
      res.json(offers);
    } catch (error) {
      console.error("Error fetching user offers:", error);
      res.status(500).json({ message: "Failed to fetch offers" });
    }
  });

  // Accept an offer (admin only)
  app.post("/api/offers/:offerId/accept", async (req: Request, res: Response) => {
    try {
      const session = req.session as any;
      
      if (!session || !session.user || session.user.role !== "admin") {
        return res.status(401).json({ error: "Admin access required" });
      }

      const { offerId } = req.params;
      const offer = await storage.acceptOffer(parseInt(offerId));
      
      // Create notification for the user
      if (offer) {
        const { notifications } = await import("@shared/schema");
        await db.insert(notifications).values({
          userId: offer.userId,
          message: `Your offer for £${offer.offerAmount} has been accepted! You can now proceed to checkout.`,
          type: 'success'
        });
      }
      
      res.json(offer);
    } catch (error) {
      console.error("Error accepting offer:", error);
      res.status(500).json({ message: "Failed to accept offer" });
    }
  });

  // Reject an offer (admin only)
  app.post("/api/offers/:offerId/reject", async (req: Request, res: Response) => {
    try {
      const session = req.session as any;
      
      if (!session || !session.user || session.user.role !== "admin") {
        return res.status(401).json({ error: "Admin access required" });
      }

      const { offerId } = req.params;
      const { adminResponse } = req.body;
      
      const offer = await storage.rejectOffer(parseInt(offerId), adminResponse);
      
      // Create notification for the user
      if (offer) {
        const { notifications } = await import("@shared/schema");
        await db.insert(notifications).values({
          userId: offer.userId,
          message: `Your offer for £${offer.offerAmount} has been declined.`,
          type: 'info'
        });
      }
      
      res.json(offer);
    } catch (error) {
      console.error("Error rejecting offer:", error);
      res.status(500).json({ message: "Failed to reject offer" });
    }
  });

  // Send counter-offer (admin only)
  app.post("/api/offers/:offerId/counter", async (req: Request, res: Response) => {
    try {
      const session = req.session as any;
      
      if (!session || !session.user || session.user.role !== "admin") {
        return res.status(401).json({ error: "Admin access required" });
      }

      const { offerId } = req.params;
      const { counterOfferAmount, counterOfferMessage } = req.body;
      
      if (!counterOfferAmount || isNaN(parseFloat(counterOfferAmount))) {
        return res.status(400).json({ message: "Valid counter offer amount is required" });
      }

      const { productOffers, notifications } = await import("@shared/schema");
      
      const [updatedOffer] = await db
        .update(productOffers)
        .set({
          status: "counter_sent",
          counterOfferAmount: counterOfferAmount.toString(),
          counterOfferMessage: counterOfferMessage || null,
          counterOfferAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(productOffers.id, parseInt(offerId)))
        .returning();

      if (updatedOffer) {
        await db.insert(notifications).values({
          userId: updatedOffer.userId,
          message: `You have received a counter-offer of £${counterOfferAmount}. Check your offers in the Members Portal.`,
          type: 'info'
        });
      }
      
      res.json(updatedOffer);
    } catch (error) {
      console.error("Error sending counter-offer:", error);
      res.status(500).json({ message: "Failed to send counter-offer" });
    }
  });

  // User respond to counter-offer (accept or decline)
  app.post("/api/offers/:offerId/respond", async (req: any, res: Response) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { offerId } = req.params;
      const { action } = req.body; // 'accept' or 'decline'
      
      if (!action || !['accept', 'decline'].includes(action)) {
        return res.status(400).json({ message: "Action must be 'accept' or 'decline'" });
      }

      const { productOffers } = await import("@shared/schema");
      
      // Get the offer first
      const [offer] = await db
        .select()
        .from(productOffers)
        .where(eq(productOffers.id, parseInt(offerId)));

      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }

      if (offer.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      if (offer.status !== 'counter_sent') {
        return res.status(400).json({ message: "No counter-offer to respond to" });
      }

      const newStatus = action === 'accept' ? 'user_accepted' : 'user_declined';
      
      const [updatedOffer] = await db
        .update(productOffers)
        .set({
          status: newStatus,
          userRespondedAt: new Date(),
          acceptedAt: action === 'accept' ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(productOffers.id, parseInt(offerId)))
        .returning();
      
      res.json(updatedOffer);
    } catch (error) {
      console.error("Error responding to counter-offer:", error);
      res.status(500).json({ message: "Failed to respond to counter-offer" });
    }
  });

  // Get user's orders with tracking
  app.get("/api/members/orders", async (req: any, res: Response) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { orders, orderItems } = await import("@shared/schema");
      
      const userOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt));

      // Get items for each order
      const ordersWithItems = await Promise.all(
        userOrders.map(async (order) => {
          const items = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, order.id));
          return { ...order, items };
        })
      );
      
      res.json(ordersWithItems);
    } catch (error) {
      console.error("Error fetching member orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Purchase an accepted offer
  app.post("/api/offers/:offerId/purchase", async (req: any, res: Response) => {
    try {
      const { offerId } = req.params;
      // Check for either Replit Auth or session auth
      const userId = req.user?.claims?.sub || req.session?.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const offer = await storage.getProductOfferById(parseInt(offerId));
      
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }

      // Check if the offer belongs to the user
      if (offer.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to purchase this offer" });
      }

      // Check if the offer has been accepted
      if (offer.status !== 'accepted') {
        return res.status(400).json({ message: "Offer must be accepted before purchase" });
      }

      // Get the product details
      const product = await storage.getProductById(offer.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Create an order from the accepted offer
      const offerAmount = parseFloat(offer.offerAmount);
      const shipping = 0; // Free shipping for accepted offers
      const tax = 0; // No tax for now
      const discount = 0;
      const total = offerAmount + shipping + tax - discount;
      
      const orderData = {
        userId: userId,
        status: 'pending',
        subtotal: offerAmount,
        shipping: shipping,
        tax: tax,
        discount: discount,
        total: total,
        shippingAddress: JSON.stringify({}), // Empty object for now, will be filled during checkout
        billingAddress: JSON.stringify({}), // Empty object for now, will be filled during checkout
        paymentMethod: 'offer', // Special payment method for offers
        paymentStatus: 'pending',
        stripePaymentIntentId: null
      };

      const orderItems = [{
        productId: offer.productId,
        name: product.name,
        quantity: 1,
        price: offerAmount,
        type: 'product'
      }];

      const order = await storage.createOrder(orderData, orderItems);

      // Update offer status to completed
      await storage.updateOfferStatus(parseInt(offerId), 'completed');

      res.json({ 
        success: true, 
        orderId: order.id,
        message: "Order created successfully from accepted offer" 
      });

    } catch (error) {
      console.error("Error creating order from offer:", error);
      res.status(500).json({ message: "Failed to create order from offer" });
    }
  });

  // Secure endpoint to validate offer for checkout (validates ownership, status, and 48-hour expiry)
  app.get("/api/offers/:offerId/checkout", async (req: any, res: Response) => {
    try {
      const { offerId } = req.params;
      // Check for either Replit Auth or session auth
      const userId = req.user?.claims?.sub || req.session?.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const offer = await storage.getProductOfferById(parseInt(offerId));
      
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }

      // Verify ownership
      if (offer.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to access this offer" });
      }

      // Verify status is payable (accepted or user_accepted)
      if (!['accepted', 'user_accepted'].includes(offer.status)) {
        return res.status(400).json({ 
          message: "This offer is not ready for payment. Only accepted offers can be checked out.",
          status: offer.status
        });
      }

      // Verify 48-hour payment window
      const updatedAt = new Date(offer.updatedAt);
      const deadline = new Date(updatedAt.getTime() + 48 * 60 * 60 * 1000); // 48 hours
      const now = new Date();
      
      if (now > deadline) {
        return res.status(400).json({ 
          message: "This offer has expired. The 48-hour payment window has passed.",
          expired: true
        });
      }

      // Get product details
      const product = await storage.getProductById(offer.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Determine the final price (counter-offer amount or original offer amount)
      const useCounterPrice = offer.counterOfferAmount && parseFloat(offer.counterOfferAmount) > 0;
      const finalPrice = useCounterPrice ? offer.counterOfferAmount : offer.offerAmount;

      // Return validated checkout payload
      res.json({
        valid: true,
        offerId: offer.id,
        productId: offer.productId,
        name: product.name,
        price: finalPrice,
        imageUrl: product.imageUrl,
        deadline: deadline.toISOString(),
        remainingMs: deadline.getTime() - now.getTime()
      });

    } catch (error) {
      console.error("Error validating offer for checkout:", error);
      res.status(500).json({ message: "Failed to validate offer" });
    }
  });

  // Get single offer details (user can see their own, admin can see all)
  // Get notification count for accepted offers
  app.get("/api/notifications/count", async (req: any, res: Response) => {
    try {
      const session = req.session as SessionData;
      if (!session?.user?.id) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = session.user.id;
      const acceptedOffers = await storage.getUserOffers(userId);
      const unreadAcceptedOffers = acceptedOffers.filter(offer => 
        offer.status === 'accepted' && !offer.notificationRead
      );

      res.json({ 
        acceptedOffersCount: unreadAcceptedOffers.length,
        totalNotifications: unreadAcceptedOffers.length
      });
    } catch (error) {
      console.error("Error fetching notification count:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Mark notifications as read
  app.post("/api/notifications/mark-read", async (req: any, res: Response) => {
    try {
      const session = req.session as SessionData;
      if (!session?.user?.id) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = session.user.id;
      // Mark all accepted offers as read
      const acceptedOffers = await storage.getUserOffers(userId);
      for (const offer of acceptedOffers) {
        if (offer.status === 'accepted' && !offer.notificationRead) {
          await storage.markOfferNotificationRead(offer.id);
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      res.status(500).json({ message: "Failed to mark notifications as read" });
    }
  });

  app.get("/api/offers/:offerId", async (req: any, res: Response) => {
    try {
      const { offerId } = req.params;
      // Check for either Replit Auth or session auth
      const userId = req.user?.claims?.sub || req.session?.user?.id;
      const isAdmin = req.session?.user?.role === 'admin';

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const offer = await storage.getProductOfferById(parseInt(offerId));
      
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }

      // Check permissions - user can only see their own offers unless they're admin
      if (!isAdmin && offer.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to view this offer" });
      }
      
      res.json(offer);
    } catch (error) {
      console.error("Error fetching offer:", error);
      res.status(500).json({ message: "Failed to fetch offer" });
    }
  });

  // Import and register recommendation routes
  const recommendationRoutes = await import("./recommendation-routes");
  app.use("/api/recommendations", recommendationRoutes.default);



  // Register social share routes
  app.use("/api", socialShareRoutes);

  // Register social auth routes
  app.use("/api/social-auth", socialAuthRoutes);

  // Import and register admin users routes
  const adminUsersRoutes = await import("./routes/admin-users");
  app.use("/api/admin/users", adminUsersRoutes.default);

  // Import and register admin withdrawal routes
  const { registerAdminWithdrawalRoutes } = await import("./admin-withdrawal-routes");
  registerAdminWithdrawalRoutes(app);

  // Simple Notifications API
  app.get("/api/notifications", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { notifications } = await import("@shared/schema");
      const userNotifications = await db.select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));

      res.json(userNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/count", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { notifications } = await import("@shared/schema");
      const [{ count }] = await db.select({ count: count() })
        .from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

      res.json({ totalNotifications: parseInt(count.toString()) });
    } catch (error) {
      console.error("Error counting notifications:", error);
      res.status(500).json({ totalNotifications: 0 });
    }
  });

  app.post("/api/notifications/:id/read", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.user?.id;
      const { id } = req.params;
      
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { notifications } = await import("@shared/schema");
      await db.update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.id, parseInt(id)), eq(notifications.userId, userId)));

      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/create", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.user?.id;
      const { message, type } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { notifications } = await import("@shared/schema");
      const [notification] = await db.insert(notifications)
        .values({
          userId,
          message,
          type: type || 'info'
        })
        .returning();

      res.json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  // Get instant win tickets for a raffle
  app.get("/api/raffles/:raffleId/instant-win-tickets", async (req, res) => {
    try {
      const { raffleId } = req.params;
      
      const query = `
        SELECT 
          iw.ticket_number,
          iw.prize_type,
          iw.prize_amount,
          iw.claimed,
          iw.created_at,
          COALESCE(u.first_name, u.username, 'Anonymous') as winner_name
        FROM instant_winners iw
        LEFT JOIN users u ON iw.user_id = u.id
        WHERE iw.raffle_id = $1
        ORDER BY iw.prize_amount DESC, iw.created_at ASC
      `;
      
      const result = await pool.query(query, [raffleId]);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching instant win tickets:", error);
      res.status(500).json({ message: "Failed to fetch instant win tickets" });
    }
  });

  // Get all character avatars for members to select
  app.get("/api/character-avatars", async (req: any, res) => {
    try {
      const characters = await db
        .select()
        .from(characterAvatars)
        .where(eq(characterAvatars.isActive, true))
        .orderBy(characterAvatars.createdAt);
      
      res.json(characters);
    } catch (error) {
      console.error("Error fetching character avatars:", error);
      res.status(500).json({ message: "Failed to fetch characters" });
    }
  });

  // Update user avatar with selected character
  app.post("/api/update-avatar", async (req: any, res) => {
    try {
      const sessUser = req.session?.user;
      if (!sessUser?.id) {
        return res.status(401).json({ message: "Not logged in" });
      }

      const { characterId } = req.body;
      
      if (!characterId) {
        return res.status(400).json({ message: "Character ID is required" });
      }

      // Get character details
      const [character] = await db
        .select()
        .from(characterAvatars)
        .where(eq(characterAvatars.id, characterId));

      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }

      // Update user's profile image
      await db.update(users)
        .set({ 
          profileImageUrl: character.imageUrl,
          updatedAt: new Date()
        })
        .where(eq(users.id, sessUser.id));

      // Update session
      req.session.user.profileImageUrl = character.imageUrl;
      
      res.json({ 
        success: true, 
        avatarUrl: character.imageUrl,
        characterName: character.name,
        characterId: character.id
      });
    } catch (error) {
      console.error("Avatar update error:", error);
      res.status(500).json({ message: "Failed to update avatar" });
    }
  });

  // Admin: Get all character avatars
  app.get("/api/admin/character-avatars", requireAdmin, async (req: any, res) => {
    try {
      const characters = await db
        .select()
        .from(characterAvatars)
        .orderBy(characterAvatars.createdAt);
      
      res.json(characters);
    } catch (error) {
      console.error("Error fetching character avatars:", error);
      res.status(500).json({ message: "Failed to fetch characters" });
    }
  });

  // Admin: Create character avatar
  app.post("/api/admin/character-avatars", requireAdmin, upload.single('image'), async (req: any, res) => {
    try {
      const { name } = req.body;
      const file = req.file;
      
      if (!name || !file) {
        return res.status(400).json({ message: "Name and image are required" });
      }

      const characterId = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const imageUrl = `/uploads/${file.filename}`;

      await db.insert(characterAvatars).values({
        id: characterId,
        name: name,
        imageUrl: imageUrl,
        isActive: true,
      });

      res.json({ 
        success: true, 
        message: "Character created successfully",
        characterId 
      });
    } catch (error) {
      console.error("Error creating character:", error);
      res.status(500).json({ message: "Failed to create character" });
    }
  });

  // Admin: Update character avatar
  app.put("/api/admin/character-avatars/:id", requireAdmin, upload.single('image'), async (req: any, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const file = req.file;
      
      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }

      const updateData: any = {
        name: name,
        updatedAt: new Date(),
      };

      if (file) {
        updateData.imageUrl = `/uploads/${file.filename}`;
      }

      await db.update(characterAvatars)
        .set(updateData)
        .where(eq(characterAvatars.id, id));

      res.json({ 
        success: true, 
        message: "Character updated successfully" 
      });
    } catch (error) {
      console.error("Error updating character:", error);
      res.status(500).json({ message: "Failed to update character" });
    }
  });

  // Admin: Delete character avatar
  app.delete("/api/admin/character-avatars/:id", requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      await db.delete(characterAvatars)
        .where(eq(characterAvatars.id, id));

      res.json({ 
        success: true, 
        message: "Character deleted successfully" 
      });
    } catch (error) {
      console.error("Error deleting character:", error);
      res.status(500).json({ message: "Failed to delete character" });
    }
  });

  // Before & After Posts Admin API
  // Get all before/after posts
  app.get('/api/admin/before-after', requireAdmin, async (req, res) => {
    try {
      const result = await db.select().from(beforeAfterPosts).orderBy(desc(beforeAfterPosts.createdAt));
      
      // Ensure camelCase properties are returned correctly
      const transformedResult = result.map(post => ({
        id: post.id,
        title: post.title,
        description: post.description,
        beforeImageUrls: post.beforeImageUrls,
        afterImageUrls: post.afterImageUrls,
        category: post.category,
        location: post.location,
        featured: post.featured,
        published: post.published,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }));
      
      res.json(transformedResult);
    } catch (error) {
      console.error('Error fetching before/after posts:', error);
      res.status(500).json({ message: 'Failed to fetch before/after posts' });
    }
  });

  // Create new before/after post
  app.post('/api/admin/before-after', requireAdmin, async (req, res) => {
    try {
      const { title, description, beforeImageUrls, afterImageUrls, category, location, featured, published } = req.body;

      if (!title || !beforeImageUrls || !afterImageUrls || beforeImageUrls.length === 0 || afterImageUrls.length === 0) {
        return res.status(400).json({ message: 'Title, before images, and after images are required' });
      }

      const result = await db.insert(beforeAfterPosts).values({
        title,
        description,
        beforeImageUrls,
        afterImageUrls,
        category: category || 'general',
        location,
        featured: featured || false,
        published: published !== false,
      }).returning();

      res.status(201).json(result[0]);
    } catch (error) {
      console.error('Error creating before/after post:', error);
      res.status(500).json({ message: 'Failed to create before/after post' });
    }
  });

  // Update before/after post
  app.put('/api/admin/before-after/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, beforeImageUrls, afterImageUrls, category, location, featured, published } = req.body;

      const result = await db.update(beforeAfterPosts)
        .set({
          title,
          description,
          beforeImageUrls,
          afterImageUrls,
          category,
          location,
          featured,
          published,
          updatedAt: new Date(),
        })
        .where(eq(beforeAfterPosts.id, parseInt(id)))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ message: 'Before/after post not found' });
      }

      res.json(result[0]);
    } catch (error) {
      console.error('Error updating before/after post:', error);
      res.status(500).json({ message: 'Failed to update before/after post' });
    }
  });

  // Delete before/after post
  app.delete('/api/admin/before-after/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      const result = await db.delete(beforeAfterPosts)
        .where(eq(beforeAfterPosts.id, parseInt(id)))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ message: 'Before/after post not found' });
      }

      res.json({ success: true, message: 'Before/after post deleted successfully' });
    } catch (error) {
      console.error('Error deleting before/after post:', error);
      res.status(500).json({ message: 'Failed to delete before/after post' });
    }
  });

  // Public API to get published before/after posts — featured first, then by date
  app.get('/api/before-after', async (req, res) => {
    try {
      const result = await db.select()
        .from(beforeAfterPosts)
        .where(eq(beforeAfterPosts.published, true))
        .orderBy(desc(beforeAfterPosts.featured), desc(beforeAfterPosts.createdAt));
      
      // Ensure camelCase properties are returned correctly
      const transformedResult = result.map(post => ({
        id: post.id,
        title: post.title,
        description: post.description,
        beforeImageUrls: post.beforeImageUrls,
        afterImageUrls: post.afterImageUrls,
        category: post.category,
        location: post.location,
        featured: post.featured,
        published: post.published,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }));
      
      res.json(transformedResult);
    } catch (error) {
      console.error('Error fetching published before/after posts:', error);
      res.status(500).json({ message: 'Failed to fetch before/after posts' });
    }
  });

  // Team Member Management API Routes
  // Public API to get all active team members
  app.get("/api/team-members", async (req: Request, res: Response) => {
    try {
      const teamMembers = await storage.getActiveTeamMembers();
      res.json(teamMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  // Admin: Get all team members (including inactive)
  app.get("/api/admin/team-members", requireAdmin, async (req: Request, res: Response) => {
    try {
      const teamMembers = await storage.getAllTeamMembers();
      res.json(teamMembers);
    } catch (error) {
      console.error("Error fetching all team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  // Admin: Get specific team member by ID
  app.get("/api/admin/team-members/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const teamMember = await storage.getTeamMemberById(parseInt(id));
      
      if (!teamMember) {
        return res.status(404).json({ message: "Team member not found" });
      }
      
      res.json(teamMember);
    } catch (error) {
      console.error("Error fetching team member:", error);
      res.status(500).json({ message: "Failed to fetch team member" });
    }
  });

  // Admin: Upload team member image
  app.post("/api/admin/team-members/upload-image", requireAdmin, teamMemberImageUpload.single('image'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      
      // Return the file path that can be used as imageUrl
      const imageUrl = `/uploads/team-members/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error: any) {
      console.error("Error uploading team member image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Admin: Create new team member
  app.post("/api/admin/team-members", requireAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertTeamMemberSchema.parse(req.body);
      const newTeamMember = await storage.createTeamMember(validatedData);
      res.status(201).json(newTeamMember);
    } catch (error: any) {
      console.error("Error creating team member:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create team member" });
    }
  });

  // Admin: Update team member
  app.put("/api/admin/team-members/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const updatedTeamMember = await storage.updateTeamMember(parseInt(id), updateData);
      
      if (!updatedTeamMember) {
        return res.status(404).json({ message: "Team member not found" });
      }
      
      res.json(updatedTeamMember);
    } catch (error) {
      console.error("Error updating team member:", error);
      res.status(500).json({ message: "Failed to update team member" });
    }
  });

  // Admin: Delete team member
  app.delete("/api/admin/team-members/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTeamMember(parseInt(id));
      
      if (!deleted) {
        return res.status(404).json({ message: "Team member not found" });
      }
      
      res.json({ success: true, message: "Team member deleted successfully" });
    } catch (error) {
      console.error("Error deleting team member:", error);
      res.status(500).json({ message: "Failed to delete team member" });
    }
  });

  // Customer Reviews API Routes
  // Public API to get all active customer reviews (for carousel)
  app.get("/api/customer-reviews", async (req: Request, res: Response) => {
    try {
      const reviews = await storage.getActiveCustomerReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching customer reviews:", error);
      res.status(500).json({ message: "Failed to fetch customer reviews" });
    }
  });

  // ─── Google Business Profile API – Reviews ───────────────────────────────

  // Public endpoint – returns all reviews (≥4★) for the carousel
  app.get("/api/google-reviews", async (req: Request, res: Response) => {
    try {
      const reviews = await getGoogleBusinessReviews(4);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching Google Business Profile reviews:", error);
      res.json([]); // fail gracefully – carousel still works with DB reviews
    }
  });

  // Admin: check connection status
  app.get("/api/admin/google-business-status", requireAdmin, (req: Request, res: Response) => {
    const store = readTokenStore();
    res.json({
      connected: isConfigured(),
      accountName: store?.accountName || null,
      locationName: store?.locationName || null,
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasRedirectUri: !!process.env.GOOGLE_REDIRECT_URI,
    });
  });

  // Admin: generate the OAuth authorization URL (step 1 of setup)
  app.get("/api/admin/google-business-auth-url", requireAdmin, (req: Request, res: Response) => {
    try {
      const url = buildAuthUrl();
      res.json({ url });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin: OAuth callback – exchanges code, discovers account/location, saves tokens
  app.get("/api/admin/google-business-callback", async (req: Request, res: Response) => {
    const { code, error } = req.query as Record<string, string>;

    if (error) {
      return res.redirect(`/admin?googleError=${encodeURIComponent(error)}`);
    }
    if (!code) {
      return res.status(400).send("Missing authorization code");
    }

    try {
      const tokens = await exchangeCodeForTokens(code);
      const { accountName, locationName } = await discoverAccountAndLocation(tokens.accessToken);
      writeTokenStore({ ...tokens, accountName, locationName });
      clearReviewCache();
      console.log(`Google Business Profile connected: ${locationName}`);
      res.redirect("/admin?googleConnected=1");
    } catch (err: any) {
      console.error("Google Business Profile OAuth callback error:", err.message);
      res.redirect(`/admin?googleError=${encodeURIComponent(err.message)}`);
    }
  });

  // Admin: disconnect (delete token file / clear cache)
  app.post("/api/admin/google-business-disconnect", requireAdmin, (req: Request, res: Response) => {
    try {
      const fs = require("fs");
      const path = require("path");
      const tokenFile = path.join(process.cwd(), "google-business-tokens.json");
      if (fs.existsSync(tokenFile)) fs.unlinkSync(tokenFile);
      clearReviewCache();
      res.json({ message: "Disconnected" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Admin: force-refresh the reviews cache
  app.post("/api/admin/google-business-refresh", requireAdmin, async (req: Request, res: Response) => {
    try {
      clearReviewCache();
      const reviews = await getGoogleBusinessReviews(1); // fetch all ratings
      res.json({ count: reviews.length, reviews });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Admin: Get all customer reviews (including inactive)
  app.get("/api/admin/customer-reviews", requireAdmin, async (req: Request, res: Response) => {
    try {
      const reviews = await storage.getAllCustomerReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching all customer reviews:", error);
      res.status(500).json({ message: "Failed to fetch customer reviews" });
    }
  });

  // Admin: Get specific customer review by ID
  app.get("/api/admin/customer-reviews/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const review = await storage.getCustomerReviewById(parseInt(id));
      
      if (!review) {
        return res.status(404).json({ message: "Customer review not found" });
      }
      
      res.json(review);
    } catch (error) {
      console.error("Error fetching customer review:", error);
      res.status(500).json({ message: "Failed to fetch customer review" });
    }
  });

  // Admin: Create new customer review
  app.post("/api/admin/customer-reviews", requireAdmin, async (req: Request, res: Response) => {
    try {
      // Convert date string to Date object before validation
      const dataWithDate = {
        ...req.body,
        reviewDate: new Date(req.body.reviewDate)
      };
      const validatedData = insertCustomerReviewSchema.parse(dataWithDate);
      const newReview = await storage.createCustomerReview(validatedData);
      res.status(201).json(newReview);
    } catch (error: any) {
      console.error("Error creating customer review:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create customer review" });
    }
  });

  // Admin: Bulk create customer reviews
  app.post("/api/admin/customer-reviews/bulk", requireAdmin, async (req: Request, res: Response) => {
    try {
      const rows: any[] = req.body;
      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({ message: "Expected a non-empty array of reviews" });
      }
      const created: any[] = [];
      const errors: any[] = [];
      for (let i = 0; i < rows.length; i++) {
        try {
          const dataWithDate = { ...rows[i], reviewDate: new Date(rows[i].reviewDate || new Date()) };
          const validated = insertCustomerReviewSchema.parse(dataWithDate);
          const review = await storage.createCustomerReview(validated);
          created.push(review);
        } catch (err: any) {
          errors.push({ index: i, name: rows[i]?.customerName, error: err.message });
        }
      }
      res.status(201).json({ created: created.length, errors });
    } catch (error) {
      console.error("Error bulk creating customer reviews:", error);
      res.status(500).json({ message: "Failed to bulk create reviews" });
    }
  });

  // Admin: Update customer review
  app.put("/api/admin/customer-reviews/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      // Convert date string to Date object if reviewDate is present
      const updateData = {
        ...req.body,
        ...(req.body.reviewDate && { reviewDate: new Date(req.body.reviewDate) })
      };
      
      const updatedReview = await storage.updateCustomerReview(parseInt(id), updateData);
      
      if (!updatedReview) {
        return res.status(404).json({ message: "Customer review not found" });
      }
      
      res.json(updatedReview);
    } catch (error) {
      console.error("Error updating customer review:", error);
      res.status(500).json({ message: "Failed to update customer review" });
    }
  });

  // Admin: Delete customer review
  app.delete("/api/admin/customer-reviews/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCustomerReview(parseInt(id));
      
      if (!deleted) {
        return res.status(404).json({ message: "Customer review not found" });
      }
      
      res.json({ success: true, message: "Customer review deleted successfully" });
    } catch (error) {
      console.error("Error deleting customer review:", error);
      res.status(500).json({ message: "Failed to delete customer review" });
    }
  });

  // ========== GALLERY IMAGE ROUTES ==========

  // Public: Get active gallery images
  // Background sync lock to prevent concurrent scrapes
  let easyliveScrapePending = false;

  /** Upsert EasyLive lots into the gallery_images table (keyed by imageUrl). */
  async function upsertEasyLiveLots(lots: { title: string; imageUrl: string; soldPrice: string }[]) {
    const existing: GalleryImage[] = await db
      .select()
      .from(galleryImages)
      .where(gte(galleryImages.displayOrder, 10000));

    const existingByUrl = new Map<string, GalleryImage>(existing.map((row) => [row.imageUrl, row]));
    const scrapedUrls   = new Set<string>(lots.map((l) => l.imageUrl));

    // Delete rows that are no longer in the scrape results
    const toDelete = existing.filter((row) => !scrapedUrls.has(row.imageUrl));
    for (const row of toDelete) {
      await db.delete(galleryImages).where(eq(galleryImages.id, row.id));
    }

    // Insert or update each scraped lot
    for (let i = 0; i < lots.length; i++) {
      const lot = lots[i];
      const existingRow = existingByUrl.get(lot.imageUrl);
      if (existingRow) {
        await db
          .update(galleryImages)
          .set({ title: lot.title, soldPrice: lot.soldPrice, displayOrder: 10000 + i })
          .where(eq(galleryImages.id, existingRow.id));
      } else {
        await db.insert(galleryImages).values({
          title: lot.title,
          estimate: null,
          soldPrice: lot.soldPrice,
          imageUrl: lot.imageUrl,
          displayOrder: 10000 + i,
          isActive: true,
        });
      }
    }
  }

  // Global cooldown — minimum time between any two public-triggered syncs (5 minutes).
  // This is a server-wide throttle, not per-IP; pair with a gateway rate-limiter if
  // per-client enforcement is needed in future.
  let lastPublicSyncAt = 0;
  const PUBLIC_SYNC_COOLDOWN_MS = 5 * 60 * 1000;

  function triggerBackgroundSync() {
    if (easyliveScrapePending) return;
    easyliveScrapePending = true;
    scrapeEasyLiveCatalogues()
      .then(async (lots) => {
        if (lots.length === 0) {
          // Empty scrape: clear EasyLive rows so curated fallback is served
          await db.delete(galleryImages).where(gte(galleryImages.displayOrder, 10000));
          console.log("[EasyLive BG Sync] Empty scrape — EasyLive rows cleared; curated content will be shown.");
          return;
        }
        await upsertEasyLiveLots(lots);
        console.log(`[EasyLive BG Sync] Upserted ${lots.length} sold lots.`);
      })
      .catch((err: Error) => console.error("[EasyLive BG Sync] Failed:", err.message))
      .finally(() => { easyliveScrapePending = false; });
  }

  app.get("/api/gallery-images", async (req: Request, res: Response) => {
    try {
      // Trigger background refresh when data is stale (non-blocking — response not delayed)
      if (needsSync()) {
        triggerBackgroundSync();
      }

      const allActive: GalleryImage[] = await storage.getActiveGalleryImages();

      // Source priority: show EasyLive-synced rows (displayOrder >= 10000) when present;
      // fall back to manually curated rows (displayOrder < 10000) when absent.
      const easyliveRows = allActive.filter((img) => (img.displayOrder ?? 0) >= 10000);
      const curatedRows  = allActive.filter((img) => (img.displayOrder ?? 0) <  10000);
      const images = easyliveRows.length > 0 ? easyliveRows : curatedRows;

      res.json(images);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  // Public: Trigger gallery sync — non-blocking background scrape.
  // Protected by in-memory pending flag + per-client cooldown to prevent abuse.
  app.post("/api/gallery-images/sync", async (_req: Request, res: Response) => {
    const now = Date.now();
    if (now - lastPublicSyncAt < PUBLIC_SYNC_COOLDOWN_MS) {
      return res.status(429).json({
        message: "Sync requested too recently. Please wait before triggering another sync.",
        lastSyncAt: getLastSyncAt(),
        needsSync: needsSync(),
      });
    }
    lastPublicSyncAt = now;
    triggerBackgroundSync();
    res.json({ message: "Sync triggered in background.", lastSyncAt: getLastSyncAt(), needsSync: needsSync() });
  });

  // Admin: Get all gallery images
  app.get("/api/admin/gallery-images", requireAdmin, async (req: Request, res: Response) => {
    try {
      const images = await storage.getAllGalleryImages();
      res.json(images);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  // Admin: Create gallery image
  app.post("/api/admin/gallery-images", requireAdmin, async (req: Request, res: Response) => {
    try {
      const newImage = await storage.createGalleryImage(req.body);
      res.status(201).json(newImage);
    } catch (error) {
      console.error("Error creating gallery image:", error);
      res.status(500).json({ message: "Failed to create gallery image" });
    }
  });

  // Admin: Update gallery image
  app.put("/api/admin/gallery-images/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updatedImage = await storage.updateGalleryImage(parseInt(id), req.body);
      
      if (!updatedImage) {
        return res.status(404).json({ message: "Gallery image not found" });
      }
      
      res.json(updatedImage);
    } catch (error) {
      console.error("Error updating gallery image:", error);
      res.status(500).json({ message: "Failed to update gallery image" });
    }
  });

  // Admin: Delete gallery image
  app.delete("/api/admin/gallery-images/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteGalleryImage(parseInt(id));
      
      if (!deleted) {
        return res.status(404).json({ message: "Gallery image not found" });
      }
      
      res.json({ success: true, message: "Gallery image deleted successfully" });
    } catch (error) {
      console.error("Error deleting gallery image:", error);
      res.status(500).json({ message: "Failed to delete gallery image" });
    }
  });

  // Admin: Sync gallery images from EasyLive (POST triggers a fresh scrape)
  app.post("/api/admin/gallery-images/sync", requireAdmin, async (req: Request, res: Response) => {
    try {
      const catalogueUrls: string[] | undefined = req.body?.catalogueUrls;
      console.log("[EasyLive Sync] Starting scrape...");

      const lots = await scrapeEasyLiveCatalogues(catalogueUrls);

      if (lots.length === 0) {
        // Clear existing EasyLive rows so curated content is served as fallback
        await db.delete(galleryImages).where(gte(galleryImages.displayOrder, 10000));
        return res.status(200).json({
          message: "Scrape returned no sold lots. EasyLive rows cleared — curated images will now be shown.",
          imported: 0,
          lastSyncAt: getLastSyncAt(),
        });
      }

      // Idempotent upsert keyed by imageUrl — preserves IDs and avoids row churn
      await upsertEasyLiveLots(lots);

      console.log(`[EasyLive Sync] Upserted ${lots.length} sold lots.`);
      res.json({
        message: `Successfully synced ${lots.length} sold lots from EasyLive.`,
        imported: lots.length,
        lastSyncAt: getLastSyncAt(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[EasyLive Sync] Error:", error);
      res.status(500).json({ message: `Sync failed: ${message}` });
    }
  });

  // Public: Get EasyLive sync status
  app.get("/api/gallery-images/sync-status", async (_req: Request, res: Response) => {
    res.json({ lastSyncAt: getLastSyncAt(), needsSync: needsSync() });
  });

  // ========== CALENDAR EVENT ROUTES ==========

  // Public: Get active calendar events
  app.get("/api/calendar-events", async (req: Request, res: Response) => {
    try {
      const events = await storage.getActiveCalendarEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  // Admin: Get all calendar events
  app.get("/api/admin/calendar-events", requireAdmin, async (req: Request, res: Response) => {
    try {
      const events = await storage.getAllCalendarEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  // Admin: Create calendar event
  app.post("/api/admin/calendar-events", requireAdmin, async (req: Request, res: Response) => {
    try {
      const newEvent = await storage.createCalendarEvent(req.body);
      res.status(201).json(newEvent);
    } catch (error) {
      console.error("Error creating calendar event:", error);
      res.status(500).json({ message: "Failed to create calendar event" });
    }
  });

  // Admin: Update calendar event
  app.put("/api/admin/calendar-events/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updatedEvent = await storage.updateCalendarEvent(parseInt(id), req.body);
      
      if (!updatedEvent) {
        return res.status(404).json({ message: "Calendar event not found" });
      }
      
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating calendar event:", error);
      res.status(500).json({ message: "Failed to update calendar event" });
    }
  });

  // Admin: Delete calendar event
  app.delete("/api/admin/calendar-events/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCalendarEvent(parseInt(id));
      
      if (!deleted) {
        return res.status(404).json({ message: "Calendar event not found" });
      }
      
      res.json({ success: true, message: "Calendar event deleted successfully" });
    } catch (error) {
      console.error("Error deleting calendar event:", error);
      res.status(500).json({ message: "Failed to delete calendar event" });
    }
  });

  // ========== AUCTION HIGHLIGHTS ROUTES ==========

  app.get("/api/auction-highlights", async (req: Request, res: Response) => {
    try {
      const highlights = await storage.getActiveAuctionHighlights();
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const upcoming = highlights.filter(h => {
        const aDate = new Date(h.auctionDate);
        aDate.setUTCHours(0, 0, 0, 0);
        return aDate >= today;
      });
      const previous = highlights.filter(h => {
        const aDate = new Date(h.auctionDate);
        aDate.setUTCHours(0, 0, 0, 0);
        return aDate < today;
      });
      if (req.query.type === 'previous') {
        res.json(previous.sort((a, b) => new Date(b.auctionDate).getTime() - new Date(a.auctionDate).getTime()));
      } else if (req.query.type === 'upcoming') {
        res.json(upcoming.sort((a, b) => new Date(a.auctionDate).getTime() - new Date(b.auctionDate).getTime()));
      } else {
        res.json({ upcoming, previous });
      }
    } catch (error) {
      console.error("Error fetching auction highlights:", error);
      res.status(500).json({ message: "Failed to fetch auction highlights" });
    }
  });

  // Admin: Get all auction highlights
  app.get("/api/admin/auction-highlights", requireAdmin, async (req: Request, res: Response) => {
    try {
      const highlights = await storage.getAllAuctionHighlights();
      res.json(highlights);
    } catch (error) {
      console.error("Error fetching auction highlights:", error);
      res.status(500).json({ message: "Failed to fetch auction highlights" });
    }
  });

  // Admin: Create auction highlight
  app.post("/api/admin/auction-highlights", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { title, ctaUrl, auctionDate, displayOrder, ...rest } = req.body;
      
      // Validate required fields
      if (!title || !ctaUrl || !auctionDate) {
        return res.status(400).json({ message: "Title, URL, and auction date are required" });
      }
      
      // Validate date format
      const parsedDate = new Date(auctionDate);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Invalid auction date format" });
      }
      
      const highlightData = {
        title,
        ctaUrl,
        auctionDate,
        displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
        ...rest
      };
      
      const newHighlight = await storage.createAuctionHighlight(highlightData);
      res.status(201).json(newHighlight);
    } catch (error) {
      console.error("Error creating auction highlight:", error);
      res.status(500).json({ message: "Failed to create auction highlight" });
    }
  });

  // Admin: Update auction highlight
  app.put("/api/admin/auction-highlights/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { auctionDate, displayOrder, ...rest } = req.body;
      
      // Validate date format if provided
      if (auctionDate) {
        const parsedDate = new Date(auctionDate);
        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({ message: "Invalid auction date format" });
        }
      }
      
      const updateData = {
        ...rest,
        ...(auctionDate && { auctionDate }),
        ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) })
      };
      
      const updatedHighlight = await storage.updateAuctionHighlight(parseInt(id), updateData);
      
      if (!updatedHighlight) {
        return res.status(404).json({ message: "Auction highlight not found" });
      }
      
      res.json(updatedHighlight);
    } catch (error) {
      console.error("Error updating auction highlight:", error);
      res.status(500).json({ message: "Failed to update auction highlight" });
    }
  });

  // Admin: Delete auction highlight
  app.delete("/api/admin/auction-highlights/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteAuctionHighlight(parseInt(id));
      
      if (!deleted) {
        return res.status(404).json({ message: "Auction highlight not found" });
      }
      
      res.json({ success: true, message: "Auction highlight deleted successfully" });
    } catch (error) {
      console.error("Error deleting auction highlight:", error);
      res.status(500).json({ message: "Failed to delete auction highlight" });
    }
  });

  // ========== AUCTION CATALOGUE ROUTES ==========

  // Public: Get all public auction catalogues (active, scheduled, completed)
  app.get("/api/auction-catalogues", async (req: Request, res: Response) => {
    try {
      const catalogues = await db.select()
        .from(auctionCatalogues)
        .where(sql`${auctionCatalogues.status} IN ('active', 'scheduled', 'completed')`)
        .orderBy(desc(auctionCatalogues.startDate));
      res.json(catalogues);
    } catch (error) {
      console.error("Error fetching auction catalogues:", error);
      res.status(500).json({ message: "Failed to fetch auction catalogues" });
    }
  });

  // Public: Get auction catalogue by ID with its lots
  app.get("/api/auction-catalogues/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const catalogue = await db.select().from(auctionCatalogues).where(eq(auctionCatalogues.id, id)).limit(1);
      
      if (catalogue.length === 0) {
        return res.status(404).json({ message: "Catalogue not found" });
      }

      const lots = await db.select().from(auctionLots).where(eq(auctionLots.catalogId, id));
      
      res.json({ ...catalogue[0], lots });
    } catch (error) {
      console.error("Error fetching auction catalogue:", error);
      res.status(500).json({ message: "Failed to fetch auction catalogue" });
    }
  });

  // Admin: Get all auction catalogues (including inactive)
  app.get("/api/admin/auction-catalogues", requireAdmin, async (req: Request, res: Response) => {
    try {
      const catalogues = await db.select().from(auctionCatalogues).orderBy(desc(auctionCatalogues.createdAt));
      res.json(catalogues);
    } catch (error) {
      console.error("Error fetching admin auction catalogues:", error);
      res.status(500).json({ message: "Failed to fetch auction catalogues" });
    }
  });

  // Admin: Get auction catalogue by ID
  app.get("/api/admin/auction-catalogues/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const catalogue = await db.select().from(auctionCatalogues).where(eq(auctionCatalogues.id, id)).limit(1);
      
      if (catalogue.length === 0) {
        return res.status(404).json({ message: "Catalogue not found" });
      }
      
      res.json(catalogue[0]);
    } catch (error) {
      console.error("Error fetching auction catalogue:", error);
      res.status(500).json({ message: "Failed to fetch auction catalogue" });
    }
  });

  // Admin: Create auction catalogue
  app.post("/api/admin/auction-catalogues", requireAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertAuctionCatalogueSchema.parse(req.body);
      
      // Helper function to safely convert date strings
      const safelyConvertDate = (dateValue: any): Date | undefined => {
        if (!dateValue) return undefined;
        if (typeof dateValue === 'string' && dateValue.trim() === '') return undefined;
        const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
        return isNaN(date.getTime()) ? undefined : date;
      };
      
      // Convert string dates to Date objects with validation
      const startDate = safelyConvertDate(validatedData.startDate);
      if (!startDate) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: [{ field: 'startDate', message: 'Valid start date is required' }]
        });
      }
      
      const dataToInsert = {
        id: `catalog_${Date.now()}`,
        ...validatedData,
        startDate,
        endDate: safelyConvertDate(validatedData.endDate),
        viewingStartDate: safelyConvertDate(validatedData.viewingStartDate),
        viewingEndDate: safelyConvertDate(validatedData.viewingEndDate),
      };
      
      const newCatalogue = await db.insert(auctionCatalogues).values([dataToInsert]).returning();
      res.status(201).json(newCatalogue[0]);
    } catch (error: any) {
      console.error("Error creating auction catalogue:", error);
      if (error?.issues) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.issues 
        });
      }
      res.status(500).json({ message: "Failed to create auction catalogue" });
    }
  });

  // Admin: Update auction catalogue
  app.put("/api/admin/auction-catalogues/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = updateAuctionCatalogueSchema.parse(req.body);
      
      // Convert string dates to Date objects
      const dataToUpdate: any = { ...validatedData };
      if (dataToUpdate.startDate && typeof dataToUpdate.startDate === 'string') {
        dataToUpdate.startDate = new Date(dataToUpdate.startDate);
      }
      if (dataToUpdate.endDate && typeof dataToUpdate.endDate === 'string') {
        dataToUpdate.endDate = new Date(dataToUpdate.endDate);
      }
      if (dataToUpdate.viewingStartDate && typeof dataToUpdate.viewingStartDate === 'string') {
        dataToUpdate.viewingStartDate = new Date(dataToUpdate.viewingStartDate);
      }
      if (dataToUpdate.viewingEndDate && typeof dataToUpdate.viewingEndDate === 'string') {
        dataToUpdate.viewingEndDate = new Date(dataToUpdate.viewingEndDate);
      }
      
      const updatedCatalogue = await db.update(auctionCatalogues)
        .set(dataToUpdate)
        .where(eq(auctionCatalogues.id, id))
        .returning();
      
      if (updatedCatalogue.length === 0) {
        return res.status(404).json({ message: "Catalogue not found" });
      }
      
      res.json(updatedCatalogue[0]);
    } catch (error: any) {
      console.error("Error updating auction catalogue:", error);
      if (error?.issues) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.issues 
        });
      }
      res.status(500).json({ message: "Failed to update auction catalogue" });
    }
  });

  // Admin: Delete auction catalogue
  app.delete("/api/admin/auction-catalogues/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Delete associated lots first
      await db.delete(auctionLots).where(eq(auctionLots.catalogId, id));
      
      // Delete catalogue
      const deleted = await db.delete(auctionCatalogues).where(eq(auctionCatalogues.id, id)).returning();
      
      if (deleted.length === 0) {
        return res.status(404).json({ message: "Catalogue not found" });
      }
      
      res.json({ success: true, message: "Catalogue deleted successfully" });
    } catch (error) {
      console.error("Error deleting auction catalogue:", error);
      res.status(500).json({ message: "Failed to delete auction catalogue" });
    }
  });

  // ========== AUCTION LOT ROUTES ==========

  // Public: Get auction lot by ID
  app.get("/api/auction-lots/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const lot = await db.select().from(auctionLots).where(eq(auctionLots.id, id)).limit(1);
      
      if (lot.length === 0) {
        return res.status(404).json({ message: "Lot not found" });
      }
      
      res.json(lot[0]);
    } catch (error) {
      console.error("Error fetching auction lot:", error);
      res.status(500).json({ message: "Failed to fetch auction lot" });
    }
  });

  // Admin: Get all auction lots
  app.get("/api/admin/auction-lots", requireAdmin, async (req: Request, res: Response) => {
    try {
      const lots = await db.select().from(auctionLots).orderBy(desc(auctionLots.createdAt));
      res.json(lots);
    } catch (error) {
      console.error("Error fetching admin auction lots:", error);
      res.status(500).json({ message: "Failed to fetch auction lots" });
    }
  });

  // Admin: Get lots by catalogue ID
  app.get("/api/admin/auction-catalogues/:catalogueId/lots", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { catalogueId } = req.params;
      const lots = await db.select().from(auctionLots).where(eq(auctionLots.catalogId, catalogueId)).orderBy(auctionLots.lotNumber);
      res.json(lots);
    } catch (error) {
      console.error("Error fetching catalogue lots:", error);
      res.status(500).json({ message: "Failed to fetch catalogue lots" });
    }
  });

  // Admin: Get auction lot by ID
  app.get("/api/admin/auction-lots/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const lot = await db.select().from(auctionLots).where(eq(auctionLots.id, id)).limit(1);
      
      if (lot.length === 0) {
        return res.status(404).json({ message: "Lot not found" });
      }
      
      res.json(lot[0]);
    } catch (error) {
      console.error("Error fetching auction lot:", error);
      res.status(500).json({ message: "Failed to fetch auction lot" });
    }
  });

  // Admin: Create auction lot
  app.post("/api/admin/auction-lots", requireAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertAuctionLotSchema.parse(req.body);
      
      // Convert types as needed
      const dataToInsert: any = {
        id: `lot_${Date.now()}`,
        ...validatedData,
        lotNumber: typeof validatedData.lotNumber === 'string' ? parseInt(validatedData.lotNumber) : validatedData.lotNumber,
      };
      
      // Handle estimated values - convert numbers to strings for decimal fields
      if (validatedData.estimatedValueLow !== undefined) {
        dataToInsert.estimatedValueLow = typeof validatedData.estimatedValueLow === 'number' 
          ? validatedData.estimatedValueLow.toString() 
          : validatedData.estimatedValueLow;
      }
      if (validatedData.estimatedValueHigh !== undefined) {
        dataToInsert.estimatedValueHigh = typeof validatedData.estimatedValueHigh === 'number' 
          ? validatedData.estimatedValueHigh.toString() 
          : validatedData.estimatedValueHigh;
      }
      
      const newLot = await db.insert(auctionLots).values([dataToInsert]).returning();
      res.status(201).json(newLot[0]);
    } catch (error: any) {
      console.error("Error creating auction lot:", error);
      if (error?.issues) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.issues 
        });
      }
      res.status(500).json({ message: "Failed to create auction lot" });
    }
  });

  // Admin: Update auction lot
  app.put("/api/admin/auction-lots/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = updateAuctionLotSchema.parse(req.body);
      
      // Convert types as needed
      const dataToUpdate: any = { ...validatedData };
      
      if (dataToUpdate.lotNumber !== undefined) {
        dataToUpdate.lotNumber = typeof dataToUpdate.lotNumber === 'string' 
          ? parseInt(dataToUpdate.lotNumber) 
          : dataToUpdate.lotNumber;
      }
      
      if (dataToUpdate.estimatedValueLow !== undefined) {
        dataToUpdate.estimatedValueLow = typeof dataToUpdate.estimatedValueLow === 'number' 
          ? dataToUpdate.estimatedValueLow.toString() 
          : dataToUpdate.estimatedValueLow;
      }
      
      if (dataToUpdate.estimatedValueHigh !== undefined) {
        dataToUpdate.estimatedValueHigh = typeof dataToUpdate.estimatedValueHigh === 'number' 
          ? dataToUpdate.estimatedValueHigh.toString() 
          : dataToUpdate.estimatedValueHigh;
      }
      
      const updatedLot = await db.update(auctionLots)
        .set(dataToUpdate)
        .where(eq(auctionLots.id, id))
        .returning();
      
      if (updatedLot.length === 0) {
        return res.status(404).json({ message: "Lot not found" });
      }
      
      res.json(updatedLot[0]);
    } catch (error: any) {
      console.error("Error updating auction lot:", error);
      if (error?.issues) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.issues 
        });
      }
      res.status(500).json({ message: "Failed to update auction lot" });
    }
  });

  // Admin: Delete auction lot
  app.delete("/api/admin/auction-lots/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await db.delete(auctionLots).where(eq(auctionLots.id, id)).returning();
      
      if (deleted.length === 0) {
        return res.status(404).json({ message: "Lot not found" });
      }
      
      res.json({ success: true, message: "Lot deleted successfully" });
    } catch (error) {
      console.error("Error deleting auction lot:", error);
      res.status(500).json({ message: "Failed to delete auction lot" });
    }
  });

  // ========== AUCTION BID ROUTES ==========

  // Get user's bids
  app.get("/api/auction/my-bids", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const bids = await storage.getUserBids(userId);
      res.json(bids);
    } catch (error) {
      console.error("Error fetching user bids:", error);
      res.status(500).json({ message: "Failed to fetch bids" });
    }
  });

  // Get bids for a specific lot
  app.get("/api/auction/lots/:lotId/bids", async (req: Request, res: Response) => {
    try {
      const { lotId } = req.params;
      const bids = await storage.getBidsByLotId(lotId);
      res.json(bids);
    } catch (error) {
      console.error("Error fetching lot bids:", error);
      res.status(500).json({ message: "Failed to fetch bids" });
    }
  });

  // Place a bid on a lot
  app.post("/api/auction/lots/:lotId/bid", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { lotId } = req.params;
      const { bidAmount, maxBid, bidType } = req.body;

      console.log("📍 Place bid request:", { userId, lotId, bidAmount, maxBid, bidType });

      // Validate bid amount
      if (!bidAmount || bidAmount <= 0) {
        console.log("❌ Invalid bid amount:", bidAmount);
        return res.status(400).json({ message: "Invalid bid amount" });
      }

      // Check if lot exists
      const lot = await db.select().from(auctionLots).where(eq(auctionLots.id, lotId)).limit(1);
      if (!lot || lot.length === 0) {
        console.log("❌ Lot not found:", lotId);
        return res.status(404).json({ message: "Lot not found" });
      }

      console.log("✅ Lot found:", { id: lot[0].id, status: lot[0].status, currentBid: lot[0].currentBid });

      // Check if lot is available for bidding (allow both upcoming and available)
      if (lot[0].status !== 'available' && lot[0].status !== 'upcoming') {
        console.log("❌ Lot not available for bidding. Status:", lot[0].status);
        return res.status(400).json({ message: "This lot is not available for bidding" });
      }

      // Check if bid is higher than current bid
      const currentBid = parseFloat(lot[0].currentBid || "0");
      if (bidAmount <= currentBid) {
        console.log("❌ Bid too low:", { bidAmount, currentBid });
        return res.status(400).json({ 
          message: `Bid must be higher than current bid of £${currentBid}` 
        });
      }

      const newBid = await storage.placeBid({
        userId,
        lotId,
        bidAmount: bidAmount.toString(),
        maxBid: maxBid ? maxBid.toString() : null,
        bidType: bidType || 'standard',
        status: 'active'
      });

      res.json(newBid);
    } catch (error: any) {
      console.error("Error placing bid:", error);
      if (error?.issues) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.issues 
        });
      }
      res.status(500).json({ message: "Failed to place bid" });
    }
  });

  // ========== AUCTION WISHLIST ROUTES ==========

  // Get user's wishlist
  app.get("/api/auction/my-wishlist", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const wishlist = await storage.getUserWishlist(userId);
      res.json(wishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  // Check if lot is in user's wishlist
  app.get("/api/auction/lots/:lotId/is-watching", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { lotId } = req.params;
      const isWatching = await storage.isLotInWishlist(userId, lotId);
      res.json({ isWatching });
    } catch (error) {
      console.error("Error checking wishlist:", error);
      res.status(500).json({ message: "Failed to check wishlist status" });
    }
  });

  // Add lot to wishlist
  app.post("/api/auction/lots/:lotId/watch", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { lotId } = req.params;
      const { notes } = req.body;

      // Check if lot exists
      const lot = await db.select().from(auctionLots).where(eq(auctionLots.id, lotId)).limit(1);
      if (!lot || lot.length === 0) {
        return res.status(404).json({ message: "Lot not found" });
      }

      // Check if already in wishlist
      const alreadyWatching = await storage.isLotInWishlist(userId, lotId);
      if (alreadyWatching) {
        return res.status(400).json({ message: "Already watching this lot" });
      }

      const wishlistItem = await storage.addToAuctionWishlist(userId, lotId, notes);
      res.json(wishlistItem);
    } catch (error: any) {
      console.error("Error adding to wishlist:", error);
      if (error?.issues) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.issues 
        });
      }
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });

  // Remove lot from wishlist
  app.delete("/api/auction/lots/:lotId/watch", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { lotId } = req.params;

      const removed = await storage.removeFromAuctionWishlist(userId, lotId);
      if (!removed) {
        return res.status(404).json({ message: "Lot not found in wishlist" });
      }

      res.json({ success: true, message: "Removed from wishlist" });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });

  // Skip Bag Booking Routes
  // Create a skip bag booking and initiate Stripe payment
  app.post("/api/skip-bags/booking", async (req: Request, res: Response) => {
    try {
      const bookingData = req.body;
      
      // Validate the booking data
      const validatedData = insertSkipBagBookingSchema.parse({
        userId: req.user?.id || null,
        customerName: bookingData.customerName,
        email: bookingData.email,
        phone: bookingData.phone,
        address: bookingData.address,
        postcode: bookingData.postcode,
        wasteType: bookingData.wasteType,
        price: bookingData.price.toString(),
        dropOffDate: new Date(bookingData.dropOffDate),
        dropOffTimeSlot: bookingData.dropOffTimeSlot,
        collectionDate: new Date(bookingData.collectionDate),
        collectionTimeSlot: bookingData.collectionTimeSlot,
        specialInstructions: bookingData.specialInstructions || null,
        paymentStatus: "pending",
        paymentMethod: "stripe",
        bookingStatus: "pending",
      });

      // Create booking record
      const [booking] = await db.insert(skipBagBookings)
        .values(validatedData)
        .returning();

      // Create Stripe payment intent if Stripe is configured
      if (stripe) {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(parseFloat(bookingData.price) * 100), // Convert to cents
          currency: "gbp",
          metadata: {
            bookingId: booking.id.toString(),
            wasteType: booking.wasteType,
            customerName: booking.customerName,
          },
          description: `Skip Bag Collection - ${booking.wasteType}`,
        });

        // Update booking with payment intent ID
        await db.update(skipBagBookings)
          .set({ stripePaymentIntentId: paymentIntent.id })
          .where(eq(skipBagBookings.id, booking.id));

        res.json({
          success: true,
          bookingId: booking.id,
          clientSecret: paymentIntent.client_secret,
        });
      } else {
        // If Stripe is not configured, return booking without payment
        res.json({
          success: true,
          bookingId: booking.id,
          message: "Booking created. Payment will be collected on delivery.",
        });
      }
    } catch (error: any) {
      console.error("Skip bag booking error:", error);
      res.status(400).json({ 
        message: error.message || "Failed to create booking",
        errors: error.issues || []
      });
    }
  });

  // Get all skip bag bookings (admin only)
  app.get("/api/skip-bags/bookings", requireAdmin, async (req: Request, res: Response) => {
    try {
      const bookings = await db.select()
        .from(skipBagBookings)
        .orderBy(desc(skipBagBookings.createdAt));
      
      res.json(bookings);
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Get user's skip bag bookings
  app.get("/api/skip-bags/my-bookings", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const bookings = await db.select()
        .from(skipBagBookings)
        .where(eq(skipBagBookings.userId, userId))
        .orderBy(desc(skipBagBookings.createdAt));
      
      res.json(bookings);
    } catch (error: any) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Update booking status (admin only)
  app.patch("/api/skip-bags/bookings/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { bookingStatus, paymentStatus } = req.body;

      const [updated] = await db.update(skipBagBookings)
        .set({
          bookingStatus,
          paymentStatus,
          updatedAt: new Date(),
        })
        .where(eq(skipBagBookings.id, parseInt(id)))
        .returning();

      if (!updated) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json(updated);
    } catch (error: any) {
      console.error("Error updating booking:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // ============================================
  // Marketing Email Templates CRUD
  // ============================================
  
  // Get all marketing templates
  app.get("/api/admin/marketing-templates", requireAdmin, async (req: Request, res: Response) => {
    try {
      const templates = await pool.query(`
        SELECT 
          id,
          name,
          subject,
          preheader,
          hero_image_url as "heroImageUrl",
          content_html as "contentHtml",
          status,
          created_by as "createdBy",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM marketing_email_templates
        ORDER BY created_at DESC
      `);
      res.json(templates.rows);
    } catch (error: any) {
      console.error("Error fetching marketing templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  // Get single marketing template
  app.get("/api/admin/marketing-templates/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        SELECT 
          id,
          name,
          subject,
          preheader,
          hero_image_url as "heroImageUrl",
          content_html as "contentHtml",
          status,
          created_by as "createdBy",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM marketing_email_templates
        WHERE id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(result.rows[0]);
    } catch (error: any) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  // Create marketing template
  app.post("/api/admin/marketing-templates", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { name, subject, preheader, heroImageUrl, contentHtml, status } = req.body;
      const userId = req.user?.id || req.session?.user?.id;
      
      if (!name || !subject || !contentHtml) {
        return res.status(400).json({ message: "Name, subject, and content are required" });
      }

      const result = await pool.query(`
        INSERT INTO marketing_email_templates (name, subject, preheader, hero_image_url, content_html, status, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING 
          id,
          name,
          subject,
          preheader,
          hero_image_url as "heroImageUrl",
          content_html as "contentHtml",
          status,
          created_by as "createdBy",
          created_at as "createdAt"
      `, [name, subject, preheader || null, heroImageUrl || null, contentHtml, status || 'draft', userId]);

      res.json(result.rows[0]);
    } catch (error: any) {
      console.error("Error creating template:", error);
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  // Update marketing template
  app.patch("/api/admin/marketing-templates/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, subject, preheader, heroImageUrl, contentHtml, status } = req.body;

      const result = await pool.query(`
        UPDATE marketing_email_templates
        SET 
          name = COALESCE($1, name),
          subject = COALESCE($2, subject),
          preheader = COALESCE($3, preheader),
          hero_image_url = COALESCE($4, hero_image_url),
          content_html = COALESCE($5, content_html),
          status = COALESCE($6, status),
          updated_at = NOW()
        WHERE id = $7
        RETURNING 
          id,
          name,
          subject,
          preheader,
          hero_image_url as "heroImageUrl",
          content_html as "contentHtml",
          status,
          created_by as "createdBy",
          created_at as "createdAt",
          updated_at as "updatedAt"
      `, [name, subject, preheader, heroImageUrl, contentHtml, status, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Template not found" });
      }

      res.json(result.rows[0]);
    } catch (error: any) {
      console.error("Error updating template:", error);
      res.status(500).json({ message: "Failed to update template" });
    }
  });

  // Delete marketing template
  app.delete("/api/admin/marketing-templates/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const result = await pool.query(`
        DELETE FROM marketing_email_templates WHERE id = $1 RETURNING id
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Template not found" });
      }

      res.json({ message: "Template deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // Auto-generate marketing email from products
  app.post("/api/admin/marketing-templates/auto-generate", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { theme, productCount = 4, autoSave = true } = req.body;
      const userId = req.user?.id || req.session?.user?.id;
      
      // Helper function for safe text truncation
      const safeTruncate = (text: string | undefined | null, maxLength: number): string => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        // Find a good break point (space, comma, period)
        let truncated = text.substring(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');
        if (lastSpace > maxLength * 0.7) {
          truncated = truncated.substring(0, lastSpace);
        }
        return truncated.trim() + '...';
      };
      
      // Fetch featured/recent products with images
      const productsResult = await pool.query(`
        SELECT 
          id, name, description, price, image_url as "imageUrl", 
          is_featured as "isFeatured", era, condition
        FROM products 
        WHERE image_url IS NOT NULL AND image_url != ''
        ORDER BY is_featured DESC, id DESC
        LIMIT $1
      `, [productCount]);
      
      const products = productsResult.rows;
      
      // Check if we have enough content
      if (products.length === 0) {
        return res.status(400).json({ 
          message: "No products available to generate an email. Please add some items first." 
        });
      }
      
      // Generate marketing email content
      const themeName = theme || "New Arrivals & Treasures";
      const subjectLine = `${themeName} at Lanora House`;
      const preheader = `Discover ${products[0].name} and more unique finds`;
      
      // Build product cards HTML
      let productsHtml = '';
      if (products.length > 0) {
        productsHtml = `
          <h2 style="color: #2D317C; font-size: 24px; margin: 30px 0 20px; text-align: center; font-family: 'Georgia', serif;">Featured Items</h2>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
        `;
        
        products.forEach((product: any, index: number) => {
          const price = parseFloat(product.price).toFixed(2);
          const description = safeTruncate(product.description, 80);
          
          productsHtml += `
            <td width="50%" style="padding: 10px; vertical-align: top;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f8f9fa; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td>
                    <img src="${product.imageUrl}" alt="${product.name}" style="width: 100%; height: 180px; object-fit: cover; display: block;">
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px;">
                    <h3 style="color: #333; font-size: 16px; margin: 0 0 8px; font-family: 'Georgia', serif;">${product.name}</h3>
                    <p style="color: #666; font-size: 13px; margin: 0 0 10px; line-height: 1.4;">${description}</p>
                    <p style="color: #2D317C; font-size: 18px; font-weight: bold; margin: 0;">£${price}</p>
                  </td>
                </tr>
              </table>
            </td>
          `;
          
          // Start new row after every 2 products
          if ((index + 1) % 2 === 0 && index < products.length - 1) {
            productsHtml += '</tr><tr>';
          }
        });
        
        productsHtml += '</tr></table>';
      }
      
      // Lanora House logo
      const logoUrl = 'https://lh3.googleusercontent.com/p/AF1QipN_qAALtG1OplNEK38IqArpEgKjYy8__OZtz_Np=s1360-w1360-h1020-rw';
      
      // Combine into full content with logo header
      const contentHtml = `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
          <tr>
            <td align="center">
              <a href="https://lanorahouse.com">
                <img src="${logoUrl}" alt="Lanora House" style="max-width: 200px; height: auto; display: block;">
              </a>
            </td>
          </tr>
        </table>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6; text-align: center; margin: 0 0 30px;">
          Hello,<br><br>
          We've curated some exceptional pieces just for you. Take a look at our latest arrivals!
        </p>
        
        ${productsHtml}
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 40px 0;">
          <tr>
            <td align="center">
              <a href="https://lanorahouse.com/shop" style="display: inline-block; background-color: #2D317C; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Browse All Treasures</a>
            </td>
          </tr>
        </table>
      `;
      
      // Select hero image from first product
      const heroImageUrl = products[0]?.imageUrl || '';
      
      // Auto-save the template as a draft if requested
      let savedTemplate = null;
      if (autoSave) {
        const saveResult = await pool.query(`
          INSERT INTO marketing_email_templates (name, subject, preheader, hero_image_url, content_html, status, created_by)
          VALUES ($1, $2, $3, $4, $5, 'draft', $6)
          RETURNING 
            id,
            name,
            subject,
            preheader,
            hero_image_url as "heroImageUrl",
            content_html as "contentHtml",
            status,
            created_at as "createdAt"
        `, [themeName, subjectLine, preheader, heroImageUrl, contentHtml, userId]);
        savedTemplate = saveResult.rows[0];
      }
      
      res.json({
        name: themeName,
        subject: subjectLine,
        preheader,
        heroImageUrl,
        contentHtml,
        productsUsed: products.map((p: any) => ({ id: p.id, name: p.name })),
        savedTemplate,
        message: savedTemplate ? "Template generated and saved as draft" : "Template generated (not saved)"
      });
      
    } catch (error: any) {
      console.error("Error auto-generating template:", error);
      res.status(500).json({ message: "Failed to auto-generate template" });
    }
  });

  // Generate auction email template
  app.post("/api/admin/marketing-templates/auction-template", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { 
        auctionTitle,
        bannerImageUrl,
        auctionDate,
        auctionTime,
        ctaText = "View Full Catalogue",
        ctaHref = "https://lanorahouse.com/auctions",
        viewingDates,
        lots,
        autoSave = true
      } = req.body;
      const userId = req.user?.id || req.session?.user?.id;
      
      // Validate required fields
      if (!auctionTitle) {
        return res.status(400).json({ message: "Auction title is required" });
      }
      
      // Lanora House logo
      const logoUrl = 'https://lh3.googleusercontent.com/p/AF1QipN_qAALtG1OplNEK38IqArpEgKjYy8__OZtz_Np=s1360-w1360-h1020-rw';
      
      // Format auction date
      const formattedDate = auctionDate ? new Date(auctionDate).toLocaleDateString('en-GB', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }) : 'Date TBC';
      
      // Build viewing times HTML
      let viewingHtml = '';
      if (viewingDates && viewingDates.length > 0) {
        viewingHtml = `
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <tr>
              <td>
                <h3 style="color: #2D317C; font-size: 18px; margin: 0 0 15px; font-family: 'Georgia', serif;">Viewing Days</h3>
                ${viewingDates.map((v: any) => `
                  <p style="color: #333; font-size: 14px; margin: 0 0 8px;">
                    <strong>${v.date ? new Date(v.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : 'TBC'}</strong>: ${v.times || 'Times TBC'}
                  </p>
                `).join('')}
              </td>
            </tr>
          </table>
        `;
      }
      
      // Build lots HTML (6 items in 2x3 grid)
      let lotsHtml = '';
      if (lots && lots.length > 0) {
        lotsHtml = `
          <h2 style="color: #2D317C; font-size: 24px; margin: 30px 0 20px; text-align: center; font-family: 'Georgia', serif;">Featured Lots</h2>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        `;
        
        lots.forEach((lot: any, index: number) => {
          if (index % 2 === 0) {
            lotsHtml += '<tr>';
          }
          
          lotsHtml += `
            <td width="50%" style="padding: 10px; vertical-align: top;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td>
                    <img src="${lot.imageUrl || 'https://via.placeholder.com/300x200?text=Lot+Image'}" alt="${lot.description || 'Auction Lot'}" style="width: 100%; height: 160px; object-fit: cover; display: block;">
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px;">
                    <p style="color: #333; font-size: 14px; margin: 0 0 8px; line-height: 1.4;">${lot.description || 'Description TBC'}</p>
                    <p style="color: #2D317C; font-size: 16px; font-weight: bold; margin: 0;">
                      Estimate: ${lot.estimateLow && lot.estimateHigh ? `£${lot.estimateLow} - £${lot.estimateHigh}` : 'TBC'}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          `;
          
          if (index % 2 === 1 || index === lots.length - 1) {
            if (index % 2 === 0) {
              lotsHtml += '<td width="50%"></td>';
            }
            lotsHtml += '</tr>';
          }
        });
        
        lotsHtml += '</table>';
      }
      
      // Build full content - Layout order: Logo → Lanora House text → Sale day/time → Hero image → Content
      const contentHtml = `
        <!-- Logo -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 15px;">
          <tr>
            <td align="center">
              <a href="https://lanorahouse.com">
                <img src="${logoUrl}" alt="Lanora House" style="max-width: 180px; height: auto; display: block;">
              </a>
            </td>
          </tr>
        </table>
        
        <!-- Lanora House Brand Name -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 15px;">
          <tr>
            <td align="center">
              <h1 style="color: #2D317C; font-size: 32px; margin: 0; font-family: 'Georgia', serif; letter-spacing: 1px;">LANORA HOUSE</h1>
            </td>
          </tr>
        </table>
        
        <!-- Sale Day and Time -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #2D317C; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
          <tr>
            <td align="center">
              <h2 style="color: #fff; font-size: 24px; margin: 0 0 10px; font-family: 'Georgia', serif;">${auctionTitle}</h2>
              <p style="color: #A6C1E4; font-size: 18px; margin: 0 0 5px;">
                <strong>${formattedDate}</strong>
              </p>
              ${auctionTime ? `<p style="color: #fff; font-size: 16px; margin: 0;">Starting at ${auctionTime}</p>` : ''}
            </td>
          </tr>
        </table>
        
        <!-- Hero Banner Image -->
        ${bannerImageUrl ? `
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 25px;">
            <tr>
              <td>
                <img src="${bannerImageUrl}" alt="${auctionTitle}" style="width: 100%; height: auto; display: block; border-radius: 8px;">
              </td>
            </tr>
          </table>
        ` : ''}
        
        ${viewingHtml}
        
        ${lotsHtml}
        
        <!-- Customizable CTA Button -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 40px 0;">
          <tr>
            <td align="center">
              <a href="${ctaHref}" style="display: inline-block; background-color: #2D317C; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">${ctaText}</a>
            </td>
          </tr>
        </table>
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 20px;">
          <tr>
            <td align="center">
              <p style="color: #666; font-size: 14px; margin: 0 0 5px;">First Floor (rear of building), The Old Foundry Chapel</p>
              <p style="color: #666; font-size: 14px; margin: 0;">11–13 Chapel Terrace, Hayle TR27 4AB</p>
            </td>
          </tr>
        </table>
      `;
      
      const subjectLine = `${auctionTitle} - ${formattedDate}`;
      const preheader = `Join us for ${auctionTitle}. Viewing available - see featured lots inside.`;
      
      // Auto-save the template as a draft
      let savedTemplate = null;
      if (autoSave) {
        const saveResult = await pool.query(`
          INSERT INTO marketing_email_templates (name, subject, preheader, hero_image_url, content_html, status, created_by)
          VALUES ($1, $2, $3, $4, $5, 'draft', $6)
          RETURNING 
            id,
            name,
            subject,
            preheader,
            hero_image_url as "heroImageUrl",
            content_html as "contentHtml",
            status,
            created_at as "createdAt"
        `, [auctionTitle, subjectLine, preheader, bannerImageUrl || logoUrl, contentHtml, userId]);
        savedTemplate = saveResult.rows[0];
      }
      
      res.json({
        name: auctionTitle,
        subject: subjectLine,
        preheader,
        heroImageUrl: bannerImageUrl || logoUrl,
        contentHtml,
        savedTemplate,
        message: savedTemplate ? "Auction template generated and saved as draft" : "Auction template generated"
      });
      
    } catch (error: any) {
      console.error("Error generating auction template:", error);
      res.status(500).json({ message: "Failed to generate auction template" });
    }
  });

  // Get count of subscribed users for preview
  app.get("/api/admin/marketing-templates/subscribers/count", requireAdmin, async (req: Request, res: Response) => {
    try {
      const result = await pool.query(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE email_marketing_consent = true
      `);
      res.json({ count: parseInt(result.rows[0].count) });
    } catch (error: any) {
      console.error("Error counting subscribers:", error);
      res.status(500).json({ message: "Failed to count subscribers" });
    }
  });

  // Get all marketing subscribers (business and customer lists)
  app.get("/api/admin/marketing-subscribers", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { type } = req.query;
      let query = `
        SELECT id, email, name, company_name as "companyName", subscriber_type as "subscriberType",
               source, consent_date as "consentDate", is_active as "isActive", notes, created_at as "createdAt"
        FROM marketing_subscribers
      `;
      const params: any[] = [];
      
      if (type && (type === 'business' || type === 'customer')) {
        query += ` WHERE subscriber_type = $1`;
        params.push(type);
      }
      
      query += ` ORDER BY created_at DESC`;
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error: any) {
      console.error("Error fetching marketing subscribers:", error);
      res.status(500).json({ message: "Failed to fetch subscribers" });
    }
  });

  // Get subscriber counts by type
  app.get("/api/admin/marketing-subscribers/counts", requireAdmin, async (req: Request, res: Response) => {
    try {
      const result = await pool.query(`
        SELECT 
          subscriber_type,
          COUNT(*) as count
        FROM marketing_subscribers
        WHERE is_active = true
        GROUP BY subscriber_type
      `);
      
      const counts = { business: 0, customer: 0 };
      result.rows.forEach((row: any) => {
        counts[row.subscriber_type as keyof typeof counts] = parseInt(row.count);
      });
      
      res.json(counts);
    } catch (error: any) {
      console.error("Error counting subscribers:", error);
      res.status(500).json({ message: "Failed to count subscribers" });
    }
  });

  // Add a new marketing subscriber
  app.post("/api/admin/marketing-subscribers", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { email, name, companyName, subscriberType, source, notes } = req.body;
      
      if (!email || !subscriberType) {
        return res.status(400).json({ message: "Email and subscriber type are required" });
      }
      
      if (subscriberType !== 'business' && subscriberType !== 'customer') {
        return res.status(400).json({ message: "Subscriber type must be 'business' or 'customer'" });
      }
      
      // Check for duplicate
      const existing = await pool.query(
        `SELECT id FROM marketing_subscribers WHERE email = $1 AND subscriber_type = $2`,
        [email.toLowerCase(), subscriberType]
      );
      
      if (existing.rows.length > 0) {
        return res.status(400).json({ message: "This email is already subscribed to this list" });
      }
      
      const result = await pool.query(`
        INSERT INTO marketing_subscribers (email, name, company_name, subscriber_type, source, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, name, company_name as "companyName", subscriber_type as "subscriberType",
                  source, consent_date as "consentDate", is_active as "isActive", notes, created_at as "createdAt"
      `, [email.toLowerCase(), name, companyName, subscriberType, source || 'manual', notes]);
      
      res.json(result.rows[0]);
    } catch (error: any) {
      console.error("Error adding subscriber:", error);
      res.status(500).json({ message: "Failed to add subscriber" });
    }
  });

  // Delete a marketing subscriber
  app.delete("/api/admin/marketing-subscribers/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await pool.query(`DELETE FROM marketing_subscribers WHERE id = $1`, [id]);
      res.json({ message: "Subscriber removed" });
    } catch (error: any) {
      console.error("Error deleting subscriber:", error);
      res.status(500).json({ message: "Failed to delete subscriber" });
    }
  });

  // Generate business marketing email template
  app.post("/api/admin/marketing-templates/business-template", requireAdmin, async (req: Request, res: Response) => {
    try {
      const {
        templateTitle,
        beforeAfterPhotos,
        soldProducts,
        storeHighlights,
        testimonials,
        ctaText = "Contact Us",
        ctaHref = "https://lanorahouse.com/contact",
        autoSave = true
      } = req.body;
      
      const userId = req.user?.id || req.session?.user?.id;
      
      if (!templateTitle) {
        return res.status(400).json({ message: "Template title is required" });
      }
      
      const logoUrl = 'https://lh3.googleusercontent.com/p/AF1QipN_qAALtG1OplNEK38IqArpEgKjYy8__OZtz_Np=s1360-w1360-h1020-rw';
      
      // Build before/after section
      let beforeAfterHtml = '';
      if (beforeAfterPhotos && beforeAfterPhotos.length > 0) {
        beforeAfterHtml = `
          <h2 style="color: #2D317C; font-size: 24px; margin: 30px 0 20px; text-align: center; font-family: 'Georgia', serif;">Before & After Transformations</h2>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        `;
        beforeAfterPhotos.forEach((item: any) => {
          if (item.beforeUrl || item.afterUrl) {
            beforeAfterHtml += `
              <tr>
                <td style="padding: 10px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td width="48%" style="vertical-align: top;">
                        <p style="color: #666; font-size: 12px; margin: 0 0 5px; text-transform: uppercase;">Before</p>
                        <img src="${item.beforeUrl || 'https://via.placeholder.com/300x200?text=Before'}" alt="Before" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
                      </td>
                      <td width="4%"></td>
                      <td width="48%" style="vertical-align: top;">
                        <p style="color: #666; font-size: 12px; margin: 0 0 5px; text-transform: uppercase;">After</p>
                        <img src="${item.afterUrl || 'https://via.placeholder.com/300x200?text=After'}" alt="After" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
                      </td>
                    </tr>
                    ${item.caption ? `<tr><td colspan="3" style="padding-top: 10px;"><p style="color: #333; font-size: 14px; text-align: center; margin: 0;">${item.caption}</p></td></tr>` : ''}
                  </table>
                </td>
              </tr>
            `;
          }
        });
        beforeAfterHtml += '</table>';
      }
      
      // Build sold products section
      let soldProductsHtml = '';
      if (soldProducts && soldProducts.length > 0) {
        soldProductsHtml = `
          <h2 style="color: #2D317C; font-size: 24px; margin: 30px 0 20px; text-align: center; font-family: 'Georgia', serif;">Recently Sold Items</h2>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        `;
        soldProducts.forEach((item: any, index: number) => {
          if (index % 3 === 0) soldProductsHtml += '<tr>';
          soldProductsHtml += `
            <td width="33%" style="padding: 10px; vertical-align: top;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td>
                    <img src="${item.imageUrl || 'https://via.placeholder.com/200x150?text=Sold'}" alt="${item.name || 'Sold Item'}" style="width: 100%; height: 120px; object-fit: cover;">
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px;">
                    <p style="color: #333; font-size: 13px; margin: 0 0 5px; font-weight: bold;">${item.name || 'Item'}</p>
                    ${item.soldPrice ? `<p style="color: #2D317C; font-size: 14px; margin: 0;"><strong>Sold: £${item.soldPrice}</strong></p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          `;
          if (index % 3 === 2 || index === soldProducts.length - 1) {
            const remaining = 3 - ((index % 3) + 1);
            for (let i = 0; i < remaining; i++) soldProductsHtml += '<td width="33%"></td>';
            soldProductsHtml += '</tr>';
          }
        });
        soldProductsHtml += '</table>';
      }
      
      // Build store highlights section
      let storeHtml = '';
      if (storeHighlights) {
        storeHtml = `
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f8f9fa; border-radius: 8px; padding: 25px; margin: 25px 0;">
            <tr>
              <td>
                <h2 style="color: #2D317C; font-size: 22px; margin: 0 0 15px; font-family: 'Georgia', serif;">${storeHighlights.title || 'Our Services'}</h2>
                <p style="color: #333; font-size: 15px; line-height: 1.6; margin: 0;">${storeHighlights.description || ''}</p>
                ${storeHighlights.bulletPoints && storeHighlights.bulletPoints.length > 0 ? `
                  <ul style="color: #333; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 15px 0 0;">
                    ${storeHighlights.bulletPoints.map((point: string) => `<li>${point}</li>`).join('')}
                  </ul>
                ` : ''}
              </td>
            </tr>
          </table>
        `;
      }
      
      // Build testimonials section
      let testimonialsHtml = '';
      if (testimonials && testimonials.length > 0) {
        testimonialsHtml = `
          <h2 style="color: #2D317C; font-size: 24px; margin: 30px 0 20px; text-align: center; font-family: 'Georgia', serif;">What Our Clients Say</h2>
        `;
        testimonials.forEach((testimonial: any) => {
          if (testimonial.quote) {
            testimonialsHtml += `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #fff; border-left: 4px solid #2D317C; padding: 20px; margin: 15px 0;">
                <tr>
                  <td>
                    <p style="color: #333; font-size: 15px; font-style: italic; line-height: 1.6; margin: 0 0 10px;">"${testimonial.quote}"</p>
                    <p style="color: #2D317C; font-size: 14px; font-weight: bold; margin: 0;">— ${testimonial.author || 'Happy Customer'}${testimonial.company ? `, ${testimonial.company}` : ''}</p>
                  </td>
                </tr>
              </table>
            `;
          }
        });
      }
      
      // Build full content
      const contentHtml = `
        <!-- Logo -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 15px;">
          <tr>
            <td align="center">
              <a href="https://lanorahouse.com">
                <img src="${logoUrl}" alt="Lanora House" style="max-width: 180px; height: auto; display: block;">
              </a>
            </td>
          </tr>
        </table>
        
        <!-- Brand Name -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
          <tr>
            <td align="center">
              <h1 style="color: #2D317C; font-size: 32px; margin: 0; font-family: 'Georgia', serif; letter-spacing: 1px;">LANORA HOUSE</h1>
              <p style="color: #666; font-size: 14px; margin: 10px 0 0;">Professional House Clearance & Antiques</p>
            </td>
          </tr>
        </table>
        
        ${beforeAfterHtml}
        
        ${soldProductsHtml}
        
        ${storeHtml}
        
        ${testimonialsHtml}
        
        <!-- CTA Button -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 40px 0;">
          <tr>
            <td align="center">
              <a href="${ctaHref}" style="display: inline-block; background-color: #2D317C; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">${ctaText}</a>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 20px;">
          <tr>
            <td align="center">
              <p style="color: #666; font-size: 14px; margin: 0 0 5px;">First Floor (rear of building), The Old Foundry Chapel</p>
              <p style="color: #666; font-size: 14px; margin: 0;">11–13 Chapel Terrace, Hayle TR27 4AB</p>
            </td>
          </tr>
        </table>
      `;
      
      const subjectLine = templateTitle;
      const preheader = "Discover our professional services and recent success stories.";
      
      let savedTemplate = null;
      if (autoSave) {
        const saveResult = await pool.query(`
          INSERT INTO marketing_email_templates (name, subject, preheader, hero_image_url, content_html, status, created_by)
          VALUES ($1, $2, $3, $4, $5, 'draft', $6)
          RETURNING 
            id,
            name,
            subject,
            preheader,
            hero_image_url as "heroImageUrl",
            content_html as "contentHtml",
            status,
            created_at as "createdAt"
        `, [templateTitle, subjectLine, preheader, logoUrl, contentHtml, userId]);
        savedTemplate = saveResult.rows[0];
      }
      
      res.json({
        name: templateTitle,
        subject: subjectLine,
        preheader,
        heroImageUrl: logoUrl,
        contentHtml,
        savedTemplate,
        message: savedTemplate ? "Business template generated and saved as draft" : "Business template generated"
      });
      
    } catch (error: any) {
      console.error("Error generating business template:", error);
      res.status(500).json({ message: "Failed to generate business template" });
    }
  });

  // Send marketing email to all subscribed users
  app.post("/api/admin/marketing-templates/:id/send", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.session?.user?.id;
      
      // Get the template
      const templateResult = await pool.query(`
        SELECT * FROM marketing_email_templates WHERE id = $1
      `, [id]);

      if (templateResult.rows.length === 0) {
        return res.status(404).json({ message: "Template not found" });
      }

      const template = templateResult.rows[0];

      // Get all subscribed users
      const subscribersResult = await pool.query(`
        SELECT id, email, first_name as "firstName", last_name as "lastName"
        FROM users 
        WHERE email_marketing_consent = true
      `);

      const subscribers = subscribersResult.rows;
      
      if (subscribers.length === 0) {
        return res.status(400).json({ message: "No subscribed users found" });
      }

      // Create dispatch record
      const dispatchResult = await pool.query(`
        INSERT INTO marketing_email_dispatches (template_id, initiated_by_user_id, recipient_count, status)
        VALUES ($1, $2, $3, 'sending')
        RETURNING id
      `, [id, userId, subscribers.length]);

      const dispatchId = dispatchResult.rows[0].id;

      // Import SendGrid helper and branded template
      const { getUncachableSendGridClient } = await import('./sendgrid-client');
      const { getMarketingEmailHtml } = await import('./email-templates');
      const { client: sgMail, fromEmail } = await getUncachableSendGridClient();

      let successCount = 0;
      let failedCount = 0;
      const errors: any[] = [];

      // Send emails (batched to respect SendGrid limits)
      for (const subscriber of subscribers) {
        try {
          // Use the branded marketing email template
          const fullHtml = getMarketingEmailHtml({
            contentHtml: template.content_html,
            heroImageUrl: template.hero_image_url,
            customerEmail: subscriber.email
          });

          await sgMail.send({
            to: subscriber.email,
            from: fromEmail,
            subject: template.subject,
            html: fullHtml,
          });

          successCount++;
        } catch (emailError: any) {
          failedCount++;
          errors.push({
            email: subscriber.email,
            error: emailError.message || 'Unknown error'
          });
          console.error(`Failed to send to ${subscriber.email}:`, emailError.message);
        }
      }

      // Update dispatch record with results
      await pool.query(`
        UPDATE marketing_email_dispatches
        SET 
          successful_count = $1,
          failed_count = $2,
          status = $3,
          error_log = $4,
          sent_at = NOW()
        WHERE id = $5
      `, [successCount, failedCount, failedCount === 0 ? 'completed' : 'partial', JSON.stringify(errors), dispatchId]);

      // Update template status to sent
      await pool.query(`
        UPDATE marketing_email_templates SET status = 'sent', updated_at = NOW() WHERE id = $1
      `, [id]);

      res.json({
        success: true,
        message: `Email sent to ${successCount} subscribers`,
        recipientCount: subscribers.length,
        successfulCount: successCount,
        failedCount: failedCount,
        dispatchId
      });
    } catch (error: any) {
      console.error("Error sending marketing email:", error);
      res.status(500).json({ message: "Failed to send marketing email" });
    }
  });

  // Get dispatch history for a template
  app.get("/api/admin/marketing-templates/:id/dispatches", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        SELECT 
          d.id,
          d.template_id as "templateId",
          d.initiated_by_user_id as "initiatedByUserId",
          d.sent_at as "sentAt",
          d.recipient_count as "recipientCount",
          d.successful_count as "successfulCount",
          d.failed_count as "failedCount",
          d.status,
          d.error_log as "errorLog",
          u.email as "initiatedByEmail",
          u.first_name as "initiatedByFirstName"
        FROM marketing_email_dispatches d
        LEFT JOIN users u ON d.initiated_by_user_id = u.id
        WHERE d.template_id = $1
        ORDER BY d.sent_at DESC
      `, [id]);
      
      res.json(result.rows);
    } catch (error: any) {
      console.error("Error fetching dispatches:", error);
      res.status(500).json({ message: "Failed to fetch dispatch history" });
    }
  });

  // Environmental Impact Routes
  app.use("/api/environmental-impact", environmentalImpactRoutes);

  // Auction Homepage Settings - public endpoint
  app.get("/api/auction-homepage-settings", async (req: Request, res: Response) => {
    try {
      const result = await pool.query(`SELECT * FROM auction_homepage_settings ORDER BY id LIMIT 1`);
      if (result.rows.length === 0) {
        return res.json({
          nextAuctionDate: "Saturday 21st January",
          catalogueImageUrl: null,
          catalogueLink: "/auctions",
          auctionScheduleText: "Auctions Held Fortnightly On A Saturday at 10AM",
          locationText: "The Old Foundry Chapel, Hayle, Cornwall",
        });
      }
      const row = result.rows[0];
      res.json({
        id: row.id,
        nextAuctionDate: row.next_auction_date,
        catalogueImageUrl: row.catalogue_image_url,
        catalogueLink: row.catalogue_link,
        auctionScheduleText: row.auction_schedule_text,
        locationText: row.location_text,
      });
    } catch (error: any) {
      console.error("Error fetching auction settings:", error);
      res.status(500).json({ message: "Failed to fetch auction settings" });
    }
  });

  // Admin: Update auction homepage settings
  app.put("/api/admin/auction-homepage-settings", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { nextAuctionDate, catalogueImageUrl, catalogueLink, auctionScheduleText, locationText } = req.body;

      if (!nextAuctionDate) {
        return res.status(400).json({ message: "Next auction date is required" });
      }

      const existing = await pool.query(`SELECT id FROM auction_homepage_settings LIMIT 1`);

      if (existing.rows.length === 0) {
        const result = await pool.query(`
          INSERT INTO auction_homepage_settings (next_auction_date, catalogue_image_url, catalogue_link, auction_schedule_text, location_text, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
          RETURNING *
        `, [nextAuctionDate, catalogueImageUrl || null, catalogueLink || '/auctions', auctionScheduleText || 'Auctions Held Fortnightly On A Saturday at 10AM', locationText || 'The Old Foundry Chapel, Hayle, Cornwall']);
        const row = result.rows[0];
        return res.json({
          id: row.id,
          nextAuctionDate: row.next_auction_date,
          catalogueImageUrl: row.catalogue_image_url,
          catalogueLink: row.catalogue_link,
          auctionScheduleText: row.auction_schedule_text,
          locationText: row.location_text,
        });
      }

      const result = await pool.query(`
        UPDATE auction_homepage_settings
        SET next_auction_date = $1, catalogue_image_url = $2, catalogue_link = $3, auction_schedule_text = $4, location_text = $5, updated_at = NOW()
        WHERE id = $6
        RETURNING *
      `, [nextAuctionDate, catalogueImageUrl || null, catalogueLink || '/auctions', auctionScheduleText || 'Auctions Held Fortnightly On A Saturday at 10AM', locationText || 'The Old Foundry Chapel, Hayle, Cornwall', existing.rows[0].id]);
      const row = result.rows[0];
      res.json({
        id: row.id,
        nextAuctionDate: row.next_auction_date,
        catalogueImageUrl: row.catalogue_image_url,
        catalogueLink: row.catalogue_link,
        auctionScheduleText: row.auction_schedule_text,
        locationText: row.location_text,
      });
    } catch (error: any) {
      console.error("Error updating auction settings:", error);
      res.status(500).json({ message: "Failed to update auction settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
