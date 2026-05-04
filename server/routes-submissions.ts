import { Request, Response, Router } from "express";
import { pool } from "./db";

const router = Router();

// Get all public submissions for a specific user
router.get(
  "/public-submissions/:userId",
  async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;

      console.log("Getting public submissions for user:", userId);

      // Map user ID - try both the original and _001 suffix version
      const possibleUserIds = [userId, `${userId}_001`];

      // First get from simple_submissions (unprocessed ones)
      const simpleQuery = `
        SELECT 
          id,
          user_id as "userId",
          title,
          description,
          type,
          condition,
          photos,
          estimated_value as "estimatedValue",
          status,
          created_at as "createdAt",
          NULL as "adminFeedback",
          NULL as "adminValuation",
          NULL as "offerAmount",
          NULL as "negotiationStatus",
          NULL as "userResponse",
          NULL as "shippingInstructions",
          NULL as "bankTransferInstructions"
        FROM simple_submissions
        WHERE user_id = ANY($1)
      `;

      // Then get from item_submissions (processed ones with negotiation data)
      const itemQuery = `
        SELECT 
          id,
          user_id as "userId",
          title,
          description,
          type,
          condition,
          photos,
          estimated_value as "estimatedValue",
          status,
          created_at as "createdAt",
          admin_feedback as "adminFeedback",
          admin_valuation as "adminValuation",
          offer_amount as "offerAmount",
          negotiation_status as "negotiationStatus",
          user_response as "userResponse",
          shipping_instructions as "shippingInstructions",
          bank_transfer_instructions as "bankTransferInstructions"
        FROM item_submissions
        WHERE user_id = ANY($1)
      `;

      const [simpleResult, itemResult] = await Promise.all([
        pool.query(simpleQuery, [possibleUserIds]),
        pool.query(itemQuery, [possibleUserIds])
      ]);

      // Combine results from both tables
      const allSubmissions = [...simpleResult.rows, ...itemResult.rows];
      allSubmissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      console.log(
        `Found ${allSubmissions.length} total submissions for user ${userId} (${simpleResult.rows.length} unprocessed, ${itemResult.rows.length} processed)`,
      );

      // Transform photos to proper JSON array if needed
      const submissions = allSubmissions.map((row) => ({
        ...row,
        photos:
          typeof row.photos === "string"
            ? JSON.parse(row.photos)
            : Array.isArray(row.photos)
              ? row.photos
              : [],
      }));

      res.json(submissions);
    } catch (error) {
      console.error("Error getting public submissions:", error);
      res.status(500).json({ message: "Error retrieving submissions" });
    }
  },
);

// Create a new submission - reliable and simple method
router.post("/simple-submissions", async (req: Request, res: Response) => {
  try {
    console.log("Simple submission received:", req.body);

    // Validate inputs
    const {
      userId,
      title,
      description,
      type,
      condition = "",
      photos = [],
      estimatedValue = "",
    } = req.body;

    if (!userId || !title || !description || !type) {
      console.log("Missing required fields:", {
        userId,
        title,
        description,
        type,
      });
      return res.status(400).json({
        success: false,
        message: "Missing required fields for submission",
      });
    }

    console.log("Processing submission with data:", { userId, title, type });

    // Create table if it doesn't exist
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS simple_submissions (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          type TEXT NOT NULL,
          condition TEXT DEFAULT '',
          photos JSONB DEFAULT '[]'::jsonb,
          estimated_value TEXT DEFAULT '',
          status TEXT DEFAULT 'pending',
          admin_feedback TEXT DEFAULT NULL,
          admin_valuation TEXT DEFAULT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log("Table simple_submissions exists or was created");
    } catch (error) {
      console.error("Error creating table, but will try to continue:", error);
    }

    // Format photos array to JSON
    let photosJson = "[]";
    try {
      if (Array.isArray(photos)) {
        photosJson = JSON.stringify(photos);
      } else if (typeof photos === "string") {
        try {
          JSON.parse(photos); // Test if valid JSON
          photosJson = photos;
        } catch (e) {
          photosJson = JSON.stringify([photos]);
        }
      }
    } catch (error) {
      console.error("Error formatting photos, using empty array:", error);
    }

    // Execute direct insert
    try {
      const result = await pool.query(
        `
        INSERT INTO simple_submissions
        (user_id, title, description, type, condition, photos, estimated_value, status)
        VALUES
        ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)
        RETURNING id
      `,
        [
          userId,
          title,
          description,
          type,
          condition || "",
          photosJson,
          estimatedValue || "",
          "pending",
        ],
      );

      console.log("Submission created successfully:", result.rows[0]);

      // Send success response without JSON
      res.status(200).send();
    } catch (error) {
      console.error("Error inserting submission, trying fallback:", error);

      // Fallback to simpler query if the first one fails
      try {
        const fallbackResult = await pool.query(
          `
          INSERT INTO simple_submissions (user_id, title, description, type) 
          VALUES ($1, $2, $3, $4) 
          RETURNING id
        `,
          [userId, title, description, type],
        );

        console.log("Fallback submission succeeded:", fallbackResult.rows[0]);
        res.status(200).send();
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        res.status(500).send();
      }
    }
  } catch (error) {
    console.error("Error in submission endpoint:", error);
    res.status(500).send();
  }
});

