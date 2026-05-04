import { pool } from "./server/db";
import { checkForInstantWin, generateRandomTicketNumbers } from "./server/new-order-system";

async function processOrder178() {
  try {
    console.log("🔧 Manually processing order 178...");
    
    const orderId = 178;
    const userId = "user_test_example_com_1748304412605";
    
    // Get order items
    const orderItemsResult = await pool.query(`
      SELECT * FROM order_items WHERE order_id = $1 AND type = 'raffle_ticket'
    `, [orderId]);
    
    console.log("📦 Order items:", orderItemsResult.rows);
    
    for (const item of orderItemsResult.rows) {
      const raffleId = item.raffle_id;
      const quantity = item.quantity;
      
      console.log(`🎫 Processing ${quantity} raffle tickets for raffle ${raffleId}`);
      
      // Update tickets sold
      await pool.query(
        "UPDATE raffles SET tickets_sold = tickets_sold + $1 WHERE id = $2",
        [quantity, raffleId]
      );
      console.log(`✅ Updated raffle ${raffleId}: +${quantity} tickets sold`);
      
      // Generate ticket numbers
      const ticketNumbers = await generateRandomTicketNumbers(raffleId, quantity);
      console.log(`🎲 Generated ${ticketNumbers.length} ticket numbers: ${ticketNumbers.slice(0, 10)}...`);
      
      // Create raffle entry
      await pool.query(`
        INSERT INTO raffle_entries (raffle_id, user_id, ticket_count, ticket_numbers)
        VALUES ($1, $2, $3, $4)
      `, [raffleId, userId, quantity, ticketNumbers]);
      console.log(`🎟️ Created raffle entry for user ${userId}`);
      
      // Check for instant wins
      const instantWinResult = await checkForInstantWin(raffleId, quantity);
      if (instantWinResult.won) {
        console.log(`🎉 INSTANT WIN! User ${userId} won: ${instantWinResult.prize}`);
        
        if (instantWinResult.wins && instantWinResult.wins.length > 1) {
          // Multiple wins
          for (const win of instantWinResult.wins) {
            await pool.query(`
              INSERT INTO instant_wins (raffle_id, user_id, prize_type, prize_amount, created_at)
              VALUES ($1, $2, $3, $4, NOW())
            `, [raffleId, userId, win.prizeType, win.amount]);
            console.log(`💰 Saved instant win: ${win.prizeType} - ${win.amount}`);
          }
        } else {
          // Single win
          await pool.query(`
            INSERT INTO instant_wins (raffle_id, user_id, prize_type, prize_amount, created_at)
            VALUES ($1, $2, $3, $4, NOW())
          `, [raffleId, userId, instantWinResult.prizeType, instantWinResult.amount]);
          console.log(`💰 Saved instant win: ${instantWinResult.prizeType} - ${instantWinResult.amount}`);
        }
      }
      
      // Check if raffle is completed
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
    
    // Update order status
    await pool.query(`
      UPDATE orders 
      SET status = 'completed', payment_status = 'completed' 
      WHERE id = $1
    `, [orderId]);
    
    console.log("✅ Order processing completed!");
    
  } catch (error) {
    console.error("❌ Error processing order:", error);
  }
}

processOrder178();