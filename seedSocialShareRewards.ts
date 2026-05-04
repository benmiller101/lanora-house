import { db, pool } from "./server/db";

async function seedSocialShareRewards() {
  try {
    console.log("🎯 Seeding social share rewards...");
    
    // First, clean up old platform names
    await pool.query('DELETE FROM social_share_rewards WHERE platform IN ($1, $2, $3, $4)', 
      ['facebook', 'twitter', 'tiktok', 'whatsapp']);

    // Default social media platform rewards with new naming
    const platforms = [
      {
        platform: "instagram_story",
        rewardType: "tickets", 
        rewardAmount: 1,
        isActive: true,
        maxRewardsPerUser: 1,
        maxRewardsPerRaffle: null,
        description: "Share in your Instagram story to earn 1 free raffle ticket!"
      },
      {
        platform: "instagram_post",
        rewardType: "tickets",
        rewardAmount: 3,
        isActive: true,
        maxRewardsPerUser: 1,
        maxRewardsPerRaffle: null,
        description: "Create an Instagram post to earn 3 free raffle tickets!"
      },
      {
        platform: "twitter_post",
        rewardType: "tickets",
        rewardAmount: 2,
        isActive: true,
        maxRewardsPerUser: 1,
        maxRewardsPerRaffle: null,
        description: "Tweet about this raffle to earn 2 free tickets!"
      },
      {
        platform: "facebook_post",
        rewardType: "tickets",
        rewardAmount: 2,
        isActive: true,
        maxRewardsPerUser: 1,
        maxRewardsPerRaffle: null,
        description: "Share on Facebook to earn 2 free raffle tickets!"
      },
      {
        platform: "facebook_story",
        rewardType: "tickets",
        rewardAmount: 1,
        isActive: true,
        maxRewardsPerUser: 1,
        maxRewardsPerRaffle: null,
        description: "Share in your Facebook story to earn 1 free raffle ticket!"
      },
      {
        platform: "tiktok_post",
        rewardType: "tickets",
        rewardAmount: 5,
        isActive: true,
        maxRewardsPerUser: 1,
        maxRewardsPerRaffle: 10,
        description: "Create a TikTok video to earn 5 free raffle tickets!"
      }
    ];

    for (const platform of platforms) {
      // Check if platform reward already exists
      const existing = await pool.query(
        'SELECT id FROM social_share_rewards WHERE platform = $1',
        [platform.platform]
      );

      if (existing.rows.length === 0) {
        await pool.query(`
          INSERT INTO social_share_rewards (
            platform, reward_type, reward_amount, is_active, 
            max_rewards_per_user, max_rewards_per_raffle, description
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          platform.platform,
          platform.rewardType,
          platform.rewardAmount,
          platform.isActive,
          platform.maxRewardsPerUser,
          platform.maxRewardsPerRaffle,
          platform.description
        ]);
        
        console.log(`✅ Added ${platform.platform} reward (${platform.rewardAmount} tickets)`);
      } else {
        console.log(`⏭️  ${platform.platform} reward already exists`);
      }
    }

    console.log("🎉 Social share rewards seeding completed!");

  } catch (error) {
    console.error("❌ Error seeding social share rewards:", error);
  }
}

seedSocialShareRewards();