// Get a specific submission by ID
router.get("/submissions/:id", async (req: Request, res: Response) => {
  try {
    const submissionId = req.params.id;
    const userId = req.query.userId as string;

    if (!submissionId) {
      return res.status(400).json({
        success: false,
        message: "Missing submission ID",
      });
    }

    console.log(
      `Getting submission ${submissionId}${userId ? ` for user ${userId}` : ""}`,
    );

    // If userId is provided, limit to that user's submissions
    let query = `
      SELECT 
        id,
        user_id as "userId",
        title,
        description,
        type,
        condition,
        photos,
        estimated_value as "estimatedValue",
        status,
        admin_feedback as "adminFeedback",
        admin_valuation as "adminValuation",
        created_at as "createdAt"
      FROM simple_submissions
      WHERE id = $1
    `;

    let queryParams = [submissionId];

    // If userId is provided, add it to the WHERE clause
    if (userId) {
      query += ` AND user_id = $2`;
      queryParams.push(userId);
    }

    const result = await pool.query(query, queryParams);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // Transform photos to proper JSON array if needed
    const submission = {
      ...result.rows[0],
      photos:
        typeof result.rows[0].photos === "string"
          ? JSON.parse(result.rows[0].photos)
          : Array.isArray(result.rows[0].photos)
            ? result.rows[0].photos
            : [],
    };

    res.json(submission);
  } catch (error) {
    console.error("Error getting submission:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving submission",
    });
  }
});

// Update a submission - only the owner can update their pending submission
router.put("/submissions/:id", async (req: Request, res: Response) => {
  try {
    const submissionId = req.params.id;
    const { userId, title, description, type, condition, photos } = req.body;

    // Validate inputs
    if (!submissionId || !userId || !title || !description || !type) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields for update",
      });
    }

    console.log(
      `Attempting to update submission ${submissionId} for user ${userId}`,
    );

    // First verify the submission belongs to this user and is in pending status
    const checkQuery = `
      SELECT id FROM simple_submissions 
      WHERE id = $1 AND user_id = $2 AND status = 'pending'
    `;

    const checkResult = await pool.query(checkQuery, [submissionId, userId]);

    if (checkResult.rowCount === 0) {
      console.log(
        `Submission ${submissionId} not found, doesn't belong to user ${userId}, or is not in pending status`,
      );
      return res.status(403).json({
        success: false,
        message:
          "Not authorized to update this submission or submission is no longer in pending status",
      });
    }

    // Format photos array to JSON
    let photosJson = "[]";
    try {
      if (Array.isArray(photos)) {
        photosJson = JSON.stringify(photos);
      } else if (typeof photos === "string") {
        try {
          JSON.parse(photos); // Test if valid JSON
          photosJson = photos;
        } catch (e) {
          photosJson = JSON.stringify([photos]);
        }
      }
    } catch (error) {
      console.error("Error formatting photos, using empty array:", error);
    }

    // Proceed with update
    const updateQuery = `
      UPDATE simple_submissions
      SET 
        title = $1,
        description = $2,
        type = $3,
        condition = $4,
        photos = $5::jsonb,
        updated_at = NOW()
      WHERE id = $6 AND user_id = $7
      RETURNING id, title
    `;

    const updateResult = await pool.query(updateQuery, [
      title,
      description,
      type,
      condition || "",
      photosJson,
      submissionId,
      userId,
    ]);

    console.log(`Successfully updated submission:`, updateResult.rows[0]);

    res.json({
      success: true,
      message: "Submission updated successfully",
      data: updateResult.rows[0],
    });
  } catch (error) {
    console.error("Error updating submission:", error);
    res.status(500).json({
      success: false,
      message: "Error updating submission",
    });
  }
});

// Delete a submission - only the owner can delete their submission
router.delete("/submissions/:id", async (req: Request, res: Response) => {
  try {
    const submissionId = req.params.id;
    const { userId } = req.body;

    // Validate inputs
    if (!submissionId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters",
      });
    }

    console.log(
      `Attempting to delete submission ${submissionId} for user ${userId}`,
    );

    // First verify the submission belongs to this user
    const checkQuery = `
      SELECT id FROM simple_submissions WHERE id = $1 AND user_id = $2
    `;

    const checkResult = await pool.query(checkQuery, [submissionId, userId]);

    if (checkResult.rowCount === 0) {
      console.log(
        `Submission ${submissionId} not found or doesn't belong to user ${userId}`,
      );
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this submission",
      });
    }

    // Proceed with deletion
    const deleteQuery = `
      DELETE FROM simple_submissions WHERE id = $1 AND user_id = $2
    `;

    await pool.query(deleteQuery, [submissionId, userId]);

    console.log(`Successfully deleted submission ${submissionId}`);

    res.json({
      success: true,
      message: "Submission deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting submission:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting submission",
    });
  }
});

export default router;
