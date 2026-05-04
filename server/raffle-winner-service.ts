import { pool } from "./db";

export interface RaffleWinnerData {
  raffleId: number;
  userId: string;
  userName: string;
  winningTicketNumber: number;
  prizeValue: number;
  prizeName: string;
}

/**
 * Select a random winner for a completed raffle
 */
export async function selectRaffleWinner(raffleId: number): Promise<RaffleWinnerData | null> {
  try {
    // Get all ticket numbers for this raffle
    const ticketsQuery = `
      SELECT 
        re.user_id,
        u.first_name,
        u.email,
        unnest(re.ticket_numbers) as ticket_number
      FROM raffle_entries re
      JOIN users u ON re.user_id = u.id
      WHERE re.raffle_id = $1
    `;
    
    const ticketsResult = await pool.query(ticketsQuery, [raffleId]);
    
    if (ticketsResult.rows.length === 0) {
      console.log(`❌ No tickets found for raffle ${raffleId}`);
      return null;
    }
    
    // Get raffle details
    const raffleQuery = `
      SELECT name, retail_price
      FROM raffles
      WHERE id = $1
    `;
    
    const raffleResult = await pool.query(raffleQuery, [raffleId]);
    
    if (raffleResult.rows.length === 0) {
      console.log(`❌ Raffle ${raffleId} not found`);
      return null;
    }
    
    const raffle = raffleResult.rows[0];
    
    // Select random winning ticket
    const randomIndex = Math.floor(Math.random() * ticketsResult.rows.length);
    const winningTicket = ticketsResult.rows[randomIndex];
    
    console.log(`🎯 Selected winning ticket ${winningTicket.ticket_number} for raffle ${raffleId}`);
    
    const winnerData: RaffleWinnerData = {
      raffleId,
      userId: winningTicket.user_id,
      userName: winningTicket.first_name || winningTicket.email,
      winningTicketNumber: winningTicket.ticket_number,
      prizeValue: parseFloat(raffle.retail_price),
      prizeName: raffle.name
    };
    
    return winnerData;
    
  } catch (error) {
    console.error("Error selecting raffle winner:", error);
    return null;
  }
}

/**
 * Announce a raffle winner and save to database
 */
export async function announceRaffleWinner(winnerData: RaffleWinnerData): Promise<boolean> {
  try {
    // Insert winner into database
    const insertQuery = `
      INSERT INTO raffle_winners (
        raffle_id, user_id, winning_ticket_number, 
        prize_value, prize_name, created_at
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    
    const result = await pool.query(insertQuery, [
      winnerData.raffleId,
      winnerData.userId,
      winnerData.winningTicketNumber,
      winnerData.prizeValue,
      winnerData.prizeName
    ]);
    
    // Update raffle status to completed and set winner
    const updateRaffleQuery = `
      UPDATE raffles 
      SET status = 'completed', 
          winner_id = $1, 
          winning_ticket_number = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `;
    
    await pool.query(updateRaffleQuery, [
      winnerData.userId,
      winnerData.winningTicketNumber,
      winnerData.raffleId
    ]);
    
    console.log(`🎉 Winner announced for raffle ${winnerData.raffleId}: ${winnerData.userName} with ticket ${winnerData.winningTicketNumber}`);
    
    return true;
    
  } catch (error) {
    console.error("Error announcing raffle winner:", error);
    return false;
  }
}

/**
 * Get recent raffle winners for display
 */
export async function getRecentRaffleWinners(limit: number = 20): Promise<any[]> {
  try {
    const query = `
      SELECT 
        rw.id,
        rw.raffle_id,
        rw.winning_ticket_number,
        rw.prize_value,
        rw.prize_name,
        rw.created_at,
        u.first_name,
        u.email,
        r.name as raffle_name,
        r.image_url as raffle_image
      FROM raffle_winners rw
      JOIN users u ON rw.user_id = u.id
      JOIN raffles r ON rw.raffle_id = r.id
      ORDER BY rw.created_at DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    
    return result.rows.map(row => ({
      id: row.id,
      raffleId: row.raffle_id,
      winnerName: row.first_name || row.email.split('@')[0],
      winningTicketNumber: row.winning_ticket_number,
      prizeValue: parseFloat(row.prize_value),
      prizeName: row.prize_name,
      raffleName: row.raffle_name,
      raffleImage: row.raffle_image,
      wonAt: row.created_at
    }));
    
  } catch (error) {
    console.error("Error fetching recent winners:", error);
    return [];
  }
}

/**
 * Get winners for a specific user (for members portal)
 */
export async function getUserRaffleWinnings(userId: string): Promise<any[]> {
  try {
    const query = `
      SELECT 
        rw.id,
        rw.raffle_id,
        rw.winning_ticket_number,
        rw.prize_value,
        rw.prize_name,
        rw.claimed,
        rw.claimed_at,
        rw.claim_type,
        rw.delivery_status,
        rw.created_at,
        r.name as raffle_name,
        r.image_url as raffle_image
      FROM raffle_winners rw
      JOIN raffles r ON rw.raffle_id = r.id
      WHERE rw.user_id = $1
      ORDER BY rw.created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    
    return result.rows.map(row => ({
      id: row.id,
      raffleId: row.raffle_id,
      winningTicketNumber: row.winning_ticket_number,
      prizeValue: parseFloat(row.prize_value),
      prizeName: row.prize_name,
      raffleName: row.raffle_name,
      raffleImage: row.raffle_image,
      claimed: row.claimed,
      claimedAt: row.claimed_at,
      claimType: row.claim_type,
      deliveryStatus: row.delivery_status,
      wonAt: row.created_at
    }));
    
  } catch (error) {
    console.error("Error fetching user raffle winnings:", error);
    return [];
  }
}