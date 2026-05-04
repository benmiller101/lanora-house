import { Router } from "express";
import { db } from "./db";
import { socialShareRewards, socialShares, raffleEntries, raffles } from "@shared/schema";
import { eq, and, desc, count } from "drizzle-orm";

const router = Router();

// Get all active social share rewards
router.get("/social-share-rewards", async (req, res) => {
  try {
    const rewards = await db
      .select()
      .from(socialShareRewards)
      .where(eq(socialShareRewards.isActive, true))
      .orderBy(socialShareRewards.platform);

    res.json(rewards);
  } catch (error) {
    console.error("Error fetching social share rewards:", error);
    res.status(500).json({ error: "Failed to fetch social share rewards" });
  }
});

// Get user's shares for a specific raffle
router.get("/social-shares", async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { raffleId } = req.query;
    
    if (!raffleId) {
      return res.status(400).json({ error: "Raffle ID is required" });
    }

    const shares = await db
      .select()
      .from(socialShares)
      .where(
        and(
          eq(socialShares.userId, req.user.id),
          eq(socialShares.raffleId, parseInt(raffleId))
        )
      )
      .orderBy(desc(socialShares.createdAt));

    res.json(shares);
  } catch (error) {
    console.error("Error fetching user shares:", error);
    res.status(500).json({ error: "Failed to fetch user shares" });
  }
});

// Record a new social share
router.post("/social-shares", async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { raffleId, platform, shareUrl, shareData } = req.body;

    if (!raffleId || !platform) {
      return res.status(400).json({ error: "Raffle ID and platform are required" });
    }

    // Check if raffle exists and is active
    const [raffle] = await db
      .select()
      .from(raffles)
      .where(eq(raffles.id, raffleId));

    if (!raffle) {
      return res.status(404).json({ error: "Raffle not found" });
    }

    // Check if user has already shared on this platform for this raffle
    const [existingShare] = await db
      .select()
      .from(socialShares)
      .where(
        and(
          eq(socialShares.userId, req.user.id),
          eq(socialShares.raffleId, raffleId),
          eq(socialShares.platform, platform)
        )
      );

    if (existingShare && existingShare.rewardGranted) {
      return res.status(400).json({ error: "You have already received rewards for sharing on this platform" });
    }

    // Check if raffle has social sharing enabled and get reward configuration
    if (!raffle.social_sharing_enabled) {
      return res.status(400).json({ error: "Social sharing is not enabled for this raffle" });
    }

    const socialRewards = raffle.social_sharing_rewards || [];
    const rewardConfig = socialRewards.find((reward: any) => reward.platform === platform);

    if (!rewardConfig) {
      return res.status(400).json({ error: "No rewards configured for this platform in this raffle" });
    }

    // Check per-user limits for this raffle
    if (rewardConfig.maxRewardsPerUser) {
      const [userShareCount] = await db
        .select({ count: count() })
        .from(socialShares)
        .where(
          and(
            eq(socialShares.userId, req.user.id),
            eq(socialShares.raffleId, raffleId),
            eq(socialShares.platform, platform),
            eq(socialShares.rewardGranted, true)
          )
        );

      if (userShareCount.count >= rewardConfig.maxRewardsPerUser) {
        return res.status(400).json({ error: "You have reached the maximum rewards for this platform on this raffle" });
      }
    }

    // Check per-raffle limits
    if (rewardConfig.maxRewardsPerRaffle) {
      const [raffleShareCount] = await db
        .select({ count: count() })
        .from(socialShares)
        .where(
          and(
            eq(socialShares.raffleId, raffleId),
            eq(socialShares.platform, platform),
            eq(socialShares.rewardGranted, true)
          )
        );

      if (raffleShareCount.count >= rewardConfig.maxRewardsPerRaffle) {
        return res.status(400).json({ error: "Maximum rewards reached for this platform on this raffle" });
      }
    }

    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    let shareRecord;

    if (existingShare) {
      // Update existing share
      [shareRecord] = await db
        .update(socialShares)
        .set({
          shareUrl,
          shareData,
          verified: true,
          rewardGranted: true,
          rewardTickets: rewardConfig.rewardAmount,
          verifiedAt: new Date(),
          ipAddress,
          userAgent,
        })
        .where(eq(socialShares.id, existingShare.id))
        .returning();
    } else {
      // Create new share record
      [shareRecord] = await db
        .insert(socialShares)
        .values({
          userId: req.user.id,
          raffleId,
          platform,
          shareUrl,
          shareData,
          verified: true,
          rewardGranted: true,
          rewardTickets: rewardConfig.rewardAmount,
          verifiedAt: new Date(),
          ipAddress,
          userAgent,
        })
        .returning();
    }

    // Generate random ticket numbers for the reward
    const ticketNumbers = [];
    for (let i = 0; i < rewardConfig.rewardAmount; i++) {
      // Generate a random ticket number between 1 and max_tickets
      const ticketNumber = Math.floor(Math.random() * raffle.maxTickets) + 1;
      ticketNumbers.push(ticketNumber);
    }

    // Add raffle entries for the free tickets
    const entryPromises = ticketNumbers.map(ticketNumber =>
      db.insert(raffleEntries).values({
        userId: req.user.id,
        raffleId,
        ticketNumber,
        paymentStatus: "completed", // Free tickets are automatically completed
        paymentIntentId: `social_share_${shareRecord.id}`,
        amount: "0.00",
        purchasedAt: new Date(),
        isInstantWin: false,
      })
    );

    await Promise.all(entryPromises);

    res.json({
      message: "Share recorded and rewards granted!",
      rewardTickets: rewardConfig.rewardAmount,
      ticketNumbers,
      shareId: shareRecord.id,
    });

  } catch (error) {
    console.error("Error recording social share:", error);
    res.status(500).json({ error: "Failed to record social share" });
  }
});

