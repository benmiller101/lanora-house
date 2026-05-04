import { Request, Response, Router } from "express";
import { pool } from "./db";
import { sendWinnerNotification } from "./email-service";

const router = Router();
// Mounted at /api/raffles (Prize Draws API)
router.get("/user-raffle-tickets", async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  // disable HTTP caching for this route
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("ETag", "");

  const { rows } = await pool.query(
    `SELECT
       re.id               AS "id",
       re.ticket_numbers    AS "ticketNumbers",
       re.created_at       AS "createdAt",
       r.id                AS "raffleId",
       r.name              AS "raffleName",
       r.end_date          AS "raffleEndDate"
     FROM raffle_entries re
     JOIN raffles r ON r.id = re.raffle_id
     WHERE re.user_id = $1`,
    [userId],
  );
  res.json(rows);
});

// GET all active prize draws (root route for /api/raffles)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { search, status, limit } = req.query;
    
    // Build dynamic WHERE conditions
    let whereConditions = [
      "r.status = 'active'",
      "r.end_date > NOW()",
      "r.status != 'completed'",
      "r.status != 'ended'"
    ];
    
    const queryParams: any[] = [];
    let paramIndex = 1;
    
    // Add search functionality
    if (search && typeof search === 'string' && search.trim()) {
      whereConditions.push(`(
        LOWER(r.name) LIKE LOWER($${paramIndex}) OR 
        LOWER(r.description) LIKE LOWER($${paramIndex}) OR 
        LOWER(r.item_description) LIKE LOWER($${paramIndex})
      )`);
      queryParams.push(`%${search.trim()}%`);
      paramIndex++;
    }
    
    // Add status filter if provided
    if (status && typeof status === 'string' && status !== 'all') {
      whereConditions.push(`r.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }
    
    const query = `
      SELECT r.*, 
             COALESCE(COUNT(re.id), 0) as sold_tickets
      FROM raffles r
      LEFT JOIN raffle_entries re ON r.id = re.raffle_id
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY r.id
      ORDER BY r.end_date ASC
      ${limit ? `LIMIT ${parseInt(limit as string)}` : ''}
    `;

    const result = await pool.query(query, queryParams);

    // Transform the data using the formatRaffleResponse function
    const activeRaffles = result.rows.map((raffle) =>
      formatRaffleResponse(raffle),
    );

    res.json(activeRaffles);
  } catch (error) {
    console.error("Error fetching active raffles:", error);
    res.status(500).json({ message: "Failed to fetch active raffles" });
  }
});

// POST (create) a new raffle
router.post("/", async (req: Request, res: Response) => {
  try {
    // Start a transaction to ensure all operations succeed or fail together
    await pool.query("BEGIN");

    try {
      const {
        name,
        description,
        itemDescription,
        retailPrice,
        ticketPrice,
        startDate,
        startTime,
        endDate,
        endTime,
        maxTickets,
        status,
        imageUrl,
        additionalImages,
        instantWinEnabled,
        instantWinTitle,
        instantWinPrizes,
      } = req.body;

      console.log(
        "Creating new raffle with data:",
        JSON.stringify(req.body, null, 2),
      );

      // Format the dates properly
      let formattedStartDate = null;
      let formattedEndDate = null;

      if (startDate) {
        const time = startTime || "00:00";
        formattedStartDate = new Date(`${startDate}T${time}`);
      }

      if (endDate) {
        const time = endTime || "23:59";
        formattedEndDate = new Date(`${endDate}T${time}`);
      }

      // Create the new raffle
      const createRaffleQuery = `
        INSERT INTO raffles (
          name,
          description,
          excerpt,
          item_description,
          retail_price,
          ticket_price,
          start_date,
          end_date,
          max_tickets,
          status,
          image_url,
          additional_images,
          instant_win_enabled,
          instant_win_title,
          is_featured,
          social_sharing_enabled,
          social_sharing_rewards
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id
      `;

      const values = [
        name,
        description || "",
        req.body.excerpt || "",
        itemDescription || "",
        retailPrice || "0",
        ticketPrice || "0",
        formattedStartDate,
        formattedEndDate,
        maxTickets || "0",
        "active",
        imageUrl || "",
        additionalImages || [],
        instantWinEnabled || false,
        instantWinTitle || "COSMIC CASH",
        req.body.isFeatured || false,
        req.body.socialSharingEnabled || false,
        JSON.stringify(req.body.socialSharingRewards || [])
      ];

      const result = await pool.query(createRaffleQuery, values);
      const newRaffleId = result.rows[0].id;

      // If instant win is enabled, add the prizes
      if (instantWinEnabled) {
        // Ensure we have a valid prize array even if none was provided
        let prizeArray = [];

        if (
          instantWinPrizes &&
          Array.isArray(instantWinPrizes) &&
          instantWinPrizes.length > 0
        ) {
          prizeArray = instantWinPrizes;
        } else {
          // Default prize if none specified but instant win is enabled
          prizeArray = [{ type: "cash", count: 5, amount: 10 }];
        }

        const prizesJson = JSON.stringify(prizeArray);
        console.log("Saving instant win prizes:", prizesJson);

        const updatePrizesQuery = `
          UPDATE raffles
          SET instant_win_prizes = $1,
              instant_win_count = $2
          WHERE id = $3
        `;

        // Calculate total instant win count from all prize configurations
        const totalCount = prizeArray.reduce(
          (sum, prize) => sum + (prize.count || 0),
          0,
        );

        await pool.query(updatePrizesQuery, [
          prizesJson,
          totalCount,
          newRaffleId,
        ]);
      }

      // Commit the transaction
      await pool.query("COMMIT");

      // Fetch the created raffle for response
      const createdRaffle = await pool.query(
        `SELECT * FROM raffles WHERE id = $1`,
        [newRaffleId],
      );

      res.status(201).json({
        message: "Raffle created successfully",
        raffle: createdRaffle.rows[0],
      });
    } catch (error) {
      // If there's an error, roll back the transaction
      await pool.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error creating raffle:", error);
    res.status(500).json({ message: "Error creating raffle" });
  }
});

// PATCH (update) a raffle
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const raffleId = req.params.id;
    const updateData = req.body;

    console.log("Updating raffle with ID:", raffleId);
    console.log("Update data received:", JSON.stringify(updateData, null, 2));

    // Start a transaction to ensure all operations succeed or fail together
    await pool.query("BEGIN");

    try {
      // Check if this is just a featured status update
      if (Object.keys(updateData).length === 1 && "isFeatured" in updateData) {
        // Simple update for just the featured status
        const updateFeaturedQuery = `
          UPDATE raffles
          SET is_featured = $1
          WHERE id = $2
          RETURNING *
        `;

        const updateResult = await pool.query(updateFeaturedQuery, [
          updateData.isFeatured,
          raffleId,
        ]);

        if (updateResult.rows.length === 0) {
          await pool.query("ROLLBACK");
          return res.status(404).json({ message: "Raffle not found" });
        }

        // Commit the transaction
        await pool.query("COMMIT");

        // Fetch the updated raffle for response
        const getUpdatedQuery = `SELECT * FROM raffles WHERE id = $1`;
        const updatedResult = await pool.query(getUpdatedQuery, [raffleId]);

        return res.json({
          message: "Raffle featured status updated successfully",
          raffle: updatedResult.rows[0],
        });
      }

      // Check if this is just a status update (for force end)
      if (Object.keys(updateData).length === 1 && "status" in updateData) {
        // Simple update for just the status
        const updateStatusQuery = `
          UPDATE raffles
          SET status = $1
          WHERE id = $2
          RETURNING *
        `;

        const updateResult = await pool.query(updateStatusQuery, [
          updateData.status,
          raffleId,
        ]);

        if (updateResult.rows.length === 0) {
          await pool.query("ROLLBACK");
          return res.status(404).json({ message: "Raffle not found" });
        }

        // Commit the transaction
        await pool.query("COMMIT");

        // Fetch the updated raffle for response
        const getUpdatedQuery = `SELECT * FROM raffles WHERE id = $1`;
        const updatedResult = await pool.query(getUpdatedQuery, [raffleId]);

        return res.json({
          message: "Raffle status updated successfully",
          raffle: updatedResult.rows[0],
        });
      }

      // Build dynamic update query based on provided fields
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      if (updateData.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        updateValues.push(updateData.name);
      }

      if (updateData.description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        updateValues.push(updateData.description);
      }

      if (updateData.excerpt !== undefined) {
        updateFields.push(`excerpt = $${paramIndex++}`);
        updateValues.push(updateData.excerpt);
      }

      if (updateData.itemDescription !== undefined) {
        updateFields.push(`item_description = $${paramIndex++}`);
        updateValues.push(updateData.itemDescription);
      }

      if (updateData.ticketPrice !== undefined) {
        updateFields.push(`ticket_price = $${paramIndex++}`);
        updateValues.push(updateData.ticketPrice);
      }

      if (updateData.startDate) {
        const startTime = updateData.startTime || "00:00";
        const startDate = new Date(`${updateData.startDate}T${startTime}`);
        updateFields.push(`start_date = $${paramIndex++}`);
        updateValues.push(startDate);
      }

      if (updateData.endDate) {
        const endTime = updateData.endTime || "23:59";
        const endDate = new Date(`${updateData.endDate}T${endTime}`);
        updateFields.push(`end_date = $${paramIndex++}`);
        updateValues.push(endDate);
      }

      if (updateData.maxTickets !== undefined) {
        updateFields.push(`max_tickets = $${paramIndex++}`);
        updateValues.push(updateData.maxTickets);
      }

      if (updateData.status !== undefined) {
        updateFields.push(`status = $${paramIndex++}`);
        updateValues.push(updateData.status);
      }

      if (updateData.imageUrl !== undefined) {
        updateFields.push(`image_url = $${paramIndex++}`);
        updateValues.push(updateData.imageUrl);
      }

      if (updateData.additionalImages !== undefined) {
        updateFields.push(`additional_images = $${paramIndex++}`);
        updateValues.push(updateData.additionalImages);
      }

      if (updateData.instantWinEnabled !== undefined) {
        updateFields.push(`instant_win_enabled = $${paramIndex++}`);
        updateValues.push(updateData.instantWinEnabled);
      }

      if (updateData.instantWinTitle !== undefined) {
        updateFields.push(`instant_win_title = $${paramIndex++}`);
        updateValues.push(updateData.instantWinTitle);
      }

      if (updateData.isFeatured !== undefined) {
        updateFields.push(`is_featured = $${paramIndex++}`);
        updateValues.push(updateData.isFeatured);
      }

      if (updateFields.length === 0) {
        await pool.query("ROLLBACK");
        return res.status(400).json({ message: "No valid fields to update" });
      }

      // Add raffleId as the final parameter
      updateValues.push(raffleId);

      const updateRaffleQuery = `
        UPDATE raffles
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const updateResult = await pool.query(updateRaffleQuery, updateValues);

      if (updateResult.rows.length === 0) {
        await pool.query("ROLLBACK");
        return res.status(404).json({ message: "Raffle not found" });
      }

      // 2. Now handle the prizes
      // If instant win is enabled, update the prizes configuration
      if (updateData.instantWinEnabled) {
        // Ensure we have a valid prize array
        let prizeArray = [];

        if (
          updateData.instantWinPrizes &&
          Array.isArray(updateData.instantWinPrizes) &&
          updateData.instantWinPrizes.length > 0
        ) {
          prizeArray = updateData.instantWinPrizes;
        } else if (typeof updateData.instantWinPrizes === "string") {
          try {
            prizeArray = JSON.parse(updateData.instantWinPrizes);
          } catch (error) {
            console.error("Error parsing instant win prizes:", error);
            // Fallback to default prizes
            prizeArray = [{ type: "cash", count: 5, amount: 10 }];
          }
        } else {
          // Default prize if none provided but enabled
          prizeArray = [{ type: "cash", count: 5, amount: 10 }];
        }

        console.log("Saving instant win prizes:", prizeArray);

        const prizesJson = JSON.stringify(prizeArray);

        // Calculate total count from all prize configurations
        const totalCount = prizeArray.reduce(
          (sum, prize) => sum + (Number(prize.count) || 0),
          0,
        );

        const updatePrizesQuery = `
          UPDATE raffles
          SET instant_win_prizes = $1,
              instant_win_count = $2
          WHERE id = $3
        `;

        await pool.query(updatePrizesQuery, [prizesJson, totalCount, raffleId]);
      }
      // If instant win is disabled, clear the prizes
      else if (updateData.instantWinEnabled === false) {
        const clearPrizesQuery = `
          UPDATE raffles
          SET instant_win_prizes = NULL,
              instant_win_count = 0
          WHERE id = $1
        `;

        await pool.query(clearPrizesQuery, [raffleId]);
      }

      // Commit the transaction
      await pool.query("COMMIT");

      // Fetch the updated raffle for response
      const getUpdatedQuery = `SELECT * FROM raffles WHERE id = $1`;
      const updatedResult = await pool.query(getUpdatedQuery, [raffleId]);

      res.json({
        message: "Raffle updated successfully",
        raffle: updatedResult.rows[0],
      });
    } catch (error) {
      // If there's an error, roll back the transaction
      await pool.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error updating raffle:", error);
    res.status(500).json({ message: "Error updating raffle" });
  }
});

