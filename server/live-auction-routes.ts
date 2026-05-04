import express, { Router, Request, Response } from "express";
import { db } from "./db";
import { 
  liveAuctionSessions, 
  auctionLots, 
  auctionBids,
  auctionCatalogues,
  liveStreams,
  auctionInvoices,
  insertLiveAuctionSessionSchema
} from "@shared/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { requireAdmin } from "./middleware/security";
import Stripe from "stripe";

const router = Router();

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

router.post("/api/admin/live-auctions", requireAdmin, async (req: Request, res: Response) => {
  try {
    const validatedData = insertLiveAuctionSessionSchema.parse(req.body);

    const existingSession = await db.query.liveAuctionSessions.findFirst({
      where: and(
        eq(liveAuctionSessions.catalogId, validatedData.catalogId),
        eq(liveAuctionSessions.status, "active")
      ),
    });

    if (existingSession) {
      return res.status(400).json({ 
        error: "An active auction session already exists for this catalog" 
      });
    }

    const [session] = await db
      .insert(liveAuctionSessions)
      .values({
        ...validatedData,
        status: "active",
        startedAt: new Date(),
      })
      .returning();

    res.status(201).json(session);
  } catch (error: any) {
    console.error("Error creating live auction session:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/admin/live-auctions/catalog/:catalogId", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { catalogId } = req.params;

    const session = await db.query.liveAuctionSessions.findFirst({
      where: eq(liveAuctionSessions.catalogId, catalogId),
      orderBy: [desc(liveAuctionSessions.createdAt)],
    });

    if (!session) {
      return res.status(404).json({ error: "No auction session found" });
    }

    let currentLot = null;
    if (session.currentLotId) {
      currentLot = await db.query.auctionLots.findFirst({
        where: eq(auctionLots.id, session.currentLotId),
      });
    }

    const lots = await db.query.auctionLots.findMany({
      where: eq(auctionLots.catalogId, catalogId),
      orderBy: [auctionLots.lotNumber],
    });

    let recentBids: any[] = [];
    if (session.currentLotId) {
      recentBids = await db.query.auctionBids.findMany({
        where: eq(auctionBids.lotId, session.currentLotId),
        orderBy: [desc(auctionBids.createdAt)],
        limit: 10,
      });
    }

    res.json({
      session,
      currentLot,
      lots,
      recentBids,
    });
  } catch (error: any) {
    console.error("Error fetching live auction session:", error);
    res.status(500).json({ error: error.message });
  }
});

router.patch("/api/admin/live-auctions/:id/lot", requireAdmin, async (req: Request, res: Response) => {
  try {
    const sessionId = parseInt(req.params.id);
    const { lotId } = req.body;

    const [updated] = await db
      .update(liveAuctionSessions)
      .set({
        currentLotId: lotId,
        updatedAt: new Date(),
      })
      .where(eq(liveAuctionSessions.id, sessionId))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json(updated);
  } catch (error: any) {
    console.error("Error updating current lot:", error);
    res.status(500).json({ error: error.message });
  }
});

router.patch("/api/admin/live-auctions/:id/status", requireAdmin, async (req: Request, res: Response) => {
  try {
    const sessionId = parseInt(req.params.id);
    const { status } = req.body;

    if (!["pending", "active", "paused", "completed"].includes(status)) {
      return res.status(400).json({ 
        error: "Invalid status. Must be: pending, active, paused, or completed" 
      });
    }

    const existingSession = await db.query.liveAuctionSessions.findFirst({
      where: eq(liveAuctionSessions.id, sessionId),
    });

    if (!existingSession) {
      return res.status(404).json({ error: "Session not found" });
    }

    const updateData: any = { status, updatedAt: new Date() };
    
    if (status === "active" && !existingSession.startedAt) {
      updateData.startedAt = new Date();
    } else if (status === "completed") {
      updateData.endedAt = new Date();
    }

    const [updated] = await db
      .update(liveAuctionSessions)
      .set(updateData)
      .where(eq(liveAuctionSessions.id, sessionId))
      .returning();

    res.json(updated);
  } catch (error: any) {
    console.error("Error updating session status:", error);
    res.status(500).json({ error: error.message });
  }
});

router.patch("/api/admin/live-auctions/:sessionId/lots/:lotId/hammer", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { lotId } = req.params;
    const { winnerId, hammerPrice } = req.body;

    if (!winnerId || !hammerPrice) {
      return res.status(400).json({ 
        error: "winnerId and hammerPrice are required" 
      });
    }

    const numericPrice = parseFloat(hammerPrice);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ 
        error: "hammerPrice must be a positive number" 
      });
    }

    const winningBid = await db.query.auctionBids.findFirst({
      where: and(
        eq(auctionBids.lotId, lotId),
        eq(auctionBids.userId, winnerId)
      ),
    });

    if (!winningBid) {
      return res.status(400).json({ 
        error: "Winner must have an existing bid on this lot" 
      });
    }

    const [updatedLot] = await db
      .update(auctionLots)
      .set({
        status: "sold",
        winnerId,
        hammerPrice: numericPrice.toString(),
        updatedAt: new Date(),
      })
      .where(eq(auctionLots.id, lotId))
      .returning();

    await db
      .update(auctionBids)
      .set({ status: "won" })
      .where(and(
        eq(auctionBids.lotId, lotId),
        eq(auctionBids.userId, winnerId)
      ));

    await db
      .update(auctionBids)
      .set({ status: "lost" })
      .where(and(
        eq(auctionBids.lotId, lotId),
        sql`${auctionBids.userId} != ${winnerId}`
      ));

    res.json(updatedLot);
  } catch (error: any) {
    console.error("Error accepting hammer price:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/auction-catalogs/:catalogId/live-session", async (req: Request, res: Response) => {
  try {
    const { catalogId } = req.params;

    const session = await db.query.liveAuctionSessions.findFirst({
      where: and(
        eq(liveAuctionSessions.catalogId, catalogId),
        eq(liveAuctionSessions.status, "active")
      ),
    });

    if (!session) {
      return res.status(404).json({ error: "No active auction session" });
    }

    let currentLot = null;
    let currentBids: any[] = [];

    if (session.currentLotId) {
      currentLot = await db.query.auctionLots.findFirst({
        where: eq(auctionLots.id, session.currentLotId),
      });

      currentBids = await db.query.auctionBids.findMany({
        where: eq(auctionBids.lotId, session.currentLotId),
        orderBy: [desc(auctionBids.createdAt)],
        limit: 5,
      });
    }

    res.json({
      session: {
        id: session.id,
        status: session.status,
        currentLotId: session.currentLotId,
      },
      currentLot,
      currentBids: currentBids.map(bid => ({
        id: bid.id,
        bidAmount: bid.bidAmount,
        createdAt: bid.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching public auction session:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/auction/my-won-lots", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).session?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Fetch won lots
    const wonLots = await db.query.auctionLots.findMany({
      where: and(
        eq(auctionLots.winnerId, userId),
        eq(auctionLots.status, "sold")
      ),
      orderBy: [desc(auctionLots.updatedAt)],
    });

    if (wonLots.length === 0) {
      return res.json([]);
    }

    // Get unique catalog IDs
    const catalogIds = [...new Set(wonLots.map(lot => lot.catalogId))];
    
    // Fetch all catalogs in one query
    const catalogs = await db.query.auctionCatalogues.findMany({
      where: inArray(auctionCatalogues.id, catalogIds as string[]),
    });

    // Create a map for quick catalog lookup
    const catalogMap = new Map(catalogs.map(c => [c.id, c]));

    // Group lots by catalog
    const groupedByCatalog = wonLots.reduce((acc: any, lot: any) => {
      const catalog = catalogMap.get(lot.catalogId);
      if (!catalog) return acc;

      if (!acc[lot.catalogId]) {
        acc[lot.catalogId] = {
          catalogId: lot.catalogId,
          catalogName: catalog.name,
          catalogDate: catalog.startDate,
          lots: [],
          totalValue: 0,
        };
      }
      
      const hammerPriceValue = parseFloat(lot.hammerPrice ?? "0");
      const lotWithPrice = {
        lotId: lot.id,
        lotNumber: lot.lotNumber,
        lotTitle: lot.title,
        lotDescription: lot.description,
        lotImageUrl: lot.imageUrl,
        hammerPrice: isNaN(hammerPriceValue) ? "0" : lot.hammerPrice,
        soldAt: lot.updatedAt,
      };
      
      acc[lot.catalogId].lots.push(lotWithPrice);
      acc[lot.catalogId].totalValue += isNaN(hammerPriceValue) ? 0 : hammerPriceValue;
      return acc;
    }, {});

    const result = Object.values(groupedByCatalog);

    res.json(result);
  } catch (error: any) {
    console.error("Error fetching won lots:", error);
    res.status(500).json({ error: error.message });
  }
});

// Generate or get invoice for a catalog's won lots
router.post("/api/auction/invoices/generate/:catalogId", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).session?.userId;
    const { catalogId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Check if invoice already exists
    const existingInvoice = await db.query.auctionInvoices.findFirst({
      where: and(
        eq(auctionInvoices.catalogId, catalogId),
        eq(auctionInvoices.userId, userId)
      ),
    });

    if (existingInvoice) {
      return res.json(existingInvoice);
    }

    // Fetch won lots for this catalog
    const wonLots = await db.query.auctionLots.findMany({
      where: and(
        eq(auctionLots.catalogId, catalogId),
        eq(auctionLots.winnerId, userId),
        eq(auctionLots.status, "sold")
      ),
    });

    if (wonLots.length === 0) {
      return res.status(404).json({ error: "No won lots found for this catalog" });
    }

    // Calculate invoice totals
    const subtotal = wonLots.reduce((sum, lot) => {
      const price = parseFloat(lot.hammerPrice || "0");
      return sum + (isNaN(price) ? 0 : price);
    }, 0);

    const buyersPremiumRate = 20.00;
    const buyersPremium = (subtotal * buyersPremiumRate) / 100;
    const total = subtotal + buyersPremium;

    // Generate invoice number (format: INV-YYYYMMDD-XXXXX)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const invoiceNumber = `INV-${dateStr}-${randomNum}`;

    try {
      // Create invoice - protected by unique constraint on (catalogId, userId)
      const [invoice] = await db
        .insert(auctionInvoices)
        .values({
          invoiceNumber,
          catalogId,
          userId,
          lotIds: wonLots.map(lot => lot.id),
          subtotal: subtotal.toFixed(2),
          buyersPremiumRate: buyersPremiumRate.toFixed(2),
          buyersPremium: buyersPremium.toFixed(2),
          total: total.toFixed(2),
          status: "unpaid",
        })
        .returning();

      res.json(invoice);
    } catch (insertError: any) {
      // Handle unique constraint violation (concurrent requests)
      if (insertError.code === '23505') {
        // Constraint violation - fetch the existing invoice
        const invoice = await db.query.auctionInvoices.findFirst({
          where: and(
            eq(auctionInvoices.catalogId, catalogId),
            eq(auctionInvoices.userId, userId)
          ),
        });
        if (invoice) {
          return res.json(invoice);
        }
      }
      throw insertError;
    }
  } catch (error: any) {
    console.error("Error generating invoice:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get invoice with full details
router.get("/api/auction/invoices/:catalogId", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).session?.userId;
    const { catalogId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const invoice = await db.query.auctionInvoices.findFirst({
      where: and(
        eq(auctionInvoices.catalogId, catalogId),
        eq(auctionInvoices.userId, userId)
      ),
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // Fetch catalog details
    const catalog = await db.query.auctionCatalogues.findFirst({
      where: eq(auctionCatalogues.id, catalogId),
    });

    // Fetch lot details
    const lots = await db.query.auctionLots.findMany({
      where: inArray(auctionLots.id, invoice.lotIds as string[]),
    });

    res.json({
      ...invoice,
      catalog,
      lots,
    });
  } catch (error: any) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create Stripe payment intent for invoice
router.post("/api/auction/invoices/:catalogId/payment-intent", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).session?.userId;
    const { catalogId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Fetch invoice
    const invoice = await db.query.auctionInvoices.findFirst({
      where: and(
        eq(auctionInvoices.catalogId, catalogId),
        eq(auctionInvoices.userId, userId)
      ),
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // Check if already paid
    if (invoice.status === "paid") {
      return res.status(400).json({ error: "Invoice already paid" });
    }

    // Create payment intent
    const amount = Math.round(parseFloat(invoice.total) * 100); // Convert to cents
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "gbp",
      metadata: {
        invoiceId: invoice.id.toString(),
        catalogId: invoice.catalogId,
        userId: invoice.userId,
        invoiceNumber: invoice.invoiceNumber,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook to handle successful payment
router.post("/api/auction/invoices/webhook", express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const invoiceId = paymentIntent.metadata.invoiceId;

    if (invoiceId) {
      try {
        // Update invoice status to paid
        await db
          .update(auctionInvoices)
          .set({
            status: "paid",
            paidAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(auctionInvoices.id, parseInt(invoiceId)));

        console.log(`Invoice ${invoiceId} marked as paid`);
      } catch (error: any) {
        console.error('Error updating invoice:', error);
      }
    }
  }

  res.json({ received: true });
});

export default router;