// Admin: Get all social share rewards (for management)
router.get("/admin/social-share-rewards", async (req: any, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const rewards = await db
      .select()
      .from(socialShareRewards)
      .orderBy(socialShareRewards.platform);

    res.json(rewards);
  } catch (error) {
    console.error("Error fetching admin social share rewards:", error);
    res.status(500).json({ error: "Failed to fetch social share rewards" });
  }
});

// Admin: Create/update social share reward
router.post("/admin/social-share-rewards", async (req: any, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const {
      platform,
      rewardType,
      rewardAmount,
      isActive,
      maxRewardsPerUser,
      maxRewardsPerRaffle,
      description
    } = req.body;

    if (!platform || !rewardAmount) {
      return res.status(400).json({ error: "Platform and reward amount are required" });
    }

    // Check if reward already exists for this platform
    const [existingReward] = await db
      .select()
      .from(socialShareRewards)
      .where(eq(socialShareRewards.platform, platform));

    let result;

    if (existingReward) {
      // Update existing reward
      [result] = await db
        .update(socialShareRewards)
        .set({
          rewardType: rewardType || "tickets",
          rewardAmount,
          isActive: isActive !== undefined ? isActive : true,
          maxRewardsPerUser,
          maxRewardsPerRaffle,
          description,
          updatedAt: new Date(),
        })
        .where(eq(socialShareRewards.id, existingReward.id))
        .returning();
    } else {
      // Create new reward
      [result] = await db
        .insert(socialShareRewards)
        .values({
          platform,
          rewardType: rewardType || "tickets",
          rewardAmount,
          isActive: isActive !== undefined ? isActive : true,
          maxRewardsPerUser,
          maxRewardsPerRaffle,
          description,
        })
        .returning();
    }

    res.json(result);
  } catch (error) {
    console.error("Error saving social share reward:", error);
    res.status(500).json({ error: "Failed to save social share reward" });
  }
});

// Admin: Delete social share reward
router.delete("/admin/social-share-rewards/:id", async (req: any, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { id } = req.params;

    await db
      .delete(socialShareRewards)
      .where(eq(socialShareRewards.id, parseInt(id)));

    res.json({ message: "Social share reward deleted successfully" });
  } catch (error) {
    console.error("Error deleting social share reward:", error);
    res.status(500).json({ error: "Failed to delete social share reward" });
  }
});

// Admin: Get all social shares with analytics
router.get("/admin/social-shares", async (req: any, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const shares = await db
      .select({
        id: socialShares.id,
        userId: socialShares.userId,
        raffleId: socialShares.raffleId,
        platform: socialShares.platform,
        verified: socialShares.verified,
        rewardGranted: socialShares.rewardGranted,
        rewardTickets: socialShares.rewardTickets,
        createdAt: socialShares.createdAt,
        verifiedAt: socialShares.verifiedAt,
        raffleName: raffles.name,
      })
      .from(socialShares)
      .leftJoin(raffles, eq(socialShares.raffleId, raffles.id))
      .orderBy(desc(socialShares.createdAt));

    res.json(shares);
  } catch (error) {
    console.error("Error fetching admin social shares:", error);
    res.status(500).json({ error: "Failed to fetch social shares" });
  }
});

export default router;