// DELETE a raffle
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const raffleId = req.params.id;

    console.log(`Attempting to delete raffle ID: ${raffleId}`);

    // First check if the raffle exists
    const checkQuery = `SELECT id FROM raffles WHERE id = $1`;
    const checkResult = await pool.query(checkQuery, [raffleId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Raffle not found" });
    }

    // Delete all related data in the correct order to avoid foreign key constraints
    try {
      // 1. Delete instant wins
      await pool.query(`DELETE FROM instant_wins WHERE raffle_id = $1`, [raffleId]);
      console.log(`Deleted instant wins for raffle ID: ${raffleId}`);
      
      // 2. Delete cart items that reference this raffle
      await pool.query(`DELETE FROM cart_items WHERE raffle_id = $1`, [raffleId]);
      console.log(`Deleted cart items for raffle ID: ${raffleId}`);
      
      // 3. Delete raffle entries
      await pool.query(`DELETE FROM raffle_entries WHERE raffle_id = $1`, [raffleId]);
      console.log(`Deleted entries for raffle ID: ${raffleId}`);
      
      // 4. Delete order items that reference this raffle
      await pool.query(`DELETE FROM order_items WHERE raffle_id = $1`, [raffleId]);
      console.log(`Deleted order items for raffle ID: ${raffleId}`);
      
      // 5. Delete instant win prizes (if table exists)
      try {
        await pool.query(`DELETE FROM instant_win_prizes WHERE raffle_id = $1`, [raffleId]);
        console.log(`Deleted instant win prizes for raffle ID: ${raffleId}`);
      } catch (prizesError) {
        // Table might not exist, continue
        console.log(`No instant win prizes table or no data for raffle ID: ${raffleId}`);
      }
    } catch (relatedDataError) {
      console.error("Error deleting related data:", relatedDataError);
      return res.status(500).json({ message: "Error deleting raffle related data" });
    }

    // Now delete the raffle itself
    const deleteQuery = `DELETE FROM raffles WHERE id = $1 RETURNING *`;
    const result = await pool.query(deleteQuery, [raffleId]);

    console.log(`Successfully deleted raffle ID: ${raffleId}`);
    res.json({ message: "Raffle deleted successfully" });
  } catch (error) {
    console.error("Error deleting raffle:", error);
    res.status(500).json({ message: "Error deleting raffle" });
  }
});

