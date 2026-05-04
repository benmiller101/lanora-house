import { pool } from "./server/db";

async function processInstantWins() {
  try {
    console.log("🎉 Processing instant wins for completed raffle 45...");
    
    const raffleId = 45;
    const userId = "user_test_example_com_1748304412605";
    
    // Get raffle instant win configuration
    const raffleQuery = await pool.query(`
      SELECT instant_win_prizes, instant_win_count
      FROM raffles 
      WHERE id = $1
    `, [raffleId]);
    
    if (raffleQuery.rows.length === 0) {
      console.log("❌ Raffle not found");
      return;
    }
    
    const raffle = raffleQuery.rows[0];
    const instantWinPrizes = raffle.instant_win_prizes || [];
    const totalInstantWins = raffle.instant_win_count || 0;
    
    console.log("🎁 Instant win configuration:", {
      prizes: instantWinPrizes,
      totalWins: totalInstantWins
    });
    
    // Check how many have already been claimed
    const claimedQuery = await pool.query(`
      SELECT COUNT(*) as claimed_count 
      FROM instant_wins 
      WHERE raffle_id = $1
    `, [raffleId]);
    
    const claimedCount = parseInt(claimedQuery.rows[0].claimed_count || '0');
    console.log(`📊 Already claimed: ${claimedCount}/${totalInstantWins}`);
    
    if (claimedCount >= totalInstantWins) {
      console.log("✅ All instant wins already claimed!");
      return;
    }
    
    // Award all remaining instant wins since raffle is completed
    const remainingWins = totalInstantWins - claimedCount;
    console.log(`🎯 Awarding all ${remainingWins} remaining instant wins!`);
    
    let winsAwarded = 0;
    for (const prizeConfig of instantWinPrizes) {
      for (let i = 0; i < prizeConfig.count && winsAwarded < remainingWins; i++) {
        await pool.query(`
          INSERT INTO instant_wins (raffle_id, user_id, prize_type, prize_amount, created_at)
          VALUES ($1, $2, $3, $4, NOW())
        `, [raffleId, userId, prizeConfig.type, prizeConfig.amount]);
        
        console.log(`💰 Awarded: ${prizeConfig.type} - £${prizeConfig.amount}`);
        winsAwarded++;
      }
    }
    
    console.log(`✅ Successfully awarded ${winsAwarded} instant wins!`);
    
    // Verify final count
    const finalCountQuery = await pool.query(`
      SELECT COUNT(*) as final_count 
      FROM instant_wins 
      WHERE raffle_id = $1
    `, [raffleId]);
    
    console.log(`🏆 Final instant wins count: ${finalCountQuery.rows[0].final_count}`);
    
  } catch (error) {
    console.error("❌ Error processing instant wins:", error);
  }
}

processInstantWins();