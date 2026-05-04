import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import submissionsRoutes from "./routes-submissions";
import raffleRoutes from "./raffle-routes";
import clearanceRoutes from "./clearance-routes";
import paymentRoutes from "./payment-routes";
import raffleWinnerRoutes from "./raffle-winner-routes";
import klarnaRoutes from "./klarna-routes";
import liveStreamRoutes from "./live-stream-routes";
import liveAuctionRoutes from "./live-auction-routes";
// instantWinsRoutes now imported within registerRoutes
import { setupVite, serveStatic, log } from "./vite";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// ✅ Cookie parser BEFORE session
app.use(cookieParser());

// In-memory session store (admin auth uses localStorage credentials, not sessions)
app.use(session({
  secret: process.env.SESSION_SECRET || "lanora-house-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

// Serve logo file directly to bypass Vite conflicts
app.get("/logos/lanora-house-logo.png", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public/logos/lanora-house-logo.png"));
});

// Serve favicon files directly to bypass Vite conflicts
app.get("/favicon.ico", (req, res) => {
  res.setHeader('Content-Type', 'image/x-icon');
  res.sendFile(path.join(process.cwd(), "public/favicon.ico"));
});

app.get("/favicon-16x16.png", (req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.sendFile(path.join(process.cwd(), "public/favicon-16x16.png"));
});

app.get("/favicon-32x32.png", (req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.sendFile(path.join(process.cwd(), "public/favicon-32x32.png"));
});

app.get("/apple-touch-icon.png", (req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.sendFile(path.join(process.cwd(), "public/apple-touch-icon.png"));
});

// Serve uploads directory
app.use("/uploads", express.static("public/uploads"));

// Direct database query for products - bypass routing issues
app.get("/db/products", async (req, res) => {
  try {
    const { pool } = await import("./db");
    const result = await pool.query(`
      SELECT 
        p.id, 
        p.name, 
        p.price, 
        p.is_featured, 
        p.is_bestseller,
        p.category_id,
        c.name as category_name,
        c.slug as category_slug
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      ORDER BY p.created_at DESC
    `);
    res.json({ products: result.rows });
  } catch (error) {
    console.error("Direct DB query error:", error);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Direct test endpoint for instant wins
app.get("/test/instant-wins", async (req, res) => {
  try {
    const { pool } = await import("./db");
    const result = await pool.query(`
      SELECT 
        iw.id,
        iw.raffle_id as "raffleId",
        r.name as "raffleName",
        iw.prize_type as "prizeType",
        iw.prize_amount as "prizeAmount",
        iw.claimed,
        iw.created_at as "createdAt"
      FROM instant_wins iw
      JOIN raffles r ON iw.raffle_id = r.id
      WHERE iw.user_id = $1
      ORDER BY iw.created_at DESC
    `, ['user_test_example_com_1748304412605']);
    
    console.log(`🎁 Direct test found ${result.rows.length} instant wins`);
    res.json({ instantWins: result.rows, count: result.rows.length });
  } catch (error) {
    console.error("Direct instant wins test error:", error);
    res.status(500).json({ error: "Test failed", details: error.message });
  }
});

async function startServer() {
  try {
    console.log("🔧 Starting server setup...");

    // Register main routes FIRST, before Vite setup
    const server = await registerRoutes(app);
    console.log("✅ Main API routes registered successfully");

    // Register additional API routes
    console.log("🔧 Registering additional API routes...");
    app.use("/api/submissions", submissionsRoutes);
    app.use("/api/raffles", raffleRoutes);
    app.use("/api/clearance-stories", clearanceRoutes);
    app.use("/api/raffle-winners", raffleWinnerRoutes);
    
    // Winners feed routes
    const winnersFeedRoutes = await import("./winners-feed-routes");
    app.use("/api/winners-feed", winnersFeedRoutes.default);
    
    // Live streaming routes
    app.use(liveStreamRoutes);
    
    // Live auction control routes
    app.use(liveAuctionRoutes);
    
    // Payment routes
    app.use("/api", paymentRoutes);
    
    // Klarna payment routes - bypass CSRF protection for payment endpoints
    app.use("/api/klarna", (req, res, next) => {
      // Skip CSRF check for Klarna payment endpoints
      next();
    }, klarnaRoutes);
    
    // Instant wins routes are now mounted within registerRoutes where auth is set up

    // Setup Vite for development AFTER all API routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Serve static files from public directory AFTER Vite setup
    app.use(express.static("public"));
    // Serve uploads specifically
    app.use("/uploads", express.static("public/uploads"));

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error("Server error:", err);
      res.status(status).json({ message });
    });

    const PORT = 5000;
    server.listen(PORT, "0.0.0.0", () => {
      log(`serving on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