// Default instant win configuration (when raffle doesn't have specific settings)
const DEFAULT_INSTANT_WIN_MODULO = 50; // Tickets with numbers divisible by this value win
const DEFAULT_INSTANT_WIN_AMOUNT = 5; // Default amount won per winning ticket (in £)

// Helper function to format raffle data consistently with instant win prizes
function formatRaffleResponse(raffle, winner = null) {
  // Parse the instant win prizes if they exist
  let instantWinPrizes = null;
  if (raffle.instant_win_prizes) {
    try {
      // Check if it's already an object (from a direct DB query) or a string that needs parsing
      if (typeof raffle.instant_win_prizes === "string") {
        instantWinPrizes = JSON.parse(raffle.instant_win_prizes);
      } else {
        // It's already an object, use it directly
        instantWinPrizes = raffle.instant_win_prizes;
      }
      console.log(
        "Processed instant win prizes for raffle ID",
        raffle.id,
        ":",
        instantWinPrizes,
      );
    } catch (error) {
      console.error(
        "Error processing instant win prizes for raffle ID",
        raffle.id,
        ":",
        error,
      );
    }
  }

  // Format winner information if available
  let winnerInfo = null;
  if (winner && raffle.winner_id) {
    winnerInfo = {
      id: winner.id,
      name: winner.first_name ? `${winner.first_name} ${winner.last_name || ''}`.trim() : winner.email,
      ticketNumber: raffle.winning_ticket_number
    };
  }

  // Determine actual status based on current time and dates
  let actualStatus = raffle.status || "upcoming";
  const now = new Date();
  const startDate = raffle.start_date ? new Date(raffle.start_date) : null;
  const endDate = raffle.end_date ? new Date(raffle.end_date) : null;

  // Only override status if it's not manually set to completed/ended
  if (actualStatus !== "completed" && actualStatus !== "ended") {
    if (endDate && now > endDate) {
      actualStatus = "ended";
    } else if (startDate && now >= startDate && endDate && now <= endDate) {
      actualStatus = "active";
    } else if (startDate && now < startDate) {
      actualStatus = "upcoming";
    }
  }

  return {
    id: raffle.id.toString(),
    name: raffle.name,
    description: raffle.description || "",
    itemDescription: raffle.item_description || "",
    retailPrice: raffle.retail_price ? raffle.retail_price.toString() : "0",
    ticketPrice: raffle.ticket_price ? raffle.ticket_price.toString() : "0",
    startDate: raffle.start_date
      ? new Date(raffle.start_date).toISOString()
      : "",
    endDate: raffle.end_date ? new Date(raffle.end_date).toISOString() : "",
    endTime: raffle.end_time || "",
    maxTickets: raffle.max_tickets || 0,
    ticketsSold: raffle.tickets_sold || 0,
    status: actualStatus,
    ticketLimit: raffle.max_tickets || 0,
    imageUrl: raffle.image_url || "",
    additionalImages: raffle.additional_images || [],
    createdAt: raffle.created_at,
    updatedAt: raffle.updated_at,
    winnerId: raffle.winner_id,
    winningTicketNumber: raffle.winning_ticket_number,
    winner: winnerInfo,
    instantWinEnabled: raffle.instant_win_enabled || false,
    instantWinTitle: raffle.instant_win_title || "",
    instantWinCount: raffle.instant_win_count || 0,
    instantWinPrizes: instantWinPrizes,
    isFeatured: raffle.is_featured || false,
    socialSharingEnabled: raffle.social_sharing_enabled || false,
    socialSharingRewards: raffle.social_sharing_rewards || [],
  };
}

