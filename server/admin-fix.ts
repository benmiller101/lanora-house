import { Request, Response } from "express";
import { ADMIN_EMAIL } from "./adminAuth";
import { pool } from "./db";

export async function querySubmissions(req: Request, res: Response) {
  try {
    // Check if tables exist
    const tableExistsQuery = `
      SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'simple_submissions') as simple_exists,
             EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'item_submissions') as item_exists;
    `;
    const tableResult = await pool.query(tableExistsQuery);
    const simpleExists = tableResult.rows[0].simple_exists;
    const itemExists = tableResult.rows[0].item_exists;
    
    console.log(`Tables exist - simple_submissions: ${simpleExists} item_submissions: ${itemExists}`);
    
    // If neither table exists, return empty array
    if (!simpleExists && !itemExists) {
      return res.json({ count: 0, data: [] });
    }

    // Get columns from simple_submissions to ensure we're handling the schema correctly
    let columnsResult;
    if (simpleExists) {
      columnsResult = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'simple_submissions';
      `);
      const columns = columnsResult.rows.map(row => row.column_name);
      console.log("Simple submissions columns:", columns);
    }
    
    // Query submissions from both tables
    let simpleSubmissions = [];
    let itemSubmissions = [];
    
    if (simpleExists) {
      console.log("Executing simple submissions query");
      const simpleResult = await pool.query(`
        SELECT * FROM simple_submissions ORDER BY created_at DESC;
      `);
      simpleSubmissions = simpleResult.rows;
      console.log(`Found ${simpleSubmissions.length} rows from simple_submissions`);
    }
    
    if (itemExists) {
      console.log("Executing item submissions query");
      const itemResult = await pool.query(`
        SELECT * FROM item_submissions ORDER BY created_at DESC;
      `);
      itemSubmissions = itemResult.rows;
      console.log(`Found ${itemSubmissions.length} rows from item_submissions`);
    }
    
    // Combine submissions and ensure they have consistent structure
    const submissions = [...simpleSubmissions, ...itemSubmissions];
    
    // Get user information to add email addresses
    const userIds = submissions.map(sub => sub.user_id).filter(Boolean);
    let userInfo = [];
    
    if (userIds.length > 0) {
      const userQuery = `
        SELECT id, email FROM users WHERE id = ANY($1);
      `;
      const userResult = await pool.query(userQuery, [userIds]);
      userInfo = userResult.rows;
      console.log(`Found email information for ${userInfo.length} users`);
    }
    
    // Enhance submissions with user email info
    const enhancedSubmissions = submissions.map(sub => {
      const user = userInfo.find(u => u.id === sub.user_id);
      return {
        ...sub,
        user_email: user?.email || null,
        photos: typeof sub.photos === 'string' ? JSON.parse(sub.photos) : sub.photos
      };
    });
    
    console.log(`Found ${enhancedSubmissions.length} total submissions across all tables`);
    return res.json({ count: enhancedSubmissions.length, data: enhancedSubmissions });
  } catch (error) {
    console.error("Error querying submissions:", error);
    return res.status(500).json({ message: "Error querying submissions", error: String(error) });
  }
}

export async function directRespondToSubmission(req: Request, res: Response) {
  try {
    const submissionId = Number(req.params.id);
    const { status, adminFeedback, adminValuation } = req.body;
    
    if (!submissionId || isNaN(submissionId)) {
      return res.status(400).json({ message: "Invalid submission ID" });
    }
    
    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    
    if (!adminFeedback) {
      return res.status(400).json({ message: "Admin feedback is required" });
    }
    
    // First try to update simple_submissions table
    try {
      const updateResult = await pool.query(`
        UPDATE simple_submissions 
        SET status = $1, 
            admin_feedback = $2, 
            admin_valuation = $3,
            updated_at = NOW()
        WHERE id = $4
        RETURNING *, 
                 (SELECT email FROM users WHERE id = user_id) as user_email;
      `, [status, adminFeedback, adminValuation || null, submissionId]);
      
      if (updateResult.rows.length > 0) {
        const submission = updateResult.rows[0];
        
        // If we want to send email notification, we can add code here
        // For example, using SendGrid or another email service
        // sendNotificationEmail(submission.user_email, status, adminFeedback);
        
        return res.json({ 
          message: `Submission ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
          data: submission
        });
      }
    } catch (error) {
      console.error("Error updating simple_submissions:", error);
    }
    
    // If that fails, try item_submissions table
    try {
      const updateResult = await pool.query(`
        UPDATE item_submissions 
        SET status = $1, 
            admin_feedback = $2, 
            estimated_value = $3,
            updated_at = NOW()
        WHERE id = $4
        RETURNING *, 
                 (SELECT email FROM users WHERE id = user_id) as user_email;
      `, [status, adminFeedback, adminValuation || null, submissionId]);
      
      if (updateResult.rows.length > 0) {
        const submission = updateResult.rows[0];
        
        // If we want to send email notification, we can add code here
        
        return res.json({ 
          message: `Submission ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
          data: submission
        });
      }
    } catch (error) {
      console.error("Error updating item_submissions:", error);
    }
    
    // If we get here, the submission wasn't found in either table
    return res.status(404).json({ message: "Submission not found" });
    
  } catch (error) {
    console.error("Error responding to submission:", error);
    return res.status(500).json({ message: "Server error", error: String(error) });
  }
}

export async function getAllSubmissionsFixed(req: Request, res: Response) {
  return querySubmissions(req, res);
}