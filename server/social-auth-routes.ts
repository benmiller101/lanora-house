import { Router, Request, Response } from "express";
import { pool } from "./db";

const router = Router();

// Store social account connections
router.post("/connect/:platform", async (req: any, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { platform } = req.params;
    const { accessToken, profileId, profileName, profileUrl } = req.body;

    // Validate platform
    const validPlatforms = ['instagram', 'facebook', 'twitter', 'tiktok', 'linkedin', 'snapchat'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ error: "Invalid platform" });
    }

    // Check if account is already connected by another user
    const existingConnection = await pool.query(
      'SELECT user_id FROM user_social_accounts WHERE platform = $1 AND profile_id = $2',
      [platform, profileId]
    );

    if (existingConnection.rows.length > 0 && existingConnection.rows[0].user_id !== req.user.id) {
      return res.status(409).json({ error: "This social account is already connected to another user" });
    }

    // Insert or update social account connection
    await pool.query(`
      INSERT INTO user_social_accounts (user_id, platform, profile_id, profile_name, profile_url, access_token, connected_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (user_id, platform)
      DO UPDATE SET
        profile_id = EXCLUDED.profile_id,
        profile_name = EXCLUDED.profile_name,
        profile_url = EXCLUDED.profile_url,
        access_token = EXCLUDED.access_token,
        connected_at = NOW()
    `, [req.user.id, platform, profileId, profileName, profileUrl, accessToken]);

    res.json({ 
      success: true, 
      message: `${platform} account connected successfully`,
      platform,
      profileName
    });
  } catch (error) {
    console.error("Error connecting social account:", error);
    res.status(500).json({ error: "Failed to connect social account" });
  }
});

// Disconnect social account
router.delete("/disconnect/:platform", async (req: any, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { platform } = req.params;

    await pool.query(
      'DELETE FROM user_social_accounts WHERE user_id = $1 AND platform = $2',
      [req.user.id, platform]
    );

    res.json({ 
      success: true, 
      message: `${platform} account disconnected successfully` 
    });
  } catch (error) {
    console.error("Error disconnecting social account:", error);
    res.status(500).json({ error: "Failed to disconnect social account" });
  }
});

// Get user's connected social accounts
router.get("/connected", async (req: any, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const result = await pool.query(
      'SELECT platform, profile_id, profile_name, profile_url, connected_at FROM user_social_accounts WHERE user_id = $1',
      [req.user.id]
    );

    const connectedAccounts = result.rows.reduce((acc, row) => {
      acc[row.platform] = {
        profileId: row.profile_id,
        profileName: row.profile_name,
        profileUrl: row.profile_url,
        connectedAt: row.connected_at
      };
      return acc;
    }, {});

    res.json({ connectedAccounts });
  } catch (error) {
    console.error("Error fetching connected accounts:", error);
    res.status(500).json({ error: "Failed to fetch connected accounts" });
  }
});

// OAuth callback handlers for each platform
router.get("/oauth/:platform/callback", async (req: Request, res: Response) => {
  const { platform } = req.params;
  const { code, state } = req.query;

  try {
    // This would handle the OAuth callback for each platform
    // For now, we'll return a basic response
    res.json({ 
      success: true, 
      platform, 
      message: "OAuth callback received",
      code: code ? "received" : "missing",
      state 
    });
  } catch (error) {
    console.error(`Error handling ${platform} OAuth callback:`, error);
    res.status(500).json({ error: `Failed to handle ${platform} OAuth callback` });
  }
});

// Initiate OAuth flow
router.get("/oauth/:platform/initiate", async (req: any, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { platform } = req.params;
    const userId = req.user.id;

    // Generate OAuth URLs for each platform
    const oauthUrls = {
      instagram: `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.BASE_URL + '/api/social-auth/oauth/instagram/callback')}&scope=user_profile,user_media&response_type=code&state=${userId}`,
      facebook: `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.BASE_URL + '/api/social-auth/oauth/facebook/callback')}&scope=public_profile,email&response_type=code&state=${userId}`,
      twitter: `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.BASE_URL + '/api/social-auth/oauth/twitter/callback')}&scope=tweet.read%20users.read&state=${userId}`,
      tiktok: `https://www.tiktok.com/auth/authorize/?client_key=${process.env.TIKTOK_CLIENT_KEY}&scope=user.info.basic&response_type=code&redirect_uri=${encodeURIComponent(process.env.BASE_URL + '/api/social-auth/oauth/tiktok/callback')}&state=${userId}`,
    };

    const oauthUrl = oauthUrls[platform as keyof typeof oauthUrls];
    
    if (!oauthUrl) {
      return res.status(400).json({ error: "Platform not supported for OAuth" });
    }

    res.json({ 
      oauthUrl,
      platform,
      message: `Redirect user to this URL to authorize ${platform} access`
    });
  } catch (error) {
    console.error("Error initiating OAuth flow:", error);
    res.status(500).json({ error: "Failed to initiate OAuth flow" });
  }
});

export default router;