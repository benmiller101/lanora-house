import { Request, Response } from "express";
// Stripe removed - switching to Paytriot for raffle support
import { storage } from "./storage-db";
import { pool } from "./db";
import * as crypto from "crypto";

/**
 * Check if a user should win an instant prize based on raffle settings
 */
export async function checkForInstantWin(raffleId: number, ticketQuantity: number) {
  try {
    // Get raffle instant win settings
    const raffleQuery = await pool.query(`
      SELECT 
        instant_win_enabled,
        instant_win_prizes,
        max_tickets
      FROM raffles 
      WHERE id = $1
    `, [raffleId]);

    if (raffleQuery.rows.length === 0 || !raffleQuery.rows[0].instant_win_enabled) {
      return { won: false };
    }

    const raffle = raffleQuery.rows[0];
    const instantWinPrizes = raffle.instant_win_prizes || [];
    const maxTickets = raffle.max_tickets;

    if (instantWinPrizes.length === 0) {
      return { won: false };
    }

    // Calculate total available instant wins
    const totalInstantWins = instantWinPrizes.reduce((sum: number, prize: any) => sum + (prize.count || 0), 0);
    
    if (totalInstantWins === 0) {
      return { won: false };
    }

    // Check how many instant wins have already been claimed for this raffle
    const claimedQuery = await pool.query(`
      SELECT COUNT(*) as claimed_count 
      FROM instant_wins 
      WHERE raffle_id = $1
    `, [raffleId]);

    const claimedCount = parseInt(claimedQuery.rows[0].claimed_count || '0');
    
    if (claimedCount >= totalInstantWins) {
      console.log(`No more instant wins available for raffle ${raffleId}. Claimed: ${claimedCount}, Total: ${totalInstantWins}`);
      return { won: false };
    }

    // Calculate probability-based instant wins
    // Probability = (remaining instant wins / remaining tickets in raffle)
    const wins = [];
    let remainingInstantWins = totalInstantWins - claimedCount;
    
    // Get current ticket count for this raffle
    const ticketCountQuery = await pool.query(`
      SELECT COALESCE(SUM(ticket_count), 0) as sold_tickets 
      FROM raffle_entries 
      WHERE raffle_id = $1
    `, [raffleId]);
    
    const soldTickets = parseInt(ticketCountQuery.rows[0].sold_tickets || '0');
    const remainingTickets = maxTickets - soldTickets;
    
    // Only check for wins if there are remaining instant wins and tickets
    if (remainingInstantWins > 0 && remainingTickets > 0) {
      console.log(`🎲 Instant win check: ${remainingInstantWins} wins left, ${remainingTickets} tickets remaining, buying ${ticketQuantity}`);
      
      // Check if this purchase will complete the raffle
      const willCompleteRaffle = (ticketQuantity >= remainingTickets);
      
      if (willCompleteRaffle) {
        // If purchasing all remaining tickets, guarantee all remaining instant wins
        console.log(`🎯 RAFFLE COMPLETION: Awarding all ${remainingInstantWins} remaining instant wins!`);
        
        // Award all remaining instant wins
        for (const prizeType of instantWinPrizes) {
          for (let i = 0; i < prizeType.count && remainingInstantWins > 0; i++) {
            wins.push({
              prize: prizeType.type === 'cash' ? `£${prizeType.amount} Cash` : `${prizeType.amount} Free Tickets`,
              prizeType: prizeType.type,
              amount: prizeType.amount
            });
            remainingInstantWins--;
          }
        }
      } else {
        // Normal probability-based instant wins for partial purchases
        const winProbability = Math.min(remainingInstantWins / remainingTickets, 0.15); // Slightly higher probability
        
        for (let i = 0; i < ticketQuantity && remainingInstantWins > 0; i++) {
          // Random check against probability
          if (Math.random() < winProbability) {
            const availablePrizes = instantWinPrizes.filter((prize: any) => prize.count > 0);
            if (availablePrizes.length === 0) break;

            const selectedPrize = availablePrizes[Math.floor(Math.random() * availablePrizes.length)];
            
            console.log(`🎉 Instant win triggered for raffle ${raffleId}: ${selectedPrize.type} - ${selectedPrize.amount}`);

            wins.push({
              prize: selectedPrize.type === 'cash' ? `£${selectedPrize.amount} Cash` : `${selectedPrize.amount} Free Tickets`,
              prizeType: selectedPrize.type,
              amount: selectedPrize.amount
            });
            
            remainingInstantWins--;
          }
        }
      }
    }

    if (wins.length > 0) {
      return {
        won: true,
        wins: wins,
        prize: wins[0].prize,
        prizeType: wins[0].prizeType,
        amount: wins[0].amount
      };
    }

    return { won: false };
  } catch (error) {
    console.error('Error checking instant win:', error);
    return { won: false };
  }
}

