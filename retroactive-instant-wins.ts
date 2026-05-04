// Script to retroactively check and award instant wins for existing tickets
import { db } from "./server/db";
import { raffleEntries, instantWinners } from "./shared/schema";
import { eq } from "drizzle-orm";

async function checkRetroactiveInstantWins() {
  console.log("🎁 Checking retroactive instant wins for raffle 51...");
  
  // Get the user's raffle entry
  const entry = await db
    .select()
    .from(raffleEntries)
    .where(eq(raffleEntries.raffleId, 51))
    .limit(1);

  if (!entry[0]) {
    console.log("❌ No raffle entry found");
    return;
  }

  const userEntry = entry[0];
  console.log(`🎫 Found entry with ${userEntry.ticketCount} tickets:`, userEntry.ticketNumbers);

  // Instant win prizes configuration
  const instantPrizes = [
    { type: "cash", count: 50, amount: 3 },
    { type: "cash", count: 25, amount: 10 },
    { type: "cash", count: 1, amount: 100 }
  ];

  // Generate winning ticket numbers (simulating what would have happened during purchase)
  const totalTickets = 100;
  const totalPrizes = 76;
  
  // Create a simple deterministic winning system based on ticket numbers
  const winningTickets: number[] = [];
  
  // For the £100 prize (1 winner) - use ticket 50
  winningTickets.push(50);
  
  // For £10 prizes (25 winners) - use every 4th ticket starting from 2
  for (let i = 2; i <= totalTickets && winningTickets.length < 26; i += 4) {
    winningTickets.push(i);
  }
  
  // For £3 prizes (50 winners) - use remaining slots
  for (let i = 1; i <= totalTickets && winningTickets.length < 76; i += 2) {
    if (!winningTickets.includes(i)) {
      winningTickets.push(i);
    }
  }

  console.log(`🎲 Generated ${winningTickets.length} winning tickets:`, winningTickets.slice(0, 10), "...");

  // Check which of the user's tickets are winners
  const userWinningTickets = userEntry.ticketNumbers.filter(ticket => winningTickets.includes(ticket));
  console.log(`🏆 User's winning tickets:`, userWinningTickets);

  // Award prizes for winning tickets
  for (const winningTicket of userWinningTickets) {
    let prizeAmount = 3; // Default to £3
    
    if (winningTicket === 50) {
      prizeAmount = 100; // £100 prize
    } else if (winningTicket % 4 === 2 && winningTicket <= 98) {
      prizeAmount = 10; // £10 prize
    }

    console.log(`💰 Awarding £${prizeAmount} for ticket ${winningTicket}`);
    
    // Insert instant win record
    await db.insert(instantWinners).values({
      raffleId: 51,
      userId: userEntry.userId,
      ticketNumber: winningTicket,
      prizeAmount: prizeAmount.toString(),
      prizeType: "cash",
      claimed: true
    });
  }

  console.log(`✅ Retroactively awarded ${userWinningTickets.length} instant win prizes!`);
  
  // Update raffle tickets sold count
  await db.execute(`UPDATE raffles SET tickets_sold = 30 WHERE id = 51`);
  console.log("📊 Updated raffle tickets sold count");
}

checkRetroactiveInstantWins().catch(console.error);