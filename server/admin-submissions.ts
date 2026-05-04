import { Request, Response } from 'express';
import { pool } from './db';
import { ADMIN_EMAIL, isAdminUser } from './adminAuth';

// Get all submissions with optional status filter
export async function getAllSubmissions(req: Request, res: Response) {
  try {
    // Authentication is handled by requireAdmin middleware
    
    // Check both table sources - the original item_submissions table and our simplified table
    let submissions = [];
    
    try {
      // Try to get submissions from the original table
      let query = `SELECT * FROM item_submissions`;
      const params: any[] = [];
      
      if (req.query.status) {
        query += ` WHERE status = $1`;
        params.push(req.query.status);
      }
      
      query += ` ORDER BY created_at DESC`;
      
      const result = await pool.query(query, params);
      submissions = [...result.rows];
    } catch (error) {
      console.log('Error fetching from item_submissions table:', error);
      // Continue to next table if this one fails
    }
    
    try {
      // Check if simple_submissions table exists and get data from it
      const checkTableQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'simple_submissions'
        );
      `;
      
      const tableExists = await pool.query(checkTableQuery);
      
      if (tableExists.rows[0].exists) {
        // Get data from simple_submissions table
        let query = `SELECT * FROM simple_submissions`;
        const params: any[] = [];
        
        if (req.query.status) {
          query += ` WHERE status = $1`;
          params.push(req.query.status);
        }
        
        query += ` ORDER BY created_at DESC`;
        
        const result = await pool.query(query, params);
        
        // Map simple_submissions fields to match item_submissions format
        const mappedSimpleSubmissions = result.rows.map(row => ({
          id: row.id,
          user_id: row.user_id,
          title: row.title,
          description: row.description,
          type: row.type,
          condition: row.condition,
          photos: row.photos,
          estimated_value: row.estimated_value,
          status: row.status,
          admin_feedback: null,
          created_at: row.created_at,
          updated_at: null
        }));
        
        submissions = [...submissions, ...mappedSimpleSubmissions];
      }
    } catch (error) {
      console.log('Error fetching from simple_submissions table:', error);
    }
    
    return res.json({ data: submissions });
  } catch (error) {
    console.error('Error fetching item submissions:', error);
    return res.status(500).json({ message: 'Failed to fetch item submissions' });
  }
}

// Respond to a submission (approve or reject)
export async function respondToSubmission(req: Request, res: Response) {
  try {
    // Authentication is handled by requireAdmin middleware
    
    const id = parseInt(req.params.id);
    const { status, adminFeedback, adminValuation, offerAmount } = req.body;
    
    // Validate input
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    // If approving, validate offer amount
    if (status === 'approved' && (!offerAmount || parseFloat(offerAmount) <= 0)) {
      return res.status(400).json({ message: 'Valid offer amount is required when approving submissions' });
    }
    
    // Try to update the submission in the item_submissions table first
    try {
      const query = `
        UPDATE item_submissions
        SET status = $1,
            admin_feedback = $2,
            estimated_value = $3,
            offer_amount = $4,
            negotiation_status = $5,
            current_offer = $6,
            updated_at = NOW()
        WHERE id = $7
        RETURNING *
      `;
      
      const params = [
        status === 'approved' ? 'negotiating' : status,
        adminFeedback || null,
        adminValuation || null,
        status === 'approved' ? offerAmount : null,
        status === 'approved' ? 'offered' : null,
        status === 'approved' ? offerAmount : null,
        id
      ];
      
      const result = await pool.query(query, params);
      
      if (result.rows.length > 0) {
        return res.json(result.rows[0]);
      }
    } catch (error) {
      console.log('Error updating item_submissions table:', error);
      // Continue to try simple_submissions
    }
    
    // If the first update failed, the submission is in simple_submissions
    // For approved submissions with offers, we need to move it to item_submissions
    try {
      console.log(`Admin responding to submission ID ${id} with status: ${status}`);
      
      // First, get the submission from simple_submissions
      const getQuery = `SELECT * FROM simple_submissions WHERE id = $1`;
      const getResult = await pool.query(getQuery, [id]);
      
      if (getResult.rows.length === 0) {
        return res.status(404).json({ message: 'Item submission not found' });
      }
      
      const submission = getResult.rows[0];
      
      if (status === 'approved' && offerAmount) {
        // First, find the real user ID from the users table
        const userMapQuery = `SELECT id FROM users WHERE id = $1 OR id = $2`;
        const userMapResult = await pool.query(userMapQuery, [submission.user_id, `${submission.user_id}_001`]);
        
        let realUserId = submission.user_id;
        if (userMapResult.rows.length > 0) {
          realUserId = userMapResult.rows[0].id;
        } else {
          console.log(`Warning: Could not find user with ID ${submission.user_id}`);
          // Try to find by email if possible
          const emailQuery = `SELECT id FROM users WHERE email LIKE '%@%' LIMIT 1`;
          const emailResult = await pool.query(emailQuery);
          if (emailResult.rows.length > 0) {
            realUserId = emailResult.rows[0].id;
            console.log(`Using fallback user ID: ${realUserId}`);
          }
        }
        
        // Move to item_submissions table with negotiation data
        const insertQuery = `
          INSERT INTO item_submissions (
            user_id, title, description, type, condition, photos, 
            estimated_value, status, admin_feedback, admin_valuation,
            offer_amount, negotiation_status, current_offer, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
          RETURNING *
        `;
        
        const insertParams = [
          realUserId, // Use the real user ID
          submission.title,
          submission.description,
          submission.type,
          submission.condition,
          submission.photos,
          submission.estimated_value || null, // Handle empty strings
          'negotiating', // Change status to negotiating
          adminFeedback || null,
          adminValuation || null,
          parseFloat(offerAmount) || null, // Ensure it's a number
          'offered',
          parseFloat(offerAmount) || null, // Ensure it's a number
          submission.created_at
        ];
        
        const insertResult = await pool.query(insertQuery, insertParams);
        
        if (insertResult.rows.length > 0) {
          // Delete from simple_submissions
          await pool.query(`DELETE FROM simple_submissions WHERE id = $1`, [id]);
          
          // Get user email info
          const userQuery = `SELECT email, first_name, last_name FROM users WHERE id = $1`;
          const userResult = await pool.query(userQuery, [submission.user_id]);
          
          let responseData = insertResult.rows[0];
          if (userResult.rows.length > 0) {
            responseData.user_email = userResult.rows[0].email;
            responseData.user_full_name = `${userResult.rows[0].first_name || ''} ${userResult.rows[0].last_name || ''}`.trim();
          }
          
          console.log(`Moved submission ${id} to item_submissions with negotiating status`);
          return res.json(responseData);
        }
      } else {
        // Just reject in simple_submissions
        const updateQuery = `
          UPDATE simple_submissions
          SET status = $1, admin_feedback = $2, admin_valuation = $3, updated_at = NOW()
          WHERE id = $4
          RETURNING *
        `;
        
        const updateResult = await pool.query(updateQuery, [status, adminFeedback || null, adminValuation || null, id]);
        
        if (updateResult.rows.length > 0) {
          // Get user email info
          const userQuery = `SELECT email, first_name, last_name FROM users WHERE id = $1`;
          const userResult = await pool.query(userQuery, [submission.user_id]);
          
          let responseData = updateResult.rows[0];
          if (userResult.rows.length > 0) {
            responseData.user_email = userResult.rows[0].email;
            responseData.user_full_name = `${userResult.rows[0].first_name || ''} ${userResult.rows[0].last_name || ''}`.trim();
          }
          
          return res.json(responseData);
        }
      }
      
      return res.status(404).json({ message: 'Item submission not found' });
    } catch (error) {
      console.error('Error processing submission:', error);
      return res.status(500).json({ message: 'Failed to respond to item submission' });
    }
    
  } catch (error) {
    console.error('Error responding to item submission:', error);
    return res.status(500).json({ message: 'Failed to respond to item submission' });
  }
}

// Admin responses to user counter offers  
export async function handleAdminCounterResponse(req: Request, res: Response) {
  console.log('🔄 Admin negotiation response endpoint hit');
  
  try {
    const submissionId = parseInt(req.params.id);
    const { action, finalAmount, counterAmount, adminResponse } = req.body;
    
    if (!submissionId || !action) {
      return res.status(400).json({ message: 'Submission ID and action are required' });
    }

    console.log(`Admin negotiation action: ${action} for submission ${submissionId}`);

    let newStatus = 'negotiating';
    let newNegotiationStatus = '';

    if (action === 'admin_accept_counter') {
      // Admin accepts user's counter offer
      newStatus = 'accepted';
      newNegotiationStatus = 'user_accepted';
      
      await pool.query(`
        UPDATE item_submissions 
        SET status = $1, 
            negotiation_status = $2,
            admin_feedback = $3,
            offer_amount = $4,
            shipping_instructions = $5,
            bank_transfer_instructions = $6,
            updated_at = NOW()
        WHERE id = $7
      `, [
        newStatus,
        newNegotiationStatus,
        adminResponse || `Counter offer of £${parseFloat(finalAmount).toFixed(2)} accepted.`,
        finalAmount,
        'Shipping instructions and label will be provided within 2 business days.',
        'Payment will be processed within 3-5 business days after we receive the item.',
        submissionId
      ]);
      
    } else if (action === 'admin_reject_counter') {
      // Admin rejects user's counter offer - end negotiation
      newStatus = 'rejected';
      newNegotiationStatus = 'admin_rejected';
      
      await pool.query(`
        UPDATE item_submissions 
        SET status = $1, 
            negotiation_status = $2,
            admin_feedback = $3,
            updated_at = NOW()
        WHERE id = $4
      `, [newStatus, newNegotiationStatus, adminResponse || 'We cannot accept your counter offer. Thank you for your interest.', submissionId]);
      
    } else if (action === 'admin_counter') {
      // Admin makes new counter offer
      if (!counterAmount) {
        return res.status(400).json({ message: 'Counter amount required for admin counter offer' });
      }
      newStatus = 'negotiating';
      newNegotiationStatus = 'admin_countered';
      
      await pool.query(`
        UPDATE item_submissions 
        SET status = $1, 
            negotiation_status = $2,
            admin_feedback = $3,
            offer_amount = $4,
            admin_counter_offer = $5,
            updated_at = NOW()
        WHERE id = $6
      `, [newStatus, newNegotiationStatus, adminResponse || `We appreciate your interest. We can offer £${parseFloat(counterAmount).toFixed(2)}.`, counterAmount, counterAmount, submissionId]);
    }

    console.log(`✅ Admin negotiation response processed: ${action} for submission ${submissionId}`);
    
    res.json({ 
      message: `${action.replace('_', ' ')} processed successfully`,
      submissionId,
      newStatus,
      negotiationStatus: newNegotiationStatus
    });

  } catch (error) {
    console.error('❌ Admin negotiation error:', error);
    res.status(500).json({ message: 'Failed to process admin negotiation response' });
  }
}