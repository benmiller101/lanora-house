import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { storage } from "./storage";
import type { Express } from "express";

export function setupSocialAuth(app: Express) {
  const customDomain = process.env.CUSTOM_DOMAIN || process.env.BASE_URL;
  const baseURL = customDomain
    ? (customDomain.startsWith('http') ? customDomain : `https://${customDomain}`)
    : 'http://localhost:5000';
  

  // Check if Facebook credentials are available
  if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_CLIENT_ID,
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          callbackURL: `${baseURL}/api/auth/facebook/callback`,
          profileFields: ["id", "emails", "name", "picture.type(large)"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            const firstName = profile.name?.givenName;
            const lastName = profile.name?.familyName;
            const profileImageUrl = profile.photos?.[0]?.value;

            if (!email) {
              return done(new Error("No email found in Facebook profile"));
            }

            // Check if user exists by email (username field)
            let user = await storage.getUserByUsername(email);
            
            if (!user) {
              // Create new user - use email as username and generate Facebook-specific user ID
              // Use placeholder password for OAuth users since they authenticate via Facebook
              user = await storage.upsertUser({
                id: `facebook_${profile.id}`,
                email,
                username: email,
                password: `oauth_facebook_${profile.id}_${Date.now()}`, // Placeholder password for OAuth
                firstName: firstName || null,
                lastName: lastName || null,
                profileImageUrl: profileImageUrl || null,
                role: 'user',
              });
            }

            return done(null, user);
          } catch (error) {
            console.error("Facebook auth error:", error);
            return done(error);
          }
        }
      )
    );

    // Facebook OAuth routes
    app.get(
      "/api/auth/facebook",
      passport.authenticate("facebook", { scope: ["email"] })
    );

    app.get(
      "/api/auth/facebook/callback",
      passport.authenticate("facebook", { failureRedirect: "/login" }),
      (req: any, res) => {
        try {
          // Set up session data for our authentication system
          if (req.user) {
            console.log("🔗 Facebook OAuth successful, setting up session for:", req.user.email);
            req.session.user = {
              id: req.user.id,
              email: req.user.email,
              firstName: req.user.firstName,
              lastName: req.user.lastName,
              role: req.user.role || 'user'
            };
            
            req.session.save((err: any) => {
              if (err) {
                console.error("Session save error:", err);
              } else {
                console.log("✅ Session saved successfully for Facebook OAuth user");
              }
              res.redirect("/");
            });
          } else {
            console.error("❌ No user data in Facebook OAuth callback");
            res.redirect("/login");
          }
        } catch (error) {
          console.error("Facebook OAuth callback error:", error);
          res.redirect("/login");
        }
      }
    );
  }

  // Serialize and deserialize user for session management
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}