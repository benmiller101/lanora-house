import { Router, Request, Response } from "express";
import { selectRaffleWinner, announceRaffleWinner, getRecentRaffleWinners, getUserRaffleWinnings } from "./raffle-winner-service";
import { pool } from "./db";

const router = Router();

// Admin: Select and announce winner for a raffle
router.post("/announce/:raffleId", async (req: any, res: Response) => {
  try {
    const raffleId = parseInt(req.params.raffleId);
    
    if (!raffleId) {
      return res.status(400).json({ message: "Invalid raffle ID" });
    }
    
    console.log(`🎯 Announcing winner for raffle ${raffleId}...`);
    
    // Select winner
    const winnerData = await selectRaffleWinner(raffleId);
    
    if (!winnerData) {
      return res.status(400).json({ message: "Failed to select winner or no tickets found" });
    }
    
    // Announce winner
    const success = await announceRaffleWinner(winnerData);
    
    if (!success) {
      return res.status(500).json({ message: "Failed to announce winner" });
    }
    
    res.json({
      success: true,
      message: `Winner announced! ${winnerData.userName} won with ticket #${winnerData.winningTicketNumber}`,
      winner: winnerData
    });
    
  } catch (error) {
    console.error("Error in announce winner route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get recent raffle winners (public)
router.get("/recent", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const winners = await getRecentRaffleWinners(limit);
    
    res.json({ winners });
    
  } catch (error) {
    console.error("Error fetching recent winners:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user's raffle winnings (authenticated)
router.get("/my-winnings", async (req: any, res: Response) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const userId = req.session.user.id;
    const winnings = await getUserRaffleWinnings(userId);
    
    res.json({ winnings });
    
  } catch (error) {
    console.error("Error fetching user winnings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



// Claim raffle prize (authenticated)
router.post("/claim/:winnerId", async (req: any, res: Response) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const winnerId = parseInt(req.params.winnerId);
    const { claimType, deliveryAddress, paymentMethod } = req.body;
    const userId = req.session.user.id;
    
    console.log(`🎁 User ${userId} claiming prize ${winnerId} as ${claimType}`);
    
    // Verify this winner belongs to the user
    const winnerCheck = await pool.query(
      "SELECT * FROM raffle_winners WHERE id = $1 AND user_id = $2 AND claimed = false",
      [winnerId, userId]
    );
    
    if (winnerCheck.rows.length === 0) {
      return res.status(404).json({ message: "Winner not found or already claimed" });
    }
    
    const winner = winnerCheck.rows[0];
    
    if (claimType === 'cash') {
      // Process immediate payment based on method
      let paymentResult;
      const amount = parseFloat(winner.prize_value);
      
      try {
        if (paymentMethod === 'stripe') {
          // Simulate Stripe payment processing
          paymentResult = {
            success: true,
            transactionId: `stripe_${Date.now()}`,
            method: 'Credit/Debit Card (Stripe)',
            timeframe: 'Instant'
          };
        } else if (paymentMethod === 'paypal') {
          // Simulate PayPal payment processing
          paymentResult = {
            success: true,
            transactionId: `paypal_${Date.now()}`,
            method: 'PayPal Account',
            timeframe: '1-2 business days'
          };
        } else if (paymentMethod === 'bank') {
          // Simulate Bank Transfer processing
          paymentResult = {
            success: true,
            transactionId: `bank_${Date.now()}`,
            method: 'Bank Transfer',
            timeframe: '3-5 business days'
          };
        } else {
          throw new Error('Invalid payment method');
        }
        
        // Record the transaction
        await pool.query(
          "INSERT INTO withdrawals (user_id, amount, status, withdrawal_method, notes, instant_win_ids, transaction_id) VALUES ($1, $2, 'completed', $3, $4, ARRAY[]::integer[], $5)",
          [userId, amount, paymentMethod, `Direct Payment - Raffle Prize: ${winner.prize_name}`, paymentResult.transactionId]
        );
        
        // Mark as claimed
        await pool.query(
          "UPDATE raffle_winners SET claimed = true, claimed_at = NOW(), claim_type = 'cash' WHERE id = $1",
          [winnerId]
        );
        
        res.json({ 
          success: true, 
          message: `Payment of £${amount.toFixed(2)} has been processed via ${paymentResult.method}! Transaction ID: ${paymentResult.transactionId}. Funds will arrive in ${paymentResult.timeframe}.` 
        });
        
      } catch (paymentError) {
        console.error('Payment processing error:', paymentError);
        res.status(500).json({ 
          success: false, 
          message: 'Payment processing failed. Please try again or contact support.' 
        });
        return;
      }
      
    } else if (claimType === 'delivery') {
      // Update with delivery information
      const deliveryAddressJson = JSON.stringify(deliveryAddress);
      
      await pool.query(
        "UPDATE raffle_winners SET claimed = true, claimed_at = NOW(), claim_type = 'delivery', delivery_address = $1, delivery_status = 'processing' WHERE id = $2",
        [deliveryAddressJson, winnerId]
      );
      
      const deliveryMethod = deliveryAddress?.deliveryType === 'digital' ? 'email' : 'shipping';
      const deliveryTarget = deliveryAddress?.deliveryType === 'digital' ? deliveryAddress.email : deliveryAddress.fullName;
      
      res.json({ 
        success: true, 
        message: `Delivery arranged! Your prize will be sent via ${deliveryMethod} to ${deliveryTarget}. We'll contact you with updates.` 
      });
      
    } else {
      return res.status(400).json({ message: "Invalid claim type" });
    }
    
  } catch (error) {
    console.error("Error claiming raffle prize:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;