/**
 * Generate an array of unique, random ticket numbers for a given raffle.
 */
export async function generateRandomTicketNumbers(
  raffleId: number,
  quantity: number,
): Promise<number[]> {
  // 0.1) Fetch how many tickets that raffle allows
  const raffleResult = await pool.query(
    "SELECT max_tickets FROM raffles WHERE id = $1",
    [raffleId],
  );
  if (raffleResult.rows.length === 0) {
    throw new Error(`Raffle ${raffleId} not found`);
  }
  const maxTickets = raffleResult.rows[0].max_tickets;

  // 0.2) Pull in all already‐used ticket numbers
  const existing = await pool.query(
    "SELECT ticket_numbers FROM raffle_entries WHERE raffle_id = $1",
    [raffleId],
  );
  const used = new Set<number>();
  existing.rows.forEach((r) => {
    if (r.ticket_numbers) {
      (r.ticket_numbers as number[]).forEach((n) => used.add(n));
    }
  });

  // 0.3) Build a pool of available ticket numbers
  const available: number[] = [];
  for (let i = 1; i <= maxTickets; i++) {
    if (!used.has(i)) available.push(i);
  }
  if (available.length < quantity) {
    throw new Error(
      `Not enough tickets available. Requested ${quantity}, but only ${available.length} left.`,
    );
  }

  // 0.4) Randomly select your tickets
  const selected: number[] = [];
  for (let i = 0; i < quantity; i++) {
    const idx = crypto.randomInt(0, available.length);
    selected.push(...available.splice(idx, 1));
  }
  return selected.sort((a, b) => a - b);
}

// Stripe removed - Paytriot integration needed
const stripe = null;

