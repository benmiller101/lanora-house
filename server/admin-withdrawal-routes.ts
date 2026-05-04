import type { Express } from "express";
import { storage } from "./storage-db";
import { requireAdmin } from "./middleware/security";

export function registerAdminWithdrawalRoutes(app: Express) {
  // Get all withdrawals for admin panel
  app.get("/api/admin/withdrawals", requireAdmin, async (req, res) => {
    try {
      console.log("💰 Admin fetching all withdrawals");

      const withdrawals = await storage.getAllWithdrawalsForAdmin();
      
      console.log(`💰 Found ${withdrawals.length} withdrawals for admin`);
      res.json(withdrawals);
    } catch (error) {
      console.error("Error fetching admin withdrawals:", error);
      res.status(500).json({ error: "Failed to fetch withdrawals" });
    }
  });

  // Process withdrawal (complete or reject)
  app.post("/api/admin/withdrawals/:withdrawalId/process", requireAdmin, async (req, res) => {
    try {
      const { withdrawalId } = req.params;
      const { action, transactionId, notes } = req.body;

      console.log(`💰 Admin processing withdrawal ${withdrawalId}: ${action}`);

      if (!action || !['complete', 'reject'].includes(action)) {
        return res.status(400).json({ error: "Invalid action. Must be 'complete' or 'reject'" });
      }

      const withdrawal = await storage.getWithdrawalById(parseInt(withdrawalId));
      if (!withdrawal) {
        return res.status(404).json({ error: "Withdrawal not found" });
      }

      if (withdrawal.status !== 'pending') {
        return res.status(400).json({ error: "Withdrawal is not pending" });
      }

      let newStatus;
      let processingNotes = notes || '';

      if (action === 'complete') {
        // Mark withdrawal as completed
        newStatus = 'completed';
        processingNotes = `✅ Manually processed by admin. ${transactionId ? `Reference: ${transactionId}` : ''} ${notes || ''}`.trim();
        
        console.log(`💰 Withdrawal ${withdrawalId} marked as completed by admin`);
      } else {
        // Reject withdrawal and return funds to user
        newStatus = 'failed';
        processingNotes = `❌ Rejected by admin. ${notes || 'No reason provided.'}`;
        
        // Return instant wins to unclaimed status
        await storage.returnInstantWinsToUser(withdrawal.user_id, withdrawal.amount);
        
        console.log(`💰 Withdrawal ${withdrawalId} rejected, funds returned to user`);
      }

      // Update withdrawal status
      const updatedWithdrawal = await storage.updateWithdrawalStatus(
        parseInt(withdrawalId),
        newStatus,
        transactionId || `admin_${action}_${Date.now()}`,
        processingNotes
      );

      res.json({
        success: true,
        message: action === 'complete' 
          ? "Withdrawal marked as completed successfully"
          : "Withdrawal rejected and funds returned to user",
        withdrawal: updatedWithdrawal
      });

    } catch (error) {
      console.error("Error processing withdrawal:", error);
      res.status(500).json({ error: "Failed to process withdrawal" });
    }
  });

  // Get withdrawal statistics for admin dashboard
  app.get("/api/admin/withdrawals/stats", requireAdmin, async (req, res) => {
    try {
      console.log("💰 Admin fetching withdrawal stats");

      const stats = await storage.getWithdrawalStats();
      
      console.log("💰 Withdrawal stats:", stats);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching withdrawal stats:", error);
      res.status(500).json({ error: "Failed to fetch withdrawal statistics" });
    }
  });
}