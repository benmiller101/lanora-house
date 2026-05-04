import { Router, Request, Response } from "express";
import { AuthService } from "./auth-service";
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "@shared/schema";
import { z } from "zod";
import { sendPasswordResetEmail } from "./email-service";

const router = Router();

// Register new user
router.post("/register", async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await AuthService.getUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Create new user
    const user = await AuthService.createUser({
      email: validatedData.email,
      password: validatedData.password,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      mobile: validatedData.mobile,
      username: validatedData.username || validatedData.email, // Use email as username if not provided
      emailMarketingConsent: validatedData.emailMarketingConsent || false,
    });

    // Set session with user object (not just userId)
    (req as any).session.user = user;
    (req as any).session.userId = user.id;
    
    res.status(201).json({ user });
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: error instanceof Error ? error.message : "Registration failed" });
  }
});

// Login user
router.post("/login", async (req: Request, res: Response) => {
  try {
    console.log("🔐 Login route hit with body:", req.body);
    // Trim whitespace from email and password
    const cleanedBody = {
      email: req.body.email?.trim(),
      password: req.body.password?.trim()
    };
    const validatedData = loginSchema.parse(cleanedBody);
    
    const user = await AuthService.authenticateUser(validatedData.email, validatedData.password);
    console.log("✅ Authentication successful, setting session for:", user.id);
    
    // Set session with full user object matching the expected format
    (req as any).session.user = user;
    (req as any).session.userId = user.id;
    
    console.log("💾 Session saved, responding with user data");
    res.json({ user });
  } catch (error) {
    console.error("❌ Login error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(401).json({ error: error instanceof Error ? error.message : "Login failed" });
  }
});

// Logout user
router.post("/logout", (req: Request, res: Response) => {
  (req as any).session.destroy((err: any) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

// Get current user
router.get("/user", async (req: Request, res: Response) => {
  console.log("🚀 AUTH-ROUTES ENDPOINT HIT - /api/auth/user");
  try {
    console.log("🔍 Auth check - Session exists:", !!req.session);
    console.log("🔍 Auth check - Session user:", !!(req as any).session?.user, "User ID:", (req as any).session?.user?.id);
    console.log("🔍 Auth check - Session userId:", (req as any).session?.userId);
    console.log("🔍 Auth check - Headers:", req.headers.cookie ? "Cookies present" : "No cookies");
    
    // Check for session.user first (new format)
    if ((req as any).session?.user) {
      console.log("✅ Session user found:", (req as any).session.user.email);
      return res.json((req as any).session.user);
    }
    
    // Fallback to session.userId (old format)
    const userId = (req as any).session?.userId;
    if (userId) {
      console.log("✅ Session userId found, fetching user:", userId);
      const user = await AuthService.getUserById(userId);
      if (user) {
        console.log("✅ User fetched from database:", user.email);
        return res.json(user);
      }
    }

    console.log("❌ No authentication found - returning 401");
    res.status(401).json({ error: "Not authenticated" });
  } catch (error) {
    console.error("❌ Error in auth-routes endpoint:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// Forgot password
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    
    const { token, user } = await AuthService.createPasswordResetToken(email);
    
    // Send password reset email - use production URL
    const resetUrl = `https://lanorahouse.com/reset-password?token=${encodeURIComponent(token)}`;
    console.log("📧 Password reset URL:", resetUrl);
    await sendPasswordResetEmail(user.email, user.firstName, resetUrl);
    
    res.json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error("Forgot password error:", error);
    // Always return success to prevent email enumeration
    res.json({ message: "If an account with that email exists, a password reset link has been sent" });
  }
});

// Reset password
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    
    const user = await AuthService.resetPassword(validatedData.token, validatedData.password);
    
    // Set session for the user (both userId and user object for compatibility)
    (req as any).session.user = user;
    (req as any).session.userId = user!.id;
    
    res.json({ user, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(400).json({ error: error instanceof Error ? error.message : "Password reset failed" });
  }
});

// Update password (for logged-in users)
router.put("/password", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).session?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    const user = await AuthService.updatePassword(userId, currentPassword, newPassword);
    
    res.json({ user, message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(400).json({ error: error instanceof Error ? error.message : "Password update failed" });
  }
});

export default router;