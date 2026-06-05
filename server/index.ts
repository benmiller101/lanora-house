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
import { beforeAfterPosts, auctionHighlights } from "../shared/schema";
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
  // Only insert seed posts that aren't already in the DB (matched by title).
  // Admin-created posts are never touched.
  const existing = await db.select({ title: beforeAfterPosts.title }).from(beforeAfterPosts);
  const existingTitles = new Set(existing.map((p) => p.title));

  const posts = [
    {
      title: "House Clearance in Looe, Cornwall",
      description: "Complete house clearance of a fully furnished property in the coastal town of Looe, Cornwall. Our team cleared every room — from bedroom furniture and personal effects to kitchen items and household belongings — sorting everything for reuse, donation or responsible disposal. Trusted house clearance specialists serving Looe and the wider South Cornwall area.",
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
      title: "House Clearance in Praze-an-Beeble, Cornwall",
      description: "Full property clearance in Praze-an-Beeble, a village near Camborne in West Cornwall. We cleared all rooms of a furnished home, removing furniture, clothing and household belongings efficiently and professionally. Every item was handled with care — salvageable goods donated or resold, with minimal waste sent to landfill.",
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
      title: "House Clearance in Devon",
      description: "Professional house clearance carried out in Devon, clearing a fully occupied property from top to bottom. Our experienced team removed all furniture, appliances and personal belongings, leaving the property completely empty and ready for sale, rent or renovation. Eco-friendly clearance with responsible disposal throughout.",
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
    {
      title: "House Clearance in Mount Hawk, Cornwall — The Egg Cup Collection",
      description: "A remarkable full house clearance in Mount Hawk, near Redruth, Cornwall — home to an extraordinary collection of egg cups, vintage ceramics and decorative antiques accumulated over a lifetime. Our team cleared every room of this fully furnished property, including a conservatory, lounge, bedrooms, kitchen and garage packed with furniture, collectables, artwork and household effects. All items were carefully sorted for auction, donation and reuse — giving this unique collection a second life and diverting as much as possible from landfill.",
      location: "Mount Hawk, Cornwall",
      category: "House Clearance",
      beforeImageUrls: [
        "/uploads/before-after/img-1779392599022-baf62c0e.jpg",
        "/uploads/before-after/img-1779392599075-a139847f.jpg",
        "/uploads/before-after/img-1779392599090-385da74b.jpg",
        "/uploads/before-after/img-1779392599105-d31507c8.jpg",
        "/uploads/before-after/img-1779392599120-e0c8a71d.jpg",
        "/uploads/before-after/img-1779392599136-4bf3e7cd.jpg",
        "/uploads/before-after/img-1779392599151-d63a0cf5.jpg",
        "/uploads/before-after/img-1779392599167-46ef9c10.jpg",
        "/uploads/before-after/img-1779392599182-f0bdc756.jpg",
        "/uploads/before-after/img-1779392599198-ae59b0d8.jpg",
        "/uploads/before-after/img-1779392599214-7465afc1.jpg",
        "/uploads/before-after/img-1779392599230-de983c07.jpg",
        "/uploads/before-after/img-1779392599245-9b2ae057.jpg",
        "/uploads/before-after/img-1779392599261-5a9b42c7.jpg",
        "/uploads/before-after/img-1779392599277-7fe18239.jpg",
        "/uploads/before-after/img-1779392599292-760bfd2a.jpg",
        "/uploads/before-after/img-1779392599307-ac389b6e.jpg",
        "/uploads/before-after/img-1779392599323-9c7b61ea.jpg",
        "/uploads/before-after/img-1779392599339-5ec86a94.jpg",
        "/uploads/before-after/img-1779392599355-c2a81fb6.jpg",
        "/uploads/before-after/img-1779392599370-c74518eb.jpg",
        "/uploads/before-after/img-1779392599386-3d14cf9a.jpg",
        "/uploads/before-after/img-1779392599402-34fd8510.jpg",
        "/uploads/before-after/img-1779392599418-a8f1ec45.jpg",
      ],
      afterImageUrls: [
        "/uploads/before-after/img-1779392599434-e15723f8.jpg",
        "/uploads/before-after/img-1779392599448-80e4d6a5.jpg",
        "/uploads/before-after/img-1779392599463-2dc19fa6.jpg",
        "/uploads/before-after/img-1779392599479-91a6284c.jpg",
        "/uploads/before-after/img-1779392599496-5983f70d.jpg",
        "/uploads/before-after/img-1779392599510-41fc8b2d.jpg",
        "/uploads/before-after/img-1779392599525-8bc6d245.jpg",
        "/uploads/before-after/img-1779392599540-2194ab36.jpg",
        "/uploads/before-after/img-1779392599556-274d1e0b.jpg",
      ],
      featured: true,
      published: true,
    },
  ];

  const toInsert = posts.filter((p) => !existingTitles.has(p.title));
  if (toInsert.length > 0) {
    await db.insert(beforeAfterPosts).values(toInsert);
    log(`Seeded ${toInsert.length} before/after posts`);
  }
}