export async function processNewOrder(req: Request, res: Response) {
  try {
    console.log("🎉 NEW ORDER SYSTEM - Starting order processing");

    const { paymentIntentId, shippingDetails, billingDetails, cartData } =
      req.body;

    // TODO: Implement Paytriot payment verification
    console.log("✅ Payment processing with Paytriot - verification needed");

    // 2) Who’s buying?
    const userId = (req as any).session?.user?.id || null;
    console.log("👤 User:", userId || "guest");

    // 3) Grab the cart from the front end
    const cart = cartData || {
      items: [],
      subtotal: 0,
      shipping: 0,
      tax: 0,
      total: 0,
      discount: 0,
    };
    console.log("🛒 Cart contains", cart.items.length, "items");

    // 4) Create the order (this writes to orders + order_items)
    const order = await storage.createOrder(
      {
        userId: userId || "guest",
        total: cart.total.toString(),
        subtotal: cart.subtotal.toString(),
        tax: cart.tax.toString(),
        shipping: cart.shipping.toString(),
        discount: cart.discount.toString(),
        paymentIntentId: paymentIntentId,
        shippingAddress: JSON.stringify(shippingDetails),
        billingAddress: JSON.stringify(billingDetails),
        paymentMethod: "stripe",
        paymentStatus: "completed",
      },
      cart.items.map((item: any) => ({
        productId: item.productId,
        raffleId: item.type === "raffle_ticket" ? item.raffleId : null,
        quantity: item.quantity,
        price: item.price || item.product?.price,
        name: item.name || item.product?.name,
        type: item.type || (item.productId ? "product" : "raffle_ticket"),
      })),
    );
    console.log("✅ Order created:", order.id);

    // 5) Handle raffle tickets and track instant wins
    const instantWins: any[] = [];
    
    for (const item of cart.items) {
      console.log("🔍 Processing cart item for raffle:", item);
      if (item.type === "raffle_ticket") {
        // **NEW**: raffleId may live on productId, so fallback if needed
        const raffleId = item.raffleId ?? item.productId;
        if (!raffleId) {
          console.warn(
            "⚠️  Skipping raffle entry; no raffle ID found on item:",
            item,
          );
          continue;
        }

        // a) bump the tickets_sold counter
        await pool.query(
          "UPDATE raffles SET tickets_sold = tickets_sold + $1 WHERE id = $2",
          [item.quantity, raffleId],
        );
        console.log(
          `🎫 Updated raffle ${raffleId}: +${item.quantity} tickets sold`,
        );

        // b) pick random ticket numbers
        const ticketNumbers = await generateRandomTicketNumbers(
          raffleId,
          item.quantity,
        );
        console.log("🎲 Generated ticket numbers:", ticketNumbers);

        // c) insert the entries
        await pool.query(
          `
            INSERT INTO raffle_entries
              (raffle_id, user_id, ticket_count, ticket_numbers)
            VALUES ($1, $2, $3, $4)
          `,
          [raffleId, userId, item.quantity, ticketNumbers],
        );
        console.log(
          `🎟️ Created raffle entry for user ${userId}:`,
          ticketNumbers,
        );

        // d) Check for instant wins
        const instantWinResult = await checkForInstantWin(raffleId, item.quantity);
        if (instantWinResult.won) {
          console.log(`🎉 INSTANT WIN! User ${userId} won: ${instantWinResult.prize}`);
          
          // Handle multiple wins if they exist
          if (instantWinResult.wins && instantWinResult.wins.length > 1) {
            // Multiple wins - save each one
            for (const win of instantWinResult.wins) {
              const instantWinRecord = await pool.query(`
                INSERT INTO instant_wins (raffle_id, user_id, prize_type, prize_amount, created_at)
                VALUES ($1, $2, $3, $4, NOW())
                RETURNING *
              `, [raffleId, userId, win.prizeType, win.amount]);
              
              instantWins.push({
                id: instantWinRecord.rows[0].id,
                raffleId,
                prize: win.prize,
                prizeType: win.prizeType,
                amount: win.amount
              });
            }
          } else {
            // Single win - save it
            const instantWinRecord = await pool.query(`
              INSERT INTO instant_wins (raffle_id, user_id, prize_type, prize_amount, created_at)
              VALUES ($1, $2, $3, $4, NOW())
              RETURNING *
            `, [raffleId, userId, instantWinResult.prizeType, instantWinResult.amount]);
            
            instantWins.push({
              id: instantWinRecord.rows[0].id,
              raffleId,
              prize: instantWinResult.prize,
              prizeType: instantWinResult.prizeType,
              amount: instantWinResult.amount
            });
          }
        }
        
        // e) Check if raffle is now completed and update status
        const raffleStatusQuery = await pool.query(`
          SELECT max_tickets, tickets_sold 
          FROM raffles 
          WHERE id = $1
        `, [raffleId]);
        
        if (raffleStatusQuery.rows.length > 0) {
          const raffle = raffleStatusQuery.rows[0];
          if (raffle.tickets_sold >= raffle.max_tickets) {
            console.log(`🎯 RAFFLE ${raffleId} COMPLETED! Updating status to sold_out`);
            await pool.query(`
              UPDATE raffles 
              SET status = 'sold_out' 
              WHERE id = $1
            `, [raffleId]);
          }
        }
      }
    }

    // 6) Clear the cart
    if (userId) {
      await storage.clearCart(userId);
      console.log("🧹 Cart cleared");
    }

    // 7) Return success with instant win information
    res.json({ 
      success: true, 
      orderId: order.id,
      instantWins: instantWins
    });
  } catch (error) {
    console.error("❌ Order processing failed:", error);
    res.status(500).json({ message: "Failed to process order" });
  }
}
