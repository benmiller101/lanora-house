import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import clearanceRoutes from "./clearance-routes";
import { setupVite, serveStatic, log } from "./vite";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./db";
import { beforeAfterPosts } from "../shared/schema";
import { eq, count } from "drizzle-orm";

const app = express();

// Trust Railway's (and other reverse-proxy) X-Forwarded-* headers so that
// req.secure / req.protocol reflect the original HTTPS connection, and secure
// session cookies are set correctly.
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

// Serve logo and favicons directly to bypass Vite conflicts
app.get("/logos/lanora-house-logo.png", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public/logos/lanora-house-logo.png"));
});
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

async function seedBeforeAfterPosts() {
  const [{ value: existing }] = await db.select({ value: count() }).from(beforeAfterPosts);
  if (existing > 0) return;

  const posts = [
    {
      title: "House Clearance – Looe",
      description: "Full house clearance of a furnished property in Looe, Cornwall.",
      location: "Looe, Cornwall",
      category: "House Clearance",
      beforeImageUrls: [
        "/uploads/before-after/img-1779099098555-cb7b416d.jpg",
        "/uploads/before-after/img-1779099099045-58e9e985.jpg",
        "/uploads/before-after/img-1779099099414-6e352ba9.jpg",
        "/uploads/before-after/img-1779099099685-aee37801.jpg",
        "/uploads/before-after/img-1779099099967-10b9838c.jpg",
        "/uploads/before-after/img-1779099100255-4452513f.jpg",
      ],
      afterImageUrls: [
        "/uploads/before-after/img-1779099100550-0e85b970.jpg",
        "/uploads/before-after/img-1779099100878-06daa7f1.jpg",
        "/uploads/before-after/img-1779099101230-f3e5cfe6.jpg",
        "/uploads/before-after/img-1779099101549-07bd6654.jpg",
        "/uploads/before-after/img-1779099101891-2cb0f8cf.jpg",
        "/uploads/before-after/img-1779099102214-808eb953.jpg",
      ],
      featured: true,
      published: true,
    },
    {
      title: "House Clearance – Praze-an-Beeble",
      description: "Complete clearance of a property in Praze-an-Beeble, Cornwall.",
      location: "Praze-an-Beeble, Cornwall",
      category: "House Clearance",
      beforeImageUrls: [
        "/uploads/before-after/img-1779099103569-54f9083a.jpg",
        "/uploads/before-after/img-1779099104456-c23eea1c.jpg",
        "/uploads/before-after/img-1779099105053-c43ed258.jpg",
        "/uploads/before-after/img-1779099105373-84b0a4a8.jpg",
        "/uploads/before-after/img-1779099105725-1d964be8.jpg",
      ],
      afterImageUrls: [
        "/uploads/before-after/img-1779099106060-87f526ee.jpg",
        "/uploads/before-after/img-1779099106416-82174503.jpg",
        "/uploads/before-after/img-1779099106769-d699a5c7.jpg",
        "/uploads/before-after/img-1779099107161-5a466338.jpg",
        "/uploads/before-after/img-1779099107516-f3e2685a.jpg",
      ],
      featured: true,
      published: true,
    },
    {
      title: "House Clearance – Devon",
      description: "Professional house clearance in Devon.",
      location: "Devon",
      category: "House Clearance",
      beforeImageUrls: [
        "/uploads/before-after/img-1779099108039-243a61a1.jpg",
        "/uploads/before-after/img-1779099108094-db44bda4.jpg",
        "/uploads/before-after/img-1779099108143-57a04cc6.jpg",
      ],
      afterImageUrls: [
        "/uploads/before-after/img-1779099108205-64cdf1bb.jpg",
        "/uploads/before-after/img-1779099108266-647555e7.jpg",
        "/uploads/before-after/img-1779099108331-ceec548d.jpg",
      ],
      featured: true,
      published: true,
    },
  ];

  await db.insert(beforeAfterPosts).values(posts);
  log("Seeded 3 before/after posts");
}

async function startServer() {
  try {
    // Run migrations on startup to ensure tables exist
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const migrationsFolder = path.join(__dirname, "..", "migrations");
    await migrate(db, { migrationsFolder });
    log("Database migrations applied");

    await seedBeforeAfterPosts();

    const server = await registerRoutes(app);

    app.use("/api/clearance-stories", clearanceRoutes);

    // Serve uploads before Vite so dev mode doesn't intercept them
    app.use("/uploads", express.static("public/uploads"));

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
      app.use(express.static("public"));
    }

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Server error:", err);
      res.status(status).json({ message });
    });

    const PORT = Number(process.env.PORT) || 5000;
    server.listen(PORT, "0.0.0.0", () => {
      log(`serving on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