const BASE_EASYLIVE = 'https://auctions.lanorahouse.com';

async function seedAuctionHighlights() {
  const [{ value: existing }] = await db.select({ value: count() }).from(auctionHighlights);
  if (Number(existing) > 0) return;

  const highlights = [
    {
      title: 'Curated Estate Auction: 1000+ Egg Cups, Xena and Star Wars Collectibles, Silver Plate, Bronze and Porcelain Figurines',
      description: 'A rare opportunity to acquire pieces from a thoughtfully assembled private collection, spanning decades of devoted gathering and quirky enthusiasm. This curated estate auction brings together an eclectic mix of treasures with something for every kind of collector.',
      imageUrl: '/uploads/auction-catalogs/catalog-1779626061935-6e67fe4ab956.jpeg',
      ctaUrl: `${BASE_EASYLIVE}/catalogue/c9b7b4f12858297355470c3aa11cb54a/0af8d24542e81eb9357e7ef448a6646f/curated-estate-auction-1000-egg-cups-xena-and-star-wars-c/`,
      auctionDate: new Date('2026-05-30T10:00:00Z'),
      auctionTime: '10:00 AM',
      badgeText: 'Featured Auction',
      displayOrder: 1,
      isActive: true,
    },
    {
      title: 'General Auction — Vintage Computer Games, Studio Pottery, Household, Die-Cast Toys, Ceramics, Stamp Collections & More',
      description: null,
      imageUrl: null,
      ctaUrl: `${BASE_EASYLIVE}/catalogue/de3f7abc73bda88d148c2c5ba1ac807d/0af8d24542e81eb9357e7ef448a6646f/general-auction-to-include-vintage-computer-games-studio-po/`,
      auctionDate: new Date('2026-04-04T10:00:00Z'),
      auctionTime: '10:00 AM',
      badgeText: 'Completed',
      displayOrder: 10,
      isActive: true,
    },
    {
      title: 'Timed General Auction — Jewellery, Gold, Silver, Antiques, Artwork, Studio Pottery, Vintage Electronics, Furniture & More',
      description: null,
      imageUrl: null,
      ctaUrl: `${BASE_EASYLIVE}/catalogue/b02c017e05bf4e2ade7b08f7170150a8/0af8d24542e81eb9357e7ef448a6646f/timed-general-auction-to-include-jewellery-gold-silver-an/`,
      auctionDate: new Date('2026-03-23T18:30:00Z'),
      auctionTime: '6:30 PM',
      badgeText: 'Completed',
      displayOrder: 11,
      isActive: true,
    },
    {
      title: 'General Auction — Jewellery, Gold, Silver, Antiques, Artwork, Studio Pottery, Vintage Electronics, Furniture & More',
      description: null,
      imageUrl: null,
      ctaUrl: `${BASE_EASYLIVE}/catalogue/4659b5315cc528191cf8220eebc60549/0af8d24542e81eb9357e7ef448a6646f/general-auction-to-include-jewellery-gold-silver-antiques/`,
      auctionDate: new Date('2026-03-21T10:30:00Z'),
      auctionTime: '10:30 AM',
      badgeText: 'Completed',
      displayOrder: 12,
      isActive: true,
    },
    {
      title: 'Art, Antiques & Collectables — Star Wars, Xena & Lucy Lawless Collection, Elvis, Cornish Studio Pottery, Decorative Arts, Paintings, Ceramics & More',
      description: null,
      imageUrl: null,
      ctaUrl: `${BASE_EASYLIVE}/catalogue/168573454881cbd5c19fc07539597e04/0af8d24542e81eb9357e7ef448a6646f/art-antiques-collectables-star-wars-pop-culture-inc-xen/`,
      auctionDate: new Date('2026-02-25T10:00:00Z'),
      auctionTime: '10:00 AM',
      badgeText: 'Completed',
      displayOrder: 13,
      isActive: true,
    },
    {
      title: 'Timed Art, Antiques & Collectables — Star Wars, Xena & Lucy Lawless Collection, Elvis, Cornish Studio Pottery, Decorative Arts, Paintings, Ceramics & More',
      description: null,
      imageUrl: null,
      ctaUrl: `${BASE_EASYLIVE}/catalogue/1e0740fdf3f103bd46218d119693cdf6/0af8d24542e81eb9357e7ef448a6646f/timed-art-antiques-collectables-star-wars-pop-culture-in/`,
      auctionDate: new Date('2026-02-22T19:00:00Z'),
      auctionTime: '7:00 PM',
      badgeText: 'Completed',
      displayOrder: 14,
      isActive: true,
    },
    {
      title: 'Live Auction — Art, Antiques & Collectables, Star Wars, Xena & Lucy Lawless Collection, Elvis, Cornish Studio Pottery, Decorative Arts, Paintings, Ceramics & More',
      description: null,
      imageUrl: null,
      ctaUrl: `${BASE_EASYLIVE}/catalogue/15a01b69af6e75a81a716bfd1bb553fc/0af8d24542e81eb9357e7ef448a6646f/live-auction-of-art-antiques-collectables-star-wars-pop/`,
      auctionDate: new Date('2026-02-21T10:00:00Z'),
      auctionTime: '10:00 AM',
      badgeText: 'Completed',
      displayOrder: 15,
      isActive: true,
    },
    {
      title: 'Gold, Silver & Diamond Jewellery, Furniture, Art, Antiques, Interiors & Vintage Collectables',
      description: null,
      imageUrl: null,
      ctaUrl: `${BASE_EASYLIVE}/catalogue/82f01f22cd88fe6af305c41bf03a6d7c/0af8d24542e81eb9357e7ef448a6646f/gold-silver-diamond-jewellery-furniture-art-antiques-i/`,
      auctionDate: new Date('2026-01-29T19:00:00Z'),
      auctionTime: '7:00 PM',
      badgeText: 'Completed',
      displayOrder: 16,
      isActive: true,
    },
    {
      title: 'Something for Everyone Sale — Gold, Silver & Diamond Jewellery, Furniture, Art, Antiques, Interiors & Vintage Collectables',
      description: null,
      imageUrl: null,
      ctaUrl: `${BASE_EASYLIVE}/catalogue/2b0ba0a7c40fdeb967abec1185e39163/0af8d24542e81eb9357e7ef448a6646f/something-for-everyone-sale-gold-silver-diamond-jewellery/`,
      auctionDate: new Date('2026-01-28T17:30:00Z'),
      auctionTime: '5:30 PM',
      badgeText: 'Completed',
      displayOrder: 17,
      isActive: true,
    },
    {
      title: 'Fine Jewellery, Gold, Silver & Watches',
      description: null,
      imageUrl: null,
      ctaUrl: `${BASE_EASYLIVE}/catalogue/36b45c18436c98a701a97af62e0dd4d5/0af8d24542e81eb9357e7ef448a6646f/fine-jewellery-gold-silver-watches/`,
      auctionDate: new Date('2026-01-27T17:30:00Z'),
      auctionTime: '5:30 PM',
      badgeText: 'Completed',
      displayOrder: 18,
      isActive: true,
    },
    {
      title: 'The December Grand Finale — Fine Jewellery, Art, Antiques, Gold & Collectables',
      description: null,
      imageUrl: null,
      ctaUrl: `${BASE_EASYLIVE}/catalogue/03bc0f785dd29802df9af2b5dc93d4ee/0af8d24542e81eb9357e7ef448a6646f/the-december-grand-finale-fine-jewellery-art-antiques-go/`,
      auctionDate: new Date('2025-12-23T10:00:00Z'),
      auctionTime: '10:00 AM',
      badgeText: 'Completed',
      displayOrder: 19,
      isActive: true,
    },
    {
      title: 'Christmas Auction — Antiques & Collectables, Artwork, Vintage Toys, Gold & Silver, Posters, Hi-Fi, Electronics & More',
      description: null,
      imageUrl: null,
      ctaUrl: `${BASE_EASYLIVE}/catalogue/298238500ee3773ec6134b50fe326a20/0af8d24542e81eb9357e7ef448a6646f/christmas-auction-antiques-collectables-artwork-vintage/`,
      auctionDate: new Date('2025-12-17T17:30:00Z'),
      auctionTime: '5:30 PM',
      badgeText: 'Completed',
      displayOrder: 20,
      isActive: true,
    },
  ];

  await db.insert(auctionHighlights).values(highlights);
  log("Seeded 12 auction highlights");
}

async function startServer() {
  try {
    // Run migrations on startup to ensure tables exist
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const migrationsFolder = path.join(__dirname, "..", "migrations");
    await migrate(db, { migrationsFolder });
    log("Database migrations applied");

    await seedBeforeAfterPosts();
    await seedAuctionHighlights();

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
