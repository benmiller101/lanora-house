import express from "express";
import { db } from "./db"; 
import { environmentalImpact, insertEnvironmentalImpactSchema } from "../shared/schema";
import { eq } from "drizzle-orm";

const router = express.Router();

// Get current environmental impact data
router.get("/", async (req, res) => {
  try {
    // Get the most recent environmental impact record
    const [data] = await db
      .select()
      .from(environmentalImpact)
      .orderBy(environmentalImpact.updatedAt)
      .limit(1);

    if (!data) {
      // Create default record if none exists
      const [newData] = await db
        .insert(environmentalImpact)
        .values({})
        .returning();
      
      return res.json(newData);
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching environmental impact data:", error);
    res.status(500).json({ error: "Failed to fetch environmental impact data" });
  }
});

// Update environmental impact data (admin only)
router.put("/", async (req, res) => {
  try {
    const validatedData = insertEnvironmentalImpactSchema.parse(req.body);
    
    // Calculate progress percentage
    const progressPercentage = validatedData.yearlyTarget && parseFloat(validatedData.yearlyTarget) > 0
      ? ((parseFloat(validatedData.currentProgress || "0") / parseFloat(validatedData.yearlyTarget)) * 100).toFixed(2)
      : "0";

    // Get the existing record to update
    const [existingData] = await db
      .select()
      .from(environmentalImpact)
      .orderBy(environmentalImpact.updatedAt)
      .limit(1);

    let updatedData;
    
    if (existingData) {
      // Update existing record
      [updatedData] = await db
        .update(environmentalImpact)
        .set({
          ...validatedData,
          progressPercentage,
          updatedAt: new Date()
        })
        .where(eq(environmentalImpact.id, existingData.id))
        .returning();
    } else {
      // Create new record
      [updatedData] = await db
        .insert(environmentalImpact)
        .values({
          ...validatedData,
          progressPercentage
        })
        .returning();
    }

    res.json(updatedData);
  } catch (error) {
    console.error("Error updating environmental impact data:", error);
    res.status(500).json({ error: "Failed to update environmental impact data" });
  }
});

export default router;