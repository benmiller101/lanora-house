import type { Express } from "express";
import { walletService } from "./wallet-service";
import { walletTopupSchema, walletWithdrawalSchema } from "@shared/schema";

export function registerWalletRoutes(app: Express) {
  console.log("🔧 Registering wallet routes...");

  // Get wallet balance and info
  app.get("/api/wallet", async (req: any, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.session.user.id;
      const wallet = await walletService.getOrCreateWallet(userId);
      const balance = await walletService.getWalletBalance(userId);

      res.json({
        wallet,
        balance,
        balanceFormatted: `£${balance.toFixed(2)}`
      });
    } catch (error) {
      console.error("Error getting wallet:", error);
      res.status(500).json({ message: "Failed to get wallet information" });
    }
  });

  // Get wallet transaction history
  app.get("/api/wallet/transactions", async (req: any, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.session.user.id;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const transactions = await walletService.getTransactionHistory(userId, limit);

      res.json({
        transactions: transactions.map(t => ({
          ...t,
          amountFormatted: `£${parseFloat(t.amount).toFixed(2)}`,
          isCredit: t.type === 'credit',
          isDebit: t.type === 'debit'
        }))
      });
    } catch (error) {
      console.error("Error getting transaction history:", error);
      res.status(500).json({ message: "Failed to get transaction history" });
    }
  });

  // Wallet topup
  app.post("/api/wallet/topup", async (req: any, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.session.user.id;
      const validatedData = walletTopupSchema.parse(req.body);

      // For development, simulate successful payment
      // TODO: Integrate with actual Paytriot/PayPal APIs
      const mockPaymentId = `topup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const topup = await walletService.processTopup(
        userId,
        validatedData.amount,
        validatedData.paymentMethod,
        mockPaymentId
      );

      const newBalance = await walletService.getWalletBalance(userId);

      res.json({
        success: true,
        topup,
        newBalance,
        newBalanceFormatted: `£${newBalance.toFixed(2)}`,
        message: `Successfully added £${validatedData.amount.toFixed(2)} to your wallet`
      });
    } catch (error: any) {
      console.error("Error processing topup:", error);
      res.status(400).json({ 
        message: error.message || "Failed to process wallet topup" 
      });
    }
  });

  // Wallet withdrawal
  app.post("/api/wallet/withdraw", async (req: any, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.session.user.id;
      const validatedData = walletWithdrawalSchema.parse(req.body);

      // For development, simulate successful withdrawal processing
      // TODO: Integrate with actual Paytriot/PayPal APIs
      const mockTransactionId = `withdraw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const withdrawal = await walletService.processWithdrawal(
        userId,
        validatedData.amount,
        validatedData.withdrawalMethod,
        validatedData.withdrawalDetails,
        mockTransactionId
      );

      const newBalance = await walletService.getWalletBalance(userId);

      res.json({
        success: true,
        withdrawal,
        newBalance,
        newBalanceFormatted: `£${newBalance.toFixed(2)}`,
        message: `Successfully processed withdrawal of £${validatedData.amount.toFixed(2)}`
      });
    } catch (error: any) {
      console.error("Error processing withdrawal:", error);
      res.status(400).json({ 
        message: error.message || "Failed to process withdrawal" 
      });
    }
  });

  // Use wallet for purchase (called from checkout process)
  app.post("/api/wallet/use-for-purchase", async (req: any, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.session.user.id;
      const { amount, orderId, description } = req.body;

      if (!amount || !orderId) {
        return res.status(400).json({ message: "Amount and order ID required" });
      }

      const result = await walletService.useWalletForPurchase(
        userId,
        amount,
        orderId,
        description || "Purchase payment"
      );

      const newBalance = await walletService.getWalletBalance(userId);

      res.json({
        success: true,
        transaction: result.transaction,
        newBalance,
        newBalanceFormatted: `£${newBalance.toFixed(2)}`,
        message: `Payment of £${amount.toFixed(2)} processed from wallet`
      });
    } catch (error: any) {
      console.error("Error using wallet for purchase:", error);
      res.status(400).json({ 
        message: error.message || "Failed to process wallet payment" 
      });
    }
  });

  // Admin: Get wallet statistics
  app.get("/api/admin/wallet/stats", async (req: any, res) => {
    try {
      // TODO: Add admin authentication check
      const stats = await walletService.getWalletStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting wallet stats:", error);
      res.status(500).json({ message: "Failed to get wallet statistics" });
    }
  });

  // Admin: Add test credit to wallet
  app.post("/api/admin/wallet/add-credit", async (req: any, res) => {
    try {
      // Check admin authentication
      const session = req.session as any;
      if (!session?.user || session.user.role !== "admin") {
        return res.status(401).json({ message: "Admin access required" });
      }

      const { userId, amount, description } = req.body;

      if (!userId || !amount) {
        return res.status(400).json({ message: "User ID and amount are required" });
      }

      if (amount <= 0) {
        return res.status(400).json({ message: "Amount must be positive" });
      }

      const result = await walletService.addCredit(
        userId,
        amount,
        description || "Admin test credit",
        "credit"
      );

      const newBalance = await walletService.getWalletBalance(userId);

      res.json({
        success: true,
        result,
        newBalance,
        newBalanceFormatted: `£${newBalance.toFixed(2)}`,
        message: `Successfully added £${amount.toFixed(2)} to wallet`
      });
    } catch (error: any) {
      console.error("Error adding admin credit:", error);
      res.status(400).json({ 
        message: error.message || "Failed to add credit to wallet" 
      });
    }
  });

  console.log("✅ Wallet routes registered successfully");
}