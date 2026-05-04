import { db } from "./db";
import { pool } from './db'; 
import { 
  walletTransactions, 
  walletTopups, 
  walletWithdrawals,
  notifications,
  users
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export class WalletService {
  
  // Map session user IDs to database user IDs 
  private mapUserId(sessionUserId: string): string {
    // Handle the admin user ID mapping
    if (sessionUserId === 'admin') {
      return 'admin_001';
    }
    return sessionUserId;
  }
  
  // Get or create wallet for user
  async getOrCreateWallet(userId: string) {
    try {
      // Map the user ID to the correct database user ID
      const dbUserId = this.mapUserId(userId);
      
      // Use the correct member_wallets table
      const walletResult = await pool.query(`
        SELECT * FROM member_wallets WHERE user_id = $1
      `, [dbUserId]);
      
      let wallet = walletResult.rows[0];
      
      if (!wallet) {
        const insertResult = await pool.query(`
          INSERT INTO member_wallets (user_id, balance, created_at, updated_at) 
          VALUES ($1, 0.00, NOW(), NOW()) 
          RETURNING *
        `, [dbUserId]);
        wallet = insertResult.rows[0];
      }

      return wallet;
    } catch (error) {
      console.error("Error getting/creating wallet:", error);
      throw new Error("Failed to access wallet");
    }
  }

  // Get wallet balance
  async getWalletBalance(userId: string): Promise<number> {
    try {
      const wallet = await this.getOrCreateWallet(userId);
      return parseFloat(wallet.balance);
    } catch (error) {
      console.error("Error getting wallet balance:", error);
      return 0;
    }
  }

  // Add credit to wallet (instant wins, raffle wins, topups)
  async addCredit(
    userId: string, 
    amount: number, 
    description: string, 
    type: 'instant_win' | 'raffle_win' | 'topup' | 'credit',
    referenceId?: string,
    referenceType?: string,
    paymentMethod?: string,
    externalTransactionId?: string
  ) {
    try {
      const wallet = await this.getOrCreateWallet(userId);
      const newBalance = parseFloat(wallet.balance) + amount;

      // Update wallet balance
      await db
        .update(memberWallets)
        .set({ 
          balance: newBalance.toFixed(2),
          updatedAt: new Date()
        })
        .where(eq(memberWallets.id, wallet.id));

      // Create transaction record
      const [transaction] = await db
        .insert(walletTransactions)
        .values({
          userId,
          walletId: wallet.id,
          type: 'credit',
          amount: amount.toFixed(2),
          description,
          referenceId,
          referenceType: type,
          status: 'completed',
          paymentMethod,
          externalTransactionId
        })
        .returning();

      // Create notification for credit
      await this.createWalletNotification(
        userId, 
        `£${amount.toFixed(2)} has been added to your wallet: ${description}`,
        'success'
      );

      console.log(`💰 WALLET: Added £${amount.toFixed(2)} credit to user ${userId}`);
      return { wallet: { ...wallet, balance: newBalance.toFixed(2) }, transaction };
    } catch (error) {
      console.error("Error adding wallet credit:", error);
      throw new Error("Failed to add credit to wallet");
    }
  }

  // Debit from wallet (purchases, withdrawals)
  async debitWallet(
    userId: string,
    amount: number,
    description: string,
    type: 'purchase' | 'withdrawal' | 'debit',
    referenceId?: string,
    referenceType?: string,
    paymentMethod?: string,
    externalTransactionId?: string
  ) {
    try {
      const wallet = await this.getOrCreateWallet(userId);
      const currentBalance = parseFloat(wallet.balance);

      if (currentBalance < amount) {
        throw new Error("Insufficient wallet balance");
      }

      const newBalance = currentBalance - amount;

      // Update wallet balance
      await db
        .update(memberWallets)
        .set({ 
          balance: newBalance.toFixed(2),
          updatedAt: new Date()
        })
        .where(eq(memberWallets.id, wallet.id));

      // Create transaction record
      const [transaction] = await db
        .insert(walletTransactions)
        .values({
          userId,
          walletId: wallet.id,
          type: 'debit',
          amount: amount.toFixed(2),
          description,
          referenceId,
          referenceType: type,
          status: 'completed',
          paymentMethod,
          externalTransactionId
        })
        .returning();

      console.log(`💸 WALLET: Debited £${amount.toFixed(2)} from user ${userId}`);
      return { wallet: { ...wallet, balance: newBalance.toFixed(2) }, transaction };
    } catch (error) {
      console.error("Error debiting wallet:", error);
      throw error;
    }
  }

  // Get wallet transaction history
  async getTransactionHistory(userId: string, limit: number = 50) {
    try {
      const transactions = await db
        .select()
        .from(walletTransactions)
        .where(eq(walletTransactions.userId, userId))
        .orderBy(desc(walletTransactions.createdAt))
        .limit(limit);

      return transactions;
    } catch (error) {
      console.error("Error getting transaction history:", error);
      throw new Error("Failed to get transaction history");
    }
  }

  // Process wallet topup
  async processTopup(
    userId: string,
    amount: number,
    paymentMethod: string,
    externalPaymentId: string
  ) {
    try {
      // Create topup record
      const [topup] = await db
        .insert(walletTopups)
        .values({
          userId,
          amount: amount.toFixed(2),
          paymentMethod,
          paymentStatus: 'completed',
          externalPaymentId
        })
        .returning();

      // Add credit to wallet
      await this.addCredit(
        userId,
        amount,
        `Wallet topup via ${paymentMethod}`,
        'topup',
        topup.id.toString(),
        'wallet_topup',
        paymentMethod,
        externalPaymentId
      );

      return topup;
    } catch (error) {
      console.error("Error processing topup:", error);
      throw new Error("Failed to process topup");
    }
  }

  // Process wallet withdrawal
  async processWithdrawal(
    userId: string,
    amount: number,
    withdrawalMethod: string,
    withdrawalDetails: any,
    externalTransactionId?: string
  ) {
    try {
      // Check if user has sufficient balance
      const balance = await this.getWalletBalance(userId);
      if (balance < amount) {
        throw new Error("Insufficient wallet balance for withdrawal");
      }

      // Create withdrawal record
      const [withdrawal] = await db
        .insert(walletWithdrawals)
        .values({
          userId,
          amount: amount.toFixed(2),
          withdrawalMethod,
          withdrawalDetails,
          status: 'completed',
          externalTransactionId,
          processedAt: new Date()
        })
        .returning();

      // Debit from wallet
      await this.debitWallet(
        userId,
        amount,
        `Withdrawal via ${withdrawalMethod}`,
        'withdrawal',
        withdrawal.id.toString(),
        'wallet_withdrawal',
        withdrawalMethod,
        externalTransactionId
      );

      return withdrawal;
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      throw error;
    }
  }

  // Credit instant win to wallet
  async creditInstantWin(userId: string, winAmount: number, instantWinId: string) {
    try {
      return await this.addCredit(
        userId,
        winAmount,
        `Instant win prize`,
        'instant_win',
        instantWinId,
        'instant_win'
      );
    } catch (error) {
      console.error("Error crediting instant win:", error);
      throw new Error("Failed to credit instant win to wallet");
    }
  }

  // Credit raffle win to wallet
  async creditRaffleWin(userId: string, winAmount: number, raffleId: string) {
    try {
      return await this.addCredit(
        userId,
        winAmount,
        `Prize draw winnings`,
        'raffle_win',
        raffleId,
        'raffle_win'
      );
    } catch (error) {
      console.error("Error crediting raffle win:", error);
      throw new Error("Failed to credit prize draw win to wallet");
    }
  }

  // Use wallet for purchase
  async useWalletForPurchase(
    userId: string,
    amount: number,
    orderId: string,
    description: string = "Purchase payment"
  ) {
    try {
      return await this.debitWallet(
        userId,
        amount,
        description,
        'purchase',
        orderId,
        'order'
      );
    } catch (error) {
      console.error("Error using wallet for purchase:", error);
      throw error;
    }
  }

  // Create wallet notification
  private async createWalletNotification(
    userId: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) {
    try {
      await db.insert(notifications).values({
        userId,
        message,
        type,
        isRead: false
      });
    } catch (error) {
      console.error("Error creating wallet notification:", error);
      // Don't throw - notifications are not critical
    }
  }

  // Get wallet stats for admin
  async getWalletStats() {
    try {
      // This would need more complex queries in a real implementation
      // For now, return basic stats
      return {
        totalWallets: 0,
        totalBalance: 0,
        totalTransactions: 0,
        recentTransactions: []
      };
    } catch (error) {
      console.error("Error getting wallet stats:", error);
      return {
        totalWallets: 0,
        totalBalance: 0,
        totalTransactions: 0,
        recentTransactions: []
      };
    }
  }
}

export const walletService = new WalletService();