import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage-db";

// For local development, we'll use a fallback domain
const defaultDomains = "localhost:5000,127.0.0.1:5000";

// Combine Replit domains with custom domain if provided
function getAllDomains(): string[] {
  const replitDomains = (process.env.REPLIT_DOMAINS || defaultDomains).split(",");
  const customDomain = process.env.CUSTOM_DOMAIN || "www.lanorahouse.com";
  
  if (customDomain) {
    return [...replitDomains, customDomain];
  }
  
  return replitDomains;
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl / 1000, // Convert to seconds
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET || "lanora-house-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax',
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  
  // Don't set up session here - it's already done in index.ts
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of getAllDomains()) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    // Clear any existing session to ensure a fresh login
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session before login:", err);
        }
        
        // Force prompt to always show login screen and allow new account creation
        passport.authenticate(`replitauth:${req.hostname}`, {
          scope: ["openid", "email", "profile", "offline_access"]
        })(req, res, next);
      });
    } else {
      // No existing session, just authenticate directly
      passport.authenticate(`replitauth:${req.hostname}`, {
        scope: ["openid", "email", "profile", "offline_access"]
      })(req, res, next);
    }
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/members",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    console.log("Full session destruction via /api/logout");
    
    // Loop through all possible cookies and clear them
    const cookies = req.headers.cookie ? req.headers.cookie.split(';') : [];
    for (const cookie of cookies) {
      const parts = cookie.split('=');
      const name = parts[0].trim();
      res.clearCookie(name, { 
        path: '/',
        httpOnly: true,
        secure: true
      });
    }
    
    // Force clear specific cookies we know about
    res.clearCookie('connect.sid', { path: '/', httpOnly: true, secure: true });
    res.clearCookie('isAuthenticated', { path: '/' });
    res.clearCookie('user', { path: '/' });
    res.clearCookie('sid', { path: '/' });
    
    // Add cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Then destroy the session
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session during logout:", err);
        }
        
        // Reset the authentication state
        req.user = undefined;
        
        // Properly log out to completely clean passport state
        if (typeof req.logout === 'function') {
          try {
            req.logout(() => {
              // Use OpenID Connect to ensure complete logout
              try {
                const logoutUrl = `${req.protocol}://${req.hostname}/?logout=complete&t=${Date.now()}`;
                
                // Redirect to complete the logout process
                res.redirect(logoutUrl);
              } catch (e) {
                console.error("Error building end session URL:", e);
                // Fallback to root if we can't build the logout URL
                res.redirect(`/?logout=complete&t=${Date.now()}`);
              }
            });
          } catch (e) {
            console.error("Error during req.logout():", e);
            res.redirect(`/?logout=complete&t=${Date.now()}`);
          }
        } else {
          // Fallback if logout function is not available
          res.redirect(`/?logout=complete&t=${Date.now()}`);
        }
      });
    } else {
      // Fallback if session doesn't exist
      res.redirect(`/?logout=complete&t=${Date.now()}`);
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    // Check session-based authentication first
    if (req.session?.user) {
      console.log("Session-based auth successful:", req.session.user.id);
      req.user = req.session.user;
      return next();
    }
    
    // Also check if user is set directly on req.user by login route
    if (req.user) {
      console.log("Direct req.user auth successful:", req.user.id);
      return next();
    }
    
    // Check Replit OAuth user
    const user = req.user as any;
    
    if (!user) {
      console.log("No user found in request - session or OAuth");
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if token is expired
    if (user.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      if (now > user.expires_at) {
        console.log("Token expired, attempting refresh");
        
        const refreshToken = user.refresh_token;
        if (!refreshToken) {
          console.log("No refresh token available");
          return res.status(401).json({ message: "Unauthorized" });
        }

        try {
          const config = await getOidcConfig();
          const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
          updateUserSession(user, tokenResponse);
          console.log("Token refreshed successfully");
        } catch (error) {
          console.error("Token refresh failed:", error);
          return res.status(401).json({ message: "Unauthorized" });
        }
      }
    }
    
    return next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};