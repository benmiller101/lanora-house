// Debug script to test instant wins API
import { pool } from './server/db';

async function debugInstantWins() {
  try {
    console.log("=== INSTANT WINS DEBUG ===");
    
    // Check database directly
    const result = await pool.query(`
      SELECT 
        iw.id,
        iw.raffle_id as "raffleId",
        r.name as "raffleName", 
        iw.prize_type as "prizeType",
        iw.prize_amount as "prizeAmount",
        iw.claimed,
        iw.created_at as "createdAt"
      FROM instant_wins iw
      JOIN raffles r ON iw.raffle_id = r.id
      WHERE iw.user_id = $1 
      ORDER BY iw.created_at DESC
      LIMIT 10
    `, ['user_test_example_com_1748304412605']);

    console.log(`Found ${result.rows.length} instant wins for user`);
    
    result.rows.forEach((win, index) => {
      console.log(`${index + 1}. ID:${win.id} - £${win.prizeAmount} ${win.prizeType} from ${win.raffleName} - ${win.claimed ? 'CLAIMED' : 'UNCLAIMED'}`);
    });

    // Test the total
    const totalResult = await pool.query(`
      SELECT COUNT(*) as total, SUM(prize_amount) as value 
      FROM instant_wins 
      WHERE user_id = $1 AND claimed = false
    `, ['user_test_example_com_1748304412605']);
    
    console.log(`Total unclaimed: ${totalResult.rows[0].total} prizes worth £${totalResult.rows[0].value}`);
    
  } catch (error) {
    console.error("Debug error:", error);
  }
}

debugInstantWins();