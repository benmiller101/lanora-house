import { Router, Request, Response } from "express";
import { generateAIRecommendations, getBrowsingBasedRecommendations } from "./ai-recommendations";
import { db } from "./db";
import { products } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

/**
 * Get AI-powered recommendations for a specific product
 */
router.get("/product/:id", async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    
    // Get the current product for context
    const [currentProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    if (!currentProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Get user's browsing history from session or query params
    const browsingHistory = req.query.history 
      ? (req.query.history as string).split(',').filter(Boolean)
      : [];

    // Generate AI recommendations
    const recommendations = await generateAIRecommendations({
      currentProduct,
      userBrowsingHistory: browsingHistory
    }, 4);

    res.json(recommendations);
  } catch (error) {
    console.error("Error getting product recommendations:", error);
    res.status(500).json({ error: "Failed to get recommendations" });
  }
});

/**
 * Get personalized recommendations based on browsing history
 */
router.get("/browsing-based", async (req: Request, res: Response) => {
  try {
    const browsingHistory = req.query.history 
      ? (req.query.history as string).split(',').filter(Boolean)
      : [];

    const limit = parseInt(req.query.limit as string) || 4;

    const recommendations = await getBrowsingBasedRecommendations(
      browsingHistory, 
      limit
    );

    res.json(recommendations);
  } catch (error) {
    console.error("Error getting browsing-based recommendations:", error);
    res.status(500).json({ error: "Failed to get recommendations" });
  }
});

/**
 * Get category-based recommendations
 */
router.get("/category/:categoryId", async (req: Request, res: Response) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    const limit = parseInt(req.query.limit as string) || 4;
    const excludeId = req.query.exclude ? parseInt(req.query.exclude as string) : null;

    let query = db
      .select()
      .from(products)
      .where(eq(products.categoryId, categoryId));

    if (excludeId) {
      query = query.where(eq(products.id, excludeId));
    }

    const recommendations = await query.limit(limit);
    res.json(recommendations);
  } catch (error) {
    console.error("Error getting category recommendations:", error);
    res.status(500).json({ error: "Failed to get recommendations" });
  }
});

/**
 * Get trending/popular recommendations
 */
router.get("/trending", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;

    // Get featured and best seller products
    const trending = await db
      .select()
      .from(products)
      .where(eq(products.inStock, true))
      .orderBy(products.isFeatured, products.isBestSeller)
      .limit(limit);

    res.json(trending);
  } catch (error) {
    console.error("Error getting trending recommendations:", error);
    res.status(500).json({ error: "Failed to get recommendations" });
  }
});

/**
 * Get price-based recommendations
 */
router.get("/price-range", async (req: Request, res: Response) => {
  try {
    const minPrice = parseFloat(req.query.min as string) || 0;
    const maxPrice = parseFloat(req.query.max as string) || 999999;
    const limit = parseInt(req.query.limit as string) || 4;
    const excludeId = req.query.exclude ? parseInt(req.query.exclude as string) : null;

    let query = db
      .select()
      .from(products)
      .where(eq(products.inStock, true));

    if (excludeId) {
      query = query.where(eq(products.id, excludeId));
    }

    const recommendations = await query.limit(limit);
    
    // Filter by price range in application (since price is stored as string)
    const filtered = recommendations.filter(product => {
      const price = parseFloat(product.price);
      return price >= minPrice && price <= maxPrice;
    }).slice(0, limit);

    res.json(filtered);
  } catch (error) {
    console.error("Error getting price-based recommendations:", error);
    res.status(500).json({ error: "Failed to get recommendations" });
  }
});

export default router;