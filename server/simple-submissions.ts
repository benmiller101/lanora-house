import { Response, Request } from 'express';
import { pool } from './db';
import { sendSubmissionAdminNotification, sendSubmissionConfirmation } from './email-service';

export async function getUserSubmissions(req: Request, res: Response) {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: 'User ID is required'
      });
    }
    
    console.log('Getting submissions for user:', userId);
    
    // Ensure table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS simple_submissions (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL,
        condition TEXT,
        photos JSONB,
        estimated_value TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        admin_feedback TEXT,
        admin_valuation TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Query submissions
    const result = await pool.query(`
      SELECT * FROM simple_submissions
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);
    
    // Transform to match frontend schema
    const submissions = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      type: row.type,
      condition: row.condition || '',
      photos: Array.isArray(row.photos) ? row.photos : 
              (typeof row.photos === 'string' ? JSON.parse(row.photos) : []),
      estimatedValue: row.estimated_value,
      status: row.status || 'pending',
      adminFeedback: row.admin_feedback || null,
      adminValuation: row.admin_valuation || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at || row.created_at
    }));
    
    console.log(`Found ${submissions.length} submissions for user ${userId}`);
    
    // Set CORS headers to allow any origin to access this endpoint
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return res.status(200).json(submissions);
    
  } catch (error) {
    console.error('Error getting user submissions:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error retrieving submissions'
    });
  }
}

// New public endpoint with no authentication
export async function getPublicUserSubmissions(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: 'User ID is required'
      });
    }
    
    console.log('Getting public submissions for user:', userId);
    
    // Query submissions directly, no authentication check
    const result = await pool.query(`
      SELECT * FROM simple_submissions
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);
    
    // Transform to match frontend schema
    const submissions = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      type: row.type,
      condition: row.condition || '',
      photos: typeof row.photos === 'string' ? JSON.parse(row.photos) : (row.photos || []),
      estimatedValue: row.estimated_value,
      status: row.status || 'pending',
      adminFeedback: row.admin_feedback || null,
      adminValuation: row.admin_valuation || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at || row.created_at
    }));
    
    console.log(`Found ${submissions.length} public submissions for user ${userId}`);
    
    // Set CORS headers to allow any origin to access this endpoint
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return res.status(200).json(submissions);
    
  } catch (error) {
    console.error('Error getting public user submissions:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error retrieving submissions'
    });
  }
}

export async function createDirectSubmission(req: Request, res: Response) {
  try {
    console.log('Simple submission received:', req.body);

    // Validate inputs
    const { userId, title, description, type, condition = '', photos = [], estimatedValue = '' } = req.body;

    if (!userId || !title || !description || !type) {
      console.log('Missing required fields:', { userId, title, description, type });
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields for submission'
      });
    }

    console.log('Processing submission with data:', { userId, title, type });

    // Create table if it doesn't exist with updated_at column and admin_feedback/admin_valuation
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS simple_submissions (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          type TEXT NOT NULL,
          condition TEXT,
          photos JSONB DEFAULT '[]'::jsonb,
          estimated_value TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          admin_feedback TEXT,
          admin_valuation TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('Table simple_submissions exists or was created');
    } catch (tableError) {
      console.error('Error creating table:', tableError);
      return res.status(500).json({ 
        success: false,
        message: 'Database error: Failed to ensure table exists'
      });
    }

    // Format photos array to JSON
    let photosJson = '[]';
    try {
      if (Array.isArray(photos)) {
        photosJson = JSON.stringify(photos);
      } else if (typeof photos === 'string') {
        // If photos is already a JSON string, use it as is
        try {
          JSON.parse(photos); // Test if valid JSON
          photosJson = photos;
        } catch (e) {
          // If not valid JSON, wrap it in an array
          photosJson = JSON.stringify([photos]);
        }
      } else {
        photosJson = JSON.stringify([]);
      }
    } catch (e) {
      console.error('Error formatting photos:', e);
      photosJson = '[]';
    }

    console.log('Formatted photos:', photosJson);

    // Insert submission - also log the exact SQL and params for debugging
    const insertSQL = `
      INSERT INTO simple_submissions
      (user_id, title, description, type, condition, photos, estimated_value, status, created_at, updated_at)
      VALUES
      ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, NOW(), NOW())
      RETURNING *
    `;
    
    const insertParams = [
      userId,
      title,
      description,
      type,
      condition || '',
      photosJson,
      estimatedValue || '',
      'pending'
    ];
    
    console.log('Executing SQL:', insertSQL);
    console.log('With params:', insertParams);
    
    try {
      const result = await pool.query(insertSQL, insertParams);

      // Force a new database query to verify the submission was created
      const verifyResult = await pool.query(`
        SELECT * FROM simple_submissions WHERE id = $1
      `, [result.rows[0].id]);
      
      if (verifyResult.rows.length === 0) {
        throw new Error('Submission was not found after creation');
      }
      
      console.log('Submission created and verified successfully:', verifyResult.rows[0]);
      
      // Also refresh the list of all submissions to debug
      const allSubmissions = await pool.query('SELECT * FROM simple_submissions');
      console.log(`There are now ${allSubmissions.rows.length} total submissions in the database`);

      // Send email notifications (non-blocking — a failed email must not affect the response)
      (async () => {
        try {
          // Look up the submitting user's name and email from the DB
          let customerName = 'Customer';
          let customerEmail = '';

          try {
            const userRes = await pool.query(
              `SELECT email, first_name, last_name FROM users WHERE id = $1 LIMIT 1`,
              [userId]
            );
            if (userRes.rows.length > 0) {
              const u = userRes.rows[0];
              customerEmail = u.email || '';
              const full = `${u.first_name || ''} ${u.last_name || ''}`.trim();
              if (full) customerName = full;
            }
          } catch (userErr) {
            console.error('Could not look up user for submission emails:', userErr);
          }

          const emailData = {
            customerName,
            customerEmail,
            title,
            description,
            type,
            condition: condition || '',
            estimatedValue: estimatedValue || undefined,
            photos: Array.isArray(photos) ? photos : [],
            submittedAt: new Date(),
          };

          // Admin notification
          await sendSubmissionAdminNotification(emailData);

          // Customer confirmation (only if we have their email)
          if (customerEmail) {
            await sendSubmissionConfirmation(emailData);
          }
        } catch (emailErr) {
          console.error('Error during submission email notifications:', emailErr);
        }
      })();

      return res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Submission created successfully'
      });
    } catch (insertError) {
      console.error('Error inserting submission:', insertError);
      
      // Try to insert with a simpler query as fallback
      try {
        console.log('Trying fallback insertion method...');
        const fallbackResult = await pool.query(`
          INSERT INTO simple_submissions (user_id, title, description, type) 
          VALUES ($1, $2, $3, $4) 
          RETURNING id
        `, [userId, title, description, type]);
        
        console.log('Fallback insertion succeeded:', fallbackResult.rows[0]);
        
        return res.status(201).json({
          success: true,
          data: fallbackResult.rows[0],
          message: 'Submission created with fallback method'
        });
      } catch (fallbackError) {
        console.error('Fallback insertion also failed:', fallbackError);
        return res.status(500).json({ 
          success: false,
          message: 'Database error: Failed to save submission using both methods'
        });
      }
    }
  } catch (error: any) {
    console.error('Error in simple submission:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error processing submission'
    });
  }
}