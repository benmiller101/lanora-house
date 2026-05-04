import { Router } from "express";
import { pool } from "./db";

const router = Router();

// Get infinite scroll winners feed
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Get both raffle winners and instant wins
    const winnersQuery = `
      WITH raffle_winners_data AS (
        SELECT 
          'raffle' as type,
          u.first_name || ' ' || COALESCE(u.last_name, '') as winner_name,
          rw.prize_name as prize,
          rw.prize_value::text as amount,
          rw.created_at as won_at,
          r.name as raffle_name,
          rw.claimed
        FROM raffle_winners rw
        JOIN users u ON rw.user_id = u.id
        JOIN raffles r ON rw.raffle_id = r.id
        WHERE rw.claimed = true
      ),
      instant_wins_data AS (
        SELECT 
          'instant' as type,
          u.first_name || ' ' || COALESCE(u.last_name, '') as winner_name,
          iw.prize_type || ' prize' as prize,
          '£' || iw.prize_amount::text as amount,
          iw.created_at as won_at,
          r.name as raffle_name,
          iw.claimed
        FROM instant_winners iw
        JOIN users u ON iw.user_id = u.id
        JOIN raffles r ON iw.raffle_id = r.id
      )
      SELECT * FROM (
        SELECT * FROM raffle_winners_data
        UNION ALL
        SELECT * FROM instant_wins_data
      ) all_winners
      ORDER BY won_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(winnersQuery, [limit, offset]);
    
    // Get total count for pagination info
    const countQuery = `
      SELECT COUNT(*) as total FROM (
        SELECT 1 FROM raffle_winners rw 
        JOIN users u ON rw.user_id = u.id 
        WHERE rw.claimed = true
        UNION ALL
        SELECT 1 FROM instant_winners iw 
        JOIN users u ON iw.user_id = u.id
      ) all_counts
    `;
    
    const countResult = await pool.query(countQuery);
    const total = parseInt(countResult.rows[0].total);
    const hasMore = offset + limit < total;

    res.json({
      winners: result.rows,
      pagination: {
        page,
        limit,
        total,
        hasMore
      }
    });
  } catch (error) {
    console.error('❌ Winners feed error:', error);
    res.status(500).json({ error: 'Failed to fetch winners feed' });
  }
});

// Get recent instant wins for confetti triggers
router.get("/recent-instant", async (req, res) => {
  try {
    const since = req.query.since as string;
    
    let query = `
      SELECT 
        iw.id,
        u.first_name || ' ' || COALESCE(u.last_name, '') as winner_name,
        iw.prize_type,
        iw.prize_amount,
        iw.created_at,
        r.name as raffle_name
      FROM instant_winners iw
      JOIN users u ON iw.user_id = u.id
      JOIN raffles r ON iw.raffle_id = r.id
      WHERE iw.created_at > NOW() - INTERVAL '5 minutes'
    `;
    
    if (since) {
      query += ` AND iw.created_at > $1`;
    }
    
    query += ` ORDER BY iw.created_at DESC LIMIT 10`;
    
    const params = since ? [since] : [];
    const result = await pool.query(query, params);

    res.json({
      instantWins: result.rows
    });
  } catch (error) {
    console.error('❌ Recent instant wins error:', error);
    res.status(500).json({ error: 'Failed to fetch recent instant wins' });
  }
});

export default router;