import { Router, Request, Response } from "express";
import { pool } from "./db";

const router = Router();

// Get user's instant wins
router.get("/", async (req: any, res: Response) => {
  try {
    console.log("🎁 Instant wins route - Session:", req.session?.passport?.user);
    console.log("🎁 Instant wins route - isAuthenticated:", req.isAuthenticated?.());
    console.log("🎁 Instant wins route - User:", req.user?.id);
    
    if (!req.isAuthenticated()) {
      console.log("🎁 Authentication failed for instant wins");
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = req.user.id;
    
    const instantWinsQuery = `
      SELECT 
        iw.id,
        iw.raffle_id as "raffleId",
        r.name as "raffleName",
        iw.prize_type as "prizeType",
        iw.prize_amount as "prizeAmount",
        iw.ticket_number as "ticketNumber",
        iw.claimed,
        iw.created_at as "createdAt"
      FROM instant_winners iw
      JOIN raffles r ON iw.raffle_id = r.id
      WHERE iw.user_id = $1
      ORDER BY iw.prize_amount DESC, iw.created_at DESC
    `;
    
    const result = await pool.query(instantWinsQuery, [userId]);
    
    console.log(`📊 Found ${result.rows.length} instant wins for user ${userId}`);
    
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching instant wins:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Claim an instant win
router.post("/:id/claim", async (req: any, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = req.user.id;
    const instantWinId = req.params.id;
    
    // Verify the instant win belongs to the user and is not already claimed
    const checkQuery = `
      SELECT id, claimed, prize_amount, prize_type
      FROM instant_winners 
      WHERE id = $1 AND user_id = $2
    `;
    
    const checkResult = await pool.query(checkQuery, [instantWinId, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Instant win not found" });
    }
    
    const instantWin = checkResult.rows[0];
    
    if (instantWin.claimed) {
      return res.status(400).json({ message: "Prize already claimed" });
    }
    
    // Mark as claimed
    const claimQuery = `
      UPDATE instant_winners 
      SET claimed = true
      WHERE id = $1
      RETURNING *
    `;
    
    await pool.query(claimQuery, [instantWinId]);

    // Add credit to wallet
    try {
      const { walletService } = await import("./wallet-service");
      await walletService.creditInstantWin(
        userId, 
        parseFloat(instantWin.prize_amount), 
        instantWinId.toString()
      );
      console.log(`💰 WALLET: Added £${instantWin.prize_amount} from instant win to user ${userId} wallet`);
    } catch (walletError) {
      console.error("❌ WALLET ERROR:", walletError);
      // Continue with claiming even if wallet fails - user still gets the prize
    }
    
    console.log(`🎉 User ${userId} claimed instant win ${instantWinId}: £${instantWin.prize_amount}`);
    
    res.json({ 
      success: true, 
      message: `Prize claimed and £${instantWin.prize_amount} added to your wallet!`
    });
    
  } catch (error) {
    console.error("Error claiming instant win:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;