import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "./db";
import { users, passwordResetTokens } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    mobile: string;
    username?: string;
    emailMarketingConsent?: boolean;
  }) {
    const hashedPassword = await this.hashPassword(userData.password);
    
    // Generate unique ID
    const userId = `user_${userData.email.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`;
    
    const [user] = await db.insert(users).values({
      id: userId,
      email: userData.email,
      username: userData.username || userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      mobile: userData.mobile,
      role: "user",
      emailVerified: false,
      emailMarketingConsent: userData.emailMarketingConsent || false,
      emailMarketingConsentDate: userData.emailMarketingConsent ? new Date() : null,
    }).returning();

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async authenticateUser(email: string, password: string) {
    console.log("🔐 Authenticating user:", email);
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      console.log("❌ User not found in database");
      throw new Error("Invalid email or password");
    }

    console.log("✅ User found:", user.email, "Hash starts with:", user.password.substring(0, 10));
    const isValidPassword = await this.verifyPassword(password, user.password);
    console.log("🔑 Password verification result:", isValidPassword);
    
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async getUserById(userId: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return null;
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async getUserByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return null;
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async createPasswordResetToken(email: string) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new Error("No user found with this email address");
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
      used: false,
    });

    return { token, user };
  }

  static async resetPassword(token: string, newPassword: string) {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false)
        )
      )
      .limit(1);

    if (!resetToken) {
      throw new Error("Invalid or expired reset token");
    }

    if (resetToken.expiresAt < new Date()) {
      throw new Error("Reset token has expired");
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update user password
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, resetToken.userId));

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, resetToken.id));

    return await this.getUserById(resetToken.userId);
  }

  static async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error("User not found");
    }

    const isValidPassword = await this.verifyPassword(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    const hashedPassword = await this.hashPassword(newPassword);
    
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));

    return await this.getUserById(userId);
  }
}