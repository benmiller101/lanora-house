import { Router } from "express";
import { db } from "./db";
import { clearanceStories, insertClearanceStorySchema, clearanceQuotes, insertClearanceQuoteSchema } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";

// Convert an uploaded file to a compressed base64 data URL, then delete the temp file
async function fileToDataUrl(file: Express.Multer.File): Promise<string> {
  try {
    const compressed = await sharp(file.path)
      .rotate() // auto-rotate from EXIF
      .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toBuffer();
    const base64 = compressed.toString("base64");
    return `data:image/jpeg;base64,${base64}`;
  } finally {
    // Always clean up the temp file regardless of success/failure
    try { fs.unlinkSync(file.path); } catch {}
  }
}
import { sendContactFormAdminNotification, sendContactFormConfirmation, sendClearanceQuoteAdminNotification, sendClearanceQuoteConfirmation } from "./email-service";

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "clearance");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `clearance-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});

// GET /api/clearance-stories - Get all clearance stories
router.get("/", async (req, res) => {
  try {
    const stories = await db.select().from(clearanceStories).orderBy(desc(clearanceStories.sortOrder), desc(clearanceStories.createdAt));
    res.json(stories);
  } catch (error) {
    console.error("Error fetching clearance stories:", error);
    res.status(500).json({ error: "Failed to fetch clearance stories" });
  }
});

// GET /api/clearance-stories/active - Get active clearance stories only
router.get("/active", async (req, res) => {
  try {
    const stories = await db.select().from(clearanceStories)
      .where(eq(clearanceStories.isActive, true))
      .orderBy(desc(clearanceStories.sortOrder), desc(clearanceStories.createdAt));
    res.json(stories);
  } catch (error) {
    console.error("Error fetching active clearance stories:", error);
    res.status(500).json({ error: "Failed to fetch active clearance stories" });
  }
});

// POST /api/clearance-stories - Create a new clearance story
router.post("/", upload.fields([
  { name: "image", maxCount: 1 },
  { name: "beforeImage", maxCount: 1 },
  { name: "afterImage", maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    const storyData = {
      title: req.body.title,
      description: req.body.description,
      amountSaved: req.body.amountSaved || null,
      wasteDiverted: req.body.wasteDiverted || null,
      imageUrl: files.image ? `/uploads/clearance/${files.image[0].filename}` : null,
      beforeImageUrl: files.beforeImage ? `/uploads/clearance/${files.beforeImage[0].filename}` : null,
      afterImageUrl: files.afterImage ? `/uploads/clearance/${files.afterImage[0].filename}` : null,
      isActive: req.body.isActive !== undefined ? req.body.isActive === "true" : true,
      sortOrder: req.body.sortOrder ? parseInt(req.body.sortOrder) : 0,
    };

    const validatedData = insertClearanceStorySchema.parse(storyData);
    const [story] = await db.insert(clearanceStories).values(validatedData).returning();
    
    res.status(201).json(story);
  } catch (error) {
    console.error("Error creating clearance story:", error);
    res.status(500).json({ error: "Failed to create clearance story" });
  }
});

// PUT /api/clearance-stories/:id - Update a clearance story
router.put("/:id", upload.fields([
  { name: "image", maxCount: 1 },
  { name: "beforeImage", maxCount: 1 },
  { name: "afterImage", maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    const storyData: any = {
      title: req.body.title,
      description: req.body.description,
      amountSaved: req.body.amountSaved || null,
      wasteDiverted: req.body.wasteDiverted || null,
      isActive: req.body.isActive !== undefined ? req.body.isActive === "true" : true,
      sortOrder: req.body.sortOrder ? parseInt(req.body.sortOrder) : 0,
    };

    // Only update image URLs if new files were uploaded
    if (files.image) {
      storyData.imageUrl = `/uploads/clearance/${files.image[0].filename}`;
    }
    if (files.beforeImage) {
      storyData.beforeImageUrl = `/uploads/clearance/${files.beforeImage[0].filename}`;
    }
    if (files.afterImage) {
      storyData.afterImageUrl = `/uploads/clearance/${files.afterImage[0].filename}`;
    }

    const validatedData = insertClearanceStorySchema.partial().parse(storyData);
    const [story] = await db.update(clearanceStories)
      .set(validatedData)
      .where(eq(clearanceStories.id, parseInt(id)))
      .returning();
    
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }
    
    res.json(story);
  } catch (error) {
    console.error("Error updating clearance story:", error);
    res.status(500).json({ error: "Failed to update clearance story" });
  }
});

// DELETE /api/clearance-stories/:id - Delete a clearance story
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const [story] = await db.delete(clearanceStories)
      .where(eq(clearanceStories.id, parseInt(id)))
      .returning();
    
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }
    
    // Clean up uploaded files
    if (story.imageUrl) {
      const imagePath = path.join(process.cwd(), "public", story.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    if (story.beforeImageUrl) {
      const beforeImagePath = path.join(process.cwd(), "public", story.beforeImageUrl);
      if (fs.existsSync(beforeImagePath)) {
        fs.unlinkSync(beforeImagePath);
      }
    }
    if (story.afterImageUrl) {
      const afterImagePath = path.join(process.cwd(), "public", story.afterImageUrl);
      if (fs.existsSync(afterImagePath)) {
        fs.unlinkSync(afterImagePath);
      }
    }
    
    res.json({ message: "Story deleted successfully" });
  } catch (error) {
    console.error("Error deleting clearance story:", error);
    res.status(500).json({ error: "Failed to delete clearance story" });
  }
});

// POST /api/clearance-quotes - Submit a clearance quote request
router.post("/quotes", upload.array("images", 5), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    console.log("🏠 Clearance quote submission received:", req.body);
    
    // Build additional info to include service type and location details
    let additionalInfoText = req.body.additionalInfo || "";
    
    if (req.body.serviceType) {
      additionalInfoText = `Service Type: ${req.body.serviceType}\n\n${additionalInfoText}`;
    }
    
    if (req.body.location && req.body.location !== req.body.address) {
      additionalInfoText = `Service Location: ${req.body.location}\n\n${additionalInfoText}`;
    }
    
    if (req.body.accessRestrictions) {
      additionalInfoText += `\n\nAccess Restrictions: ${req.body.accessRestrictions}`;
    }
    
    if (req.body.specialRequirements) {
      additionalInfoText += `\n\nSpecial Requirements: ${req.body.specialRequirements}`;
    }
    
    // Handle additional fields from different forms
    if (req.body.estimatedVolume) {
      additionalInfoText += `\n\nEstimated Volume: ${req.body.estimatedVolume}`;
    }
    
    if (req.body.urgency) {
      additionalInfoText += `\n\nUrgency: ${req.body.urgency}`;
    }
    
    if (req.body.description && req.body.description !== req.body.additionalInfo) {
      additionalInfoText += `\n\nDescription: ${req.body.description}`;
    }
    
    const imageUrls = files ? await Promise.all(files.map(fileToDataUrl)) : [];

    const quoteData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address || req.body.location || null,
      propertyType: req.body.propertyType || null,
      clearanceType: req.body.clearanceType || req.body.serviceType || null,
      timeframe: req.body.timeframe || req.body.urgency || null,
      additionalInfo: additionalInfoText.trim() || null,
      imageUrls,
      requestType: req.body.requestType || "clearance",
    };

    const validatedData = insertClearanceQuoteSchema.parse(quoteData);
    const [quote] = await db.insert(clearanceQuotes).values(validatedData).returning();

    // Send email notifications (non-blocking — don't fail the response if email errors)
    const emailPayload = {
      name: quoteData.name,
      email: quoteData.email,
      phone: quoteData.phone || null,
      address: quoteData.address || null,
      propertyType: quoteData.propertyType || null,
      clearanceType: quoteData.clearanceType || null,
      timeframe: quoteData.timeframe || null,
      additionalInfo: quoteData.additionalInfo || null,
      imageUrls: quoteData.imageUrls,
      requestType: quoteData.requestType,
      submittedAt: new Date(),
    };

    Promise.all([
      sendClearanceQuoteAdminNotification(emailPayload),
      sendClearanceQuoteConfirmation(emailPayload),
    ]).catch(err => console.error("Email notification error:", err));

    res.status(201).json(quote);
  } catch (error) {
    console.error("Error creating clearance quote:", error);
    res.status(500).json({ error: "Failed to submit quote request" });
  }
});

// GET /api/clearance-quotes - Get all clearance quotes (admin only)
router.get("/quotes", async (req, res) => {
  try {
    const quotes = await db.select().from(clearanceQuotes).orderBy(desc(clearanceQuotes.createdAt));
    res.json(quotes);
  } catch (error) {
    console.error("Error fetching clearance quotes:", error);
    res.status(500).json({ error: "Failed to fetch clearance quotes" });
  }
});

// PUT /api/clearance-quotes/:id/status - Update quote status
router.put("/quotes/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const [quote] = await db.update(clearanceQuotes)
      .set({ status, updatedAt: new Date() })
      .where(eq(clearanceQuotes.id, parseInt(id)))
      .returning();
    
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }
    
    res.json(quote);
  } catch (error) {
    console.error("Error updating quote status:", error);
    res.status(500).json({ error: "Failed to update quote status" });
  }
});

// POST /api/contact-form - Submit a contact form request (with optional images)
router.post("/contact-form", upload.array("images", 10), async (req, res) => {
  try {
    console.log("📞 Contact form submission received:", req.body);
    const files = req.files as Express.Multer.File[];
    
    // Validate required contact form fields before processing
    if (!req.body.name || !req.body.email || !req.body.subject || !req.body.message) {
      return res.status(400).json({ 
        error: "Missing required fields: name, email, subject, and message are required" 
      });
    }
    
    // Process uploaded images — convert to base64 data URLs for persistent storage
    const imageUrls = files ? await Promise.all(files.map(fileToDataUrl)) : [];
    
    const contactData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone || null,
      address: req.body.location || null, // Map location to address field
      additionalInfo: `Subject: ${req.body.subject}\n\nInquiry Type: ${req.body.inquiryType || 'General'}\n\nMessage: ${req.body.message}`,
      requestType: "contact",
      propertyType: null,
      clearanceType: null,
      timeframe: null,
      imageUrls: imageUrls,
    };

    // Validate the transformed data against the schema
    const validatedData = insertClearanceQuoteSchema.parse(contactData);
    const [contactRequest] = await db.insert(clearanceQuotes).values(validatedData).returning();
    
    console.log("📞 Contact form saved successfully:", contactRequest.id, "with", imageUrls.length, "images");

    // Send email notifications (non-blocking — a failed email must not affect the response)
    const emailData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone || null,
      inquiryType: req.body.inquiryType || 'General',
      location: req.body.location || null,
      subject: req.body.subject,
      message: req.body.message,
      imageUrls: imageUrls,
      submittedAt: new Date(),
    };
    Promise.all([
      sendContactFormAdminNotification(emailData),
      sendContactFormConfirmation(emailData),
    ]).catch(err => console.error('📞 Email notification error (non-fatal):', err));

    res.status(201).json({ 
      message: "Contact form submitted successfully",
      id: contactRequest.id,
      imagesUploaded: imageUrls.length
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    
    // Provide more detailed error information
    if (error.name === 'ZodError') {
      console.error("📞 Validation error details:", error.errors);
      res.status(400).json({ error: "Validation failed", details: error.errors });
    } else {
      res.status(500).json({ error: "Failed to submit contact form" });
    }
  }
});

export default router;