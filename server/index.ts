import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import clearanceRoutes from "./clearance-routes";
import { setupVite, serveStatic, log } from "./vite";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

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

async function startServer() {
  try {
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
