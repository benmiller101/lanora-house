import sharp from "sharp";
import { pool, db } from "./db";
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
import { sendOrderConfirmationEmail } from "./email-service";
import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import { storage } from "./storage-db";
import { isAdminUser, ADMIN_EMAIL } from "./adminAuth";
import environmentalImpactRoutes from "./environmental-impact-routes";
import { eq, and, desc, count, inArray, sql, gte } from "drizzle-orm";
import { scrapeEasyLiveCatalogues, needsSync, getLastSyncAt } from "./easylive-scraper";
import {
  beforeAfterPosts,
  teamMembers,
  insertTeamMemberSchema,
  insertCustomerReviewSchema,
  auctionCatalogues,
  insertAuctionCatalogueSchema,
  updateAuctionCatalogueSchema,
  auctionLots,
  insertAuctionLotSchema,
  updateAuctionLotSchema,
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
  requireAdmin,
  csrfProtection,
} from "./middleware/security";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadFile } from "./lib/r2";
import "express-session";

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

function uniqueKey(folder: string, prefix: string, ext: string): string {
  return `${folder}/${prefix}-${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
}

const teamMemberImageUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG and WebP images are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const auctionCatalogImageUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG and WebP images are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

const auctionLotImageUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG and WebP images are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
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
      `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin-login\n\nSitemap: https://www.lanorahouse.com/sitemap.xml`
    );
  });

  app.get("/sitemap.xml", async (_req: Request, res: Response) => {
    const BASE = "https://www.lanorahouse.com";
    const staticPages = [
      { path: "/", priority: "1.0", changefreq: "weekly" },
      { path: "/auctions", priority: "0.9", changefreq: "weekly" },
      { path: "/clearance", priority: "0.8", changefreq: "monthly" },
      { path: "/about", priority: "0.7", changefreq: "monthly" },
      { path: "/contact", priority: "0.7", changefreq: "monthly" },
      { path: "/blog", priority: "0.8", changefreq: "weekly" },
      { path: "/sell-goods", priority: "0.7", changefreq: "monthly" },
      { path: "/meet-the-team", priority: "0.5", changefreq: "monthly" },
      { path: "/pricing", priority: "0.6", changefreq: "monthly" },
      { path: "/environmental-impact", priority: "0.5", changefreq: "monthly" },
      { path: "/success-stories", priority: "0.6", changefreq: "monthly" },
      { path: "/before-after", priority: "0.6", changefreq: "monthly" },
      { path: "/clearance-faq", priority: "0.5", changefreq: "monthly" },
      { path: "/auction-locations", priority: "0.7", changefreq: "monthly" },
      { path: "/shipping", priority: "0.4", changefreq: "yearly" },
      { path: "/returns", priority: "0.4", changefreq: "yearly" },
      { path: "/terms-of-service", priority: "0.3", changefreq: "yearly" },
      { path: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
      { path: "/cookie-policy", priority: "0.3", changefreq: "yearly" },
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
      const blogRows = await pool.query(`SELECT slug FROM blog_posts WHERE published = true ORDER BY created_at DESC`);
      const catalogRows = await pool.query(`SELECT id FROM auction_catalogs WHERE status = 'active' OR status = 'upcoming' ORDER BY id`);

      let urls = staticPages.map(p =>
        `  <url>\n    <loc>${BASE}${p.path}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
      );

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

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'));
      }
    },
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

  app.post("/api/admin/login", loginRateLimit, async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      if (isAdminUser(email, password)) {
        const adminUser = {
          id: "admin",
          email: ADMIN_EMAIL,
          firstName: "Admin",
          lastName: "User",
          role: "admin"
        };

        if (req.session) {
          req.session.user = adminUser;
        }

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
      if (req.session) {
        req.session.destroy(() => {});
      }
      res.json({ success: true, message: "Admin logout successful" });
    } catch (error) {
      console.error('Admin logout error:', error);
      res.json({ success: true, message: "Admin logout successful" });
    }
  });

  // Blog image upload endpoint (admin only)
  app.post("/api/admin/upload/blog-image", uploadRateLimit, validateFileUpload, requireAdmin, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No image file provided" });
      const key = uniqueKey("blog", "blog", path.extname(req.file.originalname) || ".jpg");
      const imageUrl = await uploadFile(req.file.buffer, key, req.file.mimetype);
      res.json({ imageUrl });
    } catch (error) {
      console.error("POST /api/admin/upload/blog-image error:", error);
      res.status(500).json({ message: "Failed to upload blog image" });
    }
  });

  // Auction catalog image upload
  app.post("/api/admin/upload/catalog-image", requireAdmin, uploadRateLimit, auctionCatalogImageUpload.single('image'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No image file provided" });
      const key = uniqueKey("auction-catalogs", "catalog", path.extname(req.file.originalname) || ".jpg");
      const url = await uploadFile(req.file.buffer, key, req.file.mimetype);
      res.json({ url });
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
      const urls = await Promise.all((req.files as Express.Multer.File[]).map(file => {
        const key = uniqueKey("auction-lots", "lot", path.extname(file.originalname) || ".jpg");
        return uploadFile(file.buffer, key, file.mimetype);
      }));
      res.json({ urls });
    } catch (error) {
      console.error("Error uploading lot images:", error);
      res.status(500).json({ message: "Failed to upload lot images" });
    }
  });

  // Submissions photo upload endpoint
  app.post("/api/upload/submissions", uploadRateLimit, validateFileUpload, upload.array('photos', 5), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: "No photo files provided" });
      }
      const urls = await Promise.all(req.files.map(file => {
        const key = uniqueKey("submissions", "photo", path.extname(file.originalname) || ".jpg");
        return uploadFile(file.buffer, key, file.mimetype);
      }));
      res.json({ urls });
    } catch (error) {
      console.error("POST /api/upload/submissions error:", error);
      res.status(500).json({ message: "Failed to upload submission photos" });
    }
  });

  // Before/after images upload endpoint - resize then upload to R2
  app.post("/api/upload/before-after", uploadRateLimit, validateFileUpload, upload.array('images', 10), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: "No image files provided" });
      }
      const urls = await Promise.all(req.files.map(async (file) => {
        const resized = await sharp(file.buffer)
          .resize({ width: 1400, withoutEnlargement: true })
          .jpeg({ quality: 85, progressive: true })
          .toBuffer();
        const key = uniqueKey("before-after", "image", ".jpg");
        return uploadFile(resized, key, "image/jpeg");
      }));
      res.json({ urls });
    } catch (error) {
      console.error("POST /api/upload/before-after error:", error);
      res.status(500).json({ message: "Failed to upload before/after images" });
    }
  });

  // Instant win claim endpoint

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
      
      const key = uniqueKey("team-members", "team-member", path.extname(req.file.originalname) || ".jpg");
      const imageUrl = await uploadFile(req.file.buffer, key, req.file.mimetype);
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
      const userId = req.session?.user?.id;
      
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
      const userId = req.session?.user?.id;
      
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
        ctaHref = "https://auctions.lanorahouse.com/",
        viewingDates,
        lots,
        autoSave = true
      } = req.body;
      const userId = req.session?.user?.id;
      
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
      
      const userId = req.session?.user?.id;
      
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
      const userId = req.session?.user?.id;
      
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