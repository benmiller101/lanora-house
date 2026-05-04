import { Response, Request } from 'express';
import { pool } from './db';

// Direct SQL execution for admin users (read-only)
export async function executeSqlQuery(req: Request, res: Response) {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        success: false,
        message: 'SQL query is required'
      });
    }
    
    // Only allow SELECT queries for safety
    if (!query.trim().toLowerCase().startsWith('select')) {
      return res.status(403).json({ 
        success: false,
        message: 'Only SELECT queries are allowed for security reasons'
      });
    }
    
    const result = await pool.query(query);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error executing SQL query:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error executing SQL query'
    });
  }
}

// Create a test submission - for debugging only!
export async function createTestSubmission(req: Request, res: Response) {
  try {
    // Create a test submission with fixed data
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Ensure simple_submissions table exists
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
    
    // Insert test submission with minimal data
    const result = await pool.query(`
      INSERT INTO simple_submissions
      (user_id, title, description, type, condition, estimated_value, status, created_at, updated_at)
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `, [
      userId,
      'Test Submission ' + new Date().toISOString(),
      'This is a test submission created by the admin API',
      'auction',
      'Excellent',
      '1000',
      'pending'
    ]);
    
    return res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Test submission created successfully'
    });
  } catch (error) {
    console.error('Error creating test submission:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error creating test submission'
    });
  }
}

// Direct database query to get all submissions for a user
export async function getDirectUserSubmissions(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: 'User ID is required'
      });
    }
    
    console.log('Getting direct submissions for user:', userId);
    
    // Direct query
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
    
    console.log(`Found ${submissions.length} direct submissions for user ${userId}`);
    
    return res.status(200).json(submissions);
  } catch (error) {
    console.error('Error getting direct user submissions:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error retrieving submissions'
    });
  }
}