// Get a single raffle by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const raffleId = req.params.id;

    // If the ID is one of the special IDs (admin, all, featured, upcoming, active, past)
    // handle it differently
    if (raffleId === "admin") {
      // Return all raffles for admin
      const query = `
        SELECT 
          r.*, 
          COUNT(re.id) as entry_count
        FROM raffles r
        LEFT JOIN raffle_entries re ON r.id = re.raffle_id
        GROUP BY r.id
        ORDER BY r.created_at DESC
      `;
      const result = await pool.query(query);

      // Transform the data to match the expected format
      const raffles = result.rows.map((raffle) => formatRaffleResponse(raffle));

      return res.json(raffles);
    } else if (raffleId === "all") {
      // Return all active and upcoming raffles
      const query = `
        SELECT * FROM raffles 
        WHERE status IN ('active', 'upcoming')
        ORDER BY start_date ASC
      `;
      const result = await pool.query(query);

      // Transform the data to match the expected format
      const raffles = result.rows.map((raffle) => formatRaffleResponse(raffle));

      return res.json(raffles);
    } else if (raffleId === "featured") {
      // Return featured raffles, prioritizing active ones and checking if they haven't ended
      const featuredQuery = `
        SELECT * FROM raffles 
        WHERE is_featured = true 
          AND status IN ('active', 'upcoming') 
          AND end_date > NOW()
        ORDER BY 
          CASE WHEN status = 'active' THEN 1 ELSE 2 END,
          start_date ASC
        LIMIT 1
      `;

      const featuredResult = await pool.query(featuredQuery);
      
      console.log("Featured raffle raw data:", featuredResult.rows[0]);

      // If no active featured raffle exists, get the next best active raffle
      if (featuredResult.rows.length === 0) {
        const fallbackQuery = `
          SELECT * FROM raffles 
          WHERE status = 'active' 
            AND end_date > NOW()
          ORDER BY start_date ASC
          LIMIT 1
        `;

        const fallbackResult = await pool.query(fallbackQuery);

        // Transform the data to match the expected format
        if (fallbackResult.rows.length > 0) {
          return res.json(formatRaffleResponse(fallbackResult.rows[0]));
        } else {
          // No active raffles available, return null to hide the section
          return res.json(null);
        }
      }

      // We have a featured raffle, return it
      return res.json(formatRaffleResponse(featuredResult.rows[0]));
    } else if (raffleId === "upcoming") {
      // Return upcoming raffles
      const query = `
        SELECT * FROM raffles 
        WHERE (status = 'upcoming' OR (status = 'active' AND start_date > NOW()))
        ORDER BY start_date ASC
      `;
      const result = await pool.query(query);

      // Transform the data to match the expected format
      const raffles = result.rows.map((raffle) => formatRaffleResponse(raffle));

      return res.json(raffles);
    } else if (raffleId === "active") {
      // Return active raffles (include both active and upcoming for display)
      const query = `
        SELECT * FROM raffles 
        WHERE status IN ('active', 'upcoming') AND end_date > NOW()
        ORDER BY end_date ASC
      `;
      const result = await pool.query(query);

      // Transform the data to match the expected format
      const raffles = result.rows.map((raffle) => formatRaffleResponse(raffle));

      return res.json(raffles);
    } else if (raffleId === "past") {
      // Return past raffles (completed, ended, or expired)
      const query = `
        SELECT r.*, 
               COALESCE(COUNT(re.id), 0) as sold_tickets
        FROM raffles r
        LEFT JOIN raffle_entries re ON r.id = re.raffle_id
        WHERE (r.status IN ('completed', 'ended') OR r.end_date < NOW())
        GROUP BY r.id
        ORDER BY r.end_date DESC
      `;
      const result = await pool.query(query);

      // Transform the data to match the expected format
      const raffles = result.rows.map((raffle) => formatRaffleResponse(raffle));

      return res.json(raffles);
    }

    // Otherwise, get the specific raffle by ID
    const query = `
      SELECT 
        r.*,
        COUNT(re.id) as entry_count
      FROM raffles r
      LEFT JOIN raffle_entries re ON r.id = re.raffle_id
      WHERE r.id = $1
      GROUP BY r.id
    `;
    const result = await pool.query(query, [raffleId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Raffle not found" });
    }

    const raffle = result.rows[0];

    // Get the winner if there is one
    let winner = null;
    if (raffle.winner_id) {
      const winnerQuery = `SELECT id, email, first_name, last_name FROM users WHERE id = $1`;
      const winnerResult = await pool.query(winnerQuery, [raffle.winner_id]);
      if (winnerResult.rows.length > 0) {
        winner = winnerResult.rows[0];
      }
    }

    // Parse instant win prizes if they exist
    let instantWinPrizes = null;
    if (raffle.instant_win_prizes) {
      try {
        // Check if it's already an object (PostgreSQL JSON field)
        if (typeof raffle.instant_win_prizes === 'object') {
          instantWinPrizes = raffle.instant_win_prizes;
        } else {
          instantWinPrizes = JSON.parse(raffle.instant_win_prizes);
        }
        console.log("Parsed instant win prizes:", instantWinPrizes);
      } catch (err) {
        console.error("Error parsing instant win prizes:", err);
      }
    }

    // Format the response using our helper function with winner information
    const baseResponse = formatRaffleResponse(raffle, winner);

    // Add additional fields specific to this endpoint
    const formattedRaffle = {
      ...baseResponse,
      ticketsSold: raffle.tickets_sold || 0,
      // Keep legacy fields for backwards compatibility
      instantWinAmount: raffle.instant_win_amount
        ? raffle.instant_win_amount.toString()
        : DEFAULT_INSTANT_WIN_AMOUNT.toString(),
      instantWinNumbers: raffle.instant_win_numbers || [],
      entryCount: parseInt(raffle.entry_count || "0"),
    };

    res.json(formattedRaffle);
  } catch (error) {
    console.error("Error fetching raffle:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get raffle entries for a specific raffle (for spinning wheel)
router.get("/:id/entries", async (req: Request, res: Response) => {
  try {
    const raffleId = req.params.id;
    
    const query = `
      SELECT e.*, u.email, u.first_name, u.last_name 
      FROM raffle_entries e
      JOIN users u ON e.user_id = u.id
      WHERE e.raffle_id = $1
      ORDER BY e.created_at ASC
    `;
    
    const result = await pool.query(query, [raffleId]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching raffle entries:", error);
    res.status(500).json({ message: "Failed to fetch raffle entries" });
  }
});

// Get user's tickets for a specific raffle
router.get("/:id/my-tickets", async (req: any, res: Response) => {
  try {
    const raffleId = req.params.id;
    const userId = req.user?.claims?.sub;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // First verify the raffle exists
    const raffleQuery = `SELECT * FROM raffles WHERE id = $1`;
    const raffleResult = await pool.query(raffleQuery, [raffleId]);

    if (raffleResult.rows.length === 0) {
      return res.status(404).json({ message: "Raffle not found" });
    }

    // Get the user's entries
    const query = `
      SELECT * FROM raffle_entries 
      WHERE raffle_id = $1 AND user_id = $2
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [raffleId, userId]);

    // Format the response
    const formattedTickets = result.rows
      .map((entry) => {
        // Parse ticket numbers - they might be stored as a JSON array string
        let ticketNumbers = [];
        if (Array.isArray(entry.ticket_numbers)) {
          ticketNumbers = entry.ticket_numbers;
        } else if (typeof entry.ticket_numbers === "string") {
          try {
            ticketNumbers = JSON.parse(entry.ticket_numbers);
          } catch (e) {
            console.error("Error parsing ticket numbers:", e);
            ticketNumbers = [];
          }
        }

        // Format each ticket number into a separate ticket object
        return ticketNumbers.map((ticketNumber) => {
          // Check if this ticket is an instant winner
          let isInstantWinner = false;
          const raffle = raffleResult.rows[0];

          if (raffle.instant_win_enabled) {
            // If we have explicit instant win numbers, check against those
            if (
              raffle.instant_win_numbers &&
              Array.isArray(raffle.instant_win_numbers) &&
              raffle.instant_win_numbers.length > 0
            ) {
              isInstantWinner =
                raffle.instant_win_numbers.includes(ticketNumber);
            } else {
              // Otherwise use default rule (numbers divisible by the modulo)
              isInstantWinner = ticketNumber % DEFAULT_INSTANT_WIN_MODULO === 0;
            }
          }

          return {
            id: entry.id,
            raffleId: entry.raffle_id,
            userId: entry.user_id,
            ticketNumber: ticketNumber,
            isInstantWinner: isInstantWinner,
            purchaseDate:
              result.rows[0]?.created_at || new Date().toISOString(),
          };
        });
      })
      .flat(); // Flatten the array of arrays

    res.json(formattedTickets);
  } catch (error) {
    console.error("Error fetching user raffle tickets:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Helper function to check for instant wins
async function checkForInstantWins(
  raffleId: string,
  ticketNumbers: number[],
): Promise<{
  winningTickets: number[];
  prizes: Array<{ type: string; amount: number }>;
}> {
  // Get the raffle
  const raffleQuery = `SELECT * FROM raffles WHERE id = $1`;
  const raffleResult = await pool.query(raffleQuery, [raffleId]);

  if (raffleResult.rows.length === 0) {
    throw new Error("Raffle not found");
  }

  const raffle = raffleResult.rows[0];

  if (!raffle.instant_win_enabled) {
    return { winningTickets: [], prizes: [] };
  }

  let winningTickets: number[] = [];
  let prizes: Array<{ type: string; amount: number }> = [];

  // Parse the instant win prizes
  let instantWinPrizes: Array<{ type: string; count: number; amount: number }> =
    [];
  if (raffle.instant_win_prizes) {
    try {
      instantWinPrizes = JSON.parse(raffle.instant_win_prizes);
    } catch (error) {
      console.error("Error parsing instant win prizes:", error);
    }
  }

  // If we have prize configurations, use them to determine winners
  if (instantWinPrizes && instantWinPrizes.length > 0) {
    // For each ticket, check if it's a winner based on the prize configuration
    for (const ticketNumber of ticketNumbers) {
      // Default rule: if the ticket number is divisible by the modulo, it's a winner
      if (ticketNumber % DEFAULT_INSTANT_WIN_MODULO === 0) {
        winningTickets.push(ticketNumber);

        // Assign a prize type randomly from the available types
        const prizeIndex = Math.floor(Math.random() * instantWinPrizes.length);
        const prize = instantWinPrizes[prizeIndex];

        prizes.push({
          type: prize.type,
          amount: prize.amount,
        });
      }
    }
  } else {
    // Use default rules if no specific configuration
    for (const ticketNumber of ticketNumbers) {
      if (ticketNumber % DEFAULT_INSTANT_WIN_MODULO === 0) {
        winningTickets.push(ticketNumber);
        prizes.push({
          type: "cash",
          amount: DEFAULT_INSTANT_WIN_AMOUNT,
        });
      }
    }
  }

  return { winningTickets, prizes };
}

// Claim instant win prize
router.post("/instant-win/claim", async (req: any, res: Response) => {
  try {
    const { raffleId, ticketNumber } = req.body;
    const userId = req.user?.claims?.sub;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify the user owns this ticket
    const verifyQuery = `
      SELECT * FROM raffle_entries 
      WHERE raffle_id = $1 AND user_id = $2
    `;
    const verifyResult = await pool.query(verifyQuery, [raffleId, userId]);

    if (verifyResult.rows.length === 0) {
      return res
        .status(403)
        .json({ message: "You do not have any tickets for this raffle" });
    }

    // Parse ticket numbers for all entries
    const userTicketNumbers: number[] = [];
    for (const entry of verifyResult.rows) {
      if (entry.ticket_numbers) {
        if (Array.isArray(entry.ticket_numbers)) {
          userTicketNumbers.push(...entry.ticket_numbers);
        } else if (typeof entry.ticket_numbers === "string") {
          try {
            const parsedNumbers = JSON.parse(entry.ticket_numbers);
            if (Array.isArray(parsedNumbers)) {
              userTicketNumbers.push(...parsedNumbers);
            }
          } catch (error) {
            console.error("Error parsing ticket numbers:", error);
          }
        }
      }
    }

    // Verify the user owns this specific ticket number
    if (!userTicketNumbers.includes(Number(ticketNumber))) {
      return res
        .status(403)
        .json({ message: "You do not own this ticket number" });
    }

    // Check if this ticket is a winner
    const { winningTickets, prizes } = await checkForInstantWins(raffleId, [
      Number(ticketNumber),
    ]);

    if (winningTickets.length === 0) {
      return res.status(400).json({ message: "This ticket is not a winner" });
    }

    // Mark the ticket as claimed
    // TODO: Update this with proper claim tracking

    res.json({
      success: true,
      prize: prizes[0],
    });
  } catch (error) {
    console.error("Error claiming instant win prize:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get instant winners for a raffle
router.get("/:id/instant-winners", async (req: Request, res: Response) => {
  try {
    const raffleId = req.params.id;

    // Get all entries for this raffle
    const entriesQuery = `
      SELECT e.*, u.first_name, u.last_name, u.email 
      FROM raffle_entries e
      JOIN users u ON e.user_id = u.id
      WHERE e.raffle_id = $1
    `;
    const entriesResult = await pool.query(entriesQuery, [raffleId]);

    // Get the raffle details
    const raffleQuery = `SELECT * FROM raffles WHERE id = $1`;
    const raffleResult = await pool.query(raffleQuery, [raffleId]);

    if (raffleResult.rows.length === 0) {
      return res.status(404).json({ message: "Raffle not found" });
    }

    const raffle = raffleResult.rows[0];

    if (!raffle.instant_win_enabled) {
      return res.json({ winners: [] });
    }

    // Track which ticket numbers we've already included
    const displayNumbers = new Set();
    const existingWinners: any[] = [];

    // Process each entry to find winning tickets
    for (const entry of entriesResult.rows) {
      let ticketNumbers: number[] = [];

      // Parse ticket numbers
      if (entry.ticket_numbers) {
        if (Array.isArray(entry.ticket_numbers)) {
          ticketNumbers = entry.ticket_numbers;
        } else if (typeof entry.ticket_numbers === "string") {
          try {
            ticketNumbers = JSON.parse(entry.ticket_numbers);
          } catch (error) {
            console.error("Error parsing ticket numbers:", error);
            continue;
          }
        }
      }

      // For each ticket, check if it's a winner
      for (const ticketNumber of ticketNumbers) {
        if (ticketNumber % DEFAULT_INSTANT_WIN_MODULO === 0) {
          existingWinners.push({
            id: entry.user_id,
            name: `${entry.first_name || 'User'} ${entry.last_name ? entry.last_name.charAt(0) + '.' : ''}`, // Show first name and last initial only
            ticketNumber: ticketNumber,
          });
        }
      }
    }

    // Random order for winners display
    const shuffledWinners = [...existingWinners].sort(
      () => Math.random() - 0.5,
    );

    // Ensure we only show each ticket number once
    existingWinners.forEach((winner) => {
      displayNumbers.add(winner.ticketNumber);
    });

    // Limit to 20 winners for display
    const ticketsToDisplay = shuffledWinners.slice(0, 20).map((winner) => {
      return {
        id: winner.id,
        name: winner.name,
        ticketNumber: winner.ticketNumber,
      };
    });

    res.json({
      winners: ticketsToDisplay,
    });
  } catch (error) {
    console.error("Error fetching instant winners:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST route to completely restart/reset a raffle
router.post("/:id/restart", async (req: Request, res: Response) => {
  try {
    const raffleId = req.params.id;
    
    console.log(`Restarting raffle with ID: ${raffleId}`);
    
    // Start a transaction to ensure all operations succeed or fail together
    await pool.query("BEGIN");
    
    try {
      // 1. Delete all raffle entries for this raffle
      const deleteEntriesQuery = `DELETE FROM raffle_entries WHERE raffle_id = $1`;
      await pool.query(deleteEntriesQuery, [raffleId]);
      
      // 2. Delete all instant win records for this raffle
      const deleteInstantWinsQuery = `DELETE FROM instant_wins WHERE raffle_id = $1`;
      await pool.query(deleteInstantWinsQuery, [raffleId]);
      
      // 3. Reset raffle data to original state
      const resetRaffleQuery = `
        UPDATE raffles 
        SET 
          tickets_sold = 0,
          status = 'active',
          winner_id = NULL,
          winning_ticket_number = NULL,
          instant_win_numbers = NULL
        WHERE id = $1
        RETURNING *
      `;
      
      const resetResult = await pool.query(resetRaffleQuery, [raffleId]);
      
      if (resetResult.rows.length === 0) {
        await pool.query("ROLLBACK");
        return res.status(404).json({ message: "Raffle not found" });
      }
      
      // Commit the transaction
      await pool.query("COMMIT");
      
      console.log(`Raffle ${raffleId} has been completely reset`);
      
      res.json({
        success: true,
        message: "Raffle has been completely reset and restarted",
        raffle: resetResult.rows[0]
      });
      
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    }
    
  } catch (error) {
    console.error("Error restarting raffle:", error);
    res.status(500).json({ message: "Failed to restart raffle" });
  }
});

// POST route to force complete a raffle by selecting a random winner
router.post("/:id/force-complete", async (req: Request, res: Response) => {
  try {
    const raffleId = req.params.id;
    
    console.log(`Force completing raffle with ID: ${raffleId}`);
    
    // Start a transaction to ensure all operations succeed or fail together
    await pool.query("BEGIN");
    
    try {
      // 1. Get all raffle entries for this raffle
      const entriesQuery = `
        SELECT e.*, u.email, u.first_name, u.last_name 
        FROM raffle_entries e
        JOIN users u ON e.user_id = u.id
        WHERE e.raffle_id = $1
      `;
      const entriesResult = await pool.query(entriesQuery, [raffleId]);
      
      if (entriesResult.rows.length === 0) {
        await pool.query("ROLLBACK");
        return res.status(400).json({ message: "Cannot complete raffle: No entries found" });
      }
      
      // 2. Collect all ticket numbers from all entries
      let allTicketNumbers: { ticketNumber: number; userId: string; userEmail: string; userName: string }[] = [];
      
      for (const entry of entriesResult.rows) {
        let ticketNumbers: number[] = [];
        
        // Parse ticket numbers
        if (entry.ticket_numbers) {
          if (Array.isArray(entry.ticket_numbers)) {
            ticketNumbers = entry.ticket_numbers;
          } else if (typeof entry.ticket_numbers === "string") {
            try {
              ticketNumbers = JSON.parse(entry.ticket_numbers);
            } catch (error) {
              console.error("Error parsing ticket numbers:", error);
              continue;
            }
          }
        }
        
        // Add each ticket to the pool
        for (const ticketNumber of ticketNumbers) {
          allTicketNumbers.push({
            ticketNumber: ticketNumber,
            userId: entry.user_id,
            userEmail: entry.email,
            userName: `${entry.first_name} ${entry.last_name}`
          });
        }
      }
      
      if (allTicketNumbers.length === 0) {
        await pool.query("ROLLBACK");
        return res.status(400).json({ message: "Cannot complete raffle: No valid tickets found" });
      }
      
      // 3. Randomly select a winning ticket
      const randomIndex = Math.floor(Math.random() * allTicketNumbers.length);
      const winningTicket = allTicketNumbers[randomIndex];
      
      // 4. Update the raffle with the winner information
      const updateRaffleQuery = `
        UPDATE raffles 
        SET 
          status = 'completed',
          winner_id = $1,
          winning_ticket_number = $2
        WHERE id = $3
        RETURNING *
      `;
      
      const updateResult = await pool.query(updateRaffleQuery, [
        winningTicket.userId,
        winningTicket.ticketNumber,
        raffleId
      ]);
      
      if (updateResult.rows.length === 0) {
        await pool.query("ROLLBACK");
        return res.status(404).json({ message: "Raffle not found" });
      }
      
      // Commit the transaction
      await pool.query("COMMIT");
      
      console.log(`Raffle ${raffleId} has been completed. Winner: ${winningTicket.userName} (Ticket #${winningTicket.ticketNumber})`);
      
      // Get raffle details for email notification
      const raffleDetails = updateResult.rows[0];
      
      // Send winner notification email
      const emailSent = await sendWinnerNotification({
        winnerEmail: winningTicket.userEmail,
        winnerName: winningTicket.userName,
        raffleName: raffleDetails.name,
        raffleDescription: raffleDetails.item_description || raffleDetails.description,
        winningTicketNumber: winningTicket.ticketNumber,
        prizeDetails: `${raffleDetails.name} - Retail Value: £${raffleDetails.retail_price}`
      });
      
      if (emailSent) {
        console.log(`✅ Winner notification email sent to ${winningTicket.userEmail}`);
      } else {
        console.log(`⚠️ Failed to send winner notification email to ${winningTicket.userEmail}`);
      }
      
      res.json({
        success: true,
        message: "Raffle has been completed with a winner selected",
        raffle: updateResult.rows[0],
        winner: {
          userId: winningTicket.userId,
          userEmail: winningTicket.userEmail,
          userName: winningTicket.userName,
          winningTicketNumber: winningTicket.ticketNumber
        },
        emailSent: emailSent
      });
      
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    }
    
  } catch (error) {
    console.error("Error force completing raffle:", error);
    res.status(500).json({ message: "Failed to complete raffle" });
  }
});

// Select winner for completed raffle
router.post("/:id/select-winner", async (req: Request, res: Response) => {
  try {
    const raffleId = req.params.id;
    
    // First check if raffle exists and has ended
    const raffleQuery = `SELECT * FROM raffles WHERE id = $1`;
    const raffleResult = await pool.query(raffleQuery, [raffleId]);
    
    if (raffleResult.rows.length === 0) {
      return res.status(404).json({ message: "Raffle not found" });
    }
    
    const raffle = raffleResult.rows[0];
    
    // Check if raffle has ended
    if (new Date(raffle.end_date) > new Date()) {
      return res.status(400).json({ message: "Raffle has not ended yet" });
    }
    
    // Check if winner already selected
    if (raffle.winner_id) {
      return res.status(400).json({ message: "Winner already selected" });
    }
    
    // Get all entries for this raffle
    const entriesQuery = `
      SELECT e.*, u.first_name, u.last_name, u.email 
      FROM raffle_entries e
      JOIN users u ON e.user_id = u.id
      WHERE e.raffle_id = $1
      ORDER BY e.created_at ASC
    `;
    const entriesResult = await pool.query(entriesQuery, [raffleId]);
    
    if (entriesResult.rows.length === 0) {
      return res.status(400).json({ message: "No entries found for this raffle" });
    }
    
    // Collect all ticket numbers with their owners
    const allTickets: Array<{ticketNumber: number, userId: string, firstName: string, lastName: string, email: string}> = [];
    
    for (const entry of entriesResult.rows) {
      let ticketNumbers: number[] = [];
      
      // Parse ticket numbers
      if (entry.ticket_numbers) {
        if (Array.isArray(entry.ticket_numbers)) {
          ticketNumbers = entry.ticket_numbers;
        } else if (typeof entry.ticket_numbers === "string") {
          try {
            ticketNumbers = JSON.parse(entry.ticket_numbers);
          } catch (error) {
            console.error("Error parsing ticket numbers:", error);
            continue;
          }
        }
      }
      
      // Add each ticket to the pool
      ticketNumbers.forEach(ticketNumber => {
        allTickets.push({
          ticketNumber,
          userId: entry.user_id,
          firstName: entry.first_name,
          lastName: entry.last_name,
          email: entry.email
        });
      });
    }
    
    if (allTickets.length === 0) {
      return res.status(400).json({ message: "No valid tickets found" });
    }
    
    // Randomly select winning ticket
    const randomIndex = Math.floor(Math.random() * allTickets.length);
    const winningTicket = allTickets[randomIndex];
    
    // Update raffle with winner information
    const updateQuery = `
      UPDATE raffles 
      SET winner_id = $1, 
          winning_ticket_number = $2,
          status = 'completed',
          updated_at = NOW()
      WHERE id = $3
    `;
    
    await pool.query(updateQuery, [
      winningTicket.userId,
      winningTicket.ticketNumber,
      raffleId
    ]);
    
    // Create notification for the winner
    try {
      const notificationQuery = `
        INSERT INTO notifications (user_id, message, type, is_read, created_at)
        VALUES ($1, $2, $3, false, NOW())
      `;
      await pool.query(notificationQuery, [
        winningTicket.userId,
        `🎉 Congratulations! You won the raffle "${raffle.name}" with ticket #${winningTicket.ticketNumber}! Please contact us to arrange prize delivery.`,
        'raffle_win'
      ]);
    } catch (notificationError) {
      console.error("Failed to create winner notification:", notificationError);
    }

    // Try to send winner notification email
    try {
      await sendWinnerNotification({
        email: winningTicket.email,
        name: winningTicket.firstName,
        raffleName: raffle.name,
        prizeDescription: raffle.item_description || raffle.description,
        ticketNumber: winningTicket.ticketNumber
      });
    } catch (emailError) {
      console.error("Failed to send winner notification:", emailError);
      // Continue anyway - the winner is still selected
    }
    
    res.json({
      success: true,
      winnerId: winningTicket.userId,
      winnerName: `${winningTicket.firstName} ${winningTicket.lastName}`,
      winnerFirstName: winningTicket.firstName,
      winningTicketNumber: winningTicket.ticketNumber,
      totalTickets: allTickets.length,
      raffleName: raffle.name
    });
    
  } catch (error) {
    console.error("Error selecting winner:", error);
    res.status(500).json({ message: "Failed to select winner" });
  }
});

export default router;
